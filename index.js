//* Language 
import i18n from "i18n"

//* All clients
import { default as discordClient } from "./discord/index.js"
import { default as instaClient } from "./instagram/index.js"

import { join } from "path"
import config from "./config.js"

import { dirname } from "path"
import { fileURLToPath } from "url"
const __dirname = dirname(fileURLToPath(import.meta.url))

import * as Sentry from "@sentry/node"
import Logger from "./logger.js"

import Enmap from "enmap"

const logger = new Logger({
    mode: "compact",
    plateform: "Global"
})

const data = {
    users: new Enmap({ name: "users" }),
    discord: {
        bot: new Enmap({ name: "discordBot" })
    }
}

/*
enmap.changed((keyName, oldValue, newValue) => {  
    console.log(`Value of ${keyName} has changed from: \n${oldValue}\nto\n${newValue}`);
});
*/

Sentry.init({
    dsn: config.sentry.dsn,
    release: "game-bot@1.0.0",
    tracesSampleRate: 1.0
})

console.log(Sentry)

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

discordClient(data)
instaClient(data)

process.on("uncaughtException", (error) => {
    return logger.error({ message: error })
})

process.on("unhandledRejection", (reason) => {
    return logger.error({ message: reason })
})