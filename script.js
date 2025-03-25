const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 500;
canvas.height = 500;

// texts
const roundText = document.getElementById('roundText');
const timerStatus = document.getElementById('timerStatus');
const timerText = document.getElementById('timerText');
const liveStatus = document.getElementById('liveStatus');
const hintButton = document.getElementById('hintButton');

// variables

const rows = 10;
const cols = 10;
const cellSize =  canvas.width / 10;

const player = {
    x: 0,
    y: 0,
    radius: cellSize / 4
}

const initializePosition = {
    x: 0,
    y: 0
}

let lives = 5;
let hearts = Array(lives).fill("❤️");

function updateLivesDisplay() {
    liveStatus.innerHTML = hearts.join(" ");
}

let roundCount = 1;
let memorizingTimer = 10;
let moveTimer = 20;
let hintTimer = 1;
let visible = false;
let hintInterval;
let memorizeInterval;
let moveInterval;

function startMemorize() {
    memorizingTimer = 10;
    timerText.innerHTML = memorizingTimer + 's';
    timerStatus.style.backgroundColor = '#470000';
    timerStatus.style.borderColor = 'red';
    memorizeInterval = setInterval(() => {
        memorizingTimer--;
        timerText.innerHTML = memorizingTimer + 's';

        if (memorizingTimer <= 0) {
            clearInterval(memorizeInterval);
            startMove();
        }
    }, 1000);
}

function startMove() {
    timerStatus.innerHTML = 'Move Time:'
    moveTimer = 20;
    timerText.innerHTML = moveTimer + 's';
    timerStatus.style.backgroundColor = '#000b47';
    timerStatus.style.borderColor = '#2b00ff';
    moveInterval = setInterval(() => {
        moveTimer--;
        timerText.innerHTML = moveTimer + 's';

        if (moveTimer <= 0) {
            loseLife();
            alert(`You ran out of time! Lives remaining: ${lives}`);
            moveTimer = 20;
            
            if (lives > 0) {
                resetPlayerPosition();
            } else {
                clearInterval(moveInterval);
                gameOver();
            }
        }
    }, 1000);
}

function hintStart() {
    hintButton.style.display = 'none';
    visible = true;
    hintInterval = setInterval(() => {
        hintTimer--;

        if (hintTimer < 0) {
            visible = false;
            clearInterval(hintInterval);
        }
    }, 1000)
}

hintButton.addEventListener('click', hintStart);

function loseLife() {
    if (hearts.length > 0) {
        hearts.pop();
        updateLivesDisplay();
    }

    if (hearts.length === 0) {
        gameOver();
    }
}

const maze = [];

const exit = {
    x: 0,
    y: 0
};

function drawGrid() {
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            ctx.strokeWidth = 1;
            ctx.strokeStyle = 'white';
            ctx.fillStyle = 'black';

            ctx.strokeRect(col * cellSize, row * cellSize, cellSize, cellSize);
        }
    }
}


function initializeMaze() {
    do {
        for (let row = 0; row < rows; row++) {
            maze[row] = [];
            for (let col = 0; col < cols; col++) {
                maze[row][col] = (Math.random() < 0.3 && !(row === 0 && col === 0) && !(row === rows - 1 && col === cols - 1)) ? 1 : 0;
            }
        }
    } while (!isMazeSolvable());
}

function isMazeSolvable() {
    const queue = [[0, 0]];
    const visited = new Set();
    visited.add('0,0');

    const directions = [
        [0, 1],   
        [1, 0],   
        [-1, 0],  
        [0, -1]   
    ];

    while (queue.length > 0) {
        const [r, c] = queue.shift();

        if (r === rows - 1 && c === cols - 1) return true;

        for (const [dr, dc] of directions) {
            const newRow = r + dr;
            const newCol = c + dc;
            const key = `${newRow},${newCol}`;

            if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols &&
                maze[newRow][newCol] === 0 && !visited.has(key)) {
                queue.push([newRow, newCol]);
                visited.add(key);
            }
        }
    }

    return false;
}

function findPossibleNextCells(currentRow, currentCol) {
    const possibleCells = [
        { newRow: currentRow - 1, newCol: currentCol },
        { newRow: currentRow, newCol: currentCol + 1 },
        { newRow: currentRow + 1, newCol: currentCol },
        { newRow: currentRow, newCol: currentCol - 1 }
    ];

    return possibleCells.filter(cell => 
        cell.newRow >= 0 && cell.newRow < rows &&
        cell.newCol >= 0 && cell.newCol < cols &&
        maze[cell.newRow][cell.newCol] === 0
    );
}

function drawMaze() {
    ctx.fillStyle = 'gray';
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (maze[row][col] === 1) {
                ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
            } else if (memorizingTimer <= 0 && visible === false) {
                ctx.fillStyle = 'black';
                ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize)
            }
        }
    }
}


