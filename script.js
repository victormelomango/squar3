// Array de clases de colores disponibles
const colorClasses = ['color-1', 'color-2', 'color-3', 'color-4', 'color-5', 'color-6'];

// Estado actual de cada celda (índice del color en el array colorClasses, -1 = sin color)
let cellStates = new Array(16).fill(-1);

// Números aleatorios en cada celda (1-9)
let cellNumbers = new Array(16);

// Números iniciales originales (para restaurar con el botón reiniciar)
let initialNumbers = new Array(16);

// Función para generar números aleatorios con suma superior a 68
function generateRandomNumbers() {
    const minSum = 68;

    do {
        // Generar números aleatorios entre 1 y 9
        for (let i = 0; i < 16; i++) {
            cellNumbers[i] = Math.floor(Math.random() * 9) + 1;
        }

        // Calcular la suma actual
        const currentSum = cellNumbers.reduce((sum, num) => sum + num, 0);

        // Si la suma es superior a 68, salir del bucle
        if (currentSum > minSum) {
            console.log(`Números generados. Suma total: ${currentSum} (superior a ${minSum})`);
            break;
        }

        // Si no, regenerar números
        console.log(`Suma ${currentSum} no es superior a ${minSum}, regenerando...`);

    } while (true);

    // Guardar los números iniciales
    initialNumbers = [...cellNumbers];
}

// Función para inicializar la aplicación
function initializeApp() {
    // Generar números aleatorios
    generateRandomNumbers();

    // Obtener todas las celdas
    const cells = document.querySelectorAll('.grid-cell');
    const resetBtn = document.getElementById('reset-btn');
    const completeBtn = document.getElementById('complete-btn');

    // Mostrar números en las celdas
    cells.forEach((cell, index) => {
        cell.textContent = cellNumbers[index];
        cell.addEventListener('click', () => handleCellClick(cell, index));

        // Agregar efecto de hover personalizado
        cell.addEventListener('mouseenter', () => {
            if (cellStates[index] === -1) {
                cell.style.backgroundColor = '#cbd5e0';
            }
        });

        cell.addEventListener('mouseleave', () => {
            if (cellStates[index] === -1) {
                cell.style.backgroundColor = '#e2e8f0';
            }
        });
    });

    // Agregar event listener al botón de reinicio
    resetBtn.addEventListener('click', resetGrid);

    // Agregar event listener al botón de completar
    completeBtn.addEventListener('click', completeSelectedCells);

    console.log('Aplicación inicializada correctamente');
}

// Función para manejar el clic en una celda
function handleCellClick(cell, cellIndex) {
    // Obtener el estado actual de la celda
    const currentState = cellStates[cellIndex];

    // Remover la clase de color actual si existe
    if (currentState !== -1) {
        cell.classList.remove(colorClasses[currentState]);
    }

    // Calcular el siguiente estado
    let nextState;
    if (currentState === -1) {
        // Si no tiene color, asignar el primer color
        nextState = 0;
    } else if (currentState === colorClasses.length - 1) {
        // Si está en el último color, volver al estado sin color
        nextState = -1;
    } else {
        // Avanzar al siguiente color
        nextState = currentState + 1;
    }

    // Actualizar el estado de la celda
    cellStates[cellIndex] = nextState;

    // Aplicar el nuevo color si corresponde
    if (nextState !== -1) {
        cell.classList.add(colorClasses[nextState]);
    }

    // Agregar efecto de animación al hacer clic
    addClickAnimation(cell);

    // Verificar si hay un patrón completo (opcional)
    checkPattern();
}

// Función para agregar animación de clic
function addClickAnimation(cell) {
    // Crear un elemento de efecto temporal
    const effect = document.createElement('div');
    effect.style.position = 'absolute';
    effect.style.top = '50%';
    effect.style.left = '50%';
    effect.style.width = '10px';
    effect.style.height = '10px';
    effect.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    effect.style.borderRadius = '50%';
    effect.style.transform = 'translate(-50%, -50%)';
    effect.style.animation = 'ripple 0.6s ease-out';
    effect.style.pointerEvents = 'none';

    cell.appendChild(effect);

    // Remover el efecto después de la animación
    setTimeout(() => {
        if (effect.parentNode) {
            effect.parentNode.removeChild(effect);
        }
    }, 600);
}

