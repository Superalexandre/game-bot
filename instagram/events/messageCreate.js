import i18n from "i18n"

export default class messageCreate {
    constructor(client) {
        this.client = client
    }

    async run(message) {
        const client = this.client
    
        if (!message || !message.content) return
        if (message.author.id === client.user.id) return

        const prefix = client.config.instagram.prefix
        const commandName = message.content.split(" ")[0].slice(prefix.length).toLowerCase()
        const args = message.content.split(/ +/g).slice(1)
        const argsOptions = message.content.split(/--([a-z]+) ([a-z]+)/gm).slice(1)

        const data = {}

        i18n.setLocale("fr_FR")

        await message.markSeen()

        const command = client.commands.get(commandName) || client.commands.get(client.aliases.get(commandName))

        if (!command) return

        if (command.config.ownerOnly && !client.config.instagram.ownerIds.includes(message.author.id.toString())) return

        try {
            command.run({
                client,
                message,
                args,
                argsOptions,
                data,
                i18n
            }).then(() => {
                client.logger.commandLog({ interactionId: message.id, commandName: command.help.name, prefix })
            }).catch(error => {
                message.chat.sendMessage(i18n.__("error.errorOccured", { error: error.toString() }))

                client.logger.error({ message: error })
            })
        } catch (error) {
            message.chat.sendMessage(i18n.__("error.errorOccured", { error: error.toString() }))

            client.logger.error({ message: error })
        }
    }
}