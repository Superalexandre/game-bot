import i18n from "i18n"

export default class interactionCreate {
    constructor(client) {
        this.client = client
    }

    async run(interaction) {
        const client = this.client
        const data = client.data
        const start = Date.now()

        if (interaction.isButton()) await client.emit("clickButton", interaction)
        if (!interaction.isCommand()) return

        await interaction.user.fetch()

        let userData = await data.users.find(user => user.plateformData.find(data => data.plateform === "discord" && data.data.id === interaction.user.id))

        if (!userData) {
            const user = interaction.user

            const newAccount = await client.functions.createAccount({
                data,
                lang: user.locale || "fr",
                plateformData: [
                    {
                        plateform: "discord",
                        lastUpdate: Date.now(),
                        data: user.toJSON()
                    }
                ]
            })

            if (!newAccount.success) return new Error("No account created")

            userData = newAccount.account
        }

        interaction.user.account = userData

        i18n.setLocale(interaction.locale ?? "fr-FR")

        const cmd = client.commands.get(interaction.commandName) || client.commands.get(client.aliases.get(interaction.commandName))

        if (!cmd) return interaction.reply({
            content: i18n.__("error.unknowCommand"),
            ephemeral: true
        })

        // Check permissions
        const permissions = ["SEND_MESSAGES", "EMBED_LINKS", "ATTACH_FILES", "USE_EXTERNAL_EMOJIS", "ADD_REACTIONS"]
        let missingPermissions = []
        for (const permission of permissions) {
            if (!interaction.channel.permissionsFor(interaction.guild.me).has(permission)) missingPermissions.push(permission)
        }

        if (missingPermissions.length > 0) return interaction.reply({
            content: `Je n'est pas les permissions : ${missingPermissions.join(", ")}`,
            ephemeral: true
        })

        await interaction.reply({
            content: i18n.__("discord.partyLaunched"),
            ephemeral: true
        })

        try {
            const messageTime = (Date.now() - start) / 1000
        
            return await cmd.run({
                client,
                interaction,
                options: interaction.options,
                i18n,
                data,
                userData,
        
                util: {
                    messageTimeProcessing: messageTime,
                    startMessageProcessing: start
                }
            }).then(() => {
                client.logger.commandLog(cmd.help.name, { 
                    interactionId: interaction.id,
                    prefix: "/"
                })
            }).catch(async(error) => {
                await client.logger.error(error)
            })
        } catch (error) {
            await client.logger.error(error)
        }
    }
}