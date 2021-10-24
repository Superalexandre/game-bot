async function deleteAccount({ data }) {
    data.users.forEach(async(content, id) => {
        data.users.delete(id)
    })

    return { success: true }
}

async function createAccount({ data, lang = "fr_FR", plateformData = {} }) {
    if (!data) new Error("No database provided")

    const id = genId({ length: 30 })

    if (data.users.has(id)) return new Error(`${id} already exists`)

    await data.users.set(id, {
        accountId: id,
        createdTimestamp: Date.now(),
        lang,
        plateformData,
        statistics: [],
        achievement: []
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

async function gameStats({ data, plateform, user1, user2, gameName, winnerId, gameId, guildOrChat }) {
    if (!user1.id || !user2.id) {
        new Error("No id provided in user object")
    
        return { success: false, error: true, message: "No id provided in user object" }
    }

    const user1Data = await data.users.find(user => user.plateformData.find(data => data.plateform === plateform && data.data.id === user1.id))
    
    let user2Data
    if (user2) {
        user2Data = await data.users.find(user => user.plateformData.find(data => data.plateform === plateform && data.data.id === user2.id))
    }

    if (!user1Data || (!user2Data && user2)) {
        new Error("No account found")

        return { success: false, error: true, message: "No account found" }
    }

    await data.users.push(user1Data.accountId, {
        gameName,
        guildOrChat,
        gameId,
        date: Date.now(),
        plateform,
        versus: user2 ? user2 : "solo",
        result: user2 ? winnerId === user1.id ? "win" : winnerId === user2.id ? "loose" : "equality" : "solo"
    }, "statistics")

    if (user2 && user2Data) { 
        await data.users.push(user2Data.accountId, {
            gameName,
            guildOrChat,
            gameId,
            date: Date.now(),
            plateform,
            versus: user1,
            result: winnerId === user1.id ? "loose" : winnerId === user2.id ? "win" : "equality"
        }, "statistics")
    }

    await data.games.set(gameId, {
        gameName,
        guildOrChat,
        date: Date.now(),
        plateform,
        beetween: user2 ? [user1, user2] : [user1],
        result: winnerId
    })

    return { success: true, error: false, user1Data, user2Data: user2Data ? user2Data : "" }
}

function genId({ length = 30 }) {
    let random = ""
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    const stringDate = Date.now().toString()
    for (let i = 0; i < length; i++) {
        random += characters.charAt(Math.floor(Math.random() * characters.length))

        random += stringDate[i] ? stringDate[i] : ""
    }

    return random
}

function genGameId({ gameName = "", length = 30 }) {
    let random = `game-${gameName}-`

    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    const stringDate = Date.now().toString()
    for (let i = 0; i < length; i++) {
        random += characters.charAt(Math.floor(Math.random() * characters.length))
    
        random += stringDate[i] ? stringDate[i] : ""
    }

    return random
}

export default {
    createAccount,
    deleteAccount,
    genId,
    genGameId,
    gameStats,
    mergeAccount
}