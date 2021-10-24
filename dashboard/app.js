import express, { json, urlencoded, static as staticExpress } from "express"
import { join, dirname } from "path"
import cookieParser from "cookie-parser"
import cors from "cors"
import session from "express-session"
import passport from "passport"
import { Strategy as DiscordStrategy } from "passport-discord"
import config from "../config.js"
import functions from "../functions.js"
import ejs from "ejs"
import { fileURLToPath } from "url"
import Enmap from "enmap"

const data = {
    users: new Enmap({ name: "users" }),
    games: new Enmap({ name: "games" }),
    discord: {
        bot: new Enmap({ name: "discordBot" })
    }
}

passport.serializeUser((user, done) => {
    done(null, user)
})

passport.deserializeUser((obj, done) => {
    done(null, obj)
})

passport.use(new DiscordStrategy({
    clientID: config.discord.appId,
    clientSecret: config.discord.clientSecret,
    callbackURL: config.discord.callBackURL,
    scope: config.discord.scopes,
    prompt: "consent"
}, async function(accessToken, refreshToken, profile, done) {
    if (!profile) return done(null, false)

    let profileData = await data.users.find(user => user.plateformData.find(data => data.plateform === "discord" && data.data.id === profile.id))

    if (!profileData) {
        const newAccount = await functions.createAccount({
            data,
            lang: "fr_FR",
            plateformData: [
                {
                    plateform: "discord",
                    lastUpdate: Date.now(),
                    data: profile
                }
            ]
        })

        if (!newAccount.success) return done(null, null)

        profileData = newAccount.account
    }

    profile.profileData = profileData

    return done(null, profile)
}))

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

        .get("/profile", checkAuth, function(req, res) {
            res.render("profile", {
                req, res
            })
        })
        .get("/login", function(req, res) {
            res.render("login", {
                req, res
            })
        })
        .get("/api/discord/login", passport.authenticate("discord"))
        .get("/api/discord/callback", passport.authenticate("discord", {
            failureRedirect: "/login"
        }), function(req, res) {
            res.redirect(`/profile?user=${req.user.id}`)
        })
        .get("/api/discord/logout", checkAuth, function(req, res) {
            req.logout()
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

function checkAuth(req, res, next) {
    if (req.isAuthenticated()) return next()

    res.redirect("/login")
}

init()

export default init