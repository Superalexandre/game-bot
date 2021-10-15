//* Dirname
import { dirname, sep } from "path"
import { fileURLToPath } from "url"

export class Command {
    constructor(client, {
        name = null,
        desc = (i18n) => i18n.__("insta.noDescProvided"),
        directory = false,
        use = (i18n) => i18n.__("insta.noUseProvided"),
        example = (i18n) => i18n.__("insta.noExampleProvided"),
        aliases = [],
        enabled = true,
        ownerOnly = false,
        slowmode = 3
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
            slowmode
        }
    }
}
