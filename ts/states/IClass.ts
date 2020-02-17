export default interface IClass {
    byId: {
        [key: number]: {
            classId: number
            className: string
            methods: number[]
        }
    }
}

export class Class implements IClass {
    public byId: {
        [key: number]: {
            classId: number
            className: string
            methods: number[]
        }
    } = {}
}

export const createClassData = (className: string) => {
    return {
        className,
        methods: [],
    }
}
