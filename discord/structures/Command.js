//* Dirname
import { dirname, sep } from "path"
import { fileURLToPath } from "url"

export class Command {
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

        const directoryPath = dirname(fileURLToPath(directory))
        const category = (directoryPath ? directoryPath.split(sep) [parseInt(directoryPath.split(sep).length - 1, 10)] : null)

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
