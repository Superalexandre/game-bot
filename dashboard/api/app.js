import createError from "http-errors"
import express, { json, urlencoded, static as staticExpress } from "express"
import { join } from "path"
import cookieParser from "cookie-parser"
import logger from "morgan"
import cors from "cors"

import passport from "passport"
import { Strategy as DiscordStrategy } from "passport-discord"
import config from "../../config"

const app = express()

passport.serializeUser((user, done) => {
    done(null, user);
})

passport.deserializeUser((obj, done) => {
    done(null, obj);
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
    //All config
    .set("views", join(__dirname, "views"))
    .set("view engine", "jade")
    .use(cors())
    .use(logger("dev"))
    .use(json())
    .use(urlencoded({ extended: false }))
    .use(cookieParser())
    .use(staticExpress(join(__dirname, "public")))
    
    //404
    .use(function(req, res, next) {
        next(createError(404))
    })

    //Errors
    .use(function(err, req, res, next) {
        res.locals.message = err.message
        res.locals.error = req.app.get("env") === "development" ? err : {}

        res.status(err.status || 500)
        res.render("error")
    })

export default app