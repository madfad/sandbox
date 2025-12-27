/**
 * Level 13 - The Time Vault
 * Puzzle: Slow down hazards with stopwatch to pass safely
 * Requires STOPWATCH device (unlocked at 60 gears)
 */
const Level13 = {
    id: 13,
    name: 'The Time Vault',
    description: 'Slow down hazards to pass',
    dark: false,
    requiredDevice: 'stopwatch',
    playerStart: { x: 60, y: 220 },
    doorPosition: { x: 720, y: 200 },
    bounds: { width: 800, height: 500 },
    gearCount: 5,

    hazards: [
        { x: 250, y: 200, width: 40, height: 40, speed: 3, axis: 'y' },
        { x: 450, y: 150, width: 40, height: 40, speed: 2, axis: 'x' },
        { x: 600, y: 300, width: 40, height: 40, speed: 4, axis: 'y' }
    ],

    walls: [
        { x: 0, y: 0, width: 800, height: 32 },
        { x: 0, y: 468, width: 800, height: 32 },
        { x: 0, y: 0, width: 32, height: 500 },
        { x: 768, y: 0, width: 32, height: 180 },
        { x: 768, y: 300, width: 32, height: 200 },
        { x: 180, y: 100, width: 32, height: 300 },
        { x: 380, y: 32, width: 32, height: 200 },
        { x: 380, y: 320, width: 32, height: 148 },
        { x: 550, y: 150, width: 32, height: 200 }
    ],

    init() {
        this.door = new Door(this.doorPosition.x, this.doorPosition.y);
        HazardManager.init(this.hazards);
        const gearPositions = LevelGenerator.generateGearPositions(this.gearCount, this.walls, this.bounds, this.hazards, this.doorPosition, this.playerStart);
        GearManager.init(gearPositions);
        Player.reset(this.playerStart.x, this.playerStart.y);
        Puzzle.init(this);
        document.getElementById('current-level').textContent = `${this.id} - ${this.name}`;

        if (Player.deviceType === 'stopwatch') {
            Player.showMessage('⏱️ <strong>The Time Vault</strong> - Get close to hazards to slow them down (they turn blue). Avoid the spinning blades!');
        } else if (Evolution.isUnlocked('stopwatch')) {
            Player.showMessage('⚠️ Press <strong>E</strong> to switch to your Stopwatch.');
        } else {
            Player.showMessage('⚠️ You need a <strong>Stopwatch</strong> (60 gears) to solve this!');
        }
        return this;
    },

    update(deltaTime) {
        GearManager.update(deltaTime, Player);
        HazardManager.update(deltaTime, Player);

        // Check hazard collision - reset player if hit
        if (HazardManager.checkCollisions(Player)) {
            Player.x = this.playerStart.x;
            Player.y = this.playerStart.y;
            Player.showMessage('💥 Hit by hazard! Be careful - slow them down first!');
        }

        // Door is always open, just reach it safely
        this.door.update(deltaTime, true);
        if (this.door.isPlayerAtDoor(Player)) Puzzle.complete();
        Evolution.checkUnlocks(Player);
    },

    render(time) {
        Renderer.drawBackground(this);
        HazardManager.render(Renderer.ctx, time);
        GearManager.render(time);
        this.door.render(time);
        Player.render(time);
        Particles.render(Renderer.ctx);
    }
};
