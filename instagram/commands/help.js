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

            if (!command) return message.chat.sendMessage(i18n.__("insta.help.noCommand", { commandName: args[0] }))

            if (!command.config.enabled) return
            if (command.config.ownerOnly && !client.config.instagram.ownerIds.includes(message.author.id.toString())) return

            message.chat.sendMessage(`${i18n.__("insta.help.title")} ${command.help.name}\n\n` + 
            `• ${i18n.__("insta.help.alias")} : ${command.help.aliases.join(", ")}\n` +
            `• ${i18n.__("insta.help.desc")} : ${command.help.desc(i18n)}\n` + 
            `• ${i18n.__("insta.help.use")} : ${command.help.use(i18n)}\n` + 
            `• ${i18n.__("insta.help.exam")} : ${command.help.example(i18n)}`)
        } else {
            const commandList = []
            
            for (const [commandName, commandData] of client.commands) {
                if (commandData.config.ownerOnly && !client.config.instagram.ownerIds.includes(message.author.id.toString())) continue

                commandList.push(`• ${client.config.instagram.prefix}${commandName}`)
            }

            message.chat.sendMessage(`${i18n.__("insta.help.listTitle")} \n` + commandList.join("\n"))
        }
    }
}