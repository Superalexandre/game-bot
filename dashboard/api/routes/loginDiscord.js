import express from "express"
const router = express.Router()

router.get("/api/loginDiscord", function(req, res, next) {
    res.send('{ "result": true }')
})

export default router