/**
 * Level 6 - The Glass Gallery
 * Puzzle: Shatter glass walls with speaker at right frequencies
 * Requires SPEAKER device (unlocked at 25 gears)
 */
const Level6 = {
    id: 6,
    name: 'The Glass Gallery',
    description: 'Shatter glass with the right frequency',
    dark: false,
    requiredDevice: 'speaker',
    playerStart: { x: 60, y: 220 },
    doorPosition: { x: 720, y: 200 },
    bounds: { width: 800, height: 500 },
    gearCount: 6,

    glassWalls: [
        { x: 200, y: 150, frequency: 1 },  // Close range
        { x: 400, y: 200, frequency: 2 },  // Medium range
        { x: 550, y: 280, frequency: 3 }   // Far range
    ],

    walls: [
        { x: 0, y: 0, width: 800, height: 32 },
        { x: 0, y: 468, width: 800, height: 32 },
        { x: 0, y: 0, width: 32, height: 500 },
        { x: 768, y: 0, width: 32, height: 180 },
        { x: 768, y: 300, width: 32, height: 200 },
        { x: 150, y: 32, width: 32, height: 180 },
        { x: 150, y: 320, width: 32, height: 148 },
        { x: 350, y: 100, width: 32, height: 150 },
        { x: 500, y: 350, width: 268, height: 32 }
    ],

    init() {
        this.door = new Door(this.doorPosition.x, this.doorPosition.y);
        GlassManager.init(this.glassWalls);
        const gearPositions = LevelGenerator.generateGearPositions(this.gearCount, this.walls, this.bounds, this.glassWalls, this.doorPosition, this.playerStart);
        GearManager.init(gearPositions);
        Player.reset(this.playerStart.x, this.playerStart.y);
        Puzzle.init(this);
        document.getElementById('current-level').textContent = `${this.id} - ${this.name}`;

        if (Player.deviceType === 'speaker') {
            Player.showMessage('🔊 <strong>The Glass Gallery</strong> - Different distances = different frequencies. Match the color!');
        } else if (Evolution.isUnlocked('speaker')) {
            Player.showMessage('⚠️ Press <strong>E</strong> to switch to your Speaker.');
        } else {
            Player.showMessage('⚠️ You need a <strong>Speaker</strong> (25 gears) to solve this!');
        }
        return this;
    },

    update(deltaTime) {
        GearManager.update(deltaTime, Player);
        GlassManager.update(deltaTime, Player);
        const puzzleSolved = GlassManager.allShattered();
        this.door.update(deltaTime, puzzleSolved);
        if (this.door.isPlayerAtDoor(Player)) Puzzle.complete();
        Evolution.checkUnlocks(Player);
    },

    render(time) {
        Renderer.drawBackground(this);
        GlassManager.render(Renderer.ctx, time);
        GearManager.render(time);
        this.door.render(time);
        Player.render(time);
        Particles.render(Renderer.ctx);
    }
};
