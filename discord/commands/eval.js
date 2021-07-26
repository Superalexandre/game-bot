const Command = require("../structures/Command")

module.exports = class Eval extends Command {
    constructor(client) {
        super(client, {
            name: "eval",
            //desc: (i18n) => i18n.__("discord.eval.desc"),
            directory: __dirname,
            //use: (i18n) => i18n.__("discord.eval.use"),
            //example: (i18n) => i18n.__("discord.eval.example"),
            aliases: ["e"],
            ownerOnly: true
        })
    }

    async run({ client, message, args, i18n, data, userData, util }) {
        if (!args[0]) {
            return message.channel.send("Erreur")
        }

        const content = message.content.split(" ").slice(1).join(" ")

        const required = `const Discord = require("discord.js"), { MessageEmbed } = require("discord.js"), i18n = require("i18n"), fetch = require("node-fetch")`
        const result = new Promise((resolve) => resolve(eval(`${required}\n${content}`)))

        return result.then((output) => {
            if (typeof output !== "string") output = require("util").inspect(output, { depth: 0 })
            
            if (output.includes(client.token)) output = output.replace(client.token, `T0K3N`)
            
            message.channel.send(output, { code: "js" })
        }).catch((err) => {
            err = err.toString()
            
            if (err.includes(client.token)) {
                err = err.replace(client.token, `T0K3N`)
            }

            message.channel.send("Une erreur est survenue\n" + err, { code: "js" })
        })
    }
}