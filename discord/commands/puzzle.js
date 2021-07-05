const Command = require("../structures/Command"),
    GraphemeSplitter = require("grapheme-splitter"),
    splitter = new GraphemeSplitter();

module.exports = class Puzzle extends Command {
    constructor(client) {
        super(client, {
            name: "puzzle",
            desc: (lang) => null,
            directory: __dirname,
            use: (lang) => null,
            example: (lang) => null
        });
    };

    async run({ client, message, args, i18n, data, userData, util }) {
        const puzzle = {
        	1: { //Id du puzzle
        		difficulty: "easy", //Difficulté
        		template: ["🟦", "🟫", "🟩", "🟧", "🟪", "🟥", "⬜", "🟨"], //Ordre des emojis
        		row: 4 //Retour a la ligne tout les ?
        	},
        	2: {
        		difficulty: "easy",
        		template: ["🟨", "⬜", "🟥", "🟪", "🟧", "🟩", "🟫", "🟦"],
        		row: 4
            },
            3: {
                difficulty: "hard",
                template: ["⬜", "🟥"],
                row: 1
            }
        }

        let selectedPuzzleID, selectedPuzzle

        console.log(selectedPuzzleID)

        if (args[0] && !isNaN(args[0])) {
            if (puzzle[args[0]] === undefined) return message.channel.send(`Le puzzle avec le numéro ${args[0]} n'est pas trouvable`)
        
            selectedPuzzleID = args[0]
            selectedPuzzle = puzzle[selectedPuzzleID]
        }

        if (args[0] && ["easy", "medium", "hard"].includes(args[0].toLowerCase())) {
            let allId = []

            for (const property in puzzle) {
                if (puzzle[property].difficulty === args[0].toLowerCase()) {
                    allId.push(property)
                }
            }

            selectedPuzzleID = allId[Math.floor(Math.random() * allId.length)]
            selectedPuzzle = puzzle[selectedPuzzleID]
        }

        const allId = Object.keys(puzzle)

        if (selectedPuzzleID === undefined) selectedPuzzleID = Math.floor(Math.random() * allId.length) + 1 
        if (selectedPuzzle === undefined) selectedPuzzle = puzzle[selectedPuzzleID]

        const copy = selectedPuzzle.template.slice()
        let piece = shuffle(copy)

        const model = genPuzzle(selectedPuzzle.template, selectedPuzzle.row)
        let actualPuzzle = genPuzzle(selectedPuzzle.template, selectedPuzzle.row, false)

        const difficulty = selectedPuzzle.difficulty
            .replace("easy", "facile")
            .replace("medium", "intermédiaire")
            .replace("hard", "difficile")

        const templateMessage = (selectedPuzzleID, difficulty, piece, model, actualPuzzle) => `Puzzle numéro : ${selectedPuzzleID}\nDifficulté : ${difficulty}\n----------\nVos pièces : ${piece.map((piece, length) => piece.endsWith("found") ? `~~${length + 1} : ${piece.replace("found", "")}~~` : `${length + 1} : ${piece}`).join(" | ")}\nModèle :\n${model}\n\nVotre puzzle :\n${actualPuzzle}`
        const templateWinMessage = (selectedPuzzleID, actualPuzzle, username) => `Puzzle numéro : ${selectedPuzzleID}\n----------\nPuzzle :\n${actualPuzzle}\n\n🎉 ${username} a fini ce puzzle 🎉`

        const mainMessage = await message.channel.send(templateMessage(selectedPuzzleID, difficulty, piece, model, actualPuzzle))

        const collector = message.channel.createMessageCollector(m => m.author.id === message.author.id)

        collector.on("collect", async(msg) => {
            if (msg.content === "stop") {
                if (msg.deletable) {
                    await msg.delete()
                }

                await mainMessage.edit(templateMessage(selectedPuzzleID, difficulty, piece, model, actualPuzzle) + "\n\nLa partie a était arreter :(")

                return await collector.stop()
            }

            let array = msg.content.split(" ")

            if (array.length <= 1) return mainMessage.edit(templateMessage(selectedPuzzleID, difficulty, piece, model, actualPuzzle) + "\n\nMerci de saisir le numéro de la piece, puis ou vous voulez la placé sur le plateau")
            if (array.length >= 3) return mainMessage.edit(templateMessage(selectedPuzzleID, difficulty, piece, model, actualPuzzle) + "\n\nMerci de saisir le numéro de la piece, puis ou vous voulez la placé sur le plateau")

            for (let i = 0; i < array.length; i++) {
                if (isNaN(array[i])) return mainMessage.edit(templateMessage(selectedPuzzleID, difficulty, piece, model, actualPuzzle) + `\n\nMerci de saisir le numéro de la piece, puis ou vous voulez la placé sur le plateau (l'argument n°${i} est invalide)`)
            }

            if (msg.deletable) {
                await msg.delete()
            }

            let result = await tryResolve(selectedPuzzle, piece[array[0] - 1], array[1] - 1, actualPuzzle, piece)

            if (!result[0]) return mainMessage.edit(templateMessage(selectedPuzzleID, difficulty, piece, model, actualPuzzle) + `\n\nEh non la pièce ne va pas ici :(`)

            actualPuzzle = genPuzzle(result[0], selectedPuzzle.row)
            piece = result[1]

            if (result[2] === true) {
                await collector.stop()
                return mainMessage.edit(templateWinMessage(selectedPuzzleID, actualPuzzle, message.author.username))
            }

            mainMessage.edit(templateMessage(selectedPuzzleID, difficulty, piece, model, actualPuzzle))
        })
    }
}

function genPuzzle(template, split, display = true) {
	let stringTemplate = ""

	for (let i = 0; i < template.length; i++) {
		if (i === split) {
			stringTemplate += "\n"
		}
    
        let numberEmote = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"]

		stringTemplate += display === true ? template[i] : numberEmote[i] ? numberEmote[i] : "❓"
	}

	return stringTemplate
}

function tryResolve(selectedPuzzle, emote, number, actualPuzzle, piece) {

	if (selectedPuzzle.template[number] === undefined) return false

	if (selectedPuzzle.template[number] !== emote) return false

    actualPuzzle = actualPuzzle.replace("\n", "")

    let array = splitter.splitGraphemes(actualPuzzle)
    
    array[number] = emote

    piece[piece.indexOf(emote)] = piece[piece.indexOf(emote)] + " found"

    let win = true
    let founded = []

    for (let i = 0; i < piece.length; i++) piece[i].endsWith("found") ? founded.push(true) : founded.push(false)

    if (founded.includes(false)) win = false

	return [array, piece, win]
}

function shuffle(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;

    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
  
    return array;
}