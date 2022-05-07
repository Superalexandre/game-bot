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
        color: []
    }
    
    let opponentData = {
        id: opponent.id,
        username: opponent.username,
        color: []
    }

    const select = new MessageButton()
        .setStyle("PRIMARY")
        .setLabel("Commencer a choisir")
        .setCustomId(`game_mastermind_${interaction.user.id}_${opponent.id}_${uniqueId}_select`)

    const row = new MessageActionRow().addComponents(select) 

    const text = () => {
        return `Vous devez choisir la suite de couleur pour votre adversaire\n\n${opponentData.color.length === 5 ? `✅ ${userData.username} a choisi` : `❌ ${userData.username} n'a pas encore choisi`}\n${userData.color.length === 5 ? `✅ ${opponentData.username} a choisi` : `❌ ${opponentData.username} n'a pas encore choisi`}`
    }

    const personalText = (colors) => {
        return `Vous devez choisir une suite de 5 couleurs, vous avez choisi ${colors.join(", ")} (Reste ${5 - colors.length} couleurs)`
    }

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
        
        
    const colors = new MessageActionRow().addComponents(red, blue, green, gray)
    
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
                components: [ colors ]
            })
        }
    })

    collectorSelect.on("collect", async(btn) => {
        if (!(btn instanceof ButtonInteraction)) return 
        if (!btn.user) await btn.user.fetch()

        const ids = btn.customId.split("_")
        const color = ids[ids.length - 1]
        const colorsName = ["red", "blue", "green", "gray"]
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

        data.color.push(color)
        await btn?.deferUpdate()

        await btn.editReply({
            content: personalText(data.color),
            ephemeral: true,
            components: [ colors ]
        })

        if (opponentData.color.length === 5 && userData.color.length === 5) {
            await collector.stop()
            collectorSelect.stop()

            return startGame({ i18n, interaction, msg, opponent, client, userData, opponentData })
        }

        if (data.color.length === 5) {
            return await msgColor.edit({
                content: text(),
                components: [ row ]
            })
        }
    })
}

async function startGame({ /* i18n, interaction, msg, opponent, client, */ userData, opponentData }) {
    return console.log(`${userData.username} doit trouver ${userData.color} et ${opponentData.username} doit trouver ${opponentData.color}`)
}