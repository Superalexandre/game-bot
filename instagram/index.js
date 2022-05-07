import { Client } from "./structures/Client.js"
import Logger from "../logger.js"
import { readdir } from "fs"

const logger = new Logger({
    plateform: "Instagram"
})

export default async function init({ data }) {
    const client = new Client()
    
    client.data = data
    client.logger = logger

    readdir("./instagram/events", async(err, files) => {
        if (err) return client.logger.error(err)

        if (files.length <= 0) return client.logger.error("Aucun evenement n'a été trouvé")

        const events = files.filter((ext) => ext.split(".").pop() === "js")

        for (let i = 0; i < events.length; i++) {
            const eventClass = await import("./events/" + events[i])
            const event = await new eventClass.default(client)
            const eventName = events[i].split(".")[0]

            await client.logger.log(`Event ${eventName} chargé`)

            client.on(eventName, (...args) => event.run(...args))
        }
    })

    readdir("./instagram/commands", async(err, commands) => {
        if (err) return client.logger.error(err)

        if (commands.length <= 0) return client.logger.error("Aucune commande n'a été trouvé")

        for (let i = 0; i < commands.length; i++) {
            const commandClass = await import("./commands/" + commands[i])
            const command = await new commandClass.default(client)

            await client.logger.log(`Commande ${command.help.name} chargée`)

            client.commands.set(command.help.name, command)

            for (let j = 0; j < command.help.aliases.length; j++) {
                client.aliases.set(command.help.aliases[j], command.help.name)  
            }
        }
    })

    client.on("warn", async(message) => await client.logger.warn(message))
    client.on("error", async(message) => await client.logger.error(message))

    await logger.log("Connexion en cours...")
    client.login(client.config.instagram.username, client.config.instagram.password)

    return client
}