import express, { json, urlencoded, static as staticExpress } from "express"
import { join, dirname } from "path"
import cookieParser from "cookie-parser"
import cors from "cors"
import session from "express-session"
import passport from "passport"
import config from "../config.js"
import * as functions from "../functions.js"
import ejs from "ejs"
import { fileURLToPath } from "url"
//import Enmap from "enmap"
import Logger from "../logger.js"
import i18n from "i18n"
import routerApi from "./router/api.js"
import fs from "fs"

import https from "https"
import http from "http"
import { Server } from "socket.io"

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
        .use(cookieParser())
        .use(cors())
        .use(json())
        .use(urlencoded({ extended: false }))
        .use(session({ 
            secret: config.dashboard.secret,
            resave: false,
            saveUninitialized: false
        }))
        .use(passport.initialize())
        .use(passport.session())
        .use(i18n.init)
        .use(async function(req, res, next) {
            if (!req.app.locals.messages) req.app.locals.messages = []
            if (!req.app.locals.redirect) req.app.locals.redirect = []

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
                    
                    req.app.locals.messages.push({
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
                    httpOnly: true
                })
            }

            res.setLocale(req.cookies.lang ?? "fr-FR")
            
            req.app.locals.redirect.push(req.url)

            next()
        })
        .get("/", function(req, res) {
            res.render("index", {
                req, res, i18n
            })
        })
        .get("/terms", function(req, res) {
            res.render("terms", {
                req, res, i18n
            })
        })
        .get("/privacy", function(req, res) {
            res.render("privacy", {
                req, res, i18n
            })
        })
        .get("/profile/settings", async function(req, res) {
            if (!req.user) {
                req.app.locals.messages.push({
                    type: "warn",
                    message: res.__("dashboard.errors.mustBeLogin")
                })

                return res.redirect("/login")
            }

            if (req.query && req.query.lang) {
                if (!i18n.getLocales().includes(req.query.lang)) {
                    req.logger.error("Invalid lang")

                    req.app.locals.messages.push({
                        type: "warn",
                        message: "Langue saisi invalid"
                    })

                    return res.redirect("/profile/settings")
                }

                res.cookie("lang", req.query.lang, {
                    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
                    httpOnly: true
                })

                await data.users.set(req.user.profileData.accountId, req.query.lang, "lang")

                res.setLocale(req.query.lang)

                req.app.locals.messages.push({
                    type: "success",
                    message: "Langue changé"
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
        .get("/profile/:id?", function(req, res) {
            if (req.params.id) {
                res.render("viewProfile", {
                    req, res, i18n
                })
            } else {
                if (!req.user) {
                    req.app.locals.messages.push({
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
        .get("/statistics", function(req, res) {
            if (!req.user) {
                req.app.locals.messages.push({
                    type: "warn",
                    message: res.__("dashboard.errors.mustBeLogin")
                })

                return res.redirect("/login")
            }

            res.render("statistics", {
                req, 
                res, 
                i18n,
                profileData: req.user.profileData,
                plateformData: req.user.profileData.plateformData
            })
        })
        .get("/server/:id", function(req, res) {
            const server = req.discordClient.guilds.cache.get(req.params.id)

            if (!server) {
                req.app.locals.messages.push({
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
        .get("/chat/:id", function(req, res) {
            const chat = req.instaClient.chats.cache.get(req.params.id)

            if (!chat) {
                req.app.locals.messages.push({
                    type: "error",
                    message: res.__("dashboard.errors.chatNotFound")
                })

                return res.redirect("/")
            }

            res.redirect("/")
            /*
            res.render("chat", {
                req, res, i18n
            })
            */
        })
        .get("/games/:id?", function(req, res) {
            if (!req.params.id) {
                return res.render("createGame", {
                    req, res, i18n
                })
            }
            
            const game = req.data.games.get(req.params.id)

            if (!game) {
                req.app.locals.messages.push({
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
        .get("/login", function(req, res) {
            res.render("login", {
                req, res, i18n
            })
        })
        .get("/admin", async function(req, res) {
            if (!req.user) {
                req.app.locals.messages.push({
                    type: "warn",
                    message: res.__("dashboard.errors.mustBeLogin")
                })

                return res.redirect("/login")
            }

            if (!config.discord.ownerIds.includes(req.user.id) && !config.instagram.ownerIds.includes(req.user.id)) {
                req.app.locals.messages.push({
                    type: "error",
                    message: res.__("dashboard.errors.notAllowed")
                })

                return res.redirect("/login")
            }

            const JSONdata = await req.data.users.export()
            
            res.send(JSONdata)
        })
        .get("/invite", function(_req, res) {
            res.redirect("https://discord.com/oauth2/authorize?client_id=848272310557343795&scope=bot%20applications.commands&permissions=8&response_type=code&redirect_uri=http://localhost:3000/api/discord/callback")
        })
        .get("/sync/:code/:plateform", async function(req, res) {
            if (!req.user) {
                req.app.locals.messages.push({
                    type: "warn",
                    message: res.__("dashboard.errors.mustBeLogin")
                })

                return res.redirect("/login")
            }

            if (!req.params.code || !req.params.plateform) {
                req.app.locals.messages.push({
                    type: "error",
                    message: "Une erreur est survenue"
                })

                return res.redirect("/profile")
            }

            if (!await req.data.sync.get(req.params.code)) {
                req.app.locals.messages.push({
                    type: "error",
                    message: "Ce code n'existe pas"
                })
                
                return res.redirect("/profile")
            }

            res.render("sync", {
                req, res, i18n,
                code: req.params.code,
                type: req.params.plateform
            })
        })
        .get("/play/:id?", async function(req, res) {
            if (!req.params.id) return res.redirect("/games")
            
            const game = req.data.games.get(req.params.id)

            if (!game) {
                req.app.locals.messages.push({
                    type: "error",
                    message: "Aucune partie trouvée essayez d'en créer une"
                })

                return res.redirect("/games")
            }

            if (game.game === "puissance4") {
                res.render("games/puissance4", {
                    req, res, i18n,
                    game, id: req.params.id
                })
            } else {
                req.app.locals.messages.push({
                    type: "error",
                    message: "Ce jeu n'est pas encore disponible"
                })

                await req.data.games.delete(game.id)

                return res.redirect("/games")
            }

        })
        .use("/api", routerApi)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
        .use((error, req, res, next) => {
            if (!error) return

            logger.error(error.stack ?? error.toString())

            console.log(error)

            res?.status(error.statusCode ?? 500)?.render("error", {
                req, res, i18n,
                code: error.statusCode
            })

            // return res?.status(500)?.json({ error: error.toString() })
        })
        .use(function(req, res) {
            req.app.locals.messages.push({
                type: "info",
                message: res.__("dashboard.errors.pageNotFound")
            })

            res.redirect("/")
        })
      
    /* HTTPS */
    if (fs.existsSync(config.dashboard.key) && fs.existsSync(config.dashboard.cert) && fs.existsSync(config.dashboard.ca)) {
        const httpsServer = https.createServer({
            key: fs.readFileSync(config.dashboard.key),
            cert: fs.readFileSync(config.dashboard.cert),
            ca: fs.readFileSync(config.dashboard.ca)
        }, app)

        httpsServer.listen(config.dashboard.https, async() => {
            await logger.log("Serveur web HTTPS démarré port : " + config.dashboard.https)
        })
    } else await logger.warn("Serveur HTTPS pas lancé : aucune clé : key/cert/ca n'existe")

    const httpServer = http.createServer(app)

    const io = new Server(httpServer)

    io.on("connect", socket => {
        socket.on("join", async function(socketData) {
            if (!socketData || !socketData.gameId) return logger.error("Une erreur est survenue (no socket or gameId)")

            const game = await data.games.get(socketData.gameId)

            if (!game) {
                socket.emit("error", {
                    message: "Aucune partie trouvée"
                })

                return
            }

            if (game.users.length >= 2) {
                socket.emit("error", {
                    message: "La partie est pleine"
                })

                return
            }

            if (game.users.find(player => player.id === socket.id)) {
                socket.emit("error", {
                    message: "Vous êtes déjà dans cette partie"
                })

                return
            }

            const player = {
                id: socket.id,
                username: socketData.username,
                color: game.users.length <= 0 ? "red" : "yellow",
                colorEmote: game.users.length <= 0 ? "🔴" : "🟡",
                winEmoji: game.users.length <= 0 ? "🔴" : "🟡",
                isTurn: game.users.length <= 0 ? true : false
            }

            data.games.push(socketData.gameId, player, "users")
            
            await socket.join(data.gameId)

            io.in(data.gameId).emit("joined", {
                id: socket.id,
                board: game.board,
                player,
                playerNumber: game.users.length + 1
            })

            socket.on("play", async function(socketPlayData) {
                if (!socketPlayData || !socketPlayData.gameId) return logger.error("Une erreur est survenue (no socket or gameId)")

                const game = await data.games.get(socketPlayData.gameId)

                if (!game) {
                    socket.emit("error", {
                        message: "Aucune partie trouvée"
                    })

                    return
                }

                if (game.users.length < 2) {
                    socket.emit("error", {
                        message: "La partie n'est pas encore pleine"
                    })

                    return
                }

                const player = game.users.find(player => player.id === socket.id)

                if (!player) {
                    socket.emit("error", {
                        message: "Vous n'êtes pas dans cette partie"
                    })

                    return
                }

                if (!player.isTurn) {
                    socket.emit("error", {
                        message: "Ce n'est pas à votre tour"
                    })

                    return
                }

                if (socketPlayData.column < 0 || socketPlayData.column > 6) {
                    socket.emit("error", {
                        message: "La colonne n'existe pas"
                    })

                    return
                }

                const result = add({ board: game.board, column: socketPlayData.column, emoji: player.colorEmote })

                if (result.error) {
                    socket.emit("error", {
                        message: result.error === "col_full" ? "La colonne est pleine" : "Une erreur est survenue"
                    })

                    return
                }

                const check = checkWin({
                    board: result.board,
                    userData: game.users[0],
                    opponentData: game.users[1]
                })

                if (check.win) {
                    io.in(data.gameId).emit("play", {
                        board: result.board,
                        column: socketPlayData.column,
                        win: true
                    })
                
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
                    io.in(data.gameId).emit("play", {
                        board: result.board,
                        column: socketPlayData.column,
                        allFill: true
                    })

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
                for (let i = 0; i < game.users.length; i++) {
                    const user = game.users[i]
                    const isTurn = player.color === user.color ? false : true

                    const newUser = {
                        ...user,
                        isTurn
                    }

                    await data.games.set(socketPlayData.gameId, newUser, `users.${i}`)
                }

                await data.games.set(socketPlayData.gameId, result.board, "board")

                // Send play to other player
                io.in(data.gameId).emit("play", {
                    player,
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

                winnerUser = opponentData.emoji === winner ? opponentData : userData

                board[i][j] = winnerUser.winEmoji
                board[i][j + 1] = winnerUser.winEmoji
                board[i][j + 2] = winnerUser.winEmoji
                board[i][j + 3] = winnerUser.winEmoji

                win = true
            //* Vertical
            } else if (!win && board[i][j] !== "⚪" && board[i][j] === board[i + 1]?.[j] && board[i + 1]?.[j] === board[i + 2]?.[j] && board[i + 2]?.[j] === board[i + 3]?.[j]) {
                winner = board[i][j]

                winnerUser = opponentData.emoji === winner ? opponentData : userData

                board[i][j] = winnerUser.winEmoji
                board[i + 1][j] = winnerUser.winEmoji
                board[i + 2][j] = winnerUser.winEmoji
                board[i + 3][j] = winnerUser.winEmoji

                win = true
            //* Diagonal Left top => Bottom right 
            } else if (!win && board[i][j] !== "⚪" && board[i][j] === board[i + 1]?.[j + 1] && board[i + 1]?.[j + 1] === board[i + 2]?.[j + 2] && board[i + 2]?.[j + 2] === board[i + 3]?.[j + 3]) {
                winner = board[i][j]

                winnerUser = opponentData.emoji === winner ? opponentData : userData

                board[i][j] = winnerUser.winEmoji
                board[i + 1][j + 1] = winnerUser.winEmoji
                board[i + 2][j + 2] = winnerUser.winEmoji
                board[i + 3][j + 3] = winnerUser.winEmoji

                win = true
            //* Diagonal Right top => Bottom left
            } else if (!win && board[i][j] !== "⚪" && board[i][j] === board[i + 1]?.[j - 1] && board[i + 1]?.[j - 1] === board[i + 2]?.[j - 2] && board[i + 2]?.[j - 2] === board[i + 3]?.[j - 3]) {
                winner = board[i][j]

                winnerUser = opponentData.emoji === winner ? opponentData : userData

                board[i][j] = winnerUser.winEmoji
                board[i + 1][j - 1] = winnerUser.winEmoji
                board[i + 2][j - 2] = winnerUser.winEmoji
                board[i + 3][j - 3] = winnerUser.winEmoji

                win = true
            }
        }
    }

    return { board, win, winner, allFill }
}