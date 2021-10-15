import { Command } from "../structures/Command.js"
import { MessageButton, MessageActionRow, MessageEmbed } from "discord.js"

export default class Tetris extends Command {
    constructor(client) {
        super(client, {
            name: "tetris",
            directory: import.meta.url
        })
    }

    async run({ interaction, i18n }) {
        /*

        🟧 🟠
        🟦 🔵
        🟥 🔴
        🟫 🟤
        🟪 🟣
        🟩 🟢
        🟨 🟡
            
        ⬜ ⚪
        ⬛ ⚫
        */
            
        const pieces = [
            [ 
                ["🟨", "🟨"] ,
                ["🟨", "🟨"]
            ], [
                ["⬜", "⬜", "🟩"], 
                ["🟩", "🟩", "🟩"]
            ], [
                ["⬜", "🟪"],
                ["🟪", "🟪"],
                ["⬜", "🟪"]
            ], [
                ["🟫", "⬜"],
                ["🟫", "🟫"],
                ["⬜", "🟫"]
            ], [
                ["🟥"],
                ["🟥"],
                ["🟥"],
                ["🟥"]
            ], [  
                ["🟦", "🟦", "🟦"], 
                ["⬜", "⬜", "🟦"]
            ], [
                ["⬜", "🟧"],
                ["🟧", "🟧"],
                ["🟧", "⬜"]
            ]
        ]
        
        const numberLine = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"]
        let topBoard = [
            ["⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛"], //⬛ /*1*/
            ["⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛"], //⬛ /*2*/
            ["⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛"], //⬛ /*3*/
            ["⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛"], //⬛ /*4*/
            ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"] //⬛ /*5*/
        ]

        let board = [
            ["⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛"], //⬛ /*1*/
            ["⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛"], //⬛ /*2*/
            ["⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛"], //⬛ /*3*/
            ["⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛"], //⬛ /*4*/
            ["⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛"], //⬛ /*5*/
            ["⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛"], //⬛ /*6*/
            ["⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛"], //⬛ /*7*/
            ["⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛"], //⬛ /*8*/
            ["⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛"], //⬛ /*9*/
            ["⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛"], //⬛ /*10*/
            ["⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛"], //⬛ /*11*/
            ["⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛"], //⬛ /*12*/
            ["⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛"], //⬛ /*13*/
            ["⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛"], //⬛ /*14*/
            ["⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛"], //⬛ /*15*/
            ["⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛"], //⬛ /*16*/
            ["⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛"], //⬛ /*17*/
            ["⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛"], //⬛ /*18*/
            ["⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛"], //⬛ /*19*/
            ["⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛"] //⬛ /*20*/
        ]
        
        let playerData = {
            user: interaction.user,
            piece: pieces[Math.floor(Math.random() * pieces.length)],
            nextPiece: pieces[Math.floor(Math.random() * pieces.length)],
            lineClear: 0,
            x: 0,
            y: 0
        }

        //* Place piece
        const placed = place(playerData.x, playerData.y, playerData.piece, topBoard)
        topBoard = placed.board

        //* Preview
        const yPreview = await calcBottom(playerData.x, playerData.y, playerData.piece, board)

        const preview = place(playerData.x, yPreview, playerData.piece, board, true)
        board = preview.board

        //* Function for calc endRightArrow
        const calcEnd = (playerData) => {
            const result = (topBoard[0].length - playerData.x) - playerData.piece[0].length

            if (result === 0) return topBoard[0].length

            return (topBoard[0].length - playerData.x) - playerData.piece[0].length
        }

        //* Create all buttons
        const endLeftArrow = new MessageButton()
            .setCustomId(`game_tetris_${interaction.user.id}_endLeft`)
            .setStyle("PRIMARY")
            .setEmoji("⏪")
            .setDisabled(canPlace(playerData.x, "left", 0, playerData.piece, topBoard))

        const leftArrow = new MessageButton()
            .setCustomId(`game_tetris_${interaction.user.id}_left`)
            .setStyle("PRIMARY")
            .setEmoji("◀️")
            .setDisabled(canPlace(playerData.x, "left", 1, playerData.piece, topBoard))

        const endRightArrow = new MessageButton()
            .setCustomId(`game_tetris_${interaction.user.id}_endRight`)
            .setStyle("PRIMARY")
            .setEmoji("⏩")
            .setDisabled(canPlace(playerData.x, "right", calcEnd(playerData), playerData.piece, topBoard))
            
        const rightArrow = new MessageButton()
            .setCustomId(`game_tetris_${interaction.user.id}_right`)
            .setStyle("PRIMARY")
            .setEmoji("▶️")
            .setDisabled(canPlace(playerData.x, "right", 1, playerData.piece, topBoard))

        const rotateArrow = new MessageButton()
            .setCustomId(`game_tetris_${interaction.user.id}_rotate`)
            .setEmoji("🔄")
            .setStyle("PRIMARY")

        const valid = new MessageButton()
            .setCustomId(`game_tetris_${interaction.user.id}_valid`)
            .setEmoji("✅")
            .setStyle("SUCCESS")

        let components = [
            new MessageActionRow().addComponents(leftArrow, rightArrow, rotateArrow),
            new MessageActionRow().addComponents(endLeftArrow, endRightArrow, valid)
        ]

        const formattedBoard = toString(board)
        const topFormattedBoard = toString(topBoard)
        const embed = new MessageEmbed()
            .setTitle("Tetris de " + interaction.user.username)
            .setDescription(`\`\`\`${topFormattedBoard}${formattedBoard}${numberLine.join("")}\`\`\``)
            .addField(`Prochaine piece :`, `\`\`\`${toString(playerData.nextPiece)}\`\`\``)

        const msg = await interaction.channel.send({
            embeds: [ embed ],
            components: components
        })

        const collector = await msg.createMessageComponentCollector({ componentType: "BUTTON" })

        collector.on("collect", async(button) => {
            if (!button.user) await button.user.fetch()

            if (button.user.id !== interaction.user.id) return await button.reply({
                content: i18n.__("discord.global.notYourGame", { gameName: "tetris" }),
                ephemeral: true

            })

            const id = button.customId.split("_")

            if (id[id.length - 1] === "rotate") {
                const newPiece = rotate(playerData.piece, false)

                if (canPlace(playerData.x, "right", 0, newPiece, topBoard)) {
                    //* Edit 
                    rotateArrow.setDisabled(canPlace(playerData.x, "right", 0, rotate(playerData.piece), topBoard))
                    leftArrow.setDisabled(canPlace(playerData.x, "left", 1, playerData.piece, topBoard))
                    rightArrow.setDisabled(canPlace(playerData.x, "right", 1, playerData.piece, topBoard))
                    endLeftArrow.setDisabled(canPlace(playerData.x, "left", 0, playerData.piece, topBoard))
                    endRightArrow.setDisabled(canPlace(playerData.x, "right", calcEnd(playerData), playerData.piece, topBoard))

                    components = [
                        new MessageActionRow().addComponents(leftArrow, rightArrow, rotateArrow),
                        new MessageActionRow().addComponents(endLeftArrow, endRightArrow, valid)
                    ]

                    //* Edit message
                    const formattedBoard = toString(board)
                    const topFormattedBoard = toString(topBoard)
                    const embed = new MessageEmbed()
                        .setTitle("Tetris de " + interaction.user.username)
                        .setDescription(`\`\`\`${topFormattedBoard}${formattedBoard}${numberLine.join("")}\`\`\``)
                        .addField("Erreur", "Vous ne pouvez pas continuer aussi loin")
                        .addField(`Prochaine piece :`, `\`\`\`${toString(playerData.nextPiece)}\`\`\``)
        
                    await button.deferUpdate()
                    return await msg.edit({
                        embeds: [ embed ],
                        components: components
                    })
                }

                //* Remove before piece
                topBoard = remove(playerData.x, playerData.y, playerData.piece, topBoard)
                board = remove(playerData.x, playerData.y, playerData.piece, board, true)

                //* Rotate
                playerData.piece = newPiece
                
                //* Preview
                const yPreview = calcBottom(playerData.x, playerData.y, playerData.piece, board)
                const preview = place(playerData.x, yPreview, playerData.piece, board, true)
                board = preview.board

                //* Place
                const placed = place(playerData.x, playerData.y, playerData.piece, topBoard)
                topBoard = placed.board

                //* Edit buttons
                rotateArrow.setDisabled(canPlace(playerData.x, "right", 0, rotate(playerData.piece), topBoard))
                leftArrow.setDisabled(canPlace(playerData.x, "left", 1, playerData.piece, topBoard))
                rightArrow.setDisabled(canPlace(playerData.x, "right", 1, playerData.piece, topBoard))
                endLeftArrow.setDisabled(canPlace(playerData.x, "left", 0, playerData.piece, topBoard))
                endRightArrow.setDisabled(canPlace(playerData.x, "right", calcEnd(playerData), playerData.piece, topBoard))
                
                components = [
                    new MessageActionRow().addComponents(leftArrow, rightArrow, rotateArrow),
                    new MessageActionRow().addComponents(endLeftArrow, endRightArrow, valid)
                ]

                //* Edit message
                const formattedBoard = toString(board)
                const topFormattedBoard = toString(topBoard)
                const embed = new MessageEmbed()
                    .setTitle("Tetris de " + interaction.user.username)
                    .setDescription(`\`\`\`${topFormattedBoard}${formattedBoard}${numberLine.join("")}\`\`\``)
                    .addField(`Prochaine piece :`, `\`\`\`${toString(playerData.nextPiece)}\`\`\``)
        
                await button.deferUpdate()
                return await msg.edit({
                    embeds: [ embed ],
                    components: components
                })
            }

            if (["left", "right", "endLeft", "endRight"].includes(id[id.length - 1])) {
                let newX
                if (["left", "right"].includes(id[id.length - 1])) {
                    newX = id[id.length - 1] === "left" ? playerData.x - 1 : playerData.x + 1
                } else {    
                    id[id.length - 1] = id[id.length - 1] === "endLeft" ? "left" : "right"
                    newX = id[id.length - 1] === "left" ? 0 : board[0].length - playerData.piece[0].length
                }

                if (canPlace(newX, id[id.length - 1], 0, playerData.piece, topBoard)) {
                    //* Edit buttons
                    rotateArrow.setDisabled(canPlace(newX, "right", 0, rotate(playerData.piece), topBoard))
                    leftArrow.setDisabled(canPlace(newX, "left", 1, playerData.piece, topBoard))
                    rightArrow.setDisabled(canPlace(newX, "right", 1, playerData.piece, topBoard))
                    endLeftArrow.setDisabled(canPlace(playerData.x, "left", 0, playerData.piece, topBoard))
                    endRightArrow.setDisabled(canPlace(playerData.x, "right", calcEnd(playerData), playerData.piece, topBoard))
                
                    components = [
                        new MessageActionRow().addComponents(leftArrow, rightArrow, rotateArrow),
                        new MessageActionRow().addComponents(endLeftArrow, endRightArrow, valid)
                    ]

                    //* Edit message
                    const formattedBoard = toString(board)
                    const topFormattedBoard = toString(topBoard)
                    const embed = new MessageEmbed()
                        .setTitle("Tetris de " + interaction.user.username)
                        .setDescription(`\`\`\`${topFormattedBoard}${formattedBoard}${numberLine.join("")}\`\`\``)
                        .addField("Erreur", "Vous ne pouvez pas continuer aussi loin")
                        .addField(`Prochaine piece :`, `\`\`\`${toString(playerData.nextPiece)}\`\`\``)
        
                    await button.deferUpdate()
                    return await msg.edit({
                        embeds: [ embed ],
                        components: components
                    })
                }

                //* Remove before piece
                topBoard = remove(playerData.x, playerData.y, playerData.piece, topBoard)
                board = remove(playerData.x, playerData.y, playerData.piece, board, true)

                playerData.x = newX        

                //* Preview
                const yPreview = calcBottom(playerData.x, playerData.y, playerData.piece, board)
                const preview = place(playerData.x, yPreview, playerData.piece, board, true)
                board = preview.board

                //* Place
                const placed = place(playerData.x, playerData.y, playerData.piece, topBoard)
                topBoard = placed.board

                //* Edit buttons
                rotateArrow.setDisabled(canPlace(newX, "right", 0, rotate(playerData.piece), topBoard))
                leftArrow.setDisabled(canPlace(newX, "left", 1, playerData.piece, topBoard))
                rightArrow.setDisabled(canPlace(newX, "right", 1, playerData.piece, topBoard))
                endLeftArrow.setDisabled(canPlace(playerData.x, "left", 0, playerData.piece, topBoard))
                endRightArrow.setDisabled(canPlace(playerData.x, "right", calcEnd(playerData), playerData.piece, topBoard))

                components = [
                    new MessageActionRow().addComponents(leftArrow, rightArrow, rotateArrow),
                    new MessageActionRow().addComponents(endLeftArrow, endRightArrow, valid)
                ]

                //* Edit message
                const formattedBoard = toString(board)
                const topFormattedBoard = toString(topBoard)
                const embed = new MessageEmbed()
                    .setTitle("Tetris de " + interaction.user.username)
                    .setDescription(`\`\`\`${topFormattedBoard}${formattedBoard}${numberLine.join("")}\`\`\``)
                    .addField(`Prochaine piece :`, `\`\`\`${toString(playerData.nextPiece)}\`\`\``)
        
                await button.deferUpdate()
                return await msg.edit({
                    embeds: [ embed ],
                    components: components
                })
            }

            if (id[id.length - 1] === "valid") {
                const removed = remove(playerData.x, playerData.y, playerData.piece, board, true)
                board = removed

                const newY = calcBottom(playerData.x, playerData.y, playerData.piece, board)

                //* Placed piece
                const placed = place(playerData.x, newY, playerData.piece, board)

                if (placed.error) {
                    //* Edit buttons
                    rotateArrow.setDisabled(canPlace(playerData.x, "right", 0, rotate(playerData.piece), topBoard))
                    leftArrow.setDisabled(canPlace(playerData.x, "left", 1, playerData.piece, topBoard))
                    rightArrow.setDisabled(canPlace(playerData.x, "right", 1, playerData.piece, topBoard))
                    endLeftArrow.setDisabled(canPlace(playerData.x, "left", 0, playerData.piece, topBoard))
                    endRightArrow.setDisabled(canPlace(playerData.x, "right", calcEnd(playerData), playerData.piece, topBoard))

                    components = [
                        new MessageActionRow().addComponents(leftArrow, rightArrow, rotateArrow),
                        new MessageActionRow().addComponents(endLeftArrow, endRightArrow, valid)
                    ]

                    //* Edit message
                    const formattedBoard = toString(board)
                    const topFormattedBoard = toString(topBoard)
                    const embed = new MessageEmbed()
                        .setTitle("Tetris de " + interaction.user.username)
                        .setDescription(`\`\`\`${topFormattedBoard}${formattedBoard}${numberLine.join("")}\`\`\``)
                        .addField("Erreur", "Vous ne pouvez pas jouer ici")
                        .addField(`Prochaine piece :`, `\`\`\`${toString(playerData.nextPiece)}\`\`\``)
        
                    await button.deferUpdate()
                    return await msg.edit({
                        embeds: [ embed ],
                        components: components
                    })
                }

                //* Place piece
                board = placed.board

                //* Remove before piece
                topBoard = remove(playerData.x, playerData.y, playerData.piece, topBoard)

                const clear = clearBoard(board)
                playerData.lineClear = playerData.lineClear + clear.clearedLine
                board = clear.board

                //* Edit player data
                playerData.x = 0
                playerData.y = 0
                playerData.piece = playerData.nextPiece
                playerData.nextPiece = pieces[Math.floor(Math.random() * pieces.length)]

                const firstBoardLine = board[0].filter(piece => piece !== "⬛")

                if (firstBoardLine.length > 0) {
                    const formattedBoard = toString(board)
                    const embed = new MessageEmbed()
                        .setTitle("Tetris de " + interaction.user.username)
                        .setDescription(`\`\`\`${formattedBoard}\`\`\`\nLa partie est finis !`)

                    await collector.stop()
                    await button.deferUpdate()
                    return await msg.edit({
                        embeds: [ embed ],
                        components: []
                    })
                }

                //* Place piece
                const placedTop = place(playerData.x, playerData.y, playerData.piece, topBoard)
                topBoard = placedTop.board
                
                //* Preview
                const yPreview = calcBottom(playerData.x, playerData.y, playerData.piece, board)
                const preview = place(playerData.x, yPreview, playerData.piece, board, true)
                board = preview.board

                //* Edit buttons
                rotateArrow.setDisabled(canPlace(playerData.x, "right", 0, rotate(playerData.piece), topBoard))
                leftArrow.setDisabled(canPlace(playerData.x, "left", 1, playerData.piece, topBoard))
                rightArrow.setDisabled(canPlace(playerData.x, "right", 1, playerData.piece, topBoard))
                endLeftArrow.setDisabled(canPlace(playerData.x, "left", 0, playerData.piece, topBoard))
                endRightArrow.setDisabled(canPlace(playerData.x, "right", calcEnd(playerData), playerData.piece, topBoard))

                components = [
                    new MessageActionRow().addComponents(leftArrow, rightArrow, rotateArrow),
                    new MessageActionRow().addComponents(endLeftArrow, endRightArrow, valid)
                ]

                //* Edit message
                const formattedBoard = toString(board)
                const topFormattedBoard = toString(topBoard)
                const embed = new MessageEmbed()
                    .setTitle("Tetris de " + interaction.user.username)
                    .setDescription(`\`\`\`${topFormattedBoard}${formattedBoard}${numberLine.join("")}\`\`\``)
                    .addField(`Prochaine piece :`, `\`\`\`${toString(playerData.nextPiece)}\`\`\``)
        
                await button.deferUpdate()
                return await msg.edit({
                    embeds: [ embed ],
                    components: components
                })
            }
        })
    }
}

