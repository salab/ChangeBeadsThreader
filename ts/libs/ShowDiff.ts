import { writeFileSync } from "fs"
import * as path from "path"
import { Dispatch } from "redux"
import simpleGit from "simple-git/promise"
import { resetSelectedCommits, updateDiff, updateDiffCache } from "../actions/Actions"
import ICommit from "../states/ICommit"
import IDiffState, { DiffState } from "../states/IDiffState"
import IDiffStateCache, {
    ClusterCacheData,
    DiffCacheData,
    DiffStateCache,
} from "../states/IDiffStateCache"
import { getDiffLineData } from "./GetDiffLineData"
import { ascendingOrder, spawnRebase } from "./helper"
import { parseRawDiff } from "./ParseRawDiff"

export const showDiff = async (
    selectedCommitList: number[],
    commits: ICommit,
    diffCache: IDiffStateCache,
    orgRepoPath: string,
    // tslint:disable-next-line:no-any
    dispatch: Dispatch<any>
): Promise<boolean> => {
    if (selectedCommitList.length <= 0) {
        dispatch(updateDiff(new DiffState()))
        return true
    }
    const clusterCacheId = DiffStateCache.getClusterCacheId(
        selectedCommitList,
        diffCache.clusterCache
    )
    if (clusterCacheId === undefined) {
        // キャッシュが存在しない場合
        const diffData = await getDiff(selectedCommitList, commits, orgRepoPath)
        // rebaseの失敗などでDiffの取得に失敗した場合は選択状態をリセットする
        if (diffData === undefined) {
            dispatch(resetSelectedCommits())
            return false
        }
        dispatch(updateDiff(diffData))
        const newDiffCache = createNewDiffCache(diffCache, diffData, selectedCommitList)
        dispatch(updateDiffCache(newDiffCache))
    } else {
        // キャッシュが存在する場合
        const diffCacheData = diffCache.diffCacheMap[clusterCacheId]
        dispatch(updateDiff(diffCacheData.diff))
    }
    return true
}

const createNewDiffCache = (
    diffCache: IDiffStateCache,
    diffState: IDiffState,
    commitIdList: number[]
): IDiffStateCache => {
    const sortedDiffCacheId = Object.keys(diffCache.clusterCache)
        .map(Number)
        .sort(ascendingOrder)
    let newId = 0
    for (const existingId of sortedDiffCacheId) {
        if (newId !== existingId) break
        newId++
    }

    diffCache.clusterCache[newId] = new ClusterCacheData(newId, commitIdList)
    diffCache.diffCacheMap[newId] = new DiffCacheData(newId, diffState)
    return diffCache
}

export const getDiff = async (
    selectedCommitList: number[],
    commits: ICommit,
    orgRepoPath: string
): Promise<IDiffState | undefined> => {
    const repository = simpleGit(orgRepoPath)

    // diffの取得用の一時ブランチへとチェックアウト
    const branchContainsResult = await repository.branch(["--contains=HEAD"])
    const orgBranchName = branchContainsResult.all[0]
    await repository.checkout(["-b", "cbt_tmp", orgBranchName])

    let diffDataWithCommit: IDiffState | undefined

    try {
        // diffの取得に必要な情報を収集
        const { isRoot, oldHash, commitHashList } = getHashInfo(selectedCommitList, commits)

        // rebaseを実行
        writeToDiffRebaseInfo(commitHashList)
        const rebaseStatus = spawnDiffRebase(orgRepoPath, isRoot, oldHash)
        if (rebaseStatus !== 0) return undefined
        // rebase後のコミットIDとの対応関係を取得
        const rebaseCommitMap = await getRebaseCommitMap(repository, commitHashList, oldHash)

        // git diffを実行し結果を解析
        const opt = [oldHash]
        const rawDiff: string = await repository.diff(opt)
        const diffData = parseRawDiff(rawDiff)

        // 各行に対応するコミットの情報を取得
        diffDataWithCommit = getDiffLineData(
            diffData,
            orgRepoPath,
            selectedCommitList,
            commits,
            isRoot,
            oldHash,
            rebaseCommitMap
        )
    } catch (e) {
        console.error(e)
    } finally {
        // 元のブランチに戻ってtmpブランチを削除
        await repository.checkout([orgBranchName])
        await repository.branch(["-D", "cbt_tmp"])
    }

    return diffDataWithCommit
}

const writeToDiffRebaseInfo = (commitHashList: string[]) => {
    const currentDir = __dirname
    const writePath = path.join(currentDir, "resource", "rebase_info.txt")
    writeFileSync(writePath, commitHashList.join("\n"))
}

// diffの取得に必要な情報を収集
const getHashInfo = (selectedCommitList: number[], commits: ICommit) => {
    selectedCommitList.sort(ascendingOrder)
    const firstCommitID = Math.min(...selectedCommitList)
    // const lastCommitID = Math.max(...selectedCommitList)
    // const lastCommitHash = commits.byId[lastCommitID].commitHash
    const isRoot = firstCommitID === 0
    const oldHash = isRoot
        ? "4b825dc642cb6eb9a060e54bf8d69288fbee4904" // empty treeを示すcommit hash値、ブランチのRootを含めたDiffを表示するため使用
        : commits.byId[firstCommitID - 1].commitHash
    const commitHashList = selectedCommitList.map(commitID => {
        return commits.byId[commitID].commitHash
    })
    return { isRoot, oldHash, commitHashList }
}

/**
 * @param {simpleGit.SimpleGit} [repository] rebase対象として生成された一時リポジトリ
 * @param {string[]} [commitHashList] rebaseで残す対象としたコミットのハッシュ値リスト
 * @param {string} [oldHash] commitHashListにおける一番古いコミットの更に一つ前のコミットハッシュ値
 * @return {Promise<Map<string, string>>} key: rebase後のCommit Hash値 value: 本来のCommit Hash値
 */
const getRebaseCommitMap = async (
    repository: simpleGit.SimpleGit,
    commitHashList: string[],
    oldHash: string
): Promise<Map<string, string>> => {
    const rebaseCommitMap = new Map<string, string>()
    const logResult = await repository.log([`${oldHash}..HEAD`])
    const rebasedHashList = logResult.all.map(it => it.hash).reverse()
    const iterator = commitHashList[Symbol.iterator]()
    let next: IteratorResult<string>
    rebasedHashList.forEach(rebasedHash => {
        next = iterator.next()
        rebaseCommitMap.set(rebasedHash, next.value)
    })
    return rebaseCommitMap
}

const spawnDiffRebase = (repoPath: string, isRoot: boolean, commitHash: string): number => {
    const rebaseEditorPath = path
        .join(__dirname, "resource", "rebase-editor.jar")
        .replace(/\\/g, "/")
    const env = {
        REBASE_INFO: path.join(__dirname, "resource", "rebase_info.txt"),
        GIT_SEQUENCE_EDITOR: `java -jar ${rebaseEditorPath} DIFF`,
    }

    return spawnRebase(repoPath, isRoot, commitHash, env)
}
