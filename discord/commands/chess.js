import { Command } from "../structures/Command.js"
import { Chess as ChessModule } from "chess.js"
import Canvas from "canvas"

export default class Chess extends Command {
    constructor(client) {
        super(client, {
            name: "chess",
            directory: import.meta.url,
            enabled: false
        })
    }

    async run({ interaction }) {
        const chess = new ChessModule()
        const board = chess.board()

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

        const boardCanvas = await genBoard({ board, pieces })

        await interaction.channel.send({
            content: "Votre plateau :",
            files: [{
                attachment: boardCanvas.canvas.toBuffer(),
                name: "chess.png"
            }]
        })

    }
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
                ctx.fillText(i + 1, j * size + size / 2, (i + 1) * size + (size / 2) + 10)
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