function toString(piece) {
    let string = ""

    for (let i = 0; i < piece.length; i++) {
        for (let j = 0; j < piece[i].length; j++) {
            if (piece[i][j] === "⬜") {
                string += "⬛"

                continue
            }

            string += piece[i][j]
        }
        
        string += "\n"
    }

    return string
}

function rotate(piece, clockwise) {
    if (clockwise === undefined) clockwise = false
    let result = Array.from(piece[0], () => Array.from(piece, () => false))
    let newRow, newCol

    for (let col = 0; col < piece[0].length; col++) {
        for (let row = 0; row < piece.length; row++) {
            newRow = clockwise ? piece.length - row - 1 : row
            newCol = clockwise ? col : piece[0].length - col - 1
        
            result[col][row] = piece[newRow][newCol]
        }
    }
    
    return result
}

function place(x, y, piece, board, preview) {
    if (y < 0) return { board, error: "You can't play here" }

    const previewEmote = {
        "🟧": "🟠",
        "🟦": "🔵",
        "🟥": "🔴",
        "🟫": "🟤",
        "🟪": "🟣",
        "🟩": "🟢",
        "🟨": "🟡"
    }

    for (let i = 0; i < piece.length; i++) {
        for (let j = 0; j < piece[i].length; j++) {
            if (piece[i][j] === "⬜") continue

            board[y + i][x + j] = preview ? previewEmote[piece[i][j]] : piece[i][j]
        }
    }

    return { board }
}

