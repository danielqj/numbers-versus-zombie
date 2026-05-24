# Numbers vs Zombie 🧟‍♂️ × 🔢

A fun and educational web-based game that teaches children multiplication tables while defending a fortress from zombies!

## Game Overview

**Numbers vs Zombie** is an interactive tower defense-style game where players solve multiplication problems to defeat zombies approaching their fortress. It combines education with entertainment, making math practice engaging and fun!

## Features

### 🎮 Core Gameplay
- **Interactive Combat**: Zombies appear from the left side of the screen, each with a multiplication problem displayed above their head
- **Problem Solving**: Players must solve the math problem correctly to destroy the zombie
- **Wrong Answer Penalty**: Incorrect answers cause zombies to advance faster toward the fortress
- **Combo System**: Get 5 consecutive correct answers to earn a 5-point bonus
- **Health System**: The fortress has 100 health points; zombies that reach it reduce health by 1
- **Score Accumulation**: Defeat zombies and earn points toward the victory target of 100 points

### 🎯 Boss Battles
- Every 5th level features a **Boss Zombie** 🔥
- Boss zombies have 3 health points (require 3 correct answers to defeat)
- Boss battles require **5 consecutive correct answers** to completely destroy the boss
- Defeating a boss earns 20 bonus points

### ⚙️ Difficulty System
- Difficulty increases gradually as you progress through levels
- As difficulty increases, zombies move faster
- Maximum difficulty level: 5
- Difficulty = 1 + floor(Level / 2)

### 🏆 Victory Conditions
- **Win**: Accumulate 100 points to defeat all zombies and save the fortress
- **Lose**: Fortress health reaches 0 (zombies reach the fortress)

### ✨ Visual Effects
- **Particle Explosions**: Zombies explode with particle effects when defeated
- **Victory Animation**: Confetti and special effects when winning
- **Health Indicators**: Visual health bars for fortress and boss zombies
- **Combo Feedback**: Special visual feedback for combo bonuses
- **Smooth Animations**: Fluid gameplay with professional visual polish

## How to Play

1. **Start the Game**: Click the "Start Game" button
2. **Read the Problem**: Each zombie has a multiplication problem above its head (e.g., 3 × 4)
3. **Enter the Answer**: Type the correct answer in the input field and press Enter
4. **Correct Answer**: The zombie explodes and you earn points
5. **Wrong Answer**: The zombie moves faster toward your fortress
6. **Strategy**: Build combos by answering correctly to earn bonus points
7. **Survive**: Don't let zombies reach your fortress
8. **Win**: Accumulate 100 points to achieve victory!

## Controls

| Action | Control |
|--------|----------|
| Answer Question | Type number + Press Enter |
| Start Game | Click "Start Game" button |
| Pause/Resume | Click "Pause" button |
| Reset Game | Click "Reset" button |
| Play Again | Click "Play Again" button (after victory) |

## Scoring System

| Action | Points |
|--------|--------|
| Kill a Regular Zombie | 1 point |
| Boss Zombie Hit | 1 point per hit |
| 5-Combo Bonus | 5 bonus points |
| Boss Defeated | 20 bonus points |
| **Victory Target** | **100 points** |

## Game Progression

### Levels
- Each level increases the difficulty
- Spawning rate of zombies increases with difficulty
- Zombie speed increases with each level

### Boss Levels
- Occur every 5 levels (Level 5, 10, 15, etc.)
- Boss zombies are purple and larger
- Require 5 consecutive correct answers to defeat
- Must answer 5 questions in a row without mistakes

## Multiplication Tables

The game covers multiplication of:
- Numbers 1 through 9
- All single-digit multiplication combinations
- Perfect for learning basic multiplication facts

## Technical Stack

- **HTML5**: Game structure and layout
- **CSS3**: Styling, animations, and responsive design
- **Canvas API**: 2D graphics and game rendering
- **Vanilla JavaScript**: Game logic, physics, and interactivity

## Installation & Usage

1. Clone or download this repository
2. Open `index.html` in a modern web browser
3. Click "Start Game" to begin
4. Enjoy and improve your multiplication skills!

No dependencies or build tools required - plays directly in your browser!

## Game Tips

### 🎯 Strategy
1. **Accuracy Over Speed**: Getting the right answer is more important than being fast
2. **Build Combos**: Try to get 5 in a row for bonus points
3. **Focus on One**: Answer the first zombie's problem completely before worrying about others
4. **Difficulty Management**: Start easy and progress naturally
5. **Boss Strategy**: Take your time with boss battles - rushing leads to mistakes

### 📚 Learning Tips
1. Start with easier multiplications (1x, 2x, 5x tables)
2. Practice regularly to improve speed and accuracy
3. Use the combo system to challenge yourself
4. Boss levels help consolidate knowledge

## Responsive Design

The game works on:
- 🖥️ Desktop computers (optimal experience)
- 💻 Laptops
- 📱 Tablets (with optimized input)
- Mobile devices (touch-friendly interface)

## Browser Compatibility

Works best on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Customization

You can modify game parameters in `game.js`:

```javascript
const TARGET_SCORE = 100;           // Victory score
const BONUS_COMBO = 5;              // Combo length for bonus
const BOSS_COMBO_REQUIRED = 5;      // Hits needed to defeat boss
const FORTRESS_HEALTH = 100;        // Starting fortress health
```

## Educational Benefits

✓ **Multiplication Mastery**: Reinforces times tables through repetition
✓ **Speed & Accuracy**: Improves mental math calculation speed
✓ **Problem Solving**: Develops quick thinking under pressure
✓ **Engagement**: Makes learning fun and game-like
✓ **Difficulty Progression**: Gradually increases challenge as skills improve

## Future Features

- 🌍 Multiplayer/Leaderboards
- 🎨 Different zombie skins and themes
- 🔊 Sound effects and music
- 📊 Progress tracking and statistics
- 🎓 Different difficulty modes (division, addition, etc.)
- ⭐ Power-ups and special abilities
- 🌙 Dark mode
- 🏅 Achievement system

## Author

Created for educational entertainment - making math fun, one zombie at a time! 🧟‍♂️🔢

## License

Free to use for educational purposes.

---

**Have fun and crush those multiplication problems!** 🚀