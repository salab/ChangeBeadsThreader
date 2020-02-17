import { connect } from "react-redux"
import { Dispatch } from "redux"
import CommitListButtons from "../components/commitList/CommitListButtons"
import IState from "../IState"

const mapStateToProps = (state: IState) => ({
    viewState: state.viewState,
    selectionState: state.selectionState,
    repositoryData: state.repositoryData,
    diffStateCache: state.diffStateCache,
    clusters: state.clusters,
    commits: state.commits,
})
// tslint:disable-next-line: no-any
const mapDispatchToProps = (dispatch: Dispatch) => ({ dispatch })

export default connect(
    mapStateToProps,
    mapDispatchToProps
    // tslint:disable-next-line:no-any
)<any>(CommitListButtons)