// Función para reiniciar la cuadrícula
function resetGrid() {
    const cells = document.querySelectorAll('.grid-cell');

    // Restaurar números iniciales (no generar nuevos)
    cellNumbers = [...initialNumbers];

    // Reiniciar estados
    cellStates.fill(-1);

    // Remover todas las clases de color y actualizar números
    cells.forEach((cell, index) => {
        colorClasses.forEach(colorClass => {
            cell.classList.remove(colorClass);
        });

        // Actualizar el número mostrado con los números iniciales
        cell.textContent = cellNumbers[index];
        cell.style.opacity = '1';
        cell.style.visibility = 'visible';

        // Agregar animación de reinicio
        cell.style.animation = 'none';
        cell.offsetHeight; // Trigger reflow
        cell.style.animation = 'fadeInUp 0.3s ease-out forwards';
    });

    console.log('Cuadrícula reiniciada con números originales');
}// Función para completar celdas seleccionadas (con color)
function completeSelectedCells() {
    const cells = document.querySelectorAll('.grid-cell');
    const selectedCells = [];

    // Identificar celdas seleccionadas (que tienen color)
    cellStates.forEach((state, index) => {
        if (state !== -1) {
            selectedCells.push(index);
        }
    });

    if (selectedCells.length === 0) {
        console.log('No hay celdas seleccionadas para completar');
        return;
    }

    // Hacer desaparecer las celdas seleccionadas
    selectedCells.forEach(index => {
        const cell = cells[index];
        cell.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
        cell.style.opacity = '0';
        cell.style.transform = 'scale(0.8)';
    });

    // Después de la animación de desaparición, aplicar gravedad
    setTimeout(() => {
        applyGravity(selectedCells);
    }, 300);
}

// Función para aplicar efecto de gravedad
function applyGravity(removedCells) {
    const cells = document.querySelectorAll('.grid-cell');

    // Crear nueva matriz de estados y números
    const newStates = new Array(16).fill(-1);
    const newNumbers = new Array(16).fill(null);

    // Para cada columna (0-3)
    for (let col = 0; col < 4; col++) {
        // Obtener todas las celdas de esta columna que NO fueron removidas (de arriba a abajo)
        const remainingCells = [];

        for (let row = 0; row < 4; row++) {
            const index = row * 4 + col;
            if (!removedCells.includes(index)) {
                remainingCells.push({
                    state: cellStates[index],
                    number: cellNumbers[index]
                });
            }
        }

        // Llenar la columna: espacios vacíos arriba, celdas existentes abajo
        for (let row = 0; row < 4; row++) {
            const newIndex = row * 4 + col;
            const remainingCellsFromBottom = remainingCells.length;
            const emptySpacesAtTop = 4 - remainingCellsFromBottom;

            if (row < emptySpacesAtTop) {
                // Espacios vacíos en la parte superior - dejar vacíos
                newStates[newIndex] = -1;
                newNumbers[newIndex] = null;
            } else {
                // Celdas que "caen" desde arriba
                const cellIndex = row - emptySpacesAtTop;
                newStates[newIndex] = remainingCells[cellIndex].state;
                newNumbers[newIndex] = remainingCells[cellIndex].number;
            }
        }
    }

    // Aplicar los nuevos estados y números
    cellStates = [...newStates];
    cellNumbers = [...newNumbers];

    // Animar las celdas cayendo
    cells.forEach((cell, index) => {
        // Restaurar visibilidad y propiedades
        cell.style.opacity = '1';
        cell.style.visibility = 'visible';
        cell.style.transform = 'scale(1)';
        cell.style.transition = 'transform 0.5s ease-out';

        // Actualizar contenido
        if (cellNumbers[index] !== null) {
            cell.textContent = cellNumbers[index];
        } else {
            cell.textContent = '';
        }

        // Remover todas las clases de color
        colorClasses.forEach(colorClass => {
            cell.classList.remove(colorClass);
        });

        // Aplicar nuevo color si corresponde
        if (cellStates[index] !== -1) {
            cell.classList.add(colorClasses[cellStates[index]]);
        }

        // Animación de caída escalonada por columnas
        const col = index % 4;
        const row = Math.floor(index / 4);

        cell.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            cell.style.transform = 'translateY(0)';
        }, 50 + col * 50 + row * 100);
    });

    console.log('Efecto de gravedad aplicado');
}

