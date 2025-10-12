// Inicialización del juego
document.addEventListener('DOMContentLoaded', () => {
    console.log('Juego cargado');
    initGame();
});

// Función de inicialización
function initGame() {
    const gameArea = document.getElementById('game-area');
    const rotateBtn = document.getElementById('rotate-btn');

    // Generar el tablero aleatorio
    generarTableroAleatorio();

    // Generar figura de Tetris aleatoria
    generarFiguraTetris();

    const columnas = document.querySelectorAll('.columna');

    // Evento del botón de rotación - rota la matriz 4x4 de espacios de tablero
    rotateBtn.addEventListener('click', () => {
        rotateTablero90();
    });

    // Añadir eventos de click a las bolas del tablero (no a la reserva)
    setupBallClickEvents();

    // Prevenir comportamientos por defecto en móviles
    preventDefaultBehaviors();
}

// Generar tablero aleatorio
function generarTableroAleatorio() {
    const gameArea = document.getElementById('game-area');

    // Crear array con 4 bolas de cada color (16 bolas en total)
    const colores = ['red', 'green', 'blue', 'yellow'];
    const bolasTablero = [];
    colores.forEach(color => {
        for (let i = 0; i < 4; i++) {
            bolasTablero.push(color);
        }
    });

    // Mezclar aleatoriamente las bolas del tablero
    shuffleArray(bolasTablero);

    // Crear array con 3 bolas negras y 1 espacio vacío para las reservas
    const reservas = ['black', 'black', 'black', null];
    shuffleArray(reservas);

    // Crear las 4 columnas
    for (let col = 0; col < 4; col++) {
        const columna = document.createElement('div');
        columna.className = 'columna';
        if (col === 0) columna.id = 'columna'; // Primera columna mantiene el id

        // Crear espacio de reserva
        const espacioReserva = document.createElement('div');
        espacioReserva.className = 'espacio reserva';

        if (reservas[col]) {
            const bolaReserva = document.createElement('div');
            bolaReserva.className = `ball ${reservas[col]}`;
            espacioReserva.appendChild(bolaReserva);
        }

        columna.appendChild(espacioReserva);

        // Crear 4 espacios de tablero para esta columna
        for (let fila = 0; fila < 4; fila++) {
            const espacio = document.createElement('div');
            espacio.className = 'espacio';

            const colorBola = bolasTablero[col * 4 + fila];
            const bola = document.createElement('div');
            bola.className = `ball ${colorBola}`;
            espacio.appendChild(bola);

            columna.appendChild(espacio);
        }

        gameArea.appendChild(columna);
    }
}

