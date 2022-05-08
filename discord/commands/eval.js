import { Command } from "../structures/Command.js"
import { inspect } from "util"

export default class Eval extends Command {
    constructor(client) {
        super(client, {
            name: "eval",
            description: "Commande reserver a l'administration",
            debug: true,
            options: [
                {
                    type: "STRING",
                    name: "code",
                    description: "Code a executer",
                    required: true
                }
            ],
            directory: import.meta.url,
            enabled: false
        })
    }

    async run({ client, interaction, options }) {
        if (!client.config.discord.ownerIds.includes(interaction.user.id)) return interaction.editReply({
            content: "Vous n'etes pas autorisé a utiliser cette commande",
            ephemeral: true
        })

        const code = options.getString("code")

        const required = `const Discord = import("discord.js")\nconst { MessageEmbed } = import("discord.js")\nconst i18n = import("i18n")\nconst fetch = import("node-fetch")`
        const result = new Promise((resolve) => resolve(eval(`${required}\n${code}`)))

        return result.then((output) => {
            if (typeof output !== "string") output = inspect(output, { depth: 0 })

            if (output.includes(client.token)) output = output.replace(client.token, "Token is contain")

            interaction.editReply({
                content: output,
                code: "js",
                ephemeral: true
            })
        }).catch((err) => {
            err = err.toString()

            if (err.includes(client.token)) err = err.replace(client.token, "Token is contain")

            interaction.editReply({
                content: "Une erreur est survenue\n" + err,
                code: "js",
                ephemeral: true
            })
        })
    }
}