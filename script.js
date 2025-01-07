// canvas
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 400;
canvas.height = 400;

const cWidth = canvas.width;
const cHeight = canvas.height;

const timerText = document.getElementById('timerText');
const timerStatusMemo = document.getElementById('timerStatusMemo');
const timerStatusMove = document.getElementById('timerStatusMove');
const livesText = document.getElementById('livesText');

const cellSize = 40;
let running;
let username;
let lives = 5;
let stageCounter = 1;
let timerInterval;
let memorizeTimer = 10;
let moveTimer = 20;
let movePlayer = false;
let exitPosition;

let grid = [];
const rows = Math.floor(cHeight / cellSize) + 1;
const cols = Math.floor(cWidth / cellSize);


function setupGrid() {
    for (let y = 0; y < rows; y++) {
        grid[y] = [];
        for (let x = 0; x < cols; x++) {
            grid[y][x] = {
                visited: false,
                wall: true,
            };
        }
    }
}

function drawGrid() {
    for (let x = 0; x <= cWidth; x += cellSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, cHeight);
        ctx.strokeStyle = 'white';
        ctx.stroke();
    }

    for (let y = 0; y <= cHeight; y += cellSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(cWidth, y);
        ctx.strokeStyle = 'white';
        ctx.stroke();
    }
}

function carvePath(x, y) {
    const directions = [
        { x: 0, y: -1 }, // up
        { x: 1, y: 0 },  // right
        { x: 0, y: 1 },  // down
        { x: -1, y: 0 }, // left
    ];

    directions.sort(() => Math.random() - 0.5);

    for (let direction of directions) {
        const nx = x + direction.x * 2;
        const ny = y + direction.y * 2;

        if (
            nx >= 0 &&
            ny >= 0 &&
            nx < cols &&
            ny < rows &&
            !grid[ny][nx].visited
        ) {
            grid[ny][nx].visited = true;
            grid[y + direction.y][x + direction.x].wall = false; // remove wall between current cell and next cell
            grid[ny][nx].wall = false; // carve path
            carvePath(nx, ny);
        }
    }
}

function generateMaze() {
    setupGrid();
    const startX = 1;
    const startY = 0;

    grid[startY][startX].visited = true;
    carvePath(startX, startY);
}

function addRandomWalls() {
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (Math.random() < 0.3 && !grid[y][x].visited) {
                grid[y][x].wall = true;
            }
        }
    }
}

function drawMaze() {
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const cell = grid[y][x];
            
            if (memorizeTimer > 1) {
                ctx.fillStyle = cell.wall ? 'transparent' : 'lightgray';
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }
    }
}

let player = {
    x: 0,
    y: Math.floor(Math.random() * (cHeight / cellSize)),
};

function positionPlayerGrid() {
    const x = player.x * cellSize + cellSize / 2;
    const y = player.y * cellSize + cellSize / 2;

    return {
        x: x,
        y: y,
    };
}

function drawPlayer() {
    const position = positionPlayerGrid();

    ctx.beginPath();
    ctx.fillStyle = 'red';
    ctx.arc(position.x, position.y, 10, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fill();
}

window.addEventListener('keydown', (e) => {
    if (!movePlayer) {
        console.log('You cannot move yet');
        return;
    }
    const keyPress = e.key;

    if (keyPress === 'ArrowUp' && player.y > 0) {
        player.y -= 1;
    }
    if (keyPress === 'ArrowRight' && player.x < cWidth / cellSize - 1) {
        player.x += 1;
    }
    if (keyPress === 'ArrowLeft' && player.x > 0) {
        player.x -= 1;
    }
    if (keyPress === 'ArrowDown' && player.y < cHeight / cellSize - 1) {
        player.y += 1;
    }

    // player hit wall
    if (!grid[player.y][player.x].wall) {
        alert('you hit a wall!')
        lives -= 1;
        livesText.innerHTML = lives;
        gameReset();
    }

    ctx.clearRect(0, 0, cWidth, cHeight);
});

function gameLoop() {
    ctx.clearRect(0, 0, cWidth, cHeight);
    drawGrid();
    drawMaze();
    drawExit();
    drawPlayer();
    requestAnimationFrame(gameLoop);
}

function timerProgressMemorize() {
    timerStatusMemo.style.display = 'block';
    timerStatusMove.style.display = 'none';
    timerInterval = setInterval(() => {
        if (memorizeTimer > 1) {
            memorizeTimer -= 1;
            timerText.innerHTML = memorizeTimer + 's';
            console.log(`Memorize time: ${memorizeTimer}`);
        } else {
            clearInterval(timerInterval);
            timerProgressMove();
        }
    }, 500);
}

function timerProgressMove() {
    timerInterval = setInterval(() => {
        if (moveTimer > 1) {
            timerStatusMemo.style.display = 'none';
            timerStatusMove.style.display = 'block';
            movePlayer = true;
            moveTimer -= 1;
            timerText.innerHTML = moveTimer + 's';
            console.log(`Move time: ${moveTimer}`);
        } else {
            console.log(`Time is up`);
            movePlayer = false;
            clearInterval(timerInterval);
        }
    }, 1000);
}

function spawnExit() {
    const exitX = cols - 1;
    const exitY = Math.floor(Math.random() * (rows - 1));

    return {
        x: exitX * cellSize,
        y: exitY * cellSize,
    }
}

function drawExit() {

    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    ctx.fillRect(exitPosition.x, exitPosition.y, cellSize, cellSize);
    ctx.closePath();
}



function gameStart() {
    memorizeTimer = 10;
    moveTimer = 20;
    lives = 5;
    stageCounter = 1;
    movePlayer = false;
    generateMaze();
    addRandomWalls();
    exitPosition = spawnExit();

    gameLoop();
    drawPlayer();
    timerProgressMemorize();
}

if (player.x === exitPosition && player.y === exitPosition) {
    alert('you win! next stage...')
}

function gameReset() {
    // clearInterval(timerInterval);
    // movePlayer = false;
    

    // const position = positionPlayerGrid();

    // player.x = position.x;
    // player.y = position.y;
    
    player.x = 0;
    player.y = Math.floor(Math.random() * (cHeight / cellSize));
    
    ctx.clearRect(0, 0, cWidth, cHeight);

    // generateMaze();
    // addRandomWalls();
    // exitPosition = spawnExit();
    // drawPlayer();
    // gameLoop();
    // timerProgressMemorize();
}

function gameOver() {
    clearInterval(timerInterval);

}