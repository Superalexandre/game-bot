/*
Villes : 
    - Portugal : 1
        - Lisbone
        - Porto
        - Sintra
    - France : 2
        - Paris
        - Lyon
        - Marseille
    - Mexique : 3
        - Mexico
        - Cancun
        - Acapulco
    - Argentine : 4
        - Buenos Aires
        - Cordoba
        - Salta
    - Canada : 5
        - Toronto
        - Montreal
        - Quebec
    - Etats-Unis : 6
        - Washington
        - New York
        - Las Vegas
    - Grèce : 7
        - Athènes
        - Corinthe
    - Italie : 8
        - Rome
        - Florence
        - Naples
*/
import fs from "fs"
import Canvas from "canvas"
import { resolve } from "path"

const players = [
    { color: "#A4161A" }, 
    { color: "#8AC926" }, 
    { color: "#FFCA3A" }, 
    { color: "#1982C4" }
]

const cities = {
    "USA": {
        "Washington": {
            prices: []
        }
    }
}

const board = [
    [{ caseNumber: 20, players: [], isCorner: true }, { caseNumber: 21, players: [] }, { caseNumber: 22, players: [] }, { caseNumber: 23, players: [] }, { caseNumber: 24, players: [] }, { caseNumber: 25, players: [] }, { caseNumber: 26, players: [] }, { caseNumber: 27, players: [] }, { caseNumber: 28, players: players, type: "city", cityData: { name: "New York" }, price: "250K" }, { caseNumber: 29, players: [], type: "city", cityData: { name: "Washington" }, price: "250K" }, { caseNumber: 30, players: [], isCorner: true }], // 1
    [{ caseNumber: 19, players: [], type: "city", cityData: { name: "Mexico" }, price: "200K" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { caseNumber: 31, players: [] }], // 2
    [{ caseNumber: 18, players: [], type: "luck" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { caseNumber: 32, players: [] }], // 3
    [{ caseNumber: 17, players: [], type: "city", cityData: { name: "Cancun", price: "150K" } }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { caseNumber: 33, players: [] }], // 4
    [{ caseNumber: 16, players: [] }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { caseNumber: 34, players: [], type: "city", cityData: { name: "Montreal" }, price: "300K" }], // 5
    [{ caseNumber: 15, players: [] }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { caseNumber: 35, players: [], type: "city", cityData: { name: "Quebec" }, price: "300K" }], // 6
    [{ caseNumber: 14, players: [] }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { caseNumber: 36, players: [], type: "luck" }], // 7
    [{ caseNumber: 13, players: [] }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { caseNumber: 38, players: [] }], // 8
    [{ caseNumber: 12, players: [] }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { caseNumber: 39, players: [], type: "tax" }], // 9
    [{ caseNumber: 11, players: [] }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { caseNumber: 40, players: players, type: "city", cityData: { name: "Paris" }, price: "500K" }], // 10
    [{ type: "jail", caseNumber: 10, players: [], isCorner: true }, { caseNumber: 9, players: [] }, { caseNumber: 8, players: [] }, { caseNumber: 7, players: [] }, { caseNumber: 6, players: [] }, { caseNumber: 5, players: [] }, { type: "montain", caseNumber: 4, players: players }, { type: "city", cityData: { name: "Naples" }, price: "85K", caseNumber: 3, players: [] }, { type: "city", cityData: { name: "Florence" }, price: "90K", caseNumber: 2, players: [] }, { type: "city", cityData: { name: "Rome" }, price: "100K", caseNumber: 1, players: players }, { type: "start", caseNumber: 0, players: players, isCorner: true }] // 11
]

/*
- TODO :
    - Ajouter les hotels/maisons
*/

async function genBoard(board) {
    const width = 440 * 4
    const height = 440 * 4
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
    
    let x = 0, y = 0
    for (let i = 0; i < board.length; i++) {
        const row = board[i]

        for (let j = 0; j < row.length; j++) {
            const caseData = row[j]

            if (["montain", "city"].includes(caseData.type)) {
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

            if (caseData.type === "city") {
                const price = caseData.price
                const { name } = caseData.cityData || {}
                
                // Write city name
                ctx.font = `bold ${fontSize}px 'Roboto Bold'`
                ctx.fillStyle = "#000"
                
                // City name
                ctx.save()
                ctx.translate(x, y)
                ctx.rotate(i === 0 ? Math.PI : j === 0 ? Math.PI / 2 : j === row.length - 1 ? -Math.PI / 2 : 0)
                ctx.fillText(name ?? "Nom", 0, 0)
                ctx.restore()

                // City price
                let copyX = x, copyY = y
                if (i === 0) copyY -= size + addTop - 10
                if (j === 0) copyX -= size + addTop - 10
                if (i === 10) copyY += size + addTop - 10
                if (j === 10) copyX += size + addTop - 10

                ctx.save()
                ctx.translate(copyX, copyY)
                ctx.rotate(i === 0 ? Math.PI : j === 0 ? Math.PI / 2 : j === row.length - 1 ? -Math.PI / 2 : 0)
                ctx.fillText(price ?? "0", 0, 0)
                ctx.restore()
            }

            const playersData = caseData.players || 0
            
            if (caseData.isCorner) x -= size / 4, y -= size / 4
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
    const buffer = canvas.toBuffer("image/png")
    fs.writeFileSync("../../assets/board-result.png", buffer)
}

genBoard(board)