const Command = require("../structures/Command")
const { MessageButton, MessageActionRow } = require("discord-buttons")

module.exports = class Puissance4 extends Command {
    constructor(client) {
        super(client, {
            name: "puissance4",
            //desc: (i18n) => i18n.__("discord.help.desc"),
            directory: __dirname,
            //use: (i18n) => i18n.__("discord.help.use"),
            //example:(i18n) => i18n.__("discord.help.example"),
            aliases: ["p4"]
        })
    }

    async run({ client, message, args, i18n, data, userData, util }) {
        const opponent = message.mentions.users.first()

        if (!opponent) return playWithBot({ i18n, message, client })

        if (opponent.bot || opponent.id === message.author.id) return message.channel.send("Merci de saisir un adversaire valide !")

        const ready = new MessageButton()
            .setStyle("green")
            .setLabel("Oui")
            .setID(`game_puissance4_${message.author.id}_${opponent.id}_ready`)
    
        const notReady = new MessageButton()
            .setStyle("red")
            .setLabel("Non")
            .setID(`game_puissance4_${message.author.id}_${opponent.id}_notready`)

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
        .setID(`game_puissance4_${message.author.id}_yes`)

    const no = new MessageButton()
        .setStyle("red")
        .setLabel("Non")
        .setID(`game_puissance4_${message.author.id}_no`)

    const row = new MessageActionRow()
        .addComponent(yes)
        .addComponent(no)

    const msg = await message.channel.send(`Vous n'avez pas saisi d'adversaire voulez vous jouer contre moi ?`, {
        components: [row]
    })

    const collector = msg.createButtonCollector((button) => button)

    collector.on("collect", async(button) => {
        if (!button.clicker || !button.clicker.user || !button.clicker.user.id) await button.clicker.fetch()

        if (button.clicker.user.id !== message.author.id) return await button.reply.send(`Désolé mais ce n'est pas votre partie, pour en lancer une faites !puissance4 @Joueur`, true)

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

        if (button.clicker.user.id !== opponent.id) return await button.reply.send(`Désolé mais ce n'est pas votre partie, pour en lancer une faites !puissance4 @Joueur`, true)

        if (button.id.endsWith("notready")) {
            await collector.stop()
            await button.reply.defer()

            return msg.edit(`${opponent.username} n'est pas prêt`, null)
        } else {
            await collector.stop()
            await button.reply.defer()

            return whoStart({ i18n, message, msg, opponent, client })
        }
    })
}

async function whoStart({ i18n, message, msg, opponent, client }) {
    const userStart = new MessageButton()
        .setStyle("blurple")
        .setLabel("Vous (" + message.author.username + ")")
        .setID(`game_puissance4_${message.author.id}_${opponent.id}_user`)

    const opponentStart = new MessageButton()
        .setStyle("blurple")
        .setLabel(opponent.username)
        .setID(`game_puissance4_${message.author.id}_${opponent.id}_opponent`)

    const random = new MessageButton()
        .setStyle("blurple")
        .setLabel("Aléatoire")
        .setID(`game_puissance4_${message.author.id}_${opponent.id}_random`)

    const row = new MessageActionRow()
        .addComponent(userStart)
        .addComponent(opponentStart)
        .addComponent(random)

    await msg.edit(`${message.author.username}, Qui doit commencer ?`, {
        components: [row]
    })

    const collector = msg.createButtonCollector((button) => button)

    collector.on("collect", async(button) => {
        if (!button.clicker || !button.clicker.user || !button.clicker.user.id) await button.clicker.fetch()

        if (button.clicker.user.id !== message.author.id) return await button.reply.send(`Désolé mais ce n'est pas votre partie, pour en lancer une faites !puissance4 @Joueur`, true)

        if (button.id.endsWith("opponent")) {
            opponent.turn = true
        } else if (button.id.endsWith("user")) {
            opponent.turn = false
        } else if (button.id.endsWith("random")) {
            const random = Math.floor(Math.random() * (2 - 1 + 1)) + 1

            opponent.turn = random === 1 ? true : false
        } else return msg.edit("Erreur inconnue")
    
        await collector.stop()
        await button.reply.defer()
        return startGame({ i18n, message, msg, opponent, client })
    })
}

async function startGame({ i18n, message, msg, opponent, client }) {
    let board = [
        ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
        ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
        ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
        ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
        ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
        ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
    ]

    let userData = {
        id: message.author.id,
        username: message.author.username,
        turn: opponent.turn ? false : true,
        emoji: "🔴",
        winEmoji: "<a:Sudref_Red_White:723485311467913239>"
    }
    
    let opponentData = {
        id: opponent.id,
        username: opponent.username,
        turn: opponent.turn,
        emoji: "🟡",
        winEmoji: "<a:Sudref_Yellow_White:723485311954452501>"
    }

    await msg.edit("Veuillez patienter quelque seconde, le temps de la mise en place des réactions", null)

    const emoteNumber = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣"]

    for (let i = 0; i < emoteNumber.length; i++) await msg.react(emoteNumber[i])

    const text = (user, opponent, error) => `Tour de : ${user.turn ? user.username : opponent.username} (${user.turn ? user.emoji : opponent.emoji}) ${error ? "\n" + error : ""}\n\n`

    const formatedBoard = genBoard({ board, userData, opponentData })

    await msg.edit(text(userData, opponentData) + formatedBoard.string, null)

    const collector = msg.createReactionCollector((reaction, user) => [userData.id, opponentData.id].includes(user.id) && emoteNumber.includes(reaction.emoji.name))

    collector.on("collect", async(reaction, user) => {
        const activeUser = userData.id === user.id ? userData : opponentData
        const opposite = userData.id === user.id ? opponentData : userData

        if (!activeUser.turn) return

        const emoteNumber = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣"]
        const playRow = emoteNumber.indexOf(reaction.emoji.name)

        const added = add({ board, emoji: activeUser.emoji, row: playRow })

        await reaction.users.remove(user.id)

        if (added && added.error) {
            if (added.error === "row_full") return await msg.edit(text(userData, opponentData, "Vous ne pouvez pas jouer ici !") + added.string, null)
            
            return await msg.edit(text(userData, opponentData, "Une erreur inconnu est survenue") + added.string, null)
        }

        activeUser.turn = false
        opposite.turn = true

        const formatedBoard = genBoard({ board, userData, opponentData })

        if (formatedBoard.win) {
            await collector.stop()
            await msg.reactions.removeAll()

            return await msg.edit(`Wow bien joué ${formatedBoard.winnerUser.id === userData.id ? userData.username : opponentData.username} (${formatedBoard.winnerUser.id === userData.id ? userData.emoji : opponentData.emoji}) qui a gagné contre ${formatedBoard.winnerUser.id === userData.id ? opponentData.username : userData.username} (${formatedBoard.winnerUser.id === userData.id ? opponentData.emoji : userData.emoji})\n` + formatedBoard.string, null)
        }

        if (formatedBoard.allFill) {
            await collector.stop()
            await msg.reactions.removeAll()

            return await msg.edit(`${formatedBoard.winnerUser.id === userData.id ? userData.username : opponentData.username} (${formatedBoard.winnerUser.id === userData.id ? userData.emoji : opponentData.emoji}) et ${formatedBoard.winnerUser.id === userData.id ? opponentData.username : userData.username} (${formatedBoard.winnerUser.id === userData.id ? opponentData.emoji : userData.emoji}) finissent sur une égalité :(\n` + formatedBoard.string, null)
        }

        await msg.edit(text(userData, opponentData) + formatedBoard.string, null)

        if (opponentData.id === client.user.id) {
            type.turn = true
            opposite.turn = false

            const rowToPlay = await botPlay({ board, emoji: opposite.emoji })
            const added = add({ board, emoji: opposite.emoji, row: rowToPlay })

            if (added && added.error) {
                if (added.error === "row_full") return await msg.edit(text(userData, opponentData, "Vous ne pouvez pas jouer ici !") + added.string, null)
                
                return await msg.edit(text(userData, opponentData, "Une erreur inconnu est survenue") + added.string, null)
            }

            const formatedBoard = genBoard({ board, userData, opponentData })

            if (formatedBoard.win) {
                await collector.stop()

                console.log("WIN")
            }

            await msg.edit(text(userData, opponentData) + formatedBoard.string, null)
        }
    })
}

function genBoard({ board, userData, opponentData }) {
    let win = false
    let winner = ""
    let allFill = true
    let string = ""
    let winnerUser = ""

    const emoteNumber = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣"]

    for (let i = 0; i < board.length; i++) {   
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j] === "⚪") allFill = false

            /* Horizontal */
            if (!win && board[i][j] !== "⚪" && board[i][j] === board[i][j + 1] && board[i][j + 1] === board[i][j + 2] && board[i][j + 2] === board[i][j + 3]) {
                winner = board[i][j]

                winnerUser = opponentData.emoji === winner ? opponentData : userData

                board[i][j] = winnerUser.winEmoji
                board[i][j + 1] = winnerUser.winEmoji
                board[i][j + 2] = winnerUser.winEmoji
                board[i][j + 3] = winnerUser.winEmoji

                win = true
            /* Vertical */
            } else if (!win && board[i][j] !== "⚪" && board[i]?.[j] === board[i + 1]?.[j] && board[i + 1]?.[j] === board[i + 2]?.[j] && board[i + 2]?.[j] === board[i + 3]?.[j]) {
                winner = board[i][j]

                winnerUser = opponentData.emoji === winner ? opponentData : userData

                board[i][j] = winnerUser.winEmoji
                board[i + 1][j] = winnerUser.winEmoji
                board[i + 2][j] = winnerUser.winEmoji
                board[i + 3][j] = winnerUser.winEmoji

                win = true
            /* Diagonal Left top => Bottom right */
            } else if (!win && board[i][j] !== "⚪" && board[i]?.[j] === board[i + 1]?.[j + 1] && board[i + 1]?.[j + 1] === board[i + 2]?.[j + 2] && board[i + 2]?.[j + 2] === board[i + 3]?.[j + 3]) {
                winner = board[i][j]

                winnerUser = opponentData.emoji === winner ? opponentData : userData

                board[i][j] = winnerUser.winEmoji
                board[i + 1][j + 1] = winnerUser.winEmoji
                board[i + 2][j + 2] = winnerUser.winEmoji
                board[i + 3][j + 3] = winnerUser.winEmoji

                win = true
            /* Diagonal Right top => Bottom left */
            } else if (!win && board[i][j] !== "⚪" && board[i]?.[j] === board[i + 1]?.[j - 1] && board[i + 1]?.[j - 1] === board[i + 2]?.[j - 2] && board[i + 2]?.[j - 2] === board[i + 3]?.[j - 3]) {
                winner = board[i][j]

                winnerUser = opponentData.emoji === winner ? opponentData : userData

                board[i][j] = winnerUser.winEmoji
                board[i + 1][j - 1] = winnerUser.winEmoji
                board[i + 2][j - 2] = winnerUser.winEmoji
                board[i + 3][j - 3] = winnerUser.winEmoji

                win = true
            }

            string += board[i][j]
        }

        if (i === board.length - 1) string += "\n" + emoteNumber.join("")

        string += "\n"
    }

    return { string, win, winner, allFill, winnerUser }
}

function add({ board, emoji, row }) {
    let placed = false
    let string = ""
    const emoteNumber = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣"]

    board.reverse()

    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (!placed && j === row && board[i][j] === "⚪") {
                board[i][j] = emoji

                placed = true
            }
        }
    }
    
    board.reverse()
    
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            string += board[i][j]
        }

        if (i === board.length - 1) string += "\n" + emoteNumber.join("")
        string += "\n"
    }

    if (!placed) return { error: "row_full", board, string }

    return { board, string }
}