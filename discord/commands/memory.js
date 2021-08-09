const Command = require("../structures/Command")
const {
    MessageButton,
    MessageActionRow
} = require("discord.js")

module.exports = class Memory extends Command {
    constructor(client) {
        super(client, {
            name: "memory",
            //desc: (i18n) => i18n.__("discord.help.desc"),
            directory: __dirname,
            //use: (i18n) => i18n.__("discord.help.use"),
            //example:(i18n) => i18n.__("discord.help.example"),
            aliases: ["mem", "memoire", "mémoire"]
        })
    }

    async run({ client, interaction, options, channel, i18n, data, userData, util }) {
        let emotes = ["🐶", "🔰", "⚜️", "🔱", "🐻", "🐨", "🐯", "🐷", "🦧", "🌺", "⭐", "🍏", "🍊", "🍉", "🍇", "🍓", "💵", "⚙️", "📕", "❤️", "💜", "🔵", "🟢", "🟧", "🟫", "🟨"]

        const difficultyType = {
            "easy": {
                row: 4,
                line: 3,
                time: 5,
                clickNumber: 22
            },
            "medium": {
                row: 4,
                line: 4,
                time: 5,
                clickNumber: 22
            },
            "hard": {
                row: 4,
                line: 5,
                time: 3,
                clickNumber: 23
            }
        }

        const difficulty = options.getString("difficulte")

        const row = difficultyType[difficulty].row
        const line = difficultyType[difficulty].line
        const timeSec = difficultyType[difficulty].time

        /* Create all Rows for components */
        const rows = {
            "1": new MessageActionRow(),
            "2": new MessageActionRow(),
            "3": new MessageActionRow(),
            "4": new MessageActionRow(),
            "5": new MessageActionRow()
        }

        const questionRows = {
            "1": new MessageActionRow(),
            "2": new MessageActionRow(),
            "3": new MessageActionRow(),
            "4": new MessageActionRow(),
            "5": new MessageActionRow()
        }

        /* All variables */
        const activeRows = []
        const activeQuestionRows = []
        const emojiMap = []

        /* Get a random emote and push two times in emojiMap */
        for (let i = 0; i < (row * line / 2); i++) {

            let emote = emotes[Math.floor(Math.random() * emotes.length)]

            if (emojiMap.includes(emote)) emote = "⁉️"

            emojiMap.push(emote, emote)

            emotes = emotes.filter(emotesFilter => emotesFilter !== emote)
        }

        /* Check if emote is missing */
        if (emojiMap.includes("⁉️")) return referMsg ? await referMsg.edit("Une erreur est survenue (emoji double)") : await message.channel.send("Une erreur est survenue (emoji double)")

        /* Randomize table */
        const randomEmojiMap = await shuffle(emojiMap.slice())

        let rowID = 1
        let j = 0

        for (let i = 0; i < randomEmojiMap.length; i++) {
            if (j === row) {
                rowID++
                j = 0
            }

            if (rowID >= 6) break

            const emote = randomEmojiMap[i]

            const button = new MessageButton()
                .setStyle("PRIMARY")
                .setEmoji(emote)
                .setCustomId(`game_memory_${interaction.user.id}_${emote}_${i}`)
                .setDisabled(true)

            await rows[rowID].addComponents(button)

            const questionButton = new MessageButton()
                .setStyle("PRIMARY")
                .setEmoji("❓")
                .setCustomId(`game_memory_${interaction.user.id}_${emote}_${i}`)
                .setDisabled(false)

            await questionRows[rowID].addComponents(questionButton)

            if (!activeRows.includes(rows[rowID])) {
                activeRows.push(rows[rowID])
                activeQuestionRows.push(questionRows[rowID])
            }

            j++
        }

        const msg = await interaction.channel.send({
            content: `Vous avez ${timeSec} secondes pour tout retenir...`,
            components: activeRows,
            //ephemeral: true
        })

        //wait(timeSec * 1000)

        let clickNumber = difficultyType[difficulty].clickNumber

        await msg.edit({
            content: `Vous avez ${clickNumber} cliques`,
            components: activeQuestionRows,
            //ephemeral: true
        })

        const filter = (button) => button.user === interaction.user
        const collector = await interaction.channel.createMessageComponentCollector({ filter })

        let haveClick = {
            type: false,
            id: null,
            emoji: null,
            button: null
        }

        let findNumber = 0
        collector.on("collect", async (button) => {
            if (!button.user) await button.user.fetch()
            if (!interaction.user) await interaction.user.fetch()

            //if (button.user.id !== interaction.user.id) return await button.reply({
            //    content: `Désolé mais ce n'est pas votre partie, pour en lancer une faites !memory`,
            //    ephemeral: true
            //})

            clickNumber = clickNumber - 1

            const info = button.customId.split("_")
            const updatedRows = {
                "1": new MessageActionRow(),
                "2": new MessageActionRow(),
                "3": new MessageActionRow(),
                "4": new MessageActionRow(),
                "5": new MessageActionRow()
            }

            let activeUpdatedRows = []

            const components = button.message.components

            let finded = haveClick?.emoji === info[3]

            if (finded) findNumber = findNumber + 2

            let win = findNumber >= row * line
            for (let i = 0; i < components.length; i++) {
                const buttons = components[i].components

                for (let j = 0; j < buttons.length; j++) {
                    let lastTurn = clickNumber === 0

                    const buttonInfo = buttons[j].customId.split("_")

                    const button = new MessageButton()
                        .setStyle(lastTurn ? "DANGER" : "PRIMARY")
                        .setEmoji(lastTurn ? buttonInfo[3] : "❓")
                        .setDisabled(lastTurn)
                        .setCustomId(buttons[j].customId)

                    const findedButton = new MessageButton()
                        .setStyle("SUCCESS")
                        .setEmoji(buttonInfo[3])
                        .setDisabled()
                        .setCustomId(buttonInfo[5] ? buttons[j].customId : buttons[j].customId + "_find")

                    if ((finded && haveClick.emoji === buttonInfo[3]) || (buttonInfo[5] && buttonInfo[5] === "find")) {
                        updatedRows[i + 1].addComponents(findedButton)
                        continue
                    }

                    if (buttonInfo[4] !== info[4]) {
                        updatedRows[i + 1].addComponents(button)
                        continue
                    }

                    button
                        .setEmoji(buttonInfo[3])
                        .setStyle("PRIMARY")
                        .setDisabled()

                    updatedRows[i + 1].addComponents(button)

                    haveClick.type = true
                    haveClick.emoji = buttonInfo[3]
                    haveClick.button = button
                    haveClick.id = buttonInfo[4]
                }

                activeUpdatedRows.push(updatedRows[i + 1])
            }

            await button?.deferUpdate()

            if (win) {
                await collector.stop()

                return await msg.edit({
                    content: `Bien joué tu as gagner ! :tada:`,
                    components: activeUpdatedRows,
                    //ephemeral: true
                })
            } else if (clickNumber === 0) {
                await collector.stop()

                return await msg.edit({
                    content: `Désolé vous avez perdue !`,
                    components: activeUpdatedRows,
                    //ephemeral: true
                })
            } else {
                return await msg.edit({
                    content: `Vous avez ${clickNumber} cliques`,
                    components: activeUpdatedRows,
                    //ephemeral: true
                })
            }
        })
    }
}

