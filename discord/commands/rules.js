import { Command } from "../structures/Command.js"

export default class Rules extends Command {
    constructor(client) {
        super(client, {
            name: "rules",
            description: "Affiche les règles du jeu que vous desirez",
            debug: true,
            forceCheck: true,
            options: [
                {
                    type: "STRING",
                    name: "game",
                    description: "Nom du jeu",
                    required: true
                }
            ],
            directory: import.meta.url,
            type: "utils"
        })
    }

    async run({ interaction }) {
        await interaction.editReply({
            content: "Aucune règle n'est disponible pour le moment"
        })
    }
}
