import IClass from "./states/IClass"
import ICluster from "./states/ICluster"
import ICommit from "./states/ICommit"
import IDiffState from "./states/IDiffState"
import IDiffStateCache from "./states/IDiffStateCache"
import IMethod from "./states/IMethod"
import IRepository from "./states/IRepository"
import ISelectionState from "./states/ISelectionState"
import ISettings from "./states/ISettings"
import IStateForExp from "./states/IStateForExp"
import IViewState from "./states/IViewState"

export default interface IState {
    commits: ICommit
    classData: IClass
    methodData: IMethod
    clusters: ICluster
    settings: ISettings
    repositoryData: IRepository
    selectionState: ISelectionState
    diffState: IDiffState
    stateForExp: IStateForExp
    diffStateCache: IDiffStateCache
    viewState: IViewState
}
