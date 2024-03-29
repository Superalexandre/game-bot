import Logger from "./logger.js"
import DateFns from "date-fns-tz"
import { fr as fr_locale } from "date-fns/locale/index.js"

const logger = new Logger({
    plateform: "Global"
})

async function deleteAccount({ data }) {
    data.users.forEach(async(content, id) => {
        data.users.delete(id)
    })

    return { success: true }
}

async function createAccount({ data, lang = "fr-FR", plateformData = {} }) {
    if (!data) return { success: false, error: true, message: "No database provided" }

    const id = genId({ length: 30 })

    if (data.users.has(id)) return { success: false, error: true, message: `${id} already exists` }

    data.users.set(id, {
        accountId: id,
        createdTimestamp: Date.now(),
        lang,
        plateformData,
        statistics: [],
        achievement: []
    })

    const account = data.users.get(id)

    if (!account) return { success: false, error: true, message: `Account ${id} didn't create` }

    await logger.log(`Nouveau compte sur ${plateformData[0].plateform} (${id})`)

    return { success: true, error: false, account }
}

async function mergeAccount({ data, id1, id2 }) {
    if (!id1 || !id2) return { success: false, error: true, message: "No id provided" }
    if (!data.users.has(id1) || !data.users.has(id2)) return { success: false, error: true, message: "Provided id is not in database" }

    const account1 = await data.users.get(id1)
    const account2 = await data.users.get(id2)

    if (!account1 || !account2) {
        await logger.log(`Merge account failed: ${id1} or ${id2} not found`)
     
        return { success: false, error: true, message: "Provided id is not in database" }
    }

    const newAccount = account1.createdTimestamp < account2.createdTimestamp ? account1 : account2
    const deletedAccount = account1.createdTimestamp < account2.createdTimestamp ? account2 : account1
    
    if (deletedAccount.plateformData.length > 0) data.users.push(newAccount.accountId, ...deletedAccount.plateformData, "plateformData")
    if (deletedAccount.achievement.length > 0) data.users.push(newAccount.accountId, ...deletedAccount.achievement, "achievement")
    if (deletedAccount.statistics.length > 0) data.users.push(newAccount.accountId, ...deletedAccount.statistics, "statistics")

    data.users.delete(deletedAccount.accountId)

    await logger.log(`Merge account ${id1} + ${id2}`)

    return { success: true, error: false, newAccount }
}

async function gameStats({ data, plateform, user1, user2, gameName, winnerId, gameId, guildOrChat }) {
    if (!user1 && !user2) {
        await logger.log(`Game stats failed: ${user1} or ${user2} not found`)
        
        return { success: false, error: true, message: "No user provided" }
    }
    
    if (!user1.id || (user2 && !user2.id)) {
        await logger.log(`Game stats failed (id): ${user1.id} or ${user2.id} not found`)

        return { success: false, error: true, message: "No id provided in user object" }
    }

    const user1Data = await data.users.find(user => user.plateformData.find(userData => userData.plateform === plateform && userData.data.id === user1.id))
    
    let user2Data
    if (user2) user2Data = await data.users.find(user => user.plateformData.find(userData => userData.plateform === plateform && userData.data.id === user2.id))

    // if (!user1Data || !(!user2Data && user2)) {
    //     await logger.log(`Statistiques sur ${plateform} (user 1 : ${user1.id} (${!user1Data}) user 2 : ${user2.id} (${(!user2Data && user2)})) non trouvées`)   
        
    //     return { success: false, error: true, message: "No account found" }
    // }

    let user1Result 
    if (winnerId === "loose" || winnerId === user1.id) {
        user1Result = "win"
    } else if (!user2 && winnerId !== "loose") {
        user1Result = "solo"
    } else if (user2 && winnerId === user2.id) {
        user1Result = "loose"
    } else if (user2 && winnerId !== user2.id && winnerId !== user1.id) {
        user1Result = "equality"
    } else user1Result = "error"

    try {
        data.users.push(user1Data.accountId, {
            gameName: gameName,
            guildOrChat: guildOrChat,
            gameId: gameId,
            date: Date.now(),
            plateform: plateform,
            versus: user2 ?? "solo",
            result: user1Result
        }, "statistics")
    } catch (error) {
        await logger.error(error)
    }

    if (user2 && user2Data) { 
        try {
            data.users.push(user2Data.accountId, {
                gameName: gameName,
                guildOrChat: guildOrChat,
                gameId: gameId,
                date: Date.now(),
                plateform: plateform,
                versus: user1,
                result: winnerId === user1.id ? "loose" : winnerId === user2.id ? "win" : "equality"
            }, "statistics")
        } catch (error) {
            await logger.error(error)
        }
    }

    try {
        data.games.set(gameId, {
            gameName: gameName,
            guildOrChat: guildOrChat,
            date: Date.now(),
            plateform: plateform,
            beetween: user2 ? [user1, user2] : [user1],
            result: winnerId
        })
    } catch (error) {
        await logger.error(error)
    }

    await logger.log(`Statistiques ${plateform} enregistrer (${gameId})`)

    return { success: true, error: false, user1Data, user2Data: user2Data ? user2Data : "" }
}

function genId({ length = 30, onlyNumber = false, onlyLetter = false, withDate = true }) {
    let random = ""
    let characters = ""

    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
    const numbers = "0123456789"

    if (onlyNumber) characters = numbers
    if (onlyLetter) characters = letters
    if (!onlyNumber && !onlyLetter) characters = letters + numbers

    const stringDate = Date.now().toString()
    for (let i = 0; i < length; i++) {
        random += characters.charAt(Math.floor(Math.random() * characters.length))

        if (withDate) random += stringDate[i] ? stringDate[i] : ""
    }

    return random
}

function genGameId({ gameName = "", length = 30 }) {
    let random = `${gameName}-`

    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    const stringDate = Date.now().toString()
    for (let i = 0; i < length; i++) {
        random += characters.charAt(Math.floor(Math.random() * characters.length))
    
        random += stringDate[i] ? stringDate[i] : ""
    }

    return random
}

function formatDate(date = Date.now(), timezone = "Europe/Paris", format = "dd'/'MM'/'yy pp") {
    const dateZonedTime = DateFns.utcToZonedTime(date, timezone)

    return DateFns.format(dateZonedTime, format, {
        timeZone: timezone,
        locale: fr_locale
    })
}

/**
 * @description Function for convert day date (5) to string (05)
 * 
 * @param {Date} date
 * 
 * @returns {String} Day date
 * 
 */
function formatDay(date) {
    return ("0" + date.getDate()).slice(-2)
}

/**
 * @description Function for convert month date (5) to string (05)
 * 
 * @param {Date} date
 *
 * @returns {String} Month date
 */
function formatMonth(date) {
    return ("0" + (date.getMonth() + 1)).slice(-2)
}

export {
    createAccount,
    deleteAccount,
    genId,
    genGameId,
    gameStats,
    mergeAccount,
    formatDate,
    formatDay,
    formatMonth
}