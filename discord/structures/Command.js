//* Dirname
import { dirname, sep } from "path"
import { fileURLToPath } from "url"

export class Command {
    constructor(client, {
        name = null,
        nameLocalizations = null,
        description = "Erreur aucune description fournis",
        descriptionLocalizations = null,
        directory = false,
        enabled = true,
        debug = false,
        forceCheck = false,
        options = null,
        botPerms = [],
        memberPerms = [],
        type = "game"
    }) {
        this.client = client

        const directoryPath = dirname(fileURLToPath(directory))
        const category = (directoryPath ? directoryPath.split(sep) [parseInt(directoryPath.split(sep).length - 1, 10)] : null)

        this.help = {
            name,
            nameLocalizations,
            description,
            descriptionLocalizations,
            category
        }

        this.config = {
            enabled,
            options,
            debug,
            forceCheck,
            botPerms,
            memberPerms,
            type
        }
    }
}
