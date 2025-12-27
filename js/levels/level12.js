/**
 * Level 12 - The Power Grid
 * Puzzle: Power platforms temporarily with battery
 * Requires BATTERY device (unlocked at 55 gears)
 */
const Level12 = {
    id: 12,
    name: 'The Power Grid',
    description: 'Power platforms to activate them',
    dark: false,
    requiredDevice: 'battery',
    playerStart: { x: 60, y: 220 },
    doorPosition: { x: 720, y: 200 },
    bounds: { width: 800, height: 500 },
    gearCount: 5,

    powerPlatforms: [
        { x: 200, y: 150, requiredPower: 30 },
        { x: 400, y: 300, requiredPower: 40 },
        { x: 550, y: 180, requiredPower: 50 }
    ],

    walls: [
        { x: 0, y: 0, width: 800, height: 32 },
        { x: 0, y: 468, width: 800, height: 32 },
        { x: 0, y: 0, width: 32, height: 500 },
        { x: 768, y: 0, width: 32, height: 180 },
        { x: 768, y: 300, width: 32, height: 200 },
        { x: 150, y: 32, width: 32, height: 180 },
        { x: 150, y: 320, width: 32, height: 148 },
        { x: 350, y: 150, width: 32, height: 200 },
        { x: 500, y: 32, width: 32, height: 150 },
        { x: 500, y: 280, width: 32, height: 188 }
    ],

    init() {
        this.door = new Door(this.doorPosition.x, this.doorPosition.y);
        PowerManager.init(this.powerPlatforms);
        const gearPositions = LevelGenerator.generateGearPositions(this.gearCount, this.walls, this.bounds, this.powerPlatforms, this.doorPosition, this.playerStart);
        GearManager.init(gearPositions);
        Player.reset(this.playerStart.x, this.playerStart.y);
        Puzzle.init(this);
        document.getElementById('current-level').textContent = `${this.id} - ${this.name}`;

        if (Player.deviceType === 'battery') {
            Player.showMessage('🔋 <strong>The Power Grid</strong> - Stand near platforms to charge them. Keep them above the red threshold!');
        } else if (Evolution.isUnlocked('battery')) {
            Player.showMessage('⚠️ Press <strong>E</strong> to switch to your Battery.');
        } else {
            Player.showMessage('⚠️ You need a <strong>Battery</strong> (55 gears) to solve this!');
        }
        return this;
    },

    update(deltaTime) {
        GearManager.update(deltaTime, Player);
        PowerManager.update(deltaTime, Player);
        const puzzleSolved = PowerManager.allActivated();
        this.door.update(deltaTime, puzzleSolved);
        if (this.door.isPlayerAtDoor(Player)) Puzzle.complete();
        Evolution.checkUnlocks(Player);
    },

    render(time) {
        Renderer.drawBackground(this);
        PowerManager.render(Renderer.ctx, time);
        GearManager.render(time);
        this.door.render(time);
        Player.render(time);
        Particles.render(Renderer.ctx);
    }
};
