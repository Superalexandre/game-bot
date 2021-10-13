import Command from "../structures/Command.js"

export default class Help extends Command {
    constructor(client) {
        super(client, {
            name: "help",
            desc: (i18n) => i18n.__("insta.help.desc"),
            directory: import.meta.url,
            use: (i18n) => i18n.__("insta.help.usage"),
            example: (i18n) => i18n.__("insta.help.example"),
            aliases: ["aide", "h"]
        })
    }

    async run({ message, args, argsOptions, i18n }) {
        return message.chat.sendMessage("En cours")
    }
}