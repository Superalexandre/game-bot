//* Dirname
import { dirname, sep } from "path"
import { fileURLToPath } from "url"

export class Command {
    constructor(client, {
        name = null,
        //desc = (i18n) => i18n.__("discord.noDescProvided"),
        description = "Erreur aucune description fournis",
        directory = false,
        //use = (i18n) => i18n.__("discord.noUseProvided"),
        //example = (i18n) => i18n.__("discord.noExampleProvided"),
        //aliases = [],
        enabled = true,
        debug = false,
        //ownerOnly = false,
        //slowmode = 3,
        options = undefined,

        /*
        {
            type: null,
            name: "Aucun nom pour cette option",
            description: "Aucune description fournis pour cette option",
            required: false,
            choices: []
        }
        */

        botPerms = [],
        memberPerms = []
        //privateMessage = false
    }) {
        this.client = client

        const directoryPath = dirname(fileURLToPath(directory))
        const category = (directoryPath ? directoryPath.split(sep) [parseInt(directoryPath.split(sep).length - 1, 10)] : null)

        this.help = {
            name,
            //desc,
            description,
            category
            //use,
            //example,
            //aliases
        }

        this.config = {
            enabled,
            options,
            debug,
            //ownerOnly,
            //slowmode,
            botPerms,
            memberPerms
            //privateMessage
        }
    }
}
