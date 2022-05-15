import { Client } from "./structures/Client.js" 
import { Intents } from "discord.js"
import { readdirSync } from "fs"
import Logger from "../logger.js"

const client = new Client({ 
    intents: [ Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS ] 
})

//* Logger
const logger = new Logger({
    plateform: "Discord"
})

export default async function init({ data }) {
    client.data = data
    client.logger = logger

    await client.logger.log("Connexion en cours...")

    const eventFiles = readdirSync("./discord/events")
    for (const file of eventFiles) {
        const isValidName = file.split(".").pop() === "js"

        if (!isValidName) continue

        const eventClass = await import("./events/" + file)
        const event = await new eventClass.default(client)
        const eventName = file.split(".")[0]

        await client.logger.log(`Event ${eventName} chargé`)

        client.on(eventName, (...args) => event.run(...args))
    }

    const commandFiles = readdirSync("./discord/commands")
    for (const file of commandFiles) {
        const isValidName = file.split(".").pop() === "js"

        if (!isValidName) continue

        const commandClass = await import("./commands/" + file)
        const command = await new commandClass.default(client)

        await client.logger.log(`Commande ${command.help.name} chargée`)

        client.commands.set(command.help.name, command)
    }

    client.on("warn", async(message) => await client.logger.warn(message))
    client.on("error", async(message) => await client.logger.error(message))

    await client.login(client.config.discord.token)
    await client.logger.log("Connexion effectué")

    return client
}