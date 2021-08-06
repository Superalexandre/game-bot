const { Client: DiscordClient, Collection } = require("discord.js")

module.exports = class Client extends DiscordClient {
    constructor(options) {
        super(options)

        // Collection
        this.commands = new Collection()
        this.aliases = new Collection()
        this.slowmode = new Collection()
        this.games = {
            uno: new Collection()
        }

        // Config
        this.config = require("../../config")
        this.functions = require("../../functions")
    }
}