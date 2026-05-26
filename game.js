const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const baseHealthEl = document.getElementById("baseHealth");
const streakEl = document.getElementById("streak");
const waveLabelEl = document.getElementById("waveLabel");
const overlay = document.getElementById("overlay");
const startButton = document.getElementById("startButton");
const answerForm = document.getElementById("answerForm");
const answerInput = document.getElementById("answerInput");
const submitButton = document.getElementById("submitButton");
const resetButton = document.getElementById("resetButton");
const difficultyRange = document.getElementById("difficultyRange");
const difficultyText = document.getElementById("difficultyText");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const BASE_X = WIDTH - 150;
const WIN_SCORE = 100;

const difficultyNames = ["", "轻松", "普通", "挑战", "困难", "大师"];

let state = createInitialState();
let lastTime = performance.now();
let spawnTimer = 0;
let animationId = null;

function createInitialState() {
  return {
    running: false,
    gameOver: false,
    victory: false,
    bossMode: false,
    bossReady: false,
    score: 0,
    baseHealth: 100,
    streak: 0,
    bossStreak: 0,
    zombies: [],
    particles: [],
    floatingTexts: [],
    shake: 0,
    cannonFlash: 0,
    time: 0
  };
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getDifficulty() {
  return Number(difficultyRange.value);
}

function makeProblem(isBoss = false) {
  const difficulty = getDifficulty();
  const max = Math.min(9, 4 + difficulty);
  const min = difficulty >= 4 ? 2 : 1;
  const a = isBoss ? randomInt(5, 9) : randomInt(min, max);
  const b = isBoss ? randomInt(5, 9) : randomInt(min, max);
  return { a, b, answer: a * b };
}

function spawnZombie(isBoss = false) {
  const problem = makeProblem(isBoss);
  const difficulty = getDifficulty();
  const lane = isBoss ? 2 : randomInt(0, 3);
  const y = 122 + lane * 94;
  const zombie = {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    x: isBoss ? -170 : -70,
    y,
    width: isBoss ? 126 : 64,
    height: isBoss ? 148 : 82,
    speed: isBoss ? 18 + difficulty * 7 : 34 + difficulty * 18 + Math.random() * 12,
    health: isBoss ? 5 : 1,
    maxHealth: isBoss ? 5 : 1,
    problem,
    isBoss,
    wobble: Math.random() * Math.PI * 2
  };
  state.zombies.push(zombie);
  if (isBoss) {
    state.bossReady = true;
    waveLabelEl.textContent = "Boss";
    addFloatingText("Boss 出现：连续答对 5 题！", WIDTH * 0.42, 82, "#ffc857");
  }
}

function startGame() {
  state = createInitialState();
  state.running = true;
  spawnTimer = 0;
  overlay.classList.add("hidden");
  answerInput.disabled = false;
  submitButton.disabled = false;
  answerInput.value = "";
  answerInput.focus();
  updateHud();
}

function resetGame() {
  state = createInitialState();
  overlay.classList.remove("hidden");
  overlay.querySelector("h1").textContent = "Numbers Versus Zombie";
  overlay.querySelector("p").textContent = "输入僵尸头顶乘法题的答案，保护右边的堡垒。连续答对 5 题会获得 5 分奖励，达到 100 分人类获胜。";
  startButton.textContent = "开始训练";
  answerInput.disabled = true;
  submitButton.disabled = true;
  answerInput.value = "";
  updateHud();
}

function nearestZombie() {
  return state.zombies
    .slice()
    .sort((a, b) => b.x - a.x)[0];
}

function handleAnswer(event) {
  event.preventDefault();
  if (!state.running) return;

  const target = nearestZombie();
  if (!target) {
    answerInput.value = "";
    addFloatingText("先等僵尸出现", WIDTH * 0.5, 88, "#66c7f4");
    return;
  }

  const value = Number(answerInput.value.trim());
  if (!Number.isFinite(value)) return;

  if (value === target.problem.answer) {
    correctAnswer(target);
  } else {
    wrongAnswer(target);
  }

  answerInput.value = "";
  updateHud();
}

function correctAnswer(target) {
  state.streak += 1;
  state.cannonFlash = 0.18;

  if (target.isBoss) {
    state.bossStreak += 1;
    target.health = Math.max(0, target.health - 1);
    burst(target.x + target.width / 2, target.y, "#ffc857", 18);
    addFloatingText(`Boss 连击 ${state.bossStreak}/5`, target.x + 30, target.y - 70, "#ffc857");

    if (state.bossStreak >= 5) {
      explodeZombie(target, 25);
      state.score = WIN_SCORE;
      winGame();
    }
    return;
  }

  state.score += 10;
  explodeZombie(target, 14);

  if (state.streak > 0 && state.streak % 5 === 0) {
    state.score += 5;
    addFloatingText("+5 连对奖励", WIDTH * 0.54, 92, "#63d471");
    burst(WIDTH * 0.54, 112, "#63d471", 22);
  }

  if (state.score >= WIN_SCORE && !state.bossMode) {
    beginBossMode();
  }
}

function wrongAnswer(target) {
  state.streak = 0;
  state.bossStreak = 0;
  state.shake = 0.25;
  target.x += target.isBoss ? 54 : 82;
  addFloatingText("错误，僵尸前进！", target.x + 25, target.y - 62, "#ff5c5c");
  burst(target.x + target.width / 2, target.y + 16, "#ff5c5c", 10);
}

function beginBossMode() {
  state.bossMode = true;
  state.zombies = [];
  state.score = 95;
  state.streak = 0;
  state.bossStreak = 0;
  spawnZombie(true);
}

function explodeZombie(target, count) {
  state.zombies = state.zombies.filter((zombie) => zombie.id !== target.id);
  burst(target.x + target.width / 2, target.y, target.isBoss ? "#ffc857" : "#83e377", count);
  addFloatingText(target.isBoss ? "Boss 爆炸！" : "+10", target.x + 18, target.y - 70, target.isBoss ? "#ffc857" : "#83e377");
}

function damageBase(amount) {
  state.baseHealth = Math.max(0, state.baseHealth - amount);
  state.shake = 0.35;
  burst(BASE_X + 80, HEIGHT - 140, "#ff5c5c", 18);
  if (state.baseHealth <= 0) {
    loseGame();
  }
}

function winGame() {
  state.running = false;
  state.victory = true;
  state.score = WIN_SCORE;
  answerInput.disabled = true;
  submitButton.disabled = true;
  for (let i = 0; i < 110; i += 1) {
    burst(randomInt(80, WIDTH - 120), randomInt(40, HEIGHT - 80), ["#ffc857", "#63d471", "#66c7f4", "#ffffff"][i % 4], 1);
  }
  showOverlay("人类获胜！", "你累积到 100 分，并在 Boss 关连续答对 5 题。堡垒安全了，乘法口诀也更强了。", "再玩一次");
  updateHud();
}

function loseGame() {
  state.running = false;
  state.gameOver = true;
  answerInput.disabled = true;
  submitButton.disabled = true;
  showOverlay("堡垒失守", "再试一次，先盯住离堡垒最近的僵尸，稳稳输入答案。", "重新挑战");
  updateHud();
}

function showOverlay(title, message, buttonText) {
  overlay.querySelector("h1").textContent = title;
  overlay.querySelector("p").textContent = message;
  startButton.textContent = buttonText;
  overlay.classList.remove("hidden");
}

function burst(x, y, color, count) {
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 70 + Math.random() * 210;
    state.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.45 + Math.random() * 0.55,
      age: 0,
      size: 3 + Math.random() * 6,
      color
    });
  }
}

