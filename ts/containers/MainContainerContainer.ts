import { connect } from "react-redux"
import { Dispatch } from "redux"
import MainContainer from "../components/MainContainer"
import IState from "../IState"

const mapStateToProps = (state: IState) => ({
    settings: state.settings,
})
// tslint:disable-next-line: no-any
const mapDispatchToProps = (dispatch: Dispatch) => ({ dispatch })

export default connect(
    mapStateToProps,
    mapDispatchToProps
    // tslint:disable-next-line:no-any
)<any>(MainContainer)
