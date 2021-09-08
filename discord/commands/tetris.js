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
        const board = [
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
            piece: pieces[Math.floor(Math.random() * pieces.length)]
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
        
        function copyArray(array) {
            return JSON.parse(JSON.stringify(array))
        }
        
        //TODO
        //function place(piece, board, col) {
        //    const max = piece[0].length
        //    col = col - 1
        //
        //    for (let i = 0; i < board.length; i++) {
        //        //* Check if occuped
        //        for (let j = 0; j < max; j++) {
        //            //board[i][j + col]
        //        }
        //    }
        //
        //    return board
        //}
        
        //const nothing = new MessageButton()
        //    .setCustomId(`game_tetris_${interaction.user.id}_nothing`)
        //    .setDisabled(true)
        //    .setStyle("SECONDARY")
        //    .setLabel("\u200B")

        //const upArrow = new MessageButton()
        //    .setCustomId(`game_tetris_${interaction.user.id}_up`)
        //    .setStyle("PRIMARY")
        //    .setEmoji("🔼")

        //const downArrow = new MessageButton()
        //    .setCustomId(`game_tetris_${interaction.user.id}_down`)
        //    .setStyle("PRIMARY")
        //    .setEmoji("🔽")

        const leftArrow = new MessageButton()
            .setCustomId(`game_tetris_${interaction.user.id}_left`)
            .setStyle("PRIMARY")
            .setEmoji("◀️")

        const rightArrow = new MessageButton()
            .setCustomId(`game_tetris_${interaction.user.id}_right`)
            .setStyle("PRIMARY")
            .setEmoji("▶️")

        const buttons = new MessageButton()
            .setCustomId("rotate")
            .setEmoji("🔄")
            .setStyle("PRIMARY")

        const components = new MessageActionRow()
            .addComponents(leftArrow, rightArrow, buttons)

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

            if (button.customId === "rotate") {
                playerData.piece = rotate(playerData.piece, false)

                const formattedBoard = toString(board)
                const embed = new MessageEmbed()
                    .setTitle("Tetris de " + interaction.user.username)
                    .setDescription(`\`\`\`${formattedBoard}${numberLine.join("")}\`\`\``)
                    .addField(`Premiere piece :`, `\`\`\`${toString(playerData.piece)}\`\`\``)
        
                await button.deferUpdate()
                return await msg.edit({
                    embeds: [ embed ]
                })
            }
        })


        /* 
        ⬜⬜🟩
        🟩🟩🟩
        */
    }
}
