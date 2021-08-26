const Command = require("../structures/Command")
const { MessageButton, MessageActionRow } = require("discord.js")

module.exports = class Rockpaperscissors extends Command {
    constructor(client) {
        super(client, {
            name: "rockpaperscissors",
            //desc: (i18n) => i18n.__("discord.help.desc"),
            directory: __dirname,
            //use: (i18n) => i18n.__("discord.help.use"),
            //example:(i18n) => i18n.__("discord.help.example"),
            aliases: ["rps"]
        })
    }

    async run({ client, interaction, options, i18n, data, userData, util }) {
        const opponent = options.getUser("adversaire")

        if (!opponent || opponent.id === client.user.id) return playWithBot({ i18n, interaction, client })

        if (opponent.bot || opponent.id === interaction.user.id) return await interaction.editReply({
            content: "Merci de saisir un adversaire valide !"
        })

        const ready = new MessageButton()
            .setStyle("SUCCESS")
            .setLabel("Oui")
            .setCustomId(`game_rps_${interaction.user.id}_${opponent.id}_ready`)
    
        const notReady = new MessageButton()
            .setStyle("DANGER")
            .setLabel("Non")
            .setCustomId(`game_rps_${interaction.user.id}_${opponent.id}_notready`)

        const readyButtons = new MessageActionRow().addComponents(ready, notReady)

        const msg = await interaction.channel.send({
            content: `${opponent.username} est-vous prêt(e) ?`,
            components: [readyButtons]
        })

        return opponentReady({ i18n, interaction, msg, opponent, client })
    }
}

async function playWithBot({ i18n, interaction, client }) {
    const yes = new MessageButton()
        .setStyle("SUCCESS")
        .setLabel("Oui")
        .setCustomId(`game_rps_${interaction.user.id}_yes`)

    const no = new MessageButton()
        .setStyle("DANGER")
        .setLabel("Non")
        .setCustomId(`game_rps_${interaction.user.id}_no`)

    const row = new MessageActionRow().addComponents(yes, no)

    const msg = await interaction.channel.send({
        content: `Vous n'avez pas saisi d'adversaire voulez vous jouer contre moi ?`,
        components: [row]
    })

    const collector = await msg.createMessageComponentCollector({ componentType: "BUTTON" })

    collector.on("collect", async(button) => {
        if (!button.user) await button.user.fetch()

        if (button.user.id !== interaction.user.id) return await button.reply({
            content: `Désolé mais ce n'est pas votre partie, pour en lancer une faites /rockpaperscissors @Joueur`,
            ephemeral: true
        })

        if (button.customId.endsWith("no")) {
            await collector.stop()
            await button?.deferUpdate()

            return await msg.edit({
                content: `${interaction.user.username} ne veut pas jouer contre moi :(`,
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
            content: `Désolé mais ce n'est pas votre partie, pour en lancer une faites !rps @Joueur`, 
            ephemeral: true
        })

        if (button.customId.endsWith("notready")) {
            await collector.stop()
            await button?.deferUpdate()

            return await msg.edit({
                content: `${opponent.username} n'est pas prêt`,
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
        .setLabel("Pierre")
        .setCustomId(`game_rps_${interaction.user.id}_${opponent.id}_rock`)

    const paper = new MessageButton()
        .setStyle("PRIMARY")
        .setLabel("Feuille")
        .setCustomId(`game_rps_${interaction.user.id}_${opponent.id}_paper`)

    const scissors = new MessageButton()
        .setStyle("PRIMARY")
        .setLabel("Ciseaux")
        .setCustomId(`game_rps_${interaction.user.id}_${opponent.id}_scissors`)

    const row = new MessageActionRow().addComponents(rock, paper, scissors)

    const text = (user, opponent) => `C'est le moment des choix ! (Attention après vous ne pouvez pas changé)\n\n${user.username} ${user.choice ? "✅" : "❌"}\n${opponent.username} ${opponent.choice ? "✅" : "❌"}`

    await msg.edit({
        content: text(userData, opponentData),
        components: [row]
    })

    const collector = await msg.createMessageComponentCollector({ componentType: "BUTTON" })

    collector.on("collect", async(button) => {
        if (!button.user) await button.user.fetch()

        if (![interaction.user.id, opponent.id].includes(button.user.id)) return await button.reply({
            content: `Désolé mais ce n'est pas votre partie, pour en lancer une faites !rps @Joueur`,
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
            content: text(userData, opponentData),
            components: [row]
        })

        if (opponentData.choice && userData.choice) {
            await collector.stop()

            if (opponentData.choice === userData.choice) {
                return await msg.edit({
                    content: `**${userData.username}** contre **${opponentData.username}**\nRésultat : Egalité ! (Ils ont tout les deux fait __${opponentData.choice}__)`, 
                    components: [] 
                })
            } else if (win[opponentData.choice] === userData.choice) {
                return await msg.edit({
                    content: `**${userData.username}** contre **${opponentData.username}**\nRésultat : **${opponentData.username}** a gagné avec __${opponentData.choice}__ ! (**${userData.username}** a fait __${userData.choice}__)`, 
                    components: [] 
                })
            } else if (win[userData.choice] === opponentData.choice) {
                return await msg.edit({
                    content: `**${userData.username}** contre **${opponentData.username}**\nRésultat : **${userData.username}** a gagné avec __${userData.choice}__ ! (**${opponentData.username}** a fait __${opponentData.choice}__)`, 
                    components: [] 
                })
            } else return await msg.edit({
                content: "Une erreur est survenue", 
                components: [] 
            })
        }
    })
}