function addFloatingText(text, x, y, color) {
  state.floatingTexts.push({ text, x, y, color, age: 0, life: 1.1 });
}

function update(dt) {
  state.time += dt;

  if (state.running) {
    if (!state.bossMode) {
      spawnTimer -= dt;
      const interval = Math.max(0.72, 1.8 - getDifficulty() * 0.19);
      if (spawnTimer <= 0) {
        spawnZombie(false);
        spawnTimer = interval;
      }
      waveLabelEl.textContent = "普通";
    }

    for (const zombie of state.zombies) {
      zombie.x += zombie.speed * dt;
      zombie.wobble += dt * 6;
    }

    const attackers = state.zombies.filter((zombie) => zombie.x + zombie.width >= BASE_X + 8);
    for (const zombie of attackers) {
      damageBase(zombie.isBoss ? 28 : 15);
    }
    state.zombies = state.zombies.filter((zombie) => zombie.x + zombie.width < BASE_X + 8);
  }

  updateParticles(dt);
  state.shake = Math.max(0, state.shake - dt);
  state.cannonFlash = Math.max(0, state.cannonFlash - dt);
}

function updateParticles(dt) {
  for (const particle of state.particles) {
    particle.age += dt;
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vy += 240 * dt;
  }
  state.particles = state.particles.filter((particle) => particle.age < particle.life);

  for (const text of state.floatingTexts) {
    text.age += dt;
    text.y -= 38 * dt;
  }
  state.floatingTexts = state.floatingTexts.filter((text) => text.age < text.life);
}

