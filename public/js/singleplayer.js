
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
                console.log(data)
                document.getElementById('username').textContent = data.username;
                loadRanking();
            })
            .catch(err => console.error('Error fetching user data:', err));

        function startSinglePlayer() {
            document.getElementById('menu').style.display = 'none';
            document.getElementById('game-board').style.display = 'block';
        }

       

        function loadRanking() {
            // Obtener el ranking del servidor y mostrarlo
        }

        function logout() {
            window.location.href = '/logout';
        }

        // Código para el modo jugador contra máquina
        let board = Array(9).fill(null);
        let currentPlayer = 'X';

        function playerMove(index) {
            if (!board[index]) {
                board[index] = currentPlayer;
                document.getElementById(`cell-${index}`).textContent = currentPlayer;
                if (checkWinner(currentPlayer)) {
                    setTimeout(() => alert('You win!'), 100);
                    resetGame();
                } else if (board.includes(null)) {
                    setTimeout(machineMove, 500);
                } else {
                    setTimeout(() => alert('It\'s a draw!'), 100);
                    resetGame();
                }
            }
        }

        function machineMove() {
            let emptyCells = board.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
            let randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            board[randomCell] = 'O';
            document.getElementById(`cell-${randomCell}`).textContent = 'O';

            if (checkWinner('O')) {
                setTimeout(() => alert('Machine wins!'), 100);
                resetGame();
            }
        }

        function checkWinner(player) {
            const winningCombinations = [
                [0, 1, 2], [3, 4, 5], [6, 7, 8],  // Rows
                [0, 3, 6], [1, 4, 7], [2, 5, 8],  // Columns
                [0, 4, 8], [2, 4, 6]              // Diagonals
            ];
            return winningCombinations.some(combination => {
                return combination.every(index => board[index] === player);
            });
        }

        function resetGame() {
            board = Array(9).fill(null);
            document.querySelectorAll('.cell').forEach(cell => cell.textContent = '');
        }