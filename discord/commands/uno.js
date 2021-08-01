const Command = require("../structures/Command")
const { MessageButton, MessageActionRow } = require("discord-buttons")



module.exports = class Uno extends Command {
    constructor(client) {
        super(client, {
            name: "uno",
            //desc: (i18n) => i18n.__("discord.help.desc"),
            directory: __dirname,
            //use: (i18n) => i18n.__("discord.help.use"),
            //example:(i18n) => i18n.__("discord.help.example"),
        })
    }

    async run({ client, message, args, i18n, data, userData, util }) {
        let cards = {
            blue: {
                0: 1,
                1: 2,
                2: 2,
                3: 2,
                4: 2,
                5: 2,
                6: 2,
                7: 2,
                8: 2,
                9: 2,
                "skip": 2,
                "switch": 2,
                "addTwo": 2
            },
            red: {
                0: 1,
                1: 2,
                2: 2,
                3: 2,
                4: 2,
                5: 2,
                6: 2,
                7: 2,
                8: 2,
                9: 2,
                "skip": 2,
                "switch": 2,
                "addTwo": 2
            },
            yellow: {
                0: 1,
                1: 2,
                2: 2,
                3: 2,
                4: 2,
                5: 2,
                6: 2,
                7: 2,
                8: 2,
                9: 2,
                "skip": 2,
                "switch": 2,
                "addTwo": 2
            },
            green: {
                0: 1,
                1: 2,
                2: 2,
                3: 2,
                4: 2,
                5: 2,
                6: 2,
                7: 2,
                8: 2,
                9: 2,
                "skip": 2,
                "switch": 2,
                "addTwo": 2
            },
            special: {
                "addFour": 4,
                "newColor": 4
            }
        }

        let players = [message.author]

        if (!message.mentions.members.first()) return message.channel.send("Veuillez mentionner au moins une personne avec qui jouer")

        await message.mentions.members.forEach(member => {
            if (member.id === message.author.id) return message.channel.send(`Ne t'inquiete pas ${message.author.username}, tu es deja dans la partie pas besoin de te mentionner`)
        
            if (!member) return message.channel.send(`Aie le membre ${member.user.username} est invalide :(`)
        
            if (players.includes(member.user.id)) return message.channel.send(`Le membre ${member.user.username} est deja dans la partie`)
        
            if (member.user.bot) return message.channel.send(`Eh ! c'est pas drole de jouer ${member.user.username}, parce que c'est un bot`)
        
            players.push(member.user)
        })

        
        if (players.length < 1) return message.channel.send("Ouh la la je ne sais pas comment vous avez fait pour être seul mais merci de contacter le support au plus vite !")

        if (players.length > 10) return message.channel.send("Aie aie aie, les parties de uno sont limiter a 10 joueurs")

        let msg = await message.channel.send(`Création de la partie avec ${players.length} joueurs\n${players.map(user => "• " + user.username).join("\n")}`)

        allPlayersReady({ client, message, msg, cards, players })
    }

    async playCard({ client, gameID, button }) {
        const game = client.games.uno.get(gameID)
        
        if (!game) return console.log(false)

        let { message, msg, cards, players, playersData, turn, actualCard, clockwise } = game

        const userTurn = (number) => playersData[Object.keys(playersData)[number]]
        const switchTurn = (turn, toAdd, clockwise) => {
            const players = Object.keys(playersData)
                
            if (!clockwise) toAdd = players.length - toAdd
                
            if (players[turn + toAdd]) return turn + toAdd
            
            return switchTurn(turn - (players.length - toAdd), toAdd - (players.length - turn), playersData, true)    
        }
    
        /*
        const switchTurn = (turn, toAdd, clockwise) => {
            const players = Object.keys(playersData)

            if (!clockwise) toAdd = players.length - toAdd

            if (players[turn + toAdd]) return turn + toAdd

            return players[toAdd - (players.length - turn)]
            //return switchTurn(turn, toAdd - (players.length - turn), playersData, true)    
        }
        */

        if (!playersData[button.clicker.user.id].isTurn) return await button.reply.send(`Désolé mais ce n'est pas encore votre tour`, true)
    
        const id = button.id.split("_")

        const user = userTurn(turn)

        const seen_card = new MessageButton()
            .setStyle("blurple")
            .setLabel("Voir mes cartes")
            .setID(`game_uno_${message.author.id}_${gameID}_seenCard`)
        
        const genColorsButtons = (type) => {
            const red = new MessageButton()
                .setStyle("blurple")
                .setLabel("Rouge")
                .setID(`game_uno_${message.author.id}_${gameID}_ephemeral_red_${type}`)

            const green = new MessageButton()
                .setStyle("blurple")
                .setLabel("Vert")
                .setID(`game_uno_${message.author.id}_${gameID}_ephemeral_green_${type}`)

            const blue = new MessageButton()
                .setStyle("blurple")
                .setLabel("Bleu")
                .setID(`game_uno_${message.author.id}_${gameID}_ephemeral_blue_${type}`)
        
            const yellow = new MessageButton()
                .setStyle("blurple")
                .setLabel("Jaune")
                .setID(`game_uno_${message.author.id}_${gameID}_ephemeral_yellow_${type}`)

            const colors = new MessageActionRow()
                .addComponents([ red, green, blue, yellow ])
        
            return colors
        }
            
        if (id[id.length - 1] === "draw") {
            const drawCard = await genCard({ cards })
            
            user.cards.push(drawCard.generatedCard)
    
            const genButton = genButtons({ message, playersData, userID: button.clicker.user.id, gameID })
    
            await user.reply.edit("Voici vos cartes, faites gaffe a bien garder ce message !", {
                components: makeRows(genButton.buttons),
                ephemeral: true
            })
        
            turn = switchTurn(turn, 1, clockwise)
            user.isTurn = false
    
            const newTurn = userTurn(turn)
            newTurn.isTurn = true
    
            await button.reply.defer()
    
            await msg.edit(`Au tour de ${newTurn.user.username}\n${actualCard}`, {
                buttons: [ seen_card ]
            })
    
            return client.games.uno.set(gameID, { message, msg, cards, players, playersData, turn, actualCard, clockwise })
        }
    
        const cardColor = id[id.length - 2]
        const cardNumber = id[id.length - 1] 

        const actualCardID = actualCard.split("_")
        const actualCardColor = actualCardID[0]
        const actualCardNumber = actualCardID[1]

        //New color, color selected
        if (cardNumber === "newColor" && cardColor !== "special") {
            actualCard = cardColor

            turn = switchTurn(turn, 1, clockwise)
            user.isTurn = false
    
            const newTurn = userTurn(turn)
            newTurn.isTurn = true
    
            const genButton = genButtons({ message, playersData, userID: button.clicker.user.id, gameID })

            await user.reply.edit("Voici vos cartes, faites gaffe a bien **garder** ce message !", {
                components: makeRows(genButton.buttons),
                ephemeral: true
            })

            await msg.edit(`Au tour de ${newTurn.user.username}\n${actualCard}`, {
                buttons: [ seen_card ]
            })
        //Add four card, skip and color switch
        } else if (cardNumber === "addFour" && cardColor !== "special") {
            actualCard = cardColor

            turn = switchTurn(turn, 1, clockwise)
            user.isTurn = false
    
            const drawerData = userTurn(turn)
            
            for (let i = 0; i < 4; i++) {
                const drawCard = await genCard({ cards })

                drawerData.cards.push(drawCard.generatedCard)   
            }

            const drawerButton = genButtons({ message, playersData, userID: drawerData.user.id, gameID })

            await drawerData.reply.edit("Voici vos cartes, faites gaffe a bien **garder** ce message !", {
                components: makeRows(drawerButton.buttons),
                ephemeral: true
            })

            turn = switchTurn(turn, 1, clockwise)
            
            const newTurn = userTurn(turn)
            newTurn.isTurn = true

            const genButton = genButtons({ message, playersData, userID: button.clicker.user.id, gameID })

            await user.reply.edit("Voici vos cartes, faites gaffe a bien **garder** ce message !", {
                components: makeRows(genButton.buttons),
                ephemeral: true
            })

            await msg.edit(`Au tour de ${newTurn.user.username}\n${actualCard}`, {
                buttons: [ seen_card ]
            })
        //New color, color selector
        } else if (cardColor === "special" && cardNumber === "newColor") {
            user.cards = removeCard(user.cards, cardColor + "_" + cardNumber)

            const genButton = genButtons({ message, playersData, userID: button.clicker.user.id, gameID })

            const editButtons = []

            //Disable all buttons
            for (const button of genButton.buttons) {
                const editButton = new MessageButton(button).setDisabled()
                
                editButtons.push(editButton)
            }

            const rows = makeRows(editButtons)

            const colors = genColorsButtons("newColor")

            rows.push(colors)

            await user.reply.edit("Voici vos cartes, faites gaffe a bien **garder** ce message !\nMerci de choisir votre couleur", {
                components: rows,
                ephemeral: true
            })

            await msg.edit(`Au tour de ${user.user.username}\n${user.user.username} choisis la couleur qu'il veut...`, {
                buttons: [ seen_card ]
            })
        //Add four, color selector
        } else if (cardColor === "special" && cardNumber === "addFour") {
            user.cards = removeCard(user.cards, cardColor + "_" + cardNumber)

            const genButton = genButtons({ message, playersData, userID: button.clicker.user.id, gameID })

            const editButtons = []

            //Disable all buttons
            for (const button of genButton.buttons) {
                const editButton = new MessageButton(button).setDisabled()
                
                editButtons.push(editButton)
            }

            const rows = makeRows(editButtons)
            
            const colors = genColorsButtons("addFour")

            rows.push(colors)
            
            await user.reply.edit("Voici vos cartes, faites gaffe a bien **garder** ce message !\nMerci de choisir votre couleur", {
                components: rows,
                ephemeral: true
            })

            await msg.edit(`Au tour de ${user.user.username}\n${user.user.username} choisis la couleur qu'il veut...`, {
                buttons: [ seen_card ]
            })
        } else {
        
            /*
                const cardColor = id[id.length - 2]
                const cardNumber = id[id.length - 1] 
                const actualCardID = actualCard.split("_")
                const actualCardColor = actualCardID[0]
                const actualCardNumber = actualCardID[1]
            */

            //other card

            console.log(cardColor, cardNumber, actualCardColor, actualCardNumber)

            if (cardColor === actualCardColor || cardNumber === actualCardNumber) {
                user.cards = removeCard(user.cards, cardColor + "_" + cardNumber)

                turn = switchTurn(turn, 1, clockwise)
            
                const newTurn = userTurn(turn)
                newTurn.isTurn = true

                const genButton = genButtons({ message, playersData, userID: button.clicker.user.id, gameID })

                await user.reply.edit("Voici vos cartes, faites gaffe a bien **garder** ce message !", {
                    components: makeRows(genButton.buttons),
                    ephemeral: true
                })

                await msg.edit(`Au tour de ${newTurn.user.username}\n${actualCard}`, {
                    buttons: [ seen_card ]
                })
            } else {
                await msg.edit(`${button.clicker.user.username} A joué une mauvaise carte !`)
            }
        }

        await button.reply.defer()

        client.games.uno.set(gameID, { message, msg, cards, players, playersData, turn, actualCard, clockwise })
    }
}

