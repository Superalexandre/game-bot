const Command = require("../structures/Command")
const { MessageButton, MessageActionRow } = require("discord.js")

module.exports = class Uno extends Command {
    constructor(client) {
        super(client, {
            name: "uno",
            directory: __dirname
        })
    }

    async run({ client, interaction, options, i18n, data, userData, util }) {
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

        let players = [interaction.user]

        for (let i = 0; i < options.data.length; i++) {
            const user = options.data[i].user

            if (user.id === interaction.user.id) return await interaction.channel.send(`Ne t'inquiete pas ${user.username}, tu es deja dans la partie pas besoin de te mentionner`)
        
            if (!user) return await interaction.channel.send(`Aie le membre ${user.username} est invalide :(`)
        
            if (players.includes(user.id)) return await interaction.channel.send(`Le membre ${user.username} est deja dans la partie`)
        
            if (user.bot) return await interaction.channel.send(`Eh ! c'est pas drole de jouer ${user.username}, parce que c'est un bot`)
        
            players.push(user)
        }

        if (players.length < 1) return await interaction.channel.send("Ouh la la je ne sais pas comment vous avez fait pour être seul mais merci de contacter le support au plus vite !")

        if (players.length > 10) return await interaction.channel.send("Aie aie aie, les parties de uno sont limiter a 10 joueurs")

        let msg = await interaction.channel.send(`Création de la partie avec ${players.length} joueurs\n${players.map(user => "• " + user.username).join("\n")}`)

        const gameData = {
            config: {
                firstSpecialCard: true,
                multipleCard: false,
                outbid: true,
                bluffing: true
            },
            card: cards,
            players: players
        }

        allPlayersReady({ client, interaction, msg, gameData, i18n, cards, players })
    }

    async playCard({ client, gameId, button }) {
        const game = client.games.uno.get(gameId)
        
        if (!game) {
            console.log(`Erreur partie ${gameId} introuvable, button : `, button, game)

            return client.games.uno.delete(gameId)
        }

        let { interaction, msg, gameData, i18n, cards, players, playersData, turn, actualCard, clockwise } = game

        if (!playersData[button.user.id]) return await button.reply({
            content: "Pas votre partie dsl",
            ephemeral: true
        })

        const userTurn = (number) => playersData[Object.keys(playersData)[number]]
    
        const mainText = (playersData, userData, actualCard) => `${Object.values(playersData).map(user => `${user.user.username} ${user.cards.length === 1 ? "Uno !" : user.cards.length + " cartes"}`).join("\n")}\n\nAu tour de ${userData.user.username}\nCarte actuelle : ${getEmojiCard(actualCard).fullEmoji}`
        const id = button.customId.split("_")
        
        if (id[id.length - 2] === "page") {
            const number = parseInt(id[id.length - 1])
            const pageUser = playersData[button.user.id]

            pageUser.page = number
            
            const genButton = genButtons({ interaction, playersData, userId: button.user.id, gameId, actualCard, disable: false })
            
            await pageUser?.reply?.editReply({
                content: "Voici vos cartes, faites gaffe a bien **garder** ce message !", 
                components: makeRows({ buttonsData: genButton.buttons, gameData, page: pageUser.page, interaction, gameId, disable: false }),
                ephemeral: true
            })

            await button.deferUpdate()
            
            return await client.games.uno.set(gameId, { interaction, msg, gameData, i18n, cards, players, playersData, turn, actualCard, clockwise })
        }
        
        const user = userTurn(turn)
        
        //* Check turn and if good user
        if (!playersData[button.user.id].isTurn || user.user.id !== button.user.id) return await button.reply({
            content: `Désolé mais ce n'est pas encore votre tour`,
            ephemeral: true
        })

        const seen_card = new MessageButton()
            .setStyle("PRIMARY")
            .setLabel("Voir mes cartes")
            .setCustomId(`game_uno_${interaction.user.id}_${gameId}_seenCard_0`)
        
        const seenCardComponent = new MessageActionRow().addComponents(seen_card)

        //* Buttons for +4 and switch color
        const genColorsButtons = (type, id) => {
            const red = new MessageButton()
                .setStyle("PRIMARY")
                .setLabel("Rouge")
                .setCustomId(`game_uno_${interaction.user.id}_${gameId}_ephemeral_red_${type}_${id}`)

            const green = new MessageButton()
                .setStyle("PRIMARY")
                .setLabel("Vert")
                .setCustomId(`game_uno_${interaction.user.id}_${gameId}_ephemeral_green_${type}_${id}`)

            const blue = new MessageButton()
                .setStyle("PRIMARY")
                .setLabel("Bleu")
                .setCustomId(`game_uno_${interaction.user.id}_${gameId}_ephemeral_blue_${type}_${id}`)
        
            const yellow = new MessageButton()
                .setStyle("PRIMARY")
                .setLabel("Jaune")
                .setCustomId(`game_uno_${interaction.user.id}_${gameId}_ephemeral_yellow_${type}_${id}`)

            const back = new MessageButton()
                .setStyle("DANGER")
                .setLabel("Retour")
                .setCustomId(`game_uno_${interaction.user.id}_${gameId}_ephemeral_back_${type}_${id}`)

            const colors = new MessageActionRow().addComponents(red, green, blue, yellow, back)
        
            return colors
        }

        if (id[id.length - 2] === "draw") {
            const drawCard = await genCard({ cards })
            
            user.drawCard = drawCard.generatedCard
    
            const play = new MessageButton()
                .setStyle("SUCCESS")
                .setLabel("Jouer")
                .setCustomId(`game_uno_${interaction.user.id}_${gameId}_ephemeral_drawAction_play`)

            const skip = new MessageButton()
                .setStyle("DANGER")
                .setLabel("Passer son tour")
                .setCustomId(`game_uno_${interaction.user.id}_${gameId}_ephemeral_drawAction_skip`)

            const actions = new MessageActionRow().addComponents(play, skip)

            await user?.reply?.editReply({
                content: `Vous avez piocher ${getEmojiCard(drawCard.generatedCard).fullEmoji}`, 
                components: [ actions ],
                ephemeral: true
            })

            await button.deferUpdate()
    
            await msg.edit({
                content: mainText(playersData, user, actualCard),
                components: [ seenCardComponent ]
            })
    
            return await client.games.uno.set(gameId, { interaction, msg, gameData, i18n, cards, players, playersData, turn, actualCard, clockwise })
        //* Draw card
        } else if (id[id.length - 2] === "drawAction") {
            //* Play drawed card
            if (id[id.length - 1] === "play") {
                const [newCardColor, newCardNumber] = user.drawCard.split("_")
                const newCardId = (user.cards.filter(card => card === user.drawCard).length + 1).toString()

                id[id.length - 2] = newCardColor
                id[id.length - 1] = newCardNumber
                id[id.length] = newCardId

                if (newCardColor !== "special") user.activeCard = [`${newCardColor}_${newCardNumber}_${newCardId}`]
            //* Skip
            } else if (id[id.length - 1] === "skip") {
                turn = switchTurn(playersData, turn, 1, clockwise)
                user.isTurn = false
    
                const newTurn = userTurn(turn)
                newTurn.isTurn = true

                user.cards.push(user.drawCard)

                user.drawCard = false
                user.activeCard = []

                const genButton = genButtons({ interaction, playersData, userId: button.user.id, gameId, actualCard, disable: false })

                await user?.reply?.editReply({
                    content: "Voici vos cartes, faites gaffe a bien **garder** ce message !",
                    components: makeRows({ buttonsData: genButton.buttons, gameData, page: user.page, interaction, gameId, disable: false }),
                    ephemeral: true
                })
        
                await msg.edit({
                    content: mainText(playersData, newTurn, actualCard),
                    components: [ seenCardComponent ]
                })

                await button.deferUpdate()
                return await client.games.uno.set(gameId, { interaction, msg, gameData, i18n, cards, players, playersData, turn, actualCard, clockwise })
            }
        }
    
        if (id[id.length - 2] === "play" && gameData.config.multipleCard) {
            if (user.activeCard.length <= 0) {
                const genButton = genButtons({ interaction, playersData, userId: button.user.id, gameId, actualCard, disable: false })

                await user?.reply?.editReply({
                    content: "Voici vos cartes, faites gaffe a bien **garder** ce message !\nSelectionner des cartes avant de vouloir jouer !", 
                    components: makeRows({ buttonsData: genButton.buttons, gameData, page: user.page, interaction, gameId, disable: false }),
                    ephemeral: true
                })

                await button.deferUpdate()
                return await await client.games.uno.set(gameId, { interaction, msg, gameData, i18n, cards, players, playersData, turn, actualCard, clockwise })
            }

            return await cardsPlayed({ user, button, client, gameId, interaction, msg, gameData, i18n, cards, players, playersData, turn, actualCard, clockwise }) 
        }

        const cardColor = id[id.length - 3]
        const cardNumber = id[id.length - 2]
        const cardId = id[id.length - 1]

        const [actualCardColor, actualCardNumber] = actualCard.split("_")

        //* New color and addFour, color selected
        if (["newColor", "addFour"].includes(cardNumber) && cardColor !== "special") {
            if (cardColor === "back") {
                if (user.drawCard) {
                    user.cards.push(user.drawCard)

                    user.drawCard = false
                    user.activeCard = []

                    turn = switchTurn(playersData, turn, 1, clockwise)
                    user.isTurn = false
    
                    const newTurn = userTurn(turn)
                    newTurn.isTurn = true
    
                    await msg.edit({
                        content: mainText(playersData, newTurn, actualCard), 
                        components: [ seenCardComponent ]
                    })
                }

                const genButton = genButtons({ interaction, playersData, userId: button.user.id, gameId, actualCard, disable: false })
                const rows = makeRows({ buttonsData: genButton.buttons, gameData, page: user.page, interaction, gameId, disable: false })

                await user?.reply?.editReply({
                    content: "Voici vos cartes, faites gaffe a bien **garder** ce message !",
                    components: rows,
                    ephemeral: true
                })

                return await await client.games.uno.set(gameId, { interaction, msg, gameData, i18n, cards, players, playersData, turn, actualCard, clockwise })
            }

            if (cardId === "noSkip") {
                actualCard = cardColor
            } else {
                user.activeCard = await checkUserActiveCard(user, `special_${cardNumber}_${cardId}_${cardColor}`)
            }

            const genButton = genButtons({ interaction, playersData, userId: button.user.id, gameId, actualCard, disable: false })

            await user?.reply?.editReply({
                content: "Voici vos cartes, faites gaffe a bien **garder** ce message !", 
                components: makeRows({ buttonsData: genButton.buttons, gameData, page: user.page, interaction, gameId, disable: false }),
                ephemeral: true
            })

            await msg.edit({
                content: mainText(playersData, user, actualCard),
                components: [ seenCardComponent ]
            })

            if (user.drawCard) {
                user.drawCard = false
                
                return await cardsPlayed({ user, button, client, gameId, interaction, msg, gameData, i18n, cards, players, playersData, turn, actualCard, clockwise })
            }

            if (cardId === "noSkip") {
                await button.deferUpdate()
                return await client.games.uno.set(gameId, { interaction, msg, gameData, i18n, cards, players, playersData, turn, actualCard, clockwise })    
            }
        //* New color and add Four, color selector
        } else if (cardColor === "special" && ["newColor", "addFour"].includes(cardNumber)) {
            const genButton = genButtons({ interaction, playersData, userId: button.user.id, gameId, actualCard, disable: true })
            const rows = makeRows({ buttonsData: genButton.buttons, gameData, page: user.page, interaction, gameId, disable: true })

            const colors = genColorsButtons(cardNumber, cardId)

            rows.push(colors)

            await user?.reply?.editReply({
                content: "Voici vos cartes, faites gaffe a bien **garder** ce message !\nMerci de choisir votre couleur", 
                components: rows,
                ephemeral: true
            })

            await msg.edit({
                content: mainText(playersData, user, actualCard),
                components: [ seenCardComponent ]
            })

            
            await button.deferUpdate()
            return await client.games.uno.set(gameId, { interaction, msg, gameData, i18n, cards, players, playersData, turn, actualCard, clockwise })
        //* Not +4 and switch color
        } else {
            //* Check if card is valid
            const [, activeCardNumber] = user.activeCard?.[0]?.split("_")

            if (cardColor === actualCardColor || cardNumber === actualCardNumber || (activeCardNumber === cardNumber && !user.activeCard)) {
                if (user.drawCard) {
                    user.drawCard = false

                    return await cardsPlayed({ user, button, client, gameId, interaction, msg, gameData, i18n, cards, players, playersData, turn, actualCard, clockwise })
                }

                user.activeCard = await checkUserActiveCard(user, `${cardColor}_${cardNumber}_${cardId}`)

                const genButton = genButtons({ interaction, playersData, userId: button.user.id, gameId, actualCard, disable: false })

                await user?.reply?.editReply({
                    content: "Voici vos cartes, faites gaffe a bien **garder** ce message !", 
                    components: makeRows({ buttonsData: genButton.buttons, gameData, page: user.page, interaction, gameId, disable: false }),
                    ephemeral: true
                })
            } else {
                //* If the players is in draw and play an invalid card
                if (user.drawCard) {
                    user.cards.push(user.drawCard)

                    user.drawCard = false
                    user.activeCard = []

                    turn = switchTurn(playersData, turn, 1, clockwise)
                    user.isTurn = false
    
                    const newTurn = userTurn(turn)
                    newTurn.isTurn = true
    
                    await msg.edit({
                        content: mainText(playersData, newTurn, actualCard), 
                        components: [ seenCardComponent ]
                    })
                }

                //* Invalid card
                const genButton = genButtons({ interaction, playersData, userId: button.user.id, gameId, actualCard, disable: false })

                await user?.reply?.editReply({
                    content: "Voici vos cartes, faites gaffe a bien **garder** ce message !\n⚠️ La carte que vous avez essayer de jouer n'est pas valide", 
                    components: makeRows({ buttonsData: genButton.buttons, gameData, page: user.page, interaction, gameId, disable: false }),
                    ephemeral: true
                })

                await button.deferUpdate()

                return await await client.games.uno.set(gameId, { interaction, msg, gameData, i18n, cards, players, playersData, turn, actualCard, clockwise })
            }
        }
        
        await button.deferUpdate()
        await client.games.uno.set(gameId, { interaction, msg, gameData, i18n, cards, players, playersData, turn, actualCard, clockwise })

        if (!gameData.config.multipleCard) return await cardsPlayed({ user, button, client, gameId, interaction, msg, gameData, i18n, cards, players, playersData, turn, actualCard, clockwise })
    }
}

