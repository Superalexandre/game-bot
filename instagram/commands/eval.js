import { Command } from "../structures/Command.js"
import { inspect } from "util"

export default class Eval extends Command {
    constructor(client) {
        super(client, {
            name: "eval",
            desc: (i18n) => i18n.__("insta.eval.description"),
            directory: import.meta.url,
            use: (i18n) => i18n.__("insta.eval.usage"),
            example: (i18n) => i18n.__("insta.eval.example"),
            aliases: ["e"],
            ownerOnly: true
        })
    }

    async run({ message, args, argsOptions, i18n }) {
        return message.chat.sendMessage("En cours")
    }
}