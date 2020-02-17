import styled from "@emotion/styled"
import { Divider } from "@material-ui/core"
import { Theme } from "@material-ui/core/styles/createMuiTheme"
import createStyles from "@material-ui/core/styles/createStyles"
import withStyles, { WithStyles } from "@material-ui/core/styles/withStyles"
import { PositionProperty } from "csstype"
import React from "react"
import { SelectableGroup } from "react-selectable-fast"
import { Dispatch } from "redux"
import { switchLoadingProgress, updateSelectedClusterList } from "../../actions/Actions"
import { getCommitsFromClusters, getPositionFromDateTime } from "../../libs/helper"
import { showDiff } from "../../libs/ShowDiff"
import IClass from "../../states/IClass"
import ICluster, { IClusterData, searchClusterByCommitId } from "../../states/ICluster"
import ICommit, {
    getCommitDataFromClass,
    getCommitDataFromMethod,
    ICommitData,
} from "../../states/ICommit"
import IDiffStateCache from "../../states/IDiffStateCache"
import IMethod, { getMethodDataList, IMethodData } from "../../states/IMethod"
import IRepository from "../../states/IRepository"
import ISelectionState from "../../states/ISelectionState"
import ISettings from "../../states/ISettings"
import IViewState from "../../states/IViewState"
import { CommitTooltip } from "../componentLibs/CommitTooltip"
import LoadingProgress from "../componentLibs/LoadingProgress"
import ChangeBead, { ISelectableChangeBeadProps } from "./elements/ChangeBead"

const DividedList = styled.div`
    height: 1.2rem;
`

interface IRootProps {
    width: number
}

const Root = styled.div<IRootProps>`
    padding-top: 8px;
    padding-bottom: 8px;
    width: ${(props: IRootProps) => props.width}px;
    min-width: 100%;
`

const styles = (theme: Theme) => createStyles({})

interface IProps extends WithStyles<typeof styles> {
    viewState: IViewState
    selectionState: ISelectionState
    clusters: ICluster
    repositoryData: IRepository
    commits: ICommit
    diffStateCache: IDiffStateCache
    settings: ISettings
    classData: IClass
    methodData: IMethod
    // tslint:disable-next-line:no-any
    dispatch: Dispatch<any>
}

class MainTable extends React.Component<IProps> {
    constructor(props: IProps) {
        super(props)
    }

    private handleSelectionFinish = (
        selectedItemList: React.Component<ISelectableChangeBeadProps>[]
    ) => {
        if (selectedItemList.length <= 0) {
            return
        }
        if (this.props.viewState.isLoading) return
        console.log("Selection Event")
        console.log(selectedItemList.map(it => it.props.commitId))
        console.log(selectedItemList)
        let isSingleCluster = true
        let clusterId: number | undefined
        for (const selectedItem of selectedItemList) {
            const cluster = searchClusterByCommitId(
                this.props.clusters,
                selectedItem.props.commitId
            )
            if (cluster === undefined) continue
            if (clusterId === undefined) {
                clusterId = cluster.clusterId
                continue
            }
            if (clusterId !== cluster.clusterId) {
                isSingleCluster = false
                break
            }
        }
        if (isSingleCluster) {
            this.onChangeBeadClick(selectedItemList[0].props.commitId)
        } else {
            const commitIdList = selectedItemList.map(it => {
                return it.props.commitId
            })
            this.onChangeBeadsSelected(commitIdList)
        }
    }

    // 範囲選択されたChangeBeadsを選択状態にする
    private onChangeBeadsSelected = (commitIdList: number[]): void => {
        if (this.props.viewState.isLoading) return
        const addClusterList: number[] = []
        commitIdList.forEach(commitId => {
            const cluster = searchClusterByCommitId(this.props.clusters, commitId)
            if (cluster === undefined) {
                Error(`commit id${commitId}に対応するクラスターが存在しません`)
                return
            }
            if (
                this.props.selectionState.selectedClusterList.includes(cluster.clusterId) ||
                addClusterList.includes(cluster.clusterId)
            ) {
                return
            }
            addClusterList.push(cluster.clusterId)
        })
        if (addClusterList.length === 0) return

        this.props.dispatch(switchLoadingProgress(true))
        const addSelectedClusterResult = this.addSelectedClusterList(...addClusterList)
        if (addSelectedClusterResult.isUpdate) {
            this.displayDiff(addSelectedClusterResult.list).finally(() => {
                this.props.dispatch(switchLoadingProgress(false))
            })
        } else {
            this.props.dispatch(switchLoadingProgress(false))
        }
    }

    // 選択されたChangeBeadsの選択状態を切り替える
    private onChangeBeadClick = (commitId: number): void => {
        if (this.props.viewState.isLoading) return
        // TODO: showDiffが失敗した際にupdateSelectedCommitsの実行をキャンセル
        const cluster = searchClusterByCommitId(this.props.clusters, commitId)
        if (cluster === undefined) {
            Error(`commit id${commitId}に対応するクラスターが存在しません`)
            return
        }
        this.props.dispatch(switchLoadingProgress(true))
        const operateSelectedClusterResult = this.props.selectionState.selectedClusterList.includes(
            cluster.clusterId
        )
            ? this.removeSelectedClusterList(cluster.clusterId)
            : this.addSelectedClusterList(cluster.clusterId)
        if (operateSelectedClusterResult.isUpdate) {
            this.displayDiff(operateSelectedClusterResult.list).finally(() => {
                this.props.dispatch(switchLoadingProgress(false))
            })
        } else {
            this.props.dispatch(switchLoadingProgress(false))
        }
    }

