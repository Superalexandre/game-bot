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

            //[
            //    ["0:0", "0:1", "0:2", "0:3", "0:4", "0:5", "0:6", "0:7", "0:8", "0:9"],
            //    ["1:0", "1:1", "1:2", "1:3", "1:4", "1:5", "1:6", "1:7", "1:8", "1:9"],
            //    ["2:0", "2:1", "2:2", "2:3", "2:4", "2:5", "2:6", "2:7", "2:8", "2:9"],
            //    ["3:0", "3:1", "3:2", "3:3", "3:4", "3:5", "3:6", "3:7", "3:8", "3:9"],
            //    ["4:0", "4:1", "4:2", "4:3", "4:4", "4:5", "4:6", "4:7", "4:8", "4:9"],
            //    ["5:0", "5:1", "5:2", "5:3", "5:4", "5:5", "5:6", "5:7", "5:8", "5:9"],
            //    ["6:0", "6:1", "6:2", "6:3", "6:4", "6:5", "6:6", "6:7", "6:8", "6:9"],
            //    ["7:0", "7:1", "7:2", "7:3", "7:4", "7:5", "7:6", "7:7", "7:8", "7:9"],
            //    ["8:0", "8:1", "8:2", "8:3", "8:4", "8:5", "8:6", "8:7", "8:8", "8:9"],
            //    ["9:0", "9:1", "9:2", "9:3", "9:4", "9:5", "9:6", "9:7", "9:8", "9:9"],
            //    ["10:0", "10:1", "10:2", "10:3", "10:4", "10:5", "10:6", "10:7", "10:8", "10:9"],
            //    ["11:0", "11:1", "11:2", "11:3", "11:4", "11:5", "11:6", "11:7", "11:8", "11:9"],
            //    ["12:0", "12:1", "12:2", "12:3", "12:4", "12:5", "12:6", "12:7", "12:8", "12:9"],
            //    ["13:0", "13:1", "13:2", "13:3", "13:4", "13:5", "13:6", "13:7", "13:8", "13:9"],
            //    ["14:0", "14:1", "14:2", "14:3", "14:4", "14:5", "14:6", "14:7", "14:8", "14:9"],
            //    ["15:0", "15:1", "15:2", "15:3", "15:4", "15:5", "15:6", "15:7", "15:8", "15:9"],
            //    ["16:0", "16:1", "16:2", "16:3", "16:4", "16:5", "16:6", "16:7", "16:8", "16:9"],
            //    ["17:0", "17:1", "17:2", "17:3", "17:4", "17:5", "17:6", "17:7", "17:8", "17:9"],
            //    ["18:0", "18:1", "18:2", "18:3", "18:4", "18:5", "18:6", "18:7", "18:8", "18:9"],
            //    ["19:0", "19:1", "19:2", "19:3", "19:4", "19:5", "19:6", "19:7", "19:8", "19:9"],
            //]
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
            .setDisabled(canPlace(playerData.x, "left", 1, playerData.piece, board))

        const rightArrow = new MessageButton()
            .setCustomId(`game_tetris_${interaction.user.id}_right`)
            .setStyle("PRIMARY")
            .setEmoji("▶️")
            .setDisabled(canPlace(playerData.x, "right", 1, playerData.piece, board))

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

                if (canPlace(playerData.x, "right", 0, newPiece, board)) {
                    //* Edit buttons
                    rotateArrow.setDisabled(canPlace(playerData.x, "right", 0, rotate(playerData.piece), board))
                    leftArrow.setDisabled(canPlace(playerData.x, "left", 1, playerData.piece, board))
                    rightArrow.setDisabled(canPlace(playerData.x, "right", 1, playerData.piece, board))
                    
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
                rotateArrow.setDisabled(canPlace(playerData.x, "right", 0, rotate(playerData.piece), board))
                leftArrow.setDisabled(canPlace(playerData.x, "left", 1, playerData.piece, board))
                rightArrow.setDisabled(canPlace(playerData.x, "right", 1, playerData.piece, board))
                
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
                const newX = id[id.length - 1] === "left" ? playerData.x - 1 : playerData.x + 1

                if (canPlace(newX, id[id.length - 1], 0, playerData.piece, board)) {
                    //* Edit buttons
                    rotateArrow.setDisabled(canPlace(newX, "right", 0, rotate(playerData.piece), board))
                    leftArrow.setDisabled(canPlace(newX, "left", 1, playerData.piece, board))
                    rightArrow.setDisabled(canPlace(newX, "right", 1, playerData.piece, board))
                
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

                playerData.x = newX        
                
                //* Place
                board = place(playerData.x, playerData.y, playerData.piece, board)

                //* Edit buttons
                rotateArrow.setDisabled(canPlace(newX, "right", 0, rotate(playerData.piece), board))
                leftArrow.setDisabled(canPlace(newX, "left", 1, playerData.piece, board))
                rightArrow.setDisabled(canPlace(newX, "right", 1, playerData.piece, board))
                
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
                const newY = calcBottom(playerData.x, playerData.y, playerData.piece, board)

                //* Remove before piece
                board = remove(playerData.x, playerData.y, playerData.piece, board)

                //* Place piece
                board = place(playerData.x, newY, playerData.piece, board)

                //* Edit player data
                playerData.x = 0
                playerData.y = 0
                playerData.piece = pieces[Math.floor(Math.random() * pieces.length)]

                //* Place piece
                board = place(playerData.x, playerData.y, playerData.piece, board)

                //* Edit buttons
                rotateArrow.setDisabled(canPlace(playerData.x, "right", 0, rotate(playerData.piece), board))
                leftArrow.setDisabled(canPlace(playerData.x, "left", 1, playerData.piece, board))
                rightArrow.setDisabled(canPlace(playerData.x, "right", 1, playerData.piece, board))

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

function place(x, y, piece, board) {
    for (let i = 0; i < piece.length; i++) {
        for (let j = 0; j < piece[i].length; j++) {
            if (piece[i][j] === "⬜") continue

            board[y + i][x + j] = piece[i][j]
        }
    }

    return board
}

function remove(x, y, piece, board) {
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

//TODO
function calcBottom(x, y, piece, board) {
    let newY = y + (board.length - piece.length)
    let canPlaced = true

    /*
    ! Doesn't work

    let breaked = false
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (breaked) break

            if (breaked && i > 5 && j === x && board[i][j] !== "⬛") {
                console.log("BREAK", i, j, breaked)
                newY = i - 1

                breaked = true
            }
        }
    }
    */

    //* Board
    for (let i = 0; i < piece.length; i++) {
        for (let j = 0; j < piece[i].length; j++) {
            if (piece[i][j] === "⬜") continue

            if (board[newY + i][x + j] !== "⬛") { 
                /*  
                ! Doesn't work

                for (let k = 0; k < newY; k++) {
                    if (k > 5 && board[k][x + j] !== "⬛") {
                    
                        canPlaced = false
                        y = k - 1
        
                        console.log("Breaked", k)

                        break   
                    }
                }
                */

                canPlaced = false

                break
            }
        }
    }

    if (!canPlaced) return calcBottom(x, y - 1, piece, board)

    return newY
}

function copyArray(array) {
    return JSON.parse(JSON.stringify(array))
}