import express, { json, urlencoded, static as staticExpress } from "express"
import { join, dirname } from "path"
import cookieParser from "cookie-parser"
import cors from "cors"
import session from "express-session"
import passport from "passport"
import { Strategy as DiscordStrategy } from "passport-discord"
import config from "../config.js"
import ejs from "ejs"
import { fileURLToPath } from "url"

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
    scope: config.discord.scopes
}, function(accessToken, refreshToken, profile, done) {
    process.nextTick(function() {
        return done(null, profile)
    })
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
            next()
        })
        .get("/", function(req, res) {
            res.render("index", {
                req, res
            })
        })
        .get("/login", function(req, res) {
            res.render("login", {
                req, res
            })
        })
        .listen(config.dashboard.port, (err) => {
            if (err) console.error(err)

            console.log("Dashboard en ligne port " + config.dashboard.port)
        })
}

init()

export default init