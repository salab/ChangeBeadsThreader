import { spawnSync } from "child_process"
import { diff } from "deep-object-diff"
import palette from "google-palette"
import { configure, getLogger, Logger } from "log4js"
import moment from "moment"
import * as path from "path"
import ICluster, { searchClusterByCommitId } from "../states/ICluster"
import { IFileEditContentMap, IPatch } from "../states/ICommit"

// 仮のリポジトリパスとしてインポートしたJSONファイルと同じディレクトリ内の同名のディレクトリを対象のディレクトとする
export const getRepositoryPathFromImportFilePath = (importFilePath: string): string => {
    const fileName = path.basename(importFilePath, path.extname(importFilePath))
    return path.join(path.dirname(importFilePath), fileName)
}

export const remFromMinute = (minute: number, remPerMinute: number): number => {
    return minute * remPerMinute
}

export const minuteFromRem = (rem: number, remPerMinute: number): number => {
    return rem / remPerMinute
}

export const getPositionFromDateTime = (
    inputTime: moment.Moment,
    startTime: moment.Moment,
    remPerMinute: number
): number => {
    const duration = inputTime.diff(startTime.second(0).millisecond(0), "minutes", true)
    return remFromMinute(duration, remPerMinute)
}

// 引数のidに対して一意なカラーコードを生成する関数
/*export const generateColor = (id: number): string => {
    // Idが0の場合は対数計算の都合上すべての値を0とする
    const exp = id === 0 ? 0 : Math.floor(Math.log(id) / Math.log(2))
    const rem = id === 0 ? 0 : id - 2 ** exp
    const hueRate = id === 0 ? 0 : (1 / 2 ** (exp + 1)) * (rem * 2 + 1)

    console.log(colorPalette(id))

    // 色はHue（色相）を変化させる。
    // Saturation（彩度）とLightness（輝度）は固定。
    // Hueは小数点第3位以下を切り捨てる
    return `hsl(${Math.floor(hueRate * 360 * 100) / 100}, 80%, 60%)`
}*/
export const generateColor = (id: number): string => {
    const colors = palette("mpn65", 65).map((hex: string) => {
        return "#" + hex
    })
    return colors[id % colors.length]
}

/*
引数例：methodInfoStr = private int foo(int hoge)
返り値例：foo
 */
export const getMethodName = (methodInfoStr: string): string => {
    const withoutArgs = methodInfoStr.split(/\([\w\s,]*\)/)[0]
    const splittedMethod = withoutArgs.split(/\s/g)
    return splittedMethod[splittedMethod.length - 1]
}

export const getCommitsFromClusters = (clusters: ICluster, ClusterList: number[]): number[] => {
    const commitList: number[] = []
    ClusterList.forEach(value => {
        commitList.push(...clusters.byId[value].commitIdList)
    })
    return commitList
}

export const createNewClusterList = (oldCluster: ICluster, commitIDList: number[]): ICluster => {
    const newClusters = { ...oldCluster }
    const keys = Object.keys(oldCluster.byId).map(Number)

    commitIDList.forEach(commitID => {
        const oldID = searchClusterByCommitId(oldCluster, commitID)
        if (oldID === undefined) {
            console.error("createNewClusterList: 対応するクラスタが存在しません")
            return oldCluster
        }

        // 対象のコミットを元々所属していたクラスタから削除
        newClusters.byId[oldID.clusterId].commitIdList = newClusters.byId[
            oldID.clusterId
        ].commitIdList.filter(id => id !== commitID)
    })

    keys.sort(ascendingOrder)
    let newID = 0
    for (const value of keys) {
        if (newID === value) {
            newID++
        } else {
            break
        }
    }

    newClusters.byId[newID] = {
        clusterId: newID,
        commitIdList: commitIDList,
        color: generateColor(newID),
    }
    return newClusters
}

export const ascendingOrder = (a: number, b: number) => {
    if (a < b) return -1
    if (a > b) return 1
    return 0
}

export const settingLog4js = (timestamp: number): Logger => {
    const logPath = path.join("tmp", String(timestamp))
    configure({
        appenders: {
            system: { type: "file", filename: `${logPath}.log` },
        },
        categories: {
            default: { appenders: ["system"], level: "info" },
        },
    })
    return getLogger("system")
}

export const getObjectDiff = (beforeObj: object, afterObj: object): string => {
    // tslint:disable-next-line:no-null-keyword
    return JSON.stringify(diff(beforeObj, afterObj), (k, v) => (v === undefined ? null : v))
}

export const createLog = (
    operationName: string,
    objectDiff: string | undefined,
    ...sentences: string[]
): string => {
    const outputObjectDiff = objectDiff === undefined ? "" : ` [${objectDiff}]`
    return `[${operationName}] ${sentences.join(" ")}${outputObjectDiff}`
}

export const mergePatches = (fileEditContentMap: IFileEditContentMap): IPatch[] => {
    const patchList: IPatch[] = []
    Object.values(fileEditContentMap).forEach(fileEditContent => {
        patchList.push(...fileEditContent.patches)
    })
    return patchList
}

export const spawnRebase = (
    repoPath: string,
    isRoot: boolean,
    commitHash: string,
    env: {}
): number => {
    const rebaseHash = isRoot ? "--root" : commitHash
    const runRebaseI = spawnSync("git", ["-C", repoPath, "rebase", "-i", rebaseHash], {
        env,
    })
    if (runRebaseI.status === null) {
        console.error("runRebaseI.status is null")
        return -1
    }
    if (runRebaseI.status !== 0) {
        let message
        switch (runRebaseI.status) {
            case 1: {
                message = "コミットの競合が発生しました"
                spawnSync("git", ["-C", repoPath, "rebase", "--abort"])
                break
            }
            default: {
                message = `rebase時にエラーが発生しました（exit code: ${
                    runRebaseI.status
                })\n${runRebaseI.output[2].toString()}`
                break
            }
        }
        console.error(runRebaseI.output[2].toString())
        alert(message)
        return runRebaseI.status
    }
    return runRebaseI.status
}
