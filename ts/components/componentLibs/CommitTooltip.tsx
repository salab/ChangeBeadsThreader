import { createStyles, makeStyles, Theme } from "@material-ui/core/styles"
import Tooltip from "@material-ui/core/Tooltip"
import Typography from "@material-ui/core/Typography"
import React from "react"
import { createLog, settingLog4js } from "../../libs/helper"
import { ICommitData, IFileEditContent, IHunk, ILine, IPatch } from "../../states/ICommit"
import { Origin } from "../../states/IDiffState"
import { ToolTipDiffLine, ToolTipDiffLineNum, ToolTipDiffLineSign } from "./ToolTipDiff"

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        noMaxWidth: {
            maxWidth: "none",
        },
    })
)

export interface ICommitTooltipProps {
    // extends StandardProps<React.HTMLAttributes<HTMLDivElement>, TooltipClassKey, 'title', false> {
    children: React.ReactElement
    timestamp: number
    commitdata: ICommitData // propsのkey名には大文字を含めることはできない
    logging: string // booleanにすると実行時エラーが発生するのでStringを経由する
}

const tooltipLogger = (outputLogFile: boolean, timestamp: number, commitId: number) => {
    if (outputLogFile) {
        settingLog4js(timestamp).info(createLog("Tooltip is Opened", undefined, `${commitId}`))
    }
}

const toBoolean = (boolStr: string) => {
    return boolStr.toLowerCase() === "true"
}

export const CommitTooltip = (props: ICommitTooltipProps) => {
    const classes = useStyles()
    const logging = toBoolean(props.logging)
    return (
        <Tooltip
            {...props}
            enterDelay={300}
            leaveDelay={200}
            classes={{ tooltip: classes.noMaxWidth }}
            onOpen={(event: React.ChangeEvent<{}>) => {
                tooltipLogger(logging, props.timestamp, props.commitdata.commitId)
            }}
            title={
                <React.Fragment>
                    <Typography variant="subtitle2">
                        {props.commitdata.editTime.format("YYYY-MM-DD HH:mm:ss")}
                    </Typography>
                    <Typography variant="caption">{props.commitdata.message}</Typography>
                    <div>
                        {Object.keys(props.commitdata.editFile).map(filePath =>
                            renderFileDiff(filePath, props.commitdata.editFile[filePath])
                        )}
                    </div>
                </React.Fragment>
            }
        />
    )
}

const renderFileDiff = (filePath: String, fileEditContent: IFileEditContent) => {
    return (
        <div key={`${filePath}`}>
            <div>{filePath}</div>
            <div>{fileEditContent.patches.map(renderPatch)}</div>
        </div>
    )
}

const renderPatch = (patch: IPatch) => {
    return patch.hunks.map(renderHunk)
}

const renderHunk = (hunk: IHunk) => {
    return hunk.lines.map(renderLine)
}

const renderLine = (line: ILine) => {
    let bgColor = "inherit"
    let lineSign = ""
    switch (line.origin) {
        case Origin.Add:
            bgColor = "#373D29"
            lineSign = "+"
            break
        case Origin.Remove:
            bgColor = "#4B1818"
            lineSign = "-"
            break
        case Origin.NoChange:
            break
        default:
            lineSign = "xxx"
            break
    }
    const oldLineNo = line.oldLineNo > 0 ? line.oldLineNo : ""
    const newLineNo = line.newLineNo > 0 ? line.newLineNo : ""
    return (
        <div key={`tooltip-${line.oldLineNo}-${line.newLineNo}`} style={{ display: "flex" }}>
            <ToolTipDiffLineNum background={bgColor}>{oldLineNo}</ToolTipDiffLineNum>
            <ToolTipDiffLineNum background={bgColor}>{newLineNo}</ToolTipDiffLineNum>
            <ToolTipDiffLineSign background={bgColor}>{lineSign}</ToolTipDiffLineSign>
            <ToolTipDiffLine background={bgColor}>{line.content}</ToolTipDiffLine>
        </div>
    )
}
