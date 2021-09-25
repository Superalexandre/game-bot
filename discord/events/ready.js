export default class Ready {
    constructor(client) {
        this.client = client
    }

    async run() {
        const client = this.client

        client.logger.log({ message: "Client connecté" })
    }
}