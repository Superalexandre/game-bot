/* eslint-disable no-irregular-whitespace */
import { Command } from "../structures/Command.js"

export default class Pendu extends Command {
    constructor(client) {
        super(client, {
            name: "pendu",
            desc: "Jouer au pendu !",
            directory: import.meta.url,
            use: "pendu",
            example: "pendu",
            aliases: ["hangman"]
        })
    }

    async run({ message }) {
        // ! TRANSLATE
        // ! STATS
        const words = [
            "bleu",
            "meme",
            "sale",
            "vide",
            "doux",
            "faux",
            "gros",
            "vrai",
            "beau",
            "cher",
            "fort",
            "haut",
            "joli",
            "long",
            "mort",
            "noir",
            "pret",
            "quoi",
            "seul",
            "tout",
            "vert",
            "aide",
            "chef",
            "mort",
            "part",
            "tour",
            "fois",
            "paix",
            "voix",
            "arme",
            "cour",
            "dame",
            "dent",
            "face",
            "faim",
            "fete",
            "idee",
            "joie",
            "main",
            "mere",
            "nuit",
            "peau",
            "peur",
            "robe",
            "tete",
            "avis",
            "bois",
            "bras",
            "gars",
            "mois",
            "pays",
            "prix",
            "sens",
            "bebe",
            "bord",
            "bout",
            "cafe",
            "camp",
            "chat",
            "ciel",
            "coin",
            "cote",
            "coup",
            "dieu",
            "etat",
            "etre",
            "fait",
            "film",
            "flic",
            "fond",
            "gout",
            "haut",
            "jour",
            "lieu",
            "long",
            "mari",
            "noir",
            "oeil",
            "papa",
            "pere",
            "pied",
            "plan",
            "reve",
            "sang",
            "seul",
            "soir",
            "tout",
            "trou",
            "truc",
            "type",
            "vent",
            "fils",
            "gens",
            "koala",
            "super",
            "autre",
            "drole",
            "grave",
            "jeune",
            "juste",
            "libre",
            "rouge",
            "bonne",
            "toute",
            "vieux",
            "blanc",
            "chaud",
            "clair",
            "droit",
            "froid",
            "grand",
            "leger",
            "petit",
            "plein",
            "garde",
            "geste",
            "gosse",
            "livre",
            "merci",
            "ombre",
            "poche",
            "annee",
            "armee",
            "balle",
            "boite",
            "carte",
            "cause",
            "chose",
            "ecole",
            "envie",
            "facon",
            "faute",
            "femme",
            "fille",
            "fleur",
            "force",
            "forme",
            "heure",
            "image",
            "jambe",
            "levre",
            "ligne",
            "maman",
            "odeur",
            "peine",
            "photo",
            "piece",
            "place",
            "porte",
            "route",
            "salle",
            "scene",
            "soeur",
            "sorte",
            "suite",
            "table",
            "terre",
            "ville",
            "choix",
            "corps",
            "cours",
            "temps",
            "vieux",
            "agent",
            "amour",
            "appel",
            "arbre",
            "avion",
            "bruit",
            "cheri",
            "chien",
            "coeur",
            "debut",
            "doigt",
            "doute",
            "droit",
            "effet",
            "frere",
            "front",
            "genre",
            "grand",
            "homme",
            "hotel",
            "matin",
            "metre",
            "monde",
            "moyen",
            "oncle",
            "ordre",
            "passe",
            "petit",
            "point",
            "reste",
            "salut",
            "signe",
            "sujet",
            "train",
            "verre",
            "facile",
            "malade",
            "pauvre",
            "propre",
            "simple",
            "triste",
            "ancien",
            "desole",
            "entier",
            "gentil",
            "humain",
            "pareil",
            "vivant",
            "enfant",
            "gauche",
            "madame",
            "bouche",
            "chance",
            "classe",
            "droite",
            "eglise",
            "epaule",
            "epoque",
            "equipe",
            "erreur",
            "espece",
            "guerre",
            "gueule",
            "langue",
            "lettre",
            "maison",
            "marche",
            "minute",
            "parole",
            "partie",
            "pensee",
            "pierre",
            "police",
            "prison",
            "raison",
            "soiree",
            "verite",
            "propos",
            "accord",
            "argent",
            "avenir",
            "bateau",
            "besoin",
            "boulot",
            "bureau",
            "chemin",
            "cheval",
            "cheveu",
            "client",
            "compte",
            "copain",
            "depart",
            "dollar",
            "ennemi",
            "esprit",
            "garcon",
            "groupe",
            "jardin",
            "maitre",
            "milieu",
            "moment",
            "numero",
            "oiseau",
            "papier",
            "parent",
            "patron",
            "peuple",
            "prince",
            "regard",
            "retard",
            "retour",
            "revoir",
            "secret",
            "siecle",
            "soldat",
            "soleil",
            "ventre",
            "visage",
            "voyage",
            "bonjour",
            "bizarre",
            "etrange",
            "heureux",
            "mauvais",
            "serieux",
            "certain",
            "content",
            "dernier",
            "nouveau",
            "premier",
            "affaire",
            "chambre",
            "couleur",
            "cuisine",
            "famille",
            "fenetre",
            "journee",
            "lumiere",
            "maniere",
            "musique",
            "oreille",
            "reponse",
            "seconde",
            "semaine",
            "voiture",
            "travers",
            "bonheur",
            "colonel",
            "courant",
            "docteur",
            "endroit",
            "exemple",
            "general",
            "honneur",
            "instant",
            "interet",
            "journal",
            "mariage",
            "medecin",
            "million",
            "nouveau",
            "passage",
            "plaisir",
            "pouvoir",
            "premier",
            "present",
            "rapport",
            "service",
            "silence",
            "sourire",
            "travail",
            "village",
            "aurevoir",
            "possible",
            "francais",
            "meilleur",
            "prochain",
            "habitude",
            "histoire",
            "personne",
            "presence",
            "question",
            "securite",
            "escalier",
            "francais",
            "monsieur",
            "probleme",
            "quartier",
            "seigneur",
            "souvenir",
            "difficile",
            "different",
            "important",
            "attention",
            "confiance",
            "situation",
            "capitaine",
            "interieur",
            "mouvement",
            "president",
            "sentiment",
            "telephone",
            "impossible",
            "tranquille",
            "professeur",
            "impression",
            "gouvernement"
        ]

        const word = words[Math.floor(Math.random() * words.length)]
        let lettersSaid = []
        let error = 0
        let errorText = ""
    
        const pendu = [
            ``, 
            `───┴──────`, 
                
            `        ┌\n` +
            `        │\n` +
            `        │\n` +
            `        │\n` +
            `        │\n` +
            `        │\n` +
            `        │\n` +
            `        │\n` +
            `        │\n` +
            `───┴──────`, 
    
    
            `        ┌────────────\n` +
            `        │\n` +
            `        │\n` +
            `        │\n` +
            `        │\n` +
            `        │\n` +
            `        │\n` +
            `        │\n` +
            `        │\n` +
            `───┴──────`, 
    
    
            `        ┌────────────\n` +
            `        │    /\n` +
            `        │  /\n` +
            `        │/\n` +
            `        │\n` +
            `        │\n` +
            `        │\n` +
            `        │\n` +
            `        │\n` +
            `───┴──────`, 
    
    
            `        ┌─────────┬──\n` +
            `        │    /                  │\n` +
            `        │  /                    │\n` +
            `        │/\n` +
            `        │\n` +
            `        │\n` +
            `        │\n` +
            `        │\n` +
            `        │\n` +
            `───┴──────`,
    
    
            `        ┌─────────┬──\n` +
            `        │    /                  │\n` +
            `        │  /                    │\n` +
            `        │/                      O\n` +
            `        │\n` +
            `        │\n` +
            `        │\n` +
            `        │\n` +
            `        │\n` +
            `───┴──────`,
    
    
            `        ┌─────────┬──\n`+
            `        │    /                  │\n`+
            `        │  /                    │\n`+
            `        │/                      O\n`+
            `        │                       /|\\\n`+
            `        │\n`+
            `        │\n`+
            `        │\n`+
            `        │\n`+
            `───┴──────`,
    
    
            `        ┌─────────┬──\n` +
            `        │    /                  │\n` +
            `        │  /                    │\n` +
            `        │/                      O\n` +
            `        │                       /|\\\n` +
            `        │                       / \\\n` +
            `        │\n` +
            `        │\n` +
            `        │\n` +
            `───┴──────`
        ]
    
        // eslint-disable-next-line no-useless-escape
        const genWord = (word, lettersSaid) => word.split("").map(letter => lettersSaid.includes(letter) ? letter : "\_").join("")
        const genText = (word, lettersSaid, error, errorText) => `Mot : ${genWord(word, lettersSaid)}\nLettre(s) dit(es) ${lettersSaid.length > 0 ? lettersSaid.map(letter => `${letter}`).join(", ") : "aucune"}\n${pendu[error] !== "" ? `${pendu[error === pendu.length ? error - 1 : error]}\n\n${error}/${pendu.length}` : ""}\n${errorText ? errorText : ""}`
    
        // const msg = await interaction.channel.send({
        //     content: `${i18n.__("discord.global.gameOf")} ${interaction.user.username}\n${i18n.__("discord.hangman.gameReady")}\n\n\n${genText(word, lettersSaid, error, errorText)}`
        // })
        
        message.chat.sendMessage(`${message.author.username} t'as partie est prête, tu peux l'arrêter en tapant stop.\n\n${genText(word, lettersSaid, error, errorText)}`)

        const filter = (msg) => msg.author.id === message.author.id
        const collector = await message.createMessageCollector({ filter })
    
        collector.on("message", async(m) => {
            m.content = m.content.toLowerCase()
    
            if (m.content === "stop") {
                await collector.end()
    
                return await message.chat.sendMessage(`${message.author.username} tu as arreter la partie ! le mot était ${word}`)
            }
    
            if (m.content.length !== 1 || !m.content.match(/[a-z]|[A-Z]/i)) {
                errorText = "Que les lettres sont acceptées !"
    
                return await message.chat.sendMessage(`Partie de ${message.author.username}\n` + genText(word, lettersSaid, error, errorText))
            }
    
            if (lettersSaid.includes(m.content)) {
                errorText = "cette lettre a déjà été dites !"
    
                return await message.chat.sendMessage(`Partie de ${message.author.username}\n` + genText(word, lettersSaid, error, errorText))
            }
    
            errorText = ""
            lettersSaid.push(m.content)
    
            if (genWord(word, lettersSaid) === word) {
                await collector.end()
    
                return await message.chat.sendMessage(`${error === 0 ? `Parfait ! ${message.author.username} ` : `Bravo ${message.author.username} tu as gagné !`}\nLe mot été bien ${word}\n${error > 0 ? `${pendu[error === pendu.length ? error - 1 : error]}\n\n${error}/${pendu.length}` : ""}`)
            }
    
            if (!word.split("").includes(m.content)) error = error + 1
    
            if (!pendu[error] && error >= 1) {
                await collector.end()
    
                return await message.chat.sendMessage(`Oh non ${message.author.username} tu as perdu, le mot été ${word}\n${pendu[error === pendu.length ? error - 1 : error]}\n\n${error}/${pendu.length}`)
            }
    
            return await message.chat.sendMessage(`Partie de ${message.author.username}\n` + genText(word, lettersSaid, error, errorText))
        })
    }
}