const Command = require("../structures/Command")

module.exports = class Eval extends Command {
    constructor(client) {
        super(client, {
            name: "eval",
            directory: __dirname
        })
    }

    async run({ client, interaction, options, i18n, data, userData, util }) {
        if (interaction.user.id !== "253569074431262720")
            return interaction.editReply({
                content: "Vous n'etes pas autorisé a utiliser cette commande",
                ephemeral: true
            })

        const code = options.getString("code")

        const required = `const Discord = require("discord.js"), { MessageEmbed } = require("discord.js"), i18n = require("i18n"), fetch = require("node-fetch")`
        const result = new Promise(resolve => resolve(eval(`${required}\n${code}`)))

        return result
            .then(output => {
                if (typeof output !== "string") output = require("util").inspect(output, { depth: 0 })

                if (output.includes(client.token)) output = output.replace(client.token, `T0K3N`)

                interaction.editReply({
                    content: output,
                    code: "js",
                    ephemeral: true
                })
            })
            .catch(err => {
                err = err.toString()

                if (err.includes(client.token)) err = err.replace(client.token, `T0K3N`)

                interaction.editReply({
                    content: "Une erreur est survenue\n" + err,
                    code: "js",
                    ephemeral: true
                })
            })
    }
}
