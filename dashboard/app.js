import express, { json, urlencoded, static as staticExpress } from "express"
import { join, dirname } from "path"
import cookieParser from "cookie-parser"
import cors from "cors"
import session from "express-session"
import passport from "passport"
import config from "../config.js"
import functions from "../functions.js"
import ejs from "ejs"
import { fileURLToPath } from "url"
//import Enmap from "enmap"
import fetch from "node-fetch"
import btoa from "btoa"
import Logger from "../logger.js"
import i18n from "i18n"

const logger = new Logger({
    mode: "compact",
    plateform: "Dashboard"
})

/*
const CopyData = {
    users: new Enmap({ name: "users" }),
    games: new Enmap({ name: "games" }),
    discord: {
        bot: new Enmap({ name: "discordBot" })
    }
}
*/

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

            req.instaClient = clients?.instaClient
            req.discordClient = clients?.discord
            req.logger = logger
            req.data = data
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
        .get("/profile/settings", function(req, res) {
            if (!req.user) {
                req.app.locals.messages.push({
                    type: "warn",
                    message: res.__("dashboard.errors.mustBeLogin")
                })

                return res.redirect("/login")
            }

            if (req.query && req.query.lang) {
                if (!i18n.getLocales().includes(req.query.lang)) {
                    console.log("Invalid lang")

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
                req, res, i18n
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

            res.render("chat", {
                req, res, i18n
            })
        })
        .get("/games/:id", function(req, res) {
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
        .get("/api/instagram/login", function(_req, res) {
            res.redirect("https://api.instagram.com/oauth/authorize?client_id=406440530945557&redirect_uri=http://localhost:3000/api/instagram/callback&scope=user_profile&response_type=code")
        })
        .get("/api/instagram/callback", function(req, res) {
            console.log(req.query)

            req.app.locals.messages.push({
                type: "info",
                message: res.__("dashboard.errors.connectionNotReleased", { plateform: "Instagram" })
            }) 

            res.redirect("/login")
        })
        .get("/api/discord/invite", function(_req, res) {
            res.redirect("https://discord.com/oauth2/authorize?client_id=848272310557343795&scope=bot%20applications.commands&permissions=8&response_type=code&redirect_uri=http://localhost:3000/api/discord/callback")
        })
        .get("/invite", function(_req, res) {
            res.redirect("https://discord.com/oauth2/authorize?client_id=848272310557343795&scope=bot%20applications.commands&permissions=8&response_type=code&redirect_uri=http://localhost:3000/api/discord/callback")
        })
        .get("/api/discord/login", function(_req, res) {
            res.redirect("https://discord.com/api/oauth2/authorize?client_id=848272310557343795&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fdiscord%2Fcallback&response_type=code&scope=email%20identify%20guilds")
        })
        .get("/api/discord/callback", async function(req, res) {
            if (!req.query.code) return res.redirect("/login")

            if (req.query.guild_id) return res.redirect(`/server/${req.query.guild_id}`)

            const parameters = new URLSearchParams()
                
            parameters.set("grant_type", "authorization_code")
            parameters.set("code", req.query.code)
            parameters.set("redirect_uri", config.discord.callBackURL)

            const response = await fetch("https://discord.com/api/oauth2/token", {
                method: "POST",
                body: parameters.toString(),
                headers: {
                    Authorization: `Basic ${btoa(`${config.discord.appId}:${config.discord.clientSecret}`)}`,
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            })

            const token = await response.json()
            
            if (token.error || !token.access_token) {
                req.app.locals.messages.push({
                    type: "error",
                    message: res.__("dashboard.errors.invalidKey")
                })   

                return res.redirect("/login")
            }

            const userData = {
                infos: null,
                servers: null
            }

            if (!userData.infos) {
                const response = await fetch("https://discordapp.com/api/users/@me", {
                    method: "GET",
                    headers: { 
                        Authorization: `Bearer ${token.access_token}` 
                    }
                })

                const json = await response.json()

                if (json) userData.infos = json
            }
            
            if (!userData.servers) {
                const response = await fetch("https://discordapp.com/api/users/@me/guilds", {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token.access_token}` }
                })
                
                const json = await response.json()

                if (json) userData.servers = json
            }

            if (!userData.infos || !userData.servers) {
                req.app.locals.messages.push({
                    type: "error",
                    message: res.__("dashboard.errors.missingData")
                })

                return res.redirect("/login")
            }

            const guilds = []
            for (const guildPos in userData.servers) guilds.push(userData.servers[guildPos])

            let profileData = await data.users.find(user => user.plateformData.find(uData => uData.plateform === "discord" && uData.data.id === userData.infos.id))

            if (!profileData) {
                const newAccount = await functions.createAccount({
                    data,
                    lang: "fr-FR",
                    plateformData: [
                        {
                            plateform: "discord",
                            lastUpdate: Date.now(),
                            data: userData.infos
                        }
                    ]
                })

                if (!newAccount.success) {
                    req.user = null

                    req.app.locals.messages.push({
                        type: "error",
                        message: res.__("dashboard.errors.accountNotCreated")
                    })

                    return res.redirect("/login")
                }

                profileData = newAccount.account
            }

            req.session.user = { 
                profileData,

                ... userData.infos, 
                ... { guilds } 
            }

            req.app.locals.messages.push({
                type: "success",
                message: res.__("dashboard.errors.loginSuccess")
            })

            res.redirect("/")
        })
        .get("/api/discord/logout", async function(req, res) {
            req.session.destroy()
            req.user = null
            
            req.app.locals.messages.push({
                type: "success",
                message: res.__("dashboard.errors.logoutSucces")
            })

            res.redirect("/")
        })
        // eslint-disable-next-line no-unused-vars
        .use((error, _req, res, next) => {
            if (!error.statusCode) error.statusCode = 500

            if (error.statusCode === 301) {
                return res.status(301).json({ error: "301" })
            }
        
            logger.error({ message: error.stack ?? error.toString() })

            return res?.status(500)?.json({ error: error.toString() })
        })
        .use(function(req, res) {
            req.app.locals.messages.push({
                type: "info",
                message: res.__("dashboard.errors.pageNotFound")
            })

            res.redirect("/")
        })
        .listen(config.dashboard.port.HTTP, (err) => {
            if (err) console.error(err)

            logger.log({ message: "En ligne port " + config.dashboard.port.HTTP })
        })
}

export default init