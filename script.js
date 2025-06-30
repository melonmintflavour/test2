const canvas = document.getElementById('tetris-board');
const context = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const startButton = document.getElementById('start-button');

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BLOCK_SIZE = 20;

// Tetrominoes
const tetrominoes = {
    'I': {
        shape: [[1, 1, 1, 1]],
        color: 'cyan'
    },
    'J': {
        shape: [[1, 0, 0], [1, 1, 1]],
        color: 'blue'
    },
    'L': {
        shape: [[0, 0, 1], [1, 1, 1]],
        color: 'orange'
    },
    'O': {
        shape: [[1, 1], [1, 1]],
        color: 'yellow'
    },
    'S': {
        shape: [[0, 1, 1], [1, 1, 0]],
        color: 'green'
    },
    'T': {
        shape: [[0, 1, 0], [1, 1, 1]],
        color: 'purple'
    },
    'Z': {
        shape: [[1, 1, 0], [0, 1, 1]],
        color: 'red'
    }
};

let board = [];
let currentPiece = null;
let currentX = 0;
let currentY = 0;
let score = 0;
let gameInterval = null;

// Initialize board
function initBoard() {
    for (let row = 0; row < BOARD_HEIGHT; row++) {
        board[row] = [];
        for (let col = 0; col < BOARD_WIDTH; col++) {
            board[row][col] = 0;
        }
    }
}

// Draw the board
function drawBoard() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    for (let row = 0; row < BOARD_HEIGHT; row++) {
        for (let col = 0; col < BOARD_WIDTH; col++) {
            if (board[row][col]) {
                context.fillStyle = board[row][col];
                context.fillRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                context.strokeRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }
}

// Draw a piece
function drawPiece(piece, x, y) {
    context.fillStyle = piece.color;
    piece.shape.forEach((row, rowIndex) => {
        row.forEach((value, colIndex) => {
            if (value) {
                context.fillRect((x + colIndex) * BLOCK_SIZE, (y + rowIndex) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                context.strokeRect((x + colIndex) * BLOCK_SIZE, (y + rowIndex) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        });
    });
}

// Spawn a new piece
function spawnPiece() {
    const pieceNames = Object.keys(tetrominoes);
    const randomPieceName = pieceNames[Math.floor(Math.random() * pieceNames.length)];
    currentPiece = JSON.parse(JSON.stringify(tetrominoes[randomPieceName])); // Deep copy
    currentX = Math.floor(BOARD_WIDTH / 2) - Math.floor(currentPiece.shape[0].length / 2);
    currentY = 0;

    if (checkCollision(currentPiece, currentX, currentY)) {
        gameOver();
    }
}

// Check for collision
function checkCollision(piece, x, y) {
    for (let row = 0; row < piece.shape.length; row++) {
        for (let col = 0; col < piece.shape[row].length; col++) {
            if (piece.shape[row][col]) {
                const newX = x + col;
                const newY = y + row;
                if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT || (board[newY] && board[newY][newX])) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Merge piece with board
function mergePiece() {
    currentPiece.shape.forEach((row, rowIndex) => {
        row.forEach((value, colIndex) => {
            if (value) {
                board[currentY + rowIndex][currentX + colIndex] = currentPiece.color;
            }
        });
    });
}

// Rotate piece
function rotatePiece() {
    const originalShape = currentPiece.shape;
    const numRows = originalShape.length;
    const numCols = originalShape[0].length;
    const newShape = [];

    for (let col = 0; col < numCols; col++) {
        newShape[col] = [];
        for (let row = numRows - 1; row >= 0; row--) {
            newShape[col].push(originalShape[row][col]);
        }
    }
    currentPiece.shape = newShape;
    if (checkCollision(currentPiece, currentX, currentY)) {
        currentPiece.shape = originalShape; // Revert if collision
    }
}


// Move piece
function movePiece(dx, dy) {
    if (!checkCollision(currentPiece, currentX + dx, currentY + dy)) {
        currentX += dx;
        currentY += dy;
        return true;
    }
    if (dy > 0) { // If moving down and collision
        mergePiece();
        clearLines();
        spawnPiece();
    }
    return false;
}

// Clear lines
function clearLines() {
    let linesCleared = 0;
    for (let row = BOARD_HEIGHT - 1; row >= 0; row--) {
        if (board[row].every(cell => cell !== 0)) {
            board.splice(row, 1);
            board.unshift(Array(BOARD_WIDTH).fill(0));
            linesCleared++;
            row++; // Re-check the current row index as it's now a new row
        }
    }
    if (linesCleared > 0) {
        updateScore(linesCleared);
    }
}

// Update score
function updateScore(linesCleared) {
    const points = [0, 40, 100, 300, 1200]; // Points for 0, 1, 2, 3, 4 lines
    score += points[linesCleared] || 0;
    scoreElement.textContent = score;
}

// Game over
function gameOver() {
    clearInterval(gameInterval);
    alert(`Game Over! Your score: ${score}`);
    // Optionally, you can disable controls or show a game over screen
}

// Game loop
function gameLoop() {
    if (!movePiece(0, 1)) {
        // If piece cannot move down further (either merged or game over)
        // The mergePiece and spawnPiece logic is handled within movePiece
    }
    drawBoard();
    if (currentPiece) {
        drawPiece(currentPiece, currentX, currentY);
    }
}

// Start game
function startGame() {
    initBoard();
    score = 0;
    updateScore(0);
    spawnPiece();
    drawBoard();
    drawPiece(currentPiece, currentX, currentY);

    if (gameInterval) {
        clearInterval(gameInterval);
    }
    gameInterval = setInterval(gameLoop, 1000); // Piece drops every 1 second
}

startButton.addEventListener('click', startGame);

// Initial setup
initBoard();
drawBoard();
// No piece is drawn initially until the game starts
// spawnPiece();
// drawPiece(currentPiece, currentX, currentY);
console.log("Game logic initialized. Press Start Game to play.");


// Keyboard controls
document.addEventListener('keydown', (event) => {
    if (!currentPiece || !gameInterval) return; // Ignore input if game not running or no piece

    switch (event.key) {
        case 'ArrowLeft':
        case 'a': // Common alternative
            movePiece(-1, 0);
            break;
        case 'ArrowRight':
        case 'd': // Common alternative
            movePiece(1, 0);
            break;
        case 'ArrowDown':
        case 's': // Common alternative
            movePiece(0, 1);
            break;
        case 'ArrowUp':
        case 'w': // Common alternative for rotation
            rotatePiece();
            break;
        case ' ': // Space for hard drop (optional, simple implementation for now)
            while (movePiece(0, 1)) {
                // Keep moving down until it locks
            }
            break;
    }
    // Redraw after any action
    drawBoard();
    if (currentPiece) {
        drawPiece(currentPiece, currentX, currentY);
    }
});
