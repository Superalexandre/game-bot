import fetch from "node-fetch"
import { SlashCommandBuilder } from "@discordjs/builders"

export default class Ready {
    constructor(client) {
        this.client = client
    }

    async run() {
        const client = this.client

        const commands = await fetch(`${client.config.discord.apiURL}/applications/${client.config.discord.appId}/commands`, {
            headers: { 
                Authorization: "Bot " + client.config.discord.token
            }
        })

        let slashCommandList = await commands.json()
        let commandList = client.commands
        
        for (const [commandName, commandData] of commandList) {
            if (!commandData.config.enabled) continue
            if (slashCommandList.map(cmd => cmd.name).includes(commandName)) {
                //const slashCommand = slashCommandList.filter(cmd => cmd.name === commandName)[0]
                
                //applications/<my_application_id>/commands/<command_id>
                //TODO : Check name, desc
                
                continue
            }

            const command = new SlashCommandBuilder()
                .setName(commandData.help.name)
                .setDescription(commandData.help.description ?? "Aucune description fourni")

            if (commandData.config.options?.length > 0) {
                for (let i = 0; i < commandData.config.options.length; i++) {
                    const option = commandData.config.options[i]
                
                    if (!option.name || !option.description) {
                        client.logger.error({ message: `Erreur valeur manquante (${option.name} | ${option.description})` })

                        continue
                    }

                    if (option.type === "USER") {
                        command.addUserOption((commandOption) => 
                            commandOption
                                .setName(option.name)
                                .setDescription(option.description)
                                .setRequired(option.required)
                        )
                    } else if (option.type === "STRING") {
                        command.addStringOption((commandOption) => 
                            commandOption
                                .setName(option.name)
                                .setDescription(option.description)
                                .addChoices(option.choices)
                                .setRequired(option.required)
                        )
                    } else client.logger.error({ message: `Erreur type ${option.type} introuvable` })
                }
            }

            await createCommand(client, command, commandName)
        }
        
        client.logger.log({ message: `Client prêt (${client.user.username}#${client.user.discriminator})` })
    }
}

async function createCommand(client, command, commandName) {
    client.logger.warn({ message: `La commande ${commandName} n'est pas enregistrer !` })
    
    const rep = await fetch(`${client.config.discord.apiURL}/applications/${client.config.discord.appId}/commands`, {
        method: "POST",
        body: JSON.stringify(command),
        headers: {
            "Authorization": "Bot " + client.config.discord.token,
            "Content-Type": "application/json"
        }
    })
    
    const jsonRep = await rep.json()

    if (jsonRep?.message === "You are being rate limited.") {
        client.logger.warn({ message: `Commande ${commandName} non crée ratelimit (${jsonRep.retry_after} secondes)` })

        return false
    }

    client.logger.log({ message: `Commande ${commandName} crée` })

    return true
}