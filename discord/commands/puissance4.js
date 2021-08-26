const Command = require("../structures/Command")
const { MessageButton, MessageActionRow } = require("discord.js")
const Canvas = require("canvas")
const gifencoder = require("gifencoder")

module.exports = class Puissance4 extends Command {
    constructor(client) {
        super(client, {
            name: "puissance4",
            directory: __dirname,
        })
    }

    async run({ client, interaction, options, i18n, data, userData, util }) {
        const opponent = options.getUser("adversaire")

        if (!opponent || opponent.id === client.user.id) return playWithBot({ i18n, interaction, client })

        if (opponent.bot || opponent.id === interaction.user.id) return interaction.editReply({
            content: i18n.__("error.invalidOpponent"),
            ephemeral: true
        })

        const ready = new MessageButton()
            .setStyle("SUCCESS")
            .setLabel(i18n.__("global.yes"))
            .setCustomId(`game_puissance4_${interaction.user.id}_${opponent.id}_ready`)
    
        const notReady = new MessageButton()
            .setStyle("DANGER")
            .setLabel(i18n.__("global.no"))
            .setCustomId(`game_puissance4_${interaction.user.id}_${opponent.id}_notready`)

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
        .setCustomId(`game_puissance4_${interaction.user.id}_yes`)

    const no = new MessageButton()
        .setStyle("DANGER")
        .setLabel(i18n.__("global.no"))
        .setCustomId(`game_puissance4_${interaction.user.id}_no`)

    const row = new MessageActionRow()
        .addComponents(yes, no)

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

            return await msg.edit({
                content: i18n.__("global.noPlayWithBot", { username: interaction.user.username }),
                components: []
            })
        } else {
            await collector.stop()

            return startGame({ i18n, interaction, button, opponent: client.user, client, userData, opponentData })
        }
    })
}

async function opponentReady({ i18n, interaction, msg, opponent, client }) {
    const collector = await msg.createMessageComponentCollector()

    collector.on("collect", async(button) => {
        if (!button.user) await button.user.fetch()

        if (button.user.id !== opponent.id) return await button.reply({
            content: i18n.__("global.notYourGame", { gameName: this.help.name }),
            ephemeral: true
        })

        if (button.customId.endsWith("notready")) {
            await collector.stop()

            return await msg.edit({
                content: i18n.__("global.oppponentNotReady", { username: opponent.username }),
                components: []
            })
        } else {
            await collector.stop()

            return whoStart({ i18n, interaction, msg, button, opponent, client })
        }
    })
}

async function whoStart({ i18n, interaction, msg, button, opponent, client, userData, opponentData }) {
    const chooser = opponentData?.choose ? opponentData : interaction.user
    const opposite = opponentData?.choose ? interaction.user : opponent

    const userStart = new MessageButton()
        .setStyle("PRIMARY")
        .setLabel(i18n.__("global.start.you", { username: chooser.username }))
        .setCustomId(`game_puissance4_${interaction.user.id}_${opponent.id}_user`)

    const opponentStart = new MessageButton()
        .setStyle("PRIMARY")
        .setLabel(i18n.__("global.start.opponent", { username: opposite.username }))
        .setCustomId(`game_puissance4_${interaction.user.id}_${opponent.id}_opponent`)

    const random = new MessageButton()
        .setStyle("PRIMARY")
        .setLabel(i18n.__("global.start.random"))
        .setCustomId(`game_puissance4_${interaction.user.id}_${opponent.id}_random`)

    const row = new MessageActionRow().addComponents(userStart, opponentStart, random)

    await button?.deferUpdate()

    await msg.edit({
        content: i18n.__("whoStart", { username: chooser.username }),
        components: [row]
    })

    const collector = await msg.createMessageComponentCollector({ componentType: "BUTTON" })

    collector.on("collect", async(button) => {
        if (!button.user) await button.user.fetch()

        if (button.user.id !== chooser.id) return await button.reply({
            content: i18n.__("global.notYourGame", { gameName: this.help.name }),
            ephemeral: true
        })

        if (button.customId.endsWith("opponent")) {
            opponent.turn = chooser === interaction.user ? true : false
            opponent.random = false
        } else if (button.customId.endsWith("user")) {
            opponent.turn = chooser === interaction.user ? false : true
            opponent.random = false
        } else if (button.customId.endsWith("random")) {
            const random = Math.floor(Math.random() * (2 - 1 + 1)) + 1

            opponent.turn = random === 1 ? true : false
            opponent.random = true
        } else return msg.edit({
            content: "Erreur inconnue", 
            components: []
        })
    
        await collector.stop()
        await button?.deferUpdate()
        //await button.reply.defer()
        return startGame({ i18n, interaction, msg, button, opponent, client, userData, opponentData })
    })
}

