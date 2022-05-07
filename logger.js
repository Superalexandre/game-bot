import { formatDate } from "./functions.js"
import chalk from "chalk"

export default class Logger {
    constructor(params) {
        this.params = params
        this.plateform = params?.plateform || "Unknown"
    }

    /**
     * @description Log a message
     * 
     * @param {String} message - The message to log
     * @param {Number} group - The id of the group
     * @param {Boolean} sendAfter - If you need to send
     * @param {...any} args - The args to log
     *
     * @return
     */   
    async log(message, ...args) {
        if (!message) return

        const findedArgs = findArgs(["plateform"], ...args)
        args = findedArgs.args

        const plateform = findedArgs.toReturn.plateform ?? this.plateform

        console.log(`[${formatDate()}]${chalk.bgGreen("[LOG]")}${getColorPlateform(plateform)} ${message}`, ...args)
    
        return { message, args, logged: true }
    }
    
    /**
     * @description Log a message as info
     * 
     * @param {String} message - The message to log
     * @param {...any} args - The args to log
     *
     * @return
     */  
    async info(message, ...args) {
        if (!message) return

        const findedArgs = findArgs(["plateform"], ...args)
        args = findedArgs.args

        const plateform = findedArgs.toReturn.plateform ?? this.plateform

        console.log(`[${formatDate()}]${chalk.bgBlue("[INFO]")}${getColorPlateform(plateform)} ${message}`, ...args)

        return { message, args, logged: true }
    }

    /**
     * @description Log a message as warning
     * 
     * @param {String} message - The message to log
     * @param {...any} args - The args to log
     *
     * @return
     */  
    async warn(message, ...args) {
        if (!message) return
                     
        const findedArgs = findArgs(["plateform"], ...args)
        args = findedArgs.args

        const plateform = findedArgs.toReturn.plateform ?? this.plateform

        console.log(`[${formatDate()}]${chalk.bgYellow("[WARN]")}${getColorPlateform(plateform)} ${message}`, ...args)
    
        return { message, args, logged: true }
    }

    /**
     * @description Log a message as error
     * 
     * @param {String} error - The message to log
     * @param {Boolean} trace - If you need to trace the error
     * @param {...any} args - The args to log
     * 
     * @return
     */
    async error(error, ...args) {
        if (!error) return
     
        const findedArgs = findArgs(["trace", "plateform", "fromFunction"], ...args)
        args = findedArgs.args

        const trace = findedArgs.toReturn.trace ?? false
        const fromFunction = findedArgs.toReturn.fromFunction ?? false
        const plateform = findedArgs.toReturn.plateform ?? this.plateform

        console.log(`[${formatDate()}]${chalk.bgRed(`[ERROR]`)}${chalk.bgMagenta(`${fromFunction ? `[${fromFunction}]` : ""}`)}${getColorPlateform(plateform)} ${error.toString()}`, ...args)

        if (trace) console.log(error)
    
        return { error, args, logged: true }
    }

    async commandLog(message, ...args) {
        if (!message) return

        const { args: argsResult, toReturn } = findArgs(["plateform", "prefix"], ...args)
        args = argsResult

        const plateform = toReturn.plateform ?? this.plateform
        const prefix = toReturn.prefix ?? "!"

        console.log(`[${formatDate()}]${chalk.bgBlue("[LOG - COMMAND]")}${getColorPlateform(plateform)} ${prefix}${message}`)
    
        return { logged: true }
    }
}

function getColorPlateform(plateform) {
    if (plateform === "Dashboard") return chalk.bgBlueBright("[Dashboard]")

    if (plateform === "Discord") return chalk.bgMagenta("[Discord]")

    if (plateform === "Instagram") return chalk.bgMagentaBright("[Instagram]")

    if (["Global", "i18n", "Enmap"].includes(plateform)) return chalk.bgBlackBright(`[${plateform}]`)

    return chalk.red("[Unknown plateform]")
}

function findArgs(toCatch = [], ...args) {
    let toReturn = {}

    for (let i = 0; i < args.length; i++) {
        const arg = args[i]

        if (typeof arg === "object") {
            for (let key in arg) {
                if (toCatch.includes(key)) {
                    toReturn[key] = arg[key]
                    args = args.filter(ar => ar !== arg)
                }
            }
        }
    }

    return { args, toReturn }
}