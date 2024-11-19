
        //codigos de colores para los tableron en los tres turnos



        //Turno A
        var color1 ='417bf0'
        //Turno B
        var color2 = '#f84444'
        //Turno de espera
        var color3 = 'c573f4'
        
        var casillasSeleccionadas ={}

        // Obtener el nombre de usuario de la sesión
        fetch('/user-info')
            .then(response => response.json())
            .then(data => {
                localStorage.setItem('username', data.username); 
                document.getElementById('username').textContent = data.username;
                loadRanking();
            })
            .catch(err => console.error('Error fetching user data:', err));

       

       

       

        // Llamar a loadRanking cuando se cargue la página
        document.addEventListener('DOMContentLoaded', loadRanking); 


        function logout() {
            window.location.href = '/logout';
        }
            // Conectar a Socket.io
                // Variables para el juego
        let currentRoomId;

        // Función para iniciar el juego contra la máquina
        
       
/*
         function startSinglePlayer() {
                    fetch('/start-singleplayer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include' // Asegúrate de incluir las cookies de sesión
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al iniciar la partida');
                }
                return response.json();
            })
            .then(data => {
                // Aquí obtienes el roomId del servidor
                const roomId = data.roomId;
                currentRoomId = roomId; // Guardar el roomId para usarlo en movimientos
                document.getElementById('menu').style.display = 'none';
                document.getElementById('singleplayer-board').style.display = 'block';
                console.log("Se creo una nueva sala sp");
            })
            .catch(error => {
                console.error('Error:', error);
                alert('No se pudo iniciar la partida. Intenta de nuevo.');
            });
        }

*/
        function startSinglePlayer() {
            document.getElementById('menu').style.display = 'none';
            document.getElementById('singleplayer-board').style.display = 'block';
            socket.emit('startSinglePlayer');    
        }

        socket.on('singlePlayerRoom', (roomId) => {
            currentRoomId = roomId;
            console.log("Se creo una nueva sala sp");
        })
      // Manejar el movimiento del jugador
        function sp_playerMove(index) {
            console.log("se movio el jugador");
            console.log(currentRoomId)
            socket.emit('playerMoveSP', { roomId: currentRoomId, index });
        } 


        // Escuchar actualizaciones del tablero
        socket.on('updateBoardSP', (board) => {
            console.log("se actualizo el tablero");
            updateBoardSP(board);
        });

        // Escuchar el evento de fin de juego
        socket.on('gameOverSP', (data) => {
            if (data.winner) {
                alert(`${data.winner} wins!`);
            } else if (data.draw) {
                alert('It\'s a draw!');
            }
            resetGame();
        });

        // Función para actualizar el tablero en el front-end
        function updateBoardSP(board) {
            console.log(board)
            board.forEach((cell, index) => {
                document.getElementById(`cell-${index}`).textContent = cell;
            });
        }

        // Función para salir del juego
        function exitGameMachine() {
            socket.emit('exitSinglePlayer', currentRoomId);
            document.getElementById('menu').style.display = 'block';
            document.getElementById('singleplayer-board').style.display = 'none';
            console.log("Se desconecto el jugador");
            loadRanking();
            resetGame();
        }

        // Función para resetear el juego
        function resetGame() {
            currentRoomId = null;
            board = Array(9).fill(null);
            document.querySelectorAll('.cell').forEach(cell => cell.textContent = '');
            socket.emit('startSinglePlayer');
        }