function setPlayerStart() {
    let validStartPositions = [];

    for (let row = 0; row < rows; row++) {
        if (maze[row][0] === 0) {
            validStartPositions.push(row);
        }
    }

    if (validStartPositions.length === 0) {
        console.error("No valid start position found!");
        return;
    }

    let startRow = validStartPositions[Math.floor(Math.random() * validStartPositions.length)];

    player.x = 0;
    player.y = startRow * cellSize;
    initializePosition.x = player.x;
    initializePosition.y = player.y;
}

function resetPlayerPosition() {
    player.x = initializePosition.x;
    player.y = initializePosition.y;
    
    // if (lives <= 0) {
    //     gameOver();
    // }
}

function setExit() {
    let validExitPositions = [];

    for (let row = 0; row < rows; row++) {
        if (maze[row][cols - 1] === 0) {
            validExitPositions.push(row);
        }
    }

    if (validExitPositions.length === 0) {
        console.error("No valid exit position found!");
        return;
    }

    let exitRow = validExitPositions[Math.floor(Math.random() * validExitPositions.length)];

    exit.x = (cols - 1) * cellSize;
    exit.y = exitRow * cellSize;
}


function drawPlayer() {
    ctx.fillStyle = 'red';
    
    ctx.beginPath();
    ctx.arc(player.x + cellSize / 2, player.y + cellSize / 2, player.radius, 0, 2 * Math.PI);
    ctx.fill();
}

function drawExit() {
    ctx.save();

    ctx.strokeStyle = 'yellow';
    ctx.lineWidth = 8;

    ctx.beginPath();
    ctx.moveTo(exit.x + cellSize, exit.y);
    ctx.lineTo(exit.x + cellSize, exit.y + cellSize);
    ctx.stroke();

    ctx.restore();
}

function handleMovement(e) {

    if (memorizingTimer <= 0) {
        let newX = player.x;
        let newY = player.y;
    
        switch(e.key) {
            case 'ArrowDown':
                newY += cellSize;
                break;
            case 'ArrowUp':
                newY -= cellSize;
                break;
            case 'ArrowRight':
                newX += cellSize;
                break;
            case 'ArrowLeft':
                newX -= cellSize;
                break;
        }
    
        const newRow = Math.floor(newY / cellSize);
        const newCol = Math.floor(newX / cellSize);
    
        if (newRow < 0 || newRow >= rows || newCol < 0 || newCol >= cols || maze[newRow][newCol] === 1) {
            alert('hit wall')
    
            loseLife();
            resetPlayerPosition();
            return;
        }
    
        player.x = newX;
        player.y = newY;
    
        if (player.x === exit.x && player.y === exit.y) {
            alert('Congratulations! You escaped the maze!');
            nextRound();
        }
    } 
}



function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawMaze();
    drawGrid();
    drawPlayer();
    drawExit();

    document.addEventListener('keyup', handleMovement);


    requestAnimationFrame(gameLoop);
}

function gameStart() {
    lives = 5;
    hearts = Array(lives).fill("❤️");   
    roundCount = 1;
    initializeMaze();
    setPlayerStart();
    setExit();
    startMemorize();
    updateLivesDisplay();
    

    gameLoop();
}

function gameOver() {
    clearInterval(moveInterval);
    clearInterval(memorizeInterval);
    let result = confirm(`
        Game Over!
        Your name: ${usernameInput.value}
        Stage: ${roundCount}
        Save Score?`);

    if (result) {
        saveScore();
    } else {
        console.log('not saved');
    }

    gameContainer.style.display = 'none';
    menuContainer.style.display = 'flex';

}

function nextRound() {
    roundCount++;
    roundText.innerHTML = roundCount;

    clearInterval(moveInterval);
    clearInterval(memorizeInterval);
    moveTimer = 20;
    memorizingTimer = 10;
    timerStatus.innerHTML = 'Memorizing Time:'
    initializeMaze();
    setPlayerStart();
    setExit();
    startMemorize();
    updateLivesDisplay();

    gameLoop();
}

function saveScore() {
    let leaderboard =  JSON.parse(localStorage.getItem('leaderboard')) || [];

    if (leaderboard) {
        let usernameHighScore = leaderboard.find(function (val) {
            return val.name === usernameInput.value;
        });

        if (!usernameHighScore) {
            leaderboard.push({
                name: usernameInput.value,
                stage: roundCount
            });
        } else {
            usernameHighScore.stage = Math.max(usernameHighScore.stage, roundCount);
        }
    }
    else {
        localStorage.setItem('leaderboard', JSON.stringify({
            name: usernameInput.value,
            stage: roundCount
        }));
        return;
    }

    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
}