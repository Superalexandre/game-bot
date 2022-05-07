import express, { json, urlencoded, static as staticExpress } from "express"
import { resolve, join, dirname } from "path"
import cookieParser from "cookie-parser"
import cookie from "cookie"
import cors from "cors"
import session from "express-session"
import passport from "passport"
import config from "../config.js"
import * as functions from "../functions.js"
import ejs from "ejs"
import { fileURLToPath } from "url"
import Logger from "../logger.js"
import i18n, { I18n } from "i18n"
import routerApi from "./router/api.js"
import fs from "fs"
import { checkAccount } from "./checkAccount/checkAccount.js"

import https from "https"
import http from "http"
import { Server } from "socket.io"

import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100, 
    standardHeaders: true,
    legacyHeaders: false
})

const logger = new Logger({
    plateform: "Dashboard"
})

async function init({ data, clients }) {
    const app = express()
    const __dirname = dirname(fileURLToPath(import.meta.url))

    app
        .engine("html", ejs.renderFile)
        .set("view engine", "ejs")
        .set("views", join(__dirname, "/views"))
        .use("/public", staticExpress(join(__dirname, "/public")))
        .use(limiter)
        .use(cookieParser())
        .use(cors())
        .use(json())
        .use(urlencoded({ extended: false }))
        .use(session({ 
            secret: config.dashboard.secret,
            resave: false,
            saveUninitialized: false,
            cookie: {
                // One year 
                maxAge: 1000 * 60 * 60 * 24 * 365
            }
        }))
        .use(passport.initialize())
        .use(passport.session())
        .use(i18n.init)
        .use(async(req, res, next) => {
            if (!req.session.messages) req.session.messages = []
            if (!req.session.redirect) req.session.redirect = []

            req.instaClient = clients?.instaClient
            req.discordClient = clients?.discord
            req.logger = logger
            req.data = data
            req.config = config
            req.functions = functions

            const colors = ["red", "green", "blue", "yellow"]
            req.color = colors[Math.floor(Math.random() * colors.length)]
            req.user = req.session.user
            
            if (req.session.user) {
                const profileData = await data.users.get(req.user.profileData.accountId)
                
                if (!profileData) {
                    req.user = null
                    req.session.destroy()
                    
                    req.session.messages.push({
                        type: "error",
                        message: res.__("dashboard.errors.relogin")
                    })

                    return res.redirect("/")
                }

                req.session.user.profileData = profileData
            }
  
            if (!i18n.getLocales().includes(req.cookies.lang)) {
                res.cookie("lang", "fr-FR", {
                    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
                    httpOnly: true,
                    secure: true
                })
            }

            res.setLocale(req.cookies.lang ?? "fr-FR")
            
            req.session.redirect.push(req.url)

            next()
        })
        .get("/", (req, res) => {
            res.render("index", {
                req, res, i18n
            })
        })
        .get("/terms", (req, res) => {
            res.render("terms", {
                req, res, i18n
            })
        })
        .get("/privacy", (req, res) => {
            res.render("privacy", {
                req, res, i18n
            })
        })
        .get("/profile/settings", checkAccount, async(req, res) => {
            if (req.query && req.query.lang) {
                if (!i18n.getLocales().includes(req.query.lang)) {
                    await req.logger.error("Invalid lang")

                    req.session.messages.push({
                        type: "warn",
                        message: res.__("dashboard.profile.invalidLang")
                    })

                    return res.redirect("/profile/settings")
                }

                res.cookie("lang", req.query.lang, {
                    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
                    httpOnly: true,
                    secure: true
                })

                await data.users.set(req.user.profileData.accountId, req.query.lang, "lang")

                res.setLocale(req.query.lang)

                req.session.messages.push({
                    type: "success",
                    message: i18n.__("dashboard.profile.switchedLang")
                })

                return res.redirect("/profile/settings")
            }

            res.render("settings", {
                req,
                res,
                user: req.user,
                profileData: req.user.profileData,
                plateformData: req.user.profileData.plateformData,
                i18n
            })
        })
        .get("/profile/:id?", (req, res) => {
            if (req.params.id) {
                res.render("viewProfile", {
                    req, res, i18n
                })
            } else {
                if (!req.user) {
                    req.session.messages.push({
                        type: "warn",
                        message: res.__("dashboard.errors.mustBeLogin")
                    })

                    return res.redirect("/login")
                }

                res.render("profile", {
                    req,
                    res,
                    user: req.user,
                    profileData: req.user.profileData,
                    plateformData: req.user.profileData.plateformData,
                    i18n
                })
            }
        })
        .get("/statistics", checkAccount, (req, res) => {
            res.render("statistics", {
                req, 
                res, 
                i18n,
                profileData: req.user.profileData,
                plateformData: req.user.profileData.plateformData
            })
        })
        .get("/server/:id", (req, res) => {
            const server = req.discordClient.guilds.cache.get(req.params.id)

            if (!server) {
                req.session.messages.push({
                    type: "error",
                    message: res.__("dashboard.errors.serverNotFound")
                })

                return res.redirect("/")
            }

            res.render("server", {
                req, 
                res,
                server,
                i18n
            })
        })
        .get("/chat/:id", (req, res) => {
            const chat = req.instaClient.chats.cache.get(req.params.id)

            if (!chat) {
                req.session.messages.push({
                    type: "error",
                    message: res.__("dashboard.errors.chatNotFound")
                })

                return res.redirect("/")
            }

            res.redirect("/")
        })
        .get("/games/:id?", (req, res) => {
            if (!req.params.id) {
                return res.render("createGame", {
                    req, res, i18n
                })
            }
            
            const game = req.data.games.get(req.params.id)

            if (!game) {
                req.session.messages.push({
                    type: "error",
                    message: res.__("dashboard.errors.gameNotFound")
                })

                return res.redirect("/")
            }

            res.render("games", {
                req, 
                res,
                game,
                gameId: req.params.id,
                i18n
            })
        })
        .get("/login", (req, res) => {
            res.redirect("/api/discord/login")
        })
        .get("/admin", checkAccount, async(req, res) => {
            if (!config.discord.ownerIds.includes(req.user.id) && !config.instagram.ownerIds.includes(req.user.id)) {
                req.session.messages.push({
                    type: "error",
                    message: res.__("dashboard.errors.notAllowed")
                })

                return res.redirect("/login")
            }

            const JSONdata = await req.data.users.export()
            
            res.send(JSONdata)
        })
        .get("/invite", (_req, res) => {
            res.redirect("https://discord.com/oauth2/authorize?client_id=848272310557343795&scope=bot%20applications.commands&permissions=8&response_type=code&redirect_uri=http://localhost:3000/api/discord/callback")
        })
        .get("/sync/:code/:plateform", checkAccount, async(req, res) => {
            if (!req.params.code || !req.params.plateform) {
                req.session.messages.push({
                    type: "error",
                    message: res.__("dashboard.errors.occured")
                })

                return res.redirect("/profile")
            }

            if (!await req.data.sync.get(req.params.code)) {
                req.session.messages.push({
                    type: "error",
                    message: res.__("dashboard.sync.codeNotExist")
                })
                
                return res.redirect("/profile")
            }

            res.render("sync", {
                req, res, i18n,
                code: req.params.code,
                type: req.params.plateform
            })
        })
        .get("/play/:id?", async(req, res) => {
            if (!req.params.id) return res.redirect("/games")
            
            const game = req.data.games.get(req.params.id)

            if (!game) {
                req.session.messages.push({
                    type: "error",
                    message: res.__("dashboard.play.noGameFoundCreate")
                })

                return res.redirect("/games")
            }

            if (game.game === "puissance4") {
                if (!req.session.username) return res.redirect(`/join/${req.params.id}`)

                res.render("games/puissance4", {
                    req, res, i18n,
                    game, id: req.params.id
                })
            } else {
                req.session.messages.push({
                    type: "error",
                    message: res.__("dashboard.play.thisGameNotSupported")
                })

                await req.data.games.delete(game.id)

                return res.redirect("/games")
            }

        })
        .get("/join/:id?", async(req, res) => {
            if (!req.params.id) return res.redirect("/games")

            const game = req.data.games.get(req.params.id)

            if (!game) {
                req.session.messages.push({
                    type: "error",
                    message: res.__("dashboard.join.noGameFoundCreate")
                })

                return res.redirect("/games")
            }

            if (game.users.length >= game.maxPlayers) {
                req.session.messages.push({
                    type: "error",
                    message: res.__("dashboard.join.gameFull")
                })

                return res.redirect("/games")
            }

            res.render("join", {
                req, res, i18n,
                game, id: req.params.id
            })
        })
        .use("/api", routerApi)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
        .use((error, req, res, next) => {
            if (!error) return

            await logger.error(error.stack ?? error.toString())

            res?.status(error.statusCode ?? 500)?.render("error", {
                req, res, i18n,
                code: error.statusCode
            })
        })
        .use((req, res) => {
            req.session.messages.push({
                type: "info",
                message: res.__("dashboard.errors.pageNotFound")
            })

            res.redirect("/")
        })
      
    /* HTTPS */
    if (fs.existsSync(config.dashboard.key) && fs.existsSync(config.dashboard.cert) && fs.existsSync(config.dashboard.ca)) {
        const httpsServer = https.createServer({
            key: fs.readFileSync(resolve(config.dashboard.key)),
            cert: fs.readFileSync(resolve(config.dashboard.cert)),
            ca: fs.readFileSync(resolve(config.dashboard.ca))
        }, app)

        httpsServer.listen(config.dashboard.https, async() => {
            await logger.log("Serveur web HTTPS démarré port : " + config.dashboard.https)
        })
    } else await logger.warn("Serveur HTTPS pas lancé : aucune clé : key/cert/ca n'existe")

    const httpServer = http.createServer(app)

    const io = new Server(httpServer)

    io.on("connect", (socket) => {
        socket.i18n = new I18n(config.locale(logger))

        // Get language from cookie
        const cookies = socket.handshake.headers.cookie
        const parsedCookies = cookies ? cookie.parse(cookies) : {}
        const lang = parsedCookies.lang ?? config.defaultLocale

        // Init language
        socket.i18n.setLocale(lang)

        socket.on("join", async function(socketData) {
            if (!socketData || !socketData.gameId) return logger.error("Une erreur est survenue (no socket or gameId)")

            const game = await data.games.get(socketData.gameId)

            if (!game) {
                return socket.emit("error", {
                    message: socket.i18n.__("dashboard.connect4.noGameFound")
                })
            }

            if (game.users.length >= game.maxPlayers) {
                return socket.emit("error", {
                    message: socket.i18n.__("dashboard.connect4.gameFull")
                })
            }

            if (game.users.find(player => player.id === socket.id)) {
                return socket.emit("error", {
                    message: socket.i18n.__("dashboard.connect4.alreadyInGame")
                })
            }

            const player = {
                id: socket.id,
                rematch: false,
                username: socketData.username,
                color: game.users.length <= 0 ? "red" : "yellow",
                colorEmote: game.users.length <= 0 ? "🔴" : "🟡",
                winEmoji: game.users.length <= 0 ? "🔴_win" : "🟡_win",
                isTurn: game.users.length <= 0 ? true : false
            }

            data.games.push(socketData.gameId, player, "users")
            
            await socket.join(socketData.gameId)

            io.in(socketData.gameId).emit("joined", {
                id: socket.id,
                board: game.board,
                canStart: game.users.length === 1,
                isTurnId: game.users.find(player => player.isTurn)?.id,
                player,
                playerNumber: game.users.length + 1
            })

            socket.on("rematch", async function(socketRematchData) {
                if (!socketRematchData || !socketRematchData.gameId) return logger.error("Une erreur est survenue (no socket or gameId)")

                let game = await data.games.get(socketRematchData.gameId)

                if (!game) {
                    return socket.emit("error", {
                        message: socket.i18n.__("dashboard.connect4.noGameFound")
                    })
                }

                const player = game.users.find(player => player.id === socket.id)

                if (!player) {
                    return socket.emit("error", {
                        message: socket.i18n.__("dashboard.connect4.notInThisGame")
                    })
                }

                if (!game.finished) {
                    return socket.emit("error", {
                        message: socket.i18n.__("dashboard.connect4.isNotFinished")
                    })
                }

                const indexUser = game.users.findIndex(player => player.id === socket.id)
                await data.games.set(socketRematchData.gameId, true, `users.${indexUser}.rematch`)

                game = await data.games.get(socketRematchData.gameId)

                // Check if all players want to rematch
                if (game.users.length === game.users.filter(player => player.rematch).length) {
                    // Reset board
                    const board = [
                        ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
                        ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
                        ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
                        ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
                        ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"]
                    ]
                    
                    await data.games.set(socketRematchData.gameId, board, "board")
                    await data.games.set(socketRematchData.gameId, false, "finished")

                    let firstUser
                    // Reset users
                    for (let i = 0; i < game.users.length; i++) {
                        const user = game.users[i]

                        const newUser = {
                            ...user,
                            rematch: false,
                            isTurn: i === 0 ? true : false
                        }

                        if (i === 0) firstUser = newUser

                        await data.games.set(socketRematchData.gameId, newUser, `users.${i}`)
                    }
                    
                    io.in(socketRematchData.gameId).emit("rematch", {
                        type: "started"
                    })

                    return io.in(socketRematchData.gameId).emit("play", {
                        gameId: socketRematchData.gameId,
                        player: firstUser,
                        isTurn: firstUser.id,
                        board
                    })
                }

                if (!player.rematch) {
                    io.in(socketRematchData.gameId).emit("rematch", {
                        type: "ask",
                        player  
                    })
                }
            })

            socket.on("play", async function(socketPlayData) {
                if (!socketPlayData || !socketPlayData.gameId) return logger.error("Une erreur est survenue (no socket or gameId)")

                const game = await data.games.get(socketPlayData.gameId)

                if (!game) {
                    return socket.emit("error", {
                        message: socket.i18n.__("dashboard.connect4.noGameFound")
                    })
                }

                if (game.users.length < 2) {
                    return socket.emit("error", {
                        message: socket.i18n.__("dashboard.connect4.isNotFull")
                    })
                }

                const player = game.users.find(player => player.id === socket.id)

                if (!player) {
                    return socket.emit("error", {
                        message: socket.i18n.__("dashboard.connect4.notInThisGame")
                    })
                }

                if (!player.isTurn) {
                    return socket.emit("error", {
                        message: socket.i18n.__("dashboard.connect4.notYourTurn"),
                        errorType: "notTurn",
                        finish: game.finished
                    })
                }

                if (socketPlayData.column < 0 || socketPlayData.column > 6) {
                    return socket.emit("error", {
                        message: socket.i18n.__("dashboard.connect4.invalidColumn")
                    })
                }

                const result = add({ board: game.board, column: socketPlayData.column, emoji: player.colorEmote })

                if (result.error) {
                    return socket.emit("error", {
                        message: result.error === "col_full" ? socket.i18n.__("dashboard.connect4.columnFull") : socket.i18n.__("dashboard.connect4.invalidColumn")
                    })
                }

                const check = checkWin({
                    board: result.board,
                    userData: game.users[0],
                    opponentData: game.users[1]
                })

                if (check.win) {
                    io.in(socketPlayData.gameId).emit("play", {
                        board: result.board,
                        column: socketPlayData.column,
                        win: true,
                        winnerId: check.winnerUser.id,
                        finish: true
                    })
                
                    await data.games.set(socketPlayData.gameId, true, "finished")

                    // Disabled all players turn
                    for (let i = 0; i < game.users.length; i++) {
                        const user = game.users[i]

                        const newUser = {
                            ...user,
                            isTurn: false
                        }

                        await data.games.set(socketPlayData.gameId, newUser, `users.${i}`)
                    }

                    return
                }

                if (check.allFill) {
                    io.in(socketPlayData.gameId).emit("play", {
                        board: result.board,
                        column: socketPlayData.column,
                        allFill: true,
                        finish: true
                    })

                    await data.games.set(socketPlayData.gameId, true, "finished")

                    // Disabled all players turn
                    for (let i = 0; i < game.users.length; i++) {
                        const user = game.users[i]

                        const newUser = {
                            ...user,
                            isTurn: false
                        }

                        await data.games.set(socketPlayData.gameId, newUser, `users.${i}`)
                    }

                    return
                }

                // Change player turn
                let playerTurnId
                for (let i = 0; i < game.users.length; i++) {
                    const user = game.users[i]
                    const isTurn = player.color === user.color ? false : true

                    if (isTurn) playerTurnId = user.id

                    const newUser = {
                        ...user,
                        isTurn
                    }

                    await data.games.set(socketPlayData.gameId, newUser, `users.${i}`)
                }

                await data.games.set(socketPlayData.gameId, result.board, "board")

                // Send play to other player
                io.in(socketPlayData.gameId).emit("play", {
                    player,
                    isTurn: playerTurnId,
                    board: result.board
                })
            })
        })
    })

    httpServer.listen(config.dashboard.http, async() => {
        await logger.log("Serveur web http démarré port : " + config.dashboard.http)
    })
}

