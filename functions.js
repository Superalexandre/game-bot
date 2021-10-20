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

async function mergeAccount({ data, id1, id2 }) {
    if (!data.users.has(id1) || !data.users.has(id2)) return new Error(`Provided id is not in database`)

    const account1 = await data.users.get(id1)
    const account2 = await data.users.get(id2)

    const newAccount = account1.createdTimestamp > account2.createdTimestamp ? account1 : account2
    const deletedAccount = account1.createdTimestamp > account2.createdTimestamp ? account2 : account1

    //! TODO

    await data.users.delete(deletedAccount.id)

    return { success: true, error: false, newAccount }
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
    genId,
    mergeAccount
}