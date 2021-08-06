const Command = require("../structures/Command")
const { MessageButton, MessageActionRow } = require("discord.js")

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

    async run({ client, message, args, i18n, data, userData, util }) {
        const emotes = ["🐶", "🔰", "⚜️", "🔱", "🐻", "🐨", "🐯", "🐷", "🦧", "🌺", "⭐", "🍏", "🍊", "🍉", "🍇", "🍓", "💵", "⚙️", "📕", "❤️", "💜", "🔵", "🟢", "🟧", "🟫", "🟨"]

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

        let config = {
            i18n: i18n,
            message: message,
            emotes: emotes,
            difficultyType: difficultyType
        }

        if (!args[0]) return selectDifficulty(config)

        if (!Object.keys(difficultyType).includes(args[0].toLowerCase())) return selectDifficulty(config)

        config.difficulty = args[0], 

        startGame(config)
    }
}

async function selectDifficulty({ i18n, difficultyType, emotes, message }) {
    const easyButton = new MessageButton()
        .setStyle("green")
        .setLabel("Facile")
        .setID(`game_memorySelectDifficulty_${message.author.id}_easy`)

    const mediumButton = new MessageButton()
        .setStyle("gray")
        .setLabel("Moyen")
        .setID(`game_memorySelectDifficulty_${message.author.id}_medium`)

    const hardButton = new MessageButton()
        .setStyle("red")
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

async function startGame({ i18n, difficultyType, difficulty, emotes, message, referMsg }) {
    if (!difficulty) return referMsg ? await referMsg.edit("Une erreur est survenue (pas de difficulté)") : await message.channel.send("Une erreur est survenue (pas de difficulté)")

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

    const questionRows  = {
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
    const randomEmojiMap = shuffle(emojiMap.slice())

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
            .setStyle("blurple")
            .setEmoji(emote)
            .setID(`game_memory_${message.author.id}_${emote}_${i}`)
            .setDisabled()

        rows[rowID]
            .addComponent(button)

        const questionButton = new MessageButton()
            .setStyle("blurple")
            .setEmoji("❓")
            .setID(`game_memory_${message.author.id}_${emote}_${i}`)
            .setDisabled(false)

        questionRows[rowID]
            .addComponent(questionButton)

        if (!activeRows.includes(rows[rowID])) {
            activeRows.push(rows[rowID])
            activeQuestionRows.push(questionRows[rowID])
        }

        j++
    }

    const content = `Vous avez ${timeSec} secondes pour tout retenir...`
    let msg = referMsg ? await referMsg.edit(content, { components: activeRows }) : await message.channel.send(content, { components: activeRows })
 
    setTimeout(async() => {
        let clickNumber = difficultyType[difficulty].clickNumber

        await msg.edit(`Vous avez ${clickNumber} cliques`, {
            components: activeQuestionRows
        })

        const collector = msg.createButtonCollector((button) => button)

        let haveClick = {
            type: false,
            id: null,
            emoji: null,
            button: null
        }

        let findNumber = 0
        collector.on("collect", async(button) => {
            if (!button.clicker || !button.clicker.user || !button.clicker.user.id) await button.clicker.fetch()

            if (button.clicker.user.id !== message.author.id) return await button.reply.send(`Désolé mais ce n'est pas votre partie, pour en lancer une faites !memory`, true)

            clickNumber = clickNumber - 1

            const info = button.id.split("_")
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

                    const buttonInfo = buttons[j].custom_id.split("_")

                    const button = new MessageButton()
                        .setStyle(lastTurn ? "red" : "blurple")
                        .setEmoji(lastTurn ? buttonInfo[3] : "❓")
                        .setDisabled(lastTurn)
                        .setID(buttons[j].custom_id)
                    
                    const findedButton = new MessageButton()
                        .setStyle("green")
                        .setEmoji(buttonInfo[3])
                        .setDisabled()
                        .setID(buttonInfo[5] ? buttons[j].custom_id : buttons[j].custom_id + "_find")

                    if ((finded && haveClick.emoji === buttonInfo[3]) || (buttonInfo[5] && buttonInfo[5] === "find")) {
                        updatedRows[i + 1].addComponent(findedButton)
                        continue
                    }

                    if (buttonInfo[4] !== info[4]) {
                        updatedRows[i + 1].addComponent(button)
                        continue
                    }

                    button
                        .setEmoji(buttonInfo[3])
                        .setStyle("red")
                        .setDisabled()

                    updatedRows[i + 1].addComponent(button)

                    haveClick.type = true
                    haveClick.emoji = buttonInfo[3]
                    haveClick.button = button
                    haveClick.id = buttonInfo[4]
                }

                activeUpdatedRows.push(updatedRows[i + 1])
            }

            if (win) {
                await collector.stop()

                await msg.edit(`Bien joué tu as gagner ! :tada:`, {
                    components: activeUpdatedRows
                })
            } else if (clickNumber === 0) {
                await collector.stop()

                await msg.edit(`Désolé vous avez perdue !`, {
                    components: activeUpdatedRows
                })
            } else {
                await msg.edit(`Vous avez ${clickNumber} cliques`, {
                    components: activeUpdatedRows
                })
            }

            button.reply.defer()
        })
    }, timeSec * 1000)
}

function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
  
    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]
        ]
    }
  
    return array;
}