async function allPlayersReady({ client, message, msg, cards, players }) {
    //Todo gameID

    const gameID = "1"

    client.games.uno.set(gameID, { message, msg, cards, players })

    startGame({ client, gameID })
}

async function startGame({ client, gameID }) {
    const game = client.games.uno.get(gameID)
    
    let { message, msg, cards, players } = game

    let playersData = {}
    let turn = 0
    const userTurn = (number) => playersData[Object.keys(playersData)[number]]

    for (let i = 0; i < players.length; i++) {
        let playerCards = []

        for (let i = 1; i < 9; i++) {
            const card = await genCard({ cards })

            playerCards.push(card.generatedCard)
        }

        playersData[players[i].id] = {
            id: players[i].id,
            user: players[i],
            turn: i,
            isTurn: i === turn ? true : false,
            cards: playerCards,
            reply: null,
            optionalReply: null,
            lastcard: ""
        }
    }

    let { generatedCard: actualCard } = await genCard({ cards })

    const seen_card = new MessageButton()
        .setStyle("blurple")
        .setLabel("Voir mes cartes")
        .setID(`game_uno_${message.author.id}_${gameID}_seenCard`)

    msg.edit(`Au tour de ${userTurn(turn).user.username}\n${actualCard}`, {
        buttons: [ seen_card ]
    })

    const collector = msg.createButtonCollector((button) => button)

    collector.on("collect", async(button) => {
        if (!button.clicker || !button.clicker.user || !button.clicker.user.id) await button.clicker.fetch()

        if (!Object.keys(playersData).includes(button.clicker.user.id)) return await button.reply.send(`Désolé mais ce n'est pas votre partie, pour en lancer une faites !uno @Joueur`, true)
    
        if (button.id.endsWith("seenCard")) {
            const { buttons } = genButtons({ message, playersData, userID: button.clicker.user.id, gameID })

            let reply = await button.reply.send("Voici vos cartes, faites gaffe a bien garder ce message !", {
                components: makeRows(buttons),
                ephemeral: true
            })

            playersData[button.clicker.user.id].reply = reply

            return true
        }
    })

    client.games.uno.set(gameID, { message, msg, cards, players, playersData, turn, actualCard, clockwise: true })
}

