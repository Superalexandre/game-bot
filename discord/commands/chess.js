import { Command } from "../structures/Command.js"
import { Chess as ChessModule } from "chess.js"
import Canvas from "canvas"
import { MessageEmbed } from "discord.js"

export default class Chess extends Command {
    constructor(client) {
        super(client, {
            name: "chess",
            directory: import.meta.url,
            debug: true
        })
    }

    async run({ client, interaction, i18n, options }) {
        const opponent = options.getUser("adversaire")

        return opponentReady({ client, interaction, i18n, opponent })
    }
}

async function opponentReady({ i18n, interaction, opponent, client }) {
    const msg = await interaction.channel.send("Tout les utilisateurs sont pret")

    return startGame({ i18n, interaction, msg, opponent, client })
}

async function startGame({ interaction, msg, opponent }) {
    let userData = {
        username: interaction.user.username,
        id: interaction.user.id,
        turn: true,
        color: "w",
        colorName: "white",
        hexColor: "#FFFFFF"
    }
    
    let opponentData = {
        username: opponent.username,
        id: opponent.id,
        turn: false,
        color: "b",
        colorName: "black",
        hexColor: "#000000"
    }

    let gameData = {
        date: Date.now(),
        players: [userData, opponentData],
        rook: {
            white: {
                r: [{
                    moved: false,
                    x: "a",
                    y: "1"
                }, {
                    moved: false,
                    x: "h",
                    y: "1"
                }],
                k: {
                    moved: false
                }
            },
            black: {
                r: [{
                    moved: false,
                    x: "a",
                    y: "8"
                }, {
                    moved: false,
                    x: "h",
                    y: "8"
                }],
                k: {
                    moved: false
                }
            }
        },
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
        .setTitle(`Partie d'echec entre ${userData.username} et ${opponentData.username}`)
        .setColor(userData.turn ? userData.hexColor : opponentData.hexColor)
        .setDescription(`${userData.turn ? userData.username : opponentData.username} commence`)
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
        const moveRegex = /\b[A-H]{1}[1-9]{1};{1}[A-H]{1}[1-9]\b/gi
        const optionsRegex = /\b[A-H]{1}[1-9]{1}/gi

        let activeUser = userData.id === message.author.id ? userData : opponentData
        let opposite = userData.id === message.author.id ? opponentData : userData

        if (!activeUser.turn) return

        const [from, to] = message.content.split(";")
        const piece = chess.get(from)
        const target = chess.get(to)

        if (piece && target && piece.type === "k" && target.type === "r") {
            if (gameData.rook[activeUser.colorName].k.moved) {
                return await msg.edit({
                    content: "Roque impossible le roi a deja été déplacé"
                })
            }

            const targetX = to.substring(0, 1).toLowerCase()
            const targetY = to.substring(1, 2).toLowerCase()

            const findedRook = gameData.rook[activeUser.colorName].r.find(r => r.x === targetX && r.y === targetY)

            if (!findedRook) {
                return await msg.edit({
                    content: "Roque impossible la tour n'est pas sur la case de destination"
                })
            }

            if (findedRook.moved) {
                return await msg.edit({
                    content: "Roque impossible la tour a deja été déplacée"
                })
            }

            gameData.rook[activeUser.colorName].r.find(r => r.x === targetX && r.y === targetY).moved = true
            gameData.rook[activeUser.colorName].k.moved = true

            // Move king, and target rook
            chess.remove(from)
            chess.remove(`${targetX}${targetY}`)
            
            // Put new king and rook
            chess.put({ type: "k", color: activeUser.color }, `${targetX}${targetY}`)
            chess.put({ type: "r", color: activeUser.color }, from)
            
            opposite.turn = true
            activeUser.turn = false

            //Edit embed image with new board
            const boardCanvas = await genBoard({ board: chess.board(), pieces })

            const embed = new MessageEmbed()
                .setTitle(`Partie d'echec entre ${userData.username} et ${opponentData.username}`)
                .setColor(userData.turn ? userData.hexColor : opponentData.hexColor)
                .setDescription(`Au tour de ${userData.turn ? userData.username : opponentData.username}`)
                .setImage("attachment://chess.png")

            return await msg.edit({
                attachments: [],
                files: [{
                    attachment: boardCanvas.canvas.toBuffer(),
                    name: "chess.png"
                }],
                embeds: [embed]
            })
        }

        //Test message content with regex
        if (moveRegex.test(message.content)) {
            if (message.deleteable) await message.delete()

            if (!piece) {
                return await msg.edit({
                    content: `Aucune piece en ${from}`
                })
            }

            if (piece && piece.color !== activeUser.color) {
                return await msg.edit({
                    content: `Cette piece n'est pas de votre couleur`
                })
            }

            //Test if move is valid
            if (chess.move({ from, to })) {
                opposite.turn = true
                activeUser.turn = false

                // Rook
                if (piece.type === "r") {
                    if (from.charAt(0) === "A" && from.charAt(1) === "1") {
                        gameData.rook.white.r[0].moved = true
                    } else if (from.charAt(0) === "H" && from.charAt(1) === "1") {
                        gameData.rook.white.r[1].moved = true
                    } else if (from.charAt(0) === "A" && from.charAt(1) === "8") {
                        gameData.rook.black.r[0].moved = true
                    } else if (from.charAt(0) === "H" && from.charAt(1) === "8") {
                        gameData.rook.black.r[1].moved = true
                    }
                }

                // King
                if (piece.type === "k") {
                    if (from.charAt(0) === "E" && from.charAt(1) === "1") {
                        gameData.rook.white.k.moved = true
                    } else if (from.charAt(0) === "E" && from.charAt(1) === "8") {
                        gameData.rook.black.k.moved = true
                    }
                }

                //Test if move is a capture
                if (chess.get(to)) {
                    const captured = chess.get(to)

                    //Test if piece is a king
                    if (captured.type === "k") {
                        await collector.stop()

                        return await msg.edit({
                            content: `${opposite.username} a gagne la partie (roi)`,
                            attachments: [],
                            files: [],
                            embeds: []
                        })
                    }

                    //Test if piece is a pawn
                    if (captured.type === "p") {
                        //Test if pawn is on the last rank
                        if (captured.color === "w" && captured?.square?.charAt(1) === "8") {
                            const queen = chess.put({ type: "q", color: captured.color }, to)

                            chess.remove(captured)
                            chess.put(queen, to)
                        }
                    }
                }

                if (chess.in_checkmate()) {
                    await collector.stop()
        
                    return await msg.edit({
                        content: `${opposite.username} a gagne la partie (checkmate)`,
                        attachments: [],
                        files: [],
                        embeds: []
                    })
                }

                if (chess.in_check()) {
                    await msg.edit({
                        content: `${opposite.username} est en echec`
                    })
                }

                //Edit embed image with new board
                const boardCanvas = await genBoard({ board: chess.board(), pieces })

                const embed = new MessageEmbed()
                    .setTitle(`Partie d'echec entre ${userData.username} et ${opponentData.username}`)
                    .setColor(userData.turn ? userData.hexColor : opponentData.hexColor)
                    .setDescription(`Au tour de ${userData.turn ? userData.username : opponentData.username}`)
                    .setImage("attachment://chess.png")

                await msg.edit({
                    attachments: [],
                    files: [{
                        attachment: boardCanvas.canvas.toBuffer(),
                        name: "chess.png"
                    }],
                    embeds: [embed]
                })
            } else {
                await msg.edit({
                    content: "Mouvement invalide"
                })
            }
        } else if (optionsRegex.test(message.content)) {
            const pos = message.content
            const moves = chess.moves({ square: pos, verbose: true })
            
            if (message.deleteable) await message.delete()

            if (moves.length === 0) return await msg.edit({
                content: `Aucun mouvement possible a afficher en ${pos}`
            })

            const boardCanvas = await genBoard({ board: chess.board(), pieces, highlight: moves })

            const embed = new MessageEmbed()
                .setTitle(`Partie d'echec entre ${userData.username} et ${opponentData.username}`)
                .setColor(userData.turn ? userData.hexColor : opponentData.hexColor)
                .setDescription(`Au tour de ${userData.turn ? userData.username : opponentData.username}`)
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
    })
}

async function genBoard({ board, pieces, highlight = [] }) {
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
                color = j % 2 === 0 ? "#4F545C" : "#202225"
            } else {
                color = j % 2 === 0 ? "#202225" : "#4F545C"
            }

            //Highlight square
            for (let k = 0; k < highlight.length; k++) {
                if (highlight[k].to === `${letters[j].toLowerCase()}${board.length - i}`) {
                    color = "#E3E5E8"
                }
            }

            ctx.fillStyle = color
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