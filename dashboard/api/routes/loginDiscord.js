import express from "express"
const router = express.Router()

router.get("/api/login/discord", function(req, res, next) {
    res.send('{ "result": true }')
})

router.get("/api/callback/discord", function(req, res, next) {
    res.send("Call back de discord")
})

export default router