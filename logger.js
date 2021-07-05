//const colors = require("colors"),
//    { formateDate } = require("./discord/utils/functions"),
//    logUpdate = require("log-update")

module.exports = class Logger {
    constructor(mode) {
        this.mode = mode
    }

    log({ message }) {
        return console.log(message)
    }

    error({ message }) {
        return console.error(message)
    }

    warn({ message }) {
        return console.warn(message)
    }

    commandLog({ message }) {
        return console.log(message)
    }
}