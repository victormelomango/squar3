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
    TARGET_NUMBER_MAX: 19
};

// ============================================================================
// ESTADO DEL JUEGO
// ============================================================================

const gameState = {
    buttons: Array(CONFIG.GRID_SIZE).fill(false),
    numbers: [],
    targetNumbers: Array(CONFIG.TARGET_COUNT).fill(false)
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
// LÓGICA DE JUEGO
// ============================================================================

/**
 * Alterna el estado de un botón del grid
 */
const toggleButton = (element, index) => {
    gameState.buttons[index] = !gameState.buttons[index];
    element.classList.toggle('marked');
};

/**
 * Alterna el estado de un número objetivo
 */
const toggleTargetNumber = (element, col) => {
    gameState.targetNumbers[col] = !gameState.targetNumbers[col];
    element.classList.toggle('achieved');
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
const createTargetNumber = (col, number) => {
    const element = document.createElement('div');
    element.className = 'column-number';
    element.dataset.col = col;
    element.textContent = number;

    addClickListener(element, () => toggleTargetNumber(element, col));

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

    return Array.from({ length: CONFIG.GRID_SIZE }, (_, i) => {
        return providedNumbers?.[i] ?? getRandomFromArray(availableNumbers);
    });
};

/**
 * Genera los números objetivo
 */
const generateTargetNumbers = (providedNumbers) => {
    return Array.from({ length: CONFIG.TARGET_COUNT }, (_, i) => {
        return providedNumbers?.[i] ?? getRandomInRange(CONFIG.TARGET_NUMBER_MIN, CONFIG.TARGET_NUMBER_MAX);
    });
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

    numbers.forEach((number, col) => {
        fragment.appendChild(createTargetNumber(col, number));
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

    // Limpiar estado previo
    resetGameState();
    buttonGrid.innerHTML = '';
    columnNumbersContainer.innerHTML = '';

    // Generar números
    const gridNumbers = generateGridNumbers(providedGridNumbers);
    const targetNumbers = generateTargetNumbers(providedTargetNumbers);

    // Guardar en el estado
    gameState.numbers = [...gridNumbers];

    // Crear elementos del juego
    initializeGrid(buttonGrid, gridNumbers);
    initializeTargets(columnNumbersContainer, targetNumbers);

    console.log('Juego inicializado con números del grid:', gameState.numbers);
    console.log('Números objetivo:', targetNumbers);
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
    console.log('Juego cargado correctamente');

    // Prevenir zoom en dispositivos táctiles
    document.addEventListener('gesturestart', (e) => e.preventDefault());

    // Prevenir scroll en dispositivos táctiles
    document.body.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

    // Pull to refresh con feedback visual
    let startY = 0;
    const gameArea = document.getElementById('game-area');
    const gameWrapper = document.getElementById('game-wrapper');
    const refreshIndicator = document.getElementById('refresh-indicator');
    
    gameArea.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
    });
    
    gameArea.addEventListener('touchmove', (e) => {
        const currentY = e.touches[0].clientY;
        const pullDistance = currentY - startY;
        
        if (pullDistance > 0 && pullDistance <= 120) {
            // Desplazar el wrapper y mostrar el icono
            gameWrapper.style.transform = `translateY(${Math.min(pullDistance * 0.5, 60)}px)`;
            refreshIndicator.style.opacity = Math.min(pullDistance / 100, 1);
            refreshIndicator.style.transform = `translateX(-50%) rotate(${pullDistance * 2}deg)`;
        }
    }, { passive: true });
    
    gameArea.addEventListener('touchend', (e) => {
        const pullDistance = e.changedTouches[0].clientY - startY;
        
        if (pullDistance > 100) {
            // Animación de refresh
            refreshIndicator.style.transform = 'translateX(-50%) rotate(360deg)';
            setTimeout(() => {
                refreshGame();
                resetPullToRefresh();
            }, 300);
        } else {
            resetPullToRefresh();
        }
    });
    
    const resetPullToRefresh = () => {
        gameWrapper.style.transform = 'translateY(0)';
        refreshIndicator.style.opacity = '0';
        refreshIndicator.style.transform = 'translateX(-50%) rotate(0deg)';
    };

    // Leer parámetros de la URL e inicializar
    const { gridNumbers, targetNumbers } = getUrlParameters();
    init(gridNumbers, targetNumbers);
});
