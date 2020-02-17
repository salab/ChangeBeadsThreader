export default interface ICluster {
    byId: {
        [key: number]: IClusterData
    }
    idSerial: number
}

export interface IClusterData {
    clusterId: number
    commitIdList: number[]
    color: string
}

export class Cluster implements ICluster {
    public byId: {
        [key: number]: IClusterData
    } = {}
    public idSerial = 0
}

export const searchClusterByCommitId = (
    clusters: ICluster,
    commitId: number
): IClusterData | undefined => {
    return Object.values(clusters.byId).find(cluster => {
        return cluster.commitIdList.indexOf(commitId) >= 0
    })
}

export const mergeCluster = (cluster: ICluster, mergeClusterIDs: number[]): ICluster => {
    if (mergeClusterIDs.length > 1) {
        const minID = Math.min(...mergeClusterIDs)
        const mergedCluster = cluster.byId[minID]
        mergeClusterIDs.forEach((value, index, array) => {
            if (value !== minID) {
                const deletedCluster = cluster.byId[value]
                mergedCluster.commitIdList.push(...deletedCluster.commitIdList)
                delete cluster.byId[value]
            }
        })
    }
    return cluster
}
