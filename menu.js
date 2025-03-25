const menuContainer = document.getElementById('menuContainer');
const leaderboardContainer = document.getElementById('leaderboardContainer');
const instructionContainer = document.getElementById('instructionContainer');
const gameContainer = document.getElementById('gameContainer');

const usernameInput = document.getElementById('usernameInput');
const startBtn = document.getElementById('startBtn');
startBtn.disabled = true;
const leaderboardBtn = document.getElementById('leaderboardBtn');
const instructionBtn = document.getElementById('instructionBtn');
const closeInstructionBtn = document.getElementById('closeInstructionBtn');

leaderboardBtn.addEventListener('click', () => {
    if (leaderboardContainer.style.display === 'none' || leaderboardContainer.style.display === '') {
        leaderboardContainer.style.display = 'block';
    } else {
        leaderboardContainer.style.display = 'none';
    }
});


instructionBtn.addEventListener('click', () => {
    instructionContainer.classList.add('hidden');
})

closeInstructionBtn.addEventListener('click', () => {
    instructionContainer.classList.remove('hidden');
})

usernameInput.addEventListener('input', () => {
    startBtn.disabled = usernameInput.value.trim() === '';
});


startBtn.addEventListener('click', () => {
    gameContainer.style.display = 'flex';
    menuContainer.style.display = 'none';
    leaderboardContainer.style.display = 'none';
    instructionContainer.style.display = 'none';

    gameStart();
});

// leaderboard

let leaderboardDisplay = JSON.parse(localStorage.getItem('leaderboard'));
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
})