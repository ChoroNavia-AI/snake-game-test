const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const scoreDisplay = document.getElementById('scoreDisplay'); // Nuevo: Referencia al elemento del puntaje

const gridSize = 20; // Tamaño de cada "cuadrado"
let snake = [{ x: 10, y: 10 }]; // Posición inicial
let food = {}; // Posición de la comida normal
let specialFood = {}; // Nuevo: Posición de la comida especial
let dx = gridSize; // Velocidad X inicial
let dy = 0; // Velocidad Y inicial
let score = 0;
let gameOver = false;
let gameInterval;
let specialFoodTimer; // Nuevo: Para controlar la aparición de la comida especial

// Nuevo: Constantes para la comida especial
const SPECIAL_FOOD_CHANCE = 0.2; // 20% de probabilidad de que aparezca comida especial
const SPECIAL_FOOD_DURATION = 5000; // La comida especial dura 5 segundos
const SPECIAL_FOOD_SCORE = 10; // Puntaje que otorga la comida especial
const NORMAL_FOOD_SCORE = 1; // Puntaje que otorga la comida normal

// Función para generar una posición aleatoria para la comida (normal o especial)
function generatePosition() {
    const maxX = canvas.width / gridSize;
    const maxY = canvas.height / gridSize;
    let newPos = {
        x: Math.floor(Math.random() * maxX) * gridSize,
        y: Math.floor(Math.random() * maxY) * gridSize
    };

    // Asegurarse de que la posición no esté dentro de la serpiente
    for (let i = 0; i < snake.length; i++) {
        if (newPos.x === snake[i].x && newPos.y === snake[i].y) {
            return generatePosition(); // Si coincide, genera una nueva posición
        }
    }
    return newPos;
}

function generateFood() {
    food = generatePosition();
    // Nuevo: Decidir si generar comida especial
    if (Math.random() < SPECIAL_FOOD_CHANCE) {
        specialFood = generatePosition();
        // Asegurarse de que la comida especial no aparezca en el mismo lugar que la comida normal
        if (specialFood.x === food.x && specialFood.y === food.y) {
            specialFood = generatePosition();
        }
        // Configurar un temporizador para eliminar la comida especial
        clearTimeout(specialFoodTimer); // Limpiar cualquier temporizador anterior
        specialFoodTimer = setTimeout(() => {
            specialFood = {}; // Eliminar la comida especial
        }, SPECIAL_FOOD_DURATION);
    } else {
        specialFood = {}; // Asegurarse de que no haya comida especial si no es el momento
    }
}

// Función para dibujar la serpiente
function drawSnake() {
    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = (i === 0) ? '#2ecc71' : '#27ae60'; // Cabeza verde claro, cuerpo verde oscuro
        ctx.strokeStyle = '#1a242f'; // Borde de la serpiente
        ctx.fillRect(snake[i].x, snake[i].y, gridSize, gridSize);
        ctx.strokeRect(snake[i].x, snake[i].y, gridSize, gridSize);
    }
}

// Función para dibujar la comida normal
function drawFood() {
    ctx.fillStyle = '#e74c3c'; // Rojo para la comida normal
    ctx.strokeStyle = '#c0392b';
    ctx.fillRect(food.x, food.y, gridSize, gridSize);
    ctx.strokeRect(food.x, food.y, gridSize, gridSize);
}

// Nuevo: Función para dibujar la comida especial
function drawSpecialFood() {
    if (specialFood.x !== undefined && specialFood.y !== undefined) {
        ctx.fillStyle = '#9b59b6'; // Un color púrpura vibrante para la comida especial
        ctx.strokeStyle = '#8e44ad';
        ctx.fillRect(specialFood.x, specialFood.y, gridSize, gridSize);
        ctx.strokeRect(specialFood.x, specialFood.y, gridSize, gridSize);
    }
}

// Función principal del juego (bucle)
function gameLoop() {
    if (gameOver) return;

    // Mover la serpiente
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head); // Añadir la nueva cabeza

    // Nuevo: Detección de colisión con la comida especial
    if (specialFood.x !== undefined && specialFood.y !== undefined &&
        head.x === specialFood.x && head.y === specialFood.y) {
        score += SPECIAL_FOOD_SCORE; // Sumar puntaje de comida especial
        specialFood = {}; // Eliminar comida especial
        clearTimeout(specialFoodTimer); // Detener el temporizador de la comida especial
        generateFood(); // Generar nueva comida normal y quizás otra especial
    }
    // Detección de colisión con la comida normal
    else if (head.x === food.x && head.y === food.y) {
        score += NORMAL_FOOD_SCORE; // Sumar puntaje de comida normal
        generateFood(); // Generar nueva comida
    } else {
        snake.pop(); // Si no comió, elimina la cola para simular el movimiento
    }

    // Actualizar el display de puntaje
    scoreDisplay.textContent = `Puntaje: ${score}`;

    // Detección de colisión con las paredes
    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
        endGame();
        return;
    }

    // Detección de colisión con el propio cuerpo
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            endGame();
            return;
        }
    }

    // Limpiar el lienzo
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar los elementos
    drawFood();
    drawSpecialFood(); // Nuevo: Dibujar comida especial
    drawSnake();
}

// Función para manejar las entradas del teclado
function changeDirection(event) {
    const keyPressed = event.keyCode;
    const LEFT = 37;
    const UP = 38;
    const RIGHT = 39;
    const DOWN = 40;

    const goingUp = dy === -gridSize;
    const goingDown = dy === gridSize;
    const goingRight = dx === gridSize;
    const goingLeft = dx === -gridSize;

    if (keyPressed === LEFT && !goingRight) {
        dx = -gridSize;
        dy = 0;
    }
    if (keyPressed === UP && !goingDown) {
        dx = 0;
        dy = -gridSize;
    }
    if (keyPressed === RIGHT && !goingLeft) {
        dx = gridSize;
        dy = 0;
    }
    if (keyPressed === DOWN && !goingUp) {
        dx = 0;
        dy = gridSize;
    }
}

// Función para iniciar el juego
function startGame() {
    gameOver = false;
    snake = [{ x: 10 * gridSize, y: 10 * gridSize }]; // Reiniciar posición
    dx = gridSize; // Reiniciar dirección
    dy = 0;
    score = 0;
    scoreDisplay.textContent = `Puntaje: ${score}`; // Resetear el display de puntaje
    generateFood(); // Generar comida inicial
    if (gameInterval) clearInterval(gameInterval); // Limpiar cualquier intervalo anterior
    if (specialFoodTimer) clearTimeout(specialFoodTimer); // Limpiar temporizador de comida especial
    gameInterval = setInterval(gameLoop, 100); // Velocidad del juego (milisegundos)
    startButton.textContent = "Reiniciar Juego"; // Cambiar texto del botón
}

// Función para terminar el juego
function endGame() {
    gameOver = true;
    clearInterval(gameInterval);
    if (specialFoodTimer) clearTimeout(specialFoodTimer); // Limpiar temporizador al terminar el juego
    alert(`¡Juego Terminado! Tu puntuación final fue: ${score}. Presiona "Reiniciar Juego" para volver a jugar.`);
}

// Event Listeners
document.addEventListener('keydown', changeDirection);
startButton.addEventListener('click', startGame);

// Iniciar el juego al cargar la página por primera vez
generateFood();
drawSnake(); // Dibujar la serpiente inicial
drawFood(); // Dibujar la comida inicial