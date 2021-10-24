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
import Enmap from "enmap"
import fetch from "node-fetch"
import btoa from "btoa"

const data = {
    users: new Enmap({ name: "users" }),
    games: new Enmap({ name: "games" }),
    discord: {
        bot: new Enmap({ name: "discordBot" })
    }
}

async function init() {
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
        .use(function(req, res, next) {
            req.data = data

            next()
        })
        .get("/", function(req, res) {
            res.render("index", {
                req, res
            })
        })
        .get("/profile/:id?", function(req, res) {
            if (req.params.id) {
                res.render("viewProfile", {
                    req, res
                })
            } else {
                if (!req.session.user) return res.redirect("/login")

                res.render("profile", {
                    req, res
                })
            }
        })
        .get("/server/:id", function(req, res) {
            res.render("server", {
                req, res
            })
        })
        .get("/login", function(req, res) {
            res.render("login", {
                req, res
            })
        })
        .get("/api/discord/invite", function(req, res) {
            res.redirect("https://discord.com/oauth2/authorize?client_id=848272310557343795&scope=bot%20applications.commands&permissions=8&response_type=code&redirect_uri=http://localhost:3000/api/discord/callback")
        })
        .get("/api/discord/login", function(req, res) {
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
            
            if (token.error || !token.access_token) return res.redirect(`/login?error_message=${token.error_message ?? "no_access_token"}`)

            const userData = {
                infos: null,
                servers: null
            }

            if (!userData.infos) {
                const response = await fetch("http://discordapp.com/api/users/@me", {
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

            if (!userData.infos || !userData.servers) return res.redirect("/login?error=missing_args")

            const guilds = []
            for (const guildPos in userData.servers) guilds.push(userData.servers[guildPos])

            let profileData = await data.users.find(user => user.plateformData.find(data => data.plateform === "discord" && data.data.id === userData.infos.id))

            if (!profileData) {
                const newAccount = await functions.createAccount({
                    data,
                    lang: "fr_FR",
                    plateformData: [
                        {
                            plateform: "discord",
                            lastUpdate: Date.now(),
                            data: userData.infos
                        }
                    ]
                })

                if (!newAccount.success) {
                    req.session.user = undefined

                    return res.redirect("/login?error=cannot_create_account")
                }

                profileData = newAccount.account
            }

            req.session.user = { 

                profileData,

                ... userData.infos, 
                ... { guilds } 
            }

            res.redirect("/")
        })
        .get("/api/discord/logout", async function(req, res) {
            req.session.destroy()
            
            res.redirect("/")
        })
        .get("*", function(req, res) {
            res.redirect("/")
        })
        .listen(config.dashboard.port, (err) => {
            if (err) console.error(err)

            console.log("Dashboard en ligne port " + config.dashboard.port)
        })
}


init()

export default init