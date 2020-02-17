import lodash from "lodash"
import IClass from "../states/IClass"
import ICluster, { Cluster, mergeCluster } from "../states/ICluster"
import ICommit, { ICommitData } from "../states/ICommit"
import IMethod from "../states/IMethod"
import { ISettingForUntangling } from "../states/ISettings"
import { generateColor } from "./helper"

interface IDistanceMap {
    // Object.valuesとの型の解決エラーを防ぐためfirstIdの型をstringにしている
    // 参考：Object.values<T>(o: { [s: string]: T } |  ArrayLike<T>): T[];
    // ただし、numberの場合も内部処理ではtoStringでstringにしているため動作としてはstringとnumberに差異はない
    [firstCommitId: string]: {
        [secondCommitId: number]: number
    }
}

const initialClusterer = (
    classData: IClass,
    methodData: IMethod,
    commits: ICommit,
    setting: ISettingForUntangling
): ICluster => {
    let cluster: ICluster = new Cluster()
    for (const id of Object.keys(commits.byId)) {
        cluster.byId[cluster.idSerial] = {
            clusterId: cluster.idSerial,
            commitIdList: [Number(id)],
            color: "#FFFFFF",
        }
        cluster.idSerial++
    }
    const distanceMap = generateCommitDistanceMap(commits, setting)
    cluster = mergeClusterWithMap(cluster, distanceMap, setting)

    cluster = reOrderClusters(cluster)
    // cluster = reDistributeColor(cluster)

    return cluster
}

const reOrderClusters = (clusters: ICluster): ICluster => {
    const clusterDataList = lodash.sortBy(clusters.byId, clusterData => {
        return clusterData.commitIdList[0]
    })
    const newCluster: ICluster = new Cluster()

    clusterDataList.forEach(clusterData => {
        clusterData.clusterId = newCluster.idSerial
        clusterData.color = generateColor(newCluster.idSerial)
        newCluster.byId[newCluster.idSerial] = clusterData
        newCluster.idSerial++
    })

    return newCluster
}

const reDistributeColor = (cluster: ICluster): ICluster => {
    for (const id of Object.keys(cluster.byId)) {
        cluster.byId[Number(id)].color = generateColor(Number(id))
    }
    return cluster
}

const generateCommitDistanceMap = (
    commits: ICommit,
    setting: ISettingForUntangling
): IDistanceMap => {
    const distanceMap: IDistanceMap = {}
    const commitIdList = Object.keys(commits.byId).map(Number)
    const lastCommitId = Math.max(...commitIdList)
    for (const firstCommitId of commitIdList) {
        for (
            let secondCommitId = firstCommitId + 1;
            secondCommitId <= lastCommitId;
            secondCommitId++
        ) {
            if (!distanceMap.hasOwnProperty(firstCommitId)) {
                distanceMap[firstCommitId] = {}
            }
            distanceMap[firstCommitId][secondCommitId] = calculateCommitDistance(
                firstCommitId,
                secondCommitId,
                commits,
                setting
            )
        }
    }
    return distanceMap
}

const calculateCommitDistance = (
    firstCommitId: number,
    secondCommitId: number,
    commits: ICommit,
    setting: ISettingForUntangling
): number => {
    let ret = 0
    const firstCommit = commits.byId[firstCommitId]
    const secondCommit = commits.byId[secondCommitId]
    ret += calculateTimeDistance(firstCommit, secondCommit) * setting.timeDistance
    ret +=
        calculateNumberOfCommitDistance(firstCommit, secondCommit) * setting.numberOfCommitDistance
    ret += calculateClassDistance(firstCommit, secondCommit) * setting.classDistance
    ret += calculateMethodDistance(firstCommit, secondCommit) * setting.methodDistance
    return ret
}

const calculateTimeDistance = (firstCommit: ICommitData, secondCommit: ICommitData): number => {
    return Math.abs(firstCommit.editTime.diff(secondCommit.editTime, "minutes", true))
}

const calculateNumberOfCommitDistance = (
    firstCommit: ICommitData,
    secondCommit: ICommitData
): number => {
    return Math.abs(firstCommit.commitId - secondCommit.commitId)
}

// 返り値は0 or 1
const calculateClassDistance = (firstCommit: ICommitData, secondCommit: ICommitData): number => {
    const firstEditFileList = Object.keys(firstCommit.editFile)
    const secondEditFileList = Object.keys(secondCommit.editFile)
    const sameEditFileList = firstEditFileList.filter(filePath =>
        secondEditFileList.includes(filePath)
    )

    const existSameClass = sameEditFileList.some(filePath => {
        const firstClassIdList = Object.keys(firstCommit.editFile[filePath].editClassId)
        const secondClassIdList = Object.keys(secondCommit.editFile[filePath].editClassId)
        return firstClassIdList.some(id => secondClassIdList.includes(id))
    })

    return existSameClass ? 0 : 1
}

