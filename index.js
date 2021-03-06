//* Language 
import i18n from "i18n"

//* All clients
import { default as discordClient } from "./discord/index.js"
import { default as instaClient } from "./instagram/index.js"
import { default as dashboardInit } from "./dashboard/app.js"

import config from "./config.js"


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
    sync: new Enmap({ name: "sync" }),
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
i18n.configure(config.locale(logger))

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
            await logger.error(error, { plateform: "discord" })
        }
    } else await logger.warn("Le bot discord n'est pas lancé", { plateform: "Discord" })

    if (config.instagram.start) {
        try {
            const result = await instaClient({ data })

            clients.insta = result
        } catch (error) {
            await logger.error(error, { plateform: "instagram" })
        }
    } else await logger.warn("Le bot instagram n'est pas lancé", { plateform: "Instagram" })

    if (config.dashboard.start) {
        await dashboardInit({ data, clients })
    } else await logger.warn("Le dashboard n'est pas lancé", { plateform: "Dashboard" })
}

init()

process.on("uncaughtException", (error) => {
    return logger.error(error, { trace: true })
})

process.on("unhandledRejection", (error) => {
    return logger.error(error, { trace: true })
})