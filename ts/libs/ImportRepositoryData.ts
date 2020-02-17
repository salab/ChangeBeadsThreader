import { remote } from "electron"
import * as fs from "fs"
import { copySync, removeSync } from "fs-extra"
import { cloneDeep } from "lodash"
import moment from "moment"
import * as path from "path"
import initialClusterer from "../libs/InitialClusterer"
import { IImportRepositoryArgs } from "../reducers/Reducers"
import IClass, { Class, createClassData } from "../states/IClass"
import ICluster from "../states/ICluster"
import ICommit, { Commit, IFileEditContentMap, IPatch, IRawCommitData } from "../states/ICommit"
import IMethod, { createMethodData, Method } from "../states/IMethod"
import IRepository, { Repository } from "../states/IRepository"
import { ISettingForUntangling } from "../states/ISettings"
import { getRepositoryPathFromImportFilePath } from "./helper"

interface IJsonFileData {
    commitDataList: [
        {
            commitHash: string
            editTime: string
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
    ]
    canRebaseMap: {
        [key: number]: {
            [key: number]: {
                value: boolean
            }
        }
    }
}

export const importRepositoryData = (
    setting: ISettingForUntangling
): IImportRepositoryArgs | undefined => {
    const openJSONFileRet = openJSONFile()
    if (openJSONFileRet === undefined) {
        return undefined
    }
    const { jsonRepositoryData, repositoryPath } = openJSONFileRet

    // 前回実行時のtmpディレクトリを削除し、新規にtmpディレクトリを作成
    const tmpDirPath = path.join(__dirname, "tmp", path.basename(repositoryPath))
    removeSync(tmpDirPath)
    const tmpRepoPath = path.join(tmpDirPath, path.basename(repositoryPath))
    copySync(repositoryPath, tmpRepoPath)
    const repositoryData: IRepository = {
        ...new Repository(),
        orgRepositoryPath: repositoryPath,
        repositoryPath: tmpRepoPath,
    }

    // JSONファイルから各コミットの情報を取得
    const rawCommitDataList: IRawCommitData[] = createRawCommitDataList(jsonRepositoryData)
    const result: {
        classData: IClass
        methodData: IMethod
        commits: ICommit
        repositoryData: IRepository
    } = getRepositoryState(rawCommitDataList, repositoryData)

    // 自動Change Untanglingを実行し、クラスタの初期状態を生成
    // initial commitはClustering対象外のため除外したICommitに対して自動Change Untangling
    const commitsForClusterer = cloneDeep(result.commits)
    delete commitsForClusterer.byId[0]
    const clusters: ICluster = initialClusterer(
        result.classData,
        result.methodData,
        commitsForClusterer,
        setting
    )

    return {
        ...result,
        clusters,
    }
}

export const openJSONFile = ():
    | { jsonRepositoryData: IJsonFileData; repositoryPath: string }
    | undefined => {
    const win = remote.BrowserWindow.getFocusedWindow()
    // tslint:disable-next-line:no-null-keyword
    if (win === null) return undefined

    const fileNames: string[] | undefined = remote.dialog.showOpenDialogSync(win, {
        properties: ["openFile"],
        filters: [
            {
                name: "Document",
                extensions: ["json"],
            },
        ],
    })
    if (fileNames === undefined) return undefined

    try {
        return {
            jsonRepositoryData: readJSONFile(fileNames[0]) as IJsonFileData,
            repositoryPath: getRepositoryPathFromImportFilePath(fileNames[0]),
        }
    } catch (e) {
        alert("JSON file is not valid repository Data.")
        return undefined
    }
}

// 指定したJSONファイルを読み込む
const readJSONFile = (jsonFilePath: string): object | undefined => {
    let data
    try {
        data = fs.readFileSync(jsonFilePath)
    } catch (e) {
        alert("file open error")
        return undefined
    }

    try {
        return JSON.parse(data.toString()) as object
    } catch (e) {
        alert("JSON parse error")
        return undefined
    }
}

const updateRepositoryDateTimeRange = (
    firstDateTime: moment.Moment | undefined,
    lastDateTime: moment.Moment | undefined,
    thisDateTime: moment.Moment
) => {
    if (firstDateTime !== undefined) {
        if (thisDateTime.isBefore(firstDateTime)) {
            firstDateTime = thisDateTime
        }
    } else {
        firstDateTime = thisDateTime
    }

    if (lastDateTime !== undefined) {
        if (thisDateTime.isAfter(lastDateTime)) {
            lastDateTime = thisDateTime
        }
    } else {
        lastDateTime = thisDateTime
    }

    return { firstDateTime, lastDateTime }
}

interface IEditClassIds {
    [classId: number]: {
        editMethodId: number[]
    }
}

export const getRepositoryState = (
    rawCommitDataList: IRawCommitData[],
    repositoryData: IRepository
) => {
    const classData: IClass = new Class()
    const methodData: IMethod = new Method()
    const commits: ICommit = new Commit()
    let classIdSerial = 0
    let methodIdSerial = 0

    let dateTimeRange: {
        firstDateTime: undefined | moment.Moment
        lastDateTime: undefined | moment.Moment
    } = { firstDateTime: undefined, lastDateTime: undefined }

    rawCommitDataList.forEach(rawCommitData => {
        dateTimeRange = updateRepositoryDateTimeRange(
            dateTimeRange.firstDateTime,
            dateTimeRange.lastDateTime,
            rawCommitData.editTime
        )
        const fileEditContent: IFileEditContentMap = {}

        Object.keys(rawCommitData.editFile).forEach(filePath => {
            const editData = rawCommitData.editFile[filePath]
            // const editClassIds: IEditClassIds = {}
            fileEditContent[filePath] = { editClassId: {}, patches: editData.patches }

            Object.keys(editData.editClass).forEach(className => {
                let classInfo = Object.values(classData.byId).find(
                    classElement => className === classElement.className
                )

                if (classInfo === undefined) {
                    // クラスが存在しなければ新規作成
                    classInfo = {
                        ...createClassData(className),
                        classId: classIdSerial,
                    }
                    classData.byId[classIdSerial] = classInfo

                    fileEditContent[filePath].editClassId[classIdSerial] = {
                        editMethodId: [],
                    }
                    classIdSerial++
                } else {
                    if (
                        !Object.keys(fileEditContent[filePath].editClassId).includes(
                            String(classInfo.classId)
                        )
                    ) {
                        fileEditContent[filePath].editClassId[classInfo.classId] = {
                            editMethodId: [],
                        }
                    }
                }

                // 同名のメソッドが存在しないことを確認して存在しない場合には追加
                const editMethodIds =
                    fileEditContent[filePath].editClassId[classInfo.classId].editMethodId

                editData.editClass[className].editMethod.forEach(methodName => {
                    if (classInfo === undefined) return
                    const methodId = Object.values(classInfo.methods).find(
                        id => methodData.byId[id].methodName === methodName
                    )

                    if (methodId === undefined) {
                        classInfo.methods.push(methodIdSerial)
                        methodData.byId[methodIdSerial] = {
                            ...createMethodData(methodName),
                            methodId: methodIdSerial,
                        }
                        editMethodIds.push(methodIdSerial)
                        methodIdSerial++
                    } else {
                        editMethodIds.push(methodId)
                    }
                })
            })

            commits.byId[rawCommitData.commitId] = {
                ...rawCommitData,
                editFile: fileEditContent,
            }
        })
    })

    repositoryData = {
        ...repositoryData,
        firstDateTime: dateTimeRange.firstDateTime,
        lastDateTime: dateTimeRange.lastDateTime,
    }

    return { classData, methodData, commits, repositoryData }
}
// 入力となるファイルをロードし、それらを基にコミットのリストを構築
export const createRawCommitDataList = (JSONData: IJsonFileData): IRawCommitData[] => {
    const resultCommits: IRawCommitData[] = []
    let id = 0
    for (const commitData of JSONData.commitDataList) {
        resultCommits.push({ ...commitData, editTime: moment(commitData.editTime), commitId: id })
        id++
    }

    return resultCommits
}
