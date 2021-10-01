//const colors = require("colors"),
//    { formateDate } = require("./discord/utils/functions"),
//    logUpdate = require("log-update")

//import colors from "colors"
import DateFns from "date-fns-tz"
import { fr } from "date-fns/locale/index.js"

import * as Sentry from "@sentry/node"
export default class Logger {
    constructor(mode) {
        this.mode = mode
    }

    log({ message }) {
        if (this.mode === "compact") {
            console.log(`[${formateDate(Date.now(), this.mode)}] [LOG] ${message}`)
        }
    }

    error({ message }) {
        Sentry.captureException(message)

        if (this.mode === "compact") {
            return console.log(`[${formateDate(Date.now(), this.mode)}] [ERROR] ${message}`)
        }
    }

    warn({ message }) {
        Sentry.captureMessage(message)

        if (this.mode === "compact") {
            return console.log(`[${formateDate(Date.now(), this.mode)}] [WARN] ${message}`)
        }
    }

    commandLog({ message }) {
        if (this.mode === "compact") {
            return console.log(`[${formateDate(Date.now(), this.mode)}] [LOG] ${message}`)
        }
    }
}

function formateDate(date = Date.now(), type) {
    const dateZonedTime = DateFns.utcToZonedTime(date, "Europe/Paris")

    const formatDate = type === "compact" ? "dd'/'MM'/'yy pp" : "EEEE dd LLLL yyyy 'à' pp"

    return DateFns.format(dateZonedTime, formatDate, {
        timeZone: "Europe/Paris",
        locale: fr
    })
}