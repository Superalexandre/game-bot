export default class connected {
    constructor(client) {
        this.client = client
    }

    async run() {
        const client = this.client
    
        await client.logger.log(`Client prêt (${client.user.username})`)
    
        const pendingChat = client.cache.pendingChats
        for (const [chatId, chat] of pendingChat.entries()) {
        
            await chat.approve().catch(() => {
                return
            })

            await client.logger.warn(`Message approuvé ${chatId}`)
        }
    }
}