// Función para mezclar un array aleatoriamente (Fisher-Yates shuffle)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Rotar los espacios del tablero 90° en sentido horario (matriz 4x4)
function rotateTablero90() {
    const gameArea = document.getElementById('game-area');
    const columnas = Array.from(document.querySelectorAll('.columna'));

    // Prevenir múltiples rotaciones simultáneas
    if (gameArea.classList.contains('rotating')) return;
    gameArea.classList.add('rotating');

    // Crear matriz 4x4 con los espacios de tablero (índices 1-4 de cada columna)
    const matriz = [];
    columnas.forEach(columna => {
        const espacios = Array.from(columna.querySelectorAll('.espacio'));
        // Solo espacios de tablero (índices 1-4), excluyendo la reserva (índice 0)
        const espaciosTablero = espacios.slice(1, 5);
        matriz.push(espaciosTablero);
    });

    // Calcular las posiciones actuales de cada espacio
    const posiciones = matriz.map(col =>
        col.map(espacio => espacio.getBoundingClientRect())
    );

    // Calcular la rotación 90° antihorario: nueva[n-1-j][i] = vieja[i][j]
    const n = 4;
    const movimientos = []; // Guardar los movimientos necesarios

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            const espacioOrigen = matriz[i][j];
            const nuevaCol = n - 1 - j;
            const nuevaFila = i;
            const espacioDestino = matriz[nuevaCol][nuevaFila];

            const posOrigen = posiciones[i][j];
            const posDestino = posiciones[nuevaCol][nuevaFila];

            movimientos.push({
                espacio: espacioOrigen,
                bola: espacioOrigen.querySelector('.ball'),
                deltaX: posDestino.left - posOrigen.left,
                deltaY: posDestino.top - posOrigen.top,
                destinoCol: nuevaCol,
                destinoFila: nuevaFila
            });
        }
    }

    // Aplicar transformaciones para animar el movimiento
    movimientos.forEach(mov => {
        if (mov.bola) {
            mov.espacio.style.transition = 'transform 0.8s ease-in-out';
            mov.espacio.style.transform = `translate(${mov.deltaX}px, ${mov.deltaY}px)`;
        }
    });

    // Después de la animación, reorganizar el DOM
    setTimeout(() => {
        // Extraer todas las bolas en el orden correcto para la nueva matriz
        const nuevaBolasMatriz = Array(n).fill(null).map(() => Array(n).fill(null));

        movimientos.forEach(mov => {
            nuevaBolasMatriz[mov.destinoCol][mov.destinoFila] = mov.bola ? mov.bola.cloneNode(true) : null;
        });

        // Colocar las bolas en sus nuevas posiciones
        for (let col = 0; col < n; col++) {
            for (let fila = 0; fila < n; fila++) {
                const espacioDestino = matriz[col][fila];
                const bolaAMover = nuevaBolasMatriz[col][fila];

                // Limpiar el espacio y añadir la nueva bola
                espacioDestino.innerHTML = '';
                if (bolaAMover) {
                    espacioDestino.appendChild(bolaAMover);
                }

                // Resetear transform
                espacioDestino.style.transition = '';
                espacioDestino.style.transform = '';
            }
        }

        // Reconfigurar eventos después de la rotación
        setupBallClickEvents();

        gameArea.classList.remove('rotating');
    }, 800);
}

// Configurar eventos de click en las bolas
function setupBallClickEvents() {
    const columnas = document.querySelectorAll('.columna');

    // Primero, limpiar todas las clases bloqueadas
    document.querySelectorAll('.ball').forEach(ball => {
        ball.classList.remove('bloqueada');
    });

    columnas.forEach(columna => {
        const espacios = Array.from(columna.querySelectorAll('.espacio'));
        const reserva = espacios[0];
        const tieneBolaNegra = reserva.querySelector('.ball.black');
        const reservaVacia = !reserva.querySelector('.ball');

        espacios.forEach((espacio, index) => {
            const ball = espacio.querySelector('.ball');

            if (ball) {
                // Limpiar event listeners clonando la bola
                const ballClone = ball.cloneNode(true);
                ball.parentNode.replaceChild(ballClone, ball);

                // Bloquear bolas negras siempre
                if (ballClone.classList.contains('black')) {
                    ballClone.classList.add('bloqueada');
                }
                // Bloquear bolas en la reserva
                else if (index === 0) {
                    ballClone.classList.add('bloqueada');
                }
                // Bloquear bolas en columnas sin bola en la reserva (reserva vacía)
                else if (reservaVacia) {
                    ballClone.classList.add('bloqueada');
                }
                // Solo añadir eventos a bolas no bloqueadas del tablero
                else if (index > 0 && !ballClone.classList.contains('bloqueada')) {
                    ballClone.addEventListener('click', () => handleBallClick(espacio, index, columna));
                }
            }
        });
    });
}

