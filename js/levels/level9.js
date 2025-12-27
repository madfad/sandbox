/**
 * Level 9 - The Bounce House
 * Puzzle: Use spring pads to reach distant platforms
 * Requires SPRING device (unlocked at 40 gears)
 */
const Level9 = {
    id: 9,
    name: 'The Bounce House',
    description: 'Bounce to reach distant areas',
    dark: false,
    requiredDevice: 'spring',
    playerStart: { x: 60, y: 400 },
    doorPosition: { x: 720, y: 80 },
    bounds: { width: 800, height: 500 },
    gearCount: 5,

    bouncePads: [
        { x: 100, y: 420, targetX: 280, targetY: 280 },
        { x: 300, y: 300, targetX: 480, targetY: 180 },
        { x: 500, y: 200, targetX: 680, targetY: 80 }
    ],

    walls: [
        { x: 0, y: 0, width: 800, height: 32 },
        { x: 0, y: 468, width: 800, height: 32 },
        { x: 0, y: 0, width: 32, height: 500 },
        { x: 768, y: 0, width: 32, height: 60 },
        { x: 768, y: 180, width: 32, height: 320 },
        // Platforms
        { x: 250, y: 320, width: 120, height: 20 },
        { x: 450, y: 220, width: 120, height: 20 },
        { x: 650, y: 120, width: 118, height: 20 }
    ],

    init() {
        this.door = new Door(this.doorPosition.x, this.doorPosition.y);
        BounceManager.init(this.bouncePads);
        const gearPositions = LevelGenerator.generateGearPositions(this.gearCount, this.walls, this.bounds, this.bouncePads, this.doorPosition, this.playerStart);
        GearManager.init(gearPositions);
        Player.reset(this.playerStart.x, this.playerStart.y);
        Puzzle.init(this);
        document.getElementById('current-level').textContent = `${this.id} - ${this.name}`;

        if (Player.deviceType === 'spring') {
            Player.showMessage('🏀 <strong>The Bounce House</strong> - Step on spring pads to bounce to the next platform!');
        } else if (Evolution.isUnlocked('spring')) {
            Player.showMessage('⚠️ Press <strong>E</strong> to switch to your Spring.');
        } else {
            Player.showMessage('⚠️ You need a <strong>Spring</strong> (40 gears) to solve this!');
        }
        return this;
    },

    update(deltaTime) {
        GearManager.update(deltaTime, Player);
        BounceManager.update(deltaTime, Player);
        // Door is always reachable once you bounce up
        this.door.update(deltaTime, true);
        if (this.door.isPlayerAtDoor(Player)) Puzzle.complete();
        Evolution.checkUnlocks(Player);
    },

    render(time) {
        Renderer.drawBackground(this);
        BounceManager.render(Renderer.ctx, time);
        GearManager.render(time);
        this.door.render(time);
        Player.render(time);
        Particles.render(Renderer.ctx);
    }
};
