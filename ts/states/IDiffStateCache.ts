import lodash from "lodash"
import IDiffState from "./IDiffState"

export default interface IDiffStateCache {
    clusterCache: IClusterCacheMap
    diffCacheMap: IDiffCacheMap
}

export interface IClusterCacheMap {
    [key: number]: IClusterCacheData
}

export interface IClusterCacheData {
    clusterCacheId: number
    commitIdList: number[]
}

export interface IDiffCacheMap {
    [clusterChacheId: number]: IDiffCacheData
}

export interface IDiffCacheData {
    clusterCacheId: number
    diff: IDiffState
}

export class DiffStateCache implements IDiffStateCache {
    public clusterCache: IClusterCacheMap = {}
    public diffCacheMap: IDiffCacheMap = {}

    public static getClusterCacheId(
        commitIdList: number[],
        clusterCacheMap: IClusterCacheMap
    ): number | undefined {
        const matchedClusterCacheData = lodash.find(clusterCacheMap, clusterCacheData => {
            return lodash.isEqual(clusterCacheData.commitIdList.sort(), commitIdList.sort())
        })
        return matchedClusterCacheData !== undefined
            ? matchedClusterCacheData.clusterCacheId
            : undefined
    }
}

export class ClusterCacheData implements IClusterCacheData {
    public clusterCacheId: number
    public commitIdList: number[]
    constructor(clusterCacheId: number, commitIdList: number[]) {
        this.clusterCacheId = clusterCacheId
        this.commitIdList = commitIdList
    }
}

export class DiffCacheData implements IDiffCacheData {
    public clusterCacheId: number
    public diff: IDiffState
    constructor(clusterCacheId: number, diff: IDiffState) {
        this.clusterCacheId = clusterCacheId
        this.diff = diff
    }
}
