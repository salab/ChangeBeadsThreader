import { connect } from "react-redux"
import { Dispatch } from "redux"
import MainTable from "../components/commitTable/MainTable"
import IState from "../IState"

const mapStateToProps = (state: IState) => ({
    viewState: state.viewState,
    selectionState: state.selectionState,
    clusters: state.clusters,
    repositoryData: state.repositoryData,
    commits: state.commits,
    diffStateCache: state.diffStateCache,
    settings: state.settings,
    classData: state.classData,
    methodData: state.methodData,
})
// tslint:disable-next-line: no-any
const mapDispatchToProps = (dispatch: Dispatch) => ({ dispatch })

export default connect(
    mapStateToProps,
    mapDispatchToProps
    // tslint:disable-next-line:no-any
)<any>(MainTable)
