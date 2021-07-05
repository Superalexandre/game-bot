const Command = require("../structures/Command")
const { MessageButton, MessageActionRow } = require("discord-buttons")

module.exports = class Morpion extends Command {
    constructor(client) {
        super(client, {
            name: "morpion",
            //desc: (i18n) => i18n.__("discord.help.desc"),
            directory: __dirname,
            //use: (i18n) => i18n.__("discord.help.use"),
            //example:(i18n) => i18n.__("discord.help.example"),
        })
    }

    async run({ client, message, args, i18n, data, userData, util }) {
        const opponent = message.mentions.users.first()

        if (!opponent) return playWithBot({ i18n, message, client })

        if (opponent.bot || opponent.id === message.author.id) return message.channel.send("Merci de saisir un adversaire valide !")

        const ready = new MessageButton()
            .setStyle("green")
            .setLabel("Oui")
            .setID(`game_morpion_${message.author.id}_${opponent.id}_ready`)
    
        const notReady = new MessageButton()
            .setStyle("red")
            .setLabel("Non")
            .setID(`game_morpion_${message.author.id}_${opponent.id}_notready`)

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
        .setID(`game_morpion_${message.author.id}_yes`)

    const no = new MessageButton()
        .setStyle("red")
        .setLabel("Non")
        .setID(`game_morpion_${message.author.id}_no`)

    const row = new MessageActionRow()
        .addComponent(yes)
        .addComponent(no)

    const msg = await message.channel.send(`Vous n'avez pas saisi d'adversaire voulez vous jouer contre moi ?`, {
        components: [row]
    })

    const collector = msg.createButtonCollector((button) => button)

    collector.on("collect", async(button) => {
        if (!button.clicker || !button.clicker.user || !button.clicker.user.id) await button.clicker.fetch()

        if (button.clicker.user.id !== message.author.id) return await button.reply.send(`Désolé mais ce n'est pas votre partie, pour en lancer une faites !morpion @Joueur`, true)

        if (button.id.endsWith("no")) {
            await collector.stop()
            await button.defer()

            return msg.edit(`${message.author.username} ne veut pas jouer contre moi :(`, null)
        } else {
            await collector.stop()
            await button.defer()

            return startGame({ i18n, message, msg, opponent: client.user, client })
        }
    })
}

async function opponentReady({ i18n, message, msg, opponent, client }) {
    const collector = msg.createButtonCollector((button) => button)

    collector.on("collect", async(button) => {
        if (!button.clicker || !button.clicker.user || !button.clicker.user.id) await button.clicker.fetch()

        if (button.clicker.user.id !== opponent.id) return await button.reply.send(`Désolé mais ce n'est pas votre partie, pour en lancer une faites !morpion @Joueur`, true)

        if (button.id.endsWith("notready")) {
            await collector.stop()
            await button.defer()

            return msg.edit(`${opponent.username} n'est pas prêt`, null)
        } else {
            await collector.stop()
            await button.defer()

            return whoStart({ i18n, message, msg, opponent, client })
        }
    })
}

async function whoStart({ i18n, message, msg, opponent, client }) {
    const userStart = new MessageButton()
        .setStyle("blurple")
        .setLabel("Vous (" + message.author.username + ")")
        .setID(`game_morpion_${message.author.id}_${opponent.id}_user`)

    const opponentStart = new MessageButton()
        .setStyle("blurple")
        .setLabel(opponent.username)
        .setID(`game_morpion_${message.author.id}_${opponent.id}_opponent`)

    const random = new MessageButton()
        .setStyle("blurple")
        .setLabel("Aléatoire")
        .setID(`game_morpion_${message.author.id}_${opponent.id}_random`)

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

        if (button.clicker.user.id !== message.author.id) return await button.reply.send(`Désolé mais ce n'est pas votre partie, pour en lancer une faites !morpion @Joueur`, true)

        if (button.id.endsWith("opponent")) {
            opponent.turn = true
        } else if (button.id.endsWith("user")) {
            opponent.turn = false
        } else if (button.id.endsWith("random")) {
            const random = Math.floor(Math.random() * (2 - 1 + 1)) + 1

            opponent.turn = random === 1 ? true : false
        } else return msg.edit("Erreur inconnue")
    
        await collector.stop()
        await button.defer()
        return startGame({ i18n, message, msg, opponent, client })
    })
}

