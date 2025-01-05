// Game states and elements
const gameStates = {
    currentState: 'intro', // intro, menu, instructions, difficulty, playing
    difficulty: 'medium'
};

const elements = {
    mainMenu: document.getElementById('mainMenu'),
    instructions: document.getElementById('instructions'),
    difficultySelect: document.getElementById('difficultySelect'),
    canvas: document.getElementById('gameCanvas')
};

// Initialize canvas size
elements.canvas.width = 1024;
elements.canvas.height = 768;

// Create intro animation
const introAnimation = new IntroAnimation(elements.canvas);

// Start with intro animation
window.onload = function() {
    elements.canvas.style.display = 'block';
    introAnimation.play(() => {
        showMainMenu();
    });
    
    // Allow skipping intro with any key or click
    document.addEventListener('keydown', skipIntro);
    document.addEventListener('click', skipIntro);
};

function skipIntro() {
    if (gameStates.currentState === 'intro') {
        introAnimation.stop();
        showMainMenu();
        // Remove event listeners
        document.removeEventListener('keydown', skipIntro);
        document.removeEventListener('click', skipIntro);
    }
}

// Show/hide functions for different screens
function showMainMenu() {
    gameStates.currentState = 'menu';
    elements.mainMenu.style.display = 'flex';
    elements.instructions.style.display = 'none';
    elements.difficultySelect.style.display = 'none';
    elements.canvas.style.display = 'none';
}

function showInstructions() {
    elements.mainMenu.style.display = 'none';
    elements.instructions.style.display = 'flex';
    gameStates.currentState = 'instructions';
}

function showDifficultySelect() {
    elements.mainMenu.style.display = 'none';
    elements.difficultySelect.style.display = 'flex';
    gameStates.currentState = 'difficulty';
}

function startGame(difficulty) {
    gameStates.difficulty = difficulty;
    elements.difficultySelect.style.display = 'none';
    elements.canvas.style.display = 'block';
    gameStates.currentState = 'playing';
    
    // Set game difficulty
    switch(difficulty) {
        case 'easy':
            gameStates.monsterSpawnRate = 4000; // Slower spawn rate
            gameStates.player.speed = 6; // Faster player
            break;
        case 'medium':
            gameStates.monsterSpawnRate = 3000;
            gameStates.player.speed = 5;
            break;
        case 'hard':
            gameStates.monsterSpawnRate = 2000; // Faster spawn rate
            gameStates.player.speed = 4; // Slower player
            break;
        case 'superhard':
            gameStates.monsterSpawnRate = 1000; // Very fast spawn rate
            gameStates.player.speed = 3; // Very slow player
            break;
    }
    
    // Reset game state
    gameStates.player.health = 100;
    gameStates.player.ammo = gameStates.player.maxAmmo;
    gameStates.player.score = 0;
    gameStates.monsters = [];
    gameStates.bullets = [];
    gameStates.gameTime = Date.now();
    
    // Start the game loop
    gameLoop();
}

// Handle game over
function gameOver() {
    const finalScore = gameStates.player.score;
    setTimeout(() => {
        alert(`Game Over! Final Score: ${finalScore}`);
        showMainMenu();
    }, 1000);
}
