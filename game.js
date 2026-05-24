// Game Constants
const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 500;
const FORTRESS_X = 900;
const FORTRESS_Y = 250;
const FORTRESS_WIDTH = 80;
const FORTRESS_HEIGHT = 80;
const TARGET_SCORE = 100;
const BONUS_COMBO = 5;
const BOSS_COMBO_REQUIRED = 5;

// Game State
let gameState = {
    running: false,
    paused: false,
    score: 0,
    combo: 0,
    difficulty: 1,
    level: 0,
    zombiesDefeated: 0,
    fortressHealth: 100,
    gameStartTime: null,
    isBossLevel: false,
    bossBattleCombo: 0
};

// Game Objects
let zombies = [];
let particles = [];
let currentProblem = null;
let gameCanvas;
let ctx;

// DOM Elements
let scoreDisplay, comboDisplay, difficultyDisplay;
let answerInput, feedbackDiv, gameStatus;
let startBtn, pauseBtn, resetBtn;
let victoryScreen, gameOverScreen;
let restartBtn, retryBtn;

// Initialize Game
function initGame() {
    gameCanvas = document.getElementById('gameCanvas');
    ctx = gameCanvas.getContext('2d');
    
    scoreDisplay = document.getElementById('score');
    comboDisplay = document.getElementById('combo');
    difficultyDisplay = document.getElementById('difficulty');
    answerInput = document.getElementById('answerInput');
    feedbackDiv = document.getElementById('feedback');
    gameStatus = document.getElementById('gameStatus');
    
    startBtn = document.getElementById('startBtn');
    pauseBtn = document.getElementById('pauseBtn');
    resetBtn = document.getElementById('resetBtn');
    victoryScreen = document.getElementById('victoryScreen');
    gameOverScreen = document.getElementById('gameOverScreen');
    restartBtn = document.getElementById('restartBtn');
    retryBtn = document.getElementById('retryBtn');
    
    // Event Listeners
    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', togglePause);
    resetBtn.addEventListener('click', resetGame);
    answerInput.addEventListener('keypress', handleAnswer);
    restartBtn.addEventListener('click', restartGameAfterVictory);
    retryBtn.addEventListener('click', resetGame);
    
    // Resize canvas for retina displays
    const rect = gameCanvas.getBoundingClientRect();
    gameCanvas.width = rect.width;
    gameCanvas.height = rect.height;
    
    resetGameState();
}

function resetGameState() {
    gameState = {
        running: false,
        paused: false,
        score: 0,
        combo: 0,
        difficulty: 1,
        level: 0,
        zombiesDefeated: 0,
        fortressHealth: 100,
        gameStartTime: null,
        isBossLevel: false,
        bossBattleCombo: 0
    };
    
    zombies = [];
    particles = [];
    updateUI();
    drawGameScreen();
}

function startGame() {
    if (gameState.running && !gameState.paused) return;
    
    if (!gameState.running) {
        resetGameState();
    }
    
    gameState.running = true;
    gameState.paused = false;
    gameState.gameStartTime = Date.now();
    
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    answerInput.focus();
    
    victoryScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    
    generateNewLevel();
    gameLoop();
}

function togglePause() {
    if (!gameState.running) return;
    
    gameState.paused = !gameState.paused;
    pauseBtn.textContent = gameState.paused ? 'Resume' : 'Pause';
    
    if (!gameState.paused) {
        gameLoop();
    }
}

function resetGame() {
    gameState.running = false;
    pauseBtn.disabled = true;
    startBtn.disabled = false;
    pauseBtn.textContent = 'Pause';
    answerInput.value = '';
    feedbackDiv.textContent = '';
    
    resetGameState();
    victoryScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
}

function generateNewLevel() {
    gameState.level++;
    gameState.isBossLevel = gameState.level % 5 === 0;
    gameState.difficulty = Math.min(1 + Math.floor(gameState.level / 2), 5);
    
    if (gameState.isBossLevel) {
        gameStatus.textContent = `🔥 BOSS LEVEL ${gameState.level} 🔥 - Answer 5 questions in a row to defeat the boss!`;
        gameStatus.style.color = '#dc3545';
        gameState.bossBattleCombo = 0;
    } else {
        gameStatus.textContent = `Level ${gameState.level} - Difficulty: ${gameState.difficulty}`;
        gameStatus.style.color = '#667eea';
    }
    
    zombies = [];
    particles = [];
    gameState.combo = 0;
    updateUI();
}

