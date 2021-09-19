# game-bot
A fun discord bot

# Road map

### Global
- [X] Mise a jour v13 discord.js
- [X] Unknown interaction bug
- [X] [En cours] Refaire les commandes en /
- [X] Event message
- [X] Traduction
- [ ] Logger

### Uno
- [X] Refaire en slash command
- [X] RemoveCard function ré ajouter dans la config
- [X] Pouvoir faire un retour (cartes spéciales)
- [X] Pouvoir jouer la carte piocher après avoir piocher
- [X] Si trop de carte faire deux, trois pages
- [X] Erreur page
❌ - [ ] Unknow interaction ??? interaction.editReply **(Unknown)**
- [ ] GameData (70%)
    - [X] Probleme 1v1 changement de sens 
        => Ajouter skip turn 
    - [X] Pouvoir jouer plusieurs cartes
        => playersData[ id ].activesCard = []
        => Button click -> push id -> Green
        => If already click -> remove id -> Red
        => Play button -> remove card -> last card = active
        
        => - [X] Probleme switch quand on en joue plusieurs 
        => - [X] Probleme skip quand on en joue plusieurs 
        => - [X] Probleme carte changement de couleur et +4

        ❌ => - [ ] Probleme une carte (deux ?) skip = null **(Unknown)**
        => - [X] Probleme jouer plusieurs carte
    - [ ] Pouvoir "surencherir" (+2, +4)
        => [X] Don't skip and disable color
        => [X] Passer son tour (et donc piocher) (CantPlayCard, button id)

        => - [ ] Si le joueur n'a pas encore vue ses cartes le bouton "Je ne peux pas surencherir" n'apparait pas
    ❌ - [ ] Refaire les messages
    ❌   => Faire une fonction getMessage() avec erreur et config + historique
    - [X] Distribution des cartes spéciales
        => If +2 add to first player and skip
        => If switch color first player select
    - [ ] Pouvoir buffler au +4
        => If disable = Error message
        => If enable ask if player bluff
            -> Yes but no => +6
            -> Yes and yes => User +4
- [ ] Impossible d'undo le +4 quand il est séléctionner
❌ - [ ] Si piocher et qu'une carte peut etre jouer envoyer un avertissement
- [X] Gerer le end game
- [ ] Pouvoir personnalisé sa config (/config uno)

### Need test
- [ ] Probleme skip quand on en joue plusieurs 
- [ ] Probleme switch quand on en joue plusieurs 

### Puissance 4 
- [X] Probleme trad placement impossible (puissance4.cantPlayHere)
- [X] Probleme start turn (mauvaise trad)
- [ ] Opti gif
- [ ] Jouer contre le bot

### Release
- [ ] Release

### Sodoku
- [X] https://github.com/robatron/sudoku.js
### Tetris
- [X] Rotate (bizzare comment c'est fait on peu pas déplacer alors que si)
- [X] Arrow
- [X] **Place bottom**
- [X] Ajouter des fleches pour aller directement de l'autre coter
- [X] https://cdn.discordapp.com/attachments/850790441703702589/866167196061532190/Penetris_Guide.mp4
- [ ] A test 

### Petit chevaux
- [ ] Rework

### Monopoly
- [ ] Todo complet
