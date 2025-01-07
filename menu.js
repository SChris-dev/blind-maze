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


// show leaderboard
leaderboardBtn.addEventListener('click', () => {
    if (leaderBoard.style.display === 'block') {
        leaderBoard.style.display = 'none';
    } else {
        leaderBoard.style.display = 'block';
    }
});

// show instruction
instructionBtn.addEventListener('click', () => {
    instruction.style.display = 'flex';
})

// close instruction
closeInstruction.addEventListener('click', () => {
    instruction.style.display = 'none';
})