function spawnZombie() {
    const zombie = {
        x: 50,
        y: Math.random() * (gameCanvas.height - 60) + 30,
        width: 40,
        height: 50,
        speed: 0.5 + gameState.difficulty * 0.3,
        health: gameState.isBossLevel ? 3 : 1,
        maxHealth: gameState.isBossLevel ? 3 : 1,
        problem: generateProblem(),
        answered: false,
        destroyTime: 0,
        isBoss: gameState.isBossLevel
    };
    
    zombies.push(zombie);
}

function generateProblem() {
    const num1 = Math.floor(Math.random() * 9) + 1;
    const num2 = Math.floor(Math.random() * 9) + 1;
    return {
        num1: num1,
        num2: num2,
        answer: num1 * num2
    };
}

function handleAnswer(e) {
    if (e.key !== 'Enter') return;
    if (!gameState.running || gameState.paused) return;
    
    const userAnswer = parseInt(answerInput.value);
    answerInput.value = '';
    
    if (isNaN(userAnswer)) {
        showFeedback('Please enter a number', 'incorrect');
        return;
    }
    
    const zombie = findZombieWithProblem();
    if (!zombie) {
        showFeedback('No zombie to answer!', 'incorrect');
        return;
    }
    
    if (userAnswer === zombie.problem.answer) {
        handleCorrectAnswer(zombie);
    } else {
        handleIncorrectAnswer(zombie);
    }
    
    answerInput.focus();
}

function findZombieWithProblem() {
    return zombies.find(z => !z.answered && z.health > 0);
}

function handleCorrectAnswer(zombie) {
    gameState.combo++;
    
    // Damage boss or kill regular zombie
    if (zombie.isBoss) {
        zombie.health--;
        gameState.bossBattleCombo++;
        
        if (zombie.health === 0) {
            zombie.answered = true;
            createExplosion(zombie.x, zombie.y);
            gameState.score += 10;
            
            // Check if boss defeated
            if (gameState.bossBattleCombo >= BOSS_COMBO_REQUIRED) {
                gameState.score += 20;
                showFeedback('🔥 BOSS DEFEATED! 🔥', 'bonus');
                setTimeout(() => {
                    if (gameState.score >= TARGET_SCORE) {
                        winGame();
                    } else {
                        generateNewLevel();
                    }
                }, 1000);
            } else {
                showFeedback('Boss Hit! ' + (BOSS_COMBO_REQUIRED - gameState.bossBattleCombo) + ' more hits needed', 'correct');
            }
        } else {
            showFeedback('Boss Hit! ' + (BOSS_COMBO_REQUIRED - gameState.bossBattleCombo) + ' more hits to defeat!', 'correct');
            createParticles(zombie.x, zombie.y, 5);
        }
    } else {
        zombie.answered = true;
        createExplosion(zombie.x, zombie.y);
        gameState.score += 1;
        showFeedback('✓ Correct!', 'correct');
    }
    
    // Check for bonus
    if (gameState.combo === BONUS_COMBO && !gameState.isBossLevel) {
        gameState.score += 5;
        showFeedback('🎁 COMBO BONUS +5! 🎁', 'bonus');
        gameState.combo = 0;
    }
    
    // Check win condition
    if (gameState.score >= TARGET_SCORE) {
        winGame();
    }
    
    updateUI();
}

function handleIncorrectAnswer(zombie) {
    gameState.combo = 0;
    gameState.bossBattleCombo = 0;
    
    // Move zombie forward
    zombie.speed += 1;
    showFeedback('✗ Wrong! Zombie advances!', 'incorrect');
    updateUI();
}

function createExplosion(x, y) {
    createParticles(x, y, 12);
    
    // Add visual effect
    const explosion = {
        x: x,
        y: y,
        radius: 5,
        maxRadius: 40,
        duration: 300,
        startTime: Date.now(),
        color: '#ff6b6b'
    };
    particles.push(explosion);
}

function createParticles(x, y, count) {
    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count;
        const speed = 2 + Math.random() * 3;
        
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1,
            size: 3 + Math.random() * 5,
            color: `hsl(${Math.random() * 60 + 15}, 100%, 50%)`
        });
    }
}

