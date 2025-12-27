/**
 * Level 5 - The Frozen Lab
 * Puzzle: Melt ice blocks with heater to clear paths
 * Requires HEATER device (unlocked at 20 gears)
 */
const Level5 = {
    id: 5,
    name: 'The Frozen Lab',
    description: 'Melt ice blocks to clear your path',
    dark: false,
    requiredDevice: 'heater',
    playerStart: { x: 60, y: 220 },
    doorPosition: { x: 720, y: 200 },
    bounds: { width: 800, height: 500 },
    gearCount: 6,

    iceBlocks: [
        { x: 200, y: 180 },
        { x: 350, y: 300 },
        { x: 500, y: 150 }
    ],

    walls: [
        { x: 0, y: 0, width: 800, height: 32 },
        { x: 0, y: 468, width: 800, height: 32 },
        { x: 0, y: 0, width: 32, height: 500 },
        { x: 768, y: 0, width: 32, height: 180 },
        { x: 768, y: 300, width: 32, height: 200 },
        { x: 150, y: 32, width: 32, height: 150 },
        { x: 150, y: 280, width: 32, height: 188 },
        { x: 400, y: 100, width: 32, height: 180 },
        { x: 550, y: 250, width: 218, height: 32 }
    ],

    init() {
        this.door = new Door(this.doorPosition.x, this.doorPosition.y);
        IceManager.init(this.iceBlocks);
        const gearPositions = LevelGenerator.generateGearPositions(this.gearCount, this.walls, this.bounds, this.iceBlocks, this.doorPosition, this.playerStart);
        GearManager.init(gearPositions);
        Player.reset(this.playerStart.x, this.playerStart.y);
        Puzzle.init(this);
        document.getElementById('current-level').textContent = `${this.id} - ${this.name}`;

        if (Player.deviceType === 'heater') {
            Player.showMessage('🔥 <strong>The Frozen Lab</strong> - Get close to ice blocks to melt them!');
        } else if (Evolution.isUnlocked('heater')) {
            Player.showMessage('⚠️ Press <strong>E</strong> to switch to your Heater.');
        } else {
            Player.showMessage('⚠️ You need a <strong>Heater</strong> (20 gears) to solve this!');
        }
        return this;
    },

    update(deltaTime) {
        GearManager.update(deltaTime, Player);
        IceManager.update(deltaTime, Player);
        const puzzleSolved = IceManager.allMelted();
        this.door.update(deltaTime, puzzleSolved);
        if (this.door.isPlayerAtDoor(Player)) Puzzle.complete();
        Evolution.checkUnlocks(Player);
    },

    render(time) {
        Renderer.drawBackground(this);
        IceManager.render(Renderer.ctx, time);
        GearManager.render(time);
        this.door.render(time);
        Player.render(time);
        Particles.render(Renderer.ctx);
    }
};