async function startGame({ i18n, interaction, msg, button, opponent, client, userData, opponentData }) {
    let board = [
        ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
        ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
        ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
        ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
        ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
    ]

    userData = userData ? userData : {
        id: interaction.user.id,
        username: interaction.user.username,
        turn: opponent.turn ? false : true,
        random: opponent.random,
        emoji: "🔴",
        winEmoji: "<a:Sudref_Red_White:723485311467913239>"
    }
    
    opponentData = opponentData ? opponentData : {
        id: opponent.id,
        username: opponent.username,
        turn: opponent.turn,
        random: opponent.random,
        emoji: "🟡",
        winEmoji: "<a:Sudref_Yellow_White:723485311954452501>"
    }

    const gameData = {
        date: Date.now(),
        players: [userData, opponentData],
        actions: []
    }

    await msg.edit({
        content: `${userData.turn ? userData.username : opponentData.username} ${i18n.__("puissance.goingToStart")} (${userData.random ? i18n.__("puissance4.random") : i18n.__("puissance4.choice")})\n${i18n.__("puissance4.settingUp")}`,
        components: []
    })

    const emoteNumber = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣"]

    for (let i = 0; i < emoteNumber.length; i++) await msg.react(emoteNumber[i])

    const copyArray = (array) => JSON.parse(JSON.stringify(array))

    const revangeText = (user, opponent) => {
        if (!user.win && !opponent.win) return ""

        const userWin = user.win ? user.win : 0
        const opponentWin = opponent.win ? opponent.win : 0

        return `${i18n.__("puissance4.revange")}${userWin + opponentWin} : **${userWin}** ${user.username} - **${opponentWin}** ${opponent.username}\n`
    }

    const text = (user, opponent, error) => `${revangeText(user, opponent)}${i18n.__("puissance4.turnOf")} ${user.turn ? user.username : opponent.username} (${user.turn ? user.emoji : opponent.emoji}) ${error ? "\n" + error : ""}\n\n`

    const formatedBoard = genBoard({ board, userData, opponentData })

    await msg.edit({
        content: text(userData, opponentData) + formatedBoard.string, 
        components: []
    })

    const filter = (reaction, user) => [userData.id, opponentData.id].includes(user.id) && emoteNumber.includes(reaction.emoji.name)
    const collector = await msg.createReactionCollector({ filter })
    
    let actionsNumber = 0
    collector.on("collect", async(reaction, user) => {
        const activeUser = userData.id === user.id ? userData : opponentData
        const opposite = userData.id === user.id ? opponentData : userData

        if (!activeUser.turn) return

        const emoteNumber = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣"]
        const playRow = emoteNumber.indexOf(reaction.emoji.name)

        const added = add({ board, emoji: activeUser.emoji, row: playRow })

        await reaction.users.remove(user.id)

        gameData.actions.push(copyArray(added.board))

        if (added && added.error) {
            if (added.error === "row_full") return await msg.edit({
                content: text(userData, opponentData, i18n.__("puissance4.cantPlayHere")) + added.string,
                components: []
            })

            return await msg.edit({ 
                content: text(userData, opponentData, i18n.__("puissance4.unknownError")) + added.string, 
                components: []
            })
        }

        activeUser.turn = false
        opposite.turn = true

        actionsNumber = actionsNumber + 1

        const formatedBoard = genBoard({ board, userData, opponentData })

        if (formatedBoard.win) {
            await collector.stop()
            await msg.reactions.removeAll()

            const winner = formatedBoard.winnerUser.id === userData.id ? userData : opponentData
            const looser = formatedBoard.winnerUser.id === userData.id ? opponentData : userData

            const numberWin = winner.win ? winner.win : 0
            const numberLoose = looser.loose ? looser.loose : 0

            winner.win = numberWin + 1
            looser.loose = numberLoose + 1

            await msg.edit({
                content: `**${userData?.win ? userData.win : 0}** ${userData.username} - **${opponentData?.win ? opponentData.win : 0}** ${opponentData.username}\n${i18n.__("puissance4.win.wellPlay")} ${winner.username} (${winner.emoji}) ${i18n.__("puissance4.win.wonOver")} ${looser.username} (${looser.emoji})\n` + formatedBoard.string,
                components: []
            })

            return restart({ i18n, interaction, msg, button, opponent, client, userData, opponentData, gameData })
        }

        if (formatedBoard.allFill) {
            await collector.stop()
            await msg.reactions.removeAll()

            await msg.edit({
                content: `**${userData?.win ? userData.win : 0}** ${opponentData.username} - **${opponentData?.win ? opponentData.win : 0}** ${opponentData.username}\n${userData.username} (${userData.emoji}) ${i18n.__("puissance.equality.and")} ${opponentData.username} (${opponentData.emoji}) ${i18n.__("puissance.equality.equality")}\n` + formatedBoard.string,
                components: []
            })

            return restart({ i18n, interaction, msg, button, opponent, client, userData, opponentData, gameData })
        }

        await msg.edit({ 
            content: text(userData, opponentData) + formatedBoard.string,
            components: []
        })

        //Bot
        //Todo
        if (opponentData.id === client.user.id) {
            return msg.edit("ERREUR VOUS NE POUVEZ PAS JOUER AVEC LE BOT POUR LE MOMENT")
            type.turn = true
            opposite.turn = false

            const rowToPlay = await botPlay({ board, emoji: opposite.emoji })
            const added = add({ board, emoji: opposite.emoji, row: rowToPlay })

            if (added && added.error) {
                if (added.error === "row_full") return await interaction.editReply({
                    content: text(userData, opponentData, "Vous ne pouvez pas jouer ici !") + added.string,
                    components: []
                })
                
                return await interaction.editReply({
                    content: text(userData, opponentData, "Une erreur inconnu est survenue") + added.string,
                    components: []
                })
            }

            const formatedBoard = genBoard({ board, userData, opponentData })

            if (formatedBoard.win) {
                await collector.stop()

                console.log("WIN")
            }

            await interaction.editReply({
                content: text(userData, opponentData) + formatedBoard.string,
                components: []
            })
        }
    })
}

