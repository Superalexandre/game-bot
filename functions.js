async function deleteAccount({ data }) {
    data.users.forEach(async(content, id) => {
        data.users.delete(id)
    })

    return { success: true }
}

async function createAccount({ data, lang = "fr_FR", plateformData = {} }) {
    if (!data) new Error("No database provided")

    const id = genId()

    if (data.users.has(id)) return new Error(`${id} already exists`)

    await data.users.set(id, {
        accountId: id,
        createdTimestamp: Date.now(),
        lang,
        plateformData,
        statistics: {},
        achievement: {}
    })

    const account = data.users.get(id)

    if (!account) {
        new Error(`Account ${id} didn't create`)

        return { success: false, error: true, message: `Account ${id} didn't create` }
    }

    return { success: true, error: false, account }
}

function genId() {
    let random = ""
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    const stringDate = Date.now().toString()
    for (let i = 0; i < 30; i++) {
        random += characters.charAt(Math.floor(Math.random() * characters.length))

        random += stringDate[i] ? stringDate[i] : ""
    }

    return random
}

export default {
    createAccount,
    deleteAccount,
    genId
}