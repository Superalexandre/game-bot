import { ApplicationCommand } from "discord.js"

export default class Ready {
    constructor(client) {
        this.client = client
    }

    async run() {
        const client = this.client

        await checkCommand({ client })

        await client.logger.log(`Client prêt (${client.user.username}#${client.user.discriminator})`)
    }
}

async function checkCommand({ client }) {
    const botData = client.data.discord.bot
    const commands = await client.application.commands.fetch()
    
    const guild = await client.guilds.fetch(client.config.discord.debugGuild)
    const guildCommand = await guild.commands.fetch()

    const commandsList = client.commands

    if (!botData.get("pendingCommands")) botData.set("pendingCommands", [])

    // Check if command is not deleted
    const allCommands = [...commands.map(cmd => cmd), ...guildCommand.map(cmd => cmd)]
    for (let i = 0; i < allCommands.length; i++) {
        const command = allCommands[i]
        const commandName = command.name

        if (!commandsList.has(commandName)) {
            await client.logger.warn(`Commande ${commandName} inexistante`)

            await deleteCommand({
                client,
                command,
                commandName,
                debug: command.guildId ?? false
            })
        }
    }

    // Check if the bot has a command
    for (const [commandName, commandData] of commandsList) {
        if (!commandData.config.enabled) continue

        const pendingCommands = await botData.get("pendingCommands")
        const type = await commands.map(command => command.name).includes(commandName) ? "update" : "create"

        if (type === "create") {
            // Check if the bot has a command in the debug guild
            if (guildCommand.map(command => command.name).includes(commandName)) {
                checkValid({ client, botData, commands: guildCommand, commandName, commandData })
                continue
            }

            pendingCommands.push(commandName)
            botData.set("pendingCommands", pendingCommands)
            await client.logger.log(`Commande ${commandName} en attente de création`)
        
            createCommand({
                client,
                botData,
                commandName,
                commandData,
                debug: commandData.config.debug ?? false
            })

            continue
        }

        // Cooldown
        const ONE_HOUR_IN_MILLISECONDS = 1 * 60 * 60 * 1000
        const pendingCommand = await pendingCommands.find(cmd => cmd.name === commandName)
        if (pendingCommand && Date.now() - pendingCommand.edit.getTime() > ONE_HOUR_IN_MILLISECONDS) {
            pendingCommands.splice(pendingCommands.indexOf(pendingCommand), 1)
            botData.set("pendingCommands", pendingCommands)
            await client.logger.log(`Commande ${commandName} supprimée du cooldown`)

            continue
        } else if (pendingCommand) {
            await client.logger.warn(`Commande ${commandName} en cooldown`)
        
            continue
        }

        if (type === "update") checkValid({ client, botData, commands, commandName, commandData })
    }
}

async function checkValid({ client, botData, commands, commandName, commandData }) {            
    // Get the command 
    const command = await commands.find(cmd => cmd.name === commandName)

    if (!command) return await client.logger.error(`Commande ${commandName} introuvable`)

    let sameDebug = true
    let isDebug = commandData.config.debug
    if ((!command.guildId && commandData.config.debug) || (commandData.config.debug && command.guildId !== client.config.discord.debugGuild)) {
        await client.logger.warn(`Commande ${commandName} en mode debug, création`)

        await deleteCommand({ client, command, commandName, debug: false })

        return createCommand({
            client,
            botData,
            commandName,
            commandData,
            debug: isDebug
        })
    }

    if (!commandData.config.debug && command.guildId) {
        await deleteCommand({
            client,
            command,
            commandName,
            debug: isDebug
        })

        return createCommand({
            client,
            botData,
            commandName,
            commandData,
            debug: false
        })
    }

    // Check options
    let sameOptions = true
    if (!ApplicationCommand.optionsEqual(commandData.config.options ?? [], command.options ?? [])) sameOptions = false
    
    let { description, name, descriptionLocalizations, nameLocalizations } = command

    if (commandData.help.descriptionLocalizations !== descriptionLocalizations) {
        console.log(command)
    }

    // Check if the command has same data
    if (!commandData.config.forceCheck && sameDebug && sameOptions && description === commandData.help.description && name === commandData.help.name && descriptionLocalizations === commandData.help.descriptionLocalizations && nameLocalizations === commandData.help.nameLocalizations) return
    
    await client.logger.warn(`${commandName} : sameDebug ${sameDebug} sameOptions ${sameOptions} description ${description === commandData.help.description} name ${name === commandData.help.name} descriptionLocalizations ${descriptionLocalizations === commandData.help.descriptionLocalizations} nameLocalizations ${nameLocalizations === commandData.help.nameLocalizations} forceCheck ${commandData.config.forceCheck}`)

    // Update the command
    updateCommand({
        client,
        botData,
        command,
        commandName,
        commandData,
        debug: isDebug
    })
}

async function createCommand({ client, botData, commandName, commandData, debug }) {
    const commandObject = {
        name: commandName,
        description: commandData.help.description,
        options: commandData.config.options
    }
    
    if (debug) {
        const guildId = client.config.discord.debugGuild
        const guild = await client.guilds.fetch(guildId)

        await guild.commands.create(commandObject)
    } else {
        await client.application.commands.create(commandObject)
        
        const pendingCommands = await botData.get("pendingCommands")
        pendingCommands.push({
            name: commandName,
            type: "create",
            edit: new Date()
        })

        await botData.set("pendingCommands", pendingCommands)
    }

    await client.logger.log(`Commande ${commandName} créée ${debug ? "en mode debug" : ""}`)

    return true
}

async function updateCommand({ client, botData, command, commandName, commandData, debug }) {
    const { description, name, descriptionLocalizations, nameLocalizations } = commandData.help
    let newCommand = {
        name, nameLocalizations, description, descriptionLocalizations,
        ...commandData.config
    }

    if (commandName === "rules") {
        const commandsList = client.commands
            .filter(command => command.config.type === "game")
            .map(command => {
                return {
                    name: command.help.name,
                    value: command.help.name
                }
            })

        newCommand.options[0].choices = commandsList
        
        if (ApplicationCommand.optionsEqual(command.options, newCommand.options)) return await client.logger.log(`Commande ${commandName} mise à jour (Même options)`)	
    }

    if (debug) {
        const guildId = client.config.discord.debugGuild
        const guild = await client.guilds.fetch(guildId)

        await guild.commands.edit(command.id, newCommand)
    } else {
        await client.application.commands.edit(command.id, newCommand)

        const pendingCommands = await botData.get("pendingCommands")
        pendingCommands.push({
            name: commandName,
            type: "update",
            edit: new Date()
        })

        await botData.set("pendingCommands", pendingCommands)    
    } 

    await client.logger.log(`Commande ${commandName} mise à jour ${debug ? "en mode debug" : ""}`)

    return true
}

async function deleteCommand({ client, command, commandName, debug }) {
    if (debug) {
        const guildId = client.config.discord.debugGuild
        const guild = await client.guilds.fetch(guildId)

        await guild.commands.delete(command.id)
    } else {
        await client.application.commands.delete(command.id)
    }

    await client.logger.log(`Commande ${commandName} supprimée ${debug ? "en mode debug" : ""}`)

    return true
}