function removeCard(cards, toRemove) {
    let filtered = false

    const card = cards.filter(card => {
        if (card !== toRemove) return true

        if (!filtered && card === toRemove) {
            filtered = true
        
            return false
        }

        return true
    })

    return card
}

function makeRows(buttonsData) {
    function splitIntoChunk(arr, chunk) {
        let arrays = []

        for (let i= 0; i < arr.length; i += chunk) {
            let tempArray;
            tempArray = arr.slice(i, i + chunk);
            arrays.push(tempArray)
        }

        return arrays

    }

    let arrays = splitIntoChunk(buttonsData, 5);

    if (arrays.length !== 1) {
        let ActionRow = []

        for (const buttons of arrays) {
            let row = new MessageActionRow()

            for (const button of  buttons) {
                row.addComponent(button)
            }
            ActionRow.push(row)
        }

        return ActionRow
    } else {
        const compenantButtons = new MessageActionRow()
        
        for (const button of buttonsData) {
            compenantButtons.addComponent(button)
        }

        return [compenantButtons]
    }
}

function genCard({ cards }) {
    let generatedCard = ""

    let typeColor = ["blue", "red", "yellow", "green", "special"]
    let color = typeColor[Math.floor(Math.random() * typeColor.length)]

    generatedCard += color + "_"

    let typeNumber = color === "special" ? ["addFour", "newColor"] : ["1", "2", "3", "4", "5", "6", "7", "8", "9", "skip", "switch", "addTwo"]
    let number = typeNumber[Math.floor(Math.random() * typeNumber.length)]

    generatedCard += number

    if (!cards?.[color]?.[number] || (cards[color][number] - 1) <= 0) return genCard({ cards })

    cards[color][number] = cards[color][number] - 1

    return { cards, generatedCard }
}

