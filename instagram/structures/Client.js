import { Collection } from "discord.js"
import { Client as InstaClient, Message } from "@androz2091/insta.js"
import LikeCollector from "./LikeCollector.js"

import config from "../../config.js"
import functions from "../../functions.js"

export class Client extends InstaClient {
    constructor(options) {
        super(options)

        // Collection
        this.commands = new Collection()
        this.aliases = new Collection()
        this.slowmode = new Collection()

        // Config
        this.config = config
        this.functions = functions
    }
}

//* Init createLikeCollector
Message.prototype.createLikeCollector = (message, options) => {
    const collector = new LikeCollector(message, options)
    return collector
}