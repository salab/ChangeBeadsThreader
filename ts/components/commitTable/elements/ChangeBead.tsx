import styled from "@emotion/styled"
import { PositionProperty } from "csstype"
import React from "react"
import { createSelectable, TSelectableItemProps } from "react-selectable-fast"

export interface ISelectableChangeBeadProps
    extends TSelectableItemProps,
        IChangeBeadProps,
        IChangeBeadRootProps {}

interface IChangeBeadProps {
    width: number
    background: string
    isBeadSelected: boolean
    isSelecting: boolean
    isLoading: boolean
}

interface IChangeBeadRootProps {
    commitId: number
}

const ChangeBeadsRoot = styled.div<IChangeBeadRootProps>`
    position: absolute;
`

class SelectableChangeBead extends React.Component<ISelectableChangeBeadProps> {
    public render() {
        const { selectableRef, isSelected, isSelecting } = this.props

        return (
            <ChangeBeadsRoot ref={selectableRef} commitId={this.props.commitId}>
                <ChangeBead
                    className="change-bead"
                    width={this.props.width}
                    background={this.props.background}
                    isBeadSelected={this.props.isBeadSelected}
                    isSelecting={isSelecting}
                    isLoading={this.props.isLoading}
                />
            </ChangeBeadsRoot>
        )
    }
}

const ChangeBead = styled.div<IChangeBeadProps>`
    width: ${(props: IChangeBeadProps) => `${props.width}rem`};
    background: ${(props: IChangeBeadProps) => `${props.background}`};
    border: ${(props: IChangeBeadProps) => (props.isBeadSelected ? `inset 3px #bbbbbb` : "")};
    opacity: ${(props: IChangeBeadProps) => (props.isSelecting ? "0.7" : "")};
    height: 1rem;
    margin-top: 0.1rem;
    border-radius: 0.3rem;
    &:hover {
        opacity: ${(props: IChangeBeadProps) => (props.isLoading ? "inherit" : "0.7")};
        cursor: ${(props: IChangeBeadProps) => (props.isLoading ? "inherit" : "pointer")};
    }
`

export default createSelectable(SelectableChangeBead)
