# game-bot
A fun discord bot

# Road map

### Global
✅ Mise a jour v13 discord.js <br/>
✅ Unknown interaction bug <br/>
✅ [En cours] Refaire les commandes en / <br/>
✅ Event message <br/>
✅ Traduction <br/>
🚧 Logger <br/>

### Uno
✅ Refaire en slash command <br/>
✅ RemoveCard function ré ajouter dans la config <br/>
✅ Pouvoir faire un retour (cartes spéciales) <br/>
✅ Pouvoir jouer la carte piocher après avoir piocher <br/>
✅ Si trop de carte faire deux, trois pages <br/>
✅ Erreur page <br/>
❌ Unknow interaction ??? interaction.editReply **(Unknown)** <br/>
🚧 GameData (70%) <br/>
&emsp;✅ Probleme 1v1 changement de sens  <br/>
&emsp;&ensp;=> ✅ Ajouter skip turn  <br/>
&emsp;✅ Pouvoir jouer plusieurs cartes <br/>
&emsp;&ensp;=> ✅ playersData[ id ].activesCard = [] <br/>
&emsp;&ensp;=> ✅ Button click -> push id -> Green <br/>
&emsp;&ensp;=> ✅ If already click -> remove id -> Red <br/>
&emsp;&ensp;=> ✅ Play button -> remove card -> last card = active <br/>
&emsp;&ensp;=> ✅ Probleme switch quand on en joue plusieurs  <br/>
&emsp;&ensp;=> ✅ Probleme skip quand on en joue plusieurs  <br/>
&emsp;&ensp;=> ✅ Probleme carte changement de couleur et +4 <br/>
&emsp;&ensp;=> ❌ Probleme une carte (deux ?) skip = null **(Unknown)** <br/>
&emsp;&ensp;=> ✅ Probleme jouer plusieurs carte <br/>
&emsp;🚧 Pouvoir "surencherir" (+2, +4) <br/>
&emsp;&ensp;=> ✅ Don't skip and disable color <br/>
&emsp;&ensp;=> ✅ Passer son tour (et donc piocher) (CantPlayCard, button id) <br/>
&emsp;&ensp;=> 🚧 Si le joueur n'a pas encore vue ses cartes le bouton "Je ne peux pas surencherir" n'apparait pas <br/>
&emsp;❌ Refaire les messages <br/>
&emsp;&ensp;=> Faire une fonction getMessage() avec erreur et config + historique <br/>
&emsp;✅ Distribution des cartes spéciales <br/>
&emsp;&ensp;=> If +2 add to first player and skip <br/>
&emsp;&ensp;=> If switch color first player select <br/>
&emsp;🚧 Pouvoir buffler au +4 <br/>
&emsp;&ensp;=> If disable = Error message <br/>
&emsp;&ensp;=> If enable ask if player bluff <br/>
&emsp;&ensp;&ensp;-> Yes but no => +6 <br/>
&emsp;&ensp;&ensp;-> Yes and yes => User +4 <br/>
🚧 Impossible d'undo le +4 quand il est séléctionner <br/>
❌ Si piocher et qu'une carte peut etre jouer envoyer un avertissement <br/>
✅ Gerer le end game <br/>
🚧 Pouvoir personnalisé sa config (/config uno) <br/>

### Need test
🚧 Probleme skip quand on en joue plusieurs <br/>
🚧 Probleme switch quand on en joue plusieurs <br/>

### Puissance 4 
✅ Probleme trad placement impossible (puissance4.cantPlayHere) <br/>
✅ Probleme start turn (mauvaise trad) <br/>
🚧 Opti gif <br/>
🚧 Jouer contre le bot <br/>

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
