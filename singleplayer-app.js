const express = require('express');
const { randomUUID } = require('crypto');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/game.db');

const router = express.Router();
let singlePlayerGames = {}; // Para manejar partidas contra la máquina

// Ruta para iniciar una partida contra la máquina
router.post('/start-singleplayer', (req, res) => {
    const roomId = `single-${randomUUID()}`; // Crear un ID único para la sala
    singlePlayerGames[roomId] = {
        board: Array(9).fill(null),
        currentPlayer: 'X', // Jugador humano
        moves: [], // Para guardar movimientos
        userId: req.session.user.id // ID del usuario
    };
    res.json({ roomId });
});

// Función para hacer el movimiento de la máquina
// Función para hacer el movimiento de la máquina
function makeMachineMove(board) {
    let bestScore = -Infinity;
    let move;

    for (let i = 0; i < board.length; i++) {
        if (board[i] === null) {
            board[i] = 'O'; // Jugar como máquina
            let score = minimax(board, 0, false);
            board[i] = null; // Deshacer movimiento

            if (score > bestScore) {
                bestScore = score;
                move = i; // Guardar el mejor movimiento
            }
        }
    }

    return move; // Retornar el mejor movimiento encontrado
}

// Función para verificar si un jugador ha ganado
function checkWinner(player, board) {
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],  // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8],  // Columns
        [0, 4, 8], [2, 4, 6]              // Diagonals
    ];
    return winningCombinations.some(combination => {
        return combination.every(index => board[index] === player);
    });
}

// Función Minimax
function minimax(board, depth, isMaximizing) {
    const scores = {
        'X': -1, // Jugador humano
        'O': 1, // Máquina
        'draw': 0
    };

    if (checkWinner('O', board)) return scores['O'];
    if (checkWinner('X', board)) return scores['X'];
    if (board.every(cell => cell !== null)) return scores['draw']; // Empate

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === null) {
                board[i] = 'O'; // Jugar como máquina
                let score = minimax(board, depth + 1, false);
                board[i] = null; // Deshacer movimiento
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === null) {
                board[i] = 'X'; // Jugar como jugador humano
                let score = minimax(board, depth + 1, true);
                board[i] = null; // Deshacer movimiento
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

// Función para registrar resultados en la base de datos
function registerResult(userId, machineName, userWon) {
    db.get('SELECT id FROM users WHERE username = ?', [machineName], (err, machine) => {
        if (err) {
            console.error('Error al obtener el ID de la máquina:', err);
            return;
        }

        if (userWon) {
            db.run('UPDATE rankings SET wins = wins + 1 WHERE userId = ?', [userId]);
            db.run('UPDATE rankings SET losses = losses + 1 WHERE userId = ?', [machine.id]);
        } else {
            db.run('UPDATE rankings SET wins = wins + 1 WHERE userId = ?', [machine.id]);
            db.run('UPDATE rankings SET losses = losses + 1 WHERE userId = ?', [userId]);
        }
    });
}

// Manejo de la conexión de Socket.io
const handleSocketConnection = (io) => {
    io.on('connection', (socket) => {
        console.log('Jugador conectado SP:', socket.id);

        socket.on('startSinglePlayer', async () => {
            const roomId = `single-${randomUUID()}`;
            singlePlayerGames[roomId] = {
                board: Array(9).fill(null),
                currentPlayer: 'X',
                moves: [],
                userId: socket.handshake.session.user.id // ID del usuario
            };
            socket.join(roomId);
            socket.emit('singlePlayerRoom', roomId);
            console.log("Se creo una nueva sala sp" + roomId);
        });

        socket.on('playerMoveSP', ({ roomId, index }) => {
            const game = singlePlayerGames[roomId];

            if (!game || game.board[index]) {
                return socket.emit('moveError', { error: 'Movimiento inválido' });
            }

            // Realizar movimiento del jugador
            game.board[index] = game.currentPlayer;
            game.moves.push({ player: game.currentPlayer, index });

            // Verificar si el jugador ganó
            if (checkWinner(game.currentPlayer, game.board)) {
                registerResult(game.userId, 'MachineCat', true);
                io.to(roomId).emit('gameOverSP', { winner: game.currentPlayer });
                delete singlePlayerGames[roomId]; // Eliminar la sala
                console.log("Se gano el jugador");
                return;
            }

            // Verificar si hay un empate
            if (game.board.every(cell => cell !== null)) {
                io.to(roomId).emit('gameOverSP', { draw: true });
                delete singlePlayerGames[roomId]; // Eliminar la sala
                console.log("Se gano el jugador");
                return;
            }

            // Cambiar el turno a la máquina
            game.currentPlayer = 'O'; // La máquina juega con 'O'
            const machineIndex = makeMachineMove(game.board);
            game.board[machineIndex] = game.currentPlayer;
            game.moves.push({ player: game.currentPlayer, index: machineIndex });

            // Verificar si la máquina ganó
            if (checkWinner(game.currentPlayer, game.board)) {
                registerResult(game.userId, 'MachineCat', false);
                io.to(roomId).emit('gameOverSP', { winner: game.currentPlayer });
                delete singlePlayerGames[roomId]; // Eliminar la sala
                console.log("Se gano la maquina");
                return;
            }

            // Verificar si hay un empate
            if (game.board.every(cell => cell !== null)) {
                io.to(roomId).emit('gameOverSP', { draw: true });
                delete singlePlayerGames[roomId]; // Eliminar la sala
                console.log("empate")
                return;
            }

            // Cambiar el turno de nuevo al jugador
            console.log("Se cambio el turno");
            console.log(game)
            game.currentPlayer = 'X';
            console.log(roomId)
        io.to(roomId).emit('updateBoardSP', game.board);
        });

        socket.on('exitSinglePlayer', (roomId) => {
            delete singlePlayerGames[roomId]; // Eliminar la sala
            socket.leave(roomId);
            socket.emit('gameExited', { message: 'Juego abandonado' });
            console.log("Se desconecto el jugador"+ socket.id+roomId);
        });
    });
};

module.exports = { router, handleSocketConnection };