import { Client } from "./structures/Client.js"
import Logger from "../logger.js"
import { readdirSync } from "fs"

const logger = new Logger({
    plateform: "Instagram"
})

export default async function init({ data }) {
    const client = new Client()
    
    client.data = data
    client.logger = logger
    
    await logger.log("Connexion en cours...")

    const eventFiles = readdirSync("./instagram/events")
    for (const file of eventFiles) {
        const isValidName = file.split(".").pop() === "js"

        if (!isValidName) continue

        const eventClass = await import("./events/" + file)
        const event = await new eventClass.default(client)
        const eventName = file.split(".")[0]

        await client.logger.log(`Event ${eventName} chargé`)

        client.on(eventName, (...args) => event.run(...args))
    }

    const commandFiles = readdirSync("./instagram/commands")
    for (const file of commandFiles) {
        const isValidName = file.split(".").pop() === "js"

        if (!isValidName) continue

        const commandClass = await import("./commands/" + file)
        const command = await new commandClass.default(client)

        await client.logger.log(`Commande ${command.help.name} chargée`)

        client.commands.set(command.help.name, command)

        for (let j = 0; j < command.help.aliases.length; j++) {
            client.aliases.set(command.help.aliases[j], command.help.name)  
        }
    }

    client.on("warn", async(message) => await client.logger.warn(message))
    client.on("error", async(message) => await client.logger.error(message))

    client.login(client.config.instagram.username, client.config.instagram.password)

    return client
}