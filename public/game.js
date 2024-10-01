const socket = io();

// Registrar usuario
function register() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    }).then(res => res.json()).then(data => {
        alert(data.message);
    });
}

// Juego Contra la Máquina
function startSinglePlayer() {
    // Lógica para jugar contra la máquina
}

// Juego Multijugador
function startMultiplayer() {
    socket.emit('findMatch');
}

// Recibir inicio de juego
socket.on('startGame', (data) => {
    alert('Juego encontrado, iniciando!');
    // Iniciar lógica del juego
});

// Recibir turno del oponente
socket.on('opponentTurn', (data) => {
    // Manejar turno del oponente
});
