const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const path = require('path');
const sharedSession = require('socket.io-express-session');

let games = {};  // Aquí almacenaremos las salas y el estado de cada partida
const casillasSeleccionadas = {};

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

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

// Ruta de inicio de sesión
app.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/menu');
    }
    res.sendFile(path.join(__dirname, 'public/login.html'));
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

// Lógica de WebSocket para el juego
let waitingPlayer = null;

io.on('connection', (socket) => {
    console.log('Un usuario se ha conectado:', socket.id);

    // Asignar el jugador a una sala
    socket.on('joinGame', () => {
        let room = findAvailableRoom();
        
        socket.join(room);

        if (!games[room]) {
            games[room] = {
                players: {},
                board: Array(9).fill(null),
                currentPlayer: 'red',// El jugador rojo empieza
                movimientos: [],  
            };
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
        socket.on('exitroom', () => {
            console.log('Un jugador se ha desconectado:-', socket.id);
            games[room].movimientos = [];
            games[room].board = Array(9).fill(null);
            console.log(games[room].movimientos);
            io.to(room).emit('updateBoard', games[room].movimientos);
            // Buscar en qué sala estaba el jugador desconectado
            for (let room in games) {
                
                if (games[room].players.red && games[room].players.red.id === socket.id) {
                    // El jugador rojo se desconectó
                    io.to(room).emit('playerDisconnected', { color: 'red', name: games[room].players.red.name });
                    delete games[room].players.red;
                } else if (games[room].players.blue && games[room].players.blue.id === socket.id) {
                    // El jugador azul se desconectó
                    io.to(room).emit('playerDisconnected', { color: 'blue', name: games[room].players.blue.name });
                    delete games[room].players.blue;
                }

                // Si ambos jugadores están desconectados, eliminar la sala
                if (!games[room].players.red && !games[room].players.blue) {
                    
                    delete games[room];
                    console.log("Se elimino la sala")
                }
            }
        });

        socket.on('gameWon', (winner) => {
        const winnerColor = winner === 'X' ? 'rojo' : 'azul';
        const currentRoom = games[room];
        
        // Identifica el jugador ganador y perdedor
        let ganadorSocketId;
        let perdedorSocketId;

        if (currentRoom.players.red && winnerColor === 'rojo') {
            ganadorSocketId = currentRoom.players.red.id;
            perdedorSocketId = currentRoom.players.blue.id;
        } else if (currentRoom.players.blue && winnerColor === 'azul') {
            ganadorSocketId = currentRoom.players.blue.id;
            perdedorSocketId = currentRoom.players.red.id;
        }

        // Enviar mensaje al ganador
        if (ganadorSocketId) {
            io.to(ganadorSocketId).emit('youWon', {
                message: '¡Felicidades! Ganaste la partida',
                winnerColor: winnerColor
            });
        }

        // Enviar mensaje al perdedor
        if (perdedorSocketId) {
            io.to(perdedorSocketId).emit('youLost', {
                message: 'Lo siento, perdiste la partida',
                winnerColor: winnerColor
            });
        }
    });
 
        // Manejar el movimiento del jugador
        socket.on('playerMove', (index) => {
           
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
                    
                
                /*Verificar si hay un ganador
                const winner = checkForWinner(games[room].board);
                if (winner) {
                    io.to(room).emit('gameOver', winner);
                    return;
                }*/
                // Cambiar de turno
                games[room].currentPlayer = games[room].currentPlayer === 'red' ? 'blue' : 'red';
                io.to(room).emit('turn', games[room].currentPlayer);  // Informar del nuevo turno
            }else{
                console.log('hay algo raro');
            }
        
    
        });

       
    });
});

// Encontrar una sala con espacio para un nuevo jugador o crear una nueva
function findAvailableRoom() {
    for (let room in games) {
        if (Object.keys(games[room].players).length < 2) {
            return room;
        }
    }
    return `game-${Object.keys(games).length + 1}`;  // Crear nueva sala
}

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