async function startGame({ i18n, message, msg, opponent, client }) {
    let userData = {
        id: message.author.id,
        username: message.author.username,
        turn: opponent.turn ? false : true,
        emoji: "❌",
        customEmote: "855726987183915008",
        customEmoteWin: "855726954338582579"
    }
    
    let opponentData = {
        id: opponent.id,
        username: opponent.username,
        turn: opponent.turn,
        emoji: "⭕",
        customEmote: "855726553919914004",
        customEmoteWin: "855726782288363521"
    }

    const text = (user, opponent) => `Tour de : ${user.turn ? user.username : opponent.username} (${user.turn ? user.emoji : opponent.emoji})`

    let board = [
        [ "", "", "" ],
        [ "", "", "" ],
        [ "", "", "" ]
    ]
    
    const genBoard = genButtons({ board, userID: userData.id, opponentID: opponentData.id })
    
    await msg.edit(text(userData, opponentData), {
        components: genBoard.row
    })

    const collector = msg.createButtonCollector((button) => button)

    collector.on("collect", async(button) => {
        if (!button.clicker || !button.clicker.user || !button.clicker.user.id) await button.clicker.fetch()
        if (button.clicker.user.id !== userData.id && button.clicker.user.id !== opponentData.id) return await button.reply.send(`Désolé mais ce n'est pas votre partie, pour en lancer une faites !morpion @Joueur`, true)
    
        const type = button.clicker.user.id === userData.id ? userData : opponentData
        const opposite = button.clicker.user.id === userData.id ? opponentData : userData

        if (!type.turn) return await button.reply.send("Désolé ce n'est pas encore a vous de jouer", true)

        const id = button.id.split("_")
        const line = id[id.length - 2]
        const row = id[id.length - 1]

        board[line][row] = type.emoji
        type.turn = false
        opposite.turn = true

        await button.defer()

        const genBoard = genButtons({ board, userID: userData.id, opponentID: opponentData.id })

        if (!genBoard.win && genBoard.allFill) {
            await collector.stop()

            return msg.edit(`Wow égalité bien joué a vous deux ${userData.username} et ${opponentData.username}`, {
                components: genBoard.row
            })
        }

        if (genBoard.win) {
            await collector.stop()

            return msg.edit(`Wow bien joué a ${genBoard.winner === userData.emoji ? userData.username : opponentData.username} (${genBoard.winner}) il a gagné !`, {
                components: genBoard.row
            })
        }

        await msg.edit(text(userData, opponentData), {
            components: genBoard.row
        })

        if (opponentData.id === client.user.id) {
            type.turn = true
            opposite.turn = false

            botPlay({ board, emoji: opponentData.emoji })
            
            const genBoard = genButtons({ board, userID: userData.id, opponentID: opponentData.id })

            if (!genBoard.win && genBoard.allFill) {
                await collector.stop()
                return msg.edit(`Wow égalité bien joué a vous deux ${userData.username} et ${opponentData.username}`, {
                    components: genBoard.row
                })
            }

            if (genBoard.win) {
                await collector.stop()
                return msg.edit(`Wow bien joué a ${genBoard.winner === userData.emoji ? userData.username : opponentData.username} (${genBoard.winner}) il a gagné !`, {
                    components: genBoard.row
                })
            }

            await msg.edit(text(userData, opponentData), {
                components: genBoard.row
            })
        }
    })
}

function genButtons({ board, userID, opponentID }) {
    let row = [
        new MessageActionRow(),
        new MessageActionRow(),
        new MessageActionRow()
    ]

    let win = false
    let winner = ""
    let allFill = true

    const emoji = {
        "❌": "855726987183915008",
        "⭕": "855726553919914004",
        "❌_win": "855726954338582579",
        "⭕_win": "855726782288363521"
    }

    for (let i = 0; i < board.length; i++) {   
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j] === "") allFill = false

            /* Horizontal */
            if (!win && board[i][j] !== "" && board[i][j] === board[i][j + 1] && board[i][j + 1] === board[i][j + 2]) {
                winner = board[i][j]

                board[i][j] = winner + "_win"
                board[i][j + 1] = winner + "_win"
                board[i][j + 2] = winner + "_win"

                win = true
            /* Vertical */
            } else if (!win && board[i][j] !== "" && board[i]?.[j] === board[i + 1]?.[j] && board[i + 1]?.[j] === board[i + 2]?.[j]) {
                winner = board[i][j]

                board[i][j] = winner + "_win"
                board[i+ 1][j] = winner + "_win"
                board[i+ 2][j] = winner + "_win"
    
                win = true
            /* Diagonal Left top => Bottom right */
            } else if (!win && board[i][j] !== "" && board[i]?.[j] === board[i + 1]?.[j + 1] && board[i + 1]?.[j + 1] === board[i + 2]?.[j + 2]) {
                winner = board[i][j]

                board[i][j] = winner + "_win"
                board[i + 1][j + 1] = winner + "_win"
                board[i + 2][j + 2] = winner + "_win"
    
                win = true
            /* Diagonal Right top => Bottom left */
            } else if (!win && board[i][j] !== "" && board[i]?.[j] === board[i + 1]?.[j - 1] && board[i + 1]?.[j - 1] === board[i + 2]?.[j - 2]) {
                winner = board[i][j]

                board[i][j] = winner + "_win"
                board[i + 1][j - 1] = winner + "_win"
                board[i + 2][j - 2] = winner + "_win"
    
                win = true
            }
    
            const button = new MessageButton()
                .setStyle("blurple")
                .setID(`game_morpion_${userID}_${opponentID}_${i}_${j}`)

            const customEmoji = board[i][j] === "" ? "855364971910397973" : emoji[board[i][j]]
            const disabled = board[i][j] === "" ? false : true

            button.setEmoji(customEmoji)
                .setDisabled(disabled)

            row[i].addComponent(button)
        }
    }

    if (win) {
        for (let i = 0; i < row.length; i++) {
            const buttons = row[i].components

            for (let j = 0; j < buttons.length; j++) {
                buttons[j].setDisabled()
            }
        }
    }

    return { row, win, winner, allFill }
}

