const Command = require("../structures/Command")
const { MessageButton, MessageActionRow, MessageEmbed } = require("discord.js")

module.exports = class Tetris extends Command {
    constructor(client) {
        super(client, {
            name: "tetris",
            directory: __dirname,
        })
    }

    async run({ client, interaction, options, i18n, data, userData, util }) {
        /*
            
        🟧
        🟦
        🟥
        🟫
        🟪
        🟩
        🟨
            
        ⬜
        ⬛
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
                ["🟫", "🟫", "⬜"], 
                ["⬜", "🟫", "🟫"]
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
        let board = [
            //      1    2    3    4    5    6    7    8    9    10
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
            ["⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛"], //⬛ /*20*/
        ]
        
        let playerData = {
            user: interaction.user,
            piece: pieces[Math.floor(Math.random() * pieces.length)],
            x: 0,
            y: 0
        }

        //* Place piece
        board = place(playerData.x, playerData.y, playerData.piece, board)

        //* Create all buttons
        const leftArrow = new MessageButton()
            .setCustomId(`game_tetris_${interaction.user.id}_left`)
            .setStyle("PRIMARY")
            .setEmoji("◀️")
            .setDisabled(canPlace(playerData.y, "left", 1, playerData.piece, board))

        const rightArrow = new MessageButton()
            .setCustomId(`game_tetris_${interaction.user.id}_right`)
            .setStyle("PRIMARY")
            .setEmoji("▶️")
            .setDisabled(canPlace(playerData.y, "right", 1, playerData.piece, board))

        const rotateArrow = new MessageButton()
            .setCustomId(`game_tetris_${interaction.user.id}_rotate`)
            .setEmoji("🔄")
            .setStyle("PRIMARY")

        const valid = new MessageButton()
            .setCustomId(`game_tetris_${interaction.user.id}_valid`)
            .setEmoji("✅")
            .setStyle("SUCCESS")

        let components = new MessageActionRow().addComponents(leftArrow, rightArrow, rotateArrow, valid)

        const formattedBoard = toString(board)
        const embed = new MessageEmbed()
            .setTitle("Tetris de " + interaction.user.username)
            .setDescription(`\`\`\`${formattedBoard}${numberLine.join("")}\`\`\``)
            .addField(`Premiere piece :`, `\`\`\`${toString(playerData.piece)}\`\`\``)

        const msg = await interaction.channel.send({
            embeds: [ embed ],
            components: [ components ]
        })

        const collector = await msg.createMessageComponentCollector({ componentType: "BUTTON" })

        collector.on("collect", async(button) => {
            if (!button.user) await button.user.fetch()

            if (button.user.id !== interaction.user.id) return await button.reply({
                content: i18n.__("global.notYourGame", { gameName: "tetris" }),
                ephemeral: true

            })

            const id = button.customId.split("_")

            if (id[id.length - 1] === "rotate") {
                const newPiece = rotate(playerData.piece, false)

                if (canPlace(playerData.y, "right", 0, newPiece, board)) {
                    //* Edit buttons
                    rotateArrow.setDisabled(canPlace(playerData.y, "right", 0, rotate(playerData.piece), board))
                    leftArrow.setDisabled(canPlace(playerData.y, "left", 1, playerData.piece, board))
                    rightArrow.setDisabled(canPlace(playerData.y, "right", 1, playerData.piece, board))
                    
                    components = new MessageActionRow().addComponents(leftArrow, rightArrow, rotateArrow, valid)

                    //* Edit message
                    const formattedBoard = toString(board)
                    const embed = new MessageEmbed()
                        .setTitle("Tetris de " + interaction.user.username)
                        .setDescription(`\`\`\`${formattedBoard}${numberLine.join("")}\`\`\``)
                        .addField("Erreur", "Vous ne pouvez pas continuer aussi loin")
                        .addField(`Premiere piece :`, `\`\`\`${toString(playerData.piece)}\`\`\``)
        
                    await button.deferUpdate()
                    return await msg.edit({
                        embeds: [ embed ],
                        components: [ components ]
                    })
                }

                //* Remove before piece
                board = remove(playerData.x, playerData.y, playerData.piece, board)

                //* Rotate
                playerData.piece = newPiece
                
                //* Place
                board = place(playerData.x, playerData.y, playerData.piece, board)

                //* Edit buttons
                rotateArrow.setDisabled(canPlace(playerData.y, "right", 0, rotate(playerData.piece), board))
                leftArrow.setDisabled(canPlace(playerData.y, "left", 1, playerData.piece, board))
                rightArrow.setDisabled(canPlace(playerData.y, "right", 1, playerData.piece, board))
                
                components = new MessageActionRow().addComponents(leftArrow, rightArrow, rotateArrow, valid)

                //* Edit message
                const formattedBoard = toString(board)
                const embed = new MessageEmbed()
                    .setTitle("Tetris de " + interaction.user.username)
                    .setDescription(`\`\`\`${formattedBoard}${numberLine.join("")}\`\`\``)
                    .addField(`Premiere piece :`, `\`\`\`${toString(playerData.piece)}\`\`\``)
        
                await button.deferUpdate()
                return await msg.edit({
                    embeds: [ embed ],
                    components: [ components ]
                })
            }

            if (["left", "right"].includes(id[id.length - 1])) {
                const newY = id[id.length - 1] === "left" ? playerData.y - 1 : playerData.y + 1

                if (canPlace(newY, id[id.length - 1], 0, playerData.piece, board)) {
                    //* Edit buttons
                    rotateArrow.setDisabled(canPlace(newY, "right", 0, rotate(playerData.piece), board))
                    leftArrow.setDisabled(canPlace(newY, "left", 1, playerData.piece, board))
                    rightArrow.setDisabled(canPlace(newY, "right", 1, playerData.piece, board))
                
                    components = new MessageActionRow().addComponents(leftArrow, rightArrow, rotateArrow, valid)

                    //* Edit message
                    const formattedBoard = toString(board)
                    const embed = new MessageEmbed()
                        .setTitle("Tetris de " + interaction.user.username)
                        .setDescription(`\`\`\`${formattedBoard}${numberLine.join("")}\`\`\``)
                        .addField("Erreur", "Vous ne pouvez pas continuer aussi loin")
                        .addField(`Premiere piece :`, `\`\`\`${toString(playerData.piece)}\`\`\``)
        
                    await button.deferUpdate()
                    return await msg.edit({
                        embeds: [ embed ],
                        components: [ components ]
                    })
                }

                //* Remove before piece
                board = remove(playerData.x, playerData.y, playerData.piece, board)

                playerData.y = newY        
                
                //* Place
                board = place(playerData.x, playerData.y, playerData.piece, board)

                //* Edit buttons
                rotateArrow.setDisabled(canPlace(newY, "right", 0, rotate(playerData.piece), board))
                leftArrow.setDisabled(canPlace(newY, "left", 1, playerData.piece, board))
                rightArrow.setDisabled(canPlace(newY, "right", 1, playerData.piece, board))
                
                components = new MessageActionRow().addComponents(leftArrow, rightArrow, rotateArrow, valid)

                //* Edit message
                const formattedBoard = toString(board)
                const embed = new MessageEmbed()
                    .setTitle("Tetris de " + interaction.user.username)
                    .setDescription(`\`\`\`${formattedBoard}${numberLine.join("")}\`\`\``)
                    .addField(`Premiere piece :`, `\`\`\`${toString(playerData.piece)}\`\`\``)
        
                await button.deferUpdate()
                return await msg.edit({
                    embeds: [ embed ],
                    components: [ components ]
                })
            }

            if (id[id.length - 1] === "valid") {
                const newX = calcBottom(playerData.x, playerData.y, playerData.piece, board)

                //* Remove before piece
                board = remove(playerData.x, playerData.y, playerData.piece, board)

                //* Place piece
                board = place(newX, playerData.y, playerData.piece, board)

                //* Edit buttons
                rotateArrow.setDisabled(canPlace(playerData.y, "right", 0, rotate(playerData.piece), board))
                leftArrow.setDisabled(canPlace(playerData.y, "left", 1, playerData.piece, board))
                rightArrow.setDisabled(canPlace(playerData.y, "right", 1, playerData.piece, board))
                
                components = new MessageActionRow().addComponents(leftArrow, rightArrow, rotateArrow, valid)

                //* Edit player data
                playerData.x = 0
                playerData.y = 0
                playerData.piece = pieces[Math.floor(Math.random() * pieces.length)]

                //* Place piece
                board = place(playerData.x, playerData.y, playerData.piece, board)

                //* Edit message
                const formattedBoard = toString(board)
                const embed = new MessageEmbed()
                    .setTitle("Tetris de " + interaction.user.username)
                    .setDescription(`\`\`\`${formattedBoard}${numberLine.join("")}\`\`\``)
                    .addField(`Premiere piece :`, `\`\`\`${toString(playerData.piece)}\`\`\``)
        
                await button.deferUpdate()
                return await msg.edit({
                    embeds: [ embed ],
                    components: [ components ]
                })
            }
        })
    }
}

