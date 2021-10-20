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

    async run({ client, message, args, argsOptions, i18n }) {
        if (!args[0]) return await message.chat.sendMessage(i18n.__("insta.eval.noArgs"))
        let toExecute = message.content.split(" ").slice(1)

        if (argsOptions.length > 0) toExecute = toExecute.slice(0, toExecute.length - (argsOptions.length - 1))

        const content = toExecute.join(" ")
        const result = new Promise((resolve) => resolve(eval(content)))

        return result.then(async(output) => {
            if (typeof output !== "string") output = inspect(output, { depth: 0 })
                
            if (output.includes(client.token)) output = output.replace(client.token, "Token is contain")

            if (argsOptions[0] === "result" && !["yes", "true"].includes(argsOptions[1])) return 

            return await message.chat.sendMessage(output)
        }).catch(async(err) => {
            return await message.chat.sendMessage(err.toString())
        })
    }
}