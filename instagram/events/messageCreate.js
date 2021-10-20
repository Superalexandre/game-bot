import i18n from "i18n"

export default class messageCreate {
    constructor(client) {
        this.client = client
    }

    async run(message) {
        const client = this.client
    
        if (!message || !message.content) return
        if (message.author.id === client.user.id) return

        const data = client.data
        const prefix = client.config.instagram.prefix
        const commandName = message.content.split(" ")[0].slice(prefix.length).toLowerCase()
        const args = message.content.split(/ +/g).slice(1)
        const argsOptions = message.content.split(/--([a-z]+) ([a-z]+)/gm).slice(1)

        let userData = await data.users.find(user => user.plateformData.find(data => data.plateform === "instagram" && data.data.id === message.author.id))

        if (!userData) {
            const newAccount = await client.functions.createAccount({
                data,
                lang: "fr_FR",
                plateformData: [
                    {
                        plateform: "instagram",
                        lastUpdate: Date.now(),
                        data: message.author
                    }
                ]
            })

            if (!newAccount.success) return new Error("No account created")

            userData = newAccount.account
        }

        i18n.setLocale(userData.lang ?? "fr_FR")

        await message.markSeen()

        if (!message.content.startsWith(prefix)) return

        const command = client.commands.get(commandName) || client.commands.get(client.aliases.get(commandName))

        if (!command) return

        if (command.config.ownerOnly && !client.config.instagram.ownerIds.includes(message.author.id.toString())) return

        try {
            command.run({
                client,
                message,
                args,
                argsOptions,
                userData,
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