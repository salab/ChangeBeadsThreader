import { connect } from "react-redux"
import { Dispatch } from "redux"
import DiffView from "../components/commitDiff/DiffView"
import IState from "../IState"

const mapStateToProps = (state: IState) => ({
    viewState: state.viewState,
    repositoryData: state.repositoryData,
    clusters: state.clusters,
    commits: state.commits,
    selectionState: state.selectionState,
    diffStateCache: state.diffStateCache,
    diffState: state.diffState,
})

const mapDispatchToProps = (dispatch: Dispatch) => ({ dispatch })

export default connect(
    mapStateToProps,
    mapDispatchToProps
    // tslint:disable-next-line:no-any
)<any>(DiffView)
