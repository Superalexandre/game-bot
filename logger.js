import DateFns from "date-fns-tz"
import { fr } from "date-fns/locale/index.js"
import chalk from "chalk"
import * as Sentry from "@sentry/node"

export default class Logger {
    constructor(param) {
        this.mode = param?.mode || "compact"
        this.plateform = param?.plateform || "Unknown"
    }

    log({ message, plateform }) {
        if (this.mode === "compact") {
            console.log(`[${formateDate(Date.now(), this.mode)}] ${chalk.bgGreen("[LOG]")} ${getColorPlateform(plateform ?? this.plateform)} ${message}`)
        }
    }

    error({ message, plateform }) {
        Sentry.captureException(message)

        if (this.mode === "compact") {
            console.log(`[${formateDate(Date.now(), this.mode)}] ${chalk.bgRed("[ERROR]")} ${getColorPlateform(plateform ?? this.plateform)} ${message}`)
        }
    }

    warn({ message, plateform, trace }) {
        if (trace) Sentry.captureMessage(message)

        if (this.mode === "compact") {
            console.log(`[${formateDate(Date.now(), this.mode)}] ${chalk.bgYellow("[WARN]")} ${getColorPlateform(plateform ?? this.plateform)} ${message}`)
        }
    }

    commandLog({ interactionId, commandName, prefix, plateform }) {
        if (this.mode === "compact") {
            console.log(`[${formateDate(Date.now(), this.mode)}] ${chalk.bgBlue("[LOG - COMMAND]")} ${getColorPlateform(plateform ?? this.plateform)} ${prefix ?? "!"}${commandName} (INTERACT ID : ${interactionId})`)
        }
    }
}

function getColorPlateform(plateform) {
    if (plateform === "Dashboard") return chalk.bgBlueBright("[Dashboard]")

    if (plateform === "Discord") return chalk.bgMagenta("[Discord]")

    if (plateform === "Instagram") return chalk.bgMagentaBright("[Instagram]")

    if (["Global", "i18n", "Enmap"].includes(plateform)) return chalk.bgBlackBright(`[${plateform}]`)

    return chalk.red("[Unknown plateform]")
}

function formateDate(date = Date.now(), type) {
    const dateZonedTime = DateFns.utcToZonedTime(date, "Europe/Paris")

    const formatDate = type === "compact" ? "dd'/'MM'/'yy pp" : "EEEE dd LLLL yyyy 'à' pp"

    return DateFns.format(dateZonedTime, formatDate, {
        timeZone: "Europe/Paris",
        locale: fr
    })
}