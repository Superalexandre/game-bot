export default class messageCreate {
    constructor(client) {
        this.client = client
    }

    async run(message) {
        const client = this.client
    
        if (!message || !message.content) return
        if (message.author.id === client.user.id) return

        const prefix = client.config.instagram.prefix
        const command = message.content.split(" ")[0].slice(prefix).toLowerCase()
        const args = message.content.split(/ +/g).slice(1)
        const argsOptions = message.content.split(/--([a-z]+) ([a-z]+)/gm).slice(1)

        await message.markSeen()

        const cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command))

        console.log(cmd)
    }
}

/*

    client.on("messageCreate", async(message) => {

        if ([`${prefix}puissance4`, `${prefix}p4`, `${prefix}eval`].includes(message.content)) client.logger.commandLog({ 
            interactionId: message.id,
            commandName: command,
            prefix: ""
        })

        if (message.content.startsWith(`${prefix}puissance4`) || message.content.startsWith(`${prefix}p4`)) {
            let opponent
            
            try {
                opponent = await client.fetchUser(args[0])
            } catch(error) {
                return await message.chat.sendMessage("Aucun utilisateur n'a été trouvé")
            }

            if (!message.chat.isGroup) return await message.chat.sendMessage("Oh non vous devez être dans un groupe pour effectuer cette commande")
        
            if (message.author.id === opponent.id) return await message.chat.sendMessage("Vous ne pouvez pas jouer contre vous meme !")

            if (opponent.id === client.user.id) return await message.chat.sendMessage("Vous ne pouvez pas jouer contre moi")
        
            if (!message.chat.users.has(opponent.id)) return await message.chat.sendMessage("La personne doit être presente dans le groupe")

            if (message.chat.puissance4) return await message.chat.sendMessage(`Désolé @${message.author.username} une partie est deja en cours`)

            return opponentReady({ message, opponent })    
        } else if (message.content.startsWith(`${prefix}eval`) && message.author.id === 18291915089) {
            if (!args[0]) return await message.chat.sendMessage("Veuillez saisir un argument")
            let toExecute = message.content.split(" ").slice(1)

            if (argsOptions.length > 0) toExecute = toExecute.slice(0, toExecute.length - (argsOptions.length - 1))

            const content = toExecute.join(" ")
            const result = new Promise((resolve) => resolve(eval(content)))

            return result.then(async(output) => {
                if (typeof output !== "string") output = inspect(output, { depth: 0 })
                
                if (argsOptions[0] === "result" && !["yes", "true"].includes(argsOptions[1])) return 

                return await message.chat.sendMessage(output)
            }).catch(async(err) => {
                err = err.toString()
                
                return await message.chat.sendMessage(err)
            })
        }
    })
*/
