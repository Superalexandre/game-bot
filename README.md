# game-bot

A fun discord bot

## Global

- [X] Mise a jour v13 discord.js
- [X] Unknown interaction bug
- [X] [En cours] Refaire les commandes en /
- [X] Event message
- [X] Traduction
- [X] Logger
- [ ] Systeme pour automatiquement verifier les commandes (les ajoutées, ou les mettres a jour desc etc)
  - [X] Crée les commandes
  - [X] Si il rdm beaucoup de fois il va recreer a chaque fois
    - [X] Base de données ? pendingCommand
    - [X] Puis remove dans pendingCommand une fois crée
  - [X] Modifier si changement
- [ ] Compte et base de données
  - [X] **GAME ID**
    - [X] Add server or chat
    - [X] Insta
    - [X] Discord
  - [X] Crée un compte
  - [X] ⚠️ **Merge compte**
    - [X] ⚠️ A test
  - [X] Ajouter stats
  - [X] **Probleme** insta redémarrage = plus id = restockage
    - [X] Donc il peut pas add les stats
  - [ ] Commande profile
    - [ ] Voir ses stats => Sur le site

    - Gestion des preferences (langue, theme, configs)

    - [ ] Voir ses configs par jeux (uno, tetris -> save ?) => Site + Commande

    - Section "Gestion du compte"

    - [ ] Voir ses données stockés => Sur le site => Page profile
    - [ ] Supprimer un compte respect des données => Sur le site => Page profile
- [X] Sentry, gitguardian

### Site

- [ ] Page serveur
  - ? Faire une /server/id/images retourne l'image avec les stats ?
- [ ] **❗ RGPD**
  - [ ] Privacy
  - [ ] TOS
- [X] Thème blanc
- [X] Finir la nav bar
- [X] Favico
- [X] Theme localstorage
- [X] Components
  - [X] Notif
    - [X] Space beetween
    - [X] State
    - [X] Auto remove notif
  - [X] ❓ Navbar
    - Directe en couleur et refresh a chaque fois
- [ ] Login
  - [X] Rework pour retirer passport-discord
  - [ ] Instagram
- [ ] Page d'acceuil

### Uno

- [X] Refaire en slash command
- [X] RemoveCard function ré ajouter dans la config
- [X] Pouvoir faire un retour (cartes spéciales)
- [X] Pouvoir jouer la carte piocher après avoir piocher
- [X] Si trop de carte faire deux, trois pages
- [X] Erreur page
- [X] Unknow interaction ??? interaction.editReply **(Double start)**
- [X] GameData
  - [X] Probleme 1v1 changement de sens  
    - [X] Ajouter skip turn  
  - [X] Pouvoir jouer plusieurs cartes
    - [X] playersData[ id ].activesCard = []
    - [X] Button click -> push id -> Green
    - [X] If already click -> remove id -> Red
    - [X] Play button -> remove card -> last card = active
    - [X] Probleme switch quand on en joue plusieurs  
    - [X] Probleme skip quand on en joue plusieurs  
    - [X] Probleme carte changement de couleur et +4
    - [X] Probleme une carte (deux ?) skip = null
    - [X] Probleme jouer plusieurs carte
  - [X] Pouvoir "surencherir" (+2, +4)
    - [X] Don't skip and disable color
    - [X] Passer son tour (et donc piocher) (CantPlayCard, button id)
    - [X] Si le joueur n'a pas encore vue ses cartes le bouton "Je ne peux pas surencherir" n'apparait pas
    - [X] Erreur lorsque la carte est un changement de couleur (Probleme avec le outbid)
  - [X] Distribution des cartes spéciales
    If +2 add to first player and skip
    If switch color first player select
  - [X] Pouvoir buffler au +4
    - [ ] If disable = Error message
    - [X] If enable ask if player bluff
      - [X] Yes but no => +6
      - [X] Yes and yes => User +4
- [ ] i18n
- [ ] GameStats
- [X] Impossible d'undo le +4 quand il est séléctionner
- [X] Gerer le end game
- [X] Pouvoir personnalisé sa config (/profile config uno) **Global => Commande profile**

### Need test

- [ ] Probleme skip quand on en joue plusieurs (1v1 meme probleme ?)
- [ ] Probleme switch quand on en joue plusieurs

### Puissance 4

- [X] Probleme trad placement impossible (puissance4.cantPlayHere)
- [X] Probleme start turn (mauvaise trad)
- [X] Opti gif (Probleme encoder : 1-2 secondes par frame)
- [X] Jouer contre le bot
  - Replay

### Instagram

- [X] Message en attente => A ouvrir (ignorer si trop vieux)
- [X] Message non lu => A lire (ignorer, bot off)
- [X] Restructuration

### Tetris

- [X] Rotate (bizzare comment c'est fait on peu pas déplacer alors que si)
- [X] Arrow
- [X] **Place bottom**
- [X] Ajouter des fleches pour aller directement de l'autre coter
- [X] <https://cdn.discordapp.com/attachments/850790441703702589/866167196061532190/Penetris_Guide.mp4>
- [X] A test  
- [ ] Arreter sa partie
  - Pouvoir enregistrer ?
- [ ] GameStats

### Release

- [X] Logo
- [ ] Release (Prévue 16 janvier anniv Sudref)

### Sodoku

- [X] <https://github.com/robatron/sudoku.js>

### Monopoly

- [ ] Todo complet
  - [ ] Avoir un plateau qui peut changer (Noel, Halloween ou evenement spécial)

### Petit chevaux

- [ ] Rework

### Loup garou ?

- [ ] A reflechir
