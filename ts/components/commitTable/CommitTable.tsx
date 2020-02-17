import styled from "@emotion/styled"
import React from "react"
import SplitterLayout from "react-splitter-layout"
import "react-splitter-layout/lib/index.css"
import { Dispatch } from "redux"
import MainTableContainer from "../../containers/MainTableContainer"
import SpaceAxisContainer from "../../containers/SpaceAxisContainer"
import TimeAxisContainer from "../../containers/TimeAxisContainer"
import IState from "../../IState"
import IViewState from "../../states/IViewState"

const CommitTableSeparator = styled.div`
    flex: 0 0 auto;
    height: 1px;
    width: 100%;
    background-color: #ccc;
`

interface ITimeAxisMainTableSeparatorProps {
    width: number
}

const TimeAxisMainTableSeparator = styled.div<ITimeAxisMainTableSeparatorProps>`
    flex: 0 0 auto;
    height: 1px;
    width: ${(props: ITimeAxisMainTableSeparatorProps) => props.width}px;
    background-color: #ccc;
    min-width: 100%;
`

/*const CommitTableSpace = styled.div`
    height: 3.2rem;
`*/

const CommitTableSpace = styled.div`
    height: 1.6rem;
    text-align: center;
    border-right: 1px solid #7f7f7f;
    border-bottom: 1px solid #7f7f7f;
`

interface IProps {
    viewState: IViewState
    // tslint:disable-next-line:no-any
    dispatch: Dispatch<any>
}

class CommitTable extends React.Component<IProps> {
    private static readonly TIME_AXIS_WIDTH_PERCENTAGE = 85
    private static readonly PANE_MIN_WIDTH_PERCENTAGE = 5
    private renderCommitTableSpace = () => {
        return (
            <div>
                <CommitTableSpace>hour</CommitTableSpace>
                <CommitTableSpace>minute</CommitTableSpace>
            </div>
        )
    }
    public render() {
        return (
            <SplitterLayout
                customClassName="commit-table-splitter"
                percentage
                secondaryInitialSize={CommitTable.TIME_AXIS_WIDTH_PERCENTAGE}
                secondaryMinSize={CommitTable.PANE_MIN_WIDTH_PERCENTAGE}
                primaryMinSize={CommitTable.PANE_MIN_WIDTH_PERCENTAGE}
            >
                <div>
                    {/*<CommitTableSpace />*/}
                    {this.renderCommitTableSpace()}
                    <CommitTableSeparator />
                    <SpaceAxisContainer />
                </div>
                <div>
                    <TimeAxisContainer />
                    <TimeAxisMainTableSeparator width={this.props.viewState.timeAxisWidth} />
                    <MainTableContainer />
                </div>
            </SplitterLayout>
        )
    }
}

export default CommitTable