// 返り値は0 or 1
const calculateMethodDistance = (firstCommit: ICommitData, secondCommit: ICommitData): number => {
    const firstEditFileList = Object.keys(firstCommit.editFile)
    const secondEditFileList = Object.keys(secondCommit.editFile)
    const sameEditFileList = firstEditFileList.filter(filePath =>
        secondEditFileList.includes(filePath)
    )

    const existSameMethod = sameEditFileList.some(filePath => {
        const firstClassIdList = Object.keys(firstCommit.editFile[filePath].editClassId)
        const secondClassIdList = Object.keys(secondCommit.editFile[filePath].editClassId)
        const sameClassIdList = firstClassIdList
            .filter(id => secondClassIdList.includes(id))
            .map(Number)
        return sameClassIdList.some(classId => {
            const firstMethodIdList =
                firstCommit.editFile[filePath].editClassId[classId].editMethodId
            const secondMethodIdList =
                secondCommit.editFile[filePath].editClassId[classId].editMethodId
            return firstMethodIdList.some(id => secondMethodIdList.includes(id))
        })
    })

    return existSameMethod ? 0 : 1
}

const mergeClusterWithMap = (
    cluster: ICluster,
    distanceMap: IDistanceMap,
    setting: ISettingForUntangling
): ICluster => {
    while (true) {
        const nextMergeClusterData = getMostNearClusterPair(cluster, distanceMap)
        if (nextMergeClusterData.distance > setting.clusterThreshold) break
        cluster = mergeCluster(cluster, [
            nextMergeClusterData.firstClusterId,
            nextMergeClusterData.secondClusterId,
        ])
    }

    return cluster
}

/*
Martin Diasの手法に倣って距離の間に最大のGapが存在する場所を閾値とする関数
Diasの手法と異なりbinaryTreeを作らないため、0.25以上の最大のGapという本来の手法が再現できない
これを利用するかは改めて考えることとする。
*/
const getThreshold = (distanceMap: IDistanceMap): number => {
    const distanceArray: number[] = []
    for (const i of Object.values<{ [secondId: number]: number }>(distanceMap)) {
        const distanceObjectList: number[] = Object.values(i)
        distanceArray.push(...distanceObjectList)
    }
    distanceArray.sort((a, b) => b - a)

    let maxDistance = 0
    let maxDistanceIterator = 0
    for (let i = 0; i < distanceArray.length - 1; i++) {
        if (distanceArray[i] - distanceArray[i + 1] > maxDistance) {
            maxDistance = distanceArray[i] - distanceArray[i + 1]
            maxDistanceIterator = i
        }
    }
    return distanceArray[maxDistanceIterator] + distanceArray[maxDistanceIterator + 1] / 2
}

const getMostNearClusterPair = (
    cluster: ICluster,
    distanceMap: IDistanceMap
): { firstClusterId: number; secondClusterId: number; distance: number } => {
    let mostNearClusterPair: {
        firstClusterId: number
        secondClusterId: number
        distance: number
    } = {
        firstClusterId: 0,
        secondClusterId: 0,
        distance: Infinity,
    }
    for (const firstClusterIdString of Object.keys(cluster.byId)) {
        const firstClusterId = Number(firstClusterIdString)
        // firstClusterIdよりも後ろのIDのリストを取得
        const secondClusterIdList = Object.keys(cluster.byId).filter(element => {
            return Number(element) > firstClusterId
        })
        for (const secondClusterIdString of secondClusterIdList) {
            const secondClusterId = Number(secondClusterIdString)
            const distance = getClusterDistance(
                cluster.byId[firstClusterId].commitIdList,
                cluster.byId[secondClusterId].commitIdList,
                distanceMap
            )
            if (distance < mostNearClusterPair.distance) {
                mostNearClusterPair = {
                    firstClusterId,
                    secondClusterId,
                    distance,
                }
            }
        }
    }
    return mostNearClusterPair
}

const getClusterDistance = (
    firstCommitIdList: number[],
    secondCommitIdList: number[],
    distanceMap: IDistanceMap
): number => {
    let maxDistance = 0
    for (const firstCommitId of firstCommitIdList) {
        for (const secondCommitId of secondCommitIdList) {
            const smallerId = Math.min(firstCommitId, secondCommitId)
            const biggerId = Math.max(firstCommitId, secondCommitId)
            maxDistance = Math.max(distanceMap[smallerId][biggerId], maxDistance)
        }
    }
    return maxDistance
}

export default initialClusterer
