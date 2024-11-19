

socket.on('gameOver', ({ winner, yoGane }) => {
    const modal = document.getElementById("gameOverModal");
    const modalMessage = document.getElementById("modalMessage");
    const playerName = localStorage.getItem('username');
    if (winner === null) {
        modalMessage.textContent = '¡Es un empate!';
    } else {
        if (playerName === winner) {
            modalMessage.textContent = `¡Felicidades, ${winner}! Ganaste la partida.`;
        } else {
            modalMessage.textContent = `¡Lo siento! Ganó ${winner}.`;
        }
    }

    // Mostrar la modal
    modal.style.display = "block";

    // Cerrar la modal al hacer clic en (x)
    const span = document.getElementsByClassName("close")[0];
    span.onclick = function() {
        modal.style.display = "none"; // Ocultar la modal
    }

    // Cerrar la modal al hacer clic fuera de ella
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = "none"; // Ocultar la modal
        }
    }
});