function draw() {
  ctx.save();
  const shakeX = state.shake > 0 ? (Math.random() - 0.5) * 12 : 0;
  const shakeY = state.shake > 0 ? (Math.random() - 0.5) * 8 : 0;
  ctx.translate(shakeX, shakeY);

  drawBackground();
  drawBase();
  drawCannon();
  for (const zombie of state.zombies) {
    drawZombie(zombie);
  }
  drawParticles();
  drawFloatingTexts();
  ctx.restore();
}

function drawBackground() {
  const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  sky.addColorStop(0, "#182622");
  sky.addColorStop(0.58, "#253d2a");
  sky.addColorStop(1, "#4f4a2f");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
  for (let i = 0; i < 32; i += 1) {
    const x = (i * 173 + 41) % WIDTH;
    const y = (i * 67 + 27) % 185;
    ctx.fillRect(x, y, 2, 2);
  }

  ctx.fillStyle = "#1e2d20";
  ctx.fillRect(0, HEIGHT - 96, WIDTH, 96);
  ctx.fillStyle = "rgba(255, 246, 223, 0.08)";
  for (let y = 122; y <= 404; y += 94) {
    ctx.fillRect(0, y + 32, BASE_X - 20, 2);
  }

  ctx.fillStyle = "#5a4730";
  ctx.fillRect(0, HEIGHT - 55, WIDTH, 55);
  ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
  ctx.fillRect(0, HEIGHT - 55, WIDTH, 10);
}

function drawBase() {
  ctx.fillStyle = "#7f8792";
  ctx.fillRect(BASE_X, HEIGHT - 260, 118, 205);
  ctx.fillStyle = "#a4adb8";
  ctx.fillRect(BASE_X - 18, HEIGHT - 280, 154, 28);
  ctx.fillStyle = "#59616b";
  for (let i = 0; i < 4; i += 1) {
    ctx.fillRect(BASE_X - 10 + i * 39, HEIGHT - 303, 26, 35);
  }
  ctx.fillStyle = "#2b2b32";
  ctx.fillRect(BASE_X + 42, HEIGHT - 137, 34, 82);

  const healthWidth = 120 * (state.baseHealth / 100);
  ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
  ctx.fillRect(BASE_X - 2, HEIGHT - 325, 122, 14);
  ctx.fillStyle = state.baseHealth > 35 ? "#63d471" : "#ff5c5c";
  ctx.fillRect(BASE_X - 1, HEIGHT - 324, healthWidth, 12);
}

