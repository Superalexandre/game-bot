const i18n = require("i18n")

module.exports = class interactionCreate {
    constructor(client) {
        this.client = client
    }

    async run(interaction) {
        const client = this.client
        const data = client.data
        const start = Date.now()

        if (interaction.isButton()) await client.emit("clickButton", interaction)
        if (!interaction.isCommand()) return

        const userData = {} //await client.data.users.get(message.author.accountID)

        i18n.setLocale("fr_FR")

        const cmd = client.commands.get(interaction.commandName) || client.commands.get(client.aliases.get(interaction.commandName))

        if (!cmd)
            return interaction.reply({
                content: i18n.__("error.unknowCommand"),
                ephemeral: true
            })

        await interaction.deferReply({
            //content: "Partie lancée ✅",
            ephemeral: true
        })

        try {
            const messageTime = (Date.now() - start) / 1000

            return await cmd
                .run({
                    client: client,
                    interaction: interaction,
                    options: interaction.options,
                    i18n: i18n,
                    data: data,
                    userData: userData,

                    util: {
                        messageTimeProcessing: messageTime,
                        startMessageProcessing: start
                    }
                })
                .then(() => {
                    client.logger.commandLog({ message: cmd.help.name } /*message, prefix, cmd.help.name, messageTime, ((Date.now() - start) / 1000) - messageTime*/)
                })
                .catch(error => {
                    interaction.reply({
                        content: i18n.__("error.errorOccured", { error: error.toString() }),
                        ephemeral: true,
                        allowedMentions: { repliedUser: false }
                    })

                    client.logger.error({ message: error })
                })
        } catch (error) {
            interaction.reply({
                content: i18n.__("error.errorOccured", { error: error.toString() }),
                ephemeral: true,
                allowedMentions: { repliedUser: false }
            })

            client.logger.error({ message: error })
        }
    }
}
