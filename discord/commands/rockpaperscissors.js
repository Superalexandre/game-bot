const Command = require("../structures/Command")
const { MessageButton, MessageActionRow } = require("discord.js")

module.exports = class Rockpaperscissors extends Command {
    constructor(client) {
        super(client, {
            name: "rockpaperscissors",
            //desc: (i18n) => i18n.__("discord.help.desc"),
            directory: __dirname,
            //use: (i18n) => i18n.__("discord.help.use"),
            //example:(i18n) => i18n.__("discord.help.example"),
            aliases: ["rps"]
        })
    }

    async run({ client, message, args, i18n, data, userData, util }) {
        const opponent = message.mentions.users.first()

        if (!opponent) return playWithBot({ i18n, message, client })

        if (opponent.bot || opponent.id === message.author.id) return message.channel.send("Merci de saisir un adversaire valide !")

        const ready = new MessageButton()
            .setStyle("green")
            .setLabel("Oui")
            .setID(`game_rps_${message.author.id}_${opponent.id}_ready`)
    
        const notReady = new MessageButton()
            .setStyle("red")
            .setLabel("Non")
            .setID(`game_rps_${message.author.id}_${opponent.id}_notready`)

        const msg = await message.channel.send(`${opponent.username} est-vous prêt(e) ?`, {
            buttons: [ready, notReady]
        })

        return opponentReady({ i18n, message, msg, opponent, client })
    }
}

async function playWithBot({ i18n, message, client }) {
    const yes = new MessageButton()
        .setStyle("green")
        .setLabel("Oui")
        .setID(`game_rps_${message.author.id}_yes`)

    const no = new MessageButton()
        .setStyle("red")
        .setLabel("Non")
        .setID(`game_rps_${message.author.id}_no`)

    const row = new MessageActionRow()
        .addComponent(yes)
        .addComponent(no)

    const msg = await message.channel.send(`Vous n'avez pas saisi d'adversaire voulez vous jouer contre moi ?`, {
        components: [row]
    })

    const collector = msg.createButtonCollector((button) => button)

    collector.on("collect", async(button) => {
        if (!button.clicker || !button.clicker.user || !button.clicker.user.id) await button.clicker.fetch()

        if (button.clicker.user.id !== message.author.id) return await button.reply.send(`Désolé mais ce n'est pas votre partie, pour en lancer une faites !rps @Joueur`, true)

        if (button.id.endsWith("no")) {
            await collector.stop()
            await button.reply.defer()

            return msg.edit(`${message.author.username} ne veut pas jouer contre moi :(`, null)
        } else {
            await collector.stop()
            await button.reply.defer()

            return startGame({ i18n, message, msg, opponent: client.user, client })
        }
    })
}

async function opponentReady({ i18n, message, msg, opponent, client }) {
    const collector = msg.createButtonCollector((button) => button)

    collector.on("collect", async(button) => {
        if (!button.clicker || !button.clicker.user || !button.clicker.user.id) await button.clicker.fetch()

        if (button.clicker.user.id !== opponent.id) return await button.reply.send(`Désolé mais ce n'est pas votre partie, pour en lancer une faites !rps @Joueur`, true)

        if (button.id.endsWith("notready")) {
            await collector.stop()
            await button.reply.defer()

            return msg.edit(`${opponent.username} n'est pas prêt`, null)
        } else {
            await collector.stop()
            await button.reply.defer()

            return startGame({ i18n, message, msg, opponent, client })
        }
    })
}

async function startGame({ i18n, message, msg, opponent, client }) {
    let userData = {
        id: message.author.id,
        username: message.author.username,
        choice: ""
    }
    
    let opponentData = {
        id: opponent.id,
        username: opponent.username,
        choice: ""
    }
    
    const win = {
        paper: "rock",
        scissors: "paper",
        rock: "scissors"
    }

    const choices = ["rock", "paper", "scissors"]

    if (opponent.id === client.user.id) opponentData.choice = choices[Math.floor(Math.random() * choices.length)]

    const rock = new MessageButton()
        .setStyle("blurple")
        .setLabel("Pierre")
        .setID(`game_rps_${message.author.id}_${opponent.id}_rock`)

    const paper = new MessageButton()
        .setStyle("blurple")
        .setLabel("Feuille")
        .setID(`game_rps_${message.author.id}_${opponent.id}_paper`)

    const scissors = new MessageButton()
        .setStyle("blurple")
        .setLabel("Ciseaux")
        .setID(`game_rps_${message.author.id}_${opponent.id}_scissors`)

    const row = new MessageActionRow()
        .addComponent(rock)
        .addComponent(paper)
        .addComponent(scissors)

    const text = (user, opponent) => `C'est le moment des choix ! (Attention après vous ne pouvez pas changé)\n\n${user.username} ${user.choice ? "✅" : "❌"}\n${opponent.username} ${opponent.choice ? "✅" : "❌"}`

    await msg.edit(text(userData, opponentData), {
        components: [row]
    })

    const collector = msg.createButtonCollector((button) => button)

    collector.on("collect", async(button) => {
        if (!button.clicker || !button.clicker.user || !button.clicker.user.id) await button.clicker.fetch()

        if (![message.author.id, opponent.id].includes(button.clicker.user.id)) return await button.reply.send(`Désolé mais ce n'est pas votre partie, pour en lancer une faites !rps @Joueur`, true)

        const uId = button.clicker.user.id
        const id = button.id.split("_")

        if (uId === opponentData.id && !opponentData.choice) {
            opponentData.choice = id[id.length - 1]
        } else if (uId === userData.id && !userData.choice) {
            userData.choice = id[id.length - 1]
        }

        await button.reply.defer()

        await msg.edit(text(userData, opponentData), {
            components: [row]
        })

        if (opponentData.choice && userData.choice) {
            await collector.stop()

            if (opponentData.choice === userData.choice) {
                msg.edit(`**${userData.username}** contre **${opponentData.username}**\nRésultat : Egalité ! (Ils ont tout les deux fait __${opponentData.choice}__)`, null)
            } else if (win[opponentData.choice] === userData.choice) {
                msg.edit(`**${userData.username}** contre **${opponentData.username}**\nRésultat : **${opponentData.username}** a gagné avec __${opponentData.choice}__ ! (**${userData.username}** a fait __${userData.choice}__)`, null)
            } else if (win[userData.choice] === opponentData.choice) {
                msg.edit(`**${userData.username}** contre **${opponentData.username}**\nRésultat : **${userData.username}** a gagné avec __${userData.choice}__ ! (**${opponentData.username}** a fait __${opponentData.choice}__)`, null)
            } else msg.edit("Une erreur est survenue", null)
        }
    })
}