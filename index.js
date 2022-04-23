//* Language 
import i18n from "i18n"

//* All clients
import { default as discordClient } from "./discord/index.js"
import { default as instaClient } from "./instagram/index.js"
import { default as dashboardInit } from "./dashboard/app.js"

import { join, dirname } from "path"
import config from "./config.js"

import { fileURLToPath } from "url"
const __dirname = dirname(fileURLToPath(import.meta.url))

// import * as Sentry from "@sentry/node"
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

// Sentry.init({
//     dsn: config.sentry.dsn,
//     release: "game-bot@1.0.0",
//     tracesSampleRate: 1.0
// })

//* Config languages
i18n.configure({
    locales: ["fr-FR", "en-GB", "de-DE", "es-ES"],
    directory: join(__dirname, "locales"),
    defaultLocale: config.defaultLocale,
    retryInDefaultLocale: true,
    objectNotation: true,
    register: global,

    logDebugFn: function(message) {
        logger.log(message, {plateform: "i18n" })
    },

    logWarnFn: function(message) {
        logger.warn(message, { plateform: "i18n" })
    },
  
    logErrorFn: function(message) {
        logger.error(message, { plateform: "i18n" })
    },
  
    missingKeyFn: function(locale, value) {
        logger.error(`MissingKey: La valeur ${value} est manquante dans la langue ${locale}`, { plateform: "i18n" })
    
        return value
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
        try {
            const result = await discordClient({ data })

            clients.discord = result
        } catch (error) {
            logger.error(error, { plateform: "discord" })
        }
    } else logger.warn("Le bot discord n'est pas lancé", { plateform: "Discord" })

    if (config.instagram.start) {
        try {
            const result = await instaClient({ data })

            clients.insta = result
        } catch (error) {
            logger.error(error, { plateform: "instagram" })
        }
    } else logger.warn("Le bot instagram n'est pas lancé", { plateform: "Instagram" })

    if (config.dashboard.start) {
        await dashboardInit({ data, clients })
    } else logger.warn("Le dashboard n'est pas lancé", { plateform: "Dashboard" })
}

init()

process.on("uncaughtException", (error) => {
    return logger.error(error)
})

process.on("unhandledRejection", (error) => {
    return logger.error(error)
})