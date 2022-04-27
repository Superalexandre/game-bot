
import fetch from "node-fetch"
import btoa from "btoa"
import express from "express"
import config from "../../config.js"
import * as functions from "../../functions.js"
const router = express.Router()

export default router
    .get("/instagram/login", (_req, res) => {
        res.redirect(303, "https://api.instagram.com/oauth/authorize?client_id=406440530945557&redirect_uri=http://localhost:3000/api/instagram/callback&scope=user_profile&response_type=code")
    })
    .get("/instagram/callback", (req, res) => {
        console.log(req.query)

        await res.app.locals.messages.push({
            type: "info",
            message: res.__("dashboard.errors.connectionNotReleased", { plateform: "Instagram" })
        }) 

        res.redirect(303, "/login")
    })
    .get("/discord/invite", (req, res) => {
        res.redirect(303, "https://discord.com/oauth2/authorize?client_id=848272310557343795&scope=bot%20applications.commands&permissions=8&response_type=code&redirect_uri=http://localhost:3000/api/discord/callback")
    })
        
    .get("/discord/login", (req, res) => {
        res.redirect(303, config.discord.loginURL)
    })
    .get("/discord/callback", async(req, res) => {
        if (!req.query.code) return res.redirect(303, "/login")

        if (req.query.guild_id) return res.redirect(303, `/server/${req.query.guild_id}`)

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
            res.app.locals.messages = []

            await res.app.locals.messages.push({
                type: "error",
                message: res.__("dashboard.errors.invalidKey")
            })   

            return res.redirect(303, "/login")
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
            res.app.locals.messages.push({
                type: "error",
                message: res.__("dashboard.errors.missingData")
            })

            return res.redirect(303, "/login")
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

                await res.app.locals.messages.push({
                    type: "error",
                    message: res.__("dashboard.errors.accountNotCreated")
                })

                return res.redirect(303, "/login")
            }

            profileData = newAccount.account
        }

        req.session.user = { 
            profileData,

            ... userData.infos, 
            ... { guilds } 
        }

        res.app.locals.messages.push({
            type: "success",
            message: res.__("dashboard.errors.loginSuccess")
        })

        if (res.app.locals.redirect && res.app.locals.redirect.length > 0) {
            const redirects = res.app.locals.redirect
            const redirect = redirects[redirects.length - 4]

            if (!redirect) return res.redirect(303, "/")

            return res.redirect(303, redirect)
        }

        res.redirect(303, "/")
    })
    .get("/discord/logout", async(req, res) => {
        req.session.destroy()
        req.user = null
            
        await res.app.locals.messages.push({
            type: "success",
            message: res.__("dashboard.errors.logoutSucces")
        })

        return res.redirect(303, "/")
    })
    .get("/instagram/mergeAccount", async(req, res) => {
        // Gen new id
        const id = req.functions.genId({ length: 8 })
        
        await req.data.sync.set(id, {
            account: req.user.profileData.accountId,
            date: Date.now()
        })

        res.redirect(`/sync/${id}/instagram`)
    })
    .post("/createGame", async(req, res) => {
        if (!req.body.type || !req.body.game) res.json({ success: false, error: true, message: "Incomplet request" })
        if (req.body.type === "account" && !req.user) res.json({ success: false, error: true, message: "You must be logged in to create an account game" })
        if (req.body.type === "ano" && !req.body.username) res.json({ success: false, error: true, message: "You must provide a username" })
        if (req.body.username.length <= 3 || req.body.username.length >= 16) res.json({ success: false, error: true, message: "Username must be between 3 and 16 characters" })

        const id = req.functions.genId({ length: 5, onlyNumber: true, withDate: false })
            
        await req.data.games.set(id, {
            id,
            game: req.body.game,
            date: Date.now(),
            createdBy: req.body.username ?? req.user.profileData.plateformData[0].data.username,
            users: [],
            board: [
                ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
                ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
                ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
                ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
                ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"]
            ]
        })

        res.app.locals.username = req.body.username ?? req.user.profileData.plateformData[0].data.username

        res.json({ success: true, id })
    })