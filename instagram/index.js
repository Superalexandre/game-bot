const Insta = require("@androz2091/insta.js")
const LikeCollector = require("./LikeCollector")
const Message = Insta.Message

Message.prototype.createLikeCollector = (chat, options) => {
    const collector = new LikeCollector(chat, options)
    return collector
}

const client = new Insta.Client()

client.on("connected", () => {
    console.log(`Logged in as ${client.user.username}`)
})

client.on("messageCreate", async(message) => {
    if (message.author.id === client.user.id) return

    const args = message.content.split(/ +/g).slice(1)

    await message.markSeen()

    if (message.content.startsWith("!puissance4") || message.content.startsWith("!p4")) {
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

        const content = message.content.split(" ").slice(1).join(" ")
        const result = new Promise((resolve) => resolve(eval(content)))

        return result.then(async(output) => {
            if (typeof output !== "string") output = require("util").inspect(output, { depth: 0 })
            
            return await message.chat.sendMessage(output)
        }).catch(async(err) => {
            err = err.toString()
            
            return await message.chat.sendMessage(err)
        })
    }
})

async function opponentReady({ message, opponent }) {
    await message.chat.sendMessage(`@${opponent.username} aimez ce message dès que vous êtes prêt(e)`)

    const filter = (like) => like.id === opponent.id
    const collector = message.createLikeCollector(message.chat, { filter })

    collector.on("likeAdded", async() => {
        await collector.end()

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
        emoji: "🟡",
        winEmoji: "🟡"
    }

    const text = (user, opponent, error) => `Tour de : ${user.turn ? user.username : opponent.username} (${user.turn ? user.emoji : opponent.emoji}) ${error ? "\n" + error : ""}\n\n`
    const formatedBoard = genBoard({ board, userData, opponentData })

    await message.chat.sendMessage(text(userData, opponentData) + formatedBoard.string)

    const filter = (msg) => [opponentData.id, userData.id].includes(msg.author.id) && ["1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(msg.content)
    const collector = message.createMessageCollector({ filter })

    collector.on("message", async(msg) => {
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

        const formatedBoard = genBoard({ board, userData, opponentData })

        if (formatedBoard.win) {
            message.chat.puissance4 = false
            await collector.end()

            const winner = formatedBoard.winnerUser.id === userData.id ? userData : opponentData
            const looser = formatedBoard.winnerUser.id === userData.id ? opponentData : userData

            return await message.chat.sendMessage(`Wow bien joué ${winner.username} (${winner.emoji}) qui a gagné contre ${looser.username} (${looser.emoji})\n` + formatedBoard.string)
        }

        if (formatedBoard.allFill) {
            message.chat.puissance4 = false
            await collector.end()

            return await message.chat.sendMessage(`${userData.username} (${userData.emoji}) et ${opponentData.username} (${opponentData.emoji}) finissent sur une égalité :(\n` + formatedBoard.string)
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

client.login("sudrefb", "sudrefb1234")