// ============================================================================
// CONFIGURACIÓN Y CONSTANTES
// ============================================================================

const CONFIG = {
    GRID_SIZE: 16,
    GRID_COLUMNS: 4,
    TARGET_COUNT: 4,
    GRID_NUMBER_MIN: 1,
    GRID_NUMBER_MAX: 9,
    TARGET_NUMBER_MIN: 13,
    TARGET_NUMBER_MAX: 19,
    COLORS: ['#4ecd5dff', '#45b7d1', '#f9ca24', '#ff6b6b'] // Verde, Azul, Amarillo, Rojo
};

// ============================================================================
// ESTADO DEL JUEGO
// ============================================================================

const gameState = {
    buttons: Array(CONFIG.GRID_SIZE).fill(false),
    numbers: [],
    targetNumbers: Array(CONFIG.TARGET_COUNT).fill(false),
    completedTargets: [], // Array de objetos: { targetIndex, targetValue, usedButtons: [{index, value}], color }
    availableColors: [...CONFIG.COLORS] // Colores disponibles (se van consumiendo)
};

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Obtiene un número aleatorio de un array
 */
const getRandomFromArray = (arr) => arr[Math.floor(Math.random() * arr.length)];

/**
 * Obtiene un número aleatorio entre min y max (incluidos)
 */
const getRandomInRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Añade event listeners unificados (click y touch) a un elemento
 */
const addClickListener = (element, handler) => {
    element.addEventListener('click', handler);
    element.addEventListener('touchend', (e) => {
        e.preventDefault();
        handler();
    });
};

/**
 * Parsea un parámetro de URL como array de números
 */
const parseUrlNumberArray = (urlParams, paramName, expectedLength) => {
    if (!urlParams.has(paramName)) return null;

    const values = urlParams.get(paramName)
        .split(',')
        .map(num => parseInt(num.trim(), 10))
        .filter(num => !isNaN(num));

    if (values.length !== expectedLength) {
        console.warn(`El parámetro '${paramName}' debe tener exactamente ${expectedLength} números. Se usarán valores aleatorios.`);
        return null;
    }

    return values;
};

/**
 * Lee los parámetros de la URL
 */
const getUrlParameters = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return {
        gridNumbers: parseUrlNumberArray(urlParams, 'grid', CONFIG.GRID_SIZE),
        targetNumbers: parseUrlNumberArray(urlParams, 'target', CONFIG.TARGET_COUNT)
    };
};

// ============================================================================
// LÓGICA DE JUEGO - HELPERS
// ============================================================================

/**
 * Recolecta los botones actualmente marcados con su información
 * @returns {Array<{index: number, value: number}>} Array de botones marcados
 */
const getMarkedButtons = () => {
    const marked = [];
    gameState.buttons.forEach((isMarked, index) => {
        if (isMarked) {
            marked.push({
                index,
                value: gameState.numbers[index]
            });
        }
    });
    return marked;
};

/**
 * Limpia todos los botones marcados (estado y visual)
 */
const clearAllMarkedButtons = () => {
    gameState.buttons.fill(false);
    document.querySelectorAll('.square-button.marked').forEach(btn => {
        btn.classList.remove('marked');
    });
};

/**
 * Restaura el estilo visual de botones específicos a su estado por defecto
 * @param {Array<{index: number}>} buttons - Array de botones a restaurar
 */
const restoreButtonsVisuals = (buttons) => {
    buttons.forEach(btn => {
        const element = document.querySelector(`.square-button[data-id="${btn.index}"]`);
        if (element) {
            element.style.backgroundColor = '';
            element.classList.remove('marked', 'completed');
        }
    });
};

// ============================================================================
// LÓGICA DE JUEGO - INTERACCIONES
// ============================================================================

/**
 * Alterna el estado de un botón del grid
 */
const toggleButton = (element, index) => {
    const isCurrentlyMarked = gameState.buttons[index];

    if (isCurrentlyMarked) {
        gameState.buttons[index] = false;
        element.style.backgroundColor = '';
        element.classList.remove('marked');
    } else {
        if (gameState.availableColors.length === 0) {
            console.warn('⚠️ No hay colores disponibles. Completa todos los objetivos.');
            return;
        }
        gameState.buttons[index] = true;
        element.style.backgroundColor = gameState.availableColors[0];
        element.classList.add('marked');
    }
};

/**
 * Completa un objetivo con los botones actualmente marcados
 * @param {HTMLElement} element - Elemento DOM del objetivo
 * @param {number} columnIndex - Índice de la columna del objetivo
 */
const completeObjective = (element, columnIndex) => {
    const markedButtons = getMarkedButtons();

    if (markedButtons.length === 0) {
        console.warn('⚠️ No se puede completar un objetivo sin botones marcados');
        return;
    }

    const targetValue = parseInt(element.textContent);
    const usedColor = gameState.availableColors.shift();

    gameState.targetNumbers[columnIndex] = true;
    element.classList.add('achieved');
    element.style.color = usedColor;

    // Marcar botones como completados (efecto visual deshabilitado)
    markedButtons.forEach(btn => {
        const buttonElement = document.querySelector(`.square-button[data-id="${btn.index}"]`);
        if (buttonElement) {
            buttonElement.classList.add('completed');
        }
    });

    gameState.completedTargets.push({
        targetIndex: columnIndex,
        targetValue,
        usedButtons: markedButtons,
        color: usedColor
    });

    clearAllMarkedButtons();

    console.log(`✅ Objetivo ${targetValue} completado con:`, markedButtons);
};