export default init

function add({ board, emoji, column }) {
    let placed = false

    board.reverse()

    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (!placed && j === parseInt(column) && board[i][j] === "⚪") {
                board[i][j] = emoji

                placed = true
            }
        }
    }
    
    board.reverse()
    
    if (!placed) return { error: "col_full", board }

    return { error: false, board }
}

function checkWin({ board, userData, opponentData }) {
    let win = false
    let winner = ""
    let allFill = true
    let winnerUser = ""

    for (let i = 0; i < board.length; i++) {   
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j] === "⚪") allFill = false

            //* Horizontal
            if (!win && board[i][j] !== "⚪" && board[i][j] === board[i][j + 1] && board[i][j + 1] === board[i][j + 2] && board[i][j + 2] === board[i][j + 3]) {
                winner = board[i][j]

                winnerUser = opponentData.colorEmote === winner ? opponentData : userData

                board[i][j] = winnerUser.winEmoji
                board[i][j + 1] = winnerUser.winEmoji
                board[i][j + 2] = winnerUser.winEmoji
                board[i][j + 3] = winnerUser.winEmoji

                win = true
            //* Vertical
            } else if (!win && board[i][j] !== "⚪" && board[i][j] === board[i + 1]?.[j] && board[i + 1]?.[j] === board[i + 2]?.[j] && board[i + 2]?.[j] === board[i + 3]?.[j]) {
                winner = board[i][j]

                winnerUser = opponentData.colorEmote === winner ? opponentData : userData

                board[i][j] = winnerUser.winEmoji
                board[i + 1][j] = winnerUser.winEmoji
                board[i + 2][j] = winnerUser.winEmoji
                board[i + 3][j] = winnerUser.winEmoji

                win = true
            //* Diagonal Left top => Bottom right 
            } else if (!win && board[i][j] !== "⚪" && board[i][j] === board[i + 1]?.[j + 1] && board[i + 1]?.[j + 1] === board[i + 2]?.[j + 2] && board[i + 2]?.[j + 2] === board[i + 3]?.[j + 3]) {
                winner = board[i][j]

                winnerUser = opponentData.colorEmote === winner ? opponentData : userData

                board[i][j] = winnerUser.winEmoji
                board[i + 1][j + 1] = winnerUser.winEmoji
                board[i + 2][j + 2] = winnerUser.winEmoji
                board[i + 3][j + 3] = winnerUser.winEmoji

                win = true
            //* Diagonal Right top => Bottom left
            } else if (!win && board[i][j] !== "⚪" && board[i][j] === board[i + 1]?.[j - 1] && board[i + 1]?.[j - 1] === board[i + 2]?.[j - 2] && board[i + 2]?.[j - 2] === board[i + 3]?.[j - 3]) {
                winner = board[i][j]

                winnerUser = opponentData.colorEmote === winner ? opponentData : userData

                board[i][j] = winnerUser.winEmoji
                board[i + 1][j - 1] = winnerUser.winEmoji
                board[i + 2][j - 2] = winnerUser.winEmoji
                board[i + 3][j - 3] = winnerUser.winEmoji

                win = true
            }
        }
    }

    return { board, win, winner, allFill, winnerUser }
}