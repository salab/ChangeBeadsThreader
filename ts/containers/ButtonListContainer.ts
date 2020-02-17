import { connect } from "react-redux"
import { Dispatch } from "redux"
import ButtonList from "../components/buttons/ButtonList"
import IState from "../IState"

const mapStateToProps = (state: IState) => ({
    viewState: state.viewState,
    settings: state.settings,
    repositoryData: state.repositoryData,
    commits: state.commits,
    clusters: state.clusters,
})
// tslint:disable-next-line: no-any
const mapDispatchToProps = (dispatch: Dispatch) => ({ dispatch })

export default connect(
    mapStateToProps,
    mapDispatchToProps
    // tslint:disable-next-line:no-any
)<any>(ButtonList)
