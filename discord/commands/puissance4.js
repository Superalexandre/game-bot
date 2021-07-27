const Command = require("../structures/Command")
const { MessageButton, MessageActionRow } = require("discord-buttons")

module.exports = class Puissance4 extends Command {
    constructor(client) {
        super(client, {
            name: "puissance4",
            //desc: (i18n) => i18n.__("discord.help.desc"),
            directory: __dirname,
            //use: (i18n) => i18n.__("discord.help.use"),
            //example:(i18n) => i18n.__("discord.help.example"),
            aliases: ["p4"]
        })
    }

    async run({ client, message, args, i18n, data, userData, util }) {
        const opponent = message.mentions.users.first()

        if (!opponent) return playWithBot({ i18n, message, client })

        if (opponent.bot || opponent.id === message.author.id) return message.channel.send("Merci de saisir un adversaire valide !")

        const ready = new MessageButton()
            .setStyle("green")
            .setLabel("Oui")
            .setID(`game_puissance4_${message.author.id}_${opponent.id}_ready`)
    
        const notReady = new MessageButton()
            .setStyle("red")
            .setLabel("Non")
            .setID(`game_puissance4_${message.author.id}_${opponent.id}_notready`)

        const msg = await message.channel.send(`${opponent.username} est-vous prêt(e) ?`, {
            buttons: [ready, notReady]
        })

        return opponentReady({ i18n, message, msg, opponent, client })
    }

    makeGif = makeGif
}

async function playWithBot({ i18n, message, client }) {
    const yes = new MessageButton()
        .setStyle("green")
        .setLabel("Oui")
        .setID(`game_puissance4_${message.author.id}_yes`)

    const no = new MessageButton()
        .setStyle("red")
        .setLabel("Non")
        .setID(`game_puissance4_${message.author.id}_no`)

    const row = new MessageActionRow()
        .addComponent(yes)
        .addComponent(no)

    const msg = await message.channel.send(`Vous n'avez pas saisi d'adversaire voulez vous jouer contre moi ?`, {
        components: [row]
    })

    const collector = msg.createButtonCollector((button) => button)

    collector.on("collect", async(button) => {
        if (!button.clicker || !button.clicker.user || !button.clicker.user.id) await button.clicker.fetch()

        if (button.clicker.user.id !== message.author.id) return await button.reply.send(`Désolé mais ce n'est pas votre partie, pour en lancer une faites !puissance4 @Joueur`, true)

        if (button.id.endsWith("no")) {
            await collector.stop()
            await button.reply.defer()

            return msg.edit(`${message.author.username} ne veut pas jouer contre moi :(`, null)
        } else {
            await collector.stop()
            await button.reply.defer()

            return startGame({ i18n, message, msg, opponent: client.user, client })
        }
    })
}

async function opponentReady({ i18n, message, msg, opponent, client }) {
    const collector = msg.createButtonCollector((button) => button)

    collector.on("collect", async(button) => {
        if (!button.clicker || !button.clicker.user || !button.clicker.user.id) await button.clicker.fetch()

        if (button.clicker.user.id !== opponent.id) return await button.reply.send(`Désolé mais ce n'est pas votre partie, pour en lancer une faites !puissance4 @Joueur`, true)

        if (button.id.endsWith("notready")) {
            await collector.stop()
            await button.reply.defer()

            return msg.edit(`${opponent.username} n'est pas prêt`, null)
        } else {
            await collector.stop()
            await button.reply.defer()

            return whoStart({ i18n, message, msg, opponent, client })
        }
    })
}

