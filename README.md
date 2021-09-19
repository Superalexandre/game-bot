# game-bot
A fun discord bot

# Road map

### Global
✅ Mise a jour v13 discord.js
✅ Unknown interaction bug
✅ [En cours] Refaire les commandes en /
✅ Event message
✅ Traduction
🚧 Logger

### Uno
✅ Refaire en slash command
✅ RemoveCard function ré ajouter dans la config
✅ Pouvoir faire un retour (cartes spéciales)
✅ Pouvoir jouer la carte piocher après avoir piocher
✅ Si trop de carte faire deux, trois pages
✅ Erreur page
❌ Unknow interaction ??? interaction.editReply **(Unknown)**
🚧 GameData (70%)
    ✅ Probleme 1v1 changement de sens 
        => ✅ Ajouter skip turn 
    ✅ Pouvoir jouer plusieurs cartes
        => ✅ playersData[ id ].activesCard = []
        => ✅ Button click -> push id -> Green
        => ✅ If already click -> remove id -> Red
        => ✅ Play button -> remove card -> last card = active
        
        => ✅ Probleme switch quand on en joue plusieurs 
        => ✅ Probleme skip quand on en joue plusieurs 
        => ✅ Probleme carte changement de couleur et +4

        => ❌ Probleme une carte (deux ?) skip = null **(Unknown)**
        => ✅ Probleme jouer plusieurs carte
    🚧 Pouvoir "surencherir" (+2, +4)
        => ✅ Don't skip and disable color
        => ✅ Passer son tour (et donc piocher) (CantPlayCard, button id)

        => 🚧 Si le joueur n'a pas encore vue ses cartes le bouton "Je ne peux pas surencherir" n'apparait pas
    ❌ Refaire les messages
      => Faire une fonction getMessage() avec erreur et config + historique
    ✅ Distribution des cartes spéciales
        => If +2 add to first player and skip
        => If switch color first player select
    🚧 Pouvoir buffler au +4
        => If disable = Error message
        => If enable ask if player bluff
            -> Yes but no => +6
            -> Yes and yes => User +4
🚧 Impossible d'undo le +4 quand il est séléctionner
❌ Si piocher et qu'une carte peut etre jouer envoyer un avertissement
✅ Gerer le end game
🚧 Pouvoir personnalisé sa config (/config uno)

### Need test
🚧 Probleme skip quand on en joue plusieurs 
🚧 Probleme switch quand on en joue plusieurs 

### Puissance 4 
✅ Probleme trad placement impossible (puissance4.cantPlayHere)
✅ Probleme start turn (mauvaise trad)
🚧 Opti gif
🚧 Jouer contre le bot
🚧
### Release
🚧 Release

### Sodoku
✅ https://github.com/robatron/sudoku.js
### Tetris
✅ Rotate (bizzare comment c'est fait on peu pas déplacer alors que si)
✅ Arrow
✅ **Place bottom**
✅ Ajouter des fleches pour aller directement de l'autre coter
✅ https://cdn.discordapp.com/attachments/850790441703702589/866167196061532190/Penetris_Guide.mp4
✅ A test 

### Petit chevaux
🚧 Rework

### Monopoly
🚧 Todo complet
