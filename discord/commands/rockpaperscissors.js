const Command = require("../structures/Command")
const { MessageButton, MessageActionRow } = require("discord.js")

module.exports = class Rockpaperscissors extends Command {
    constructor(client) {
        super(client, {
            name: "rockpaperscissors",
            directory: __dirname
        })
    }

    async run({ client, interaction, options, i18n, data, userData, util }) {
        const opponent = options.getUser("adversaire")

        if (!opponent || opponent.id === client.user.id) return playWithBot({ i18n, interaction, client })

        if (opponent.bot || opponent.id === interaction.user.id) return await interaction.editReply({
            content: i18n.__("error.invalidOpponent")
        })

        const ready = new MessageButton()
            .setStyle("SUCCESS")
            .setLabel(i18n.__("global.yes"))
            .setCustomId(`game_rps_${interaction.user.id}_${opponent.id}_ready`)
    
        const notReady = new MessageButton()
            .setStyle("DANGER")
            .setLabel(i18n.__("global.no"))
            .setCustomId(`game_rps_${interaction.user.id}_${opponent.id}_notready`)

        const readyButtons = new MessageActionRow().addComponents(ready, notReady)

        const msg = await interaction.channel.send({
            content: i18n.__("global.opponentReady", { username: opponent }),
            components: [readyButtons]
        })

        return opponentReady({ i18n, interaction, msg, opponent, client })
    }
}

async function playWithBot({ i18n, interaction, client }) {
    const yes = new MessageButton()
        .setStyle("SUCCESS")
        .setLabel(i18n.__("global.yes"))
        .setCustomId(`game_rps_${interaction.user.id}_yes`)

    const no = new MessageButton()
        .setStyle("DANGER")
        .setLabel(i18n.__("global.no"))
        .setCustomId(`game_rps_${interaction.user.id}_no`)

    const row = new MessageActionRow().addComponents(yes, no)

    const msg = await interaction.channel.send({
        content: i18n.__("global.playWithBot"),
        components: [row]
    })

    const collector = await msg.createMessageComponentCollector({ componentType: "BUTTON" })

    collector.on("collect", async(button) => {
        if (!button.user) await button.user.fetch()

        if (button.user.id !== interaction.user.id) return await button.reply({
            content: i18n.__("global.notYourGame", { gameName: this.help.name }),
            ephemeral: true
        })

        if (button.customId.endsWith("no")) {
            await collector.stop()
            await button?.deferUpdate()

            return await msg.edit({
                content: i18n.__("global.noPlayWithBot", { username: interaction.user.username }),
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
            content: i18n.__("global.notYourGame", { gameName: this.help.name }), 
            ephemeral: true
        })

        if (button.customId.endsWith("notready")) {
            await collector.stop()
            await button?.deferUpdate()

            return await msg.edit({
                content: i18n.__("global.oppponentNotReady", { username: opponent.username }),
                components: []
            })
        } else {
            await collector.stop()
            await button?.deferUpdate()

            return startGame({ i18n, interaction, msg, opponent, client })
        }
    })
}

async function startGame({ i18n, interaction, msg, opponent, client }) {
    let userData = {
        id: interaction.user.id,
        username: interaction.user.username,
        choice: ""
    }
    
    let opponentData = {
        id: opponent.id,
        username: opponent.username,
        choice: ""
    }
    
    const win = {
        paper: "rock",
        scissors: "paper",
        rock: "scissors"
    }

    const choices = ["rock", "paper", "scissors"]

    if (opponent.id === client.user.id) opponentData.choice = choices[Math.floor(Math.random() * choices.length)]

    const rock = new MessageButton()
        .setStyle("PRIMARY")
        .setLabel(i18n.__("rockpaperscissors.sign.rock"))
        .setCustomId(`game_rps_${interaction.user.id}_${opponent.id}_rock`)

    const paper = new MessageButton()
        .setStyle("PRIMARY")
        .setLabel(i18n.__("rockpaperscissors.sign.paper"))
        .setCustomId(`game_rps_${interaction.user.id}_${opponent.id}_paper`)

    const scissors = new MessageButton()
        .setStyle("PRIMARY")
        .setLabel(i18n.__("rockpaperscissors.sign.scissors"))
        .setCustomId(`game_rps_${interaction.user.id}_${opponent.id}_scissors`)

    const row = new MessageActionRow().addComponents(rock, paper, scissors)

    await msg.edit({
        content: i18n.__("rockpaperscissors.mainText", { userUsername: userData.username, opponentUsername: opponentData.username, userChoice: userData.choice ? "✅" : "❌", opponentChoice: opponentData.choice ? "✅" : "❌" }),
        components: [row]
    })

    const collector = await msg.createMessageComponentCollector({ componentType: "BUTTON" })

    collector.on("collect", async(button) => {
        if (!button.user) await button.user.fetch()

        if (![interaction.user.id, opponent.id].includes(button.user.id)) return await button.reply({
            content: i18n.__("global.notYourGame", { gameName: this.help.name }),
            ephemeral: true
        })

        const uId = button.user.id
        const id = button.customId.split("_")

        if (uId === opponentData.id && !opponentData.choice) {
            opponentData.choice = id[id.length - 1]
        } else if (uId === userData.id && !userData.choice) {
            userData.choice = id[id.length - 1]
        }

        await button?.deferUpdate()

        await msg.edit({
            content: i18n.__("rockpaperscissors.mainText", { userUsername: userData.username, opponentUsername: opponentData.username, userChoice: userData.choice ? "✅" : "❌", opponentChoice: opponentData.choice ? "✅" : "❌" }),
            components: [row]
        })

        if (opponentData.choice && userData.choice) {
            await collector.stop()

            if (opponentData.choice === userData.choice) {
                const userChoice = i18n.__(`rockpaperscissors.sign.${userData.choice}`)
                const opponentChoice = i18n.__(`rockpaperscissors.sign.${opponentData.choice}`)

                return await msg.edit({
                    content: i18n.__("rockpaperscissors.result.equality", { userUsername: userData.username, opponentUsername: opponentData.username, userChoice, opponentChoice }), 
                    components: [] 
                })
            } else {
                const winner = win[opponentData.choice] === userData.choice ? opponentData : userData
                const looser = win[opponentData.choice] === userData.choice ? userData : opponentData

                const winnerChoice = i18n.__(`rockpaperscissors.sign.${winner.choice}`)
                const looserChoice = i18n.__(`rockpaperscissors.sign.${looser.choice}`)

                return await msg.edit({
                    content: i18n.__("rockpaperscissors.result.win", { winnerUsername: winner.username, looserUsername: looser.username, winnerChoice, looserChoice }), 
                    components: [] 
                })
            }
        }
    })
}