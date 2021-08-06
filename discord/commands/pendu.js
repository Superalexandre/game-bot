const Command = require("../structures/Command")
const { MessageButton, MessageActionRow } = require("discord.js")

module.exports = class Pendu extends Command {
    constructor(client) {
        super(client, {
            name: "pendu",
            //desc: (lang) => lang.get("PENDU_DESCRIPTION"),
            directory: __dirname,
            //use: (lang) => lang.get("PENDU_USAGE"),
            //example: (lang) => lang.get("PENDU_EXAMPLE"),
            aliases: ["hangman"]
        });
    };

    async run({ client, message, args, i18n, data, userData, util }) {
		return selectLength({ message, i18n })
    }
}

async function selectLength({ message, i18n }) {
	const words = ["bonjour", "aurevoir", "koala", "bleu","super","autre","bizarre","difficile","drole","etrange","facile","grave","impossible","jeune","juste","libre","malade","meme","pauvre","possible","propre","rouge","sale","simple","tranquille","triste","vide","bonne","toute","doux","faux","francais","gros","heureux","mauvais","serieux","vieux","vrai","ancien","beau","blanc","certain","chaud","cher","clair","content","dernier","desole","different","droit","entier","fort","froid","gentil","grand","haut","humain","important","joli","leger","long","meilleur","mort","noir","nouveau","pareil","petit","plein","premier","pret","prochain","quoi","seul","tout","vert","vivant","aide","chef","enfant","garde","gauche","geste","gosse","livre","merci","mort","ombre","part","poche","professeur","tour","fois","madame","paix","voix","affaire","annee","arme","armee","attention","balle","boite","bouche","carte","cause","chambre","chance","chose","classe","confiance","couleur","cour","cuisine","dame","dent","droite","ecole","eglise","envie","epaule","epoque","equipe","erreur","espece","face","facon","faim","famille","faute","femme","fenetre","fete","fille","fleur","force","forme","guerre","gueule","habitude","heure","histoire","idee","image","impression","jambe","joie","journee","langue","lettre","levre","ligne","lumiere","main","maison","maman","maniere","marche","mere","minute","musique","nuit","odeur","oreille","parole","partie","peau","peine","pensee","personne","peur","photo","piece","pierre","place","police","porte","presence","prison","question","raison","reponse","robe","route","salle","scene","seconde","securite","semaine","situation","soeur","soiree","sorte","suite","table","terre","tete","verite","ville","voiture","avis","bois","bras","choix","corps","cours","gars","mois","pays","prix","propos","sens","temps","travers","vieux","accord","agent","amour","appel","arbre","argent","avenir","avion","bateau","bebe","besoin","bonheur","bord","boulot","bout","bruit","bureau","cafe","camp","capitaine","chat","chemin","cheri","cheval","cheveu","chien","ciel","client","coeur","coin","colonel","compte","copain","cote","coup","courant","debut","depart","dieu","docteur","doigt","dollar","doute","droit","effet","endroit","ennemi","escalier","esprit","etat","etre","exemple","fait","film","flic","fond","francais","frere","front","garcon","general","genre","gout","gouvernement","grand","groupe","haut","homme","honneur","hotel","instant","interet","interieur","jardin","jour","journal","lieu","long","maitre","mari","mariage","matin","medecin","metre","milieu","million","moment","monde","monsieur","mouvement","moyen","noir","nouveau","numero","oeil","oiseau","oncle","ordre","papa","papier","parent","passage","passe","patron","pere","petit","peuple","pied","plaisir","plan","point","pouvoir","premier","present","president","prince","probleme","quartier","rapport","regard","reste","retard","retour","reve","revoir","salut","sang","secret","seigneur","sentiment","service","seul","siecle","signe","silence","soir","soldat","soleil","sourire","souvenir","sujet","telephone","tout","train","travail","trou","truc","type","vent","ventre","verre","village","visage","voyage","fils","gens"]

	/*
	
	Court (~5 lettres) 
	Normal (~10 lettres)
	Long (~20 lettres)
	Aléatoire

	*/

    const sort = new MessageButton()
        .setStyle("green")
        .setLabel("Facile (~5 caractères)")
        .setID(`game_pendu_${message.author.id}_difficulty_5`)

	const normal = new MessageButton()
        .setStyle("gray")
        .setLabel("Normal (~10 caractères)")
        .setID(`game_pendu_${message.author.id}_difficulty_10`)

	const long = new MessageButton()
        .setStyle("red")
        .setLabel("Difficile (~15 caractères)")
        .setID(`game_pendu_${message.author.id}_difficulty_15`)

	const random = new MessageButton()
        .setStyle("blurple")
        .setLabel("Aléatoire")
        .setID(`game_pendu_${message.author.id}_difficulty_random`)

    const row = new MessageActionRow()
		.addComponents([ sort, normal, long, random])

	let msg = await message.channel.send("Merci de séléctionner la difficulté", {
		components: [ row ]
	})

	const collector = msg.createButtonCollector((button) => button)

	collector.on("collect", async(button) => {
        if (!button.clicker || !button.clicker.user || !button.clicker.user.id) await button.clicker.fetch()

        if (button.clicker.user.id !== message.author.id) return await button.reply.send(`Désolé mais ce n'est pas votre partie, pour en lancer une faites !pendu`, true)

		const id = button.id.split("_")

		const length = id[4] === "5" ? 5 : id[4] === "10" ? 10 : id[4] === "15" ? 15 : -1

		let sorted = words.sort((a, b) => a.length > b.length ? 1 : a.length < b.length ? -1 : 0)
		
		if (length >= 0) sorted = sorted.filter((element) => [length - 2, length - 1, length, length + 1, length + 2].includes(element.length))
		
		const word = sorted[Math.floor(Math.random() * sorted.length)]

		await collector.stop()
		await button.reply.defer()
	
		return startGame({ message, msg, i18n, word })
	})
}

