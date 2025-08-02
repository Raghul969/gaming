// Game variables
const canvas = document.getElementById('gameBoard');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');

// Game settings
const gridSize = 20;
const tileCount = canvas.width / gridSize;

// Game state
let snake = [
    {x: 10, y: 10}
];
let food = {};
let dx = 0;
let dy = 0;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameRunning = false;
let gamePaused = false;
let gameLoop;

// Initialize game
function init() {
    highScoreElement.textContent = highScore;
    generateFood();
    drawGame();
    setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
    // Button events
    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('pauseBtn').addEventListener('click', togglePause);
    document.getElementById('resetBtn').addEventListener('click', resetGame);
    document.getElementById('playAgainBtn').addEventListener('click', resetGame);
    
    // Mobile control events
    document.getElementById('upBtn').addEventListener('click', () => handleDirectionInput('up'));
    document.getElementById('downBtn').addEventListener('click', () => handleDirectionInput('down'));
    document.getElementById('leftBtn').addEventListener('click', () => handleDirectionInput('left'));
    document.getElementById('rightBtn').addEventListener('click', () => handleDirectionInput('right'));
    
    // Touch events for mobile controls (prevent default to avoid scrolling)
    const controlBtns = document.querySelectorAll('.control-btn');
    controlBtns.forEach(btn => {
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const direction = btn.getAttribute('data-direction');
            handleDirectionInput(direction);
        });
    });
    
    // Keyboard events
    document.addEventListener('keydown', handleKeyPress);
}

// Handle direction input (from keyboard or touch)
function handleDirectionInput(direction) {
    if (!gameRunning) return;
    
    switch(direction) {
        case 'left':
            if (dx !== 1) {
                dx = -1;
                dy = 0;
            }
            break;
        case 'up':
            if (dy !== 1) {
                dx = 0;
                dy = -1;
            }
            break;
        case 'right':
            if (dx !== -1) {
                dx = 1;
                dy = 0;
            }
            break;
        case 'down':
            if (dy !== -1) {
                dx = 0;
                dy = 1;
            }
            break;
    }
}

// Handle keyboard input
function handleKeyPress(e) {
    if (!gameRunning) return;
    
    const key = e.key.toLowerCase();
    
    // Movement controls
    if (key === 'arrowleft' || key === 'a') {
        handleDirectionInput('left');
    } else if (key === 'arrowup' || key === 'w') {
        handleDirectionInput('up');
    } else if (key === 'arrowright' || key === 'd') {
        handleDirectionInput('right');
    } else if (key === 'arrowdown' || key === 's') {
        handleDirectionInput('down');
    } else if (key === ' ') {
        e.preventDefault();
        togglePause();
    }
}

// Start the game
function startGame() {
    if (gameRunning) return;
    
    gameRunning = true;
    gamePaused = false;
    document.getElementById('startBtn').disabled = true;
    document.getElementById('pauseBtn').disabled = false;
    
    gameLoop = setInterval(updateGame, 150);
}

// Toggle pause
function togglePause() {
    if (!gameRunning) return;
    
    gamePaused = !gamePaused;
    
    if (gamePaused) {
        clearInterval(gameLoop);
        document.getElementById('pauseBtn').textContent = 'Resume';
    } else {
        gameLoop = setInterval(updateGame, 150);
        document.getElementById('pauseBtn').textContent = 'Pause';
    }
}

// Reset the game
function resetGame() {
    clearInterval(gameLoop);
    gameRunning = false;
    gamePaused = false;
    
    // Reset game state
    snake = [{x: 10, y: 10}];
    dx = 0;
    dy = 0;
    score = 0;
    scoreElement.textContent = score;
    
    // Reset UI
    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
    document.getElementById('pauseBtn').textContent = 'Pause';
    gameOverElement.classList.add('hidden');
    
    // Generate new food and redraw
    generateFood();
    drawGame();
}

// Generate food at random position
function generateFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
    
    // Make sure food doesn't spawn on snake
    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            generateFood();
            return;
        }
    }
}

// Update game state
function updateGame() {
    if (gamePaused) return;
    
    moveSnake();
    
    if (checkGameOver()) {
        endGame();
        return;
    }
    
    checkFoodCollision();
    drawGame();
}

// Move the snake
function moveSnake() {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    snake.unshift(head);
    
    // Remove tail if no food eaten
    if (head.x !== food.x || head.y !== food.y) {
        snake.pop();
    }
}

// Check for game over conditions
function checkGameOver() {
    const head = snake[0];
    
    // Check wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        return true;
    }
    
    // Check self collision
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

// Check if snake ate food
function checkFoodCollision() {
    const head = snake[0];
    
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        
        // Update high score
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
        
        generateFood();
    }
}

// End the game
function endGame() {
    clearInterval(gameLoop);
    gameRunning = false;
    
    // Update UI
    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
    document.getElementById('pauseBtn').textContent = 'Pause';
    
    finalScoreElement.textContent = score;
    gameOverElement.classList.remove('hidden');
}

// Draw the game
function drawGame() {
    // Clear canvas
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw snake
    ctx.fillStyle = '#48bb78';
    for (let segment of snake) {
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    }
    
    // Draw snake head with different color
    ctx.fillStyle = '#38a169';
    ctx.fillRect(snake[0].x * gridSize, snake[0].y * gridSize, gridSize - 2, gridSize - 2);
    
    // Draw food
    ctx.fillStyle = '#f56565';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
    
    // Add some style to food (make it round)
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize / 2,
        food.y * gridSize + gridSize / 2,
        (gridSize - 2) / 2,
        0,
        2 * Math.PI
    );
    ctx.fill();
}

// Initialize the game when page loads
window.addEventListener('load', init);
