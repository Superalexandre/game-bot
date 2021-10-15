import fetch from "node-fetch"
//import { SlashCommandBuilder } from "@discordjs/builders"

export default class Ready {
    constructor(client) {
        this.client = client
    }

    async run() {
        const client = this.client

        const config = client.config
        const apiUrl = "https://discord.com/api/v8"
        const endPoint = `/applications/${config.discord.appId}/commands`
        const commands = await fetch(`${apiUrl}${endPoint}`, {
            headers: { 
                Authorization: `Bot ${config.discord.token}`
            }
        })

        let slashCommandList = await commands.json()
        let commandList = client.commands
        
        for (const [commandName, commandData] of commandList) {
            if (!commandData.config.enabled) continue
            if (slashCommandList.map(cmd => cmd.name === commandName).includes(commandName)) continue
            
            client.logger.warn({ message: `La commande ${commandName} n'est pas enregistrer !` })

            /*
            const command = new SlashCommandBuilder()
                .setName(commandData.help.name)
                .setDescription(commandData.help.desc ?? "Aucune description fourni")

            const rep = await fetch(``, {
                method: "POST",
                body: 
            })

            console.log(commandData.help.name)
            */
        }

        client.logger.log({ message: `Client prêt (${client.user.username}#${client.user.discriminator})` })
    }
}