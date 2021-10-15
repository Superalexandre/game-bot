import { Client } from "./structures/Client.js" 
import { Intents } from "discord.js"
import { readdir } from "fs"
import Logger from "../logger.js"

const client = new Client({ 
    intents: [ Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS ] 
})

//* Logger
const logger = new Logger({
    mode: "compact",
    plateform: "Discord"
})

export default async function init(data) {
    client.data = data
    client.logger = logger

    readdir("./discord/events", async(err, files) => {
        if (err) return client.logger.error({ message: err })

        if (files.length <= 0) return client.logger.error({ message: "Aucun evenement n'a été trouvé" })

        const events = files.filter((ext) => ext.split(".").pop() === "js")

        for (let i = 0; i < events.length; i++)  {
            const eventClass = await import("./events/" + events[i])
            const event = new eventClass.default(client)
            const eventName = events[i].split(".")[0]

            client.logger.log({ message: `Event ${eventName} chargé` })

            client.on(eventName, (...args) => event.run(...args))
        }
    })

    readdir("./discord/commands", async(err, commands) => {
        if (err) return client.logger.error({ message: err })

        if (commands.length <= 0) return client.logger.error({ message: "Aucune commande n'a été trouvé" })

        for (let i = 0; i < commands.length; i++) {
            const commandClass = await import("./commands/" + commands[i])
            const command = new commandClass.default(client)

            client.logger.log({ message: `Commande ${command.help.name} chargée` })

            client.commands.set(command.help.name, command)

            /*
            for (let j = 0; j < command.help.aliases.length; j++) {
                client.aliases.set(command.help.aliases[j], command.help.name)  
            }
            */
        }
    })

    client.on("warn", (message) => client.logger.warn({ message: message }))
    client.on("error", (message) => client.logger.error({ message: message }))

    client.logger.log({ message: "Connexion en cours..." })
    await client.login(client.config.discord.token)
    client.logger.log({ message: "Connexion effectué" })
}