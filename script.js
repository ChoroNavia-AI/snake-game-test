const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const scoreDisplay = document.getElementById('scoreDisplay');
// NUEVO High Score: Referencia al elemento del puntaje máximo
const highScoreDisplay = document.getElementById('highScoreDisplay'); 
const gameMusic = document.getElementById('gameMusic');
const musicToggleButton = document.getElementById('musicToggleButton');

const sfxEatNormal = document.getElementById('sfxEatNormal');
const sfxEatSpecial = document.getElementById('sfxEatSpecial');
const sfxGameOver = document.getElementById('sfxGameOver');


const gridSize = 20;
let snake = [{ x: 10, y: 10 }];
let food = {};
let specialFood = {};
let dx = gridSize;
let dy = 0;
let score = 0;
// NUEVO High Score: Variable para el puntaje máximo
let highScore = 0; 
let gameOver = false;
let gameInterval;
let specialFoodTimer;

const SPECIAL_FOOD_CHANCE = 0.2;
const SPECIAL_FOOD_DURATION = 5000;
const SPECIAL_FOOD_SCORE = 10;
const NORMAL_FOOD_SCORE = 1;

let musicPlaying = false;

function playSFX(audioElement) {
    audioElement.currentTime = 0;
    audioElement.play().catch(error => {
        console.warn("No se pudo reproducir el SFX:", error);
    });
}

function generatePosition() {
    const maxX = canvas.width / gridSize;
    const maxY = canvas.height / gridSize;
    let newPos = {
        x: Math.floor(Math.random() * maxX) * gridSize,
        y: Math.floor(Math.random() * maxY) * gridSize
    };

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
        playSFX(sfxEatSpecial);
    }
    else if (head.x === food.x && head.y === food.y) {
        score += NORMAL_FOOD_SCORE;
        generateFood();
        playSFX(sfxEatNormal);
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

function startGame() {
    gameOver = false;
    snake = [{ x: 10 * gridSize, y: 10 * gridSize }];
    dx = gridSize;
    dy = 0;
    score = 0;
    scoreDisplay.textContent = `Puntaje: ${score}`;
    // NUEVO High Score: Muestra el puntaje máximo al iniciar el juego
    highScoreDisplay.textContent = `Puntaje Máximo: ${highScore}`; 
    generateFood();
    if (gameInterval) clearInterval(gameInterval);
    if (specialFoodTimer) clearTimeout(specialFoodTimer);
    gameInterval = setInterval(gameLoop, 100);
    startButton.textContent = "Reiniciar Juego";

    if (musicPlaying) {
        gameMusic.play().catch(error => {
            console.log("No se pudo reproducir la música automáticamente:", error);
        });
    }
}

function endGame() {
    gameOver = true;
    clearInterval(gameInterval);
    if (specialFoodTimer) clearTimeout(specialFoodTimer);
    
    // NUEVO High Score: Comprueba y actualiza el puntaje máximo
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore); // Guarda el nuevo puntaje máximo
        highScoreDisplay.textContent = `Puntaje Máximo: ${highScore}`; // Actualiza el display
        alert(`¡Nuevo Puntaje Máximo! Has logrado ${score} puntos.`); // Mensaje especial
    } else {
        alert(`¡Juego Terminado! Tu puntuación final fue: ${score}. El puntaje máximo es ${highScore}. Presiona "Reiniciar Juego" para volver a jugar.`);
    }

    gameMusic.pause();
    gameMusic.currentTime = 0;
    playSFX(sfxGameOver);
}

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

document.addEventListener('keydown', changeDirection);
startButton.addEventListener('click', startGame);
musicToggleButton.addEventListener('click', toggleMusic);

// NUEVO High Score: Carga el puntaje máximo al cargar la página
// `localStorage.getItem('snakeHighScore')` recupera el valor, si no existe, `|| 0` lo inicializa a 0.
highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0; 
highScoreDisplay.textContent = `Puntaje Máximo: ${highScore}`; // Muestra el puntaje al cargar

generateFood();
drawSnake();
drawFood();
gameMusic.volume = 0.3;
sfxEatNormal.volume = 0.6;
sfxEatSpecial.volume = 0.8;
sfxGameOver.volume = 1.0;
