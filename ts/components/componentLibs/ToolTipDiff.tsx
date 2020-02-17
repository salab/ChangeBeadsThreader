import styled from "@emotion/styled"
import { IDiffLineProps } from "../commitDiff/DiffLine"

export const ToolTipDiffLine = styled.pre<IDiffLineProps>`
    background: ${(props: IDiffLineProps) => `${props.background}`};
    margin: 0;
    font-family: "migu1M";
    font-size: 0.7rem;
    line-height: 1.4;
    height: 1.1rem;
    width: 100%;
`

export const ToolTipDiffLineNum = styled.div<IDiffLineProps>`
    background: ${(props: IDiffLineProps) => `${props.background}`};
    height: 1.1rem;
    width: 1.3rem;
    min-width: 1.3rem;
    color: gainsboro;
`

export const ToolTipDiffLineSign = styled.div<IDiffLineProps>`
    background: ${(props: IDiffLineProps) => `${props.background}`};
    height: 1.1rem;
    width: 0.9rem;
    min-width: 0.9rem;
    color: gainsboro;
    border-right: solid gray 1px;
`
