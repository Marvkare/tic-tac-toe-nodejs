const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const path = require('path');
const fs = require('fs');
require('./snake/snakeapp.js');
const sharedSession = require('socket.io-express-session');
const { randomUUID, randomInt } = require('crypto');


const { router: singlePlayerRoutes, handleSocketConnection } = require('./singleplayer-app'); // Importar el módulo de singleplayer
let games = {};  // Aquí almacenaremos las salas y el estado de cada partida
/* Configuración para SSL */
/*
const casillasSeleccionadas = {};
const https = require('https');
const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/tu_dominio.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/tu_dominio.com/fullchain.pem')
};
*/

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
handleSocketConnection(io);




// Configurar la base de datos SQLite
const db = new sqlite3.Database('./database/game.db');

// Crear tablas si no existen
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        )
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS rankings (
            userId INTEGER,
            wins INTEGER DEFAULT 0,
            losses INTEGER DEFAULT 0,
            FOREIGN KEY(userId) REFERENCES users(id)
        )
    `);
});

// Configurar la sesión con SQLite
const sessionMiddleware = session({
    store: new SQLiteStore,
    secret: 'my-secret-key',
    resave: false,
    saveUninitialized: false
});

app.use(sessionMiddleware);

// Middleware para parsear el cuerpo de las solicitudes POST
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Compartir la sesión de Express con Socket.io
io.use(sharedSession(sessionMiddleware, {
    autoSave: true
}));


// Usar las rutas de singleplayer
app.use(singlePlayerRoutes);

// Ruta de inicio de sesión
app.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/menu');
    }
    res.sendFile(path.join(__dirname, 'public/login.html'));
});
app.get('/2', (req, res) => {
    
    res.sendFile(path.join(__dirname, 'public/index1.html'));
});
// Ruta de registro
app.get('/register', (req, res) => {
    if (req.session.user) {
        return res.redirect('/menu');
    }
    res.sendFile(path.join(__dirname, 'public/register.html'));
});

// Ruta de menú
app.get('/menu', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, 'public/menu.html'));
});

//Informacion de usuario
app.get('/user-info', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'User not authenticated' });
    }
    res.json({ username: req.session.user.username });
});


// Ruta de logout
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

// Registro de usuario
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);

    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function (err) {
        if (err) {
            return res.redirect('/register?error=1');
        } else {
            db.run('INSERT INTO rankings (userId) VALUES (?)', [this.lastID]);
            res.redirect('/login?success=1');
        }
    });
});

// Inicio de sesión
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        if (err || !user || !bcrypt.compareSync(password, user.password)) {
            return res.redirect('/login?error=1');
        }
        console.log(username)
        req.session.user = { id: user.id, username: user.username };
        res.redirect('/menu');
    });
});

app.get('/ranking', (req, res) => {
    db.all('SELECT u.username, r.wins, r.losses FROM rankings r JOIN users u ON r.userId = u.id ORDER BY r.wins DESC', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener el ranking.' });
        }
        res.json(rows); // Enviar el ranking como respuesta
    });
});

// Lógica de WebSocket para el juego
let waitingPlayer = null;

io.on('connection', (socket) => {
    console.log('Un usuario se ha conectado:', socket.id);

    // Asignar el jugador a una sala
    socket.on('joinGame', () => {
        let room = findAvailableRoom();
        console.log(room) 
        socket.join(room);
        socket.room = room;

        if (!games[room]) {
            games[room] = {
                players: {},
                board: Array(9).fill(null),
                currentPlayer: 'red',// El jugador rojo empieza
                movimientos: [],  
            };
           console.log("Numero de salas:"); 
           console.log(Object.keys(games).length);
        }
        // Obtener el nombre de usuario de la sesión
        const username = socket.handshake.session.user ? socket.handshake.session.user.username : 'Unknown';

        io.to(room).emit('updateBoard', games[room].movimientos);
        // Asignar color al jugador
        if (!games[room].players.red) {
            games[room].players.red =  { id: socket.id, name: username };
            socket.emit('assignColor', 'red');
        } else if (!games[room].players.blue) {
            games[room].players.blue =  { id: socket.id, name: username };
            socket.emit('assignColor', 'blue');
        }

         // Informar a todos los jugadores en la sala los nombres de los jugadores
        io.to(room).emit('playersroomInfo', {
            red: games[room].players.red ? games[room].players.red.name : null,
            blue: games[room].players.blue ? games[room].players.blue.name : null
        });

        // Informar a los jugadores de quién es el turno actual
        io.to(room).emit('turn', games[room].currentPlayer);
        
        
            
        // Manejar la desconexión del jugador
           // Lógica para manejar la desconexión
        socket.on('disconnect', () => {
            handlePlayerExit(socket.id, room);
        });
        
        // Manejar la salida manual
        socket.on('exitroom', () => {

            console.log("Se desconecto el jugador"+ socket.id+room);
            handlePlayerExit(socket.id, room);
        });
    });

    function handlePlayerExit(playerId, room) {
        if (games[room]) {
            // Identificar qué jugador se desconectó
            if (games[room].players.red && games[room].players.red.id === playerId) {
                delete games[room].players.red;
                io.to(room).emit('playerDisconnected', { color: 'red', name: games[room].players.red ? games[room].players.red.name : 'Unknown' });
            } else if (games[room].players.blue && games[room].players.blue.id === playerId) {
                delete games[room].players.blue;
                io.to(room).emit('playerDisconnected', { color: 'blue', name: games[room].players.blue ? games[room].players.blue.name : 'Unknown' });
            }

            // Verificar si ambos jugadores están desconectados
            if (!games[room].players.red && !games[room].players.blue) {
                delete games[room]; // Eliminar la sala
                console.log('Se eliminó la sala:', room);
            }
        }
    } 

     
 
        // Manejar el movimiento del jugador
        socket.on('playerMove', (index) => {
            const room = socket.room; // Usar la sala almacenada en el socket

            if (!games[room]) {
                console.log('Sala no encontrada.');
                return; // Salir si la sala no existe
            }

          
            if (games[room].players[games[room].currentPlayer].id === socket.id) {
                games[room].board[index] = games[room].currentPlayer;  // Actualizar el tablero
                const jugador = games[room].currentPlayer;
                const color = games[room].currentPlayer === 'red' ? 'rojo' : 'azul';
                console.log(jugador);
                 // Guardar la información de la casilla seleccionada
                games[room].movimientos.push({
                casilla: index,
                jugador: jugador,
                color: color
                });
                io.to(room).emit('updateBoard', games[room].movimientos);

                 // Enviar la actualización del juego a todos los jugadores en la sala
                    io.to(room).emit('moveMade', {
                    index: index,
                    color: games[room].currentPlayer,
                    casillasSeleccionadas: games[room].movimientos,
                    jugador: jugador
                    });
                    //Actualizar el tablero
                    console.log(games[room].movimientos);
                     // Verificar si hay un ganador
                    const winnerColor = checkForWinner(games[room].board);
                    if (winnerColor) {
                        const winnerName = games[room].players[winnerColor].name; // Obtener el nombre del ganador
                        const yoGane = games[room].players[winnerColor].id === socket.id; // Verificar si el jugador actual ganó
                        const loserColor = winnerColor === 'red' ? 'blue' : 'red';
                        const loserName = games[room].players[loserColor].name;    
                        console.log({ winner: winnerName, yoGane: yoGane });
                        io.to(room).emit('gameOver', { winner: winnerName, yoGane: yoGane }); // Notificar al ganador
                        
                                            // Obtener el userId del ganador
                        db.get('SELECT id FROM users WHERE username = ?', [winnerName], (err, winner) => {
                            if (err) {
                                console.error('Error al obtener el ID del ganador:', err);
                                return;
                            }

                    if (winner) {
                        // Actualizar el ranking del ganador
                        db.run('UPDATE rankings SET wins = wins + 1 WHERE userId = ?', [winner.id], function(err) {
                            if (err) {
                                console.error('Error al actualizar el ranking del ganador:', err);
                            }
                        });
                    }

                    // Obtener el userId del perdedor
                    db.get('SELECT id FROM users WHERE username = ?', [loserName], (err, loser) => {
                        if (err) {
                            console.error('Error al obtener el ID del perdedor:', err);
                            return;
                        }

                    if (loser) {
                        // Actualizar el ranking del perdedor
                        db.run('UPDATE rankings SET losses = losses + 1 WHERE userId = ?', [loser.id], function(err) {
                            if (err) {
                                console.error('Error al actualizar el ranking del perdedor:', err);
                            }
                        });
                    }
                    });
                    });
                        io.emit('exitroom');
                        return;
                    }

                    // Verificar si hay un empate
                    if (checkForDraw(games[room].board)) {
                        io.to(room).emit('gameOver', { winner: null, yoGane: false }); // Notificar el empate
                        io.emit('exitroom');
                        return;
                    }   
                
               
                // Cambiar de turno
                games[room].currentPlayer = games[room].currentPlayer === 'red' ? 'blue' : 'red';
                io.to(room).emit('turn', games[room].currentPlayer);  // Informar del nuevo turno
            }else{
                console.log('hay algo raro');
            }
        
    
        });

        // Función para verificar empate
        function checkForDraw(board) {
            // Verifica si el tablero está lleno y no hay un ganador
            return board.every(cell => cell !== null);
        }
       
    });


// Encontrar una sala con espacio para un nuevo jugador o crear una nueva
function findAvailableRoom() {
    for (let room in games) {
        if (Object.keys(games[room].players).length < 2) {
            console.log("Se encontro una sala");
            return room;
        }
    }
    console.log("Se creo una nueva sala");
    return `game-${new Date().getTime()}`;  // Crear nueva sala
}

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});


function checkForWinner(board) {
    const winningCombinations = [
        [0, 1, 2], // Fila 1
        [3, 4, 5], // Fila 2
        [6, 7, 8], // Fila 3
        [0, 3, 6], // Columna 1
        [1, 4, 7], // Columna 2
        [2, 5, 8], // Columna 3
        [0, 4, 8], // Diagonal 1
        [2, 4, 6]  // Diagonal 2
    ];

    for (const combination of winningCombinations) {
        const [a, b, c] = combination;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a]; // Retorna el color del ganador
        }
    }
    return null; // No hay ganador
}