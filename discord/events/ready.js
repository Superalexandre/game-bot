export default class Ready {
    constructor(client) {
        this.client = client
    }

    async run() {
        const client = this.client

        //Todo check commands

        client.logger.log({ message: "Client prêt !" })
    }
}