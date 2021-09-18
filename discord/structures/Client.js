import { Client as DiscordClient, Collection } from "discord.js"

import config from "../../config.js"
import functions from "../../functions.js"

export class Client extends DiscordClient {
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
        this.config = config
        this.functions = functions
    }
}