function genBoard({ board, userData, opponentData }) {
    let win = false
    let winner = ""
    let allFill = true
    let string = ""
    let winnerUser = ""

    const emoteNumber = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣"]

    for (let i = 0; i < board.length; i++) {   
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j] === "⚪") allFill = false

            /* Horizontal */
            if (!win && board[i][j] !== "⚪" && board[i][j] === board[i][j + 1] && board[i][j + 1] === board[i][j + 2] && board[i][j + 2] === board[i][j + 3]) {
                winner = board[i][j]

                winnerUser = opponentData.emoji === winner ? opponentData : userData

                board[i][j] = winnerUser.winEmoji
                board[i][j + 1] = winnerUser.winEmoji
                board[i][j + 2] = winnerUser.winEmoji
                board[i][j + 3] = winnerUser.winEmoji

                win = true
            /* Vertical */
            } else if (!win && board[i][j] !== "⚪" && board[i]?.[j] === board[i + 1]?.[j] && board[i + 1]?.[j] === board[i + 2]?.[j] && board[i + 2]?.[j] === board[i + 3]?.[j]) {
                winner = board[i][j]

                winnerUser = opponentData.emoji === winner ? opponentData : userData

                board[i][j] = winnerUser.winEmoji
                board[i + 1][j] = winnerUser.winEmoji
                board[i + 2][j] = winnerUser.winEmoji
                board[i + 3][j] = winnerUser.winEmoji

                win = true
            /* Diagonal Left top => Bottom right */
            } else if (!win && board[i][j] !== "⚪" && board[i]?.[j] === board[i + 1]?.[j + 1] && board[i + 1]?.[j + 1] === board[i + 2]?.[j + 2] && board[i + 2]?.[j + 2] === board[i + 3]?.[j + 3]) {
                winner = board[i][j]

                winnerUser = opponentData.emoji === winner ? opponentData : userData

                board[i][j] = winnerUser.winEmoji
                board[i + 1][j + 1] = winnerUser.winEmoji
                board[i + 2][j + 2] = winnerUser.winEmoji
                board[i + 3][j + 3] = winnerUser.winEmoji

                win = true
            /* Diagonal Right top => Bottom left */
            } else if (!win && board[i][j] !== "⚪" && board[i]?.[j] === board[i + 1]?.[j - 1] && board[i + 1]?.[j - 1] === board[i + 2]?.[j - 2] && board[i + 2]?.[j - 2] === board[i + 3]?.[j - 3]) {
                winner = board[i][j]

                winnerUser = opponentData.emoji === winner ? opponentData : userData

                board[i][j] = winnerUser.winEmoji
                board[i + 1][j - 1] = winnerUser.winEmoji
                board[i + 2][j - 2] = winnerUser.winEmoji
                board[i + 3][j - 3] = winnerUser.winEmoji

                win = true
            }

            string += board[i][j]
        }

        if (i === board.length - 1) string += "\n" + emoteNumber.join("")

        string += "\n"
    }

    return { string, win, winner, allFill, winnerUser }
}

