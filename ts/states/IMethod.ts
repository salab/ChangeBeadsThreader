export default interface IMethod {
    byId: {
        [key: number]: IMethodData
    }
}

export interface IMethodData {
    methodId: number
    methodName: string
}

export class Method implements IMethod {
    public byId: {
        [key: number]: IMethodData
    } = {}
}

export const createMethodData = (methodName: string) => {
    return { methodName }
}

export const getMethodDataList = (methods: IMethod, methodIds: number[]): IMethodData[] => {
    return methodIds.map(element => {
        return methods.byId[element]
    })
}
