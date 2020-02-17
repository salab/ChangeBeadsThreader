import { writeFileSync } from "fs"
import { copySync, removeSync } from "fs-extra"
import * as path from "path"
import simpleGit from "simple-git/promise"
import ICluster, { searchClusterByCommitId } from "../states/ICluster"
import ICommit from "../states/ICommit"
import { ascendingOrder, spawnRebase } from "./helper"

export const exportRepository = async (
    exportPath: string,
    repoPath: string,
    exportRebaseData: IExportRebaseData[],
    commitHash: string
) => {
    const repository = simpleGit(repoPath)

    // diffの取得用の一時ブランチへとチェックアウト
    const branchContainsResult = await repository.branch(["--contains=HEAD"])
    const orgBranchName = branchContainsResult.all[0]
    await repository.checkout(["-b", "cbt_tmp", orgBranchName])

    try {
        writeToOutputRebaseInfo(exportRebaseData)
        spawnOutputRebase(repoPath, false, commitHash)
        removeSync(exportPath)
        copySync(repoPath, exportPath)
    } catch (e) {
        console.error(e)
    } finally {
        // 元のブランチに戻ってtmpブランチを削除
        await repository.checkout([orgBranchName])
        await repository.branch(["-D", "cbt_tmp"])
    }
}

const writeToOutputRebaseInfo = (exportRebaseData: IExportRebaseData[]) => {
    const lines = exportRebaseData.map(it => `${it.commitHash} ${it.command}`)
    const currentDir = __dirname
    const writePath = path.join(currentDir, "resource", "rebase_info.txt")
    writeFileSync(writePath, lines.join("\n"))
}

const spawnOutputRebase = (repoPath: string, isRoot: boolean, commitHash: string) => {
    const rebaseEditorPath = path
        .join(__dirname, "resource", "rebase-editor.jar")
        .replace(/\\/g, "/")
    const env = {
        REBASE_INFO: path.join(__dirname, "resource", "rebase_info.txt"),
        GIT_SEQUENCE_EDITOR: `java -jar ${rebaseEditorPath} EXPORT`,
    }

    return spawnRebase(repoPath, isRoot, commitHash, env)
}

export interface IExportRebaseData {
    commitHash: string
    command: string
}

// export時のrebase用のデータを作成する関数
export const getExportRebaseData = (commits: ICommit, clusters: ICluster): IExportRebaseData[] => {
    const exportRebaseData: IExportRebaseData[] = []
    const appearedCommitIdList: number[] = []
    Object.values(commits.byId).forEach(commitData => {
        if (appearedCommitIdList.includes(commitData.commitId)) return
        const clusterData = searchClusterByCommitId(clusters, commitData.commitId)
        if (clusterData === undefined) return
        // 未出現クラスタ内のコミットを書き込んでいく
        let isFirst = true
        clusterData.commitIdList.sort(ascendingOrder).forEach(commitId => {
            const commitHash = commits.byId[commitId].commitHash
            if (isFirst) {
                exportRebaseData.push({ commitHash, command: "pick" })
                isFirst = false
            } else {
                exportRebaseData.push({ commitHash, command: "fixup" })
            }
            appearedCommitIdList.push(commitId)
        })
    })

    return exportRebaseData
}