async function botPlay({ board, emoji, filter }) {
    let placed = false

    if (!filter) filter = ""

    for (let i = 0; i < board.length; i++) {
        if (placed) break

        for (let j = 0; j < board[i].length; j++) {
            /* Horizontal Left -> right (=>) */
            if (!placed && board[i][j] !== filter && (board[i][j] === board[i][j + 1] || board[i][j] === board[i][j + 2])) {
                if (board[i][j + 1] !== filter && board[i][j + 2] !== filter) continue

                board[i][j + 1] === filter ? board[i][j + 1] = emoji : board[i][j + 2] = emoji

                placed = true
            /* Horizontal Right -> Left (=>) */
            } else if (!placed && board[i][j] !== filter && (board[i][j] === board[i]?.[j - 1] || board[i][j] === board[i]?.[j - 2])) {
                if (board[i]?.[j - 1] !== filter && board[i]?.[j - 2] !== filter) continue

                board[i][j - 1] === filter ? board[i][j - 1] = emoji : board[i][j - 2] = emoji

                placed = true
            /* Vertical Top -> Bottom (v)*/
            } else if (!placed && board[i][j] !== filter && (board[i][j] === board[i + 1]?.[j] || board[i][j] === board[i + 2]?.[j])) {
                if (board[i + 1]?.[j] !== filter && board[i + 2]?.[j] !== filter) continue

                board[i + 1]?.[j] === filter ? board[i + 1][j] = emoji : board[i + 2][j] = emoji

                placed = true
            /* Vertical Bottom -> Top (^)*/
            //} else if (!placed && board[i][j] !== "" && (board[i][j] === board[i - 1]?.[j] || board[i][j] === board[i - 2]?.[j])) {
            //    if (board[i - 2]?.[j] !== "" && board[i - 1]?.[j] !== "") continue
            //
            //    board[i - 2]?.[j] === "" ? board[i - 2][j] = emoji : board[i - 1][j] = emoji
            //
            //    placed = true
            /* Diagonal Top right -> Bottom left */
            //Top left
            } else if (!placed && board[i][j] !== filter && (board[i][j] === board[i + 1]?.[j + 1] || board[i][j] === board[i + 2]?.[j + 2])) {
                if (board[i + 1]?.[j + 1] !== filter && board[i + 2]?.[j + 2] !== filter) continue

                board[i + 1][j + 1] === filter ? board[i + 1][j + 1] = emoji : board[i + 2][j + 2] = emoji

                placed = true
            //Top right
            } else if (!placed && board[i][j] !== filter && (board[i][j] === board[i + 1]?.[j - 1] || board[i][j] === board[i + 2]?.[j - 2])) {
                if (board[i + 1]?.[j - 1] !== filter && board[i + 2]?.[j - 2] !== filter) continue

                board[i + 1][j - 1] === filter ? board[i + 1][j - 1] = emoji : board[i + 2][j - 2] = emoji

                placed = true
            //Bottom left
            } else if (!placed && board[i][j] !== filter && (board[i][j] === board[i - 1]?.[j + 1] || board[i][j] === board[i - 2]?.[j + 2])) {
                if (board[i - 1]?.[j + 1] !== filter && board[i - 2]?.[j + 2] !== filter) continue

                board[i - 1][j + 1] === filter ? board[i - 1][j + 1] = emoji : board[i - 2][j + 2] = emoji

                placed = true
            //Bottom right
            } else if (!placed && board[i][j] !== filter && (board[i][j] === board[i - 1]?.[j - 1] || board[i][j] === board[i - 2]?.[j - 2])) {
                if (board[i - 1]?.[j - 1] !== filter && board[i - 2]?.[j - 2] !== filter) continue

                board[i - 1][j - 1] === filter ? board[i - 1][j - 1] = emoji : board[i - 2][j - 2] = emoji

                placed = true
            }
        }
    }

    if (!placed) {  
        for (let i = 0; i < board.length; i++) {
            if (placed) break

            for (let j = 0; j < board[i].length; j++) {
                if (!placed && board[i][j] === "") {
                    board[i][j] = emoji

                    placed = true
                }
            }
        }
    }
}