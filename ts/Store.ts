import { AnyAction, applyMiddleware, combineReducers, createStore, Middleware } from "redux"
import { composeWithDevTools } from "redux-devtools-extension"
import { createLogger } from "redux-logger"
import { reducer } from "./reducers/Reducers"

const asyncDispatchMiddleware: Middleware = store => next => action => {
    let syncActivityFinished = false
    let actionQueue: AnyAction[] = []

    const flushQueue = () => {
        actionQueue.forEach(a => store.dispatch(a)) // flush queue
        actionQueue = []
    }

    const asyncDispatch = (asyncAction: AnyAction) => {
        actionQueue = actionQueue.concat([asyncAction])

        if (syncActivityFinished) {
            flushQueue()
        }
    }

    const actionWithAsyncDispatch = { ...action, asyncDispatch }

    const res = next(actionWithAsyncDispatch)

    syncActivityFinished = true
    flushQueue()

    return res
}

const logger = createLogger({
    diff: true,
    collapsed: true,
})

const composeEnhancers = composeWithDevTools(applyMiddleware(logger, asyncDispatchMiddleware))

export const buildStore = () =>
    process.env.NODE_ENV === "production"
        ? createStore(reducer, applyMiddleware(asyncDispatchMiddleware))
        : createStore(reducer, composeEnhancers)
