import fs from "fs"
import Canvas from "canvas"
import { resolve } from "path"

let players = [
    {
        id: 1,
        username: "Player 1",
        money: 1000,
        color: "#A4161A",
        caseNumber: 0,
        isTurn: true
    }, {
        id: 2,
        username: "Player 2",
        money: 1000,
        color: "#8AC926",
        caseNumber: 0,
        isTurn: false
    }, {
        id: 3,
        username: "Player 3",
        money: 1000,
        color: "#FFCA3A",
        caseNumber: 0,
        isTurn: false
    }, {
        id: 4,
        username: "Player 4",
        money: 1000,
        color: "#1982C4",
        caseNumber: 0,
        isTurn: false
    }
]

const cities = {
    "Montain": [{
        name: "MontFuji",
        price: 0,
        prices: [
            "50K",
            "100K",
            "150K",
            "200K"
        ]
    }, {
        name: "MontBlanc",
        price: 0,
        prices: [
            "50K",
            "100K",
            "150K",
            "200K"
        ]
    }, {
        name: "Everest",
        price: 0,
        prices: [
            "50K",
            "100K",
            "150K",
            "200K"
        ]
    }, {
        name: "Machapuchare",
        price: 0,
        prices: [
            "50K",
            "100K",
            "150K",
            "200K"
        ]
    }],
    "USA": [{
        name: "NewYork",
        price: 0,
        prices: [],
        houses: 0,
        hotels: 0,
        owner: null
    }, {
        name: "LasVegas",
        price: 0,
        prices: [],
        houses: 1,
        hotels: 0,
        owner: null
    }, {
        name: "Washington",
        price: 0,
        prices: [],
        houses: 2,
        hotels: 0,
        owner: null
    }],
    "Italy": [{
        name: "Rome",
        price: 0,
        prices: [],
        houses: 1,
        hotels: 0,
        owner: players[0]
    }, {
        name: "Florence",
        price: 0,
        prices: [],
        houses: 2,
        hotels: 0,
        owner: players[1]
    }, {
        name: "Naples",
        price: 0,
        prices: [],
        houses: 3,
        hotels: 0,
        owner: players[2]
    }],
    "Greece": [{
        name: "Athenes",
        price: 0,
        prices: [],
        houses: 4,
        hotels: 0,
        owner: players[3]
    }, {
        name: "Corinthe",
        price: 0,
        prices: [],
        houses: 0,
        hotels: 1,
        owner: players[1]
    }, {
        name: "NomConnuGrece",
        price: 0,
        prices: [],
        houses: 0,
        hotels: 0,
        owner: null
    }],
    "France": [{
        name: "Lyon",
        price: 0,
        prices: [],
        houses: 3,
        hotels: 0,
        owner: null
    }, {
        name: "Paris",
        price: 0,
        prices: [],
        houses: 0,
        hotels: 0,
        owner: null
    }],
    "Mexico": [{
        name: "Mexico",
        price: 0,
        prices: [],
        houses: 2,
        hotels: 0,
        owner: null
    }, {
        name: "Cancun",
        price: 0,
        prices: [],
        houses: 3,
        hotels: 0,
        owner: null
    }],
    "Argentine": [{
        name: "BuenosAires",
        price: 0,
        prices: [],
        houses: 0,
        hotels: 0,
        owner: null
    }, {
        name: "Cordoba",
        price: 0,
        prices: [],
        houses: 0,
        hotels: 0,
        owner: null
    }, {
        name: "Salta",
        price: 0,
        prices: [],
        houses: 1,
        hotels: 0,
        owner: null
    }],
    "Canada": [{
        name: "Montreal",
        price: 0,
        prices: [],
        houses: 1,
        hotels: 0,
        owner: null
    }, {
        name: "Quebec",
        price: 0,
        prices: [],
        houses: 2,
        hotels: 0,
        owner: null
    }],
    "Portugal": [{
        name: "Porto",
        price: 0,
        prices: [],
        houses: 0,
        hotels: 0,
        owner: null
    }, {
        name: "Lisbone",
        price: 0,
        prices: [],
        houses: 3,
        hotels: 0,
        owner: null
    }]
}

