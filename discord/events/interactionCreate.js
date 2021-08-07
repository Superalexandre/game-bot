module.exports = class interactionCreate {
    constructor(client) {
        this.client = client
    }

    async run(interaction) {
        const client = this.client

        if (!interaction.isCommand()) return

        console.log(interaction)
    }
}