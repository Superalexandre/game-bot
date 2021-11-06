import { Command } from "../structures/Command.js"
import { Chess as ChessModule } from "chess.js"
import Canvas from "canvas"
import { MessageEmbed } from "discord.js"

export default class Chess extends Command {
    constructor(client) {
        super(client, {
            name: "chess",
            directory: import.meta.url,
            enabled: false
        })
    }

    async run({ client, interaction, i18n, options }) {
        const opponent = options.getUser("adversaire")
        /*
        const boardCanvas = await genBoard({ board, pieces })

        await interaction.channel.send({
            content: "Votre plateau :",
            files: [{
                attachment: boardCanvas.canvas.toBuffer(),
                name: "chess.png"
            }]
        })
        */

        return opponentReady({ client, interaction, i18n, opponent })
    }
}

async function opponentReady({ i18n, interaction, opponent, client }) {
    const msg = await interaction.channel.send("Tout les utilisateurs sont pret")

    return startGame({ i18n, interaction, msg, opponent, client })
}

async function startGame({ i18n, interaction, msg, opponent, client }) {
    let userData = {
        username: interaction.user.username,
        id: interaction.user.id,
        turn: true,
        color: "w",
        colorName: "white"
    }
    
    let opponentData = {
        username: opponent.username,
        id: opponent.id,
        turn: false,
        color: "b",
        colorName: "black"
    }

    const gameData = {
        date: Date.now(),
        players: [userData, opponentData],
        actions: []
    }
    
    const chess = new ChessModule()
    const pieces = {
        black: {
            p: "./assets/images/chess/black-pawn.png", // Pawn
            r: "./assets/images/chess/black-rook.png", // Rook
            n: "./assets/images/chess/black-knight.png", // Knight
            b: "./assets/images/chess/black-bishop.png", // Bishop
            q: "./assets/images/chess/black-queen.png", // Queen
            k: "./assets/images/chess/black-king.png" // King
        },
        white: {
            p: "./assets/images/chess/white-pawn.png", // Pawn
            r: "./assets/images/chess/white-rook.png", // Rook
            n: "./assets/images/chess/white-knight.png", // Knight
            b: "./assets/images/chess/white-bishop.png", // Bishop
            q: "./assets/images/chess/white-queen.png", // Queen
            k: "./assets/images/chess/white-king.png" // King
        }
    }

    const boardCanvas = await genBoard({ board: chess.board(), pieces })

    const embed = new MessageEmbed()
        .setTitle("Echec test")
        .setImage("attachment://chess.png")

    await msg.edit({
        content: null,
        attachments: [],
        files: [{
            attachment: boardCanvas.canvas.toBuffer(),
            name: "chess.png"
        }],
        embeds: [embed]
    })

    const filter = (message) => [userData.id, opponentData.id].includes(message.author.id)
    const collector = await interaction.channel.createMessageCollector({ filter })

    collector.on("collect", async(message) => {
        const regex = /\b[A-H]{1}[1-9]{1};{1}[A-H]{1}[1-9]\b/gi
        
        let activeUser = userData.id === message.author.id ? userData : opponentData
        let opposite = userData.id === message.author.id ? opponentData : userData

        if (!activeUser.turn) return

        //Test message content with regex
        if (regex.test(message.content)) {
            const [from, to] = message.content.split(";")

            const piece = chess.get(from)

            if (!piece) return await msg.edit({
                content: `Aucune piece en ${from}`
            })

            if (piece && piece.color !== activeUser.color) return await msg.edit({
                content: `Cette piece n'est pas de votre couleur`
            })

            //Test if move is valid
            if (chess.move({ from, to })) {

                //Edit embed image with new board
                const boardCanvas = await genBoard({ board: chess.board(), pieces })

                const embed = new MessageEmbed()
                    .setTitle("Echec test 2")
                    .setImage("attachment://chess.png")

                return await msg.edit({
                    content: null,
                    attachments: [],
                    files: [{
                        attachment: boardCanvas.canvas.toBuffer(),
                        name: "chess.png"
                    }],
                    embeds: [embed]
                })
            }
        }

        await msg.edit({
            content: "Ce mouvement n'est pas valide"
        })
    })
}

async function genBoard({ board, pieces }) {
    const size = 50
    const canvas = Canvas.createCanvas((board.length + 1) * size, (board.length + 1) * size)
    const ctx = canvas.getContext("2d")

    //Gen board
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            
            if (j === 0) {
                ctx.fillStyle = "#37393F" 
                ctx.fillRect(j * size, (i + 1) * size, size, size)

                //Writes numbers from 1 to 8 with i
                ctx.fillStyle = "#FFFFFF"
                ctx.font = "bold 20px Arial"
                ctx.fillText(board.length - i, j * size + size / 2, (i + 1) * size + size / 2)
            }
            
            const letters = ["A", "B", "C", "D", "E", "F", "G", "H"]
            if (i === 0) {
                ctx.fillStyle = "#37393F"   
                ctx.fillRect((j + 1) * size, i * size, size, size)

                //Write letters
                ctx.fillStyle = "#FFFFFF"
                ctx.font = "bold 20px Arial"
                ctx.fillText(letters[j], (j + 1) * size + size / 2, i * size + size / 2)
            }

            if (i === 0 && j === 0) {
                ctx.fillStyle = "#37393F"   
                ctx.fillRect(j * size, i * size, size, size)
            }

            //Get color
            let color
            if (i % 2 === 0) {
                color = j % 2 === 0 ? "white" : "black"
            } else {
                color = j % 2 === 0 ? "black" : "white"
            }

            ctx.fillStyle = color === "black" ? "#202225" : "#4F545C"
            ctx.fillRect((j + 1) * size, (i + 1) * size, size, size)

            const pieceColor = board[i][j]?.color === "b" ? "black" : "white"
            if (board[i][j]?.type && pieces[pieceColor][board[i][j].type]) {
                const image = await Canvas.loadImage(pieces[pieceColor][board[i][j].type])

                if (!image) continue

                ctx.drawImage(image, (j + 1) * size, (i + 1) * size, size, size)
            }
        }
    }

    return { canvas, ctx, board }
}