async function startGame({ message, msg, i18n, word }) {
	if (!word) return msg.edit("Une erreur est survenue aucun mot trouver", null)

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
		`───┴──────`,
	]

	const genWord = (word, lettersSaid) => word.split("").map(letter => lettersSaid.includes(letter) ? letter : "\_").join("")
	const genText = (word, lettersSaid, error, errorText) => `Mot : \`${genWord(word, lettersSaid)}\`\nLettre deja dites : ${lettersSaid.length > 0 ? lettersSaid.map(letter => `\`${letter}\``).join(", ") : "aucune lettre"}\n${pendu[error] !== "" ? `\`\`\`${pendu[error === pendu.length ? error - 1 : error]}\n\n${error}/${pendu.length}\`\`\`` : ""}\n${errorText ? errorText : ""}`

	await msg.edit(`Votre partie est prête, pour arreter celle-ci vous pouvez dire \`stop\`, le mot qu'on cherche n'a pas d'accent !\nBon courage !\n\n\n${genText(word, lettersSaid, error, errorText)}`, null)
	
	const collector = await message.channel.createMessageCollector((m) => m.author.id === message.author.id)

	collector.on("collect", async(m) => {
		m.content = m.content.toLowerCase()

		if (m.content === "stop") {
			await collector.stop()
			await m.delete().catch(e => {})

			return await msg.edit(`Vous avez arreter la partie, le mot était : ${word}`, null)
		}

		if (m.content.length !== 1 || !m.content.match(/[a-z]|[A-Z]/i)) {
			errorText = "Uniquement les lettres sont accepté"

			return await msg.edit(genText(word, lettersSaid, error, errorText), null)
		}

		if (lettersSaid.includes(m.content)) {
			await m.delete().catch(e => {})
			errorText = "Vous avez deja dis cette lettre"

			return await msg.edit(genText(word, lettersSaid, error, errorText), null)
		}

		errorText = ""
		lettersSaid.push(m.content)
		await m.delete().catch(e => {})

		if (genWord(word, lettersSaid) === word) {
			await collector.stop()
			await m.delete().catch(e => {})

			return await msg.edit(`${error === 0 ? `Parfait ! ${message.author.username} a trouver sans aucune erreur !` : `Bravo ${message.author.username} a gagnger !`}\nLe mot : ${word}\n${error > 0 ? `\`\`\`${pendu[error === pendu.length ? error - 1 : error]}\n\n${error}/${pendu.length}\`\`\`` : ""}`, null)
		}

		if (!word.split("").includes(m.content)) error = error + 1

		if (!pendu[error] && error >= 1) {
			await collector.stop()
			await m.delete().catch(e => {})

			return await msg.edit(`Oh non ${message.author.username} a perdu\nLe mot était : ${word}\n\`\`\`${pendu[error === pendu.length ? error - 1 : error]}\n\n${error}/${pendu.length}\`\`\``, null)
		}

		return await msg.edit(genText(word, lettersSaid, error, errorText), null)
	})
}