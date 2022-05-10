/*
const board = [
    ["⬜", "⬜", "⬜", "⬜", "⬜", "⬜", "⬜", "⬜", "⬜", "⬜", "⬜"], // 1
    ["⬜", "⬜", "⬜", "⬜", "⬜", "⬜", "⬜", "⬜", "⬜", "⬜", "⬜"], // 2
    ["⬜", "⬜", "⬜", "⬜", "⬜", "⬜", "⬜", "⬜", "⬜", "⬜", "⬜"], // 3
    ["⬜", "⬜", "⬜", "⬜", "⬜", "⬜", "⬜", "⬜", "⬜", "⬜", "⬜"], // 4
    ["⬜", "⬜", "⬜", "⬜", "⬜", "⬜", "⬜", "⬜", "⬜", "⬜", "⬜"], // 5
    ["⬜", "⬜", "⬜", "⬜", "⬜", "⬜", "⬜", "⬜", "⬜", "⬜", "⬜"], // 6
    ["⬜", "⬜", "⬜", "⬜", "⬜", "⬜", "⬜", "⬜", "⬜", "⬜", "⬜"], // 7
    ["⬜", "⬜", "⬜", "⬜", "⬜", "⬜", "⬜", "⬜", "⬜", "⬜", "⬜"], // 8
    ["⬜", "⬜", "⬜", "⬜", "⬜", "⬜", "⬜", "⬜", "⬜", "⬜", "⬜"], // 9
    ["⬜", "⬜", "⬜", "⬜", "⬜", "⬜", "⬜", "⬜", "⬜", "⬜", "⬜"], // 10
    ["⬜", "⬜", "⬜", "⬜", "⬜", "⬜", "⬜", "⬜", "⬜", "⬜", "⬜"] // 11
]
*/

/*
Plage/Gare :
    - Foret ?
    - Lancement de fusée ?
    - Aeroport (Internationale) ?

Villes : 
    - Portugal : 1
        - Lisbone
        - Porto
        - Sintra
    - France : 2
        - Paris
        - Lyon
        - Marseille
    - Mexique : 3
        - Mexico
        - Cancun
        - Acapulco
    - Argentine : 4
        - Buenos Aires
        - Cordoba
        - Salta
    - Canada : 5
        - Toronto
        - Montreal
        - Quebec
    - Etats-Unis : 6
        - Washington
        - New York
        - Las Vegas
    - Grèce : 7
        - Athènes
        - Corinthe
    - Italie : 8
        - Rome
        - Florence
        - Naples
*/

const board = [
    [{ caseNumber: 20, players: [], isCorner: true }, { caseNumber: 21, players: [] }, { caseNumber: 22, players: [] }, { caseNumber: 23, players: [] }, { caseNumber: 24, players: [] }, { caseNumber: 25, players: [] }, { caseNumber: 26, players: [] }, { caseNumber: 27, players: [] }, { caseNumber: 28, players: [] }, { caseNumber: 29, players: [] }, { caseNumber: 30, players: [], isCorner: true }], // 1
    [{ caseNumber: 19, players: [] }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { caseNumber: 31, players: [] }], // 2
    [{ caseNumber: 18, players: [] }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { caseNumber: 32, players: [] }], // 3
    [{ caseNumber: 17, players: [] }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { caseNumber: 33, players: [] }], // 4
    [{ caseNumber: 16, players: [] }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { caseNumber: 34, players: [] }], // 5
    [{ caseNumber: 15, players: [] }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { caseNumber: 35, players: [] }], // 6
    [{ caseNumber: 14, players: [] }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { caseNumber: 36, players: [] }], // 7
    [{ caseNumber: 13, players: [] }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { caseNumber: 38, players: [] }], // 8
    [{ caseNumber: 12, players: [] }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { caseNumber: 39, players: [] }], // 9
    [{ caseNumber: 11, players: [] }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { caseNumber: 40, players: [] }], // 10
    [{ type: "jail", caseNumber: 10, players: [], isCorner: true }, { caseNumber: 9, players: [] }, { caseNumber: 8, players: [] }, { caseNumber: 7, players: [] }, { caseNumber: 6, players: [] }, { caseNumber: 5, players: [] }, { caseNumber: 4, players: [] }, { caseNumber: 3, players: [] }, { caseNumber: 2, players: [] }, { caseNumber: 1, players: [] }, { type: "start", caseNumber: 0, players: [], isCorner: true }] // 11
]