async function whoStart({ i18n, message, msg, opponent, client, userData, opponentData }) {
    const chooser = opponentData?.choose ? opponentData : message.author
    const opposite = opponentData?.choose ? message.author : opponent

    const userStart = new MessageButton()
        .setStyle("blurple")
        .setLabel("Vous (" + chooser.username + ")")
        .setID(`game_puissance4_${message.author.id}_${opponent.id}_user`)

    const opponentStart = new MessageButton()
        .setStyle("blurple")
        .setLabel(opposite.username)
        .setID(`game_puissance4_${message.author.id}_${opponent.id}_opponent`)

    const random = new MessageButton()
        .setStyle("blurple")
        .setLabel("Aléatoire")
        .setID(`game_puissance4_${message.author.id}_${opponent.id}_random`)

    const row = new MessageActionRow()
        .addComponent(userStart)
        .addComponent(opponentStart)
        .addComponent(random)

    await msg.edit(`${chooser.username}, Qui doit commencer ?`, {
        components: [row]
    })

    const collector = msg.createButtonCollector((button) => button)

    collector.on("collect", async(button) => {
        if (!button.clicker || !button.clicker.user || !button.clicker.user.id) await button.clicker.fetch()

        if (button.clicker.user.id !== chooser.id) return await button.reply.send(`Désolé mais ce n'est pas votre partie, pour en lancer une faites !puissance4 @Joueur`, true)

        if (button.id.endsWith("opponent")) {
            opponent.turn = chooser === message.author ? true : false
        } else if (button.id.endsWith("user")) {
            opponent.turn = chooser === message.author ? false : true
        } else if (button.id.endsWith("random")) {
            const random = Math.floor(Math.random() * (2 - 1 + 1)) + 1

            opponent.turn = random === 1 ? true : false
        } else return msg.edit("Erreur inconnue")
    
        await collector.stop()
        await button.reply.defer()
        return startGame({ i18n, message, msg, opponent, client, userData, opponentData })
    })
}

