export default interface IDiffState {
    patches: IPatchData[]
}

export class DiffState implements IDiffState {
    public patches: IPatchData[] = []
}

export enum Origin {
    Add = "Add",
    Remove = "Remove",
    NoChange = "NoChange",
}

export interface IPatchData {
    hunks: IHunkData[]
    oldFile: string
    newFile: string
}

export class PatchData implements IPatchData {
    public hunks: IHunkData[] = []
    public oldFile: string
    public newFile: string
    constructor(oldFile: string, newFile: string) {
        this.oldFile = oldFile
        this.newFile = newFile
    }
}

export interface IHunkData {
    header: string
    lines: ILineDiffData[]
    newLines: number
    newStart: number
    oldLines: number
    oldStart: number
}

export class HunkData implements IHunkData {
    public header: string
    public lines: ILineDiffData[] = []
    public newLines: number
    public newStart: number
    public oldLines: number
    public oldStart: number

    constructor(
        header: string,
        newStart: number,
        newLines: number,
        oldStart: number,
        oldLines: number
    ) {
        this.header = header
        this.newLines = newLines
        this.newStart = newStart
        this.oldLines = oldLines
        this.oldStart = oldStart
    }
}

export interface ILineDiffData {
    origin: Origin // 各行が追加, 削除行か（"+", "-", " "）
    content: string // 行の内容
    oldLineno: number
    newLineno: number
    commitId: number | undefined // 行に対して直近で変更を行ったコミットのID
}

export class LineDiffData implements ILineDiffData {
    public origin: Origin
    public content: string
    public oldLineno: number
    public newLineno: number
    public commitId: number | undefined = undefined
    constructor(origin: Origin, content: string, oldLineno: number, newLineno: number) {
        this.origin = origin
        this.content = content
        this.oldLineno = oldLineno
        this.newLineno = newLineno
    }
}
