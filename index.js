/* Language */
const i18n = require("i18n")

/* All clients */
const DiscordClient = require("./discord/index")

/* Logger */
const Logger = require("./logger")
const logger = new Logger("compact")

/* Database */
const Enmap = require("enmap")

const data = {
    users: new Enmap({ name: "users" }),
    discord: {
        bot: new Enmap({ name: "discordBot" })
    }
}

/* Util */
const path = require("path")
const functions = require("./functions")
const config = require("./config")

/* Config languages */
i18n.configure({
    locales: ["fr_FR"],
    directory: path.join(__dirname, "locales"),
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

DiscordClient.load(data, functions, logger)