function showFeedback(message, type) {
    feedbackDiv.textContent = message;
    feedbackDiv.className = 'feedback ' + type;
    
    setTimeout(() => {
        feedbackDiv.textContent = '';
        feedbackDiv.className = 'feedback';
    }, 1000);
}

function updateUI() {
    scoreDisplay.textContent = gameState.score;
    comboDisplay.textContent = gameState.combo;
    difficultyDisplay.textContent = gameState.difficulty;
}

function gameLoop() {
    if (!gameState.running) return;
    
    if (gameState.paused) {
        drawGameScreen();
        requestAnimationFrame(gameLoop);
        return;
    }
    
    // Update game logic
    updateZombies();
    updateParticles();
    checkGameOver();
    
    // Spawn new zombies
    if (zombies.filter(z => z.health > 0 && !z.answered).length < 1 + Math.floor(gameState.difficulty)) {
        spawnZombie();
    }
    
    // Draw
    drawGameScreen();
    
    requestAnimationFrame(gameLoop);
}

function updateZombies() {
    for (let i = zombies.length - 1; i >= 0; i--) {
        const zombie = zombies[i];
        
        if (zombie.answered) {
            zombie.destroyTime += 16;
            if (zombie.destroyTime > 300) {
                zombies.splice(i, 1);
            }
        } else if (zombie.health > 0) {
            zombie.x += zombie.speed;
            
            // Check if reached fortress
            if (zombie.x >= FORTRESS_X) {
                gameState.fortressHealth -= 1;
                zombie.answered = true;
            }
        }
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        
        if (p.vx !== undefined) {
            // Regular particle
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.1; // gravity
            p.life -= 0.02;
            
            if (p.life <= 0) {
                particles.splice(i, 1);
            }
        } else {
            // Explosion ring
            const elapsed = Date.now() - p.startTime;
            p.radius = p.maxRadius * (elapsed / p.duration);
            
            if (elapsed > p.duration) {
                particles.splice(i, 1);
            }
        }
    }
}

function checkGameOver() {
    if (gameState.fortressHealth <= 0) {
        endGame();
    }
}

function drawGameScreen() {
    // Clear canvas
    ctx.fillStyle = 'rgba(26, 26, 46, 0.9)';
    ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    
    // Draw background grid
    drawBackgroundGrid();
    
    // Draw fortress
    drawFortress();
    
    // Draw zombies
    drawZombies();
    
    // Draw particles
    drawParticles();
    
    // Draw UI on canvas
    drawCanvasUI();
}

function drawBackgroundGrid() {
    ctx.strokeStyle = 'rgba(102, 126, 234, 0.1)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= gameCanvas.width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, gameCanvas.height);
        ctx.stroke();
    }
    
    for (let i = 0; i <= gameCanvas.height; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(gameCanvas.width, i);
        ctx.stroke();
    }
}

function drawFortress() {
    // Fortress body
    const healthPercentage = gameState.fortressHealth / 100;
    ctx.fillStyle = healthPercentage > 0.5 ? '#4CAF50' : 
                     healthPercentage > 0.25 ? '#FFC107' : '#FF5722';
    
    ctx.fillRect(FORTRESS_X, FORTRESS_Y, FORTRESS_WIDTH, FORTRESS_HEIGHT);
    
    // Fortress outline
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.strokeRect(FORTRESS_X, FORTRESS_Y, FORTRESS_WIDTH, FORTRESS_HEIGHT);
    
    // Tower
    ctx.fillStyle = '#666';
    ctx.fillRect(FORTRESS_X + 15, FORTRESS_Y - 20, 50, 20);
    
    // Flag
    ctx.fillStyle = '#FF1744';
    ctx.fillRect(FORTRESS_X + 60, FORTRESS_Y - 20, 20, 10);
    
    // Health bar
    drawHealthBar(FORTRESS_X, FORTRESS_Y - 15, FORTRESS_WIDTH, 8);
}

function drawHealthBar(x, y, width, height) {
    const healthPercentage = Math.max(0, gameState.fortressHealth / 100);
    
    // Background
    ctx.fillStyle = '#333';
    ctx.fillRect(x, y, width, height);
    
    // Health
    ctx.fillStyle = healthPercentage > 0.5 ? '#4CAF50' : 
                    healthPercentage > 0.25 ? '#FFC107' : '#FF5722';
    ctx.fillRect(x, y, width * healthPercentage, height);
    
    // Border
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);
}

