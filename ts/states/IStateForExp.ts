import ExpandSet from "../libs/ExpandSet"

export default interface IStateForExp {
    expSelectedClusters: ExpandSet<number>
}

export class StateForExp implements IStateForExp {
    public expSelectedClusters: ExpandSet<number> = new ExpandSet<number>()
}