async function checkUserActiveCard(user, cardId) {
    const [color, number, id, askedColor] = cardId.split("_")
    let userCard = user.activeCard

    if (cardId.startsWith("special")) cardId = `${color}_${number}_${id}-${askedColor}`

    if (userCard.includes(cardId)) {
        userCard = userCard.filter(card => card !== cardId)
    } else {
        userCard.push(cardId)
    }

    return userCard
}

async function cardsPlayed({ user, button, client, gameId, interaction, msg, gameData, i18n, cards, players, playersData, turn, actualCard, clockwise }) {
    const userTurn = (number) => playersData[Object.keys(playersData)[number]]
    const mainText = (playersData, userData, actualCard) => `${Object.values(playersData).map(user => `${user.user.username} ${user.cards.length === 1 ? "Uno !" : user.cards.length + " cartes"}`).join("\n")}\n\nAu tour de ${userData.user.username}\nCarte actuelle : ${getEmojiCard(actualCard).fullEmoji}`
    
    const seen_card = new MessageButton()
        .setStyle("PRIMARY")
        .setLabel("Voir mes cartes")
        .setCustomId(`game_uno_${interaction.user.id}_${gameId}_seenCard_0`)

    const seenCardComponent = new MessageActionRow().addComponents(seen_card)

    if (!button.deferred) await button.deferUpdate()
    
    const activeCardLength = user.activeCard.length
    const [firstCardColor, firstCardNumber, firstCardId] = user.activeCard[0].split("_")
    const [lastActiveCardColor, lastActiveCardNumber, lastActiveCardId] = user.activeCard[user.activeCard.length - 1].split("_")
    for (let i = 0; i < user.activeCard.length; i++) {
        const [idColor, idNumber] = user.activeCard[i].split("_")
        if (idNumber !== firstCardNumber) {
            user.activeCard = []
            
            const genButton = genButtons({ interaction, playersData, userId: button.user.id, gameId, actualCard, disable: false })

            return await user?.reply?.editReply({
                content: `Voici vos cartes, faites gaffe a bien **garder** ce message !\n⚠️ Vous ne pouvez pas jouer la carte ${getEmojiCard(`${firstCardColor}_${firstCardNumber}`).fullEmoji} avec la carte ${getEmojiCard(`${idColor}_${idNumber}`).fullEmoji}`, 
                components: makeRows({ buttonsData: genButton.buttons, gameData, page: user.page, interaction, gameId, disable: false }),
                ephemeral: true
            })
        }
    }

    for (let i = 0; i < user.activeCard.length; i++) {
        const [cardColor, cardNumber] = user.activeCard[i].split("_")

        user.cards = removeCard(cards, user.cards, `${cardColor}_${cardNumber}`)
    }

    
    //* If no more card
    if (user.cards.length <= 0) {
        for (const player in playersData) {
            await playersData[player]?.reply?.editReply({
                content: "La partie est finie !",
                components: [],
                ephemeral: true
            })
        }

        await msg.edit({
            content: `Bien joué a ${user.user.username} qui a gagné !`,
            components: []
        })

        await button.deferUpdate()
        return await client.games.uno.delete(gameId)
    }

    user.activeCard = []

    if (lastActiveCardColor === "special") {
        const [, askedColor] = lastActiveCardId.split("-")
        actualCard = askedColor
    } else actualCard = `${lastActiveCardColor}_${lastActiveCardNumber}`

    if (lastActiveCardNumber === "switch") { 
        if (players.length === 2) turn = switchTurn(playersData, turn, 1, clockwise)
  
        clockwise = clockwise ? false : true
    //* Add two
    } else if (["addTwo", "addFour"].includes(lastActiveCardNumber)) {
        const numberOfDraw = lastActiveCardNumber === "addTwo" ? 2 : 4

        turn = switchTurn(playersData, turn, 1, clockwise)

        const drawerData = userTurn(turn)

        //* Add cards to drawer
        for (let i = 0; i < numberOfDraw * activeCardLength; i++) {
            const drawCard = await genCard({ cards })

            drawerData.cards.push(drawCard.generatedCard)   
        }

        const drawerButton = genButtons({ interaction, playersData, userId: drawerData.user.id, gameId, actualCard, disable: false })

        await drawerData?.reply?.editReply({
            content: "Voici vos cartes, faites gaffe a bien **garder** ce message !", 
            components: makeRows({ buttonsData: drawerButton.buttons, gameData, page: drawerData.page, interaction, gameId, disable: false }),
            ephemeral: true
        })
    } else if (lastActiveCardNumber === "skip") turn = switchTurn(playersData, turn, 1, clockwise)

    turn = switchTurn(playersData, turn, 1, clockwise)
    user.isTurn = false

    const newTurn = userTurn(turn)
    newTurn.isTurn = true

    const genButton = genButtons({ interaction, playersData, userId: button.user.id, gameId, actualCard, disable: false })

    await user?.reply?.editReply({
        content: "Voici vos cartes, faites gaffe a bien **garder** ce message !", 
        components: makeRows({ buttonsData: genButton.buttons, gameData, page: user.page, interaction, gameId, disable: false }),
        ephemeral: true
    })

    await msg.edit({
        content: mainText(playersData, newTurn, actualCard),
        components: [ seenCardComponent ]
    })

    return await client.games.uno.set(gameId, { interaction, msg, gameData, i18n, cards, players, playersData, turn, actualCard, clockwise })
}

