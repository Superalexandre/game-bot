import { Command } from "../structures/Command.js"
import { MessageButton, MessageActionRow } from "discord.js"

export default class Morpion extends Command {
    constructor(client) {
        super(client, {
            name: "morpion",
            description: "Jouez au morpion facilement !",
            options: [
                {
                    type: "USER",
                    name: "adversaire",
                    description: "Saisissez un utilisateur afin de jouer contre lui ou saisissez le robot pour jouer contre lui",
                    required: true
                }
            ],
            directory: import.meta.url
        })
    }

    async run({ client, interaction, options, i18n }) {
        const opponent = options.getUser("adversaire")

        if (!opponent || opponent.id === client.user.id) return playWithBot({ i18n, interaction, client })

        if (opponent.bot || opponent.id === interaction.user.id) return await interaction.editReply({
            content: i18n.__("error.invalidOpponent"),
            ephemeral: true
        })

        const ready = new MessageButton()
            .setStyle("SUCCESS")
            .setLabel(i18n.__("discord.global.yes"))
            .setCustomId(`game_morpion_${interaction.user.id}_${opponent.id}_ready`)
    
        const notReady = new MessageButton()
            .setStyle("DANGER")
            .setLabel(i18n.__("discord.global.no"))
            .setCustomId(`game_morpion_${interaction.user.id}_${opponent.id}_notready`)

        const readyComponents = new MessageActionRow().addComponents(ready, notReady)

        if (!opponent.user) await opponent.fetch()

        const msg = await interaction.channel.send({
            content: i18n.__("discord.global.opponentReady", { userId: opponent.id, gameName: "morpion" }),
            components: [ readyComponents ]
        })

        return opponentReady({ i18n, interaction, msg, opponent, client })
    }
}

async function playWithBot({ i18n, interaction, client }) {
    const yes = new MessageButton()
        .setStyle("SUCCESS")
        .setLabel(i18n.__("discord.global.yes"))
        .setCustomId(`game_morpion_${interaction.user.id}_yes`)

    const no = new MessageButton()
        .setStyle("DANGER")
        .setLabel(i18n.__("discord.global.no"))
        .setCustomId(`game_morpion_${interaction.user.id}_no`)

    const row = new MessageActionRow().addComponents(yes, no)

    const msg = await interaction.channel.send({
        content: i18n.__("discord.global.playWithBot"),
        components: [row]
    })

    const collector = await msg.createMessageComponentCollector({ componentType: "BUTTON" })

    collector.on("collect", async(button) => {
        if (!button.user) await button.user.fetch()

        if (button.user.id !== interaction.user.id) return await button.reply({
            content: i18n.__("discord.global.notYourGame", { gameName: "morpion" }),
            ephemeral: true
        })

        if (button.customId.endsWith("no")) {
            await collector.stop()

            return await msg.edit({
                content: i18n.__("discord.global.noPlayWithBot", { username: interaction.user.username }),
                components: []
            })
        } else {
            await collector.stop()
            await button?.deferUpdate()

            return startGame({ i18n, interaction, msg, opponent: client.user, client })
        }
    })
}

async function opponentReady({ i18n, interaction, msg, opponent, client }) {
    const collector = await msg.createMessageComponentCollector({ componentType: "BUTTON" })

    collector.on("collect", async(button) => {
        if (!button.user) await button.user.fetch()

        if (button.user.id !== opponent.id) return await button.reply({
            content: i18n.__("discord.global.notYourGame", { gameName: "morpion" }),
            ephemeral: true
        })

        if (button.customId.endsWith("notready")) {
            await collector.stop()

            return await msg.edit({
                content: i18n.__("discord.global.opponentNotReady", { username: opponent.username, gameName: "morpion" }),
                components: []
            })
        } else {
            await collector.stop()
            await button?.deferUpdate()

            return whoStart({ i18n, interaction, msg, opponent, client })
        }
    })
}

