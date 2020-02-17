import styled from "@emotion/styled"
import { Theme } from "@material-ui/core/styles/createMuiTheme"
import createStyles from "@material-ui/core/styles/createStyles"
import withStyles, { WithStyles } from "@material-ui/core/styles/withStyles"
import Tooltip from "@material-ui/core/Tooltip"
import "rc-slider/assets/index.css"
import React from "react"
import { IoMdGitMerge, IoMdTrash } from "react-icons/io"
import { Dispatch } from "redux"
import { joinCluster, resetSelectedCommits, switchLoadingProgress } from "../../actions/Actions"
import ICluster from "../../states/ICluster"
import ICommit from "../../states/ICommit"
import IDiffStateCache from "../../states/IDiffStateCache"
import IRepository from "../../states/IRepository"
import ISelectionState from "../../states/ISelectionState"
import IViewState from "../../states/IViewState"

const MyButton = styled.button`
    color: white;
    cursor: pointer;
    display: inline-block;
    min-height: 1em;
    outline: 0;
    border: none;
    vertical-align: baseline;
    margin: 0 0.25em 0 0;
    line-height: 1em;
    font-style: normal;
    text-align: center;
    text-decoration: none;
    border-radius: 0.3rem;
    padding: 0.4em;
    margin: 0.1em;
    background-color: inherit;
    &:hover {
        background-color: #969696;
    }
`

const styles = (theme: Theme) =>
    createStyles({
        toolTip: {
            fontSize: "1.2em",
        },
        menuBoxItem: {},
        menuBox: {
            display: "flex",
        },
        sliderContainer: {
            paddingLeft: "3rem",
            width: "20rem",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
        },
    })

interface IProps extends WithStyles<typeof styles> {
    viewState: IViewState
    selectionState: ISelectionState
    repositoryData: IRepository
    diffStateCache: IDiffStateCache
    clusters: ICluster
    commits: ICommit
    // tslint:disable-next-line:no-any
    dispatch: Dispatch<any>
}

// tslint:disable-next-line:no-any
class CommitListButtons extends React.Component<IProps> {
    constructor(props: IProps) {
        super(props)
    }

    public joinCluster = () => {
        if (this.props.viewState.isLoading) return
        this.props.dispatch(switchLoadingProgress(true))
        this.props.dispatch(joinCluster(this.props.selectionState.selectedClusterList))
        this.resetSelectedCommits()
        this.props.dispatch(switchLoadingProgress(false))
    }

    public resetSelectedCommits = () => {
        if (this.props.viewState.isLoading) return
        this.props.dispatch(resetSelectedCommits())
    }

    public renderJoinClusterButton = () => (
        <Tooltip className={this.props.classes.toolTip} title="Merge Selected Cluster">
            <MyButton
                onClick={() => {
                    this.joinCluster()
                }}
                className={this.props.classes.menuBoxItem}
            >
                <IoMdGitMerge />
            </MyButton>
        </Tooltip>
    )

    public renderResetSelectedCommitsButton = () => (
        <Tooltip className={this.props.classes.toolTip} title="Reset Selected Cluster">
            <MyButton
                onClick={() => {
                    this.resetSelectedCommits()
                }}
                className={this.props.classes.menuBoxItem}
            >
                <IoMdTrash />
            </MyButton>
        </Tooltip>
    )

    public render() {
        return (
            <div className={this.props.classes.menuBox}>
                {this.renderJoinClusterButton()}
                {/*this.renderSplitClusterButton()*/}
                {this.renderResetSelectedCommitsButton()}
            </div>
        )
    }
}

export default withStyles(styles)(CommitListButtons)
