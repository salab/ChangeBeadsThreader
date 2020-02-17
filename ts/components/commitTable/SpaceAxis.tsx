import { Divider } from "@material-ui/core"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemText from "@material-ui/core/ListItemText"
import { Theme } from "@material-ui/core/styles/createMuiTheme"
import createStyles from "@material-ui/core/styles/createStyles"
import withStyles, { WithStyles } from "@material-ui/core/styles/withStyles"
import React from "react"
import { Dispatch } from "redux"
import ClassIcon from "../../../resource/svg/classIcon.svg"
import MethodIcon from "../../../resource/svg/methodIcon.svg"
import IClass from "../../states/IClass"
import IMethod, { getMethodDataList, IMethodData } from "../../states/IMethod"

const styles = (theme: Theme) =>
    createStyles({
        root: {
            width: "100%",
        },
        nestedList: {
            paddingTop: "0rem",
            paddingBottom: "0rem",
        },
        nestedItem: {
            // tslint:disable-next-line:no-magic-numbers
            paddingLeft: theme.spacing(2),
        },
        notNestedItem: {
            paddingLeft: "0.5rem",
        },
        allListItem: {
            paddingTop: "0.1rem",
            paddingBottom: "0.1rem",
            paddingRight: "0.1rem",
            height: "1.2rem",
        },
        icons: {
            // tslint:disable-next-line:no-magic-numbers
            fontSize: theme.typography.fontSize * 1.4,
        },
        listItemIcon: {
            marginRight: "0.2rem",
            minWidth: "0rem",
        },
        listItemText: {
            paddingRight: "0.1rem",
            paddingLeft: "0.3rem",
            whiteSpace: "nowrap",
        },
        iconWrapper: {
            minWidth: "1rem",
            width: "1rem",
        },
    })

interface IProps extends WithStyles<typeof styles> {
    classData: IClass
    methodData: IMethod
    // tslint:disable-next-line:no-any
    dispatch: Dispatch<any>
}

class SpaceAxis extends React.Component<IProps> {
    public renderMethod = (methodList: IMethodData[], className: string) => {
        return methodList.map(methodData => (
            <div key={`${className}/${methodData.methodName}`}>
                <ListItem
                    className={`${this.props.classes.nestedItem} ${this.props.classes.allListItem}`}
                >
                    <div className={this.props.classes.iconWrapper}>
                        <MethodIcon width={"1rem"} height={"1rem"} />
                    </div>
                    <ListItemText
                        className={this.props.classes.listItemText}
                        inset
                        primary={methodData.methodName}
                    />
                </ListItem>
                <Divider />
            </div>
        ))
    }

    public renderClass = () => {
        return Object.values(this.props.classData.byId).map(classData => (
            <div key={`${classData.className}-div`}>
                <ListItem
                    className={`${this.props.classes.notNestedItem} ${this.props.classes.allListItem}`}
                >
                    <div className={this.props.classes.iconWrapper}>
                        <ClassIcon width={"1rem"} height={"1rem"} />
                    </div>
                    <ListItemText
                        inset
                        primary={classData.className}
                        className={this.props.classes.listItemText}
                    />
                </ListItem>
                <Divider />
                <List className={this.props.classes.nestedList}>
                    {this.renderMethod(
                        getMethodDataList(this.props.methodData, classData.methods),
                        classData.className
                    )}
                </List>
            </div>
        ))
    }

    public render() {
        return (
            <List className={this.props.classes.root} component="nav">
                {this.renderClass()}
            </List>
        )
    }

    constructor(props: IProps) {
        super(props)
    }
}

export default withStyles(styles)(SpaceAxis)
