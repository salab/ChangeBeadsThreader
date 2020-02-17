import { REM_PER_MINUTE } from "../const"

export default interface IViewState {
    remPerMinute: number
    timeAxisWidth: number
    diffViewHeight: number
    isLoading: boolean
}

export class ViewState implements IViewState {
    public remPerMinute = REM_PER_MINUTE
    public timeAxisWidth = 0
    public diffViewHeight = 0
    public isLoading = false
}
