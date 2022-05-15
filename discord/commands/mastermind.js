import { Command } from "../structures/Command.js"
import { MessageButton, MessageActionRow, InteractionCollector, ButtonInteraction } from "discord.js"

export default class Mastermind extends Command {
    constructor(client) {
        super(client, {
            name: "mastermind",
            description: "Jouez au mastermind facilement !",
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
            .setCustomId(`game_mastermind_${interaction.user.id}_${opponent.id}_ready`)
    
        const notReady = new MessageButton()
            .setStyle("DANGER")
            .setLabel(i18n.__("discord.global.no"))
            .setCustomId(`game_mastermind_${interaction.user.id}_${opponent.id}_notready`)

        const readyComponents = new MessageActionRow().addComponents(ready, notReady)

        const msg = await interaction.channel.send({
            content: i18n.__("discord.global.opponentReady", { userId: opponent.id, gameName: "mastermind" }),
            components: [ readyComponents ]
        })

        return opponentReady({ i18n, interaction, msg, opponent, client })
    }
}


async function playWithBot({ i18n, interaction, client }) {
    const yes = new MessageButton()
        .setStyle("SUCCESS")
        .setLabel(i18n.__("discord.global.yes"))
        .setCustomId(`game_mastermind_${interaction.user.id}_yes`)

    const no = new MessageButton()
        .setStyle("DANGER")
        .setLabel(i18n.__("discord.global.no"))
        .setCustomId(`game_mastermind_${interaction.user.id}_no`)

    const row = new MessageActionRow().addComponents(yes, no)

    const msg = await interaction.channel.send({
        content: i18n.__("discord.global.playWithBot"),
        components: [row]
    })

    const collector = await msg.createMessageComponentCollector({ componentType: "BUTTON" })

    collector.on("collect", async(button) => {
        if (!button.user) await button.user.fetch()

        if (button.user.id !== interaction.user.id) return await button.reply({
            content: i18n.__("discord.global.notYourGame", { gameName: "mastermind" }),
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

            return startGame({ i18n, interaction, msg, opponent: client.user, client, color: [] })
        }
    })
}

async function opponentReady({ i18n, interaction, msg, opponent, client }) {
    const collector = await msg.createMessageComponentCollector({ componentType: "BUTTON" })

    collector.on("collect", async(button) => {
        if (!button.user) await button.user.fetch()

        if (button.user.id !== opponent.id) return await button.reply({
            content: i18n.__("discord.global.notYourGame", { gameName: "mastermind" }),
            ephemeral: true
        })

        if (button.customId.endsWith("notready")) {
            await collector.stop()

            return await msg.edit({
                content: i18n.__("discord.global.opponentNotReady", { username: opponent.username, gameName: "mastermind" }),
                components: []
            })
        } else {
            await collector.stop()
            await button?.deferUpdate()

            return selectColor({ i18n, interaction, msg, opponent, client })
        }
    })
}

async function selectColor({ i18n, interaction, msg, opponent, client }) {
    const uniqueId = client.functions.genId({ length: 10, withDate: false })

    let userData = {
        id: interaction.user.id,
        username: interaction.user.username,
        color: [],
        guess: [],
        asGuess: [],
        life: 12
    }
    
    let opponentData = {
        id: opponent.id,
        username: opponent.username,
        color: [],
        guess: [],
        asGuess: [],
        life: 12
    }

    const select = new MessageButton()
        .setStyle("PRIMARY")
        .setLabel(i18n.__("discord.mastermind.startToSelect"))
        .setCustomId(`game_mastermind_${interaction.user.id}_${opponent.id}_${uniqueId}_select`)

    const row = new MessageActionRow().addComponents(select) 

    const text = () => `${i18n.__("discord.mastermind.chooseColor")}${opponentData.color.length === 4 ? i18n.__("discord.mastermind.asChoose", { username: userData.username }) : i18n.__("discord.mastermind.asNotChoose", { username: userData.username })}\n${userData.color.length === 4 ? i18n.__("discord.mastermind.asChoose", { username: opponentData.username }) : i18n.__("discord.mastermind.asNotChoose", { username: opponentData.username })}`
    
    const colorsEmote = {
        "red": "🟥", 
        "green": "🟩", 
        "blue": "🟦", 
        "gray": "⬜"
    }

    const personalText = (colors) => i18n.__("discord.mastermind.needToChoose", { colors: colors.map(color => colorsEmote[color]).join(""), colorsLeft: 4 - colors.length })

    const msgColor = await msg.edit({
        content: text(),
        components: [ row ]
    })

    const red = new MessageButton()
        .setStyle("DANGER")
        .setLabel(i18n.__("discord.mastermind.colors.red"))
        .setCustomId(`game_mastermind_${interaction.user.id}_${opponent.id}_${uniqueId}_red`)

    const blue = new MessageButton()
        .setStyle("PRIMARY")
        .setLabel(i18n.__("discord.mastermind.colors.blue"))
        .setCustomId(`game_mastermind_${interaction.user.id}_${opponent.id}_${uniqueId}_blue`)

    const green = new MessageButton()
        .setStyle("SUCCESS")
        .setLabel(i18n.__("discord.mastermind.colors.green"))
        .setCustomId(`game_mastermind_${interaction.user.id}_${opponent.id}_${uniqueId}_green`)

    const gray = new MessageButton()
        .setStyle("SECONDARY")
        .setLabel(i18n.__("discord.mastermind.colors.gray"))
        .setCustomId(`game_mastermind_${interaction.user.id}_${opponent.id}_${uniqueId}_gray`)
        
    const back = new MessageButton()
        .setStyle("DANGER")
        .setLabel(i18n.__("discord.mastermind.delete"))
        .setCustomId(`game_mastermind_${interaction.user.id}_${opponent.id}_${uniqueId}_back`)

    const colors = new MessageActionRow().addComponents(red, blue, green, gray)
    const backRow = new MessageActionRow().addComponents(back)

    const collector = await msgColor.createMessageComponentCollector({ componentType: "BUTTON" })
    const collectorSelect = new InteractionCollector(client, { componentType: "BUTTON" })

    collector.on("collect", async(button) => {
        if (!button.user) await button.user.fetch()

        if (![interaction.user.id, opponent.id].includes(button.user.id)) return await button.reply({
            content: i18n.__("discord.global.notYourGame", { gameName: "mastermind" }),
            ephemeral: true
        })
        
        const data = button.user.id === interaction.user.id ? opponentData : userData

        if (button.customId.endsWith("select")) {
            await button.reply({
                content: personalText(data.color),
                ephemeral: true,
                components: [ colors, backRow ]
            })
        }
    })

    collectorSelect.on("collect", async(btn) => {
        if (!(btn instanceof ButtonInteraction)) return 
        if (!btn.user) await btn.user.fetch()

        const ids = btn.customId.split("_")
        const color = ids[ids.length - 1]
        const colorsName = ["red", "blue", "green", "gray", "back"]
        if (ids[1] !== "mastermind" || !colorsName.includes(color)) return

        const gameId = ids[ids.length - 2]

        if (gameId !== uniqueId) return

        if (![interaction.user.id, opponent.id].includes(btn.user.id)) return await btn.reply({
            content: i18n.__("discord.global.notYourGame", { gameName: "mastermind" }),
            ephemeral: true
        })

        const data = btn.user.id === interaction.user.id ? opponentData : userData

        if (data.color.length >= 4) return await btn.reply({
            content: i18n.__("discord.mastermind.alreadyChoose"),
            ephemeral: true
        })

        if (color === "back") {
            // remove last color
            data.color.pop()

            await btn?.deferUpdate()
            
            return await btn.editReply({
                content: personalText(data.color),
                ephemeral: true,
                components: [ colors, backRow ]
            })
        }

        data.color.push(color)
        await btn?.deferUpdate()

        if (opponentData.color.length === 4 && userData.color.length === 4) {
            await collector.stop()
            collectorSelect.stop()

            await btn.editReply({
                content: i18n.__("discord.mastermind.choicesTaken", { colors: data.color.map(color => colorsEmote[color]).join("") }),
                ephemeral: true,
                components: []
            })

            return startGame({ i18n, interaction, msg, opponent, client, userData, opponentData, uniqueId })
        }

        if (data.color.length === 4) {
            await btn.editReply({
                content: i18n.__("discord.mastermind.choicesTaken", { colors: data.color.map(color => colorsEmote[color]).join("") }),
                ephemeral: true,
                components: []
            })

            return await msgColor.edit({
                content: text(),
                components: [ row ]
            })
        }

        await btn.editReply({
            content: personalText(data.color),
            ephemeral: true,
            components: [ colors, backRow ]
        })
    })
}

async function startGame({ i18n, interaction, msg, opponent, client, userData, opponentData, uniqueId }) {
    const guess = new MessageButton()
        .setStyle("PRIMARY")
        .setLabel(i18n.__("discord.mastermind.propose"))
        .setCustomId(`game_mastermind_${interaction.user.id}_${opponent.id}_${uniqueId}_guess`)

    const row = new MessageActionRow().addComponents(guess)
    
    
    const colorsEmote = {
        "red": "🟥", 
        "green": "🟩", 
        "blue": "🟦", 
        "gray": "⬜"
    }

    const personalText = (data) => i18n.__("discord.mastermind.personalText", { 
        guessList: data.asGuess.map(guess => `${guess.guess.map(color => colorsEmote[color]).join("")} - ${guess.correct}/4`).join("\n"), 
        guess: data.guess.map(color => colorsEmote[color]).join(""),
        guessLeft: 4 - data.guess.length, 
        life: data.life 
    })

    const guessMessage = await msg.edit({
        content: i18n.__("discord.mastermind.partyStart"),
        components: [ row ]
    })

    const red = new MessageButton()
        .setStyle("DANGER")
        .setLabel(i18n.__("discord.mastermind.colors.red"))
        .setCustomId(`game_mastermind_${interaction.user.id}_${opponent.id}_${uniqueId}_guess_red`)

    const blue = new MessageButton()
        .setStyle("PRIMARY")
        .setLabel(i18n.__("discord.mastermind.colors.blue"))
        .setCustomId(`game_mastermind_${interaction.user.id}_${opponent.id}_${uniqueId}_guess_blue`)

    const green = new MessageButton()
        .setStyle("SUCCESS")
        .setLabel(i18n.__("discord.mastermind.colors.green"))
        .setCustomId(`game_mastermind_${interaction.user.id}_${opponent.id}_${uniqueId}_guess_green`)

    const gray = new MessageButton()
        .setStyle("SECONDARY")
        .setLabel(i18n.__("discord.mastermind.colors.gray"))
        .setCustomId(`game_mastermind_${interaction.user.id}_${opponent.id}_${uniqueId}_guess_gray`)
        
    const back = new MessageButton()
        .setStyle("DANGER")
        .setLabel(i18n.__("discord.mastermind.delete"))
        .setCustomId(`game_mastermind_${interaction.user.id}_${opponent.id}_${uniqueId}_guess_back`)

    const colors = new MessageActionRow().addComponents(red, blue, green, gray)
    const backRow = new MessageActionRow().addComponents(back)

    const collector = await guessMessage.createMessageComponentCollector({ componentType: "BUTTON" })
    const collectorGuess = new InteractionCollector(client, { componentType: "BUTTON" })

    collector.on("collect", async(button) => {
        if (!button.user) await button.user.fetch()

        if (![interaction.user.id, opponent.id].includes(button.user.id)) return await button.reply({
            content: i18n.__("discord.global.notYourGame", { gameName: "mastermind" }),
            ephemeral: true
        })

        if (button.customId !== `game_mastermind_${interaction.user.id}_${opponent.id}_${uniqueId}_guess`) return

        const data = button.user.id === interaction.user.id ? userData : opponentData

        await button.reply({
            content: personalText(data),
            ephemeral: true,
            components: [ colors, backRow ]
        })
    })

    collectorGuess.on("collect", async(btn) => {
        if (!(btn instanceof ButtonInteraction)) return
        if (!btn.user) await btn.user.fetch()

        const ids = btn.customId.split("_")
        const color = ids[ids.length - 1]
        const colorsName = ["red", "blue", "green", "gray", "back"]
        if (ids[1] !== "mastermind" || !colorsName.includes(color)) return

        const isGuess = ids[ids.length - 2] === "guess"
        if (!isGuess) return

        const gameId = ids[ids.length - 3]
        if (gameId !== uniqueId) return

        if (![interaction.user.id, opponent.id].includes(btn.user.id)) return await btn.reply({
            content: i18n.__("discord.global.notYourGame", { gameName: "mastermind" }),
            ephemeral: true
        })

        const data = btn.user.id === interaction.user.id ? userData : opponentData
        const dataO = btn.user.id === interaction.user.id ? opponentData : userData

                     
        if (color === "back") {
            // remove last color
            data.guess.pop()

            await btn?.deferUpdate()
                
            return await btn.editReply({
                content: personalText(data),
                ephemeral: true,
                components: [ colors, backRow ]
            })
        }

        data.guess.push(color)
        await btn?.deferUpdate()

        if (data.guess.length >= 4) {
            // Check guess with colors and what is wrong
            const guess = data.guess
            const color = data.color

            let correct = 0
            let wrong = []

            for (let i = 0; i < guess.length; i++) {
                if (guess[i] === color[i]) correct++
                else wrong.push(i)
            }

            if (correct === 4) {
                await collector.stop()
                collectorGuess.stop()

                await btn.editReply({
                    content: i18n.__("discord.mastermind.youWin"),
                    components: [],
                    ephemeral: true
                })

                return msg.edit({
                    content: i18n.__("discord.mastermind.oneWin", { username: btn.user.username, colors: data.color.map(color => colorsEmote[color]).join(""), opponentUsername: dataO.username, opponentColors: dataO.color.map(color => colorsEmote[color]).join("") }),
                    components: []
                })
            }

            data.asGuess.push({
                guess: data.guess,
                correct,
                wrong
            })
            data.guess = []
            data.life = data.life - 1

            if (data.life === 0) {
                await btn.editReply({
                    content: i18n.__("discord.mastermind.youLoose"),
                    components: [],
                    ephemeral: true
                })

                if (dataO.life === 0) {
                    await collector.stop()
                    collectorGuess.stop()
                 
                    return await msg.edit({
                        content: i18n.__("discord.mastermind.allLoose"),
                        components: []
                    })
                }

                return await msg.edit({
                    content: i18n.__("discord.mastermind.oneLoose", { username: btn.user.username, colors: data.color.map(color => colorsEmote[color]).join(""), opponentUsername: dataO.username }),
                    components: [ row ]
                })
            }

            return await btn.editReply({
                content: personalText(data),
                ephemeral: true,
                components: [ colors, backRow ]
            })
        }

        await btn.editReply({
            content: personalText(data),
            ephemeral: true,
            components: [ colors, backRow ]
        })
    })
}