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
            const newAccount = await client.functions.createAccount({
                data,
                lang: "fr-FR",
                plateformData: [
                    {
                        plateform: "discord",
                        lastUpdate: Date.now(),
                        data: interaction.user
                    }
                ]
            })

            if (!newAccount.success) return new Error("No account created")

            userData = newAccount.account
        }

        interaction.user.account = userData

        i18n.setLocale(userData.lang ?? "fr-FR")

        const cmd = client.commands.get(interaction.commandName) || client.commands.get(client.aliases.get(interaction.commandName))

        if (!cmd) return interaction.reply({
            content: i18n.__("error.unknowCommand"),
            ephemeral: true
        })

        await interaction.deferReply({
            //content: "Partie lancée ✅",
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
                
                console.log("Commande terminée")
                // client.logger.commandLog({ 
                //     interactionId: interaction.id,
                //     commandName: cmd.help.name,
                //     prefix: "/" 
                //     /*message, prefix, cmd.help.name, messageTime, ((Date.now() - start) / 1000) - messageTime*/
                // })
            }).catch(error => {
                /*
                interaction.reply({ 
                    content: i18n.__("error.errorOccured", { error: error.toString() }), 
                    ephemeral: true,
                    allowedMentions: { repliedUser: false } 
                })
                */
        
                client.logger.error(error)
            })
        } catch (error) {
            /*
            interaction.reply({ 
                content: i18n.__("error.errorOccured", { error: error.toString() }), 
                ephemeral: true,
                allowedMentions: { repliedUser: false } 
            })
            */
        
            client.logger.error(error)
        }
    }
}