function drawCannon() {
  ctx.save();
  ctx.translate(BASE_X - 20, HEIGHT - 170);
  ctx.rotate(-0.09);
  ctx.fillStyle = "#343941";
  ctx.fillRect(-72, -13, 78, 26);
  ctx.fillStyle = "#20242b";
  ctx.fillRect(-84, -8, 18, 16);
  if (state.cannonFlash > 0) {
    ctx.fillStyle = "#ffc857";
    ctx.beginPath();
    ctx.moveTo(-105, 0);
    ctx.lineTo(-138, -22);
    ctx.lineTo(-128, 0);
    ctx.lineTo(-138, 22);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawZombie(zombie) {
  const bob = Math.sin(zombie.wobble) * 5;
  const x = zombie.x;
  const y = zombie.y + bob;
  const scale = zombie.isBoss ? 1.55 : 1;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.fillStyle = zombie.isBoss ? "#345a35" : "#4b8b50";
  ctx.fillRect(20, -18, 36, 46);
  ctx.fillStyle = zombie.isBoss ? "#527a3d" : "#76b852";
  ctx.beginPath();
  ctx.arc(38, -38, 24, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#fff5df";
  ctx.beginPath();
  ctx.arc(30, -43, 4, 0, Math.PI * 2);
  ctx.arc(47, -43, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#151515";
  ctx.fillRect(29, -44, 2, 2);
  ctx.fillRect(46, -44, 2, 2);

  ctx.strokeStyle = "#1e321f";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(22, -2);
  ctx.lineTo(2, 15);
  ctx.moveTo(54, -2);
  ctx.lineTo(73, 13);
  ctx.moveTo(28, 25);
  ctx.lineTo(19, 49);
  ctx.moveTo(48, 25);
  ctx.lineTo(58, 49);
  ctx.stroke();

  if (zombie.isBoss) {
    ctx.fillStyle = "#ffc857";
    ctx.fillRect(20, -73, 36, 8);
    ctx.fillRect(28, -84, 8, 14);
    ctx.fillRect(42, -84, 8, 14);
    drawBossHealth(zombie);
  }
  ctx.restore();

  drawProblemBubble(zombie, x + zombie.width * 0.5, y - zombie.height * 0.63);
}

function drawProblemBubble(zombie, x, y) {
  ctx.save();
  ctx.font = zombie.isBoss ? "900 31px Segoe UI, Microsoft YaHei, sans-serif" : "900 24px Segoe UI, Microsoft YaHei, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const text = `${zombie.problem.a} x ${zombie.problem.b}`;
  const width = zombie.isBoss ? 126 : 90;
  const height = zombie.isBoss ? 48 : 38;

  ctx.fillStyle = zombie.isBoss ? "#ffe8a3" : "#fff6df";
  roundRect(x - width / 2, y - height / 2, width, height, 8);
  ctx.fill();
  ctx.strokeStyle = zombie.isBoss ? "#ffc857" : "#2f3b2f";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = "#24170b";
  ctx.fillText(text, x, y + 1);
  ctx.restore();
}

function drawBossHealth(zombie) {
  ctx.fillStyle = "rgba(0, 0, 0, 0.38)";
  ctx.fillRect(-2, 58, 80, 9);
  ctx.fillStyle = "#ff5c5c";
  ctx.fillRect(-1, 59, 78 * (zombie.health / zombie.maxHealth), 7);
}

function drawParticles() {
  for (const particle of state.particles) {
    const alpha = 1 - particle.age / particle.life;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawFloatingTexts() {
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "900 24px Segoe UI, Microsoft YaHei, sans-serif";
  for (const text of state.floatingTexts) {
    const alpha = 1 - text.age / text.life;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "#16110b";
    ctx.fillText(text.text, text.x + 2, text.y + 3);
    ctx.fillStyle = text.color;
    ctx.fillText(text.text, text.x, text.y);
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}

function roundRect(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function updateHud() {
  scoreEl.textContent = state.score;
  baseHealthEl.textContent = state.baseHealth;
  streakEl.textContent = state.bossMode ? `${state.bossStreak}/5` : state.streak;
  if (!state.running && !state.bossMode) waveLabelEl.textContent = state.victory ? "胜利" : state.gameOver ? "失败" : "准备";
}

function updateDifficultyLabel() {
  difficultyText.textContent = difficultyNames[getDifficulty()];
}

function loop(now) {
  const dt = Math.min(0.04, (now - lastTime) / 1000);
  lastTime = now;
  update(dt);
  draw();
  updateHud();
  animationId = requestAnimationFrame(loop);
}

startButton.addEventListener("click", startGame);
resetButton.addEventListener("click", resetGame);
answerForm.addEventListener("submit", handleAnswer);
difficultyRange.addEventListener("input", updateDifficultyLabel);

updateDifficultyLabel();
updateHud();
draw();
animationId = requestAnimationFrame(loop);
