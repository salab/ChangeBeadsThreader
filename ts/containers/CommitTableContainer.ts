import { connect } from "react-redux"
import { Dispatch } from "redux"
import CommitTable from "../components/commitTable/CommitTable"
import IState from "../IState"

const mapStateToProps = (state: IState) => ({
    viewState: state.viewState,
})
// tslint:disable-next-line: no-any
const mapDispatchToProps = (dispatch: Dispatch) => ({ dispatch })

export default connect(
    mapStateToProps,
    mapDispatchToProps
    // tslint:disable-next-line:no-any
)<any>(CommitTable)