let board = [
    [{ caseNumber: 16, isCorner: true }, { type: "empty" }, { type: "empty" }, { caseNumber: 17, type: "city", cityData: cities["Portugal"][0] }, { caseNumber: 18, type: "luck" }, { caseNumber: 19, type: "city", cityData: cities["Portugal"][1] }, { caseNumber: 20, type: "montain", cityData: cities["Montain"][2] }, { caseNumber: 21, type: "city", cityData: cities["USA"][0] }, { caseNumber: 22, type: "city", cityData: cities["USA"][1] }, { caseNumber: 23, type: "city", cityData: cities["USA"][2] }, { caseNumber: 24, isCorner: true }], // 1
    [{ caseNumber: 15, type: "city", cityData: cities["Mexico"][1] }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }], // 2
    [{ caseNumber: 14, type: "luck" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }], // 3
    [{ caseNumber: 13, type: "city", cityData: cities["Mexico"][0] }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { caseNumber: 25, type: "montain", cityData: cities["Montain"][3] }], // 4
    [{ caseNumber: 12, type: "montain", cityData: cities["Montain"][1] }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { caseNumber: 26, type: "city", cityData: cities["Canada"][0] }], // 5
    [{ caseNumber: 11, type: "city", cityData: cities["Argentine"][2] }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { caseNumber: 27, type: "city", cityData: cities["Canada"][1] }], // 6
    [{ caseNumber: 10, type: "city", cityData: cities["Argentine"][1] }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { caseNumber: 28, type: "luck" }], // 7
    [{ caseNumber: 9, type: "city", cityData: cities["Argentine"][0] }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { caseNumber: 29, type: "city", cityData: cities["France"][0] }], // 8
    [{ type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { caseNumber: 30, type: "tax" }], // 9
    [{ type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { caseNumber: 31, type: "city", cityData: cities["France"][1] }], // 10
    [{ type: "jail", caseNumber: 8, isCorner: true }, { type: "empty" }, { type: "empty" }, { caseNumber: 7, cityData: cities["Greece"][2], type: "city" }, { caseNumber: 6, cityData: cities["Greece"][1], type: "city" }, { caseNumber: 5, cityData: cities["Greece"][0], type: "city" }, { type: "montain", cityData: cities["Montain"][0], caseNumber: 4 }, { type: "city", cityData: cities["Italy"][2], caseNumber: 3 }, { type: "city", cityData: cities["Italy"][1], caseNumber: 2 }, { type: "city", cityData: cities["Italy"][0], caseNumber: 1 }, { type: "start", caseNumber: 0, isCorner: true }] // 11
]

async function genBoard(board) {
    const width = 440 * 10
    const height = 440 * 10
    const size = width / board.length
    const fontSize = size * 2 / 10
    const addTop = fontSize + fontSize / 2

    Canvas.registerFont(resolve("../../assets/fonts/Roboto/Roboto-Bold.ttf"), { family: "Roboto Bold" })

    const canvas = Canvas.createCanvas(width, height)
    const ctx = canvas.getContext("2d")

    // Quality
    ctx.imageSmoothingEnabled = false

    // Background
    const background = await Canvas.loadImage("../../assets/board.svg")
    ctx.drawImage(background, 0, 0, width, height)

    // Draw at the center of the board the money of the player
    for (let i = 0; i < players.length; i++) {
        const player = players[i]

        ctx.font = `${fontSize}px Roboto Bold`
        ctx.fillStyle = "white"
        ctx.textAlign = "center"
        ctx.fillText(`${player.username} : ${player.money}`, width / 2, height / 2 + addTop * i)
    }

    let x = 0, y = 0
    for (let i = 0; i < board.length; i++) {
        const row = board[i]

        for (let j = 0; j < row.length; j++) {
            const caseData = row[j]

            if (!(caseData.isCorner && j === 10 && i === 10)) {
                // Center text
                if (i === 0) y += size + addTop
                if (i === 10) x -= size, y -= addTop
                if (j === 0) x = size + addTop, y += size * 2
                if (j === 10) x -= addTop

                // Align text
                ctx.textAlign = "center"
                if (i === 0) x -= size / 2
                if (j === 0) y += size / 2
                if (i === 10) x += size / 2
                if (j === 10) y -= size / 2            
            }

            if (["montain", "city"].includes(caseData.type)) {
                const { name, price, prices, owner } = caseData.cityData || {}

                const fillStyle = owner ? owner.color : "#000"

                // Write city name
                ctx.font = `bold ${fontSize}px 'Roboto Bold'`
                ctx.fillStyle = fillStyle

                // City name
                if (caseData.type === "city") {
                    ctx.save()
                    ctx.translate(x, y)
                    ctx.rotate(i === 0 ? Math.PI : j === 0 ? Math.PI / 2 : j === row.length - 1 ? -Math.PI / 2 : 0)
                    ctx.fillText(name ?? "Nom", 0, 0)
                    ctx.restore()
                } else {
                    // Montain name
                    let copyX = x, copyY = y

                    if (i === 0) copyY -= size / 2 + addTop
                    if (j === 0) copyX -= size / 2 + addTop
                    if (i === 10) copyY += size / 2 + addTop
                    if (j === 10) copyX += size / 2 + addTop

                    ctx.save()
                    ctx.translate(copyX, copyY)
                    ctx.rotate(i === 0 ? Math.PI : j === 0 ? Math.PI / 2 : j === row.length - 1 ? -Math.PI / 2 : 0)
                    ctx.fillText(name ?? "Nom", 0, 0)
                    ctx.restore()
                }

                // City price
                let copyX = x, copyY = y
                if (i === 0) copyY -= size + addTop - 10
                if (j === 0) copyX -= size + addTop - 10
                if (i === 10) copyY += size + addTop - 10
                if (j === 10) copyX += size + addTop - 10

                ctx.save()
                ctx.translate(copyX, copyY)
                ctx.rotate(i === 0 ? Math.PI : j === 0 ? Math.PI / 2 : j === row.length - 1 ? -Math.PI / 2 : 0)
                ctx.fillText(prices[price] ?? "0", 0, 0)
                ctx.restore()

                // Check houses and hotels
                if (caseData.cityData.houses > 0 || caseData.cityData.hotels > 0) {
                    let number = caseData.cityData.houses + caseData.cityData.hotels
                    for (let k = 0; k < number; k++) {
                        if (caseData.cityData.houses === 4 && k !== 3) continue

                        const path = 
                            caseData.cityData.houses === 4 ? "../../assets/house-3.svg" : 
                            caseData.cityData.houses >= 1 ? "../../assets/house.svg" : "../../assets/hotel.svg"
                        
                        const image = fs.readFileSync(path, "utf8")

                        const img = new Canvas.Image()
                        const copyImage = image.replace(/white/g, fillStyle)
                        img.src = "data:image/svg+xml;charset=utf-8," + copyImage

                        const imageSize = size / 4

                        let copyX = x, copyY = y, center = 0

                        if (caseData.cityData.houses === 1 || caseData.cityData.hotels === 1) center += imageSize / 2
                        if (caseData.cityData.houses === 3) center -= imageSize / 2
                        if (caseData.cityData.houses === 4) center -= imageSize * 2.5

                        if (i === 0) copyX += k * imageSize + center, copyY += addTop + imageSize
                        if (i === 10) copyX -= k * imageSize + center, copyY -= addTop + imageSize
                        if (j === 0) copyY -= k * imageSize + center, copyX += addTop + imageSize
                        if (j === 10) copyY += k * imageSize + center, copyX -= addTop + imageSize

                        ctx.save()
                        ctx.translate(copyX, copyY)
                        ctx.rotate(i === 0 ? Math.PI : j === 0 ? Math.PI / 2 : j === row.length - 1 ? -Math.PI / 2 : 0)
                        ctx.drawImage(img, 0, 0, imageSize, imageSize)
                        ctx.restore()
                    }
                }
            }

            // Player
            const playersData = caseData.players || 0

            if (caseData.isCorner && i === 10 && j === 10) x -= size / 4, y -= size / 4
            if (caseData.isCorner && i === 10 && j === 0) x -= size, y -= size + addTop 
            if (caseData.isCorner && i === 0 && j === 0) y -= size * 3
            if (caseData.isCorner && i === 0 && j === 10) x += size / 2
            if (!caseData.isCorner && i === 0) x -= size / 4, y -= size - addTop + 10
            if (!caseData.isCorner && j === 0) x -= size - addTop + 10, y -= size / 4
            if (!caseData.isCorner && i === 10) x -= size / 4, y += size / 4
            if (!caseData.isCorner && j === 10) x += size / 4, y -= size / 4

            for (let k = 0; k < playersData.length; k++) {
                const player = playersData[k]

                let copyX = x, copyY = y, l = 1
                if (k !== 2) copyX += (k === 3 ? 1 : k) * (size / 2)
                if (k >= 2) copyY += l * (size / 2), l += 1

                // Draw a circle with the player's color
                ctx.beginPath()
                ctx.arc(copyX, copyY, size * 2 / 10, 0, 2 * Math.PI)
                ctx.fillStyle = player.color
                ctx.fill()
                ctx.closePath()
            }

            x = caseData.isCorner ? (size * 2) + (j * (size * 2)) : size + (j * size)
            y = caseData.isCorner ? (i * (size * 2)) : (i * size)
        }
    }

    // Save the image
    const buffer = canvas.toBuffer("image/jpeg")
    fs.writeFileSync("../../assets/board-result.png", buffer)
}

function randomNumber(min = 1, max = 6) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function movePlayer({ player, board, number, strict = false }) {
    let actualCase = player.caseNumber

    // Remove from the old case
    let oldCase = findCase(board, actualCase)
    if (!oldCase.players) oldCase.players = []
    oldCase.players = oldCase.players.filter(p => p.id !== player.id)

    for (let i = 0; i < number; i++) {
        actualCase += 1

        if (actualCase > 31) actualCase = 0
    }

    if (strict) actualCase = number

    // Add to the new case
    let newCase = findCase(board, actualCase)

    if (!newCase.players) newCase.players = []
    newCase.players.push(player)

    player.caseNumber = actualCase

    return player
}

function findCase(board, number) {
    let findedCase = null

    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j].caseNumber === number) {
                findedCase = board[i][j]
                break
            }
        }
    }

    if (!findedCase) {
        console.log(`CaseNumber ${number} not found`)
        
        return board[10][10]
    }

    return findedCase
}

async function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function main() {
    // Place the players
    for (let i = 0; i < players.length; i++) movePlayer({ player: players[i], board, number: players[i].caseNumber, strict: true })

    // Draw the board
    genBoard(board)

    for (let i = 1; i < 41; i++) {
        await wait(3000)
        console.log(`${i} / 41`)
        movePlayer({ player: players[0], board, number: 1 })
        genBoard(board)
    }
}

main()