import express, { json, urlencoded, static as staticExpress } from "express"
import { join, dirname } from "path"
import cookieParser from "cookie-parser"
import logger from "morgan"
import cors from "cors"
import session from "express-session"
import bodyParser from "body-parser"

import passport from "passport"
import { Strategy as DiscordStrategy } from "passport-discord"
import config from "../../config.js"

import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()

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
    scope: ["identify", "guilds"]
}, function(accessToken, refreshToken, profile, done) {
    process.nextTick(function() {
        return done(null, profile);
    })
}))

app
    .use(cors())
    .use(logger("dev"))
    .use(json())
    .use(urlencoded({ extended: false }))
    .use(cookieParser())
    .use(staticExpress(join(__dirname + "public")))
    .use(bodyParser.json())
    .use(session({ 
        secret: config.dashboard.api.secret,
        resave: false,
        saveUninitialized: false
    }))
    .use(passport.initialize())
    .use(passport.session())
    .get("/api/login/discord", function(req, res, next) {
        res.send("Login discord")
    })
    .get("/api/callback/discord", async function(req, res, next) {
        //access_denied

		await passport.authenticate("discord", async function(err, user, info) {
            if (err && err.name === "TokenError") return res.redirect("http://localhost:3000/login")

			if (err) return res.send(JSON.stringify({ success: false, error: true, message: err, code: 1 }))

			if (!user) return res.send(JSON.stringify({ success: false, error: true, message: "Le compte n'a pas été trouvé", info: info.message }))

			req.logIn(user, async function(err) {
				if (err) return res.send(JSON.stringify({ success: false, error: true, message: err, code: 2 }))

				req.session.user = user

                //return res.send("Oui bienvenue")
                res.redirect(`http://localhost:3000/?user=${user.id}`)
				//return res.send(JSON.stringify({ success: true, error: false, message: "Connecté avec succès", redirect: "/profile/" + user.id }))
			})
		})(req, res, next)
    })
    .get("/api/signout/discord", function(req, res, next) {
        res.send("Signout")
    })
    .get("*", function(req, res, next) {
        res.redirect("http://localhost:3000")
    })
    .listen(config.dashboard.api.port, () => {
        console.log("Api prête " + config.dashboard.api.port)
    })

export default app