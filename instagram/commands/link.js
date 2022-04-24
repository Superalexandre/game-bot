import { Command } from "../structures/Command.js"

export default class Link extends Command {
    constructor(client) {
        super(client, {
            name: "link",
            desc: (i18n) => i18n.__("insta.link.desc"),
            directory: import.meta.url,
            use: (i18n) => i18n.__("insta.link.use"),
            example: (i18n) => i18n.__("insta.link.example"),
            aliases: ["sync"]
        })
    }

    async run({ client, message, args, i18n }) {
        if (!args[0]) return message.chat.sendMessage(i18n.__("insta.link.noArgs"))

        const code = args[0]

        const data = await client.data.sync.get(code)
        if (!data) return message.chat.sendMessage(i18n.__("insta.link.error.invalidCode"))

        const account = await client.data.users.get(data.account)
        if (!account) return message.chat.sendMessage(i18n.__("insta.link.error.invalidAccount"))

        const user = await client.data.users.get(message.author.account.accountId)
        if (!user) return message.chat.sendMessage(i18n.__("insta.link.error.invalidAccount"))

        if (account.accountId === user.accountId) {
            await client.data.sync.delete(code)
         
            return message.chat.sendMessage(i18n.__("insta.link.error.sameAccount"))
        }

        await client.functions.mergeAccount({
            data: client.data,
            id1: account.accountId,
            id2: user.accountId
        })

        await client.data.sync.delete(code)
        await message.chat.sendMessage(i18n.__("insta.link.success"))
    }
}