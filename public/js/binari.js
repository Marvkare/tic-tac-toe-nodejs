function getRandomBinary() {
            return Math.round(Math.random()).toString();
        }

        function createBinaryNumber() {
            const binaryElement = document.createElement('div');
            binaryElement.className = 'binary';
            binaryElement.textContent = getRandomBinary();
            binaryElement.style.left = Math.random() * window.innerWidth + 'px';
            binaryElement.style.top = Math.random() * window.innerHeight + 'px';
            document.body.appendChild(binaryElement);

            setTimeout(() => {
                binaryElement.style.opacity = 0;
            }, 2000); // Cambia la opacidad después de 1 segundo

            setTimeout(() => {
                binaryElement.remove();
            }, 2000); // Se elimina después de 2 segundos
        }

        setInterval(createBinaryNumber, 130); // Cada 150 ms