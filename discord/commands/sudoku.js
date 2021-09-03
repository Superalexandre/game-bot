const Command = require("../structures/Command")
const sudoku = require("sudoku-umd")
const { MessageButton, MessageActionRow, MessageEmbed  } = require("discord.js")

module.exports = class Sudoku extends Command {
    constructor(client) {
        super(client, {
            name: "sudoku",
            directory: __dirname
        })
    }

    async run({ client, interaction, options, channel, i18n, data, userData, util }) {
        const difficulty = options.getString("difficulte")
        const board = await sudoku.generate(difficulty)
        const grid = sudoku.board_string_to_grid(board)
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
            }
        }

        let playerInfo = {
            line: undefined,
            column: undefined,
            number: undefined,
            error: undefined
        }

        const gameInfo = await genInfo({ grid, emotes, interaction })

        const embed = new MessageEmbed()
            .setTitle("Sudoku de " + interaction.user.username)
            .setDescription(`Ligne : ${playerInfo.line ?? "Pas séléctionner"}\nColonne : ${playerInfo.column ?? "Pas séléctionner"}\n\n` + gameInfo.string)

        const msg = await interaction.channel.send({
            embeds: [embed],
            components: gameInfo.components
        })

        const collector = await msg.createMessageComponentCollector({ componentType: "BUTTON" })
    
        collector.on("collect", async (button) => {
            if (!button.user) await button.user.fetch()
            if (!interaction.user) await interaction.user.fetch()

            if (button.user.id !== interaction.user.id) return await button.reply({
                content: i18n.__("global.notYourGame", { gameName: "memory" }),
                ephemeral: true
            })

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
                    .setDescription(`Ligne : ${playerInfo.line ?? "Pas sélectionnée"}\nColonne : ${playerInfo.column ?? "Pas sélectionnée"}\nChiffre : ${playerInfo.column && playerInfo.line ? "séleectionnée le" : "A choisir après"}\n\n` + gameInfo.string + `${playerInfo.error ? `\n${playerInfo.error}` : ""}`)

                return await msg.edit({
                    embeds: [embed],
                    components: gameInfo.components
                })
            }

            playerInfo.error = ""

            //* Check where add number
            if (!playerInfo.line) {
                playerInfo.line = number
            } else if (!playerInfo.column) {
                playerInfo.column = number
            } else playerInfo.number = number

            //* If all complete
            if (playerInfo.line && playerInfo.column) {
                //* If already occuped but base
                if (grid[playerInfo.line - 1][playerInfo.column - 1] !== "." && !grid[playerInfo.line - 1][playerInfo.column - 1].endsWith("-placed")) {              
                    playerInfo.column = undefined
                    playerInfo.error = "Désolé mais vous ne pouvez pas choisir cette case"
                }

                //* If all good
                if (playerInfo.number) {
                    grid[playerInfo.line - 1][playerInfo.column - 1] = `${number}-placed`
                    playerInfo.line = undefined
                    playerInfo.column = undefined
                    playerInfo.number = undefined
                }
            }

            const gameInfo = await genInfo({ grid, emotes, interaction, highlightedLine: playerInfo.line, highlightedColumn: playerInfo.column })

            await button.deferUpdate()

            const embed = new MessageEmbed()
                .setTitle("Sudoku de " + interaction.user.username)
                .setDescription(`Ligne : ${playerInfo.line ?? "Pas sélectionnée"}\nColonne : ${playerInfo.column ?? "Pas sélectionnée"}\nChiffre : ${playerInfo.column && playerInfo.line ? "séleectionnée le" : "A choisir après"}\n\n` + gameInfo.string + `${playerInfo.error ? `\n${playerInfo.error}` : ""}`)

            await msg.edit({
                embeds: [embed],
                components: gameInfo.components
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

            if (i === highlightedLine - 1 && highlightedLine && !highlightedColumn) {
                color = "green"
            } else if (i === highlightedLine - 1 && j === highlightedColumn - 1 && highlightedLine && highlightedColumn) {
                color = "green"
            }

            // TODO : If placed => Yellow
            const [value, placed] = grid[i][j].split("-")

            allFilled = value !== "."

            string += emotes[color][value]
        }

        string += "\n"
    }

    //* Create all buttons
    const [numberComponents1, numberComponents2] = [new MessageActionRow(), new MessageActionRow()]

    for (let i = 1; i < 11; i++) {
        const button = new MessageButton()
            .setCustomId(`game_sudoku_${interaction.user.id}_${i}`)
            .setStyle(i === 10 ? "DANGER" : "PRIMARY")
            .setLabel(i === 10 ? "Retour" : `${i}`)


        i - 1 >= 5 ? numberComponents2.addComponents(button) : numberComponents1.addComponents(button)
    }

    return { string, components: [numberComponents1, numberComponents2] }
}