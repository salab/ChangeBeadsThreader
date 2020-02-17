import Paper from "@material-ui/core/Paper"
import { Theme } from "@material-ui/core/styles/createMuiTheme"
import createStyles from "@material-ui/core/styles/createStyles"
import withStyles, { WithStyles } from "@material-ui/core/styles/withStyles"
import Table from "@material-ui/core/Table"
import TableBody from "@material-ui/core/TableBody"
import TableCell from "@material-ui/core/TableCell"
import TableHead from "@material-ui/core/TableHead"
import TableRow from "@material-ui/core/TableRow"
import { WhiteSpaceProperty } from "csstype"
import * as path from "path"
import React from "react"
import { IoMdGitBranch } from "react-icons/io"
import { Dispatch } from "redux"
import { removeCommitFromCluster, switchLoadingProgress } from "../../actions/Actions"
import CommitListButtonsContainer from "../../containers/CommitListButtonsContainer"
import { getMethodName } from "../../libs/helper"
import { getDiff } from "../../libs/ShowDiff"
import ICluster, { searchClusterByCommitId } from "../../states/ICluster"
import ICommit from "../../states/ICommit"
import IMethod from "../../states/IMethod"
import IRepository from "../../states/IRepository"
import ISelectionState from "../../states/ISelectionState"
import ISettings from "../../states/ISettings"
import IViewState from "../../states/IViewState"
import { MyButton } from "../buttons/ButtonList"
import { CommitTooltip } from "../componentLibs/CommitTooltip"
import LoadingProgress from "../componentLibs/LoadingProgress"

const styles = (theme: Theme) =>
    createStyles({
        root: {
            width: "100%",
            // overflow: "scroll",
            overflow: "auto",
        },
        paper: {},
        tableWrapper: {},
        firstCell: {
            display: "flex",
            alignItems: "center",
            flexDirection: "row",
            padding: "6px 6px 6px 6px",
        },
        smallCheckbox: {
            padding: "0px 10px 0px 0px",
        },
        firstWrapper: {
            display: "flex",
            alignItems: "center",
            flexDirection: "row",
        },
        commitRowSpace: {
            paddingRight: "1.8rem",
        },
        clusterRow: {
            whiteSpace: "nowrap",
            padding: "0px",
            background: "#656565",
        },
        headerFirstCell: {
            padding: "0px",
            whiteSpace: "nowrap",
        },
        headerColorPadding: {
            paddingRight: "1rem",
            paddingLeft: "0rem",
        },
    })

interface IProps extends WithStyles<typeof styles> {
    selectionState: ISelectionState
    clusters: ICluster
    commits: ICommit
    settings: ISettings
    methodData: IMethod
    viewState: IViewState
    repositoryData: IRepository
    // tslint:disable-next-line:no-any
    dispatch: Dispatch<any>
}

class CommitListContainer extends React.Component<IProps> {
    private columnStyle = {
        // Typescriptが型を認識してくれないのでasでダウンキャスト
        whiteSpace: "nowrap" as WhiteSpaceProperty,
        paddingRight: "6px",
        paddingLeft: "6px",
    }
    private firstColumnStyle = {
        // Typescriptが型を認識してくれないのでasでダウンキャスト
        whiteSpace: "nowrap" as WhiteSpaceProperty,
        padding: "0px",
    }

    constructor(props: IProps) {
        super(props)
    }

    private onSplitButtonClicked = async (commitID: number) => {
        this.props.dispatch(switchLoadingProgress(true))
        const repoPath = this.props.repositoryData.repositoryPath
        if (repoPath === undefined) {
            alert(`対象のリポジトリが存在しません ${repoPath}`)
            return
        }
        const cluster = searchClusterByCommitId(this.props.clusters, commitID)
        if (cluster === undefined) return
        const afterCommitList = cluster.commitIdList.filter(it => {
            return it !== commitID
        })
        const isSucceeded = await getDiff(afterCommitList, this.props.commits, repoPath)
        if (isSucceeded !== undefined) {
            this.props.dispatch(removeCommitFromCluster([commitID]))
        }
        this.props.dispatch(switchLoadingProgress(false))
    }

