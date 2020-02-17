export default interface ISelectionState {
    selectedClusterList: number[]
}

export class SelectionState implements ISelectionState {
    public selectedClusterList: number[] = []
}
