const i18n = require("i18n")

module.exports = class messageCreate {
    constructor(client) {
        this.client = client
    }

    async run(message) {
        /*
        //https://discordjs.guide/additional-info/changes-in-v13.html#replies-message-reply

        const client = this.client
        const prefix = client.config.discord.prefix
        const data = client.data
        const start = Date.now()

        if (message.channel.type === "dm") return console.log(`[PRIVATE MESSAGE] : ${message.content} [${message.author.id} | ${message.author.username}]`)
        if (!message.guild || message.author.bot || !message.channel.permissionsFor(client.user).has("SEND_MESSAGES")) return

        const mentionned = message.mentions.users.has(client.user.id)

        if (!mentionned && !message.content.startsWith(prefix)) return

        if (message.guild && !message.member) await message.guild.members.fetch(message.author.id)

        if (!data.users.find(user => user && user.discord && user.discord.id === message.author.id)) {
            client.logger.log(`Création d'un compte pour ${message.author.id} (${message.author.username})`)

            let account = await client.functions.createAccount("discord", message.author)

            message.author.accountID = account.accountID
        }

        if (!message.author.accountID) {
            const accountID = await client.data.users.findKey(user => user.discord.id === message.author.id)
        
            message.author.accountID = accountID
        }

        const userData = await client.data.users.get(message.author.accountID)

        i18n.setLocale("fr_FR")

        if (mentionned && !message.reference) {
            const messageTime = (Date.now() - start) / 1000

            message.reply({ content: i18n.__("discord.mentionned", { prefix: prefix }), allowedMentions: { repliedUser: false } })

            return client.logger.commandLog({ message: "Mention" } //message, prefix, "mention", messageTime, ((Date.now() - start) / 1000) - messageTime/)
        }

        const command = message.content.split(" ")[0].slice(prefix.length).toLowerCase()
        const cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command))
        const args = message.content.split(/ +/g).slice(1)

        if (!cmd) return

        if (!message.channel.permissionsFor(message.guild.me).has("ADMINISTRATOR")) {
            let neededPermission = []

            if (!cmd.config.botPerms.includes("EMBED_LINKS")) {
                cmd.config.botPerms.push("EMBED_LINKS")
            }

            for (let i = 0; i < cmd.config.botPerms.length; i++) {
                if (!message.channel.permissionsFor(message.guild.me).has(cmd.config.botPerms[i])) {
                    neededPermission.push(cmd.config.botPerms[i])
                }
            }

            if (neededPermission.length > 0) {
                return message.reply({ content: i18n.__n("error.%s missingBotPermission", neededPermission.length) + `\n\`\`\`${neededPermission.map((p) => p).join("\n")}\`\`\``, allowedMentions: { repliedUser: false } })
            }

        }

        if (!message.channel.permissionsFor(message.member).has("ADMINISTRATOR")) {
            let neededPermission = []

            for (let i = 0; i < cmd.config.memberPerms.length; i++) {
                if (!message.channel.permissionsFor(message.member).has(cmd.config.memberPerms[i])) {
                    neededPermission.push(cmd.config.memberPerms[i])
                }
            }
            
            if (neededPermission.length > 0) {
                return message.reply({ content: i18n.__n("error.%s missingUserPermission", neededPermission.length) + `\n\`\`\`${neededPermission.map((p) => p).join("\n")}\`\`\``, allowedMentions: { repliedUser: false } })
            }
        }

        if (cmd.config.ownerOnly && !client.config.discord.ownerIds.includes(message.author.id)) return

        try {
            const messageTime = (Date.now() - start) / 1000

            cmd.run({
                client: client,
                message: message,
                args: args,
                i18n: i18n,
                data: data,
                userData: userData,

                util: {
                    messageTimeProcessing: messageTime,
                    startMessageProcessing: start
                }
            }).then(result => {
                client.logger.commandLog({ message: cmd.help.name } //message, prefix, cmd.help.name, messageTime, ((Date.now() - start) / 1000) - messageTime/)
            }).catch(error => {
                message.reply({ content: i18n.__("error.errorOccured", { error: error.toString() }), allowedMentions: { repliedUser: false } })

                client.logger.error({ message: error })
            })
        } catch(error) {
            message.reply({ content: i18n.__("error.errorOccured", { error: error.toString() }), allowedMentions: { repliedUser: false } })

            client.logger.error({ message: error })
        }
        */
    }
}