async function allPlayersReady({ client, interaction, msg, gameData, i18n, cards, players }) {
    const gameId = interaction.id + "-" + Date.now()

    await client.games.uno.set(gameId, { interaction, msg, gameData, i18n, cards, players })

    return await startGame({ client, gameId })
}

async function startGame({ client, gameId }) {
    const game = client.games.uno.get(gameId)
    
    let { interaction, msg, gameData, i18n, cards, players } = game

    let playersData = {}
    let turn = 0
    let clockwise = true
    const userTurn = (number) => playersData[Object.keys(playersData)[number]]

    for (let i = 0; i < players.length; i++) {
        let playerCards = []

        for (let i = 0; i < 7; i++) {
            const card = await genCard({ cards })

            playerCards.push(card.generatedCard)
        }

        playersData[players[i].id] = {
            id: players[i].id,
            user: players[i],
            turn: i,
            isTurn: i === turn ? true : false,
            cards: playerCards,
            activeCard: [],
            pendingButtons: {},
            reply: null,
            lastcard: "",
            page: 0
        }
    }

    //* Filter doesn't work
    const filter = gameData.config.firstSpecialCard ? ["addFour"] : ["addFour", "newColor", "skip", "switch", "addTwo"]
    let { generatedCard: actualCard } = await genCard({ cards, filter })
    const actualCardId = actualCard.split("_")
    const actualCardColor = actualCardId[actualCardId.length - 2]
    const actualCardNumber = actualCardId[actualCardId.length - 1]

    let actualUserTurn = userTurn(turn)

    //* If first card is addTwo
    if (actualCardNumber === "addTwo") {
        actualUserTurn.isTurn = false
        
        for (let i = 0; i < 2; i++) {
            const drawCard = await genCard({ cards })

            actualUserTurn.cards.push(drawCard.generatedCard)   
        }

        turn = switchTurn(playersData, turn, 1, clockwise)
        const newUserTurn = userTurn(turn)

        newUserTurn.isTurn = true

        actualUserTurn = newUserTurn
    } else if (actualCardNumber === "newColor") {
        const red = new MessageButton()
            .setStyle("PRIMARY")
            .setLabel("Rouge")
            .setCustomId(`game_uno_${interaction.user.id}_${gameId}_ephemeral_red_newColor_noSkip`)

        const green = new MessageButton()
            .setStyle("PRIMARY")
            .setLabel("Vert")
            .setCustomId(`game_uno_${interaction.user.id}_${gameId}_ephemeral_green_newColor_noSkip`)

        const blue = new MessageButton()
            .setStyle("PRIMARY")
            .setLabel("Bleu")
            .setCustomId(`game_uno_${interaction.user.id}_${gameId}_ephemeral_blue_newColor_noSkip`)

        const yellow = new MessageButton()
            .setStyle("PRIMARY")
            .setLabel("Jaune")
            .setCustomId(`game_uno_${interaction.user.id}_${gameId}_ephemeral_yellow_newColor_noSkip`)

        actualUserTurn.pendingButtons = {
            disable: true,
            buttons: new MessageActionRow().addComponents(red, green, blue, yellow)
        }
    } else if (actualCardNumber === "switch") {
        if (players.length === 2) {
            actualUserTurn.isTurn = false

            turn = switchTurn(playersData, turn, 1, clockwise)
            const newUserTurn = userTurn(turn)

            newUserTurn.isTurn = true

            actualUserTurn = newUserTurn
        }

        clockwise = clockwise ? false : true
    } else if (actualCardNumber === "skip") {
        actualUserTurn.isTurn = false
        
        turn = switchTurn(playersData, turn, 1, clockwise)
        const newUserTurn = userTurn(turn)

        newUserTurn.isTurn = true

        actualUserTurn = newUserTurn
    }

    const seen_card = new MessageButton()
        .setStyle("PRIMARY")
        .setLabel("Voir mes cartes")
        .setCustomId(`game_uno_${interaction.user.id}_${gameId}_seenCard_0`)

    const seenCardComponent = new MessageActionRow().addComponents(seen_card)

    await msg.edit({
        content: `${Object.values(playersData).map(user => `${user.user.username} ${user.cards.length === 1 ? "Uno !" : user.cards.length + " cartes"}`).join("\n")}\n\nAu tour de ${actualUserTurn.user.username}\nCarte actuelle : ${getEmojiCard(actualCard).fullEmoji}`,
        components: [ seenCardComponent ]
    })

    const collector = await msg.createMessageComponentCollector({ componentType: "BUTTON" })

    collector.on("collect", async(button) => {
        if (!button.user) await button.user.fetch()

        if (!Object.keys(playersData).includes(button.user.id)) return await button.reply({
            content: "Ce n'est pas votre partie dsl",
            ephemeral: true
        })
    
        const id = button.customId.split("_")

        if (id[id.length - 2] === "seenCard") {
            const disable = playersData[button.user.id]?.pendingButtons?.disable === true ? true : false
            const { buttons } = genButtons({ interaction, playersData, userId: button.user.id, gameId, actualCard, disable })
            const rows = makeRows({ buttonsData: buttons, gameData, page: playersData[button.user.id].page, interaction, gameId, disable })

            if (playersData[button.user.id]?.pendingButtons?.buttons) rows.push(playersData[button.user.id]?.pendingButtons?.buttons)

            await button.reply({
                content: "Voici vos cartes, faites gaffe a bien **garder** ce message !",
                components: rows,
                ephemeral: true
            })

            if (playersData[button.user.id]?.pendingButtons?.disable) playersData[button.user.id].pendingButtons = {}
            playersData[button.user.id].reply = button

            return true
        }
    })

    return await client.games.uno.set(gameId, { interaction, msg, gameData, i18n, cards, players, playersData, turn, actualCard, clockwise })
}

