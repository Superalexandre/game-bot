import { Command } from "../structures/Command.js"
import { MessageButton, MessageActionRow, InteractionCollector, ButtonInteraction } from "discord.js"

export default class Mastermind extends Command {
    constructor(client) {
        super(client, {
            name: "mastermind",
            description: "Jouez au mastermind facilement !",
            debug: true,
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
        isGuessing: [],
        life: 12
    }
    
    let opponentData = {
        id: opponent.id,
        username: opponent.username,
        color: [],
        isGuessing: [],
        life: 12
    }

    const select = new MessageButton()
        .setStyle("PRIMARY")
        .setLabel("Commencer a choisir")
        .setCustomId(`game_mastermind_${interaction.user.id}_${opponent.id}_${uniqueId}_select`)

    const row = new MessageActionRow().addComponents(select) 

    const text = () => `Vous devez choisir la suite de couleur pour votre adversaire\n\n${opponentData.color.length === 5 ? `✅ ${userData.username} a choisi` : `❌ ${userData.username} n'a pas encore choisi`}\n${userData.color.length === 5 ? `✅ ${opponentData.username} a choisi` : `❌ ${opponentData.username} n'a pas encore choisi`}`
    

    const colorsEmote = {
        "red": "🟥", 
        "green": "🟩", 
        "blue": "🟦", 
        "gray": "⬜"
    }
    const personalText = (colors) => `Vous devez choisir une suite de 5 couleurs, vous avez choisi ${colors.map(color => colorsEmote[color]).join("")} (Reste ${5 - colors.length} couleurs)`

    const msgColor = await msg.channel.send({
        content: text(),
        components: [ row ]
    })

    const red = new MessageButton()
        .setStyle("DANGER")
        .setLabel("Rouge")
        .setCustomId(`game_mastermind_${interaction.user.id}_${opponent.id}_${uniqueId}_red`)

    const blue = new MessageButton()
        .setStyle("PRIMARY")
        .setLabel("Bleu")
        .setCustomId(`game_mastermind_${interaction.user.id}_${opponent.id}_${uniqueId}_blue`)

    const green = new MessageButton()
        .setStyle("SUCCESS")
        .setLabel("Vert")
        .setCustomId(`game_mastermind_${interaction.user.id}_${opponent.id}_${uniqueId}_green`)

    const gray = new MessageButton()
        .setStyle("SECONDARY")
        .setLabel("Gris")
        .setCustomId(`game_mastermind_${interaction.user.id}_${opponent.id}_${uniqueId}_gray`)
        
    const back = new MessageButton()
        .setStyle("DANGER")
        .setLabel("Supprimer")
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

        if (data.color.length >= 5) return await btn.reply({
            content: "Vous avez déjà choisi 5 couleurs",
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

        await btn.editReply({
            content: personalText(data.color),
            ephemeral: true,
            components: [ colors, backRow ]
        })

        if (opponentData.color.length === 5 && userData.color.length === 5) {
            await collector.stop()
            collectorSelect.stop()

            return startGame({ i18n, interaction, msg, opponent, client, userData, opponentData, uniqueId })
        }

        if (data.color.length === 5) {
            return await msgColor.edit({
                content: text(),
                components: [ row ]
            })
        }
    })
}

async function startGame({ i18n, interaction, msg, opponent, client, userData, opponentData, uniqueId }) {
    console.log("start game")
    const guess = new MessageButton()
        .setStyle("PRIMARY")
        .setLabel("Proposer la suite de couleurs")
        .setCustomId(`game_mastermind_${interaction.user.id}_${opponent.id}_${uniqueId}_guess`)

    const row = new MessageActionRow().addComponents(guess)
    
    const guessMessage = await msg.edit({
        content: "La partie commence !",
        components: [ row ]
    })

    const red = new MessageButton()
        .setStyle("DANGER")
        .setLabel("Rouge")
        .setCustomId(`game_mastermind_${interaction.user.id}_${opponent.id}_${uniqueId}_guess_red`)

    const blue = new MessageButton()
        .setStyle("PRIMARY")
        .setLabel("Bleu")
        .setCustomId(`game_mastermind_${interaction.user.id}_${opponent.id}_${uniqueId}_guess_blue`)

    const green = new MessageButton()
        .setStyle("SUCCESS")
        .setLabel("Vert")
        .setCustomId(`game_mastermind_${interaction.user.id}_${opponent.id}_${uniqueId}_guess_green`)

    const gray = new MessageButton()
        .setStyle("SECONDARY")
        .setLabel("Gris")
        .setCustomId(`game_mastermind_${interaction.user.id}_${opponent.id}_${uniqueId}_guess_gray`)
        
    const back = new MessageButton()
        .setStyle("DANGER")
        .setLabel("Supprimer")
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

        await button.reply({
            content: "Proposez une suite de couleurs",
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

        const isGuess = ids[ids.length - 1] === "guess"
        if (!isGuess) return

        const gameId = ids[ids.length - 3]
        if (gameId !== uniqueId) return

        if (![interaction.user.id, opponent.id].includes(btn.user.id)) return await btn.reply({
            content: i18n.__("discord.global.notYourGame", { gameName: "mastermind" }),
            ephemeral: true
        })

        const data = btn.user.id === interaction.user.id ? userData : opponentData
        const dataO = btn.user.id === interaction.user.id ? opponentData : userData

        const colorsEmote = {
            "red": "🟥", 
            "green": "🟩", 
            "blue": "🟦", 
            "gray": "⬜"
        }

        if (data.guess.length >= 5) {
            // Check guess with colors and what is wrong
            const guess = data.guess
            const color = data.color

            let correct = 0
            let wrong = []

            for (let i = 0; i < guess.length; i++) {
                if (guess[i] === color[i]) correct++
                else if (color.includes(guess[i])) wrong.push(i)
            }

            if (correct === 5) {
                await collector.stop()
                collectorGuess.stop()

                await btn.reply({
                    content: "Vous avez gagné !",
                    ephemeral: true
                })

                return msg.edit({
                    content: `${btn.user.username} a gagné avec la suite ${data.color.map(color => colorsEmote[color])}\n${dataO.username} avait ${dataO.color.map(color => colorsEmote[color])}`,
                    components: []
                })
            }

            data.guess = []
            data.life = data.life - 1

            if (data.life === 0) {
                if (dataO.life === 0) {
                    await collector.stop()
                    collectorGuess.stop()
                 
                    await msg.edit({
                        content: "Tout les deux perdus",
                        components: []
                    })
                }

                return await btn.reply({
                    content: "Vous avez perdu !",
                    ephemeral: true
                })
            }

            await btn.reply({
                content: `Vous avez ${correct} couleurs correctes et ${wrong.length} couleurs incorrectes`,
                ephemeral: true,
                components: [ colors, backRow ]
            })
        } else {             
            const personalText = (colors) => `Vous devez choisir une suite de 5 couleurs, vous avez choisi ${colors.map(color => colorsEmote[color]).join("")} (Reste ${5 - colors.length} couleurs)`
   
            if (color === "back") {
                // remove last color
                data.guess.pop()

                await btn?.deferUpdate()
                
                return await btn.editReply({
                    content: personalText(data.color),
                    ephemeral: true,
                    components: [ colors, backRow ]
                })
            }

            data.guess.push(color)
            await btn?.deferUpdate()

            await btn.editReply({
                content: personalText(data.color),
                ephemeral: true,
                components: [ colors, backRow ]
            })
        }
    })
}