function add({ board, emoji, row }) {
    let placed = false
    let string = ""
    const emoteNumber = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣"]

    board.reverse()

    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (!placed && j === row && board[i][j] === "⚪") {
                board[i][j] = emoji

                placed = true
            }
        }
    }
    
    board.reverse()
    
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            string += board[i][j]
        }

        if (i === board.length - 1) string += "\n" + emoteNumber.join("")
        string += "\n"
    }


    if (!placed) return { error: "row_full", board, string }

    return { board, string }
}

async function restart({ i18n, interaction, msg, button, opponent, client, userData, opponentData, gameData }) {
    await msg.react("🔄")
    await msg.react("📥")

    const filter = (reaction, user) => [userData.id, opponentData.id].includes(user.id) && ["🔄", "📥"].includes(reaction.emoji.name)
    const collector = await msg.createReactionCollector({ filter, dispose: true })

    let numberReady = 0

    collector.on("collect", async(reaction, user) => {
        if (reaction.emoji.name === "📥") {
            await collector.stop()
            await msg.reactions.removeAll()

            return makeGif({ client, i18n, msg, gameData })
        }

        const activeUser = user.id === userData.id ? userData : opponentData

        activeUser.readyRestart = true 
        numberReady = numberReady + 1

        if (numberReady === 2) {
            await collector.stop()
            await reply.reactions.removeAll()

            opponentData.choose = opponentData?.choose ? false : true

            return whoStart({ i18n, interaction, msg, button: null, opponent, client, userData, opponentData })
        }
        
        await msg.edit({
            content: i18n.__("puissance.wantRevange", { username: user.username, number: numberReady }),
            components: []
        })
    })

    collector.on("remove", async(reaction, user) => {
        numberReady = numberReady - 1

        if (numberReady === 0) {
            await collector.stop()
            await reply.reactions.removeAll()

            return await msg.edit({
                content: i18n.__("puissance.noMoreRevange", { username: user.username }),
                components: []
            })
        }
    })
}

async function makeGif({ client, i18n, msg, gameData }) {
    const mainText = i18n.__("puissance4.replay.mainText")

    await msg.edit({
        content: mainText + `\n${i18n.__("puissance4.replay.step")} : 1/2`
    })

    const width = 1000
    const height = 1000

    //Gif
    const gif = new gifencoder(width, height)
    
    gif.start()
    gif.setRepeat(0)
    gif.setDelay(1500)
    gif.setQuality(1)
    gif.setTransparent()

    //Canvas
    const canvas = Canvas.createCanvas(width, height)
    const ctx = canvas.getContext("2d")

    const fontSize = width / 25

    //Text
    ctx.fillStyle = "#FFFFFF"
    ctx.font = `${fontSize}px 'Arial'`
    const text = `${i18n.__("puissance4.replay.replayOf")} ${gameData.players[0].username} ${i18n.__("puissance4.replay.versus")} ${gameData.players[1].username}`
    const textWidth = ctx.measureText(text).width

    ctx.fillText(text, (canvas.width/2) - (textWidth / 2), 50)

    //Credit
    ctx.font = `${fontSize - 2}px 'Arial'`
    ctx.fillText(`${i18n.__("puissance4.replay.copyright")} ${client.user.username}`, width / 20, height - 20)

    await msg.edit({
        content: mainText + `\n${i18n.__("puissance4.replay.step")} : 2/2\n0/${gameData.actions.length + 1}`
    })

    for (let i = 0; i < gameData.actions.length; i++) {
        for (let j = 0; j < gameData.actions[i].length; j++) {
            for (let k = 0; k < gameData.actions[i][j].length; k++) {
                const widthImage = width / 10
                const heightImage = height / 10

                const jLength = gameData.actions[i][j].length
                const iLength = gameData.actions[i].length

                const x = (width - (jLength * widthImage)) / 2
                const y  = (height - (iLength * heightImage)) / 2
            
                ctx.beginPath()
                ctx.arc(x + k * widthImage, y + j * heightImage, (height / 10) / 2, 0, Math.PI * 2, true)
                ctx.fillStyle = gameData.actions[i][j][k] === "🔴" ? "#DD2E44" : gameData.actions[i][j][k] === "🟡" ? "#FDCB58" : "#FFFFFF"
                ctx.fill()

            }
        }

        await msg.edit({
            content: mainText + `\n${i18n.__("puissance4.replay.step")} : 2/2\n${i + 1}/${gameData.actions.length + 1}`
        })

        gif.addFrame(ctx)
    }

    gif.finish()

    await msg.edit({
        content: i18n.__("puissance4.replay.gameReplay"),
        files: [{
            attachment: gif.out.getData(),
            name: "replay.gif"
        }]
    })
}