async function startGame({ i18n, message, msg, opponent, client, userData, opponentData }) {
    let board = [
        ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
        ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
        ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
        ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
        ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
        ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
    ]

    userData = userData ? userData : {
        id: message.author.id,
        username: message.author.username,
        turn: opponent.turn ? false : true,
        emoji: "🔴",
        winEmoji: "<a:Sudref_Red_White:723485311467913239>"
    }
    
    opponentData = opponentData ? opponentData : {
        id: opponent.id,
        username: opponent.username,
        turn: opponent.turn,
        emoji: "🟡",
        winEmoji: "<a:Sudref_Yellow_White:723485311954452501>"
    }

    const gameData = {
        date: Date.now(),
        players: [userData, opponentData],
        actions: {}
    }

    await msg.edit("Veuillez patienter quelque seconde, le temps de la mise en place des réactions", null)

    const emoteNumber = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣"]

    for (let i = 0; i < emoteNumber.length; i++) await msg.react(emoteNumber[i])

    const revangeText = (user, opponent) => {
        if (!user.win && !opponent.win) return ""

        const userWin = user.win ? user.win : 0
        const opponentWin = opponent.win ? opponent.win : 0

        return `Revanche n°${userWin + opponentWin} : **${userWin}** ${user.username} - **${opponentWin}** ${opponent.username}\n`
    }

    const text = (user, opponent, error) => `${revangeText(user, opponent)}Tour de : ${user.turn ? user.username : opponent.username} (${user.turn ? user.emoji : opponent.emoji}) ${error ? "\n" + error : ""}\n\n`

    const formatedBoard = genBoard({ board, userData, opponentData })

    await msg.edit(text(userData, opponentData) + formatedBoard.string, null)

    const collector = msg.createReactionCollector((reaction, user) => [userData.id, opponentData.id].includes(user.id) && emoteNumber.includes(reaction.emoji.name))
    
    let actionsNumber = 0
    collector.on("collect", async(reaction, user) => {
        const activeUser = userData.id === user.id ? userData : opponentData
        const opposite = userData.id === user.id ? opponentData : userData

        if (!activeUser.turn) return

        const emoteNumber = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣"]
        const playRow = emoteNumber.indexOf(reaction.emoji.name)

        const added = add({ board, emoji: activeUser.emoji, row: playRow })

        await reaction.users.remove(user.id)


        if (added && added.error) {
            if (added.error === "row_full") return await msg.edit(text(userData, opponentData, "Vous ne pouvez pas jouer ici !") + added.string, null)
            
            return await msg.edit(text(userData, opponentData, "Une erreur inconnu est survenue") + added.string, null)
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

            await msg.edit(`**${userData?.win ? userData.win : 0}** ${userData.username} - **${opponentData?.win ? opponentData.win : 0}** ${opponentData.username}\nWow bien joué ${winner.username} (${winner.emoji}) qui a gagné contre ${looser.username} (${looser.emoji})\n` + formatedBoard.string, null)
            return restart({ i18n, message, msg, opponent, client, userData, opponentData, gameData })
        }

        if (formatedBoard.allFill) {
            await collector.stop()
            await msg.reactions.removeAll()

            await msg.edit(`**${userData?.win ? userData.win : 0}** ${opponentData.username} - **${opponentData?.win ? opponentData.win : 0}** ${opponentData.username}\n${userData.username} (${userData.emoji}) et ${opponentData.username} (${opponentData.emoji}) finissent sur une égalité :(\n` + formatedBoard.string, null)
            return restart({ i18n, message, msg, opponent, client, userData, opponentData, gameData })
        }

        await msg.edit(text(userData, opponentData) + formatedBoard.string, null)

        //Bot
        if (opponentData.id === client.user.id) {
            type.turn = true
            opposite.turn = false

            const rowToPlay = await botPlay({ board, emoji: opposite.emoji })
            const added = add({ board, emoji: opposite.emoji, row: rowToPlay })

            if (added && added.error) {
                if (added.error === "row_full") return await msg.edit(text(userData, opponentData, "Vous ne pouvez pas jouer ici !") + added.string, null)
                
                return await msg.edit(text(userData, opponentData, "Une erreur inconnu est survenue") + added.string, null)
            }

            const formatedBoard = genBoard({ board, userData, opponentData })

            if (formatedBoard.win) {
                await collector.stop()

                console.log("WIN")
            }

            await msg.edit(text(userData, opponentData) + formatedBoard.string, null)
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

async function restart({ i18n, message, msg, opponent, client, userData, opponentData, gameData }) {
    await msg.react("🔄")
    await msg.react("📥")

    const collector = msg.createReactionCollector((reaction, user) => [userData.id, opponentData.id].includes(user.id) && ["🔄", "📥"].includes(reaction.emoji.name), { dispose: true })

    let numberReady = 0

    collector.on("collect", async(reaction, user) => {
        if (reaction.emoji.name === "📥") {
            await collector.stop()
            await msg.reactions.removeAll()

            return makeGif({ client, message, gameData })
        }

        const activeUser = user.id === userData.id ? userData : opponentData

        activeUser.readyRestart = true 
        numberReady = numberReady + 1

        if (numberReady === 2) {
            await collector.stop()
            await msg.reactions.removeAll()

            opponentData.choose = opponentData?.choose ? false : true

            return whoStart({ i18n, message, msg, opponent, client, userData, opponentData })
        }
        
        await msg.edit(`${user.username} veut une revanche (${numberReady}/2)\n`)
    })

    collector.on("remove", async(reaction, user) => {
        numberReady = numberReady - 1

        if (numberReady === 0) {
            await collector.stop()
            await msg.reactions.removeAll()

            return await msg.edit(`${user.username} veut plus de revanche`)
        }
    })
}

const Canvas = require("canvas")
const gifencoder = require("gifencoder")

async function makeGif({ client, message, gameData }) {

    gameData = undefined

    if (!gameData) {
        gameData = {
            date: 1627310718650,
            players: [
                {
                    id: '253569074431262720',
                    username: 'Superalexandre',
                    turn: false,
                    emoji: '🔴',
                    winEmoji: '<a:Sudref_Red_White:723485311467913239>',
                    win: 1
                },
                {
                    id: '749931469681459251',
                    username: 'Rudiger',
                    turn: true,
                    emoji: '🟡' ,
                    winEmoji: '<a:Sudref_Yellow_White:723485311954452501>',
                    loose: 1
                }
            ],
            actions: [
                [
                    ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
                    ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
                    ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "🔴"],
                    ["🟡", "⚪", "⚪", "⚪", "⚪", "⚪", "🔴"],
                    ["🟡", "⚪", "⚪", "⚪", "⚪", "⚪", "🔴"],
                    ["🟡", "⚪", "⚪", "⚪", "⚪", "⚪", "🔴"],
                ],
                [
                    ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
                    ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
                    ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
                    ["🟡", "⚪", "⚪", "⚪", "⚪", "⚪", "🔴"],
                    ["🟡", "⚪", "⚪", "⚪", "⚪", "⚪", "🔴"],
                    ["🟡", "⚪", "⚪", "⚪", "⚪", "⚪", "🔴"],
                ],
                [
                    ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
                    ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
                    ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
                    ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "🔴"],
                    ["🟡", "⚪", "⚪", "⚪", "⚪", "⚪", "🔴"],
                    ["🟡", "⚪", "⚪", "⚪", "⚪", "⚪", "🔴"],
                ],
                [
                    ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
                    ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
                    ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
                    ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
                    ["🟡", "⚪", "⚪", "⚪", "⚪", "⚪", "🔴"],
                    ["🟡", "⚪", "⚪", "⚪", "⚪", "⚪", "🔴"],
                ],
                [
                    ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
                    ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
                    ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
                    ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
                    ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "🔴"],
                    ["🟡", "⚪", "⚪", "⚪", "⚪", "⚪", "🔴"],
                ],
                [
                    ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
                    ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
                    ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
                    ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
                    ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
                    ["🟡", "⚪", "⚪", "⚪", "⚪", "⚪", "🔴"],
                ],
                [
                    ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
                    ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
                    ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
                    ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
                    ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
                    ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "🔴"],
                ]
            ]
        }
    }

    const actions = gameData.actions.reverse()

    const width = 500
    const height = 500

    //Gif
    const gif = new gifencoder(width, height)
    
    gif.start()
    gif.setRepeat(0)
    gif.setDelay(1000)
    gif.setQuality(0)
    gif.setTransparent()

    //Canvas
    const canvas = Canvas.createCanvas(width, height)
    const ctx = canvas.getContext("2d")

    //Text
    ctx.fillStyle = "#FFFFFF"
    ctx.font = "20px Arial"
    const text = `Replay de ${gameData.players[0].username} contre ${gameData.players[1].username}`
    const textWidth = ctx.measureText(text).width

    ctx.fillText(text, (canvas.width/2) - (textWidth / 2), 50)

    //Credit
    ctx.font = "18px Arial"
    ctx.fillText(`Replay par ${client.user.username}`, width / 20, height - 20)

    const emotes = {
        "🔴": await Canvas.loadImage("https://images.emojiterra.com/twitter/v13.0/512px/1f534.png"),
        "🟡": await Canvas.loadImage("https://images.emojiterra.com/twitter/v13.0/512px/1f7e1.png"),
        "⚪": await Canvas.loadImage("https://images.emojiterra.com/twitter/v13.0/512px/26aa.png")
    }

    for (let i = 0; i < actions.length; i++) { //k
        for (let j = 0; j < actions[i].length; j++) { //i
            for (let k = 0; k < actions[i][j].length; k++) { //j
                const widthImage = width / 10
                const heightImage = height / 10

                const jLength = actions[i][j].length
                const iLength = actions[i].length

                const x = (width - (jLength * widthImage)) / 2
                const y  = (height - (iLength * heightImage)) / 2

                const emote = await emotes[actions[i][j][k]]

                ctx.drawImage(emote, x + k * widthImage, y + j * heightImage, widthImage, heightImage)
            }
        }

        gif.addFrame(ctx)
    }

    gif.finish()

    message.channel.send({
        files: [{
            attachment: gif.out.getData(),
            name: "replay.gif"
        }]
    })
}