function removeCard(cardsConfig, userCards, cardToRemove) {
    let filtered = false

    const cards = userCards.filter(card => {
        if (card !== cardToRemove) return true

        if (!filtered && card === cardToRemove) {
            filtered = true
        
            return false
        }

        return true
    })

    const [cardColor, cardNumber] = cardToRemove.split("_")

    cardsConfig[cardColor][cardNumber] = cardsConfig[cardColor][cardNumber] + 1

    return cards
}

function makeRows({ buttonsData, gameData, page, interaction, gameId, disable }) {
    const maxRow = 3
    const maxInRow = 5
    const maxPage = Math.round(buttonsData.length / 15)

    const draw = new MessageButton()
        .setStyle("DANGER")
        .setLabel("Piocher")
        .setCustomId(`game_uno_${interaction.user.id}_${gameId}_playCard_ephemeral_draw_0`)
        .setDisabled(disable ?? false)

    const play = new MessageButton()
        .setStyle("SUCCESS")
        .setLabel("Jouer")
        .setCustomId(`game_uno_${interaction.user.id}_${gameId}_playCard_ephemeral_play_0`)
        .setDisabled(disable ?? false)

    if (page > maxPage) page = 0

    if (buttonsData.slice((maxInRow * maxRow) * page, (maxInRow * maxRow) * (page + 1)).length > 0) buttonsData = buttonsData.slice((maxInRow * maxRow) * page, (maxInRow * maxRow) * (page + 1))

    function splitIntoChunk(arr, chunk) {
        let arrays = []

        for (let i = 0; i < arr.length; i += chunk) {
            let tempArray;
            tempArray = arr.slice(i, i + chunk);
            arrays.push(tempArray)
        }

        return arrays
    }

    let arrays = splitIntoChunk(buttonsData, maxInRow);

    let i = 0
    let ActionRow = []

    for (const buttons of arrays) {
        if (i >= maxRow) break
            
        let row = new MessageActionRow()

        for (const button of buttons) row.addComponents(button)

        ActionRow.push(row)
        i++
    }

    let arrowsComponent = false
    if (i >= maxRow || page !== 0) {
        const arrowsLeftButtons = new MessageButton()
            .setEmoji("◀️")
            .setStyle("SECONDARY")
            .setCustomId(`game_uno_${interaction.user.id}_${gameId}_ephemeral_page_${page - 1}`)
            .setDisabled(page - 1 < 0)

        const arrowsRightButtons = new MessageButton()
            .setEmoji("▶️")
            .setStyle("SECONDARY")
            .setCustomId(`game_uno_${interaction.user.id}_${gameId}_ephemeral_page_${page + 1}`)
            .setDisabled(!(page + 1 <= maxPage))
    
        arrowsComponent = new MessageActionRow().addComponents(arrowsLeftButtons, arrowsRightButtons, draw)

        ActionRow.push(arrowsComponent)
    }

    const drawComponent = new MessageActionRow().addComponents(draw)

    if (gameData.config.multipleCard) arrowsComponent ? arrowsComponent.addComponents(play) : drawComponent.addComponents(play)

    if (!arrowsComponent) ActionRow.push(drawComponent)

    return ActionRow
}

