//import fetch from "node-fetch"

export default class Ready {
    constructor(client) {
        this.client = client
    }

    async run() {
        const client = this.client
        const config = client.config

        /*
        const apiUrl = "https://discord.com/api/v8"
        const endPoint = `/applications/${config.discord.appId}/commands`
        const commands = await fetch(`${apiUrl}${endPoint}`, {
            headers: { 
                Authorization: `Bot ${config.discord.token}`
            },
        })
        const jsonCommands = await commands.json()

        console.log(jsonCommands)
        */

        client.logger.log({ message: `Client prêt (${client.user.username}#${client.user.discriminator})`  })
    }
}