export default class messageCreate {
    constructor(client) {
        this.client = client
    }

    async run(message) {
        const client = this.client
    
        if (!message || !message.content) return
        if (message.author.id === client.user.id) return

        const prefix = client.config.instagram.prefix
        const command = message.content.split(" ")[0].slice(prefix.length).toLowerCase()
        const args = message.content.split(/ +/g).slice(1)
        const argsOptions = message.content.split(/--([a-z]+) ([a-z]+)/gm).slice(1)

        const data = {}

        i18n.setLocale("fr_FR")

        await message.markSeen()

        const cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command))

        if (!cmd) return

        if (cmd.config.ownerOnly && !client.config.instagram.ownerIds.includes(message.author.id)) return

        try {
            cmd.run({
                client,
                message,
                args,
                argsOptions,
                data,
                i18n
            }).then(() => {
                client.logger.commandLog({ message: cmd.help.name }) //message, prefix, cmd.help.name, messageTime, ((Date.now() - start) / 1000) - messageTime/)
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