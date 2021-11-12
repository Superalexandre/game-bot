//* Language 
import i18n from "i18n"

//* All clients
import { default as discordClient } from "./discord/index.js"
import { default as instaClient } from "./instagram/index.js"
import { default as dashboardInit } from "./dashboard/app.js"

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
    games: new Enmap({ name: "games" }),
    discord: {
        bot: new Enmap({ name: "discordBot" })
    }
}

Sentry.init({
    dsn: config.sentry.dsn,
    release: "game-bot@1.0.0",
    tracesSampleRate: 1.0
})

//* Config languages
i18n.configure({
    locales: ["fr-FR", "en-GB", "de-DE"],
    directory: join(__dirname, "locales"),
    defaultLocale: config.defaultLocale,
    retryInDefaultLocale: true,
    objectNotation: true,
    register: global,
    syncFiles: true,

    logDebugFn: function (message) {
        logger.log({ plateform: "i18n", message })
    },

    logWarnFn: function (message) {
        logger.warn({ plateform: "i18n", message, trace: true })
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

async function init() {
    const clients = {
        discord: null,
        insta: null
    }

    if (config.discord.start) {
        const result = await discordClient({ data })

        clients.discord = result
    } else logger.warn({ plateform: "Discord", message: "Le bot discord n'est pas lancé" })

    if (config.instagram.start) {
        const result = await instaClient({ data })

        clients.insta = result
    } else logger.warn({ plateform: "Instagram", message: "Le bot instagram n'est pas lancé" })

    if (config.dashboard.start) {
        await dashboardInit({ data, clients })
    } else logger.warn({ plateform: "Dashboard", message: "Le dashboard n'est pas lancé" })
}

init()

process.on("uncaughtException", (error) => {
    return logger.error({ message: error })
})

process.on("unhandledRejection", (error) => {
    return logger.error({ message: error })
})