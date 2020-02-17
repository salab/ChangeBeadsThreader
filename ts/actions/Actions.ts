import { Action, actionCreatorFactory } from "typescript-fsa"
import ExpandSet from "../libs/ExpandSet"
import { IImportRepositoryArgs } from "../reducers/Reducers"
import IDiffState from "../states/IDiffState"
import IDiffStateCache from "../states/IDiffStateCache"
import * as types from "./ActionTypes"

// tslint:disable-next-line:no-any
export type AsyncDispatchAction<T> = Action<T> & { asyncDispatch: (action: Action<T>) => void }

const actionCreator = actionCreatorFactory()

export const importRepository = actionCreator<IImportRepositoryArgs>(types.IMPORT_REPOSITORY)
export const changeRemPerMinute = actionCreator<number>(types.CHANGE_REM_PER_MINUTE)
export const changeTimeAxisWidth = actionCreator<number>(types.CHANGE_TIME_AXIS_WIDTH)
export const changeDiffViewHeight = actionCreator<number>(types.CHANGE_DIFF_VIEW_HEIGHT)
export const updateDiff = actionCreator<IDiffState>(types.UPDATE_DIFF)
export const updateSelectedClusterList = actionCreator<number[]>(types.UPDATE_SELECTED_CLUSTER_LIST)
export const joinCluster = actionCreator<number[]>(types.JOIN_CLUSTER)
export const resetSelectedCommits = actionCreator(types.RESET_SELECTED_COMMITS)
export const removeCommitFromCluster = actionCreator<number[]>(types.REMOVE_COMMIT_FROM_CLUSTER)
export const expUpdateSelectedCluster = actionCreator<ExpandSet<number>>(
    types.EXP_UPDATE_SELECTED_CLUSTER
)
export const switchLoadingProgress = actionCreator<boolean>(types.SWITCH_LOADING_PROGRESS)
export const updateDiffCache = actionCreator<IDiffStateCache>(types.UPDATE_CACHE_DIFF)
