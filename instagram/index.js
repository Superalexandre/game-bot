import { Message, Client, Chat, Attachment } from "@androz2091/insta.js"
import LikeCollector from "./LikeCollector.js"
import { inspect } from "util"
import Canvas from "canvas"
import Gif from "gifenc"
import ytdl from "ytdl-core"

//* Init createLikeCollector
Message.prototype.createLikeCollector = (message, options) => {
    const collector = new LikeCollector(message, options)
    return collector
}

const client = new Client()

client.on("connected", () => {
    console.log(`Logged in as ${client.user.username}`)
})

client.on("messageCreate", async(message) => {
    if (!message || !message.content) return
    if (message.author.id === client.user.id) return

    const args = message.content.split(/ +/g).slice(1)
    const argsOptions = message.content.split(/--([a-z]+) ([a-z]+)/gm).slice(1)

    await message.markSeen()

    if (message.content.startsWith("!video")) {

    } else if (message.content.startsWith("!puissance4") || message.content.startsWith("!p4")) {
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
    } else if (message.content.startsWith("!eval") && message.author.id === 18291915089) {
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

/*
! Problem : Cannot send a gif 

async function replay({ message, userData, opponentData, gameData, client }) {
    const collector = message.createMessageCollector({
        filter: (msg) => [opponentData.id, userData.id].includes(msg.author.id),
        idle: 60000
    })

    collector.on("message", async(msg) => {
        if (["gif", "replay"].includes(msg.content.toLowerCase())) {
            await collector.end()

            const width = 1000
            const height = 1000

            //* Gif
            const gif = Gif.GIFEncoder()

            //* Canvas
            const canvas = Canvas.createCanvas(width, height)
            const ctx = canvas.getContext("2d")

            const fontSize = width / 25

            //* Text
            ctx.fillStyle = "#FFFFFF"
            ctx.font = `${fontSize}px 'Arial'`
            const text = `Replay de ${gameData.players[0].username} contre ${gameData.players[1].username}`
            const textWidth = ctx.measureText(text).width

            ctx.fillText(text, (canvas.width/2) - (textWidth / 2), 50)

            //* Credit
            ctx.font = `${fontSize - 2}px 'Arial'`
            ctx.fillText(`Replay par ${client.user.username}`, width / 20, height - 20)

            for (let i = 0; i < gameData.actions.length; i++) {
                for (let j = 0; j < gameData.actions[i].length; j++) {
                    for (let k = 0; k < gameData.actions[i][j].length; k++) {

                        if (gameData.actions[0][j][k].endsWith("_placed") || (gameData.actions[i][j][k] === "⚪" && i > 0)) continue

                        const widthImage = width / 10
                        const heightImage = height / 10

                        const jLength = gameData.actions[i][j].length
                        const iLength = gameData.actions[i].length

                        const x = (width - (jLength * widthImage)) / 2
                        const y  = (height - (iLength * heightImage)) / 2
            
                        ctx.beginPath()
                        ctx.arc(x + k * widthImage, y + j * heightImage, (height / 10) / 2, 0, Math.PI * 2, true)
                        ctx.fillStyle = gameData.actions[i][j][k] === "🔴" ? "#DD2E44" : gameData.actions[i][j][k] === "🟡" ? "#FDCB58" : "#FFFFFF"
                        ctx.fill()

                        if (gameData.actions[0][j][k] !== "⚪") gameData.actions[0][j][k] = `${gameData.actions[i][j][k]}_placed`
                    }
                }

                const { data, width: widhthCtx, height: heightCtx } = ctx.getImageData(0, 0, width, height)
                const palette = Gif.quantize(data, 256)
                const index = Gif.applyPalette(data, palette)

                gif.writeFrame(index, widhthCtx, heightCtx, { palette, transparent: true, delay: 1500, repeat: 0 })
            }

            gif.finish()

            const bytes = gif.bytes()
            const buffer = Buffer.from(bytes)

            
        } else await collector.end()
    })

    collector.on("end", (reason) => {
        if (reason === "idle") return
    })
}
*/

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

client.login("sudrefb", "sudrefb1234")