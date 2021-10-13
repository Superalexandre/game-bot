import Command from "../structures/Command.js"

export default class Eval extends Command {
    constructor(client) {
        super(client, {
            name: "eval",
            directory: import.meta.url,
        })
    }

    async run({  }) {

    }
}