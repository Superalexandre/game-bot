import Logger from "../../logger.js"

const logger = new Logger({
    plateform: "Dashboard"
})

async function handlePuissance4({ socket, game, socketData, data, io }) {
    if (game.users.length >= game.maxPlayers) {
        return socket.emit("error", {
            message: socket.i18n.__("dashboard.connect4.gameFull")
        })
    }

    if (game.users.find(player => player.id === socket.id)) {
        return socket.emit("error", {
            message: socket.i18n.__("dashboard.connect4.alreadyInGame")
        })
    }

    const texts = {
        gameOver: socket.i18n.__("dashboard.connect4.gameOver"),
        youJoin: socket.i18n.__("dashboard.connect4.youJoin"),
        asJoin: socket.i18n.__("dashboard.connect4.asJoin"),
        yourTurn: socket.i18n.__("dashboard.connect4.yourTurn"),
        otherTurn: socket.i18n.__("dashboard.connect4.otherTurn"),
        gameRestart: socket.i18n.__("dashboard.connect4.gameRestart"),
        youAskRematch: socket.i18n.__("dashboard.connect4.youAskRematch"),
        otherAskRematch: socket.i18n.__("dashboard.connect4.otherAskRematch"),
        youWin: socket.i18n.__("dashboard.connect4.youWin"),
        youLoose: socket.i18n.__("dashboard.connect4.youLoose")
    }

    const player = {
        id: socket.id,
        rematch: false,
        username: socketData.username,
        color: game.users.length <= 0 ? "red" : "yellow",
        colorEmote: game.users.length <= 0 ? "🔴" : "🟡",
        winEmoji: game.users.length <= 0 ? "🔴_win" : "🟡_win",
        isTurn: game.users.length <= 0 ? true : false
    }

    data.games.push(socketData.gameId, player, "users")
    
    await socket.join(socketData.gameId)

    io.in(socketData.gameId).emit("joined", {
        id: socket.id,
        board: game.board,
        canStart: game.users.length === 1,
        isTurnId: game.users.find(player => player.isTurn)?.id,
        player,
        playerNumber: game.users.length + 1,
        texts
    })

    socket.on("rematch", async function(socketRematchData) {
        if (!socketRematchData || !socketRematchData.gameId) return logger.error("Une erreur est survenue (no socket or gameId)")

        let game = await data.games.get(socketRematchData.gameId)

        if (!game) {
            return socket.emit("error", {
                message: socket.i18n.__("dashboard.connect4.noGameFound")
            })
        }

        const player = game.users.find(player => player.id === socket.id)

        if (!player) {
            return socket.emit("error", {
                message: socket.i18n.__("dashboard.connect4.notInThisGame")
            })
        }

        if (!game.finished) {
            return socket.emit("error", {
                message: socket.i18n.__("dashboard.connect4.isNotFinished")
            })
        }

        const indexUser = game.users.findIndex(player => player.id === socket.id)
        await data.games.set(socketRematchData.gameId, true, `users.${indexUser}.rematch`)

        game = await data.games.get(socketRematchData.gameId)

        // Check if all players want to rematch
        if (game.users.length === game.users.filter(player => player.rematch).length) {
            // Reset board
            const board = [
                ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
                ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
                ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
                ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"],
                ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"]
            ]
            
            await data.games.set(socketRematchData.gameId, board, "board")
            await data.games.set(socketRematchData.gameId, false, "finished")

            let firstUser
            // Reset users
            for (let i = 0; i < game.users.length; i++) {
                const user = game.users[i]

                const newUser = {
                    ...user,
                    rematch: false,
                    isTurn: i === 0 ? true : false
                }

                if (i === 0) firstUser = newUser

                await data.games.set(socketRematchData.gameId, newUser, `users.${i}`)
            }
            
            io.in(socketRematchData.gameId).emit("rematch", {
                type: "started",
                texts
            })

            return io.in(socketRematchData.gameId).emit("play", {
                gameId: socketRematchData.gameId,
                player: firstUser,
                isTurn: firstUser.id,
                board,
                texts
            })
        }

        if (!player.rematch) {
            io.in(socketRematchData.gameId).emit("rematch", {
                type: "ask",
                player,
                texts
            })
        }
    })

    socket.on("play", async function(socketPlayData) {
        if (!socketPlayData || !socketPlayData.gameId) return logger.error("Une erreur est survenue (no socket or gameId)")

        const game = await data.games.get(socketPlayData.gameId)

        if (!game) {
            return socket.emit("error", {
                message: socket.i18n.__("dashboard.connect4.noGameFound")
            })
        }

        if (game.users.length < 2) {
            return socket.emit("error", {
                message: socket.i18n.__("dashboard.connect4.isNotFull")
            })
        }

        const player = game.users.find(player => player.id === socket.id)

        if (!player) {
            return socket.emit("error", {
                message: socket.i18n.__("dashboard.connect4.notInThisGame")
            })
        }

        if (!player.isTurn) {
            return socket.emit("error", {
                message: socket.i18n.__("dashboard.connect4.notYourTurn"),
                errorType: "notTurn",
                finish: game.finished
            })
        }

        if (socketPlayData.column < 0 || socketPlayData.column > 6) {
            return socket.emit("error", {
                message: socket.i18n.__("dashboard.connect4.invalidColumn")
            })
        }

        const result = add({ board: game.board, column: socketPlayData.column, emoji: player.colorEmote })

        if (result.error) {
            return socket.emit("error", {
                message: result.error === "col_full" ? socket.i18n.__("dashboard.connect4.columnFull") : socket.i18n.__("dashboard.connect4.invalidColumn")
            })
        }

        const check = checkWin({
            board: result.board,
            userData: game.users[0],
            opponentData: game.users[1]
        })

        if (check.win) {
            io.in(socketPlayData.gameId).emit("play", {
                board: result.board,
                column: socketPlayData.column,
                win: true,
                winnerId: check.winnerUser.id,
                finish: true,
                texts
            })
        
            await data.games.set(socketPlayData.gameId, true, "finished")

            // Disabled all players turn
            for (let i = 0; i < game.users.length; i++) {
                const user = game.users[i]

                const newUser = {
                    ...user,
                    isTurn: false
                }

                await data.games.set(socketPlayData.gameId, newUser, `users.${i}`)
            }

            return
        }

        if (check.allFill) {
            io.in(socketPlayData.gameId).emit("play", {
                board: result.board,
                column: socketPlayData.column,
                allFill: true,
                finish: true,
                texts
            })

            await data.games.set(socketPlayData.gameId, true, "finished")

            // Disabled all players turn
            for (let i = 0; i < game.users.length; i++) {
                const user = game.users[i]

                const newUser = {
                    ...user,
                    isTurn: false
                }

                await data.games.set(socketPlayData.gameId, newUser, `users.${i}`)
            }

            return
        }

        // Change player turn
        let playerTurnId
        for (let i = 0; i < game.users.length; i++) {
            const user = game.users[i]
            const isTurn = player.color === user.color ? false : true

            if (isTurn) playerTurnId = user.id

            const newUser = {
                ...user,
                isTurn
            }

            await data.games.set(socketPlayData.gameId, newUser, `users.${i}`)
        }

        await data.games.set(socketPlayData.gameId, result.board, "board")

        // Send play to other player
        io.in(socketPlayData.gameId).emit("play", {
            player,
            isTurn: playerTurnId,
            board: result.board,
            texts
        })
    })
}


