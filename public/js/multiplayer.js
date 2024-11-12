//--------------------------    --------------- MULTIPLAYER -------------------//
// Código para multijugador
var colorBlue = "#3498db";
var colorRed = "#e74c3c";
var colorGray = "#95a5a6";
 function startMultiplayer() {
            // Ocultar el menú y mostrar el tablero multijugador
            document.getElementById('menu').style.display = 'none';
            document.getElementById('multiplayer-board').style.display = 'block';

            // Emitir evento para unirse a una sala multijugador
            socket.emit('joinGame');
        }

        
        function exitGame() {
            console.log("reset");
            //alert("reset");
            socket.emit('exitroom');
            document.getElementById('menu').style.display = 'block';
            document.getElementById('multiplayer-board').style.display = 'none';
            
        }

       
        
        const socket = io();
        let myColor = null;
        let isMyTurn = false;
        
        //Codigo de infirmacion de los jugadores que entran a la sala 
        socket.on('playersroomInfo', (players) => {
            console.log(players);   
            document.getElementById('jugadoreslist').textContent = `Jugador ${players.red} vs. ${players.blue}`;
        })
        // Asignar color cuando el servidor lo envía
        socket.on('assignColor', (color) => {
            myColor = color;
            console.log("color asignado:", myColor);
        });

        // Actualizar el turno actual
        socket.on('turn', (currentTurn) => {
            console.log(currentTurn);
            isMyTurn = (currentTurn === myColor);
                
                let boardContainer = document.getElementById('board_container');

                boardContainer.style.setProperty('background-color', isMyTurn ? (myColor === 'red' ? colorRed : colorBlue) : '#808080');
                boardContainer.style.setProperty('display', 'flex');
                boardContainer.style.setProperty('justify-content', 'center');
                boardContainer.style.setProperty('align-items', 'center');
                boardContainer.style.setProperty('padding', '10%');
                if (isMyTurn) {
                document.getElementById('info').textContent = 'Es tu turno';
            } else {
                document.getElementById('info').textContent = 'Es el turno del oponente';
            }
            toggleBoard(isMyTurn);
        });
   
 

   // actualizar el tablero en cada turno
        function resetBoard() {

             // Seleccionamos todos los elementos con la clase 'cell'
            let cells = document.querySelectorAll('.mp-cell');
            
            // Recorremos cada 'cell' y limpiamos su contenido y estilos
            cells.forEach(function(cell) {
                cell.innerHTML = '';  // Limpiar el contenido
                cell.style.backgroundColor = '';  // Restablecer el color de fondo
                cell.classList.remove('disabled');  // Eliminar la clase 'disabled' si está presente
            });
        }
const winningCombinations = [
            [0, 1, 2],  // Fila 1
            [3, 4, 5],  // Fila 2
            [6, 7, 8],  // Fila 3
            [0, 3, 6],  // Columna 1
            [1, 4, 7],  // Columna 2
            [2, 5, 8],  // Columna 3
            [0, 4, 8],  // Diagonal principal
            [2, 4, 6]   // Diagonal secundaria
            ];

            
        function checkWinnerMP () {
            let cells = document.querySelectorAll('.mp-cell');
            console.log("checkWinner");

            for (let i = 0; i < winningCombinations.length; i++) {
                let [a, b, c] = winningCombinations[i];

                // Obtenemos el contenido del span dentro de las celdas
                let spanA = cells[a].querySelector('span')?.textContent || '';
                let spanB = cells[b].querySelector('span')?.textContent || '';
                let spanC = cells[c].querySelector('span')?.textContent || '';

                // Verificamos si las tres celdas de la combinación tienen el mismo contenido y no están vacías
                if (spanA !== '' && spanA === spanB && spanA === spanC) {
                    console.log(`El jugador con ${spanA} ha ganado`);
                    document.getElementById('info').textContent = `¡El jugador ${spanA} ha ganado!`;

                    // Emitimos el evento al servidor indicando quién ha ganado
                    socket.emit('gameWon', spanA );
                    return spanA;  // Retornamos el símbolo del ganador ("X" o "O")
                }
            }

            console.log("No hay ganador");
            return null;
        }
// Realizar un movimiento
        function makeMove(index) {

            if (isMyTurn) {
                socket.emit('playerMove', index);
            }
        }
        function langosta (){
            console.log("langosta");
        }
        function updateBoard(casillasSeleccionadas) {
            // Actualizar la interfaz HTML para mostrar las casillas seleccionadas

            console.log("se actulizo la interfaz HTML");
            console.log(casillasSeleccionadas);
            casillasSeleccionadas.forEach((movimiento) => {
                console.log(movimiento);
                const casilla = document.getElementById(`mp-cell-${movimiento.casilla}`);// Agregar una etiqueta a la casilla
                
                casilla.innerHTML = movimiento.jugador === 'red' ? '<span style="color: white">X</span>' : '<span style="color: white">O</span>';
                casilla.style.backgroundColor = movimiento.jugador === 'red' ? 'red' : 'blue';
                casilla.classList.add('disabled');
            });
            langosta();
        }

        socket.on('updateBoard', (data) => {
           
            updateBoard(data);

            checkWinnerMP();
        })

        socket.on('youWon', (winner) => {
            alert("Ganaste");
            document.getElementById('info').textContent = `¡El jugador ${winner} ha ganado!`;

            exitGame();
            resetBoard(); // Resetear el tablero despues de ganar
        })

        socket.on('youLost', (lost) => {
            alert("Perdiste");

            exitGame();
            resetBoard();
        })
     
          // Informar la desconexion del usuario 
        socket.on('playerDisconnected', (player) => {
            console.log(player);
            resetBoard();
            document.getElementById('info').textContent = `${player.name} se desconectó. Desea salir ?`;
        })


        // Bloquear o desbloquear el tablero según el turno
        function toggleBoard(enable) {
            const cells = document.querySelectorAll('.cell');
            cells.forEach(cell => {
                if (enable) {
                    cell.classList.remove('disabled');
                } else {
                    cell.classList.add('disabled');
                }
            });
        }
   


       

 