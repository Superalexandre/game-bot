import { Command } from "../structures/Command.js"
//import { generate, board_string_to_grid, solve } from "sudoku-umd"
import sudoku from "sudoku-umd"
import { MessageButton, MessageActionRow, MessageEmbed } from "discord.js"

export default class Sudoku extends Command {
    constructor(client) {
        super(client, {
            name: "sudoku",
            description: "Faites fonctionner votre cerveau pour résoudre ce sudoku !",
            options: [
                {
                    type: "STRING",
                    name: "difficulte",
                    description: "Saisissez la difficulté",
                    required: true,
                    choices: [
                        {
                            name: "Facile",
                            value: "easy"
                        }, {
                            name: "Moyen",
                            value: "medium"
                        }, {
                            name: "Difficile",
                            value: "hard"
                        }, {
                            name: "Très difficile",
                            value: "very-hard"
                        }, {
                            name: "Insane",
                            value: "insane"
                        }, {
                            name: "Inhumain",
                            value: "inhuman"
                        }
                    ]
                }
            ],
            directory: import.meta.url
        })
    }

    async run({ client, interaction, options, i18n }) {
        const difficulty = options.getString("difficulte")
        const board = await sudoku.generate(difficulty)
        const grid = sudoku.board_string_to_grid(board)

        const resultString = sudoku.solve(board)
        const resultGrid = sudoku.board_string_to_grid(resultString)

        const emotes = {
            "blue": {
                ".": "<:B0:883431754231345193>",
                "1": "<:B1:883431754218766336>",
                "2": "<:B2:883431753925161021>",
                "3": "<:B3:883431754222960723>",
                "4": "<:B4:883431754373939280>",
                "5": "<:B5:883431753879015435>",
                "6": "<:B6:883431754231336981>",
                "7": "<:B7:883431754290049064>",
                "8": "<:B8:883431754281668738>",
                "9": "<:B9:883431754361356318>",
                "space": "⬜"
            },
            "green": {
                ".": "<:V0:883457698086150165>",
                "1": "<:V1:883457698102902821>",
                "2": "<:V2:883457698279096381>",
                "3": "<:V3:883457697805131798>",
                "4": "<:V4:883457697909989399>",
                "5": "<:V5:883457698228748318>",
                "6": "<:V6:883457698249736264>",
                "7": "<:V7:883457698102935623>",
                "8": "<:V8:883457698316824576>",
                "9": "<:V9:883457698245533770>",
                "space": "⬜"
            },
            "yellow": {
                ".": "<:J0:883467881415860254>",
                "1": "<:J1:883467881369718864>",
                "2": "<:J2:883467880920911945>",
                "3": "<:J3:883467881319383080>",
                "4": "<:J4:883467881336164402>",
                "5": "<:J5:883467881386496050>",
                "6": "<:J6:883467881327771648>",
                "7": "<:J7:883467881235484763>",
                "8": "<:J8:883467881357123604>",
                "9": "<:J9:883467881378091038>",
                "space": "⬜"
            },
            "red": {
                ".": "<:R0:883634258957197352>",
                "1": "<:R1:883634090140647434>",
                "2": "<:R2:883634089889001532>",
                "3": "<:R3:883634089868030002>",
                "4": "<:R4:883634089863819274>",
                "5": "<:R5:883634089943519262>",
                "6": "<:R6:883634089595396108>",
                "7": "<:R7:883634090312597595>",
                "8": "<:R8:883634089830273055>",
                "9": "<:R9:883634089905778728>",
                "space": "⬜"
            }
        }

        let playerInfo = {
            difficulty: difficulty,
            line: undefined,
            column: undefined,
            number: undefined,
            error: undefined
        }

        const gameInfo = await genInfo({ grid, emotes, interaction })

        const embed = new MessageEmbed()
            .setTitle("Sudoku de " + interaction.user.username)
            .setDescription(`Difficulté : ${playerInfo.difficulty}\nLigne : ${playerInfo.line ?? "Pas sélectionnée"}\nColonne : ${playerInfo.column ?? "Pas sélectionnée"}\nChiffre : ${playerInfo.column && playerInfo.line ? "séleectionnée le" : "A choisir après"}\n\n` + gameInfo.string + `${playerInfo.error ? `\n${playerInfo.error}` : ""}`)

        const msg = await interaction.channel.send({
            embeds: [embed],
            components: gameInfo.components
        })

        const collector = await msg.createMessageComponentCollector({ componentType: "BUTTON" })
    
        collector.on("collect", async(button) => {
            if (!button.user) await button.user.fetch()
            if (!interaction.user) await interaction.user.fetch()

            if (button.user.id !== interaction.user.id) return await button.reply({
                content: i18n.__("discord.global.notYourGame", { gameName: "sudoku" }),
                ephemeral: true
            })

            const mainText = (playerInfo, gameInfo) => `Difficulté : ${playerInfo.difficulty}\nLigne : ${playerInfo.line ?? "Pas sélectionnée"}\nColonne : ${playerInfo.column ?? "Pas sélectionnée"}\nChiffre : ${playerInfo.column && playerInfo.line ? "séleectionnée le" : "A choisir après"}\n\n` + gameInfo.string + `${playerInfo.error ? `\n${playerInfo.error}` : ""}`

            const [,,, idNumber] = button.customId.split("_")
            const number = parseInt(idNumber)
    
            //* Back
            if (number === 10) {
                if (playerInfo.column) {
                    playerInfo.column = undefined
                } else if (playerInfo.line) playerInfo.line = undefined
            
                const gameInfo = await genInfo({ grid, emotes, interaction, highlightedLine: playerInfo.line, highlightedColumn: playerInfo.column })

                await button.deferUpdate()

                const embed = new MessageEmbed()
                    .setTitle("Sudoku de " + interaction.user.username)
                    .setDescription(mainText(playerInfo, gameInfo))

                return await msg.edit({
                    embeds: [embed],
                    components: gameInfo.components
                })
            }

            //* Check
            if (idNumber === "check") {
                let win = true

                for (let i = 0; i < resultGrid.length; i++) {
                    for (let j = 0; j < resultGrid[i].length; j++) {
                        const value = grid[i][j].split("-")[0]

                        if (value !== resultGrid[i][j]) {
                            win = false
                            grid[i][j] = `${value}-false`
                        } else grid[i][j] = resultGrid[i][j]
                    }
                }

                if (win) {
                    const gameInfo = await genInfo({ grid, emotes, interaction, highlightedLine: playerInfo.line, highlightedColumn: playerInfo.column })

                    await button.deferUpdate()
                    collector.stop()

                    const gameId = await client.functions.genGameId({ gameName: "sudoku", length: 30 })
                    const guild = await interaction.guild.fetch()
                    const user = await interaction.user.fetch()

                    await client.functions.gameStats({ 
                        data: client.data, 
                        gameId,
                        guildOrChat: {
                            type: "guild",
                            data: guild
                        },
                        plateform: "discord", 
                        user1: user,
                        gameName: "sudoku", 
                        winnerId: "solo"
                    })    

                    const embed = new MessageEmbed()
                        .setTitle("Sudoku de " + interaction.user.username)
                        .setDescription(`Bravo ${interaction.user.username} vous avez gagner en difficulté ${playerInfo.difficulty} !\n\n` + gameInfo.string)

                    
                    return await msg.edit({
                        embeds: [embed],
                        components: []
                    })
                }

                const gameInfo = await genInfo({ grid, emotes, interaction, highlightedLine: playerInfo.line, highlightedColumn: playerInfo.column })

                await button.deferUpdate()

                const embed = new MessageEmbed()
                    .setTitle("Sudoku de " + interaction.user.username)
                    .setDescription(mainText(playerInfo, gameInfo))

                return await msg.edit({
                    embeds: [embed],
                    components: gameInfo.components
                })
            }

            playerInfo.error = ""

            if ((!playerInfo.line || !playerInfo.column) && idNumber === "void") {
                playerInfo.error = "Ce n'est pas le moment de vider une case"

                const gameInfo = await genInfo({ grid, emotes, interaction, highlightedLine: playerInfo.line, highlightedColumn: playerInfo.column })

                await button.deferUpdate()

                const embed = new MessageEmbed()
                    .setTitle("Sudoku de " + interaction.user.username)
                    .setDescription(mainText(playerInfo, gameInfo))

                return await msg.edit({
                    embeds: [embed],
                    components: gameInfo.components
                })
            }

            //* Check where add number
            if (!playerInfo.line) {
                playerInfo.line = number
            } else if (!playerInfo.column) {
                playerInfo.column = number
            } else playerInfo.number = idNumber === "void" ? "void" : number

            //* If all complete
            if (playerInfo.line && playerInfo.column) {
                //* If already occuped but base
                const type = grid[playerInfo.line - 1][playerInfo.column - 1].split("-")

                if (grid[playerInfo.line - 1][playerInfo.column - 1] !== "." && (!type[1] && !["false", "placed"].includes(type[1]))) {              
                    playerInfo.column = undefined
                    playerInfo.error = "Désolé mais vous ne pouvez pas choisir cette case"
                }

                //* If all good
                if (playerInfo.number) {
                    grid[playerInfo.line - 1][playerInfo.column - 1] = idNumber === "void" ? "." : `${number}-placed`
                    playerInfo.line = undefined
                    playerInfo.column = undefined
                    playerInfo.number = undefined
                }
            }

            const gameInfo = await genInfo({ grid, emotes, interaction, highlightedLine: playerInfo.line, highlightedColumn: playerInfo.column })

            await button.deferUpdate()

            const embed = new MessageEmbed()
                .setTitle("Sudoku de " + interaction.user.username)
                .setDescription(mainText(playerInfo, gameInfo))

            const components = gameInfo.components
            if (gameInfo.allFilled) {
                const buttons = new MessageButton()
                    .setCustomId(`game_sudoku_${interaction.user.id}_check`)
                    .setLabel("Verifier")
                    .setStyle("SUCCESS")

                gameInfo.components[2].addComponents(buttons)
            }

            await msg.edit({
                embeds: [embed],
                components: components
            })
        })
    }
}

