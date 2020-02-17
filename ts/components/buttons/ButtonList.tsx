import styled from "@emotion/styled"
import { Theme } from "@material-ui/core/styles/createMuiTheme"
import createStyles from "@material-ui/core/styles/createStyles"
import withStyles, { WithStyles } from "@material-ui/core/styles/withStyles"
import Tooltip from "@material-ui/core/Tooltip"
import Slider from "rc-slider"
import "rc-slider/assets/index.css"
import React from "react"
import { AiOutlineExport, AiOutlineImport } from "react-icons/ai"
import { Dispatch } from "redux"
import { changeRemPerMinute, importRepository, switchLoadingProgress } from "../../actions/Actions"
import { REM_PER_MINUTE_MAX, REM_PER_MINUTE_MIN, REM_PER_MINUTE_STEP } from "../../const"
import { exportRepository, getExportRebaseData } from "../../libs/ExportRepository"
import { createLog, settingLog4js } from "../../libs/helper"
import { importRepositoryData } from "../../libs/ImportRepositoryData"
import ICluster from "../../states/ICluster"
import ICommit from "../../states/ICommit"
import IRepository from "../../states/IRepository"
import ISettings from "../../states/ISettings"
import IViewState from "../../states/IViewState"

export const MyButton = styled.button`
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
    settings: ISettings
    repositoryData: IRepository
    commits: ICommit
    clusters: ICluster
    // tslint:disable-next-line:no-any
    dispatch: Dispatch<any>
}

// tslint:disable-next-line:no-any
class ButtonList extends React.Component<IProps> {
    constructor(props: IProps) {
        super(props)
    }

    // tslint:disable-next-line:no-any
    private handleSliderChange = (value: number): void => {
        this.props.dispatch(changeRemPerMinute(value))
    }

    private importRepository = () => {
        if (this.props.viewState.isLoading) return
        const initialRepositoryData = importRepositoryData(this.props.settings.settingForUntangling)

        if (initialRepositoryData === undefined) return
        if (initialRepositoryData.repositoryData.repositoryPath === undefined) return
        this.props.dispatch(switchLoadingProgress(true))
        this.props.dispatch(importRepository(initialRepositoryData))
        this.props.dispatch(switchLoadingProgress(false))
    }

    private renderExportButton = () => (
        <Tooltip className={this.props.classes.toolTip} title="Export Repository">
            <MyButton
                onClick={async () => {
                    const isFinish = confirm("Do you want to finish the tailoring?")
                    if (!isFinish) return
                    if (this.props.settings.outputLogFile) {
                        settingLog4js(this.props.settings.timestamp).info(
                            createLog("finishTailoring", undefined)
                        )
                    }
                    if (this.props.repositoryData.repositoryPath === undefined) return
                    if (this.props.repositoryData.orgRepositoryPath === undefined) return
                    const exportPath = `${this.props.repositoryData.orgRepositoryPath}-cbt`
                    const exportRebaseData = getExportRebaseData(
                        this.props.commits,
                        this.props.clusters
                    )
                    await exportRepository(
                        exportPath,
                        this.props.repositoryData.repositoryPath,
                        exportRebaseData,
                        this.props.commits.byId[0].commitHash
                    )
                    alert(`Export result to ${exportPath}`)
                }}
                className={this.props.classes.menuBoxItem}
            >
                <AiOutlineExport />
            </MyButton>
        </Tooltip>
    )

    private renderImportButton = () => (
        <Tooltip className={this.props.classes.toolTip} title="Open Repository">
            <MyButton
                onClick={() => {
                    this.importRepository()
                }}
                className={this.props.classes.menuBoxItem}
            >
                <AiOutlineImport />
            </MyButton>
        </Tooltip>
    )

    private renderSlider = () => (
        <div className={`${this.props.classes.menuBoxItem} ${this.props.classes.sliderContainer}`}>
            <Slider
                onChange={this.handleSliderChange}
                defaultValue={this.props.viewState.remPerMinute}
                min={REM_PER_MINUTE_MIN}
                max={REM_PER_MINUTE_MAX}
                step={REM_PER_MINUTE_STEP}
            />
        </div>
    )

    public render() {
        return (
            <div className={this.props.classes.menuBox}>
                {this.renderImportButton()}
                {this.renderExportButton()}
                {this.renderSlider()}
            </div>
        )
    }
}

export default withStyles(styles)(ButtonList)
