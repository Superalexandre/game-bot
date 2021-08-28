const { EventEmitter } = require("events")

module.exports = class LikeCollector extends EventEmitter {
    constructor (message, { filter, idle }) {
        super()

        this.client = message.chat.client
        this.message = message
        this.chat = message.chat
        this.filter = filter || (() => true)
        this.idle = idle || 10000
        if (idle) this._idleTimeout = setTimeout(() => this.end("idle"), this.idle)

        this.ended = false

        this.handleLike = this.handleLike.bind(this)
        this.client.on("likeAdd", this.handleLike)
    }

    async handleLike (user, message) {
        if (this.ended) return

        const valid = await this.filter(user) && this.message.id === message.id
        
        if (valid) {
            this.emit("likeAdded", user, message)

            if (this._idleTimeout && !this.ended) {
                clearTimeout(this._idleTimeout)
                this._idleTimeout = setTimeout(() => this.end("idle"), this.idle)
            }
        }
    }

    async end (reason) {
        this.ended = true

        if (this._idleTimeout) clearTimeout(this._idleTimeout)

        this.client.removeListener("likeAdd", this.handleLike)
        this.emit("end", reason)
    }

    toJSON () {
        return {
            client: this.client.toJSON(),
            chatID: this.chat.id,
            ended: this.ended
        }
    }
}