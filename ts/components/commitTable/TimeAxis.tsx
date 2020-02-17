import styled from "@emotion/styled"
import { Theme } from "@material-ui/core/styles/createMuiTheme"
import createStyles from "@material-ui/core/styles/createStyles"
import withStyles, { WithStyles } from "@material-ui/core/styles/withStyles"
import moment from "moment"
import React from "react"
import ReactResizeDetector from "react-resize-detector"
import { Dispatch } from "redux"
import { changeTimeAxisWidth } from "../../actions/Actions"
import { REM_PER_MINUTE } from "../../const"
import IState from "../../IState"
import { remFromMinute } from "../../libs/helper"
import IRepository from "../../states/IRepository"
import IViewState from "../../states/IViewState"

interface IMinuteBoxItemProps {
    width: number
}

const BoxItem = styled.div<IMinuteBoxItemProps>`
    width: ${(props: IMinuteBoxItemProps) => `${props.width}rem`};
    height: 1.6rem;
    text-align: center;
    border-right: 1px solid #7f7f7f;
    border-bottom: 1px solid #7f7f7f;
`

const styles = (theme: Theme) =>
    createStyles({
        root: {
            height: "3.2rem",
            fontSize: "1rem",
        },
        boxContainer: {
            whiteSpace: "nowrap",
            display: "flex",
            flexDirection: "row",
        },
    })

interface IProps extends WithStyles<typeof styles> {
    repositoryData: IRepository
    viewState: IViewState
    // tslint:disable-next-line:no-any
    dispatch: Dispatch<any>
}

class TimeAxis extends React.Component<IProps> {
    private onResize = (width: number) => {
        this.props.dispatch(changeTimeAxisWidth(width))
    }

    private renderBoxItem = (minutes: number, key: number, width: number) => {
        return (
            <BoxItem key={key} width={width}>
                {minutes}
            </BoxItem>
        )
    }

    private renderTimeAxis = () => {
        const minuteBoxList = []
        const hourBoxList = []
        const minuteBoxWidth = remFromMinute(1, this.props.viewState.remPerMinute)
        let minutesDuration
        let nowRenderDate: moment.Moment | undefined
        if (
            this.props.repositoryData.firstDateTime === undefined ||
            this.props.repositoryData.lastDateTime === undefined
        ) {
            Error("リポジトリの開始時間・終了時間情報が初期化されていません。")
            return undefined
        }

        minutesDuration =
            this.props.repositoryData.lastDateTime.diff(
                this.props.repositoryData.firstDateTime,
                "minutes"
            ) + 1
        // 描画に用いるためにfirstDateTimeをClone
        nowRenderDate = moment(this.props.repositoryData.firstDateTime)
        const containerWidth = minuteBoxWidth * minutesDuration
        const containerStyle = {
            width: `${containerWidth}rem`,
        }

        let firstMinuteInHour = nowRenderDate.minute()
        let nowRenderMinute
        for (let i = 0; i < minutesDuration; i++) {
            nowRenderMinute = nowRenderDate.minute()
            if (i === minutesDuration - 1 || nowRenderMinute === 59) {
                hourBoxList.push(
                    this.renderBoxItem(
                        nowRenderDate.hour(),
                        i,
                        minuteBoxWidth * (nowRenderMinute + 1 - firstMinuteInHour)
                    )
                )
                firstMinuteInHour = 0
            }
            minuteBoxList.push(this.renderBoxItem(nowRenderMinute, i, minuteBoxWidth))
            nowRenderDate.add(1, "minutes")
        }

        return (
            <div style={containerStyle}>
                <div className={this.props.classes.boxContainer}>{hourBoxList}</div>
                <div className={this.props.classes.boxContainer}>
                    <ReactResizeDetector handleWidth onResize={this.onResize} />
                    {minuteBoxList}
                </div>
            </div>
        )
    }

    public render() {
        return <div className={this.props.classes.root}>{this.renderTimeAxis()}</div>
    }
}

export default withStyles(styles)(TimeAxis)
