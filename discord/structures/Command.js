const { sep } = require("path")

module.exports = class Command {
    constructor(client, {
        name = null,
        desc = (i18n) => i18n.__("discord.no_desc_provided"),
        directory = false,
        use = (i18n) => i18n.__("discord.no_use_provided"),
        example = (i18n) => i18n.__("discord.no_example_provided"),
        aliases = [],
        enabled = true,
        ownerOnly = false,
        slowmode = 3,
        botPerms = [],
        memberPerms = [],
        privateMessage = false
    }) {
        this.client = client

        let category = (directory ? directory.split(sep) [parseInt(directory.split(sep).length - 1, 10)] : null)

        this.help = {
            name,
            desc,
            category,
            use,
            example,
            aliases
        }

        this.config = {
            enabled,
            ownerOnly,
            slowmode,
            botPerms,
            memberPerms,
            privateMessage
        }
    }
}