async function whoStart({ i18n, interaction, msg, opponent, client }) {
    const userStart = new MessageButton()
        .setStyle("PRIMARY")
        .setLabel(i18n.__("discord.global.start.you", { username: interaction.user.username }))
        .setCustomId(`game_morpion_${interaction.user.id}_${opponent.id}_user`)

    const opponentStart = new MessageButton()
        .setStyle("PRIMARY")
        .setLabel(i18n.__("discord.global.start.opponent", { username: opponent.username }))
        .setCustomId(`game_morpion_${interaction.user.id}_${opponent.id}_opponent`)

    const random = new MessageButton()
        .setStyle("PRIMARY")
        .setLabel(i18n.__("discord.global.start.random"))
        .setCustomId(`game_morpion_${interaction.user.id}_${opponent.id}_random`)

    const row = new MessageActionRow().addComponents(userStart, opponentStart, random) 

    await msg.edit({
        content: i18n.__("discord.global.whoStart", { username: interaction.user.username }),
        components: [ row ]
    })

    const collector = await msg.createMessageComponentCollector({ componentType: "BUTTON" })

    collector.on("collect", async(button) => {
        if (!button.user) await button.user.fetch()

        if (button.user.id !== interaction.user.id) return await button.reply({
            content: i18n.__("discord.global.notYourGame", { gameName: "morpion" }),
            ephemeral: true
        })

        if (button.customId.endsWith("opponent")) {
            opponent.turn = true
        } else if (button.customId.endsWith("user")) {
            opponent.turn = false
        } else if (button.customId.endsWith("random")) {
            const random = Math.floor(Math.random() * (2 - 1 + 1)) + 1

            opponent.turn = random === 1 ? true : false
        } else return button.reply({ content: "Erreur inconnue" })
    
        await collector.stop()
        await button?.deferUpdate()
        return startGame({ i18n, interaction, msg, opponent, client })
    })
}