function genButtons({ message, playersData, userID, gameID }) {
    const draw = new MessageButton()
        .setStyle("red")
        .setLabel("Piocher")
        .setID(`game_uno_${message.author.id}_${gameID}_playCard_ephemeral_draw`)

    const buttons = []

    for (let i = 0; i < playersData[userID].cards.length; i++) {
        const buttonCard = new MessageButton()
            .setStyle("blurple")
            .setLabel(playersData[userID].cards[i])
            .setID(`game_uno_${message.author.id}_${gameID}_playCard_ephemeral_${playersData[userID].cards[i]}`)

        buttons.push(buttonCard)
    }

    buttons.push(draw)

    return { buttons }
}

/*
const playersData = {
    "1": {},
    "2": {}
}
//const switchTurn = (turn, toAdd, sign) => playersData[Object.keys(playersData)[eval(turn + sign + toAdd)]] ? eval(turn + sign + toAdd) : 0

function switchTurn(turn, toAdd, sign) {
    //let number = eval(turn + sign + toAdd)
    let object = Object.keys(playersData)

    if (sign.sing === "-" && !sign.reversed) object.reverse()

    let number = turn + toAdd
    sign.reversed = true

    for (let i = 0; i < number; i++) {
        console.log(1)

        if (!object[i]) return switchTurn(turn, toAdd - i, sign)
    }

    console.log(0, number)

    return object[number]
}

console.log(switchTurn(1, 1, { sign: "-" }))
*/

/*

Card points
function cardScore(num) {
  let points;
  switch (num % 14) {
    case 10: //Skip
    case 11: //Reverse
    case 12: //Draw 2
      points = 20;
      break;
    case 13: //Wild or Wild Draw 4
      points = 50;
      break;
    default:
      points = num % 14;
      break;
  }
  return points;
}
*/