    private async displayDiff(selectedClusterList: number[]) {
        const repoPath = this.props.repositoryData.repositoryPath
        if (repoPath === undefined) {
            alert(`対象のリポジトリが存在しません ${repoPath}`)
            return
        }
        const selectedCommitList = getCommitsFromClusters(this.props.clusters, selectedClusterList)
        await showDiff(
            selectedCommitList,
            this.props.commits,
            this.props.diffStateCache,
            repoPath,
            this.props.dispatch
        )
    }

    // 指定されたクラスタ群を選択状態にする
    private addSelectedClusterList = (
        ...clusterIdList: number[]
    ): { isUpdate: boolean; list: number[] } => {
        const newSelectedClusterList = [...this.props.selectionState.selectedClusterList]
        clusterIdList.forEach(clusterId => {
            newSelectedClusterList.push(clusterId)
        })

        this.props.dispatch(updateSelectedClusterList(newSelectedClusterList))
        return { isUpdate: true, list: newSelectedClusterList }
    }

    // 指定されたクラスタを非選択状態にする
    private removeSelectedClusterList = (
        clusterId: number
    ): { isUpdate: boolean; list: number[] } => {
        const newSelectedClusterList = this.props.selectionState.selectedClusterList.filter(
            id => id !== clusterId
        )
        this.props.dispatch(updateSelectedClusterList(newSelectedClusterList))
        return { isUpdate: true, list: newSelectedClusterList }
    }

    public renderChangeBeads = (commitList: ICommitData[]) => {
        const timestamp = this.props.settings.timestamp
        commitList.sort((a, b) => {
            if (a.editTime.isSameOrAfter(b.editTime)) {
                return 1
            } else {
                return -1
            }
        })
        let beforeBeadsPosition = 0
        return commitList.map(commitData => {
            if (this.props.repositoryData.firstDateTime !== undefined) {
                const cluster = searchClusterByCommitId(this.props.clusters, commitData.commitId)
                if (cluster === undefined) {
                    throw new Error(
                        `コミットID${commitData.commitId}が格納されたクラスターが存在しません`
                    )
                }
                const isSelected = this.props.selectionState.selectedClusterList.includes(
                    cluster.clusterId
                )
                let left = getPositionFromDateTime(
                    commitData.editTime,
                    this.props.repositoryData.firstDateTime,
                    this.props.viewState.remPerMinute
                )
                if (left <= beforeBeadsPosition) {
                    left = beforeBeadsPosition + 0.8
                }
                beforeBeadsPosition = left
                const changeBeadContainerStyle = {
                    left: `${left}rem`,
                    position: "absolute" as PositionProperty,
                }
                return (
                    <CommitTooltip
                        key={commitData.commitId}
                        logging={String(this.props.settings.outputLogFile)}
                        commitdata={commitData}
                        timestamp={timestamp}
                    >
                        <div style={changeBeadContainerStyle}>
                            <ChangeBead
                                width={0.8}
                                background={cluster.color}
                                isBeadSelected={isSelected}
                                isLoading={this.props.viewState.isLoading}
                                commitId={commitData.commitId}
                            />
                        </div>
                    </CommitTooltip>
                )
            } else {
                Error("firstDatetime is undefined")
            }
        })
    }

    public renderMethodRow = (methodList: IMethodData[], className: string) => {
        return methodList.map(methodData => (
            <div key={`${className}/${methodData.methodName}-main-table`}>
                <DividedList>
                    {this.renderChangeBeads(
                        getCommitDataFromMethod(this.props.commits, methodData.methodId)
                    )}
                </DividedList>
                <Divider />
            </div>
        ))
    }

    public renderClassRow = () => {
        return Object.values(this.props.classData.byId).map(classData => (
            <div key={`${classData.className}-main-table`}>
                <DividedList>
                    {this.renderChangeBeads(
                        getCommitDataFromClass(this.props.commits, classData.classId)
                    )}
                </DividedList>
                <Divider />
                {this.renderMethodRow(
                    getMethodDataList(this.props.methodData, classData.methods),
                    classData.className
                )}
            </div>
        ))
    }

    public render() {
        return (
            <Root width={this.props.viewState.timeAxisWidth}>
                {this.props.viewState.isLoading && <LoadingProgress />}
                <SelectableGroup
                    clickClassName="change-bead"
                    deselectOnEsc={false}
                    onSelectionFinish={this.handleSelectionFinish}
                    resetOnStart={true}
                >
                    {this.renderClassRow()}
                </SelectableGroup>
            </Root>
        )
    }
}

export default withStyles(styles)(MainTable)
