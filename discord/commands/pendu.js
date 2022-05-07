import { Command } from "../structures/Command.js"

export default class Pendu extends Command {
    constructor(client) {
        super(client, {
            name: "pendu",
            description: "Jouez au pendu facilement",
            options: [
                {
                    type: "STRING",
                    name: "longueur",
                    description: "Longueur du mot",
                    required: true,
                    choices: [
                        [ "Facile (5 caractères)", "5" ], 
                        [ "Normal (10 caractères)", "10" ], 
                        [ "Difficile (15 caractères)", "15" ], 
                        [ "Aléatoire", "random" ]
                    ]
                }
            ],
            directory: import.meta.url
        })
    }

    async run({ client, interaction, options, i18n }) {
        const words = i18n.__("discord.hangman.wordList")
        const length = options.getString("longueur") === "random" ? -1 : options.getString("longueur")

        let sorted = words.sort((a, b) => a.length > b.length ? 1 : a.length < b.length ? -1 : 0)
		
        if (length >= 0) sorted = sorted.filter((element) => [length - 2, length - 1, length, length + 1, length + 2].includes(element.length))
		
        const word = sorted[Math.floor(Math.random() * sorted.length)]

        return startGame({ client, interaction, i18n, word })
    }
}

async function startGame({ client, interaction, i18n, word }) {
    if (!word) return await interaction.editReply({
        content: i18n.__("discord.hangman.error.noWordFound"),
        ephemeral: true
    })

    let lettersSaid = []
    let error = 0
    let errorText = ""

    const pendu = [
        ``, 
        `───┴──────`, 
			
        `   ┌\n` +
		`   │\n` +
		`   │\n` +
		`   │\n` +
		`   │\n` +
		`   │\n` +
		`   │\n` +
		`   │\n` +
		`   │\n` +
		`───┴──────`, 


        `   ┌────────────\n` +
		`   │\n` +
		`   │\n` +
		`   │\n` +
		`   │\n` +
		`   │\n` +
		`   │\n` +
		`   │\n` +
		`   │\n` +
		`───┴──────`, 


        `   ┌────────────\n` +
		`   │  /\n` +
		`   │ /\n` +
		`   │/\n` +
		`   │\n` +
		`   │\n` +
		`   │\n` +
		`   │\n` +
		`   │\n` +
		`───┴──────`, 


        `   ┌─────────┬──\n` +
		`   │  /      │\n` +
		`   │ /       │\n` +
		`   │/\n` +
		`   │\n` +
		`   │\n` +
		`   │\n` +
		`   │\n` +
		`   │\n` +
		`───┴──────`,


        `   ┌─────────┬──\n` +
		`   │  /      │\n` +
		`   │ /       │\n` +
		`   │/        O\n` +
		`   │\n` +
		`   │\n` +
		`   │\n` +
		`   │\n` +
		`   │\n` +
		`───┴──────`,


        `   ┌─────────┬──\n`+
		`   │  /      │\n`+
		`   │ /       │\n`+
		`   │/        O\n`+
		`   │        /|\\\n`+
		`   │\n`+
		`   │\n`+
		`   │\n`+
		`   │\n`+
		`───┴──────`,


        `   ┌─────────┬──\n` +
		`   │  /      │\n` +
		`   │ /       │\n` +
		`   │/        O\n` +
		`   │        /|\\\n` +
		`   │        / \\\n` +
		`   │\n` +
		`   │\n` +
		`   │\n` +
		`───┴──────`
    ]

    // eslint-disable-next-line no-useless-escape
    const genWord = (word, lettersSaid) => word.split("").map(letter => lettersSaid.includes(letter) ? letter : "\_").join("")
    const genText = (word, lettersSaid, error, errorText) => `${i18n.__("discord.hangman.word")} \`${genWord(word, lettersSaid)}\`\n${i18n.__("discord.hangman.lettersSaid")} ${lettersSaid.length > 0 ? lettersSaid.map(letter => `\`${letter}\``).join(", ") : i18n.__("discord.hangman.noLetter")}\n${pendu[error] !== "" ? `\`\`\`${pendu[error === pendu.length ? error - 1 : error]}\n\n${error}/${pendu.length}\`\`\`` : ""}\n${errorText ? errorText : ""}`

    const msg = await interaction.channel.send({
        content: `${i18n.__("discord.global.gameOf")} ${interaction.user.username}\n${i18n.__("discord.hangman.gameReady")}\n\n\n${genText(word, lettersSaid, error, errorText)}`
    })
	
    const filter = (message) => message.author.id === interaction.user.id
    const collector = await interaction.channel.createMessageCollector({ filter })

    collector.on("collect", async(m) => {
        m.content = m.content.toLowerCase()

        if (m.content === "stop") {
            await collector.stop()
            await m.delete().catch(() => {
                return
            })

            return await msg.edit({
                content: `${interaction.user.username} ${i18n.__("discord.hangman.gameStop")} ${word}`
            })
        }

        if (m.content.length !== 1 || !m.content.match(/[a-z]|[A-Z]/i)) {
            errorText = i18n.__("discord.hangman.error.onlyLetters")

            return await msg.edit({
                content: `${i18n.__("discord.global.gameOf")} ${interaction.user.username}\n` + genText(word, lettersSaid, error, errorText)
            })
        }

        if (lettersSaid.includes(m.content)) {
            await m.delete().catch(() => {
                return
            })
            errorText = i18n.__("discord.hangman.error.alreadySaid")

            return await msg.edit({
                content: `${i18n.__("discord.global.gameOf")} ${interaction.user.username}\n` + genText(word, lettersSaid, error, errorText)
            })
        }

        errorText = ""
        lettersSaid.push(m.content)
        await m.delete().catch(() => {
            return
        })

        if (genWord(word, lettersSaid) === word) {
            await collector.stop()
            await m.delete().catch(() => {
                return
            })

            const gameId = await client.functions.genGameId({ gameName: "pendu", length: 30 })
            const guild = await interaction.guild.fetch()
            const user = await interaction.user.fetch()

            await client.functions.gameStats({ 
                data: client.data, 
                gameId,
                guildOrChat: {
                    type: "guild",
                    data: guild
                },
                plateform: "discord", 
                user1: user,
                gameName: "pendu", 
                winnerId: user.id
            })

            return await msg.edit({
                content: `${error === 0 ? i18n.__("discord.hangman.result.win.perfect", { username: interaction.user.username }) : i18n.__("discord.hangman.result.win.normal", { username: interaction.user.username })}\n${i18n.__("discord.hangman.result.win.word")} ${word}\n${error > 0 ? `\`\`\`${pendu[error === pendu.length ? error - 1 : error]}\n\n${error}/${pendu.length}\`\`\`` : ""}`
            })
        }

        if (!word.split("").includes(m.content)) error = error + 1

        if (!pendu[error] && error >= 1) {
            await collector.stop()
            await m.delete().catch(() => {
                return
            })

            const gameId = await client.functions.genGameId({ gameName: "pendu", length: 30 })
            const guild = await interaction.guild.fetch()
            const user = await interaction.user.fetch()

            await client.functions.gameStats({ 
                data: client.data, 
                gameId,
                guildOrChat: {
                    type: "guild",
                    data: guild
                },
                plateform: "discord", 
                user1: user,
                gameName: "pendu", 
                winnerId: "loose"
            })

            return await msg.edit({
                content: `${i18n.__("discord.hangman.result.loose", { username: interaction.user.username })} ${word}\n\`\`\`${pendu[error === pendu.length ? error - 1 : error]}\n\n${error}/${pendu.length}\`\`\``
            })
        }

        return await msg.edit({
            content: `${i18n.__("discord.global.gameOf")} ${interaction.user.username}\n` + genText(word, lettersSaid, error, errorText)
        })
    })
}