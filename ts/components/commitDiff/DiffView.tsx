import styled from "@emotion/styled"
import {
    Divider,
    ExpansionPanel,
    ExpansionPanelDetails,
    ExpansionPanelSummary,
} from "@material-ui/core"
import { Theme } from "@material-ui/core/styles/createMuiTheme"
import createStyles from "@material-ui/core/styles/createStyles"
import withStyles, { WithStyles } from "@material-ui/core/styles/withStyles"
import React from "react"
import { Dispatch } from "redux"
import { removeCommitFromCluster, switchLoadingProgress } from "../../actions/Actions"
import { getCommitsFromClusters } from "../../libs/helper"
import { showDiff } from "../../libs/ShowDiff"
import ICluster, { searchClusterByCommitId } from "../../states/ICluster"
import ICommit from "../../states/ICommit"
import IDiffState, { IHunkData, ILineDiffData, IPatchData, Origin } from "../../states/IDiffState"
import IDiffStateCache from "../../states/IDiffStateCache"
import IRepository from "../../states/IRepository"
import ISelectionState from "../../states/ISelectionState"
import IViewState from "../../states/IViewState"
import LoadingProgress from "../componentLibs/LoadingProgress"
import DiffLine, { DiffLineColor, DiffLineNum, DiffLineSign } from "./DiffLine"

const styles = (theme: Theme) =>
    createStyles({
        root: {
            height: "100%",
            overflow: "scroll",
        },
        diffDetail: {
            flexDirection: "column",
        },
        line: {
            width: "100%",
        },
        lineContent: {
            /*fontFamily: "migu1M",
            fontSize: "0.8rem",
            lineHeight: "1.4",*/
        },
        linePre: {
            margin: 0,
            fontFamily: "migu1M",
            fontSize: "0.8rem",
            lineHeight: "1.4",
        },
        hunk: {
            marginBottom: "1rem",
            borderBottom: "solid gray 1px",
        },
        summary: {
            background: "#383838",
            minHeight: "0px",
            paddingTop: "0.8rem",
            paddingBottom: "0.8rem",
            margin: 0,
        },
        diffLine: {
            display: "flex",
        },
    })

const StyledExpansionPanelSummary = styled(ExpansionPanelSummary)`
    min-height: 0 !important;
    margin: 0;
    .Mui-expanded {
        margin: 0;
    }
    .MuiExpansionPanelSummary-content {
        margin: 0;
    }
`

interface IProps extends WithStyles<typeof styles> {
    viewState: IViewState
    repositoryData: IRepository
    clusters: ICluster
    commits: ICommit
    selectionState: ISelectionState
    diffStateCache: IDiffStateCache
    diffState: IDiffState
    // tslint:disable-next-line:no-any
    dispatch: Dispatch<any>
}

class DiffView extends React.Component<IProps> {
    constructor(props: IProps) {
        super(props)
    }

    private onColorClicked = async (commitID: number | undefined) => {
        if (commitID === undefined) return
        if (this.props.viewState.isLoading) return
        this.props.dispatch(switchLoadingProgress(true))

        const repoPath = this.props.repositoryData.repositoryPath
        if (repoPath === undefined) {
            alert(`対象のリポジトリが存在しません ${repoPath}`)
            return
        }
        const beforeCommitList = getCommitsFromClusters(
            this.props.clusters,
            this.props.selectionState.selectedClusterList
        )
        const afterCommitList = beforeCommitList.filter(it => {
            return it !== commitID
        })
        const isSucceeded = await showDiff(
            afterCommitList,
            this.props.commits,
            this.props.diffStateCache,
            repoPath,
            this.props.dispatch
        )
        if (isSucceeded) {
            this.props.dispatch(removeCommitFromCluster([commitID]))
        }
        this.props.dispatch(switchLoadingProgress(false))
    }

    private renderLine = (lineDiff: ILineDiffData) => {
        const { bgColor, lineSign } = this.getLineSign(lineDiff.origin)
        const oldLineNo = lineDiff.oldLineno > 0 ? lineDiff.oldLineno : ""
        const newLineNo = lineDiff.newLineno > 0 ? lineDiff.newLineno : ""
        let belongClusterColor = "inherit"
        if (lineDiff.commitId !== undefined) {
            const clusterData = searchClusterByCommitId(this.props.clusters, lineDiff.commitId)
            if (clusterData !== undefined) {
                belongClusterColor = clusterData.color
            }
        }
        return (
            <div className={this.props.classes.diffLine}>
                <DiffLineNum background={bgColor}>{oldLineNo}</DiffLineNum>
                <DiffLineNum background={bgColor}>{newLineNo}</DiffLineNum>
                <DiffLineSign background={bgColor}>{lineSign}</DiffLineSign>
                <DiffLineColor
                    background={belongClusterColor}
                    colored={belongClusterColor !== "inherit"}
                    isLoading={this.props.viewState.isLoading}
                    onClick={() => {
                        this.onColorClicked(lineDiff.commitId)
                    }}
                />
                <DiffLine background={bgColor}>{lineDiff.content}</DiffLine>
            </div>
        )
    }

    private getLineSign = (origin: Origin) => {
        let bgColor = "inherit"
        let lineSign = ""
        switch (origin) {
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
                break
        }
        return { bgColor, lineSign }
    }

    private renderHunk(hunk: IHunkData) {
        return hunk.lines.map((line, index) => {
            if (index === hunk.lines.length) {
                return (
                    <div key={`line-${line.oldLineno}-${line.newLineno}`}>
                        {this.renderLine(line)}
                        <Divider />
                    </div>
                )
            } else {
                return (
                    <div key={`line-${line.oldLineno}-${line.newLineno}`}>
                        {this.renderLine(line)}
                    </div>
                )
            }
        })
    }

    private renderPatch(patch: IPatchData) {
        return patch.hunks.map(hunk => {
            const lineRange = `${hunk.newStart}-${hunk.newStart + hunk.newLines - 1}`
            return (
                <div className={this.props.classes.hunk} key={`hunk-${patch.newFile}-${lineRange}`}>
                    <div>line {lineRange}</div>
                    {this.renderHunk(hunk)}
                </div>
            )
        })
    }

    public renderPatches() {
        return this.props.diffState.patches.map(patch => (
            <ExpansionPanel key={`${patch.oldFile}-${patch.newFile}`} defaultExpanded={true}>
                <StyledExpansionPanelSummary className={this.props.classes.summary}>
                    <div style={{ margin: 0 }}>{patch.newFile}</div>
                </StyledExpansionPanelSummary>
                <ExpansionPanelDetails className={this.props.classes.diffDetail}>
                    {this.renderPatch(patch)}
                </ExpansionPanelDetails>
            </ExpansionPanel>
        ))
    }

    public render() {
        return (
            <div
                className={this.props.classes.root}
                style={{ height: this.props.viewState.diffViewHeight }}
            >
                {this.props.viewState.isLoading && <LoadingProgress />}
                {this.renderPatches()}
            </div>
        )
    }
}

export default withStyles(styles)(DiffView)
