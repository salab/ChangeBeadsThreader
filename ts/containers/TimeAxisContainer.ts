import { connect } from "react-redux"
import { Dispatch } from "redux"
import SpaceAxis from "../components/commitTable/SpaceAxis"
import TimeAxis from "../components/commitTable/TimeAxis"
import IState from "../IState"

const mapStateToProps = (state: IState) => ({
    repositoryData: state.repositoryData,
    viewState: state.viewState,
})
// tslint:disable-next-line: no-any
const mapDispatchToProps = (dispatch: Dispatch) => ({ dispatch })

export default connect(
    mapStateToProps,
    mapDispatchToProps
    // tslint:disable-next-line:no-any
)<any>(TimeAxis)
