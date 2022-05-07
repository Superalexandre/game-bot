export default class pendingRequest {
    constructor(client) {
        this.client = client
    }

    async run(chat) {
        const client = this.client

        await chat.approve()

        await client.logger.log(`Message approuvé ${chat.id}`)
    }
}