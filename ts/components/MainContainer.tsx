import styled from "@emotion/styled"
import React from "react"
import ReactResizeDetector from "react-resize-detector"
import SplitterLayout from "react-splitter-layout"
import "react-splitter-layout/lib/index.css"
import { Dispatch } from "redux"
import { changeDiffViewHeight } from "../actions/Actions"
import ButtonListContainer from "../containers/ButtonListContainer"
import CommitListContainer from "../containers/CommitListContainer"
import CommitTableContainer from "../containers/CommitTableContainer"
import DiffViewContainer from "../containers/DiffViewContainer"
import ISettings from "../states/ISettings"

const CommitWrapper = styled.div`
    flex: 1;
    display: flex;
    border-top: 2px solid #999999;
    position: relative;
`

const RootContainer = styled.div`
    color: white;
    font-family: "NotoSansThin";
    margin: 0px;
    height: 100%;
    display: flex;
    flex-direction: column;
`

const Container = styled.div`
    height: 100%;
`

interface IProps {
    settings: ISettings
    // tslint:disable-next-line:no-any
    dispatch: Dispatch<any>
}

class MainContainer extends React.Component<IProps> {
    public onDiffHeightChange = (width: number, height: number) => {
        this.props.dispatch(changeDiffViewHeight(height))
    }

    public renderMainView() {
        const CommitListContainerHeightPercentage = 40
        const CommitDiffContainerWidthPercentage = 70
        const PaneMinHeightPercentage = 10
        const PaneMinWidthPercentage = 10
        /*
        react-splitter-layoutプラグインを利用して画面分割とリサイズを実装
        参考URL：https://github.com/zesik/react-splitter-layout
        */
        return (
            <RootContainer>
                <ButtonListContainer />
                <CommitWrapper>
                    <SplitterLayout
                        // containerがウィンドウ幅をはみ出すのを防ぐためpositionをfixedに上書き
                        customClassName="main-container-splitter"
                        vertical
                        percentage
                        secondaryInitialSize={CommitListContainerHeightPercentage}
                        secondaryMinSize={PaneMinHeightPercentage}
                        primaryMinSize={PaneMinHeightPercentage}
                    >
                        <CommitTableContainer />
                        {/* tslint:disable-next-line:prettier */}
                        <div style={{height: "100%"}}>
                            <SplitterLayout
                                // containerがウィンドウ幅をはみ出すのを防ぐためpositionをfixedに上書き
                                customClassName="main-container-splitter"
                                percentage
                                secondaryInitialSize={CommitDiffContainerWidthPercentage}
                                primaryMinSize={PaneMinWidthPercentage}
                                secondaryMinSize={PaneMinWidthPercentage}
                            >
                                <CommitListContainer />
                                <DiffViewContainer />
                            </SplitterLayout>
                            <ReactResizeDetector handleHeight onResize={this.onDiffHeightChange} />
                        </div>
                    </SplitterLayout>
                </CommitWrapper>
            </RootContainer>
        )
    }

    public render() {
        // experimentModeが起動している場合評価実験用の比較用ListViewに差し替える
        return <Container>{this.renderMainView()}</Container>
    }
}

export default MainContainer
