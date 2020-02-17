import { cloneDeep } from "lodash"
import { reducerWithInitialState } from "typescript-fsa-reducers"
import * as actions from "../actions/Actions"
import IState from "../IState"
import ExpandSet from "../libs/ExpandSet"
import { createLog, createNewClusterList, getObjectDiff, settingLog4js } from "../libs/helper"
import IClass, { Class } from "../states/IClass"
import ICluster, { Cluster, mergeCluster } from "../states/ICluster"
import ICommit, { Commit } from "../states/ICommit"
import IDiffState, { DiffState } from "../states/IDiffState"
import IDiffStateCache, { DiffStateCache } from "../states/IDiffStateCache"
import IMethod, { Method } from "../states/IMethod"
import IRepository, { Repository } from "../states/IRepository"
import { SelectionState } from "../states/ISelectionState"
import { Settings } from "../states/ISettings"
import { StateForExp } from "../states/IStateForExp"
import { ViewState } from "../states/IViewState"

export const initialReduceCommitState: IState = {
    commits: new Commit(),
    classData: new Class(),
    methodData: new Method(),
    clusters: new Cluster(),
    settings: new Settings(),
    repositoryData: new Repository(),
    selectionState: new SelectionState(),
    diffState: new DiffState(),
    stateForExp: new StateForExp(),
    diffStateCache: new DiffStateCache(),
    viewState: new ViewState(),
}

export interface IImportRepositoryArgs {
    classData: IClass
    methodData: IMethod
    commits: ICommit
    repositoryData: IRepository
    clusters: ICluster
}

export const reducer = reducerWithInitialState(initialReduceCommitState)
    .case(actions.importRepository, (state: IState, args: IImportRepositoryArgs) => {
        if (state.settings.outputLogFile) {
            const path =
                args.repositoryData.repositoryPath === undefined
                    ? ""
                    : args.repositoryData.repositoryPath
            const clusterList = Object.values(args.clusters.byId).map(it => {
                return it.commitIdList
            })
            settingLog4js(state.settings.timestamp).info(
                createLog("importRepository", undefined, path)
            )
            settingLog4js(state.settings.timestamp).info(
                createLog("initialClusters", undefined, JSON.stringify(clusterList))
            )
        }
        return {
            ...state,
            ...args,
            selectionState: new SelectionState(),
            diffState: new DiffState(),
        }
    })
    .case(actions.changeRemPerMinute, (state: IState, newValue: number) => {
        return {
            ...state,
            viewState: { ...state.viewState, remPerMinute: newValue },
        }
    })
    .case(actions.changeTimeAxisWidth, (state: IState, newValue: number) => {
        return {
            ...state,
            viewState: { ...state.viewState, timeAxisWidth: newValue },
        }
    })
    .case(actions.changeDiffViewHeight, (state: IState, newValue: number) => {
        return {
            ...state,
            viewState: { ...state.viewState, diffViewHeight: newValue },
        }
    })
    .case(actions.updateDiff, (state: IState, newDiffState: IDiffState) => {
        return { ...state, diffState: newDiffState }
    })
    .case(actions.updateSelectedClusterList, (state: IState, newSelectedClusterList: number[]) => {
        if (state.settings.outputLogFile) {
            settingLog4js(state.settings.timestamp).info(
                createLog(
                    "updateSelectedClusterList",
                    undefined,
                    `[${newSelectedClusterList.join(",")}]`
                )
            )
        }
        return {
            ...state,
            selectionState: {
                ...state.selectionState,
                selectedClusterList: newSelectedClusterList,
            },
        }
    })
    .case(actions.joinCluster, (state: IState, clusterIDList: number[]) => {
        const beforeStateForLog = state.settings.outputLogFile
            ? cloneDeep(state.clusters)
            : undefined
        const newClusters = mergeCluster(state.clusters, clusterIDList)
        if (state.settings.outputLogFile && beforeStateForLog !== undefined) {
            const clusterList = Object.values(newClusters.byId).map(it => {
                return it.commitIdList
            })
            const objectDiff = getObjectDiff(beforeStateForLog, newClusters)
            settingLog4js(state.settings.timestamp).info(
                createLog("joinCluster", objectDiff, JSON.stringify(clusterList))
            )
        }
        return { ...state, clusters: { ...newClusters } }
    })
    .case(actions.resetSelectedCommits, (state: IState) => {
        if (state.settings.outputLogFile) {
            settingLog4js(state.settings.timestamp).info(
                createLog("resetSelectedCommits", undefined)
            )
        }
        return {
            ...state,
            selectionState: new SelectionState(),
            diffState: new DiffState(),
        }
    })
    .case(actions.removeCommitFromCluster, (state: IState, commitIDList: number[]) => {
        const beforeStateForLog = state.settings.outputLogFile
            ? cloneDeep(state.clusters)
            : undefined
        const newClusters = createNewClusterList(state.clusters, commitIDList)
        if (state.settings.outputLogFile && beforeStateForLog !== undefined) {
            const clusterList = Object.values(newClusters.byId).map(it => {
                return it.commitIdList
            })
            const objectDiff = getObjectDiff(beforeStateForLog, newClusters)
            settingLog4js(state.settings.timestamp).info(
                createLog("removeCommitFromCluster", objectDiff, JSON.stringify(clusterList))
            )
        }
        return { ...state, clusters: newClusters }
    })
    .case(
        actions.expUpdateSelectedCluster,
        (state: IState, newSelectedCluster: ExpandSet<number>) => {
            return { ...state, stateForExp: { expSelectedClusters: newSelectedCluster } }
        }
    )
    .case(actions.switchLoadingProgress, (state: IState, newIsLoading: boolean) => {
        return { ...state, viewState: { ...state.viewState, isLoading: newIsLoading } }
    })
    .case(actions.updateDiffCache, (state: IState, newDiffStateCache: IDiffStateCache) => {
        return { ...state, diffStateCache: newDiffStateCache }
    })
    .build()