// Función para verificar patrones (opcional - para futuras mejoras)
function checkPattern() {
    // Contar cuántas celdas tienen cada color
    const colorCounts = {};
    cellStates.forEach(state => {
        if (state !== -1) {
            const colorName = colorClasses[state];
            colorCounts[colorName] = (colorCounts[colorName] || 0) + 1;
        }
    });

    // Verificar si todas las celdas tienen el mismo color
    const uniqueColors = Object.keys(colorCounts);
    if (uniqueColors.length === 1 && colorCounts[uniqueColors[0]] === 16) {
        showCelebration();
    }
}

// Función para mostrar celebración (opcional)
function showCelebration() {
    // Crear efecto de celebración simple
    const container = document.querySelector('.container');
    const celebration = document.createElement('div');
    celebration.textContent = '¡Felicitaciones! 🎉';
    celebration.style.position = 'fixed';
    celebration.style.top = '20px';
    celebration.style.left = '50%';
    celebration.style.transform = 'translateX(-50%)';
    celebration.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    celebration.style.color = 'white';
    celebration.style.padding = '15px 30px';
    celebration.style.borderRadius = '25px';
    celebration.style.fontSize = '1.2rem';
    celebration.style.fontWeight = 'bold';
    celebration.style.zIndex = '1000';
    celebration.style.animation = 'slideDown 0.5s ease-out forwards';
    celebration.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';

    document.body.appendChild(celebration);

    // Remover después de unos segundos
    setTimeout(() => {
        if (celebration.parentNode) {
            celebration.style.animation = 'slideUp 0.5s ease-out forwards';
            setTimeout(() => {
                if (celebration.parentNode) {
                    celebration.parentNode.removeChild(celebration);
                }
            }, 500);
        }
    }, 3000);
}

// Agregar estilos CSS dinámicos para las animaciones adicionales
function addDynamicStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            0% {
                width: 10px;
                height: 10px;
                opacity: 1;
            }
            100% {
                width: 60px;
                height: 60px;
                opacity: 0;
            }
        }

        @keyframes slideDown {
            from {
                transform: translateX(-50%) translateY(-100%);
                opacity: 0;
            }
            to {
                transform: translateX(-50%) translateY(0);
                opacity: 1;
            }
        }

        @keyframes slideUp {
            from {
                transform: translateX(-50%) translateY(0);
                opacity: 1;
            }
            to {
                transform: translateX(-50%) translateY(-100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Función para agregar funcionalidad de teclado (opcional)
function addKeyboardSupport() {
    let selectedCell = 0;

    document.addEventListener('keydown', (event) => {
        const cells = document.querySelectorAll('.grid-cell');

        switch(event.key) {
            case 'ArrowUp':
                selectedCell = Math.max(0, selectedCell - 4);
                break;
            case 'ArrowDown':
                selectedCell = Math.min(15, selectedCell + 4);
                break;
            case 'ArrowLeft':
                selectedCell = Math.max(0, selectedCell - 1);
                break;
            case 'ArrowRight':
                selectedCell = Math.min(15, selectedCell + 1);
                break;
            case ' ':
            case 'Enter':
                event.preventDefault();
                handleCellClick(cells[selectedCell], selectedCell);
                break;
            case 'r':
            case 'R':
                resetGrid();
                break;
            default:
                return;
        }

        // Remover highlight anterior
        cells.forEach(cell => cell.classList.remove('keyboard-selected'));

        // Agregar highlight al nuevo cell seleccionado
        cells[selectedCell].classList.add('keyboard-selected');

        event.preventDefault();
    });

    // Agregar estilo para la selección por teclado
    const keyboardStyle = document.createElement('style');
    keyboardStyle.textContent = `
        .keyboard-selected {
            outline: 3px solid #667eea;
            outline-offset: 2px;
        }
    `;
    document.head.appendChild(keyboardStyle);
}

// Inicializar la aplicación cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    addDynamicStyles();
    addKeyboardSupport();
});