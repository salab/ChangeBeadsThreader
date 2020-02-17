import moment from "moment"

export interface IDummyCommit {
    commitHash: string
    editTime: moment.Moment
    editFilePath: string
    editClass: string
    editMethod: string
    message: string
}

export const dummyCommitState: IDummyCommit[] = [
    {
        commitHash: "",
        editTime: moment("2019-04-19 10:10:10.000"),
        editFilePath: "dir1/TestA",
        editClass: "TestA.java",
        editMethod: "foo",
        message: "message",
    },
    {
        commitHash: "",
        editTime: moment("2019-04-19 10:10:20.000"),
        editFilePath: "dir1/TestA",
        editClass: "TestA.java",
        editMethod: "foo",
        message: "message",
    },
    {
        commitHash: "",
        editTime: moment("2019-04-19 10:10:25.000"),
        editFilePath: "dir1/TestA",
        editClass: "TestA.java",
        editMethod: "bar",
        message: "message",
    },
    {
        commitHash: "",
        editTime: moment("2019-04-19 10:10:30.000"),
        editFilePath: "dir1/TestA",
        editClass: "TestA.java",
        editMethod: "foo",
        message: "message",
    },
    {
        commitHash: "",
        editTime: moment("2019-04-19 10:10:40.000"),
        editFilePath: "dir1/TestA",
        editClass: "TestA.java",
        editMethod: "bar",
        message: "message",
    },
    {
        commitHash: "",
        editTime: moment("2019-04-19 10:15:00.000"),
        editFilePath: "dir1/TestA",
        editClass: "TestA.java",
        editMethod: "foo",
        message: "message",
    },
    {
        commitHash: "",
        editTime: moment("2019-04-19 10:15:20.000"),
        editFilePath: "dir1/TestB",
        editClass: "TestB.java",
        editMethod: "hoge",
        message: "message",
    },
    {
        commitHash: "",
        editTime: moment("2019-04-19 10:20:20.000"),
        editFilePath: "dir1/TestB",
        editClass: "TestB.java",
        editMethod: "hoge",
        message: "message",
    },
    {
        commitHash: "",
        editTime: moment("2019-04-19 10:20:50.000"),
        editFilePath: "dir1/TestB",
        editClass: "TestB.java",
        editMethod: "fuge",
        message: "message",
    },
    {
        commitHash: "",
        editTime: moment("2019-04-19 10:22:20.000"),
        editFilePath: "dir1/TestB",
        editClass: "TestB.java",
        editMethod: "hoge",
        message: "message",
    },
    {
        commitHash: "",
        editTime: moment("2019-04-19 10:23:20.000"),
        editFilePath: "dir1/TestB",
        editClass: "TestB.java",
        editMethod: "hoge",
        message: "message",
    },
]
