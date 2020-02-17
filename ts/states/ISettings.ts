import TOML from "@iarna/toml"
import { remote } from "electron"
import ElectronStore from "electron-store"
import * as fs from "fs"
import moment from "moment"
import * as path from "path"
import {
    CLUSTER_THRESHOLD,
    CONFIG_FILE_NAME,
    WEIGHT_CLASS_DISTANCE,
    WEIGHT_METHOD_DISTANCE,
    WEIGHT_NUMBER_OF_COMMIT_DISTANCE,
    WEIGHT_TIME_DISTANCE,
} from "../const"

export default interface ISettings {
    timestamp: number
    settingForUntangling: ISettingForUntangling
    outputLogFile: boolean
}

export interface ISettingForUntangling {
    timeDistance: number
    numberOfCommitDistance: number
    classDistance: number
    methodDistance: number
    clusterThreshold: number
}

export class Settings implements ISettings {
    public timestamp = moment().valueOf()
    public settingForUntangling: ISettingForUntangling
    public outputLogFile: boolean

    constructor() {
        const store = createStore()

        const configPath = path.join(remote.app.getPath("userData"), CONFIG_FILE_NAME)
        if (!fs.existsSync(configPath)) {
            writeDefaultConfigValue(store)
        }
        this.outputLogFile = String(store.get("outputLogFile", false)).toLowerCase() === "true"
        this.settingForUntangling = new SettingForUntangling()
    }
}

export class SettingForUntangling implements ISettingForUntangling {
    public timeDistance: number
    public numberOfCommitDistance: number
    public classDistance: number
    public methodDistance: number
    public clusterThreshold: number
    constructor() {
        const store = createStore()
        this.timeDistance = Number(store.get("timeDistance", WEIGHT_TIME_DISTANCE))
        this.numberOfCommitDistance = Number(
            store.get("numberOfCommitDistance", WEIGHT_NUMBER_OF_COMMIT_DISTANCE)
        )
        this.classDistance = Number(store.get("classDistance", WEIGHT_CLASS_DISTANCE))
        this.methodDistance = Number(store.get("methodDistance", WEIGHT_METHOD_DISTANCE))
        this.clusterThreshold = Number(store.get("clusterThreshold", CLUSTER_THRESHOLD))
    }
}

const writeDefaultConfigValue = (store: ElectronStore) => {
    store.set("outputLogFile", false)

    store.set("timeDistance", WEIGHT_TIME_DISTANCE)
    store.set("numberOfCommitDistance", WEIGHT_NUMBER_OF_COMMIT_DISTANCE)
    store.set("classDistance", WEIGHT_CLASS_DISTANCE)
    store.set("methodDistance", WEIGHT_METHOD_DISTANCE)
    store.set("clusterThreshold", CLUSTER_THRESHOLD)
}

const createStore = () => {
    return new ElectronStore({
        fileExtension: "toml",
        serialize: TOML.stringify,
        deserialize: TOML.parse,
    })
}
