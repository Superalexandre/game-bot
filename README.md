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
    ✅ Probleme 1v1 changement de sens  <br/>
        => ✅ Ajouter skip turn  <br/>
    ✅ Pouvoir jouer plusieurs cartes <br/>
        => ✅ playersData[ id ].activesCard = [] <br/>
        => ✅ Button click -> push id -> Green <br/>
        => ✅ If already click -> remove id -> Red <br/>
        => ✅ Play button -> remove card -> last card = active <br/>
        => ✅ Probleme switch quand on en joue plusieurs  <br/>
        => ✅ Probleme skip quand on en joue plusieurs  <br/>
        => ✅ Probleme carte changement de couleur et +4 <br/>
        => ❌ Probleme une carte (deux ?) skip = null **(Unknown)** <br/>
        => ✅ Probleme jouer plusieurs carte <br/>
    🚧 Pouvoir "surencherir" (+2, +4) <br/>
        => ✅ Don't skip and disable color <br/>
        => ✅ Passer son tour (et donc piocher) (CantPlayCard, button id) <br/>
        => 🚧 Si le joueur n'a pas encore vue ses cartes le bouton "Je ne peux pas surencherir" n'apparait pas <br/>
    ❌ Refaire les messages <br/>
      => Faire une fonction getMessage() avec erreur et config + historique <br/>
    ✅ Distribution des cartes spéciales <br/>
        => If +2 add to first player and skip <br/>
        => If switch color first player select <br/>
    🚧 Pouvoir buffler au +4 <br/>
        => If disable = Error message <br/>
        => If enable ask if player bluff <br/>
            -> Yes but no => +6 <br/>
            -> Yes and yes => User +4 <br/>
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
