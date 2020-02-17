import CssBaseline from "@material-ui/core/CssBaseline"
import { MuiThemeProvider } from "@material-ui/core/styles"
import React from "react"
import ReactDom from "react-dom"
import { Provider } from "react-redux"
// tslint:disable-next-line:no-import-side-effect
import "../scss/index.scss"
import MainContainerContainer from "./containers/MainContainerContainer"
import { buildStore } from "./Store"
import { theme } from "./Theme"

const container = document.getElementById("contents")

ReactDom.render(
    <MuiThemeProvider theme={theme}>
        {/* CssBaselineを挿入しなければThemeのbackground属性が反映されない */}
        <CssBaseline>
            <Provider store={buildStore()}>
                <MainContainerContainer />
            </Provider>
        </CssBaseline>
    </MuiThemeProvider>,
    container
)