// Manejar click en una bola
function handleBallClick(espacioClicked, clickedIndex, columna) {
    const espacios = Array.from(columna.querySelectorAll('.espacio'));

    // Evitar clicks múltiples durante la animación
    if (columna.classList.contains('animating')) return;
    columna.classList.add('animating');

    // Encontrar el espacio vacío en las reservas
    const todasLasColumnas = Array.from(document.querySelectorAll('.columna'));
    let espacioVacioReserva = null;
    let columnaDestino = null;

    for (let col of todasLasColumnas) {
        const reserva = col.querySelector('.espacio.reserva');
        if (reserva && !reserva.querySelector('.ball')) {
            espacioVacioReserva = reserva;
            columnaDestino = col;
            break;
        }
    }

    if (!espacioVacioReserva) {
        console.error('No se encontró espacio vacío en las reservas');
        columna.classList.remove('animating');
        return;
    }

    // Obtener el espacio de la reserva actual de esta columna
    const reservaActual = espacios[0];

    // Calcular la altura de un espacio (incluyendo gap)
    const espacioHeight = espacioClicked.offsetHeight;
    const gap = 5; // gap del CSS
    const moveDistance = espacioHeight + gap;

    // Calcular la posición de la bola clicada y del espacio vacío
    const posClicked = espacioClicked.getBoundingClientRect();
    const posVacio = espacioVacioReserva.getBoundingClientRect();
    const deltaX = posVacio.left - posClicked.left;
    const deltaY = posVacio.top - posClicked.top;

    // Aplicar transiciones a todos los espacios que van a moverse
    for (let i = 0; i < clickedIndex; i++) {
        espacios[i].style.transition = 'transform 0.8s ease-in-out';
    }

    // Configurar transición para la bola clicada
    espacioClicked.style.transition = 'transform 0.8s ease-in-out';

    // Usar requestAnimationFrame para asegurar sincronización
    requestAnimationFrame(() => {
        // Convertir la reserva actual en tablero
        reservaActual.classList.remove('reserva');

        // Mover visualmente todos los espacios superiores hacia abajo
        for (let i = 0; i < clickedIndex; i++) {
            espacios[i].style.transform = `translateY(${moveDistance}px)`;
        }

        // Mover la bola clicada hacia el espacio vacío de la reserva
        espacioClicked.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    });

    // Después de la animación, reorganizar el DOM
    setTimeout(() => {
        // Extraer la bola del espacio clicado
        const bolaMovida = espacioClicked.querySelector('.ball');

        // Mover la bola al espacio vacío de la reserva
        if (bolaMovida) {
            espacioVacioReserva.appendChild(bolaMovida.cloneNode(true));
        }

        // Vaciar el espacio clicado
        espacioClicked.innerHTML = '';

        // Mover el espacio clicado (ahora vacío) a la reserva de su columna
        columna.insertBefore(espacioClicked, columna.firstChild);

        // Resetear transforms
        espacios.forEach(espacio => {
            espacio.style.transform = '';
            espacio.style.transition = '';
        });

        espacioClicked.style.transform = '';
        espacioClicked.style.transition = '';
        espacioClicked.style.pointerEvents = '';

        // El espacio vacío de la reserva destino sigue siendo reserva (ahora con bola)
        // NO removemos la clase reserva de espacioVacioReserva

        // Convertir el espacio clicado (ahora vacío) en la nueva reserva
        espacioClicked.classList.add('reserva');

        columna.classList.remove('animating');

        // Reconfigurar eventos
        setupBallClickEvents();
    }, 800);
}// Prevenir zoom y otros comportamientos no deseados en móviles
function preventDefaultBehaviors() {
    // Prevenir zoom con doble tap
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (event) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);

    // Prevenir el menú contextual en móviles
    document.addEventListener('contextmenu', (event) => {
        event.preventDefault();
    });
}

// Utilidades para el juego

// Detectar si es dispositivo móvil
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Obtener dimensiones del área de juego
function getGameAreaDimensions() {
    const gameArea = document.getElementById('game-area');
    return {
        width: gameArea.clientWidth,
        height: gameArea.clientHeight
    };
}

