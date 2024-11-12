    const button = document.getElementById('followButton');

    document.addEventListener('mousemove', (event) => {
        // Obtener la posición del mouse
        const mouseX = event.clientX;
        const mouseY = event.clientY;

        // Mover el botón a la posición del mouse, ajustando el offset
        button.style.left = mouseX + 'px';
    });

