
import fetch from "node-fetch"
import btoa from "btoa"
import express from "express"
import config from "../../config.js"
import functions from "../../functions.js"
const router = express.Router()

export default router
    .get("/instagram/login", function(_req, res) {
        res.redirect("https://api.instagram.com/oauth/authorize?client_id=406440530945557&redirect_uri=http://localhost:3000/api/instagram/callback&scope=user_profile&response_type=code")
    })
    .get("/instagram/callback", async function(req, res) {
        console.log(req.query)

        await req.app.locals.messages.push({
            type: "info",
            message: res.__("dashboard.errors.connectionNotReleased", { plateform: "Instagram" })
        }) 

        res.redirect("/login")
    })
    .get("/discord/invite", function(_req, res) {
        res.redirect("https://discord.com/oauth2/authorize?client_id=848272310557343795&scope=bot%20applications.commands&permissions=8&response_type=code&redirect_uri=http://localhost:3000/api/discord/callback")
    })
        
    .get("/discord/login", function(_req, res) {
        res.redirect("https://discord.com/api/oauth2/authorize?client_id=848272310557343795&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fdiscord%2Fcallback&response_type=code&scope=email%20identify%20guilds")
    })
    .get("/discord/callback", async function(req, res) {
        if (!req.query.code) return res.redirect("/login")

        if (req.query.guild_id) return res.redirect(`/server/${req.query.guild_id}`)

        const data = await req.data
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
            await req.app.locals.messages.push({
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

                await req.app.locals.messages.push({
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

        if (req.app.locals.redirect && req.app.locals.redirect.length > 0) {
            const redirects = req.app.locals.redirect
            const redirect = redirects[redirects.length - 4]

            if (!redirect) return res.redirect("/")

            return res.redirect(redirect)
        }

        res.redirect("/")
    })
    .get("/discord/logout", async function(req, res) {
        req.session.destroy()
        req.user = null
            
        await req.app.locals.messages.push({
            type: "success",
            message: res.__("dashboard.errors.logoutSucces")
        })

        return res.redirect("/")
    })