async function genInfo({ grid, emotes, interaction, highlightedLine, highlightedColumn }) {
    let allFilled = true
    let string = ""

    for (let i = 0; i < grid.length; i++) {
        //* White line
        if ((i % 3 === 0) && i > 0) string += emotes["blue"]["space"].repeat(grid[i].length + 2) + "\n"

        for (let j = 0; j < grid[i].length; j++) {
            //* White line
            if ((j % 3 === 0) && j > 0) string += emotes["blue"]["space"]

            let color = "blue"

            if ((i === highlightedLine - 1 && highlightedLine && !highlightedColumn) || (i === highlightedLine - 1 && j === highlightedColumn - 1 && highlightedLine && highlightedColumn)) {
                color = "green"
            }

            let [value, type] = grid[i][j].split("-")
            
            color = type === "placed" ? "yellow" : type === "false" ? "red" : color
            
            if (Number.isNaN(value)) value = parseInt(value)
            
            if (allFilled) allFilled = value !== "."

            string += emotes[color][value]
        }

        string += "\n"
    }

    //* Create all buttons
    const [numberComponents1, numberComponents2, numberComponents3] = [new MessageActionRow(), new MessageActionRow(), new MessageActionRow()]

    for (let i = 1; i < 11; i++) {
        const button = new MessageButton()
            .setCustomId(`game_sudoku_${interaction.user.id}_${i}`)
            .setStyle(i === 10 ? "DANGER" : "PRIMARY")
            .setLabel(i === 10 ? "Retour" : `${i}`)


        i - 1 >= 5 ? numberComponents2.addComponents(button) : numberComponents1.addComponents(button)
    }

    const nothing = new MessageButton()
        .setCustomId(`game_sudoku_${interaction.user.id}_void`)
        .setStyle("SECONDARY")
        .setLabel("Vider la case")
        .setDisabled(!highlightedLine || !highlightedColumn)

    numberComponents3.addComponents(nothing)

    return { string, components: [numberComponents1, numberComponents2, numberComponents3], allFilled }
}