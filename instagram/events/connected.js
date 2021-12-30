export default class connected {
    constructor(client) {
        this.client = client
    }

    async run() {
        const client = this.client
    
        client.logger.log({ message: `Client prêt (${client.user.username})` })
    
        const pendingChat = client.cache.pendingChats
        for (const [chatId, chat] of pendingChat.entries()) {
        
            await chat.approve().catch(() => {
                return
            })

            client.logger.warn({ message: `Message approuvé ${chatId}` })
        }
    }
}