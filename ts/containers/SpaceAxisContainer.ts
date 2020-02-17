import { connect } from "react-redux"
import { Dispatch } from "redux"
import SpaceAxis from "../components/commitTable/SpaceAxis"
import IState from "../IState"

const mapStateToProps = (state: IState) => ({
    classData: state.classData,
    methodData: state.methodData,
})
// tslint:disable-next-line: no-any
const mapDispatchToProps = (dispatch: Dispatch) => ({ dispatch })

export default connect(
    mapStateToProps,
    mapDispatchToProps
    // tslint:disable-next-line:no-any
)<any>(SpaceAxis)
