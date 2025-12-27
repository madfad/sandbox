/**
 * Level 14 - The Master Circuit (Final Level)
 * Multi-device puzzle requiring skills from all previous levels
 * Uses ALL unlocked devices
 */
const Level14 = {
    id: 14,
    name: 'The Master Circuit',
    description: 'Use ALL your devices!',
    dark: false,
    requiredDevice: null, // Multiple devices needed
    playerStart: { x: 60, y: 400 },
    doorPosition: { x: 720, y: 80 },
    bounds: { width: 800, height: 500 },
    gearCount: 3,

    // Combination of puzzles
    iceBlock: { x: 150, y: 350 },
    glassWall: { x: 280, y: 300, frequency: 1 },
    receiver: { x: 450, y: 150 },
    bouncePad: { x: 550, y: 420, targetX: 680, targetY: 100 },

    walls: [
        { x: 0, y: 0, width: 800, height: 32 },
        { x: 0, y: 468, width: 800, height: 32 },
        { x: 0, y: 0, width: 32, height: 500 },
        { x: 768, y: 0, width: 32, height: 60 },
        { x: 768, y: 180, width: 32, height: 320 },
        // Section dividers
        { x: 200, y: 250, width: 32, height: 218 },
        { x: 350, y: 32, width: 32, height: 200 },
        { x: 500, y: 300, width: 268, height: 32 },
        { x: 650, y: 140, width: 118, height: 20 }
    ],

    init() {
        this.door = new Door(this.doorPosition.x, this.doorPosition.y);

        // Initialize individual puzzle elements
        IceManager.init([this.iceBlock]);
        GlassManager.init([this.glassWall]);
        SignalManager.init([this.receiver]);
        BounceManager.init([this.bouncePad]);

        const gearPositions = LevelGenerator.generateGearPositions(this.gearCount, this.walls, this.bounds, [], this.doorPosition, this.playerStart);
        GearManager.init(gearPositions);
        Player.reset(this.playerStart.x, this.playerStart.y);
        Puzzle.init(this);
        document.getElementById('current-level').textContent = `${this.id} - ${this.name}`;

        Player.showMessage('⚡ <strong>THE MASTER CIRCUIT</strong> ⚡ Use ALL your devices! 1️⃣ Melt ice 2️⃣ Shatter glass 3️⃣ Signal receiver 4️⃣ Bounce to exit!');
        return this;
    },

    update(deltaTime) {
        GearManager.update(deltaTime, Player);
        IceManager.update(deltaTime, Player);
        GlassManager.update(deltaTime, Player);
        SignalManager.update(deltaTime, Player);
        BounceManager.update(deltaTime, Player);

        // Check all puzzle stages
        const iceMelted = IceManager.allMelted();
        const glassShattered = GlassManager.allShattered();
        const signalActivated = SignalManager.allActivated();

        // Door opens when all three main puzzles solved
        const puzzleSolved = iceMelted && glassShattered && signalActivated;
        this.door.update(deltaTime, puzzleSolved);

        if (this.door.isPlayerAtDoor(Player)) {
            Puzzle.complete();
            Player.showMessage('🎉 <strong>CONGRATULATIONS!</strong> 🎉 You\'ve mastered all devices and completed CIRCUITRY!');
        }
        Evolution.checkUnlocks(Player);
    },

    render(time) {
        Renderer.drawBackground(this);
        IceManager.render(Renderer.ctx, time);
        GlassManager.render(Renderer.ctx, time);
        SignalManager.render(Renderer.ctx, time);
        BounceManager.render(Renderer.ctx, time);
        GearManager.render(time);
        this.door.render(time);
        Player.render(time);
        Particles.render(Renderer.ctx);
    }
};
