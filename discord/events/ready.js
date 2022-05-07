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
    const commandsList = client.commands

    if (!botData.get("pendingCommands")) botData.set("pendingCommands", [])

    // Check if the bot has a command
    for (const [commandName, commandData] of commandsList) {
        if (!commandData.config.enabled) continue

        const pendingCommands = await botData.get("pendingCommands")
        const type = await commands.map(command => command.name).includes(commandName) ? "update" : "create"

        if (type === "create") {
            pendingCommands.push(commandName)
            botData.set("pendingCommands", pendingCommands)
            await client.logger.log(`Commande ${commandName} en attente de création`)
        
            createCommand({
                client,
                botData,
                commandName,
                commandData
            })

            continue
        }

        const ONE_HOUR_IN_MILLISECONDS = 1 * 60 * 60 * 1000
        const pendingCommand = await pendingCommands.find(cmd => cmd.name === commandName)
        if (pendingCommand && Date.now() - pendingCommand.edit.getTime() > ONE_HOUR_IN_MILLISECONDS) {
            pendingCommands.splice(pendingCommands.indexOf(pendingCommand), 1)
            botData.set("pendingCommands", pendingCommands)
            await client.logger.log(`Commande ${commandName} supprimée`)

            continue
        } else if (pendingCommand) {
            await client.logger.warn(`Commande ${commandName} en cooldown`)
        
            continue
        }

        if (type === "update") {
            // Get the command 
            const command = await commands.find(cmd => cmd.name === commandName)

            if (!command) {
                await client.logger.error(`Commande ${commandName} introuvable`)
                continue
            }

            let sameDebug = true
            if (!command.guildId && commandData.config.debug || command.guildId !== client.config.discord.debugGuild) sameDebug = false

            // Check options
            let sameOptions = true
            if (commandData.config.options) {
                for (let i = 0; i < commandData.config.options.length; i++) {
                    const option = commandData.config.options[i]
                    const { name, description, required, choices } = option

                    if (command.options[i].name === name && command.options[i].description === description && command.options[i].required === required && command.options[i].choices === choices) continue
                
                    sameOptions = false
                    await client.logger.warn(`Commande ${commandName} : option non identique`)
                }
            }

            let { description, name } = command
            // Check if the command has same data
            if (sameDebug && sameOptions && description === commandData.help.description && name === commandData.help.name) continue
            
            // Update the command
            updateCommand({
                client,
                botData,
                command,
                commandName,
                commandData,
                debug: !sameDebug
            })
        
            continue
        }
    }
}

async function createCommand({ client, botData, commandName, commandData }) {
    await client.application.commands.create(commandData)

    const pendingCommands = await botData.get("pendingCommands")
    pendingCommands.push(commandName, 1)
    await botData.set("pendingCommands", pendingCommands)

    await client.logger.log(`Commande ${commandName} créée`)

    return true
}

async function updateCommand({ client, botData, command, commandName, commandData, debug }) {
    const newCommand = {
        ...command,
        ...commandData
    }
    
    if (debug) {
        await client.application.commands.edit(command.id, newCommand)
    } else {
        await client.application.commands.edit(command.id, newCommand, client.config.discord.debugGuild)
    } 

    const pendingCommands = await botData.get("pendingCommands")
    pendingCommands.push({
        name: commandName,
        type: "update",
        edit: new Date()
    })
    await botData.set("pendingCommands", pendingCommands)

    await client.logger.log(`Commande ${commandName} mise à jour`)

    return true
}