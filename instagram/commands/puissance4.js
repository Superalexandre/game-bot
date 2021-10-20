import { Command } from "../structures/Command.js"

export default class Puissance4 extends Command {
    constructor(client) {
        super(client, {
            name: "puissance4",
            desc: (i18n) => i18n.__("insta.puissance4.description"),
            directory: import.meta.url,
            use: (i18n) => i18n.__("insta.puissance4.usage"),
            example: (i18n) => i18n.__("insta.puissance4.example"),
            aliases: ["p4"]
        })
    }

    async run({ client, message, args, i18n }) {
        let opponent

        try {
            opponent = await client.fetchUser(args[0])
        } catch(error) {
            return await message.chat.sendMessage(i18n.__("insta.puissance4.error.noUser"))
        }

        if (!message.chat.isGroup) return await message.chat.sendMessage(i18n.__("insta.puissance4.error.noGroup"))
    
        if (message.author.id === opponent.id) return await message.chat.sendMessage(i18n.__("insta.puissance4.error.sameUser"))

        if (opponent.id === client.user.id) return await message.chat.sendMessage(i18n.__("insta.puissance4.error.bot"))
    
        if (!message.chat.users.has(opponent.id)) return await message.chat.sendMessage(i18n.__("insta.puissance4.error.notInGroup"))

        if (message.chat.puissance4) return await message.chat.sendMessage(i18n.__("insta.puissance4.error.alreadyGame", { username: message.author.username }))

        return opponentReady({ client, message, opponent, i18n })
    }
}

async function opponentReady({ client, message, opponent, i18n }) {
    const msg = await message.chat.sendMessage(i18n.__("insta.puissance4.opponentReady", { opponentUsername: opponent.username, authorUsername: message.author.username }))

    const filter = (like) => [opponent.id, message.author.id].includes(like.id)
    const collector = message.createLikeCollector(msg, { filter })

    collector.on("likeAdded", async(like) => {
        await collector.end()

        if (like.id === message.author.id) return await message.chat.sendMessage(i18n.__("insta.puissance4.userUndoGame", { authorUsername: message.author.username }))

        return startGame({ client, message, opponent, i18n })
    })
}

async function startGame({ client, message, opponent, i18n }) {
    message.chat.puissance4 = true

    let board = [
        ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
        ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
        ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
        ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
        ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"]
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

    const text = (user, opponent, error) => `${i18n.__("insta.puissance4.turnOf")} ${user.turn ? user.username : opponent.username} (${user.turn ? user.emoji : opponent.emoji}) ${error ? "\n" + error : ""}\n\n`
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

            return await message.chat.sendMessage(i18n.__("insta.puissance4.gameStop", { authorUsername: msg.author.username }))
        }

        const activeUser = userData.id === msg.author.id ? userData : opponentData
        const opposite = userData.id === msg.author.id ? opponentData : userData

        if (!activeUser.turn) return

        const added = add({ board, emoji: activeUser.emoji, row: parseInt(msg.content) - 1 })

        if (added && added.error) {
            if (added.error === "row_full") return await message.chat.sendMessage(i18n.__("insta.puissance4.error.cantPlayHere") + added.string)

            return await message.chat.sendMessage(i18n.__("insta.puissance4.error.unknownError") + added.string)
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

            await client.functions.gameStats({ 
                data: client.data, 
                plateform: "instagram", 
                user1: userData, 
                user2: opponentData, 
                gameName: "puissance4", 
                winnerId: winner.id
            })

            return await message.chat.sendMessage(`${i18n.__("insta.puissance4.result.win", { winnerUsername: winner.username, winnerEmoji: winner.emoji, looserUsername: looser.username, looserEmoji: looser.emoji })}\n` + formatedBoard.string)
        }

        if (formatedBoard.allFill) {
            message.chat.puissance4 = false
            await collector.end()

            await client.functions.gameStats({ 
                data: client.data, 
                plateform: "instagram", 
                user1: userData, 
                user2: opponentData, 
                gameName: "puissance4", 
                winnerId: "equality"
            })

            return await message.chat.sendMessage(`${i18n.__("insta.puissance4.result.equality", { userDataUsername: userData.username, userDataEmoji: userData.emoji, opponentDataUsername: opponentData.username, opponentDataEmoji: opponentData.emoji })}\n` + formatedBoard.string)
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