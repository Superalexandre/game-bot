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

import { handlePuissance4 } from "./router/puissance4.js"
import { handleMonopoly } from "./router/monopoly.js"

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
        .get("/lang", async(req, res) => {
            if (!req.query || !req.query.lang) return res.redirect("/")
           
            const redirects = req.session.redirect
            const redirect = redirects[redirects.length - 2]

            if (!i18n.getLocales().includes(req.query.lang)) {
                await req.logger.error("Invalid lang")

                req.session.messages.push({
                    type: "warn",
                    message: res.__("dashboard.profile.invalidLang")
                })

                return res.redirect(redirect ?? "/")
            }

            res.cookie("lang", req.query.lang, {
                expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
                httpOnly: true,
                secure: true
            })

            if (req.user && req.user.profileData) await data.users.set(req.user.profileData.accountId, req.query.lang, "lang")
            
            res.setLocale(req.query.lang)

            req.session.messages.push({
                type: "success",
                message: res.__("dashboard.profile.switchedLang")
            })

            return res.redirect(redirect ?? "/")
        })
        .get("/profile/settings", checkAccount, async(req, res) => {
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
            } else if (game.game === "monopoly") {
                if (!req.session.username) req.session.username = "Player" 
                // return res.redirect(`/join/${req.params.id}`)

                res.render("games/monopoly", {
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
        .use(async(error, req, res, next) => {
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

    io.on("connect", async(socket) => {
        socket.i18n = new I18n(config.locale(logger))

        // Get language from cookie
        const cookies = socket.handshake.headers.cookie
        const parsedCookies = cookies ? cookie.parse(cookies) : {}
        const lang = parsedCookies.lang ?? config.defaultLocale

        // Init language
        await socket.i18n.setLocale(lang)

        socket.on("join", async function(socketData) {
            if (!socketData || !socketData.gameId) return logger.error(`Une erreur est survenue (no socket or gameId)`)
        
            const game = await data.games.get(socketData.gameId)
        
            if (!game) {
                return socket.emit("error", {
                    message: socket.i18n.__("dashboard.errors.noGameFound")
                })
            }

            if (game.game === "monopoly") return handleMonopoly({ socket, game, socketData, data, io })
            if (game.game === "puissance4") return handlePuissance4({ socket, game, socketData, data, io })

            return socket.emit("error", {
                message: socket.i18n.__("dashboard.errors.thisGameIsNotSupported")
            })
        })
    })

    httpServer.listen(config.dashboard.http, async() => {
        await logger.log("Serveur web http démarré port : " + config.dashboard.http)
    })
}

export default init
