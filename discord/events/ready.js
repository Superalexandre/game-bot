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
        const botData = client.data.discord.bot

        if (!botData.get("pendingCommands")) botData.set("pendingCommands", [])

        for (const [commandName, commandData] of commandList) {
            if (!commandData.config.enabled) continue

            const pendingCommands = botData.get("pendingCommands")
            const ONE_HOUR_IN_MILISECONDES = 1 * 60 * 60 * 1000
            const type = slashCommandList.map(cmd => cmd.name).includes(commandName) ? "update" : "create"

            if (type === "update") {
                const slashCommand = slashCommandList.filter(cmd => cmd.name === commandName)[0]
                let { description, name } = slashCommand

                if (description === commandData.help.description && name === commandData.help.name) {
                    const cmdData = pendingCommands.find(cmdData => cmdData.name === commandName)

                    if (cmdData) {
                        const pendingCommands = botData.get("pendingCommands").filter((commandName) => commandName !== commandData.help.name)
                        botData.set("pendingCommands", pendingCommands)
    
                        client.logger.log({ message: `Commande ${commandData.help.name} supprimer des pendingCommands, mis a jour !` })    
                    
                        continue
                    }

                    client.logger.log({ message: `${commandName} synchro !` })
             
                    continue
                }
            }

            if (pendingCommands.length > 0 && pendingCommands.find(cmdData => cmdData.name === commandName)) {
                const cmdData = pendingCommands.find(cmdData => cmdData.name === commandName)

                if (!cmdData) {
                    client.logger.warn({ message: `Data introuvable pour la commande ${commandName} dans pendingCommands` })
                
                    continue
                } 

                if (Date.now() - cmdData.edit > ONE_HOUR_IN_MILISECONDES) {
                    const pendingCommands = botData.get("pendingCommands").filter((commandName) => commandName !== commandData.help.name)
                    botData.set("pendingCommands", pendingCommands)

                    client.logger.log({ message: `Commande ${commandData.help.name} supprimer des pendingCommands, crée avec succès !` })
                
                    continue
                }

                client.logger.warn({ message: `Commande ${commandData.help.name} en attente dans pendingCommands` })

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

            if (type === "create") {
                await createCommand(client, command, commandName, botData)
            } else if (type === "update") {
                const slashCommand = slashCommandList.filter(cmd => cmd.name === commandName)[0]
                
                await updateCommand(client, command, commandName, slashCommand.id, botData)
            }
        }
        
        client.logger.log({ message: `Client prêt (${client.user.username}#${client.user.discriminator})` })
    }
}

async function createCommand(client, command, commandName, botData) {
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

    botData.push("pendingCommands", {
        name: commandName,
        edit: Date.now()
    })

    return true
}


async function updateCommand(client, command, commandName, commandId, botData) {
    client.logger.warn({ message: `La commande ${commandName} n'est pas synchroniser` })
    
    const rep = await fetch(`${client.config.discord.apiURL}/applications/${client.config.discord.appId}/commands/${commandId}`, {
        method: "PATCH",
        body: JSON.stringify(command),
        headers: {
            "Authorization": "Bot " + client.config.discord.token,
            "Content-Type": "application/json"
        }
    })
    
    const jsonRep = await rep.json()

    if (jsonRep?.message === "You are being rate limited.") {
        client.logger.warn({ message: `Commande ${commandName} non mise a jour ratelimit (${jsonRep.retry_after} secondes)` })

        return false
    }

    client.logger.log({ message: `Commande ${commandName} mis a jour` })

    botData.push("pendingCommands", {
        name: commandName,
        edit: Date.now()
    })

    return true
}