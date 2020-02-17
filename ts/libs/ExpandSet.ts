export default class ExpandSet<T> extends Set<T> {
    public addSet(values: Set<T>) {
        values.forEach(value => this.add(value))
    }

    public toString() {
        return `Set(${this.size})[${[...this].join(", ")}]`
    }
}
