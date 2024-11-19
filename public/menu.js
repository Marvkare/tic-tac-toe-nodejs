function loadRanking() {
    fetch('/ranking') // Hacer una solicitud a la ruta del servidor
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al cargar el ranking');
        }
        return response.json(); // Convertir la respuesta a JSON
    })
    .then(data => {
        const rankingList = document.getElementById('ranking-list');
        rankingList.innerHTML = ''; // Limpiar la tabla existente

        // Recorrer los datos y crear filas de tabla
        data.forEach(player => {
            const row = document.createElement('tr'); // Crear una nueva fila

            // Crear y agregar celdas a la fila
            const nameCell = document.createElement('td');
            nameCell.textContent = player.username;
            row.appendChild(nameCell);

            const winsCell = document.createElement('td');
            winsCell.textContent = player.wins;
            row.appendChild(winsCell);

            const lossesCell = document.createElement('td');
            lossesCell.textContent = player.losses;
            row.appendChild(lossesCell);

            rankingList.appendChild(row); // Agregar la fila a la tabla
        });
    })
    .catch(error => {
        console.error('Error:', error);
        alert('No se pudo cargar el ranking. Intenta de nuevo más tarde.');
    });
}