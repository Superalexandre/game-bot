export default class pendingRequest {
    constructor(client) {
        this.client = client
    }

    async run(chat) {
        const client = this.client

        await chat.approve()

        client.logger.log({ message: `Message approuvé ${chat.id}` })
    }
}