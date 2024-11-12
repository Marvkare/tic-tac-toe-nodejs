
---

# Tic-Tac-Toe: Juego en Línea

## Descripción del Proyecto

Este proyecto es un juego de **Tic-Tac-Toe** en línea que ofrece dos modos de juego: 
- **Modo Individual**: el jugador juega contra la máquina (inteligencia artificial).
- **Modo Multijugador**: dos jugadores se enfrentan en línea utilizando **WebSockets** para la sincronización en tiempo real.

El objetivo principal es proporcionar una experiencia divertida tanto para jugadores individuales como para jugadores que desean competir contra otros en línea. El proyecto utiliza tecnologías como HTML, CSS, JavaScript, Node.js y Socket.io para la funcionalidad multijugador en tiempo real.

## Características Implementadas

### 1. Menú Principal
- **Bienvenida personalizada**: El nombre de usuario se obtiene desde el servidor y se muestra en la pantalla.
- **Botón para Jugar contra la Máquina**: Al hacer clic en el botón "Jugar Contra Máquina", se inicia una partida de **Tic-Tac-Toe** en modo individual contra la IA.
- **Botón para Jugar Contra Otro Jugador**: Al hacer clic en "Jugar Contra Otro Jugador", el jugador ingresa a una sala de espera mientras se empareja con otro jugador disponible.
- **Visualización del Ranking**: Se incluye una sección para mostrar el ranking de jugadores (pendiente de desarrollo).
- **Cerrar Sesión**: Botón que permite al jugador cerrar su sesión y regresar a la pantalla de inicio.

### 2. Modo Individual (Contra Máquina)
- **Tablero de Juego**: Se implementa un tablero de 3x3 donde el jugador (X) puede realizar movimientos contra la máquina (O).
- **Lógica de la Máquina**: La máquina realiza movimientos aleatorios en celdas vacías.
- **Verificación de Ganador**: Se comprueba si un jugador ha ganado o si el juego termina en empate.
- **Reinicio Automático del Juego**: Después de que un jugador gana o se declara un empate, el tablero se reinicia automáticamente.

### 3. Modo Multijugador
- **Conexión en Tiempo Real con Socket.io**: Los jugadores se conectan a través de **WebSockets** y se emparejan automáticamente para jugar.
- **Turnos Alternados**: Los jugadores se asignan automáticamente como 'X' o 'O' y alternan sus turnos.
- **Sincronización del Tablero**: El estado del tablero se sincroniza en tiempo real entre los jugadores.
- **Indicación de Turno**: Se informa a los jugadores de quién tiene el turno y se desactiva el tablero para el jugador que no le corresponde jugar.
- **Emparejamiento Automático**: Al hacer clic en "Jugar Contra Otro Jugador", el usuario entra en una sala de espera hasta que se empareje con otro jugador.

## Funcionalidades Pendientes por Desarrollar

### 1. Ranking
- **Carga y Visualización del Ranking**: Aún no se ha implementado la lógica para cargar el ranking de jugadores desde el servidor. Será necesario crear un endpoint en el backend para obtener esta información y mostrarla en el frontend.

### 2. Sistema de Emparejamiento
- **Mejora del Emparejamiento Multijugador**: Actualmente, el emparejamiento multijugador simplemente asigna al primer jugador disponible. Se podría mejorar para que los jugadores puedan elegir crear o unirse a salas de juego específicas.

### 3. Jugabilidad en Modo Multijugador
- **Lógica de Ganador en Multijugador**: Aún no se ha implementado la lógica para detectar y mostrar el ganador en modo multijugador. Es necesario añadir la verificación de combinaciones ganadoras en el servidor para determinar el resultado del juego.
- **Reinicio de la Partida en Multijugador**: Después de que un jugador gane o se empate la partida, el tablero debería reiniciarse automáticamente o dar la opción de una nueva partida.

### 4. Optimización y Mejora de la IA
- **Mejora de la IA en Modo Individual**: Actualmente, la máquina realiza movimientos aleatorios. Se puede mejorar implementando algoritmos como **Minimax** para que la IA juegue de manera más estratégica.

### 5. Diseño Responsivo y Mejoras en la UI
- **Estilos y Diseño Adaptativo**: Aunque el juego es funcional, el diseño puede ser mejorado para ofrecer una experiencia más atractiva, y debe adaptarse mejor a dispositivos móviles y diferentes tamaños de pantalla.

### 6. Seguridad y Manejo de Sesiones
- **Manejo de Sesiones y Autenticación**: Es importante garantizar que solo usuarios autenticados puedan jugar y que el estado de la sesión sea manejado correctamente.

## Tecnologías Utilizadas
- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express
- **Comunicación en Tiempo Real**: Socket.io
- **Control de Versiones**: Git
- **Servidor**: Node.js con Socket.io

## Instrucciones para Ejecutar el Proyecto

### Requisitos
- Node.js y npm instalados

### Pasos:
1. Clonar el repositorio:
   ```bash
   git clone https://github.com/usuario/tic-tac-toe.git
   ```
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Ejecutar el servidor:
   ```bash
   npm start
   ```
4. Acceder a la aplicación en el navegador:
   ```bash
   http://localhost:3000
   ```

## Contribución
Si deseas contribuir al desarrollo de este proyecto, en el grupo de whatsapp envia tu nombre de usuario en github
1. Realiza un fork del repositorio.
2. Las nuevas implementaciones se realizaran en la rama de desarrollo.
3. Envía un pull request con la descripción de los cambios realizados.

