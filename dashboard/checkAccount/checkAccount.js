export function checkAccount(req, res, next) {
    if (!req.user) {
        req.session.messages.push({
            type: "warn",
            message: res.__("dashboard.errors.mustBeLogin")
        })

        return res.redirect("/login")
    }

    next()
}