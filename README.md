# game-bot
A fun discord bot

# Road map

✅ : Fini
❌ : Annuler
🚧 : En cours

### Global
✅ Mise a jour v13 discord.js <br/>
✅ Unknown interaction bug <br/>
✅ [En cours] Refaire les commandes en / <br/>
✅ Event message <br/>
✅ Traduction <br/>
🚧 Logger <br/>
🚧 Systeme pour automatiquement verifier les commandes (les ajoutées, ou les mettres a jour desc etc) <br/>
🚧 Sentry, gitguardian <br/>

### Uno
✅ Refaire en slash command <br/>
✅ RemoveCard function ré ajouter dans la config <br/>
✅ Pouvoir faire un retour (cartes spéciales) <br/>
✅ Pouvoir jouer la carte piocher après avoir piocher <br/>
✅ Si trop de carte faire deux, trois pages <br/>
✅ Erreur page <br/>
✅ Unknow interaction ??? interaction.editReply **(Double start)** <br/>
🚧 GameData (70%) <br/>
&emsp;✅ Probleme 1v1 changement de sens  <br/>
&emsp;&emsp;=> ✅ Ajouter skip turn  <br/>
&emsp;✅ Pouvoir jouer plusieurs cartes <br/>
&emsp;&emsp;=> ✅ playersData[ id ].activesCard = [] <br/>
&emsp;&emsp;=> ✅ Button click -> push id -> Green <br/>
&emsp;&emsp;=> ✅ If already click -> remove id -> Red <br/>
&emsp;&emsp;=> ✅ Play button -> remove card -> last card = active <br/>
&emsp;&emsp;=> ✅ Probleme switch quand on en joue plusieurs  <br/>
&emsp;&emsp;=> ✅ Probleme skip quand on en joue plusieurs  <br/>
&emsp;&emsp;=> ✅ Probleme carte changement de couleur et +4 <br/>
&emsp;&emsp;=> 🚧 Probleme une carte (deux ?) skip = null **(Unknown)** <br/>
&emsp;&emsp;=> ✅ Probleme jouer plusieurs carte <br/>
&emsp;✅ Pouvoir "surencherir" (+2, +4) <br/>
&emsp;&emsp;=> ✅ Don't skip and disable color <br/>
&emsp;&emsp;=> ✅ Passer son tour (et donc piocher) (CantPlayCard, button id) <br/>
&emsp;&emsp;=> ✅ Si le joueur n'a pas encore vue ses cartes le bouton "Je ne peux pas surencherir" n'apparait pas <br/>
&emsp;&emsp;=> ✅ Erreur lorsque la carte est un changement de couleur (Probleme avec le outbid) <br/>
&emsp;❌ Refaire les messages <br/>
&emsp;&emsp;=> Faire une fonction getMessage() avec erreur et config + historique <br/>
&emsp;✅ Distribution des cartes spéciales <br/>
&emsp;&emsp;=> If +2 add to first player and skip <br/>
&emsp;&emsp;=> If switch color first player select <br/>
&emsp;🚧 Pouvoir buffler au +4 <br/>
&emsp;&emsp;=> If disable = Error message <br/>
&emsp;&emsp;=> If enable ask if player bluff <br/>
&emsp;&emsp;&emsp;-> Yes but no => +6 <br/>
&emsp;&emsp;&emsp;-> Yes and yes => User +4 <br/>
🚧 Impossible d'undo le +4 quand il est séléctionner <br/>
❌ Si piocher et qu'une carte peut etre jouer envoyer un avertissement <br/>
✅ Gerer le end game <br/>
🚧 Pouvoir personnalisé sa config (/config uno) <br/>

### Need test
🚧 Probleme skip quand on en joue plusieurs (1v1 meme probleme ?)<br/>
🚧 Probleme switch quand on en joue plusieurs <br/>

### Puissance 4 
✅ Probleme trad placement impossible (puissance4.cantPlayHere) <br/>
✅ Probleme start turn (mauvaise trad) <br/>
✅ Opti gif (Probleme encoder : 1-2 secondes par frame)<br/>
✅ Jouer contre le bot <br/>
    => Replay

### Instagram
✅ Message en attente => A ouvrir (ignorer si trop vieux)
✅ Message non lu => A lire (ignorer, bot off)

### Release
🚧 Release <br/>

### Sodoku
✅ https://github.com/robatron/sudoku.js <br/>
### Tetris
✅ Rotate (bizzare comment c'est fait on peu pas déplacer alors que si) <br/>
✅ Arrow <br/>
✅ **Place bottom** <br/>
✅ Ajouter des fleches pour aller directement de l'autre coter <br/>
✅ https://cdn.discordapp.com/attachments/850790441703702589/866167196061532190/Penetris_Guide.mp4 <br/>
✅ A test  <br/>

### Petit chevaux
🚧 Rework <br/>

### Monopoly
🚧 Todo complet <br/>
