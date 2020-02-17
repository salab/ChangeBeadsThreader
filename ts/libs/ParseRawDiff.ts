import IDiffState, {
    DiffState,
    HunkData,
    IHunkData,
    ILineDiffData,
    IPatchData,
    LineDiffData,
    Origin,
    PatchData,
} from "../states/IDiffState"

interface IPatchTextPair {
    patchData: IPatchData
    textList: string[]
}

export const parseRawDiff = (rawDiff: string): IDiffState => {
    const diffState = new DiffState()

    const patchTextPairList = getPatchList(rawDiff)

    patchTextPairList.forEach(patchTextPair => {
        patchTextPair.patchData.hunks = getHunkList(patchTextPair.textList)
        diffState.patches.push(patchTextPair.patchData)
    })

    return diffState
}

const getPatchList = (rawDiff: string): IPatchTextPair[] => {
    const patchList: IPatchTextPair[] = []
    const diffLines = rawDiff.split(/\n/)
    diffLines.pop() // 末尾は改行文字のみの空行となるため削除

    const iterator = diffLines[Symbol.iterator]()
    let next = iterator.next()
    while (!next.done) {
        // patchの先頭までイテレータを進める
        const indexMatch = next.value.match(/diff\s--git\sa\/(\S+)\sb\/(\S+)/)
        if (indexMatch === null) {
            next = iterator.next()
            continue
        }

        // 次のpatchに到達するまでイテレータを進めて内容を取得
        const patch: IPatchTextPair = {
            patchData: new PatchData(indexMatch[1], indexMatch[2]),
            textList: [],
        }
        next = iterator.next()
        while (!next.done) {
            const isPatchHeader = new RegExp(/diff\s--git\sa\/(\S+)\sb\/(\S+)/).test(next.value)
            if (isPatchHeader) break
            patch.textList.push(next.value)
            next = iterator.next()
        }
        patchList.push(patch)
    }

    return patchList
}

const getHunkList = (patchTextList: string[]): IHunkData[] => {
    const hunkData: IHunkData[] = []
    const iterator = patchTextList[Symbol.iterator]()
    let next = iterator.next()
    let isNewHunk = false
    while (!next.done) {
        isNewHunk = false

        // hunkの先頭の文章が出現するまでiteratorを進める
        const result = next.value.match(/@@\s-(\d+),(\d+)\s\+(\d+),(\d+)\s@@/)
        if (result === null) {
            next = iterator.next()
            continue
        }

        // hunkの初期状態を作成
        const hunk = new HunkData(
            next.value,
            Number(result[3]),
            Number(result[4]),
            Number(result[1]),
            Number(result[2])
        )
        let oldLineno = hunk.oldStart
        let newLineno = hunk.newStart

        // hunk内の各行の情報を取得
        next = iterator.next()
        while (!next.done) {
            // hunkの先頭の文章が出現したらbreak
            const header = next.value.match(/@@\s-(\d+),(\d+)\s\+(\d+),(\d+)\s@@/)
            if (header !== null) {
                isNewHunk = true
                break
            }
            const lineDiffData = getLineDiffData(next.value, oldLineno, newLineno)
            switch (lineDiffData.origin) {
                case Origin.NoChange:
                    oldLineno++
                    newLineno++
                    break
                case Origin.Add:
                    newLineno++
                    break
                case Origin.Remove:
                    oldLineno++
                    break
                default:
                    break
            }
            hunk.lines.push(lineDiffData)
            next = iterator.next()
        }
        hunkData.push(hunk)
    }
    return hunkData
}

const getLineDiffData = (line: string, oldLineno: number, newLineno: number): ILineDiffData => {
    const origin = getOrigin(line.slice(0, 1))
    const content = line.slice(1)
    let oldNo = oldLineno
    let newNo = newLineno
    switch (origin) {
        case Origin.NoChange:
            break
        case Origin.Remove:
            newNo = -1
            break
        case Origin.Add:
            oldNo = -1
            break
        default:
            break
    }
    return new LineDiffData(origin, content, oldNo, newNo)
}

const getOrigin = (strOrigin: string): Origin => {
    let origin = Origin.NoChange
    switch (strOrigin) {
        case "+":
            origin = Origin.Add
            break
        case "-":
            origin = Origin.Remove
            break
        case " ":
            origin = Origin.NoChange
            break
        default:
            break
    }
    return origin
}
