# game-bot

A fun discord bot

## Road map

✅ : Fini \
❌ : Annuler \
🚧 : En cours \
❓ : Idée \
❗ : Prioritaire \

### Global

✅ Mise a jour v13 discord.js
✅ Unknown interaction bug
✅ [En cours] Refaire les commandes en /
✅ Event message
✅ Traduction
✅ Logger
🚧 Systeme pour automatiquement verifier les commandes (les ajoutées, ou les mettres a jour desc etc)
&emsp;=>✅ Crée les commandes
&emsp;=>🚧 Modifier si changement
🚧 Compte et base de données
&emsp;=>🚧 **GAME ID**
&emsp;&emsp;=>✅ Add server or chat
&emsp;&emsp;=>✅ Insta
&emsp;&emsp;=>🚧 Discord (1/8)
&emsp;=>✅ Crée un compte
&emsp;=>**❗ Merge compte**
&emsp;=>✅ Ajouter stats
&emsp;&emsp;=>✅ **Probleme** insta redémarrage = plus id = restockage
&emsp;&emsp;=>✅ Donc il peut pas add les stats
&emsp;=> 🚧 Commande profile
&emsp;&emsp;=>🚧 Voir ses données stockés
&emsp;&emsp;=>🚧 Supprimer un compte respect des données
✅ Sentry, gitguardian

### Site

**❗ RGPD**
✅ Thème blanc
✅ Finir la nav bar
🚧 Favico
✅ Theme localstorage
✅ Components
&emsp;=>✅ Notif
&emsp;&emsp;=>✅ Space beetween
&emsp;&emsp;=>✅ State
🚧 Login
&emsp;=>✅ Rework pour retirer passport-discord
&emsp;=>🚧 Instagram
🚧 Page d'acceuil

### Uno

✅ Refaire en slash command
✅ RemoveCard function ré ajouter dans la config
✅ Pouvoir faire un retour (cartes spéciales)
✅ Pouvoir jouer la carte piocher après avoir piocher
✅ Si trop de carte faire deux, trois pages
✅ Erreur page
✅ Unknow interaction ??? interaction.editReply **(Double start)**
🚧 GameData (70%)
&emsp;✅ Probleme 1v1 changement de sens  
&emsp;&emsp;=> ✅ Ajouter skip turn  
&emsp;✅ Pouvoir jouer plusieurs cartes
&emsp;&emsp;=> ✅ playersData[ id ].activesCard = []
&emsp;&emsp;=> ✅ Button click -> push id -> Green
&emsp;&emsp;=> ✅ If already click -> remove id -> Red
&emsp;&emsp;=> ✅ Play button -> remove card -> last card = active
&emsp;&emsp;=> ✅ Probleme switch quand on en joue plusieurs  
&emsp;&emsp;=> ✅ Probleme skip quand on en joue plusieurs  
&emsp;&emsp;=> ✅ Probleme carte changement de couleur et +4
&emsp;&emsp;=> 🚧 Probleme une carte (deux ?) skip = null **(Unknown)**
&emsp;&emsp;=> ✅ Probleme jouer plusieurs carte
&emsp;✅ Pouvoir "surencherir" (+2, +4)
&emsp;&emsp;=> ✅ Don't skip and disable color
&emsp;&emsp;=> ✅ Passer son tour (et donc piocher) (CantPlayCard, button id)
&emsp;&emsp;=> ✅ Si le joueur n'a pas encore vue ses cartes le bouton "Je ne peux pas surencherir" n'apparait pas
&emsp;&emsp;=> ✅ Erreur lorsque la carte est un changement de couleur (Probleme avec le outbid)
&emsp;❌ Refaire les messages
&emsp;&emsp;=> Faire une fonction getMessage() avec erreur et config + historique
&emsp;✅ Distribution des cartes spéciales
&emsp;&emsp;=> If +2 add to first player and skip
&emsp;&emsp;=> If switch color first player select
&emsp;🚧 Pouvoir buffler au +4
&emsp;&emsp;=> If disable = Error message
&emsp;&emsp;=> If enable ask if player bluff
&emsp;&emsp;&emsp;-> Yes but no => +6
&emsp;&emsp;&emsp;-> Yes and yes => User +4
🚧 Impossible d'undo le +4 quand il est séléctionner
❌ Si piocher et qu'une carte peut etre jouer envoyer un avertissement
✅ Gerer le end game
🚧 Pouvoir personnalisé sa config (/profile config uno)

### Need test

🚧 Probleme skip quand on en joue plusieurs (1v1 meme probleme ?)
🚧 Probleme switch quand on en joue plusieurs

### Puissance 4

✅ Probleme trad placement impossible (puissance4.cantPlayHere)
✅ Probleme start turn (mauvaise trad)
✅ Opti gif (Probleme encoder : 1-2 secondes par frame)
✅ Jouer contre le bot
&emsp;=> Replay

### Instagram

✅ Message en attente => A ouvrir (ignorer si trop vieux)
✅ Message non lu => A lire (ignorer, bot off)
✅ Restructuration

### Release

✅ Logo
🚧 Release (Prévue 16 janvier anniv Sudref)

### Sodoku

✅ <https://github.com/robatron/sudoku.js>

### Tetris

✅ Rotate (bizzare comment c'est fait on peu pas déplacer alors que si)
✅ Arrow
✅ **Place bottom**
✅ Ajouter des fleches pour aller directement de l'autre coter
✅ <https://cdn.discordapp.com/attachments/850790441703702589/866167196061532190/Penetris_Guide.mp4>
✅ A test  

### Petit chevaux

🚧 Rework

### Monopoly

🚧 Todo complet

### Loup garou ?

🚧 A reflechir
