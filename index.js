//* Language 
import i18n from "i18n"

//* All clients
import load from "./discord/index.js"
//const InstaClient = require("./instagram/index")

//* Logger
import Logger from "./logger.js"
const logger = new Logger({
    mode: "compact",
    plateform: "Discord"
})

//* Database
import Enmap from "enmap"

const data = {
    users: new Enmap({ name: "users" }),
    discord: {
        bot: new Enmap({ name: "discordBot" })
    }
}

//* Util 
import { join } from "path"
import functions from "./functions.js"
import config from "./config.js"

//* Dirname
import { dirname } from "path"
import { fileURLToPath } from "url"
const __dirname = dirname(fileURLToPath(import.meta.url))

//* Import errors
import * as Sentry from "@sentry/node"

Sentry.init({
    dsn: config.sentry.dsn,
    tracesSampleRate: 1.0
})

//* Config languages
i18n.configure({
    locales: ["fr_FR"],
    directory: join(__dirname, "locales"),
    defaultLocale: config.defaultLocale,
    objectNotation: true,
    register: global,
    syncFiles: true,

    logWarnFn: function (msg) {
        logger.warn({ message: "i18n warn " + msg })
    },
  
    logErrorFn: function (msg) {
        logger.error({ message: "i18n error " + msg })
    },
  
    missingKeyFn: function(locale, value) {
        logger.error({ message: `MissingKey: La valeur ${value} est manquante dans la langue ${locale}` })

        i18n.setLocale(locale)
    
        return i18n.__("error.missingTranslation")
    },

    mustacheConfig: {
        tags: ["{{", "}}"],
        disable: false
    }
})

load(data, functions, logger)