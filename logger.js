//const colors = require("colors"),
//    { formateDate } = require("./discord/utils/functions"),
//    logUpdate = require("log-update")

import * as Sentry from "@sentry/node"
export default class Logger {
    constructor(mode) {
        this.mode = mode
    }

    log({ message }) {
        return console.log(message)
    }

    error({ message }) {
        Sentry.captureException(log)

        return console.error(message)
    }

    warn({ message }) {
        return console.warn(message)
    }

    commandLog({ message }) {
        return console.log(message)
    }
}