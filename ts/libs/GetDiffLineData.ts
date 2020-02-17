import { spawnSync } from "child_process"
import ExpandSet from "../libs/ExpandSet"
import ICommit, { getHashListFromIDList } from "../states/ICommit"
import IDiffState, { IHunkData, IPatchData } from "../states/IDiffState"
import { ascendingOrder } from "./helper"

enum BlameType {
    Normal,
    Reverse,
}

/**
 * @param diffState
 * @param repoPath
 * @param selectedCommitList
 * @param commits
 * @param isRoot
 * @param oldCommitHash
 * @param {Map<string, string>} [rebaseCommitMap] key: rebase後のCommit Hash値 value: 本来のCommit Hash値
 */
export const getDiffLineData = (
    diffState: IDiffState,
    repoPath: string,
    selectedCommitList: number[],
    commits: ICommit,
    isRoot: boolean,
    oldCommitHash: string,
    rebaseCommitMap: Map<string, string>
): IDiffState => {
    const blameCommitMap = getHashListFromIDList(selectedCommitList, commits)
    // git blame --reverseでは削除行がいつまで残ってたかを取得する
    // よって、実際に削除したコミットの1つ前のハッシュ値を取得するためcommitMapの中身を一つ前にずらす必要がある
    const blameReverseCommitMap = new Map(blameCommitMap)
    const rebaseReverseCommitMap = new Map(rebaseCommitMap)
    const lastCommitId = Math.max(...selectedCommitList)
    const lastCommitHash = commits.byId[lastCommitId].commitHash
    const oldCommitId = Math.min(...selectedCommitList) - 1
    blameReverseCommitMap.delete(lastCommitHash)
    blameReverseCommitMap.set(oldCommitHash, oldCommitId)
    rebaseReverseCommitMap.forEach((key, value) => {
        if (value.startsWith(lastCommitHash)) {
            rebaseReverseCommitMap.delete(key)
        }
    })
    rebaseReverseCommitMap.set(oldCommitHash, oldCommitHash)

    const sortedCommitIdList: number[] = [...selectedCommitList, oldCommitId].sort(ascendingOrder)

    diffState.patches.forEach(patch => {
        patch.hunks.forEach(hunk => {
            processBlame(repoPath, patch, hunk, blameCommitMap, rebaseCommitMap)
            if (!isRoot) {
                processBlameReverse(
                    repoPath,
                    patch,
                    hunk,
                    blameReverseCommitMap,
                    oldCommitHash,
                    sortedCommitIdList,
                    rebaseReverseCommitMap
                )
            }
        })
    })
    return diffState
}

const processBlame = (
    repoPath: string,
    patch: IPatchData,
    hunk: IHunkData,
    commitIDMap: Map<string, number>,
    rebaseCommitMap: Map<string, string>
) => {
    const endLine = hunk.newStart + hunk.newLines - 1
    const blame = spawnGitBlame(repoPath, patch.newFile, hunk.newStart, endLine)
    const lineNumToCommitHash = getLineNumToCommitHash(blame, rebaseCommitMap)
    const lineNumToCommitId = new Map<number, number>()
    lineNumToCommitHash.forEach((value, key) => {
        const commitId = commitIDMap.get(value)
        if (commitId !== undefined) {
            lineNumToCommitId.set(key, commitId)
        }
    })
    setCommitIdToHunk(lineNumToCommitId, hunk, BlameType.Normal)
    // console.log(lineNumToCommitHash)
}

