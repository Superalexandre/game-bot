module.exports = class clickButton {
    constructor(client) {
        this.client = client
    }

    async run(button) {
        const client = this.client
        const id = button.customId.split("_")

        if (id[1] === "uno" && id.includes("ephemeral")) {
            const gameID = id[3]
            const command = client.commands.get(id[1])

            command.playCard({ client, gameID, button })
        }
    }
}