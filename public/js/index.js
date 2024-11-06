    const button = document.getElementById('followButton');

    document.addEventListener('mousemove', (event) => {
        // Obtener la posición del mouse
        const mouseX = event.clientX;
        const mouseY = event.clientY;

        // Mover el botón a la posición del mouse, ajustando el offset
        button.style.left = mouseX + 'px';
    });


 import { loadFull } from "@tsparticles/engine";

    const particlesInit = async (main) => {
      await loadFull(main);
    };

    const particlesLoaded = (container) => {
      console.log("Particles container loaded", container);
    };

    // Aquí puedes configurar las opciones de los partículas
    const particlesOptions = {
      // Opciones de configuración
    };

    // Inicializar los partículas
    particlesJS("particles-js", particlesOptions, particlesInit, particlesLoaded);


    