const processBlameReverse = (
    repoPath: string,
    patch: IPatchData,
    hunk: IHunkData,
    commitIDMap: Map<string, number>,
    oldCommitHash: string,
    sortedCommitIdList: number[],
    rebaseCommitMap: Map<string, string>
) => {
    const endLine = hunk.oldStart + hunk.oldLines - 1
    const blame = spawnGitBlameReverse(
        repoPath,
        patch.oldFile,
        hunk.oldStart,
        endLine,
        oldCommitHash
    )
    const lineNumToCommitHash = getLineNumToCommitHash(blame, rebaseCommitMap)
    const lineNumToCommitId = new Map<number, number>()
    lineNumToCommitHash.forEach((value, key) => {
        const commitId = commitIDMap.get(value)
        Object.values(commitIDMap)
        if (commitId !== undefined) {
            const index = sortedCommitIdList.indexOf(commitId)
            if (index !== sortedCommitIdList.length - 1) {
                lineNumToCommitId.set(key, sortedCommitIdList[index + 1])
            }
        }
    })
    setCommitIdToHunk(lineNumToCommitId, hunk, BlameType.Reverse)
    // console.log(lineNumToCommitHash)
}

const getLineNumToCommitHash = (
    blame: string,
    rebaseCommitMap: Map<string, string>
): Map<number, string> => {
    const splitBlame = blame.split("\n")
    const lineNumToCommitHash = new Map<number, string>()
    splitBlame.forEach(blameLine => {
        // \nでsplitすると最後に空行が発生するのでreturn
        if (blameLine.length === 0) return

        // console.log(blameLine)
        const commitIDMatch = blameLine.match(/\w+/)
        if (commitIDMatch === null) {
            console.error(`can't get commitID from ${blameLine}`)
            return
        }

        const commitID = commitIDMatch[0]
        // console.log(commitID)
        const rebasedHash = Array.from(rebaseCommitMap.keys()).find(hash =>
            hash.startsWith(commitID)
        )
        if (rebasedHash === undefined) {
            // console.log(`can't get rebasedHash`)
            return
        }

        const matchedHash = rebaseCommitMap.get(rebasedHash)
        if (matchedHash === undefined) {
            console.error(`can't get matchedHash`)
            return
        }

        const match = blameLine.match(/\(.+\s(\d+)\)/)
        if (match === null) {
            console.error(`can't get match`)
            return
        }

        const lineNo = Number(match[1])
        lineNumToCommitHash.set(lineNo, matchedHash)
    })
    return lineNumToCommitHash
}

const setCommitIdToHunk = (
    lineNumToCommitId: Map<number, number>,
    hunk: IHunkData,
    blameType: BlameType
) => {
    lineNumToCommitId.forEach((value, key) => {
        const blamedLine = hunk.lines.find(line => {
            switch (blameType) {
                case BlameType.Normal:
                    return line.newLineno === key
                case BlameType.Reverse:
                    return line.oldLineno === key
                default:
                    break
            }
        })
        if (blamedLine !== undefined) {
            blamedLine.commitId = value
        }
    })
}

const spawnGitBlame = (
    repoPath: string,
    filePath: string,
    startLine: number,
    endLine: number
): string => {
    const runBlame = spawnSync(
        "git",
        ["-C", repoPath, "blame", "-L", `${startLine},${endLine}`, filePath],
        {}
    )
    if (runBlame.status !== 0) {
        const errMessage = new TextDecoder().decode(Uint8Array.from(runBlame.stderr))
        Error(errMessage)
    }
    return new TextDecoder().decode(Uint8Array.from(runBlame.stdout))
}

const spawnGitBlameReverse = (
    repoPath: string,
    filePath: string,
    startLine: number,
    endLine: number,
    oldCommitHash: string
): string => {
    const runBlameReverse = spawnSync(
        "git",
        [
            "-C",
            repoPath,
            "blame",
            "-L",
            `${startLine},${endLine}`,
            filePath,
            "--reverse",
            oldCommitHash,
        ],
        {}
    )
    if (runBlameReverse.status !== 0) {
        const errMessage = new TextDecoder().decode(Uint8Array.from(runBlameReverse.stderr))
        Error(errMessage)
    }
    return new TextDecoder().decode(Uint8Array.from(runBlameReverse.stdout))
}