function toString(piece) {
    let string = ""

    for (let i = 0; i < piece.length; i++) {
        for (let j = 0; j < piece[i].length; j++) {
            string += piece[i][j]
        }
        
        string += "\n"
    }

    return string
}

function rotate(piece, clockwise) {
    if (clockwise === undefined) clockwise = false
    let result = Array.from(piece[0], x => Array.from(piece, y => false))
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

function place(x, y, piece, board) {
    for (let i = 0; i < piece.length; i++) {
        for (let j = 0; j < piece[i].length; j++) {
            if (piece[i][j] === "⬜") continue

            board[x + i][y + j] = piece[i][j]
        }
    }

    return board
}

function remove(x, y, piece, board) {
    for (let i = 0; i < piece.length; i++) {
        for (let j = 0; j < piece[i].length; j++) {
            if (piece[i][j] === "⬜") continue

            board[x + i][y + j] = "⬛"
        }
    }

    return board
}

function canPlace(newY, direction, additionnal, piece, board) {
    if (!additionnal) additionnal = 0

    if (direction === "left") return (newY - additionnal) < 0

    return (newY + additionnal) + piece[0].length > board[0].length
}

//! TODO
function calcBottom(x, y, piece, board) {
    let newX = 0

    const copyBoard = copyArray(board).reverse()

    /*

    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (!placed && j === row && board[i][j] === "⚪") {
                board[i][j] = emoji

                placed = true
            }
        }
    }

    */


    /*
    
    ****
    ****
    ****
    x***
    xxx*
    
    */

    //* Board
    for (let i = 0; i < copyBoard.length; i++) {
        for (let j = 0; j < copyBoard[i].length; j++) {
            if (j === y ) {
                newX = (i - (piece[0].length))
            } else break
        }
    }

    return newX
}

function copyArray(array) {
    return JSON.parse(JSON.stringify(array))
}