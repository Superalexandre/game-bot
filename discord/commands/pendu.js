const Command = require("../structures/Command")

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

    async run({ client, interaction, options, i18n, data, userData, util }) {
		const words = ["bonjour", "aurevoir", "koala", "bleu","super","autre","bizarre","difficile","drole","etrange","facile","grave","impossible","jeune","juste","libre","malade","meme","pauvre","possible","propre","rouge","sale","simple","tranquille","triste","vide","bonne","toute","doux","faux","francais","gros","heureux","mauvais","serieux","vieux","vrai","ancien","beau","blanc","certain","chaud","cher","clair","content","dernier","desole","different","droit","entier","fort","froid","gentil","grand","haut","humain","important","joli","leger","long","meilleur","mort","noir","nouveau","pareil","petit","plein","premier","pret","prochain","quoi","seul","tout","vert","vivant","aide","chef","enfant","garde","gauche","geste","gosse","livre","merci","mort","ombre","part","poche","professeur","tour","fois","madame","paix","voix","affaire","annee","arme","armee","attention","balle","boite","bouche","carte","cause","chambre","chance","chose","classe","confiance","couleur","cour","cuisine","dame","dent","droite","ecole","eglise","envie","epaule","epoque","equipe","erreur","espece","face","facon","faim","famille","faute","femme","fenetre","fete","fille","fleur","force","forme","guerre","gueule","habitude","heure","histoire","idee","image","impression","jambe","joie","journee","langue","lettre","levre","ligne","lumiere","main","maison","maman","maniere","marche","mere","minute","musique","nuit","odeur","oreille","parole","partie","peau","peine","pensee","personne","peur","photo","piece","pierre","place","police","porte","presence","prison","question","raison","reponse","robe","route","salle","scene","seconde","securite","semaine","situation","soeur","soiree","sorte","suite","table","terre","tete","verite","ville","voiture","avis","bois","bras","choix","corps","cours","gars","mois","pays","prix","propos","sens","temps","travers","vieux","accord","agent","amour","appel","arbre","argent","avenir","avion","bateau","bebe","besoin","bonheur","bord","boulot","bout","bruit","bureau","cafe","camp","capitaine","chat","chemin","cheri","cheval","cheveu","chien","ciel","client","coeur","coin","colonel","compte","copain","cote","coup","courant","debut","depart","dieu","docteur","doigt","dollar","doute","droit","effet","endroit","ennemi","escalier","esprit","etat","etre","exemple","fait","film","flic","fond","francais","frere","front","garcon","general","genre","gout","gouvernement","grand","groupe","haut","homme","honneur","hotel","instant","interet","interieur","jardin","jour","journal","lieu","long","maitre","mari","mariage","matin","medecin","metre","milieu","million","moment","monde","monsieur","mouvement","moyen","noir","nouveau","numero","oeil","oiseau","oncle","ordre","papa","papier","parent","passage","passe","patron","pere","petit","peuple","pied","plaisir","plan","point","pouvoir","premier","present","president","prince","probleme","quartier","rapport","regard","reste","retard","retour","reve","revoir","salut","sang","secret","seigneur","sentiment","service","seul","siecle","signe","silence","soir","soldat","soleil","sourire","souvenir","sujet","telephone","tout","train","travail","trou","truc","type","vent","ventre","verre","village","visage","voyage","fils","gens"]
		const length = options.getString("longueur") === "random" ? -1 : options.getString("longueur")

		let sorted = words.sort((a, b) => a.length > b.length ? 1 : a.length < b.length ? -1 : 0)
		
		if (length >= 0) sorted = sorted.filter((element) => [length - 2, length - 1, length, length + 1, length + 2].includes(element.length))
		
		const word = sorted[Math.floor(Math.random() * sorted.length)]

		return startGame({ interaction, i18n, word })
    }
}

async function startGame({ interaction, i18n, word }) {
	if (!word) return await interaction.editReply({
		content: "Une erreur est survenue aucun mot trouver",
		ephemeral: true
	})

	//await interaction.editReply({
	//	content: "Partie lancée ✅",
	//	ephemeral: true
	//})

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

	const msg = await interaction.channel.send({
		content: `Partie de : ${interaction.user.username}\nVotre partie est prête, pour arreter celle-ci vous pouvez dire \`stop\`, le mot qu'on cherche n'a pas d'accent !\nBon courage !\n\n\n${genText(word, lettersSaid, error, errorText)}`
	})
	
	const filter = (message) => message.author.id === interaction.user.id
	const collector = await interaction.channel.createMessageCollector({ filter })

	collector.on("collect", async(m) => {
		m.content = m.content.toLowerCase()

		if (m.content === "stop") {
			await collector.stop()
			await m.delete().catch(e => {})

			return await msg.edit({
				content: `${interaction.user.username} a arreter la partie, le mot était : ${word}`
			})
		}

		if (m.content.length !== 1 || !m.content.match(/[a-z]|[A-Z]/i)) {
			errorText = "Uniquement les lettres sont accepté"

			return await msg.edit({
				content: `Partie de : ${interaction.user.username}\n` + genText(word, lettersSaid, error, errorText)
			})
		}

		if (lettersSaid.includes(m.content)) {
			await m.delete().catch(e => {})
			errorText = "Vous avez deja dis cette lettre"

			return await msg.edit({
				content: `Partie de : ${interaction.user.username}\n` + genText(word, lettersSaid, error, errorText)
			})
		}

		errorText = ""
		lettersSaid.push(m.content)
		await m.delete().catch(e => {})

		if (genWord(word, lettersSaid) === word) {
			await collector.stop()
			await m.delete().catch(e => {})

			return await msg.edit({
				content: `${error === 0 ? `Parfait ! ${interaction.user.username} a trouver sans aucune erreur !` : `Bravo ${interaction.user.username} a gagnger !`}\nLe mot : ${word}\n${error > 0 ? `\`\`\`${pendu[error === pendu.length ? error - 1 : error]}\n\n${error}/${pendu.length}\`\`\`` : ""}`
			})
		}

		if (!word.split("").includes(m.content)) error = error + 1

		if (!pendu[error] && error >= 1) {
			await collector.stop()
			await m.delete().catch(e => {})

			return await msg.edit({
				content: `Oh non ${interaction.user.username} a perdu\nLe mot était : ${word}\n\`\`\`${pendu[error === pendu.length ? error - 1 : error]}\n\n${error}/${pendu.length}\`\`\``
			})
		}

		return await msg.edit({
			content: `Partie de : ${interaction.user.username}\n` + genText(word, lettersSaid, error, errorText)
		})
	})
}