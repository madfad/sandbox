/**
 * Level 10 - The Laser Grid
 * Puzzle: Aim laser at sensors to activate them
 * Requires LASER device (unlocked at 45 gears)
 */
const Level10 = {
    id: 10,
    name: 'The Laser Grid',
    description: 'Aim precisely at sensors',
    dark: false,
    requiredDevice: 'laser',
    playerStart: { x: 60, y: 220 },
    doorPosition: { x: 720, y: 200 },
    bounds: { width: 800, height: 500 },
    gearCount: 5,

    sensors: [
        { x: 200, y: 80 },
        { x: 400, y: 400 },
        { x: 600, y: 120 },
        { x: 550, y: 350 }
    ],

    walls: [
        { x: 0, y: 0, width: 800, height: 32 },
        { x: 0, y: 468, width: 800, height: 32 },
        { x: 0, y: 0, width: 32, height: 500 },
        { x: 768, y: 0, width: 32, height: 180 },
        { x: 768, y: 300, width: 32, height: 200 },
        { x: 150, y: 150, width: 32, height: 200 },
        { x: 300, y: 32, width: 32, height: 150 },
        { x: 450, y: 280, width: 32, height: 188 }
    ],

    init() {
        this.door = new Door(this.doorPosition.x, this.doorPosition.y);
        LaserManager.init(this.sensors);
        const gearPositions = LevelGenerator.generateGearPositions(this.gearCount, this.walls, this.bounds, this.sensors, this.doorPosition, this.playerStart);
        GearManager.init(gearPositions);
        Player.reset(this.playerStart.x, this.playerStart.y);
        Puzzle.init(this);
        document.getElementById('current-level').textContent = `${this.id} - ${this.name}`;

        if (Player.deviceType === 'laser') {
            Player.showMessage('🔴 <strong>The Laser Grid</strong> - Get within range of all sensors to activate them!');
        } else if (Evolution.isUnlocked('laser')) {
            Player.showMessage('⚠️ Press <strong>E</strong> to switch to your Laser.');
        } else {
            Player.showMessage('⚠️ You need a <strong>Laser</strong> (45 gears) to solve this!');
        }
        return this;
    },

    update(deltaTime) {
        GearManager.update(deltaTime, Player);
        LaserManager.update(deltaTime, Player);
        const puzzleSolved = LaserManager.allActivated();
        this.door.update(deltaTime, puzzleSolved);
        if (this.door.isPlayerAtDoor(Player)) Puzzle.complete();
        Evolution.checkUnlocks(Player);
    },

    render(time) {
        Renderer.drawBackground(this);
        LaserManager.render(Renderer.ctx, time, Player);
        GearManager.render(time);
        this.door.render(time);
        Player.render(time);
        Particles.render(Renderer.ctx);
    }
};