function genCard({ cards, filter }) {
    let generatedCard = ""
    let typeColor = ["blue", "red", "yellow", "green", "special"]
    let color = typeColor[Math.floor(Math.random() * typeColor.length)]

    generatedCard += color + "_"

    let typeNumber = color === "special" ? ["addFour", "newColor"] : ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "skip", "switch", "addTwo"]
    let number = typeNumber[Math.floor(Math.random() * typeNumber.length)]

    generatedCard += number

    if (!cards?.[color]?.[number] || (cards[color][number] - 1) <= 0 || filter?.includes(number)) return genCard({ cards, filter })

    cards[color][number] = cards[color][number] - 1

    return { cards, generatedCard }
}

function genButtons({ interaction, playersData, userId, gameId, actualCard, disable }) {
    const buttons = []

    const cards = sortCard(playersData[userId].cards)

    for (let i = 0; i < cards.length; i++) {
        const buttonCard = new MessageButton()
            .setStyle(playersData[userId].activeCard.map(actCard => actCard.split("-")[0]).includes(`${cards[i]}_${i}`) ? "SUCCESS" : "PRIMARY")
            .setCustomId(`game_uno_${interaction.user.id}_${gameId}_playCard_ephemeral_${cards[i]}_${i}`)
            .setDisabled(disable ?? false)

        const emoji = getEmojiCard(cards[i])

        if (emoji !== cards[i]) {
            buttonCard.setEmoji(emoji.emojiId)
        } else {
            buttonCard.setLabel(cards[i])
        }

        buttons.push(buttonCard)
    }

    return { buttons }
}

