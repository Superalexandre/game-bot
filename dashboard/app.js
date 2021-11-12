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
                        message: "Votre profil n'a pas été trouvé, veuillez vous reconnecter."
                    })

                    return res.redirect("/")
                }

                req.session.user.profileData = profileData
            }

            next()
        })
        .get("/", function(req, res) {
            res.render("index", {
                req, res
            })
        })
        .get("/terms", function(req, res) {
            res.render("terms", {
                req, res
            })
        })
        .get("/privacy", function(req, res) {
            res.render("privacy", {
                req, res
            })
        })
        .get("/profile/settings", function(req, res) {
            if (!req.user) {
                req.app.locals.messages.push({
                    type: "warn",
                    message: "Vous devez être connecter pour faire ceci"
                })

                return res.redirect("/login")
            }

            res.render("settings", {
                req,
                res,
                user: req.user,
                profileData: req.user.profileData,
                plateformData: req.user.profileData.plateformData
            })
        })
        .get("/profile/:id?", function(req, res) {
            if (req.params.id) {
                res.render("viewProfile", {
                    req, res
                })
            } else {
                if (!req.user) {
                    req.app.locals.messages.push({
                        type: "warn",
                        message: "Vous devez être connecter pour faire ceci"
                    })

                    return res.redirect("/login")
                }

                res.render("profile", {
                    req,
                    res,
                    user: req.user,
                    profileData: req.user.profileData,
                    plateformData: req.user.profileData.plateformData
                })
            }
        })
        .get("/statistics", function(req, res) {
            if (!req.user) {
                req.app.locals.messages.push({
                    type: "warn",
                    message: "Vous devez être connecter pour faire ceci"
                })

                return res.redirect("/login")
            }

            res.render("statistics", {
                req, res
            })
        })
        .get("/server/:id", function(req, res) {
            const server = req.discordClient.guilds.cache.get(req.params.id)

            if (!server) {
                req.app.locals.messages.push({
                    type: "error",
                    message: "Le serveur n'a pas été trouvé"
                })

                return res.redirect("/")
            }

            res.render("server", {
                req, 
                res,
                server
            })
        })
        .get("/chat/:id", function(req, res) {
            const chat = req.instaClient.chats.cache.get(req.params.id)

            if (!chat) {
                req.app.locals.messages.push({
                    type: "error",
                    message: "Le chat n'a pas été trouvé"
                })

                return res.redirect("/")
            }

            res.render("chat", {
                req, res
            })
        })
        .get("/games/:id", function(req, res) {
            const game = req.data.games.get(req.params.id)

            if (!game) {
                req.app.locals.messages.push({
                    type: "error",
                    message: "Le jeu n'a pas été trouvé"
                })

                return res.redirect("/")
            }

            res.render("games", {
                req, 
                res,
                game,
                gameId: req.params.id
            })
        })
        .get("/login", function(req, res) {
            res.render("login", {
                req, res
            })
        })
        .get("/admin", async function(req, res) {
            if (!req.user) {
                req.app.locals.messages.push({
                    type: "warn",
                    message: "Vous devez être connecter pour faire ceci"
                })

                return res.redirect("/login")
            }

            if (!config.discord.ownerIds.includes(req.user.id) && !config.instagram.ownerIds.includes(req.user.id)) {
                req.app.locals.messages.push({
                    type: "error",
                    message: "Vous n'êtes pas autoriser a faire ceci"
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
                message: "La connexion via Instagram n'est pas encore disponible"
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
                    message: "La clé de connexion a expirer ou est invalide"
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
                    message: "Des informations sont manquantes"
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
                        message: "Votre compte n'a pas plus être crée"
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
                message: "Connecté avec succès"
            })

            res.redirect("/")
        })
        .get("/api/discord/logout", async function(req, res) {
            req.session.destroy()
            req.user = null
            
            req.app.locals.messages.push({
                type: "success",
                message: "Deconnecté avec succès"
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
                message: "Nous vous avons redirigez ici la page été introuvable"
            })

            res.redirect("/")
        })
        .listen(config.dashboard.port.HTTP, (err) => {
            if (err) console.error(err)

            logger.log({ message: "En ligne port " + config.dashboard.port.HTTP })
        })
}

export default init