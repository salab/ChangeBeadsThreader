import moment from "moment"
import { Origin } from "./IDiffState"

export default interface ICommit {
    byId: {
        [key: number]: ICommitData
    }
}

export class Commit implements ICommit {
    public byId: {
        [key: number]: ICommitData
    } = {}
}

export interface ICommitData {
    commitId: number
    commitHash: string
    editTime: moment.Moment
    message: string
    editFile: IFileEditContentMap
}

export interface IFileEditContentMap {
    [filePath: string]: IFileEditContent
}

export interface IFileEditContent {
    editClassId: {
        [classId: number]: {
            editMethodId: number[]
        }
    }
    patches: IPatch[]
}

export interface IPatch {
    hunks: IHunk[]
    oldFile: string
    newFile: string
}

export interface IHunk {
    lines: ILine[]
    oldStart: number
    oldLines: number
    newStart: number
    newLines: number
}

export interface ILine {
    origin: Origin
    content: string
    oldLineNo: number
    newLineNo: number
}

export interface IRawCommitData {
    commitId: number
    commitHash: string
    editTime: moment.Moment
    message: string
    editFile: {
        [filePath: string]: {
            editClass: {
                [className: string]: {
                    editMethod: string[]
                }
            }
            patches: IPatch[]
        }
    }
}

// 引数のメソッド内で変更を行ったコミットのリストを返す
// initial commitは返り値のリストからは除外される
export const getCommitDataFromMethod = (commits: ICommit, methodId: number): ICommitData[] => {
    return Object.values(commits.byId).filter(element => {
        if (element.commitId === 0) return false
        for (const editFileContent of Object.values(element.editFile)) {
            for (const value of Object.values(editFileContent.editClassId)) {
                if (value.editMethodId.includes(methodId)) {
                    return true
                }
            }
        }
        return false
    })
}

// 引数のクラスで変更が行われておりかつ、その変更がメソッドに属していないコミットのリストを返す
// initial commitは返り値のリストからは除外される
export const getCommitDataFromClass = (commits: ICommit, classId: number): ICommitData[] => {
    return Object.values(commits.byId).filter(element => {
        if (element.commitId === 0) return false
        for (const editFileContent of Object.values(element.editFile)) {
            if (Object.keys(editFileContent.editClassId).some(id => Number(id) === classId)) {
                if (editFileContent.editClassId[classId].editMethodId.length === 0) {
                    return true
                }
            }
        }
        return false
    })
}

export const getHashListFromIDList = (IDList: number[], commits: ICommit): Map<string, number> => {
    const commitIDMap = new Map<string, number>()
    IDList.forEach(id => {
        commitIDMap.set(commits.byId[id].commitHash, id)
    })
    return commitIDMap
}
