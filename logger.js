import DateFns from "date-fns-tz"
import { fr } from "date-fns/locale/index.js"
import chalk from "chalk"
import * as Sentry from "@sentry/node"

export default class Logger {
    constructor(param) {
        this.mode = param?.mode || "compact"
        this.plateform = param?.plateform || "Unknown"
    }

    log({ message }) {
        if (this.mode === "compact") {
            console.log(`[${formateDate(Date.now(), this.mode)}] ${getColorPlateform(this.plateform)} ${chalk.bgGreen("[LOG]")} ${message}`)
        }
    }

    error({ message }) {
        Sentry.captureException(message)

        if (this.mode === "compact") {
            console.log(`[${formateDate(Date.now(), this.mode)}] ${getColorPlateform(this.plateform)} ${chalk.bgRed("[ERROR]")} ${message}`)
        }
    }

    warn({ message }) {
        Sentry.captureMessage(message)

        if (this.mode === "compact") {
            console.log(`[${formateDate(Date.now(), this.mode)}] ${getColorPlateform(this.plateform)} ${chalk.bgYellow("[WARN]")} ${message}`)
        }
    }

    commandLog({ interaction, command }) {
        if (this.mode === "compact") {
            console.log(`[${formateDate(Date.now(), this.mode)}] ${getColorPlateform(this.plateform)} ${chalk.bgBlue("[LOG - COMMAND]")} /${command.help.name} (INTERACT ID : ${interaction.id})`)
        }
    }
}

function getColorPlateform(plateform) {
    if (plateform === "Discord") return chalk.bgMagenta("[Discord]")

    if (plateform === "Instagram") return chalk.bgMagentaBright("[Instagram]")

    return chalk.magenta("[Unknown plateform]")
}

function formateDate(date = Date.now(), type) {
    const dateZonedTime = DateFns.utcToZonedTime(date, "Europe/Paris")

    const formatDate = type === "compact" ? "dd'/'MM'/'yy pp" : "EEEE dd LLLL yyyy 'à' pp"

    return DateFns.format(dateZonedTime, formatDate, {
        timeZone: "Europe/Paris",
        locale: fr
    })
}