import { Command } from "../structures/Command.js"

export default class Help extends Command {
    constructor(client) {
        super(client, {
            name: "help",
            desc: (i18n) => i18n.__("insta.help.descrpition"),
            directory: import.meta.url,
            use: (i18n) => i18n.__("insta.help.usage"),
            example: (i18n) => i18n.__("insta.help.example"),
            aliases: ["aide", "h"]
        })
    }

    async run({ client, message, args, i18n }) {

        if (args[0]) {
            const command = client.commands.get(args[0].toLowerCase()) || client.commands.get(client.aliases.get(args[0].toLowerCase()))

            if (!command) return message.chat.sendMessage(`Aucune commande trouvée pour ${args[0]}`)

            if (!command.config.enabled) return
            if (command.config.ownerOnly && !client.config.instagram.ownerIds.includes(message.author.id.toString())) return

            message.chat.sendMessage(`Informations sur la commande : ${command.help.name}\n\n
            • Alias : ${command.help.aliases.join(", ")}\n
            • Description : ${command.help.desc(i18n)}\n
            • Usage : ${command.help.use(i18n)}\n
            • Exemple : ${command.help.example(i18n)}`)
        } else {
            const commandList = []
            
            for (const [commandName, commandData] of client.commands) {
                if (commandData.config.ownerOnly && !client.config.instagram.ownerIds.includes(message.author.id.toString())) continue

                commandList.push(`• ${client.config.instagram.prefix}${commandName}`)
            }

            message.chat.sendMessage(`Liste des commandes : \n` + commandList.join("\n"))
        }
    }
}