    public renderBodyRow(commitIdList: number[]) {
        return commitIdList.map(it => {
            const commitData = this.props.commits.byId[it]
            const cluster = searchClusterByCommitId(this.props.clusters, it)
            if (cluster === undefined) return undefined
            const colorColumnStyle = {
                backgroundColor: cluster.color,
                paddingRight: "1rem",
                paddingLeft: "0rem",
                height: "2.22rem",
            }
            const timestamp = this.props.settings.timestamp
            // TODO: 変更がファイル・クラス・Methodにまたがる際の対応
            const editFilePath = Object.keys(commitData.editFile)[0]
            const classIdList = Object.values(commitData.editFile[editFilePath].editClassId)
            const methodIdList = classIdList[0].editMethodId
            const methodId = methodIdList.length === 0 ? undefined : methodIdList[0]
            const methodName =
                methodId === undefined
                    ? ""
                    : getMethodName(this.props.methodData.byId[Number(methodId)].methodName)
            return (
                <TableRow key={`ChangeBeadsList-${commitData.commitId}`}>
                    <TableCell style={this.columnStyle}>
                        <MyButton
                            onClick={() => {
                                this.onSplitButtonClicked(it)
                            }}
                        >
                            <IoMdGitBranch />
                        </MyButton>
                    </TableCell>
                    <CommitTooltip
                        logging={String(this.props.settings.outputLogFile)}
                        commitdata={commitData}
                        timestamp={timestamp}
                    >
                        <TableCell style={this.firstColumnStyle}>
                            <div className={this.props.classes.firstWrapper}>
                                <div style={colorColumnStyle} />
                                <div className={this.props.classes.firstCell}>
                                    <div>{path.basename(editFilePath)}</div>
                                </div>
                            </div>
                        </TableCell>
                    </CommitTooltip>
                    <CommitTooltip
                        logging={String(this.props.settings.outputLogFile)}
                        commitdata={commitData}
                        timestamp={timestamp}
                    >
                        <TableCell style={this.columnStyle}>{methodName}</TableCell>
                    </CommitTooltip>
                    <CommitTooltip
                        logging={String(this.props.settings.outputLogFile)}
                        commitdata={commitData}
                        timestamp={timestamp}
                    >
                        <TableCell style={this.columnStyle}>
                            {commitData.editTime.format("YYYY-MM-DD HH:mm:ss")}
                        </TableCell>
                    </CommitTooltip>
                    <CommitTooltip
                        logging={String(this.props.settings.outputLogFile)}
                        commitdata={commitData}
                        timestamp={timestamp}
                    >
                        <TableCell style={this.columnStyle}>
                            {commitData.commitHash.substr(0, 7)}
                        </TableCell>
                    </CommitTooltip>
                </TableRow>
            )
        })
    }

    private renderClusterRow(clusterMap: Map<number, number[]>) {
        const ret: JSX.Element[] = []
        clusterMap.forEach((commitIDList, clusterID) => {
            const cluster = this.props.clusters.byId[clusterID]
            const colorColumnStyle = {
                backgroundColor: cluster.color,
                paddingRight: "1rem",
                paddingLeft: "0rem",
                height: "2.22rem",
            }
            ret.push(
                <TableRow key={`ChangeBeadsList-Cluster${clusterID}`}>
                    <TableCell colSpan={4} className={this.props.classes.clusterRow}>
                        <div className={this.props.classes.firstWrapper}>
                            <div style={colorColumnStyle} />
                            <div className={this.props.classes.firstCell}>
                                <div>{commitIDList.length} Change Beads</div>
                            </div>
                        </div>
                    </TableCell>
                </TableRow>
            )
            this.renderBodyRow(commitIDList).forEach(it => {
                if (it === undefined) return
                ret.push(it)
            })
        })
        return ret
    }

    public renderTable() {
        const selectedCommitList: number[] = []
        this.props.selectionState.selectedClusterList.forEach(value => {
            selectedCommitList.push(...this.props.clusters.byId[value].commitIdList)
        })
        const clusterMap: Map<number, number[]> = new Map()
        selectedCommitList.forEach(it => {
            const cluster = searchClusterByCommitId(this.props.clusters, it)
            if (cluster === undefined) return
            if (clusterMap.has(cluster.clusterId)) {
                const commitList = clusterMap.get(cluster.clusterId)
                if (commitList === undefined) return
                commitList.push(it)
            } else {
                clusterMap.set(cluster.clusterId, [it])
            }
        })
        const cellStyle = {
            whiteSpace: "nowrap" as WhiteSpaceProperty,
            paddingRight: "6px",
            paddingLeft: "6px",
        }
        return (
            <Paper className={this.props.classes.paper}>
                <CommitListButtonsContainer />
                <div className={this.props.classes.tableWrapper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell style={cellStyle} />
                                <TableCell className={this.props.classes.headerFirstCell}>
                                    <div className={this.props.classes.firstCell}>
                                        <div className={this.props.classes.headerColorPadding} />
                                        <div>File Name</div>
                                    </div>
                                </TableCell>
                                <TableCell style={cellStyle}>Method</TableCell>
                                <TableCell style={cellStyle}>Time</TableCell>
                                <TableCell style={cellStyle}>Commit ID</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>{this.renderClusterRow(clusterMap)}</TableBody>
                    </Table>
                </div>
            </Paper>
        )
    }

    // TODO: 横スクロール時に背景色が描画されない問題の解決
    public render() {
        return (
            <div
                className={this.props.classes.root}
                style={{ height: this.props.viewState.diffViewHeight }}
            >
                {this.props.viewState.isLoading && <LoadingProgress />}
                {this.renderTable()}
            </div>
        )
    }
}

export default withStyles(styles)(CommitListContainer)