function drawZombies() {
    for (const zombie of zombies) {
        if (zombie.health <= 0 && zombie.answered) continue;
        
        // Draw zombie body
        ctx.fillStyle = zombie.isBoss ? '#8B008B' : '#2ECC71';
        ctx.fillRect(zombie.x, zombie.y, zombie.width, zombie.height);
        
        // Zombie outline
        ctx.strokeStyle = zombie.isBoss ? '#FF1744' : '#27AE60';
        ctx.lineWidth = 2;
        ctx.strokeRect(zombie.x, zombie.y, zombie.width, zombie.height);
        
        // Zombie eyes
        ctx.fillStyle = '#000';
        ctx.fillRect(zombie.x + 8, zombie.y + 10, 5, 5);
        ctx.fillRect(zombie.x + 27, zombie.y + 10, 5, 5);
        
        // Zombie mouth
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(zombie.x + 20, zombie.y + 25, 5, 0, Math.PI);
        ctx.stroke();
        
        // Health indicator for boss
        if (zombie.isBoss) {
            drawHealthBar(zombie.x, zombie.y - 10, zombie.width, 6);
        }
        
        // Draw problem above zombie
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(
            `${zombie.problem.num1} × ${zombie.problem.num2}`,
            zombie.x + zombie.width / 2,
            zombie.y - 15
        );
        
        // Problem box background
        ctx.fillStyle = 'rgba(255, 215, 0, 0.9)';
        ctx.fillRect(zombie.x - 10, zombie.y - 35, zombie.width + 20, 25);
        
        // Redraw problem on top
        ctx.fillStyle = '#333';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(
            `${zombie.problem.num1} × ${zombie.problem.num2}`,
            zombie.x + zombie.width / 2,
            zombie.y - 15
        );
    }
}

function drawParticles() {
    for (const p of particles) {
        if (p.vx !== undefined) {
            // Regular particle
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life;
            ctx.fillRect(p.x, p.y, p.size, p.size);
            ctx.globalAlpha = 1;
        } else {
            // Explosion ring
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 3;
            ctx.globalAlpha = 1 - (p.radius / p.maxRadius);
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
    }
}

function drawCanvasUI() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(
        `Health: ${Math.max(0, gameState.fortressHealth)}/100`,
        10,
        30
    );
    
    if (gameState.isBossLevel) {
        ctx.fillStyle = '#FF1744';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(
            `Boss Hits: ${gameState.bossBattleCombo}/${BOSS_COMBO_REQUIRED}`,
            10,
            50
        );
    }
}

function winGame() {
    gameState.running = false;
    pauseBtn.disabled = true;
    startBtn.disabled = false;
    
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('levelsCompleted').textContent = gameState.level;
    
    // Victory animation
    playVictoryAnimation();
    
    setTimeout(() => {
        victoryScreen.style.display = 'flex';
    }, 500);
}

function endGame() {
    gameState.running = false;
    pauseBtn.disabled = true;
    startBtn.disabled = false;
    
    document.getElementById('finalScoreOver').textContent = gameState.score;
    
    gameOverScreen.style.display = 'flex';
}

function restartGameAfterVictory() {
    victoryScreen.style.display = 'none';
    resetGame();
    startGame();
}

function playVictoryAnimation() {
    // Create confetti particles
    for (let i = 0; i < 50; i++) {
        particles.push({
            x: Math.random() * gameCanvas.width,
            y: -20,
            vx: (Math.random() - 0.5) * 8,
            vy: Math.random() * 5 + 3,
            life: 3,
            size: Math.random() * 8 + 4,
            color: `hsl(${Math.random() * 360}, 100%, 50%)`
        });
    }
    
    // Draw celebration
    let startTime = Date.now();
    const animateConfetti = () => {
        drawGameScreen();
        drawParticles();
        
        updateParticles();
        
        if (Date.now() - startTime < 2000) {
            requestAnimationFrame(animateConfetti);
        }
    };
    
    animateConfetti();
}

// Start game when page loads
window.addEventListener('DOMContentLoaded', initGame);