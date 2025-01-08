// canvas
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 400;
canvas.height = 400;

const cWidth = canvas.width;
const cHeight = canvas.height;

// game text
const timerText = document.getElementById('timerText');
const timerStatusMemo = document.getElementById('timerStatusMemo');
const timerStatusMove = document.getElementById('timerStatusMove');
const livesText = document.getElementById('livesText');
const stageText = document.getElementById('roundText');
const hintText = document.getElementById('hintText');

// game variables
const cellSize = 40;
let running = false;
let username;
let lives = 5;
let stageCounter = 1;
let timerInterval;
let memorizeTimer = 10;
let moveTimer = 20;
let movePlayer = false;
let exitPosition;
let hintTimer;
let hintInterval;
let hintUsed = false;

let grid = [];
const rows = Math.floor(cHeight / cellSize) + 1;
const cols = Math.floor(cWidth / cellSize);

// walls grid (set all tiles to wall)
function setupGrid() {
    for (let y = 0; y < rows; y++) {
        grid[y] = [];
        for (let x = 0; x < cols + 1; x++) {
            grid[y][x] = {
                visited: false,
                wall: true,
            };
        }
    }
}

// lines grid (10x10)
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

// maze algorithm
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
            nx < cols - 1 &&
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

// maze generation
function generateMaze() {
    setupGrid();
    const startX = 1;
    const startY = 0;

    grid[startY][startX].visited = true;
    carvePath(startX, startY);
}

// random walls for confusing player
function addRandomWalls() {
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols + 1; x++) {
            if (!grid[y][x].visited && Math.random() < 0.4) {
                grid[y][x].wall = true;
            }
        }
    }
}

// maze drawing visualization
function drawMaze() {
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const cell = grid[y][x];
            
            if (memorizeTimer > 0) {
                ctx.fillStyle = cell.wall ? 'transparent' : 'lightgray';
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }

            if (hintTimer > 0) {
                ctx.fillStyle = cell.wall ? 'transparent' : 'lightgray';
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }
    }
}

// player variable
let player = {
    x: 0,
    y: Math.floor(Math.random() * (cHeight / cellSize)),
};

// player position function
function positionPlayerGrid() {
    const x = player.x * cellSize + cellSize / 2;
    const y = player.y * cellSize + cellSize / 2;

    return {
        x: x,
        y: y,
    };
}

// player draw
function drawPlayer() {
    const position = positionPlayerGrid();

    ctx.beginPath();
    ctx.fillStyle = 'red';
    ctx.arc(position.x, position.y, 10, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fill();
}

// player movements
window.addEventListener('keyup', (e) => {
    if (running) {
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
    }
});

// memorize timer
function timerProgressMemorize() {
    movePlayer = false;
    timerStatusMemo.style.display = 'block';
    timerStatusMove.style.display = 'none';
    timerInterval = setInterval(() => {
        if (memorizeTimer > 0) {
            memorizeTimer -= 1;
            timerText.innerHTML = memorizeTimer + 's';
            console.log(`Memorize time: ${memorizeTimer}`);
        } else {
            clearInterval(timerInterval);
            timerProgressMove();
        }
    }, 1000);
}

// move timer
function timerProgressMove() {
    timerInterval = setInterval(() => {
        if (moveTimer > 0) {
            timerStatusMemo.style.display = 'none';
            timerStatusMove.style.display = 'block';
            movePlayer = true;
            moveTimer -= 1;
            timerText.innerHTML = moveTimer + 's';
            console.log(`Move time: ${moveTimer}`);
        } else {
            clearInterval(timerInterval);
            alert('you ran out of time!')
            lives -= 1;
            livesText.innerHTML = lives;
            gameReset();
            moveTimer = 20;
            timerProgressMove();
        }
    }, 1000);
}

// hint function
hintText.addEventListener('click', hintPressed);

function hintPressed() {
    if (!hintUsed && memorizeTimer <= 0) {
        hintUsed = true;
        hintTimer = 1;
        hintInterval = setInterval(() => {
            if (hintTimer > 0) {
                hintTimer -= 1;
                console.log(`Hint timer: ${hintTimer}`);
            } else {
                clearInterval(hintInterval);
            }
        }, 1000);
    }
}

// spawn exit before drawing
function spawnExit() {
    const exitX = cols - 1;
    const exitY = Math.floor(Math.random() * (rows - 1));

    return {
        x: exitX * cellSize,
        y: exitY * cellSize,
    }
}

// draw the exit (finish point)
function drawExit() {

    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    ctx.fillRect(exitPosition.x, exitPosition.y, cellSize, cellSize);
    ctx.closePath();
}

// start the game
function gameStart() {
    running = true;
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

// game loop
function gameLoop() {
    if (running) {
        ctx.clearRect(0, 0, cWidth, cHeight);
        drawGrid();
        drawMaze();
        drawExit();
        drawPlayer();
        playerWin();
        requestAnimationFrame(gameLoop);
    }

    if (lives <= 0) {
        running = false;
        gameOver();
    }
}

// function if the player has reached the finish point
function playerWin() {
    const playerPixelX = player.x * cellSize;
    const playerPixelY = player.y * cellSize;

    if (playerPixelX === exitPosition.x && playerPixelY === exitPosition.y) {
        alert('You win! Move to the next stage...');
        stageCounter += 1;
        stageText.innerHTML = stageCounter;
        nextStage();
    }
}

// moving to the next stage
function nextStage() {
    clearInterval(timerInterval);
    memorizeTimer = 10;
    moveTimer = 20;
    player.x = 0;
    player.y = Math.floor(Math.random() * (cHeight / cellSize));
    ctx.clearRect(0, 0, cWidth, cHeight);
    generateMaze();
    addRandomWalls();
    exitPosition = spawnExit();
    drawPlayer();
    gameLoop();
    timerProgressMemorize();
}

// reset the game if the player hit a wall or running out of time
function gameReset() {
    
    player.x = 0;
    player.y = Math.floor(Math.random() * (cHeight / cellSize));
    
    ctx.clearRect(0, 0, cWidth, cHeight);
}

// gameover pop up screen, if the player has no live left
function gameOver() {
    clearInterval(timerInterval);
    gameOverContainer.style.display = 'flex';
    usernameText.innerHTML = username;
    gameOverStageText.innerHTML = stageCounter;
}

// savescore button and cancel to save score button
const saveScoreBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');

cancelBtn.addEventListener('click', () => {
    gameOverContainer.style.display = 'none';
    gameContainer.style.display = 'none';
    mainMenu.style.display = 'flex';
})

saveScoreBtn.addEventListener('click', saveScore);

// saving score function (and update their score if available)
function saveScore() {
    alert('username and score successfully saved!');
    gameOverContainer.style.display = 'none';
    gameContainer.style.display = 'none';
    mainMenu.style.display = 'flex';

    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

    if (leaderboard) {
        let usernameHighScore = leaderboard.find(function (val) {
            return val.name == usernameInput.value
        });

        if (!usernameHighScore) {
            leaderboard.push({
                name: usernameInput.value,
                stage: stageCounter
            });
        } 
        else {
            usernameHighScore.stage = Math.max(usernameHighScore.stage, stageCounter);
        }
    }
    else {
        localStorage.setItem('leaderboard', JSON.stringify({
            name: usernameInput.value,
            stage: stageCounter
        }));
        return;
    }

    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
}