function sortCard(cards) {
    function sortByLength(a, b) {
        const [colorA] = a[0].split("_")
        const [colorB] = b[0].split("_")

        const valueA = colorA === "special" ? Infinity : a.length
        const valueB = colorB === "special" ? Infinity : b.length

        if (valueA > valueB) {
            return -1
        } else if (valueA < valueB) {
            return 1
        } else return 0
    }

    function sortByNumber(a, b) {
        const number = {
            switch: 12,
            skip: 11,
            addTwo: 10
        }

        const [, numberA] = a.split("_")
        const [, numberB] = b.split("_")
    
        const valueA = number[numberA] ?? numberA
        const valueB = number[numberB] ?? numberB

        if (valueA > valueB) {
            return -1
        } else if (valueA < valueB) {
            return 1
        } else return 0
    }

    const colors = ["special", "blue", "red", "yellow", "green"]
    let card = []

    //* Regroup by color
    for (let i = 0; i < colors.length; i++) {
        const filteredCard = cards.filter(x => x.split("_")[0] === colors[i])
    
        if (filteredCard.length > 0) card.push(filteredCard)
    }

    let sortedCard = card.sort(sortByLength)
    card = []

    //* Sort by number inside array
    for (let i = 0; i < sortedCard.length; i++) sortedCard[i].sort(sortByNumber)

    //* Concact
    for (let i = 0; i < sortedCard.length; i++) card = card.concat(sortedCard[i])

    return card
}

