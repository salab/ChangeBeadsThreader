import moment from "moment"

export default interface IRepository {
    orgRepositoryPath: string | undefined
    repositoryPath: string | undefined
    firstDateTime: moment.Moment | undefined
    lastDateTime: moment.Moment | undefined
}

export class Repository implements IRepository {
    public orgRepositoryPath: string | undefined = undefined
    public repositoryPath: string | undefined = undefined
    public firstDateTime: moment.Moment | undefined = undefined
    public lastDateTime: moment.Moment | undefined = undefined
}