function remove(x, y, piece, board, preview) {
    if (preview) {
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[i].length; j++) {
                if (["🟠", "🔵", "🔴", "🟤", "🟣", "🟢", "🟡"].includes(board[i][j])) {
                    board[i][j] = "⬛"
                }
            }
        }

        return board
    }

    for (let i = 0; i < piece.length; i++) {
        for (let j = 0; j < piece[i].length; j++) {
            if (piece[i][j] === "⬜") continue
            
            board[y + i][x + j] = "⬛"
        }
    }

    return board
}

function canPlace(newX, direction, additionnal, piece, board) {
    if (!additionnal) additionnal = 0

    if (direction === "left") return (newX - additionnal) < 0

    return (newX + additionnal) + piece[0].length > board[0].length
}

function calcBottom(x, y, piece, board) {
    let canBePlaced = true
    for (let i = 0; i < piece.length; i++) {
        for (let j = 0; j < piece[i].length; j++) {
            if (!canBePlaced || piece[i][j] === "⬜") continue
            if (!board?.[y + i]?.[x + j]) {

                canBePlaced = false
                continue
            
            }

            if (board[y + i][x + j] !== "⬛") canBePlaced = false
        }
    }

    if (!canBePlaced) return y - 1

    return calcBottom(x, y + 1, piece, board)
}

function clearBoard(board) {
    let clearedLine = 0
    for (let i = 0; i < board.length; i++) {
        let complete = true

        for (let j = 0; j < board[i].length; j++) {
            if (!complete) continue

            if (board[i][j] === "⬛") complete = false
        }

        if (complete) {
            clearedLine = clearedLine + 1

            const top = board.slice(0, i)
            const bottom = board.slice(i + 1, board.length)
            const newRow = ["⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛"]

            board = [newRow, ...top, ...bottom]
        }
    }

    return { board, clearedLine }
}