/*
async function selectDifficulty({ i18n, difficultyType, emotes, message }) {
    const easyButton = new MessageButton()
        .setStyle("SUCCESS")
        .setLabel("Facile")
        .setID(`game_memorySelectDifficulty_${message.author.id}_easy`)

    const mediumButton = new MessageButton()
        .setStyle("SECONDARY")
        .setLabel("Moyen")
        .setID(`game_memorySelectDifficulty_${message.author.id}_medium`)

    const hardButton = new MessageButton()
        .setStyle("PRIMARY")
        .setLabel("Difficile")
        .setID(`game_memorySelectDifficulty_${message.author.id}_hard`)

    const msg = await message.channel.send("Merci de selectionner votre difficulté", {
        buttons: [easyButton, mediumButton, hardButton]
    })

    const collector = msg.createButtonCollector((button) => button)

    collector.on("collect", async(button) => {
        if (!button.clicker || !button.clicker.user || !button.clicker.user.id) await button.clicker.fetch()

        if (button.clicker.user.id !== message.author.id) return await button.reply.send(`Désolé mais ce n'est pas votre partie, pour en lancer une faites !memory`, true)

        const id = button.id.split("_")

        if (!Object.keys(difficultyType).includes(id[id.length - 1])) return
        
        await collector.stop()
        await button.reply.defer()
        
        //Todo check difficulty

        return startGame({ i18n, difficultyType, difficulty: id[id.length - 1], emotes, message, referMsg: msg })
    })
}
*/

function wait(ms) {

}

function shuffle(array) {
    let currentIndex = array.length,
        randomIndex;

    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]
        ]
    }

    return array;
}