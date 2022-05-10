
import fetch from "node-fetch"
import btoa from "btoa"
import express from "express"
import config from "../../config.js"
import * as functions from "../../functions.js"
const router = express.Router()

export default router
    .get("/discord/invite", (req, res) => {
        res.redirect("https://discord.com/oauth2/authorize?client_id=848272310557343795&scope=bot%20applications.commands&permissions=8&response_type=code&redirect_uri=http://localhost:3000/api/discord/callback")
    })
        
    .get("/discord/login", (req, res) => {
        res.redirect(config.discord.loginURL)
    })
    .get("/discord/callback", async(req, res) => {
        if (!req.query.code) return res.redirect("/login")

        if (req.query.guild_id) return res.redirect(`/server/${req.query.guild_id}`)

        req.session.messages = []
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
            await req.session.messages.push({
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
            const response = await fetch("https://discord.com/api/users/@me", {
                method: "GET",
                headers: { 
                    Authorization: `Bearer ${token.access_token}` 
                }
            })

            const json = await response.json()

            if (json) userData.infos = json
        }
            
        if (!userData.servers) {
            const response = await fetch("https://discord.com/api/users/@me/guilds", {
                method: "GET",
                headers: { Authorization: `Bearer ${token.access_token}` }
            })
                
            const json = await response.json()

            if (json) userData.servers = json
        }

        if (!userData.infos || !userData.servers) {
            req.session.messages.push({
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

                await req.session.messages.push({
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

        req.session.messages.push({
            type: "success",
            message: res.__("dashboard.errors.loginSuccess")
        })

        if (req.session.redirect && req.session.redirect.length > 0) {
            const redirects = req.session.redirect
            const redirect = redirects[redirects.length - 4]

            if (!redirect) return res.redirect("/")

            return res.redirect(redirect)
        }

        res.redirect("/")
    })
    .get("/discord/logout", async(req, res) => {
        req.session.user = null
        req.user = null
            
        await req.session.messages.push({
            type: "success",
            message: res.__("dashboard.errors.logoutSucces")
        })

        return res.redirect("/")
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
        const gameConfig = {
            puissance4: {
                type: "puissance4",
                maxPlayers: 2
            }
        }
        
        if (!req.body.type || !req.body.game) return res.json({ success: false, error: true, message: "Incomplet request" })
        if (req.body.type === "account" && !req.user) return res.json({ success: false, error: true, message: "You must be logged in to create an account game" })
        if (req.body.type === "ano" && !req.body.username) return res.json({ success: false, error: true, message: "You must provide a username" })
        if (req.body.username && (req.body.username.length <= 3 || req.body.username.length >= 16)) return res.json({ success: false, error: true, message: "Username must be between 3 and 16 characters" })

        if (!gameConfig[req.body.game]) return res.json({ success: false, error: true, message: "Game not found" })

        const id = req.functions.genId({ length: 5, onlyNumber: true, withDate: false })
            
        await req.data.games.set(id, {
            id,
            finished: false,
            maxPlayers: gameConfig[req.body.game].maxPlayers,
            game: gameConfig[req.body.game].type,
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

        req.session.username = req.body.username ?? req.user.profileData.plateformData[0].data.username

        res.json({ success: true, id })
    })
    .post("/joinGame", async(req, res) => {
        if (!req.body.id) return res.json({ success: false, error: true, message: "Incomplet request" })
        if (req.body.type === "account" && !req.user) return res.json({ success: false, error: true, message: "You must be logged in to create an account game" })
        if (req.body.type === "ano" && !req.body.username) return res.json({ success: false, error: true, message: "You must provide a username" })
        if (req.body.username && req.body.username.length <= 3 || req.body.username.length >= 16) return res.json({ success: false, error: true, message: "Username must be between 3 and 16 characters" })

        const game = await req.data.games.get(req.body.id)

        if (!game) return res.json({ success: false, error: true, message: "Game not found" })
        if (game.users.find(user => user.username === req.body.username)) return res.json({ success: false, error: true, message: "Username already taken" })

        req.session.username = req.body.username ?? req.user.profileData.plateformData[0].data.username

        res.json({ success: true, id: req.body.id })
    })