async function startGame({ i18n, interaction, msg, opponent, client }) {
    let userData = {
        id: interaction.user.id,
        username: interaction.user.username,
        turn: opponent.turn ? false : true,
        emoji: "❌",
        customEmote: "855726987183915008",
        customEmoteWin: "855726954338582579"
    }
    
    let opponentData = {
        id: opponent.id,
        username: opponent.username,
        turn: opponent.turn,
        emoji: "⭕",
        customEmote: "855726553919914004",
        customEmoteWin: "855726782288363521"
    }

    const text = (user, opponent) => i18n.__("discord.morpion.turn", { username: user.turn ? user.username : opponent.username, emoji: user.turn ? user.emoji : opponent.emoji })

    let board = [
        [ "", "", "" ],
        [ "", "", "" ],
        [ "", "", "" ]
    ]
    
    const genBoard = genButtons({ board, userID: userData.id, opponentID: opponentData.id })
    
    await msg.edit({
        content: text(userData, opponentData),
        components: genBoard.row
    })

    const collector = await msg.createMessageComponentCollector({ componentType: "BUTTON" })

    collector.on("collect", async(button) => {
        if (!button.user) await button.user.fetch()

        if (button.user.id !== userData.id && button.user.id !== opponentData.id) return await button.reply({
            content: i18n.__("discord.global.notYourGame", { gameName: "morpion" }),
            ephemeral: true
        })
    
        const type = button.user.id === userData.id ? userData : opponentData
        const opposite = button.user.id === userData.id ? opponentData : userData

        if (!type.turn) return await button.reply({
            content: i18n.__("discord.global.notYourTurn"), 
            ephemeral: true
        })

        const id = button.customId.split("_")
        const line = id[id.length - 2]
        const row = id[id.length - 1]

        board[line][row] = type.emoji
        type.turn = false
        opposite.turn = true

        await button?.deferUpdate()

        const genBoard = genButtons({ board, userID: userData.id, opponentID: opponentData.id })

        if (!genBoard.win && genBoard.allFill) {
            await collector.stop()

            const gameId = await client.functions.genGameId({ gameName: "morpion", length: 30 })
            const guild = await interaction.guild.fetch()

            await client.functions.gameStats({ 
                data: client.data, 
                gameId,
                guildOrChat: {
                    type: "guild",
                    data: guild
                },
                plateform: "discord", 
                user1: userData,
                user2: opponentData,
                gameName: "morpion", 
                winnerId: "equality"
            })

            return await msg.edit({
                content: i18n.__("discord.morpion.result.equality", { userUsername: userData.username, opponentUsername: opponentData.username }), 
                components: genBoard.row
            })
        }

        if (genBoard.win) {
            await collector.stop()

            const winner = genBoard.winner === userData.emoji ? userData : opponentData

            const gameId = await client.functions.genGameId({ gameName: "morpion", length: 30 })
            const guild = await interaction.guild.fetch()

            await client.functions.gameStats({ 
                data: client.data, 
                gameId,
                guildOrChat: {
                    type: "guild",
                    data: guild
                },
                plateform: "discord", 
                user1: userData,
                user2: opponentData,
                gameName: "morpion", 
                winnerId: winner.id
            })

            return await msg.edit({
                content: i18n.__("discord.morpion.result.win", { winnerUsername: winner.username, winnerEmoji: winner.emoji }),
                components: genBoard.row
            })
        }

        await msg.edit({
            content: text(userData, opponentData), 
            components: genBoard.row
        })

        if (opponentData.id === client.user.id) {
            type.turn = true
            opposite.turn = false

            botPlay({ board, emoji: opponentData.emoji })
            
            const genBoard = genButtons({ board, userID: userData.id, opponentID: opponentData.id })

            if (!genBoard.win && genBoard.allFill) {
                await collector.stop()
                
                const gameId = await client.functions.genGameId({ gameName: "morpion", length: 30 })
                const guild = await interaction.guild.fetch()

                await client.functions.gameStats({ 
                    data: client.data, 
                    gameId,
                    guildOrChat: {
                        type: "guild",
                        data: guild
                    },
                    plateform: "discord", 
                    user1: userData,
                    user2: opponentData,
                    gameName: "morpion", 
                    winnerId: "equality"
                })

                return await msg.edit({
                    content: i18n.__("discord.morpion.result.equality", { userUsername: userData.username, opponentUsername: opponentData.username }),
                    components: genBoard.row
                })
            }

            if (genBoard.win) {
                await collector.stop()

                const winner = genBoard.winner === userData.emoji ? userData : opponentData
                const gameId = await client.functions.genGameId({ gameName: "morpion", length: 30 })
                const guild = await interaction.guild.fetch()
    
                await client.functions.gameStats({ 
                    data: client.data, 
                    gameId,
                    guildOrChat: {
                        type: "guild",
                        data: guild
                    },
                    plateform: "discord", 
                    user1: userData,
                    user2: opponentData,
                    gameName: "morpion", 
                    winnerId: winner.id
                })

                return await msg.edit({
                    content: i18n.__("discord.morpion.result.win", { winnerUsername: winner.username, winnerEmoji: winner.emoji }),
                    components: genBoard.row
                })
            }

            await msg.edit({
                content: text(userData, opponentData),
                components: genBoard.row
            })
        }
    })
}

function genButtons({ board, userID, opponentID }) {
    let row = [
        new MessageActionRow(),
        new MessageActionRow(),
        new MessageActionRow()
    ]

    let win = false
    let winner = ""
    let allFill = true

    const emoji = {
        "❌": "855726987183915008",
        "⭕": "855726553919914004",
        "❌_win": "855726954338582579",
        "⭕_win": "855726782288363521"
    }

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
    
            const button = new MessageButton()
                .setStyle("PRIMARY")
                .setCustomId(`game_morpion_${userID}_${opponentID}_${i}_${j}`)

            const customEmoji = board[i][j] === "" ? "855364971910397973" : emoji[board[i][j]]
            const disabled = board[i][j] === "" ? false : true

            button.setEmoji(customEmoji)
                .setDisabled(disabled)

            row[i].addComponents(button)
        }
    }

    if (win) {
        for (let i = 0; i < row.length; i++) {
            const buttons = row[i].components

            for (let j = 0; j < buttons.length; j++) {
                buttons[j].setDisabled()
            }
        }
    }

    return { row, win, winner, allFill }
}

