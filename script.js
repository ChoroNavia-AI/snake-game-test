const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const scoreDisplay = document.getElementById('scoreDisplay');
const gameMusic = document.getElementById('gameMusic'); // NUEVO: Referencia al elemento de audio
const musicToggleButton = document.getElementById('musicToggleButton'); // NUEVO: Referencia al botón de música

const gridSize = 20;
let snake = [{ x: 10, y: 10 }];
let food = {};
let specialFood = {};
let dx = gridSize;
let dy = 0;
let score = 0;
let gameOver = false;
let gameInterval;
let specialFoodTimer;

const SPECIAL_FOOD_CHANCE = 0.2;
const SPECIAL_FOOD_DURATION = 5000;
const SPECIAL_FOOD_SCORE = 10;
const NORMAL_FOOD_SCORE = 1;

let musicPlaying = false; // NUEVO: Estado de la música

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
            return generatePosition();
        }
    }
    return newPos;
}

function generateFood() {
    food = generatePosition();
    if (Math.random() < SPECIAL_FOOD_CHANCE) {
        specialFood = generatePosition();
        if (specialFood.x === food.x && specialFood.y === food.y) {
            specialFood = generatePosition();
        }
        clearTimeout(specialFoodTimer);
        specialFoodTimer = setTimeout(() => {
            specialFood = {};
        }, SPECIAL_FOOD_DURATION);
    } else {
        specialFood = {};
    }
}

function drawSnake() {
    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = (i === 0) ? '#2ecc71' : '#27ae60';
        ctx.strokeStyle = '#1a242f';
        ctx.fillRect(snake[i].x, snake[i].y, gridSize, gridSize);
        ctx.strokeRect(snake[i].x, snake[i].y, gridSize, gridSize);
    }
}

function drawFood() {
    ctx.fillStyle = '#e74c3c';
    ctx.strokeStyle = '#c0392b';
    ctx.fillRect(food.x, food.y, gridSize, gridSize);
    ctx.strokeRect(food.x, food.y, gridSize, gridSize);
}

function drawSpecialFood() {
    if (specialFood.x !== undefined && specialFood.y !== undefined) {
        ctx.fillStyle = '#9b59b6';
        ctx.strokeStyle = '#8e44ad';
        ctx.fillRect(specialFood.x, specialFood.y, gridSize, gridSize);
        ctx.strokeRect(specialFood.x, specialFood.y, gridSize, gridSize);
    }
}

function gameLoop() {
    if (gameOver) return;

    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    if (specialFood.x !== undefined && specialFood.y !== undefined &&
        head.x === specialFood.x && head.y === specialFood.y) {
        score += SPECIAL_FOOD_SCORE;
        specialFood = {};
        clearTimeout(specialFoodTimer);
        generateFood();
    }
    else if (head.x === food.x && head.y === food.y) {
        score += NORMAL_FOOD_SCORE;
        generateFood();
    } else {
        snake.pop();
    }

    scoreDisplay.textContent = `Puntaje: ${score}`;

    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
        endGame();
        return;
    }

    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            endGame();
            return;
        }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawFood();
    drawSpecialFood();
    drawSnake();
}

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
    snake = [{ x: 10 * gridSize, y: 10 * gridSize }];
    dx = gridSize;
    dy = 0;
    score = 0;
    scoreDisplay.textContent = `Puntaje: ${score}`;
    generateFood();
    if (gameInterval) clearInterval(gameInterval);
    if (specialFoodTimer) clearTimeout(specialFoodTimer);
    gameInterval = setInterval(gameLoop, 100);
    startButton.textContent = "Reiniciar Juego";

    // NUEVO: Reproducir la música al iniciar el juego
    // Solo si el usuario ya ha interactuado con el botón de música
    if (musicPlaying) {
        gameMusic.play().catch(error => {
            console.log("No se pudo reproducir la música automáticamente:", error);
            // Informar al usuario que necesita activar la música manualmente si el navegador lo bloqueó
        });
    }
}

// Función para terminar el juego
function endGame() {
    gameOver = true;
    clearInterval(gameInterval);
    if (specialFoodTimer) clearTimeout(specialFoodTimer);
    alert(`¡Juego Terminado! Tu puntuación final fue: ${score}. Presiona "Reiniciar Juego" para volver a jugar.`);
    gameMusic.pause(); // NUEVO: Pausar la música al terminar el juego
    gameMusic.currentTime = 0; // NUEVO: Reiniciar la música al principio
}

// NUEVO: Función para alternar la reproducción de la música
function toggleMusic() {
    if (gameMusic.paused) {
        gameMusic.play().then(() => {
            musicPlaying = true;
            musicToggleButton.textContent = "Música OFF";
        }).catch(error => {
            console.log("Error al intentar reproducir la música:", error);
            alert("El navegador ha bloqueado la reproducción automática de música. Por favor, interactúa con la página.");
        });
    } else {
        gameMusic.pause();
        musicPlaying = false;
        musicToggleButton.textContent = "Música ON";
    }
}


// Event Listeners
document.addEventListener('keydown', changeDirection);
startButton.addEventListener('click', startGame);
musicToggleButton.addEventListener('click', toggleMusic); // NUEVO: Listener para el botón de música

// Iniciar el juego al cargar la página por primera vez
generateFood();
drawSnake();
drawFood();
// NUEVO: Ajustar el volumen por defecto (entre 0 y 1)
gameMusic.volume = 1; // Volumen bajo para empezar
