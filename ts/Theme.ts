import { createMuiTheme } from "@material-ui/core/styles"

export const theme = createMuiTheme({
    palette: {
        type: "dark",
    },
    typography: {
        fontFamily: [
            "Noto Sans Thin",
            "Yu Gothic",
            "-apple-system",
            "BlinkMacSystemFont",
            '"Segoe UI"',
            "Roboto",
            '"Helvetica Neue"',
            "Arial",
            "sans-serif",
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"',
        ].join(","),
        fontSize: 14,
    },
})
