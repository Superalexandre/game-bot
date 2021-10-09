//* Language 
import i18n from "i18n"

//* All clients
import { default as discordClient } from "./discord/index.js"
import { default as instaClient } from "./instagram/index.js"
//const InstaClient = require("./instagram/index")

//* Logger
import Logger from "./logger.js"
const logger = new Logger({
    mode: "compact",
    plateform: "Global"
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

    logDebugFn: function (message) {
        logger.log({ plateform: "i18n", message })
    },

    logWarnFn: function (message) {
        logger.warn({ plateform: "i18n", message })
    },
  
    logErrorFn: function (message) {
        logger.error({ plateform: "i18n", message })
    },
  
    missingKeyFn: function(locale, value) {
        logger.error({ plateform: "i18n", message: `MissingKey: La valeur ${value} est manquante dans la langue ${locale}` })

        i18n.setLocale(locale)
    
        return i18n.__("error.missingTranslation")
    },

    mustacheConfig: {
        tags: ["{{", "}}"],
        disable: false
    }
})

discordClient(data, functions).catch((err) => {
    logger.error({ plateform: "Discord", message: err })
})
instaClient(data, functions).catch((err) => {
    logger.error({ plateform: "Instagram", message: err })
})