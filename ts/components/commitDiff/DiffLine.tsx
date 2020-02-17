import styled from "@emotion/styled"

export interface IDiffLineProps {
    background: string
}

interface IDiffLineColorProps {
    background: string
    colored: boolean
    isLoading: boolean
}

const DiffLine = styled.pre<IDiffLineProps>`
    background: ${(props: IDiffLineProps) => `${props.background}`};
    margin: 0;
    font-family: "migu1M";
    font-size: 0.8rem;
    line-height: 1.4;
    height: 1.1rem;
    width: 100%;
`

export const DiffLineNum = styled.div<IDiffLineProps>`
    background: ${(props: IDiffLineProps) => `${props.background}`};
    height: 1.1rem;
    width: 2rem;
    min-width: 2rem;
    color: gainsboro;
`

export const DiffLineSign = styled.div<IDiffLineProps>`
    background: ${(props: IDiffLineProps) => `${props.background}`};
    height: 1.1rem;
    width: 1rem;
    min-width: 1rem;
    color: gainsboro;
    border-right: solid gray 1px;
`

export const DiffLineColor = styled.div<IDiffLineColorProps>`
    background: ${(props: IDiffLineColorProps) => `${props.background}`};
    height: 1.1rem;
    width: 1.1rem;
    min-width: 1.1rem;
    color: gainsboro;
    border-right: solid gray 1px;
    &:hover {
        opacity: ${(props: IDiffLineColorProps) =>
            props.colored && !props.isLoading ? "0.7" : "inherit"};
        cursor: ${(props: IDiffLineColorProps) =>
            props.colored && !props.isLoading ? "pointer" : "inherit"};
    }
`

export default DiffLine
