const { EventEmitter } = require('events')

class LikeCollector extends EventEmitter {
    constructor (chat, { filter, idle }) {
        super()

        this.client = chat.client
        this.chat = chat
        this.filter = filter || (() => true)
        this.idle = idle || 10000
        if (idle) this._idleTimeout = setTimeout(() => this.end('idle'), this.idle)

        this.ended = false

        this.handleLike = this.handleLike.bind(this)
        this.client.on("likeAdd", this.handleLike)
    }

    async handleLike (message) {
        if (this.ended) return
        const valid = await this.filter(message)// && message.chatID === this.chat.id
        if (valid) {
            this.emit('likeAdded', message)

            if (this._idleTimeout && !this.ended) {
                clearTimeout(this._idleTimeout)
                this._idleTimeout = setTimeout(() => this.end('idle'), this.idle)
            }
        }
    }

    /**
     * End the collector
     * @param {string} reason The reason the collector ended
     */
    async end (reason) {
        this.ended = true
        if (this._idleTimeout) {
            clearTimeout(this._idleTimeout)
        }
        this.client.removeListener('likeAdd', this.handleLike)
        this.emit('end', reason)
    }

    toJSON () {
        return {
            client: this.client.toJSON(),
            chatID: this.chat.id,
            ended: this.ended
        }
    }
}

module.exports = LikeCollector