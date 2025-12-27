/**
 * Level 11 - The Unstable Ruins
 * Puzzle: Drill through weak walls to create paths
 * Requires DRILL device (unlocked at 50 gears)
 */
const Level11 = {
    id: 11,
    name: 'The Unstable Ruins',
    description: 'Break through weak walls',
    dark: false,
    requiredDevice: 'drill',
    playerStart: { x: 60, y: 220 },
    doorPosition: { x: 720, y: 200 },
    bounds: { width: 800, height: 500 },
    gearCount: 5,

    weakWalls: [
        { x: 200, y: 150, width: 32, height: 80 },
        { x: 400, y: 280, width: 32, height: 80 },
        { x: 550, y: 100, width: 32, height: 80 }
    ],

    walls: [
        { x: 0, y: 0, width: 800, height: 32 },
        { x: 0, y: 468, width: 800, height: 32 },
        { x: 0, y: 0, width: 32, height: 500 },
        { x: 768, y: 0, width: 32, height: 180 },
        { x: 768, y: 300, width: 32, height: 200 },
        // Solid walls creating maze (weak walls fill gaps)
        { x: 200, y: 32, width: 32, height: 118 },
        { x: 200, y: 230, width: 32, height: 238 },
        { x: 400, y: 32, width: 32, height: 248 },
        { x: 400, y: 360, width: 32, height: 108 },
        { x: 550, y: 32, width: 32, height: 68 },
        { x: 550, y: 180, width: 32, height: 288 }
    ],

    init() {
        this.door = new Door(this.doorPosition.x, this.doorPosition.y);
        DrillManager.init(this.weakWalls);
        const gearPositions = LevelGenerator.generateGearPositions(this.gearCount, [...this.walls, ...this.weakWalls], this.bounds, [], this.doorPosition, this.playerStart);
        GearManager.init(gearPositions);
        Player.reset(this.playerStart.x, this.playerStart.y);
        Puzzle.init(this);
        document.getElementById('current-level').textContent = `${this.id} - ${this.name}`;

        if (Player.deviceType === 'drill') {
            Player.showMessage('🔧 <strong>The Unstable Ruins</strong> - Get close to cracked walls (⚠) to drill through them!');
        } else if (Evolution.isUnlocked('drill')) {
            Player.showMessage('⚠️ Press <strong>E</strong> to switch to your Drill.');
        } else {
            Player.showMessage('⚠️ You need a <strong>Drill</strong> (50 gears) to solve this!');
        }
        return this;
    },

    update(deltaTime) {
        GearManager.update(deltaTime, Player);
        DrillManager.update(deltaTime, Player);
        // Door opens when at least one wall is destroyed (path cleared)
        const puzzleSolved = DrillManager.walls.some(w => w.isDestroyed);
        this.door.update(deltaTime, puzzleSolved);
        if (this.door.isPlayerAtDoor(Player)) Puzzle.complete();
        Evolution.checkUnlocks(Player);
    },

    render(time) {
        Renderer.drawBackground(this);
        DrillManager.render(Renderer.ctx, time);
        GearManager.render(time);
        this.door.render(time);
        Player.render(time);
        Particles.render(Renderer.ctx);
    }
};
