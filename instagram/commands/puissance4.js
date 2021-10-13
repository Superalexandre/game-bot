import Command from "../structures/Command.js"

export default class Puissance4 extends Command {
    constructor(client) {
        super(client, {
            name: "puissance4",
            desc: (i18n) => i18n.__("insta.puissance4.desc"),
            directory: import.meta.url,
            use: (i18n) => i18n.__("insta.puissance4.usage"),
            example: (i18n) => i18n.__("insta.puissance4.example"),
            aliases: ["p4"]
        })
    }

    async run({ message, args, argsOptions, i18n }) {
        return message.chat.sendMessage("En cours")
    }
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