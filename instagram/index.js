import { Message, Client } from "@androz2091/insta.js"
import LikeCollector from "./LikeCollector.js"
import { inspect } from "util"
import config from "../config.js"

//* Init createLikeCollector
Message.prototype.createLikeCollector = (message, options) => {
    const collector = new LikeCollector(message, options)
    return collector
}

import Logger from "../logger.js"
const logger = new Logger({
    mode: config.logger.mode,
    plateform: "Instagram"
})

export default async function init(data, functions) {
    const client = new Client()
    
    logger.log({ message: "Connexion en cours..." })
    client.login(config.instagram.username, config.instagram.password)

    client.data = data
    client.functions = functions
    client.logger = logger

    client.on("warn", (message) => logger.warn({ message: message }))
    client.on("error", (message) => logger.error({ message: message }))

    client.on("connected", async() => {
        
        logger.log({ message: `Client prêt (${client.user.username})` })
    
        const pendingChat = client.cache.pendingChats
        for (const [chatId, chat] of pendingChat.entries()) {
        
            await chat.approve().catch(() => {})

            logger.warn({ message: `Message approuvé ${chatId}` })
        }
    })

    client.on("pendingRequest", async(chat) => {
        await chat.approve()

        logger.log({ message: `Message approuvé ${chat.id}` })
    })

    client.on("messageCreate", async(message) => {
        if (!message || !message.content) return
        if (message.author.id === client.user.id) return

        const prefix = config.instagram.prefix
        const command = message.content.split(" ")[0].slice(prefix).toLowerCase()
        const args = message.content.split(/ +/g).slice(1)
        const argsOptions = message.content.split(/--([a-z]+) ([a-z]+)/gm).slice(1)

        await message.markSeen()

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
}

async function opponentReady({ message, opponent }) {
    const msg = await message.chat.sendMessage(`@${opponent.username} aimez ce message dès que vous êtes prêt(e)\n\n${message.author.username} si vous voulez annuler la demander liker ce message`)

    const filter = (like) => [opponent.id, message.author.id].includes(like.id)
    const collector = message.createLikeCollector(msg, { filter })

    collector.on("likeAdded", async(like) => {
        await collector.end()

        if (like.id === message.author.id) return await message.chat.sendMessage(`${message.author.username} a annuler la demande de partie`)

        return startGame({ message, opponent })
    })
}

async function startGame({ message, opponent }) {
    message.chat.puissance4 = true

    let board = [
        ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
        ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
        ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
        ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
        ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
    ]

    let userData = {
        id: message.author.id,
        username: message.author.username,
        turn: true,
        emoji: "🔴",
        winEmoji: "🔴"
    }
    
    let opponentData = {
        id: opponent.id,
        username: opponent.username,
        turn: false,
        emoji: "🔵",
        winEmoji: "🔵"
    }

    const text = (user, opponent, error) => `Tour de : ${user.turn ? user.username : opponent.username} (${user.turn ? user.emoji : opponent.emoji}) ${error ? "\n" + error : ""}\n\n`
    const formatedBoard = genBoard({ board, userData, opponentData })

    await message.chat.sendMessage(text(userData, opponentData) + formatedBoard.string)

    const filter = (msg) => [opponentData.id, userData.id].includes(msg.author.id) && ["1", "2", "3", "4", "5", "6", "7", "stop"].includes(msg.content.toLowerCase())
    const collector = message.createMessageCollector({ filter })

    const gameData = {
        date: Date.now(),
        players: [userData, opponentData],
        actions: []
    }

    collector.on("message", async(msg) => {
        if (msg.content.toLowerCase() === "stop") {
            message.chat.puissance4 = false
            await collector.end()

            return await message.chat.sendMessage(`${msg.author.username} a décidé d'arreter la partie\nPeut etre un mauvais joueur ?`)
        }

        const activeUser = userData.id === msg.author.id ? userData : opponentData
        const opposite = userData.id === msg.author.id ? opponentData : userData

        if (!activeUser.turn) return

        const added = add({ board, emoji: activeUser.emoji, row: parseInt(msg.content) - 1 })

        if (added && added.error) {
            if (added.error === "row_full") return await message.chat.sendMessage("Vous ne pouvez pas jouer ici " + added.string)

            return await message.chat.sendMessage("Erreur inconnue " + added.string)
        }

        activeUser.turn = false
        opposite.turn = true

        gameData.actions.push(copyArray(added.board))

        const formatedBoard = genBoard({ board, userData, opponentData })

        if (formatedBoard.win) {
            message.chat.puissance4 = false
            await collector.end()

            const winner = formatedBoard.winnerUser.id === userData.id ? userData : opponentData
            const looser = formatedBoard.winnerUser.id === userData.id ? opponentData : userData

            await message.chat.sendMessage(`Wow bien joué ${winner.username} (${winner.emoji}) qui a gagné contre ${looser.username} (${looser.emoji})\n` + formatedBoard.string)
        
            return replay({ message, userData, opponentData, gameData, client })
        }

        if (formatedBoard.allFill) {
            message.chat.puissance4 = false
            await collector.end()

            await message.chat.sendMessage(`${userData.username} (${userData.emoji}) et ${opponentData.username} (${opponentData.emoji}) finissent sur une égalité :(\n` + formatedBoard.string)
        
            return replay({ message, userData, opponentData, gameData, client })
        }

        await message.chat.sendMessage(text(userData, opponentData) + formatedBoard.string)
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

            //* Horizontal
            if (!win && board[i][j] !== "⚪" && board[i][j] === board[i][j + 1] && board[i][j + 1] === board[i][j + 2] && board[i][j + 2] === board[i][j + 3]) {
                winner = board[i][j]

                winnerUser = opponentData.emoji === winner ? opponentData : userData

                board[i][j] = winnerUser.winEmoji
                board[i][j + 1] = winnerUser.winEmoji
                board[i][j + 2] = winnerUser.winEmoji
                board[i][j + 3] = winnerUser.winEmoji

                win = true
            //* Vertical
            } else if (!win && board[i][j] !== "⚪" && board[i]?.[j] === board[i + 1]?.[j] && board[i + 1]?.[j] === board[i + 2]?.[j] && board[i + 2]?.[j] === board[i + 3]?.[j]) {
                winner = board[i][j]

                winnerUser = opponentData.emoji === winner ? opponentData : userData

                board[i][j] = winnerUser.winEmoji
                board[i + 1][j] = winnerUser.winEmoji
                board[i + 2][j] = winnerUser.winEmoji
                board[i + 3][j] = winnerUser.winEmoji

                win = true
            //* Diagonal Left top => Bottom right
            } else if (!win && board[i][j] !== "⚪" && board[i]?.[j] === board[i + 1]?.[j + 1] && board[i + 1]?.[j + 1] === board[i + 2]?.[j + 2] && board[i + 2]?.[j + 2] === board[i + 3]?.[j + 3]) {
                winner = board[i][j]

                winnerUser = opponentData.emoji === winner ? opponentData : userData

                board[i][j] = winnerUser.winEmoji
                board[i + 1][j + 1] = winnerUser.winEmoji
                board[i + 2][j + 2] = winnerUser.winEmoji
                board[i + 3][j + 3] = winnerUser.winEmoji

                win = true
            //* Diagonal Right top => Bottom left
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

function copyArray(array) {
    return JSON.parse(JSON.stringify(array))
}