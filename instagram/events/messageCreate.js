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
            const { id, username, fullName, biography, isPrivate, isVerified, avatarURL, followers, following } = message.author

            const newAccount = await client.functions.createAccount({
                data,
                lang: "fr-FR",
                plateformData: [
                    {
                        plateform: "instagram",
                        lastUpdate: Date.now(),
                        data: {
                            id,
                            username,
                            fullName,
                            biography,
                            isPrivate,
                            isVerified,
                            avatarURL,
                            followers,
                            following
                        }
                    }
                ]
            })

            if (!newAccount.success) return new Error("No account created")

            userData = newAccount.account
        }

        message.author.account = userData
        i18n.setLocale(userData.lang ?? "fr-FR")

        // await message.markSeen()

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
            }).then(async() => {
                await client.logger.commandLog(command.help.name, { interactionId: message.id, prefix })
            }).catch(error => {
                message.chat.sendMessage(i18n.__("error.errorOccured", { error: error.toString() }))

                client.logger.error(error)
            })
        } catch (error) {
            message.chat.sendMessage(i18n.__("error.errorOccured", { error: error.toString() }))

            await client.logger.error(error)
        }
    }
}