module.exports = class clickButton {
    constructor(client) {
        this.client = client
    }

    async run(button) {
        console.log(2)

        const client = this.client
        const id = button.customId.split("_")

        return true
        //Error

        if (id[1] === "uno" && id.includes("ephemeral")) {
            const gameID = id[3]
            const command = client.commands.get(id[1])

            command.playCard({ client, gameID, button })

            //client.games.uno.get("1")
        }
    }
}