function getEmojiCard(cardId) {
    const fullEmoji = cardId
        .replace("special_newColor", "<:Changecouleur:872421154126725161>")
        .replace("special_addFour", "<:Plus4:872421153916985375>")

        .replace("blue_0", "<:0Bleu:872421154218979379>")
        .replace("blue_1", "<:1Bleu:872421154315460629>")
        .replace("blue_2", "<:2Bleu:872421154239967242>")
        .replace("blue_3", "<:3Bleu:872421153866678273>")
        .replace("blue_4", "<:4Bleu:872421154298675200>")
        .replace("blue_5", "<:5Bleu:872421154273517638>")
        .replace("blue_6", "<:6Bleu:872421154260918282>")
        .replace("blue_7", "<:7Bleu:872421154273505290>")
        .replace("blue_8", "<:8Bleu:872421154336436245>")
        .replace("blue_9", "<:9Bleu:872424902601371659>")
        .replace("blue_addTwo", "<:Plus2Bleu:872421153891815465>")
        .replace("blue_skip", "<:PassetourBleu:872424902471331870>")
        .replace("blue_switch", "<:ChangesensBleu:872421154105724970>")
        .replace("blue", "<:Bleu:872567867625861121>")
        
        .replace("yellow_0", "<:0Jaune:872421154218987530>")
        .replace("yellow_1", "<:1Jaune:872421154252529664>")
        .replace("yellow_2", "<:2Jaune:872421154218975253>")
        .replace("yellow_3", "<:3Jaune:872421154349015070>")
        .replace("yellow_4", "<:4Jaune:872421154244149318>")
        .replace("yellow_5", "<:5Jaune:872421154386739220>")
        .replace("yellow_6", "<:6Jaune:872421153912811551>")
        .replace("yellow_7", "<:7Jaune:872421154164469812>")
        .replace("yellow_8", "<:8Jaune:872421154147667989>")
        .replace("yellow_9", "<:9Jaune:872421154353201192>")
        .replace("yellow_addTwo", "<:Plus2Jaune:872421154340626442>")
        .replace("yellow_skip", "<:PassetourJaune:872421154365767690>")
        .replace("yellow_switch", "<:ChangesensJaune:872421154147672095>")
        .replace("yellow", "<:Jaune:872567868062072842>")
        
        .replace("red_0", "<:0Rouge:872421154189606962>")
        .replace("red_1", "<:1Rouge:872421153791168513>")
        .replace("red_2", "<:2Rouge:872421154344820786>")
        .replace("red_3", "<:3Rouge:872421154239963177>")
        .replace("red_4", "<:4Rouge:872424902517481552>")
        .replace("red_5", "<:5Rouge:872421154273505300>")
        .replace("red_6", "<:6Rouge:872421154311270470>")
        .replace("red_7", "<:7Rouge:872421154420326410>")
        .replace("red_8", "<:8Rouge:872421154034417715>")
        .replace("red_9", "<:9Rouge:872421154361581598>")
        .replace("red_addTwo", "<:Plus2Rouge:872421154281898024>")
        .replace("red_skip", "<:PassetourRouge:872424902056099871>")
        .replace("red_switch", "<:ChangesensRouge:872421154252533811>")
        .replace("red", "<:Rouge:872567867902685224>")

        .replace("green_0", "<:0Vert:872421154223194172>")
        .replace("green_1", "<:1Vert:872421153879236639>")
        .replace("green_2", "<:2Vert:872421154336423987>")
        .replace("green_3", "<:3Vert:872421154143481967>")
        .replace("green_4", "<:4Vert:872421154328023040>")
        .replace("green_5", "<:5Vert:872421154265120798>")
        .replace("green_6", "<:6Vert:872421154290298891>")
        .replace("green_7", "<:7Vert:872421154059616328>")
        .replace("green_8", "<:8Vert:872421154399326218>")
        .replace("green_9", "<:9Vert:872421154181251103>")
        .replace("green_addTwo", "<:Plus2Vert:872421154206416916>")
        .replace("green_skip", "<:PassetourVert:872421154151874591>")
        .replace("green_switch", "<:ChangesensVert:872421154378362900>")
        .replace("green", "<:Vert:872567867713925222>")
        
    const regex = new RegExp(/<:((?:[a-zA-Z]+)?(?:[0-9]+)?(?:[a-zA-Z]+)?(?:[0-9])?):([0-9]+)>/g)
    const [emojiName, emojiId] = fullEmoji.split(regex).filter((str) => /\S/.test(str))

    return { cardId, emojiId, emojiName, fullEmoji }
}

function switchTurn(playersData, turn, toAdd, clockwise) {
    const players = Object.keys(playersData)
        
    if (!clockwise) toAdd = players.length - toAdd
        
    if (players[turn + toAdd]) return turn + toAdd

    return (turn - players.length) + toAdd
}

/*
! Test zone

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
        consolee.log(1)

        if (!object[i]) return switchTurn(turn, toAdd - i, sign)
    }

    consolee.log(0, number)

    return object[number]
}

consolee.log(switchTurn(1, 1, { sign: "-" }))
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