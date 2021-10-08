import { Client } from "./structures/Client.js" 
import { Intents } from "discord.js"
const client = new Client({ intents: [ Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS ] })
import { readdir } from "fs"

async function load(data, functions, logger) {
    client.functions = functions
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

            //client.logger.log({ message: `Chargement de l'evenement ${i + 1}/${events.length}`, end: i + 1 === events.length })

            client.on(eventName, (...args) => event.run(...args))

            //delete eventClass//require.cache[require.resolve("./events/" + events[i])]
        }
    })

    readdir("./discord/commands", async(err, commands) => {
        if (err) return client.logger.error({ message: err })

        if (commands.length <= 0) return client.logger.error({ message: "Aucune commande n'a été trouvé" })

        for (let i = 0; i < commands.length; i++) {
            const commandClass = await import("./commands/" + commands[i])
            const command = new commandClass.default(client)

            //client.logger.update({ message: `Chargement de la commande ${i + 1}/${commands.length}`, end: i + 1 === commands.length })

            client.commands.set(command.help.name, command)

            for (let j = 0; j < command.help.aliases.length; j++) {
                client.aliases.set(command.help.aliases[j], command.help.name)  
            }

            //delete require.cache[require.resolve("./commands/" + commands[i])]
        }
    })

    client.on("warn", (message) => client.logger.warn({ message: message }))
    client.on("error", (message) => client.logger.error({ message: message }))

    client.login(client.config.discord.token)
}

export default load