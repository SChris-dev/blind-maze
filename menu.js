// set the default leaderboard
let leadering = localStorage.getItem('leaderboard');

if (!leadering) {
    localStorage.setItem('leaderboard', JSON.stringify([{name: 'schris', stage: 29}]));
}

// buttons
const startBtn = document.getElementById('startBtn');
const leaderboardBtn = document.getElementById('leaderboardBtn');
const instructionBtn = document.getElementById('instructionBtn');
const closeInstruction = document.getElementById('closeInstruction');

// pages
const leaderBoard = document.getElementById('leaderBoard');
const instruction = document.getElementById('instruction');
const gameContainer  = document.getElementById('gameContainer');
const mainMenu = document.getElementById('mainMenu');
const gameOverContainer = document.getElementById('gameOverContainer');


// input
const usernameInput = document.getElementById('usernameInput');

// gameover stuff
const usernameText = document.getElementById('usernameText');
const gameOverStageText = document.getElementById('gameOverStageText');

// start game
startBtn.addEventListener('click', () => {
    username = usernameInput.value;

    if (username.trim() === '') {
        alert('Please enter username')
        return;
    }


    gameContainer.style.display = 'block';
    mainMenu.style.display = 'none';
    leaderBoard.style.display = 'none';

    gameStart();
    running = true;

})

// show instruction
instructionBtn.addEventListener('click', () => {
    instruction.classList.add('show');
});

// close instruction
closeInstruction.addEventListener('click', () => {
    instruction.classList.remove('show');
});

// show leaderboard
leaderboardBtn.addEventListener('click', () => {
    if (leaderBoard.style.display === 'block') {
        leaderBoard.style.display = 'none';
    } else {
        leaderBoard.style.display = 'block';
    }
});

// leaderboard system
let leaderboardDisplay = JSON.parse(localStorage.getItem('leaderboard'))
leaderboardDisplay = leaderboardDisplay.sort((a, b) => {
    return b.stage - a.stage
});

const leaderboardTable = document.getElementById('leaderboardTable');

leaderboardDisplay.forEach((val, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${index + 1}</td>
                    <td>${val.name}</td>
                    <td>${val.stage}</td>`
    leaderboardTable.appendChild(row);
});

