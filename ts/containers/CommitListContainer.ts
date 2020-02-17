import { connect } from "react-redux"
import { Dispatch } from "redux"
import CommitList from "../components/commitList/CommitList"
import IState from "../IState"

const mapStateToProps = (state: IState) => ({
    selectionState: state.selectionState,
    clusters: state.clusters,
    commits: state.commits,
    settings: state.settings,
    methodData: state.methodData,
    viewState: state.viewState,
    repositoryData: state.repositoryData,
})
// tslint:disable-next-line: no-any
const mapDispatchToProps = (dispatch: Dispatch) => ({ dispatch })

export default connect(
    mapStateToProps,
    mapDispatchToProps
    // tslint:disable-next-line:no-any
)<any>(CommitList)