// Generar figura de Tetris aleatoria
function generarFiguraTetris() {
    // Definir las figuras de Tetris (tetrominos) en una matriz 4x4
    const tetrominos = [
        // I
        [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        // O
        [
            [0, 0, 0, 0],
            [0, 1, 1, 0],
            [0, 1, 1, 0],
            [0, 0, 0, 0]
        ],
        // T
        [
            [0, 0, 0, 0],
            [0, 1, 0, 0],
            [1, 1, 1, 0],
            [0, 0, 0, 0]
        ],
        // S
        [
            [0, 0, 0, 0],
            [0, 1, 1, 0],
            [1, 1, 0, 0],
            [0, 0, 0, 0]
        ],
        // Z
        [
            [0, 0, 0, 0],
            [1, 1, 0, 0],
            [0, 1, 1, 0],
            [0, 0, 0, 0]
        ],
        // J
        [
            [0, 0, 0, 0],
            [1, 0, 0, 0],
            [1, 1, 1, 0],
            [0, 0, 0, 0]
        ],
        // L
        [
            [0, 0, 0, 0],
            [0, 0, 1, 0],
            [1, 1, 1, 0],
            [0, 0, 0, 0]
        ]
    ];

    // Seleccionar figura aleatoria
    const figuraAleatoria = tetrominos[Math.floor(Math.random() * tetrominos.length)];

    // Rotar aleatoriamente (0, 90, 180, 270 grados)
    const rotaciones = Math.floor(Math.random() * 4);
    let figura = figuraAleatoria;

    for (let i = 0; i < rotaciones; i++) {
        figura = rotarMatriz(figura);
    }

    // Calcular el bounding box de la figura para saber su tamaño real
    let minFila = 4, maxFila = -1, minCol = 4, maxCol = -1;
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (figura[i][j] === 1) {
                minFila = Math.min(minFila, i);
                maxFila = Math.max(maxFila, i);
                minCol = Math.min(minCol, j);
                maxCol = Math.max(maxCol, j);
            }
        }
    }

    // Calcular desplazamiento aleatorio dentro de los límites
    const alturaFigura = maxFila - minFila + 1;
    const anchoFigura = maxCol - minCol + 1;
    const maxOffsetFila = 4 - alturaFigura;
    const maxOffsetCol = 4 - anchoFigura;
    
    const offsetFila = Math.floor(Math.random() * (maxOffsetFila + 1));
    const offsetCol = Math.floor(Math.random() * (maxOffsetCol + 1));

    // Crear matriz vacía y colocar la figura con el offset
    const figuraDesplazada = Array(4).fill(null).map(() => Array(4).fill(0));
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (figura[i][j] === 1) {
                const nuevaFila = i - minFila + offsetFila;
                const nuevaCol = j - minCol + offsetCol;
                figuraDesplazada[nuevaFila][nuevaCol] = 1;
            }
        }
    }

    // Seleccionar un color aleatorio para la figura de Tetris
    const coloresTetris = ['red', 'green', 'blue', 'yellow'];
    const colorAleatorio = coloresTetris[Math.floor(Math.random() * coloresTetris.length)];

    // Crear el contenedor de la cuadrícula
    const preview = document.getElementById('tetris-preview');
    preview.innerHTML = '';

    const grid = document.createElement('div');
    grid.className = 'tetris-grid';

    // Crear las celdas con bolas
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            const cell = document.createElement('div');
            cell.className = 'tetris-cell';
            
            // Crear una bola para cada celda
            const ball = document.createElement('div');
            ball.className = 'tetris-ball';
            
            if (figuraDesplazada[i][j] === 1) {
                // Casilla ocupada - bola de color aleatorio
                ball.classList.add(colorAleatorio);
            } else {
                // Casilla vacía - bola blanca
                ball.classList.add('empty');
            }
            
            cell.appendChild(ball);
            grid.appendChild(cell);
        }
    }

    preview.appendChild(grid);
}

// Rotar matriz 90 grados en sentido horario
function rotarMatriz(matriz) {
    const n = matriz.length;
    const rotada = Array(n).fill(null).map(() => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            rotada[j][n - 1 - i] = matriz[i][j];
        }
    }

    return rotada;
}
