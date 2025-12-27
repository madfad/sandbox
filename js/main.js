/**
 * CIRCUITRY - Device Evolution Game
 * Main Game Controller
 */

const Game = {
    isRunning: false,
    isPaused: false,
    currentLevel: null,
    levels: [],
    currentLevelIndex: 0,
    lastTime: 0,
    showingLevelTitle: false,
    levelTitleAlpha: 0,
    levelTitleTimer: 0,

    /**
     * Initialize the game
     */
    init() {
        console.log('🎮 Initializing Circuitry...');

        // Initialize subsystems
        Sprites.init();
        Renderer.init();
        Input.init();
        Evolution.init();

        // Register all 14 levels
        this.levels = [Level1, Level2, Level3, Level4, Level5, Level6, Level7, Level8, Level9, Level10, Level11, Level12, Level13, Level14];

        // Initialize player
        Player.init(100, 200);
        Player.updateUI();

        // Set up event listeners
        this.setupEventListeners();

        // Load first level
        this.loadLevel(0);

        // Start game loop
        this.isRunning = true;
        this.lastTime = performance.now();
        requestAnimationFrame((time) => this.gameLoop(time));

        console.log('✅ Game initialized!');
    },

    /**
     * Set up DOM event listeners
     */
    setupEventListeners() {
        // Next level button
        const nextLevelBtn = document.getElementById('next-level-btn');
        if (nextLevelBtn) {
            nextLevelBtn.addEventListener('click', () => {
                Puzzle.hideCompletionModal();
                this.nextLevel();
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Enter to proceed to next level when complete
            if (e.code === 'Enter' && Puzzle.isComplete) {
                Puzzle.hideCompletionModal();
                this.nextLevel();
            }

            // Developer level jump: Number keys 1-4 (with Shift held)
            if (e.shiftKey && e.code.startsWith('Digit')) {
                const levelNum = parseInt(e.code.replace('Digit', ''));
                if (levelNum >= 1 && levelNum <= this.levels.length) {
                    console.log(`🔧 DEV: Jumping to Level ${levelNum}`);
                    // Give player enough gears for testing
                    Player.gearsCollected = Math.max(Player.gearsCollected, (levelNum - 1) * 5);
                    // Unlock all devices up to this level
                    const devicesNeeded = ['lightSwitch', 'flashlight', 'magnet', 'fan'].slice(0, levelNum);
                    devicesNeeded.forEach(d => {
                        if (!Evolution.unlockedDevices.includes(d)) {
                            Evolution.unlockedDevices.push(d);
                        }
                    });
                    Puzzle.hideCompletionModal();
                    Evolution.hideModal();
                    this.loadLevel(levelNum - 1);
                    Player.updateUI();
                }
            }
        });

        console.log('🔧 DEV TIP: Press Shift+1, Shift+2, Shift+3, or Shift+4 to jump to levels');
    },

    /**
     * Load a level by index
     */
    loadLevel(index) {
        if (index < 0 || index >= this.levels.length) {
            console.log('🎉 All levels complete!');
            this.showVictory();
            return;
        }

        this.currentLevelIndex = index;
        this.currentLevel = this.levels[index].init();

        // Clear particles
        Particles.clear();

        // Show level title
        this.showLevelTitle();

        console.log(`📍 Loaded Level ${index + 1}: ${this.currentLevel.name}`);
    },

    /**
     * Proceed to next level
     */
    nextLevel() {
        // Carry over player state (gears, device type)
        this.loadLevel(this.currentLevelIndex + 1);
    },

    /**
     * Show level title overlay
     */
    showLevelTitle() {
        this.showingLevelTitle = true;
        this.levelTitleAlpha = 1;
        this.levelTitleTimer = 2000; // Show for 2 seconds
    },

    /**
     * Show victory screen
     */
    showVictory() {
        const messageEl = document.getElementById('message-text');
        if (messageEl) {
            messageEl.innerHTML = `
                🎉 <strong>CONGRATULATIONS!</strong> 🎉<br>
                You've completed all available levels!<br>
                Total gears collected: ${Player.gearsCollected}<br>
                Final form: ${Player.devices[Player.deviceType].name}
            `;
        }
    },

    /**
     * Main game loop
     */
    gameLoop(currentTime) {
        if (!this.isRunning) return;

        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Update
        this.update(deltaTime, currentTime);

        // Render
        this.render(currentTime);

        // Clear just pressed states
        Input.clearJustPressed();

        // Continue loop
        requestAnimationFrame((time) => this.gameLoop(time));
    },

    /**
     * Update game state
     */
    update(deltaTime, currentTime) {
        // Don't update if showing modals
        if (Evolution.modalVisible || Puzzle.isComplete) {
            return;
        }

        // Update level title
        if (this.showingLevelTitle) {
            this.levelTitleTimer -= deltaTime;
            if (this.levelTitleTimer <= 0) {
                this.levelTitleAlpha -= deltaTime * 0.003;
                if (this.levelTitleAlpha <= 0) {
                    this.showingLevelTitle = false;
                    this.levelTitleAlpha = 0;
                }
            }
        }

        // Update player
        Player.update(deltaTime, this.currentLevel);

        // Update particles
        Particles.update();

        // Update current level
        if (this.currentLevel) {
            this.currentLevel.update(deltaTime);
        }
    },

    /**
     * Render game
     */
    render(currentTime) {
        // Clear canvas
        Renderer.clear();

        // Render current level
        if (this.currentLevel) {
            this.currentLevel.render(currentTime);
        }

        // Render level title overlay
        if (this.showingLevelTitle && this.levelTitleAlpha > 0) {
            Renderer.drawLevelTitle(
                `LEVEL ${this.currentLevel.id}`,
                this.currentLevel.name,
                this.levelTitleAlpha
            );
        }
    },

    /**
     * Pause the game
     */
    pause() {
        this.isPaused = true;
    },

    /**
     * Resume the game
     */
    resume() {
        this.isPaused = false;
        this.lastTime = performance.now();
    },

    /**
     * Reset current level
     */
    resetLevel() {
        Particles.clear();
        WireManager.reset();
        GearManager.reset();
        this.currentLevel.init();
    }
};

/**
 * Start the game when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    Game.init();
});
