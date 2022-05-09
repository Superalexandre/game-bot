import { Command } from "../structures/Command.js"

export default class Morpion extends Command {
    constructor(client) {
        super(client, {
            name: "morpion",
            desc: "Jouer au morpion !",
            directory: import.meta.url,
            use: "morpion utilisateur",
            example: "morpion @utilisateur",
            aliases: ["tictactoe"]
        })
    }

    async run({ client, message, args }) {
        // ! TRANSLATE
        // ! STATS
        if (!message.chat.isGroup) return await message.chat.sendMessage("Cette commande n'est pas disponible en message privé")
        if (message.chat.game) return await message.chat.sendMessage("Un jeu ou une demande est déjà en cours")
        if (!args[0]) return await message.chat.sendMessage("Merci de saisir l'arobase de la personne (qui doit etre dans le groupe) que tu veux affronter")

        let opponent
        try {
            opponent = await client.fetchUser(args[0])
        } catch (error) {
            try {
                opponent = await client.fetchUser(args[0].replace(/@/, ""))
            } catch (error) {
                return await message.chat.sendMessage("Aucun utilisateur trouvé")
            }
        }

        if (!message.chat.users.has(opponent.id)) return await message.chat.sendMessage("Cet utilisateur n'est pas dans ce groupe")

        if (message.author.id === opponent.id) return await message.chat.sendMessage("Tu ne peux pas jouer contre toi-même")

        if (opponent.id === client.user.id) return await message.chat.sendMessage("Tu ne peux pas jouer contre moi")
    
        return opponentReady({ message, opponent })
    }
}


async function opponentReady({ message, opponent }) {
    message.chat.game = true

    const msg = await message.chat.sendMessage(`@${opponent.username} like ce message dès que tu es prêt(e) pour une partie de morpion\n\n${message.author.username} si tu veux annuler la demande, like ce message`)
    
    const filter = (like) => [opponent.id, message.author.id].includes(like.id)
    const collector = msg.createLikeCollector(msg, { filter })

    collector.on("likeAdded", async(like) => {
        await collector.end()

        if (like.id === message.author.id) {
            message.chat.game = false

            return await message.chat.sendMessage(`${message.author.username} a annulé la demande`)  
        } 

        return startGame({ message, opponent })
    })
}

async function startGame({ message, opponent }) {
    let userData = {
        id: await message.author.id,
        username: await message.author.username,
        turn: opponent.turn ? false : true,
        emoji: "❌"
    }
    
    let opponentData = {
        id: await opponent.id,
        username: await opponent.username,
        turn: opponent.turn,
        emoji: "⭕"
    }

    const emotes = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"]
    const text = (user, opponent) => `Tour de ${user.turn ? `${user.username} (${user.emoji})` : `${opponent.username} (${opponent.emoji})`}`

    let board = [
        [ "", "", "" ],
        [ "", "", "" ],
        [ "", "", "" ]
    ]
    
    await message.chat.sendMessage(`${text(userData, opponentData)}\n\n${board.map((row, i) => row.map((elem, j) => elem === "" ? emotes[i + (j + i * 2)] : elem).join(" | ")).join("\n")}`) 


    const filter = (msg) => [opponent.id, message.author.id].includes(msg.author.id)
    const collector = message.createMessageCollector({ filter })

    collector.on("message", async(msg) => {
        if (msg.content.toLowerCase() === "stop") {
            message.chat.game = false
            await collector.end()
            
            return await message.chat.sendMessage(`${msg.author.username} a arreter la partie`)
        }

        const type = msg.author.id === userData.id ? userData : opponentData
        const opposite = msg.author.id === userData.id ? opponentData : userData

        if (!type.turn) return await message.chat.sendMessage(`${type.username} ce n'est pas encore tour !`)

        const index = msg.content

        const pos = {
            "1": [0, 0],
            "2": [0, 1],
            "3": [0, 2],
            "4": [1, 0],
            "5": [1, 1],
            "6": [1, 2],
            "7": [2, 0],
            "8": [2, 1],
            "9": [2, 2]
        }

        board[pos[index][0]][pos[index][1]] = type.emoji
        type.turn = false
        opposite.turn = true

        const genBoard = genBoardFunction({ board })

        if (!genBoard.win && genBoard.allFill) {
            await collector.end()
            message.chat.game = false

            return message.chat.sendMessage(`Match nul entre ${userData.username} et ${opponentData.username} !`)
        }

        if (genBoard.win) {
            await collector.end()
            message.chat.game = false

            const winner = genBoard.winner === userData.emoji ? userData : opponentData
            const looser = genBoard.winner === userData.emoji ? opponentData : userData

            return await message.chat.sendMessage(`${winner.username} (${winner.emoji}) a gagné contre ${looser.username} (${looser.emoji}) !`)

        }

        await message.chat.sendMessage(`${text(userData, opponentData)}\n\n${board.map((row, i) => row.map((elem, j) => elem === "" ? emotes[i + (j + i * 2)] : elem).join(" | ")).join("\n")}`) 
    })
}

function genBoardFunction({ board }) {
    let win = false
    let winner = ""
    let allFill = true

    for (let i = 0; i < board.length; i++) {   
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j] === "") allFill = false

            //* Horizontal
            if (!win && board[i][j] !== "" && board[i][j] === board[i][j + 1] && board[i][j + 1] === board[i][j + 2]) {
                winner = board[i][j]

                board[i][j] = winner + "_win"
                board[i][j + 1] = winner + "_win"
                board[i][j + 2] = winner + "_win"

                win = true
            //* Vertical
            } else if (!win && board[i][j] !== "" && board[i]?.[j] === board[i + 1]?.[j] && board[i + 1]?.[j] === board[i + 2]?.[j]) {
                winner = board[i][j]

                board[i][j] = winner + "_win"
                board[i+ 1][j] = winner + "_win"
                board[i+ 2][j] = winner + "_win"
    
                win = true
            //* Diagonal Left top => Bottom right
            } else if (!win && board[i][j] !== "" && board[i]?.[j] === board[i + 1]?.[j + 1] && board[i + 1]?.[j + 1] === board[i + 2]?.[j + 2]) {
                winner = board[i][j]

                board[i][j] = winner + "_win"
                board[i + 1][j + 1] = winner + "_win"
                board[i + 2][j + 2] = winner + "_win"
    
                win = true
            //* Diagonal Right top => Bottom left
            } else if (!win && board[i][j] !== "" && board[i]?.[j] === board[i + 1]?.[j - 1] && board[i + 1]?.[j - 1] === board[i + 2]?.[j - 2]) {
                winner = board[i][j]

                board[i][j] = winner + "_win"
                board[i + 1][j - 1] = winner + "_win"
                board[i + 2][j - 2] = winner + "_win"
    
                win = true
            }
        }
    }

    return { win, winner, allFill }
}