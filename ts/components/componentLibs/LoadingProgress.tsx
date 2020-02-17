import { Theme, WithStyles } from "@material-ui/core"
import CircularProgress from "@material-ui/core/CircularProgress"
import createStyles from "@material-ui/core/styles/createStyles"
import withStyles from "@material-ui/core/styles/withStyles"
import React from "react"
import { Dispatch } from "redux"

const styles = (theme: Theme) =>
    createStyles({
        progressContainer: {
            position: "absolute",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            width: "100%",
        },
        progress: {
            zIndex: 99,
        },
    })

interface IProps extends WithStyles<typeof styles> {}

class LoadingProgress extends React.Component<IProps> {
    public render() {
        return (
            <div className={this.props.classes.progressContainer}>
                <CircularProgress className={this.props.classes.progress} color="secondary" />
            </div>
        )
    }
}

export default withStyles(styles)(LoadingProgress)