/**
 * Desmarca un objetivo completado y restaura su estado
 * @param {HTMLElement} element - Elemento DOM del objetivo
 * @param {number} columnIndex - Índice de la columna del objetivo
 */
const uncompleteObjective = (element, columnIndex) => {
    const lastIndex = gameState.completedTargets
        .map(t => t.targetIndex)
        .lastIndexOf(columnIndex);

    if (lastIndex === -1) return;

    const removed = gameState.completedTargets.splice(lastIndex, 1)[0];

    gameState.targetNumbers[columnIndex] = false;
    element.classList.remove('achieved');
    element.style.color = '';

    restoreButtonsVisuals(removed.usedButtons);

    gameState.availableColors.push(removed.color);

    console.log(`❌ Objetivo desmarcado:`, removed);
};

/**
 * Alterna el estado de un número objetivo
 */
const toggleTargetNumber = (element, columnIndex) => {
    const wasAchieved = gameState.targetNumbers[columnIndex];

    if (!wasAchieved) {
        completeObjective(element, columnIndex);
    } else {
        uncompleteObjective(element, columnIndex);
    }
};

/**
 * Crea un botón del grid
 */
const createGridButton = (index, number) => {
    const button = document.createElement('div');
    button.className = 'square-button';
    button.dataset.id = index;
    button.textContent = number;

    addClickListener(button, () => toggleButton(button, index));

    return button;
};

/**
 * Crea un número objetivo
 */
const createTargetNumber = (columnIndex, number) => {
    const element = document.createElement('div');
    element.className = 'column-number';
    element.dataset.col = columnIndex;
    element.textContent = number;

    addClickListener(element, () => toggleTargetNumber(element, columnIndex));

    return element;
};

/**
 * Genera los números para el grid
 */
const generateGridNumbers = (providedNumbers) => {
    const availableNumbers = Array.from(
        { length: CONFIG.GRID_NUMBER_MAX - CONFIG.GRID_NUMBER_MIN + 1 },
        (_, i) => i + CONFIG.GRID_NUMBER_MIN
    );

    return Array.from({ length: CONFIG.GRID_SIZE }, (_, i) =>
        providedNumbers?.[i] ?? getRandomFromArray(availableNumbers)
    );
};

/**
 * Genera los números objetivo con validación de suma
 */
const generateTargetNumbers = (providedNumbers) => {
    if (providedNumbers) return providedNumbers;

    const gridSum = gameState.numbers.reduce((sum, num) => sum + num, 0);
    const targets = [];
    let targetSum = 0;

    for (let i = 0; i < CONFIG.TARGET_COUNT; i++) {
        const maxAllowed = gridSum - targetSum - (CONFIG.TARGET_COUNT - i - 1) * CONFIG.TARGET_NUMBER_MIN;
        const max = Math.min(CONFIG.TARGET_NUMBER_MAX, maxAllowed);
        const num = getRandomInRange(CONFIG.TARGET_NUMBER_MIN, max);
        targets.push(num);
        targetSum += num;
    }

    return targets;
};

/**
 * Inicializa el grid de botones
 */
const initializeGrid = (container, numbers) => {
    const fragment = document.createDocumentFragment();

    numbers.forEach((number, index) => {
        fragment.appendChild(createGridButton(index, number));
    });

    container.appendChild(fragment);
};

/**
 * Inicializa los números objetivo
 */
const initializeTargets = (container, numbers) => {
    const fragment = document.createDocumentFragment();

    numbers.forEach((number, columnIndex) => {
        fragment.appendChild(createTargetNumber(columnIndex, number));
    });

    container.appendChild(fragment);
};

/**
 * Limpia el estado del juego
 */
const resetGameState = () => {
    gameState.buttons.fill(false);
    gameState.numbers = [];
    gameState.targetNumbers.fill(false);
    gameState.completedTargets = [];
    gameState.availableColors = [...CONFIG.COLORS];
};

/**
 * Inicializa el juego
 */
const init = (providedGridNumbers = null, providedTargetNumbers = null) => {
    const buttonGrid = document.getElementById('button-grid');
    const columnNumbersContainer = document.getElementById('column-numbers');

    if (!buttonGrid || !columnNumbersContainer) {
        console.error('No se encontraron los elementos del DOM necesarios.');
        return;
    }

    resetGameState();
    buttonGrid.innerHTML = '';
    columnNumbersContainer.innerHTML = '';

    const gridNumbers = generateGridNumbers(providedGridNumbers);
    gameState.numbers = [...gridNumbers];

    const targetNumbers = generateTargetNumbers(providedTargetNumbers);

    initializeGrid(buttonGrid, gridNumbers);
    initializeTargets(columnNumbersContainer, targetNumbers);

    console.log('🎮 Juego inicializado');
};

/**
 * Refresca el juego con nuevos números
 */
const refreshGame = () => {
    const { gridNumbers, targetNumbers } = getUrlParameters();
    init(gridNumbers, targetNumbers);
};

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Prevenir zoom y scroll en dispositivos táctiles
    document.addEventListener('gesturestart', (e) => e.preventDefault());
    document.body.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

    // Pull-to-refresh: deslizar hacia abajo regenera el juego
    let startY = 0;
    const gameArea = document.getElementById('game-area');
    gameArea.addEventListener('touchstart', (e) => startY = e.touches[0].clientY);
    gameArea.addEventListener('touchend', (e) => {
        if (e.changedTouches[0].clientY - startY > 100) refreshGame();
    });

    // Inicializar con parámetros de URL si existen
    const { gridNumbers, targetNumbers } = getUrlParameters();
    init(gridNumbers, targetNumbers);

    console.log('✅ Aplicación cargada');
});