function add({ board, emoji, column }) {
    let placed = false

    board.reverse()

    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (!placed && j === parseInt(column) && board[i][j] === "⚪") {
                board[i][j] = emoji

                placed = true
            }
        }
    }
    
    board.reverse()
    
    if (!placed) return { error: "col_full", board }

    return { error: false, board }
}

function checkWin({ board, userData, opponentData }) {
    let win = false
    let winner = ""
    let allFill = true
    let winnerUser = ""

    for (let i = 0; i < board.length; i++) {   
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j] === "⚪") allFill = false

            //* Horizontal
            if (!win && board[i][j] !== "⚪" && board[i][j] === board[i][j + 1] && board[i][j + 1] === board[i][j + 2] && board[i][j + 2] === board[i][j + 3]) {
                winner = board[i][j]

                winnerUser = opponentData.colorEmote === winner ? opponentData : userData

                board[i][j] = winnerUser.winEmoji
                board[i][j + 1] = winnerUser.winEmoji
                board[i][j + 2] = winnerUser.winEmoji
                board[i][j + 3] = winnerUser.winEmoji

                win = true
            //* Vertical
            } else if (!win && board[i][j] !== "⚪" && board[i][j] === board[i + 1]?.[j] && board[i + 1]?.[j] === board[i + 2]?.[j] && board[i + 2]?.[j] === board[i + 3]?.[j]) {
                winner = board[i][j]

                winnerUser = opponentData.colorEmote === winner ? opponentData : userData

                board[i][j] = winnerUser.winEmoji
                board[i + 1][j] = winnerUser.winEmoji
                board[i + 2][j] = winnerUser.winEmoji
                board[i + 3][j] = winnerUser.winEmoji

                win = true
            //* Diagonal Left top => Bottom right 
            } else if (!win && board[i][j] !== "⚪" && board[i][j] === board[i + 1]?.[j + 1] && board[i + 1]?.[j + 1] === board[i + 2]?.[j + 2] && board[i + 2]?.[j + 2] === board[i + 3]?.[j + 3]) {
                winner = board[i][j]

                winnerUser = opponentData.colorEmote === winner ? opponentData : userData

                board[i][j] = winnerUser.winEmoji
                board[i + 1][j + 1] = winnerUser.winEmoji
                board[i + 2][j + 2] = winnerUser.winEmoji
                board[i + 3][j + 3] = winnerUser.winEmoji

                win = true
            //* Diagonal Right top => Bottom left
            } else if (!win && board[i][j] !== "⚪" && board[i][j] === board[i + 1]?.[j - 1] && board[i + 1]?.[j - 1] === board[i + 2]?.[j - 2] && board[i + 2]?.[j - 2] === board[i + 3]?.[j - 3]) {
                winner = board[i][j]

                winnerUser = opponentData.colorEmote === winner ? opponentData : userData

                board[i][j] = winnerUser.winEmoji
                board[i + 1][j - 1] = winnerUser.winEmoji
                board[i + 2][j - 2] = winnerUser.winEmoji
                board[i + 3][j - 3] = winnerUser.winEmoji

                win = true
            }
        }
    }

    return { board, win, winner, allFill, winnerUser }
}

export {
    handlePuissance4
}