async function botPlay({ board, emoji, filter }) {
    let placed = false

    if (!filter) filter = ""

    for (let i = 0; i < board.length; i++) {
        if (placed) break

        for (let j = 0; j < board[i].length; j++) {
            //* Horizontal Left -> right (=>)
            if (!placed && board[i][j] !== filter && (board[i][j] === board[i][j + 1] || board[i][j] === board[i][j + 2])) {
                if (board[i][j + 1] !== filter && board[i][j + 2] !== filter) continue

                board[i][j + 1] === filter ? board[i][j + 1] = emoji : board[i][j + 2] = emoji

                placed = true
            //* Horizontal Right -> Left (=>)
            } else if (!placed && board[i][j] !== filter && (board[i][j] === board[i]?.[j - 1] || board[i][j] === board[i]?.[j - 2])) {
                if (board[i]?.[j - 1] !== filter && board[i]?.[j - 2] !== filter) continue

                board[i][j - 1] === filter ? board[i][j - 1] = emoji : board[i][j - 2] = emoji

                placed = true
            //* Vertical Top -> Bottom (v)
            } else if (!placed && board[i][j] !== filter && (board[i][j] === board[i + 1]?.[j] || board[i][j] === board[i + 2]?.[j])) {
                if (board[i + 1]?.[j] !== filter && board[i + 2]?.[j] !== filter) continue

                board[i + 1]?.[j] === filter ? board[i + 1][j] = emoji : board[i + 2][j] = emoji

                placed = true
            /* Vertical Bottom -> Top (^)
            } else if (!placed && board[i][j] !== "" && (board[i][j] === board[i - 1]?.[j] || board[i][j] === board[i - 2]?.[j])) {
                if (board[i - 2]?.[j] !== "" && board[i - 1]?.[j] !== "") continue
            
                board[i - 2]?.[j] === "" ? board[i - 2][j] = emoji : board[i - 1][j] = emoji
            
                placed = true
            Diagonal Top right -> Bottom left 
            */
            //* Top left
            } else if (!placed && board[i][j] !== filter && (board[i][j] === board[i + 1]?.[j + 1] || board[i][j] === board[i + 2]?.[j + 2])) {
                if (board[i + 1]?.[j + 1] !== filter && board[i + 2]?.[j + 2] !== filter) continue

                board[i + 1][j + 1] === filter ? board[i + 1][j + 1] = emoji : board[i + 2][j + 2] = emoji

                placed = true
            //* Top right
            } else if (!placed && board[i][j] !== filter && (board[i][j] === board[i + 1]?.[j - 1] || board[i][j] === board[i + 2]?.[j - 2])) {
                if (board[i + 1]?.[j - 1] !== filter && board[i + 2]?.[j - 2] !== filter) continue

                board[i + 1][j - 1] === filter ? board[i + 1][j - 1] = emoji : board[i + 2][j - 2] = emoji

                placed = true
            //* Bottom left
            } else if (!placed && board[i][j] !== filter && (board[i][j] === board[i - 1]?.[j + 1] || board[i][j] === board[i - 2]?.[j + 2])) {
                if (board[i - 1]?.[j + 1] !== filter && board[i - 2]?.[j + 2] !== filter) continue

                board[i - 1][j + 1] === filter ? board[i - 1][j + 1] = emoji : board[i - 2][j + 2] = emoji

                placed = true
            //* Bottom right
            } else if (!placed && board[i][j] !== filter && (board[i][j] === board[i - 1]?.[j - 1] || board[i][j] === board[i - 2]?.[j - 2])) {
                if (board[i - 1]?.[j - 1] !== filter && board[i - 2]?.[j - 2] !== filter) continue

                board[i - 1][j - 1] === filter ? board[i - 1][j - 1] = emoji : board[i - 2][j - 2] = emoji

                placed = true
            }
        }
    }

    if (!placed) {  
        for (let i = 0; i < board.length; i++) {
            if (placed) break

            for (let j = 0; j < board[i].length; j++) {
                if (!placed && board[i][j] === "") {
                    board[i][j] = emoji

                    placed = true
                }
            }
        }
    }
}