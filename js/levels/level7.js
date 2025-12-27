/**
 * Level 7 - The Void Chamber
 * Puzzle: Pull objects towards you with vacuum
 * Requires VACUUM device (unlocked at 30 gears)
 */
const Level7 = {
    id: 7,
    name: 'The Void Chamber',
    description: 'Pull objects towards you',
    dark: false,
    requiredDevice: 'vacuum',
    playerStart: { x: 60, y: 220 },
    doorPosition: { x: 720, y: 200 },
    bounds: { width: 800, height: 500 },
    gearCount: 6,

    vacuumObjects: [
        { x: 600, y: 100 },
        { x: 650, y: 380 }
    ],

    vacuumTargets: [
        { x: 150, y: 120 },
        { x: 180, y: 350 }
    ],

    walls: [
        { x: 0, y: 0, width: 800, height: 32 },
        { x: 0, y: 468, width: 800, height: 32 },
        { x: 0, y: 0, width: 32, height: 500 },
        { x: 768, y: 0, width: 32, height: 180 },
        { x: 768, y: 300, width: 32, height: 200 },
        { x: 280, y: 32, width: 32, height: 180 },
        { x: 280, y: 300, width: 32, height: 168 },
        { x: 500, y: 150, width: 32, height: 200 }
    ],

    init() {
        this.door = new Door(this.doorPosition.x, this.doorPosition.y);
        VacuumManager.init(this.vacuumObjects, this.vacuumTargets);
        const gearPositions = LevelGenerator.generateGearPositions(this.gearCount, this.walls, this.bounds, [...this.vacuumObjects, ...this.vacuumTargets], this.doorPosition, this.playerStart);
        GearManager.init(gearPositions);
        Player.reset(this.playerStart.x, this.playerStart.y);
        Puzzle.init(this);
        document.getElementById('current-level').textContent = `${this.id} - ${this.name}`;

        if (Player.deviceType === 'vacuum') {
            Player.showMessage('🌀 <strong>The Void Chamber</strong> - Pull objects towards you onto the targets!');
        } else if (Evolution.isUnlocked('vacuum')) {
            Player.showMessage('⚠️ Press <strong>E</strong> to switch to your Vacuum.');
        } else {
            Player.showMessage('⚠️ You need a <strong>Vacuum</strong> (30 gears) to solve this!');
        }
        return this;
    },

    update(deltaTime) {
        GearManager.update(deltaTime, Player);
        VacuumManager.update(deltaTime, Player, this.walls);
        const puzzleSolved = VacuumManager.allActivated();
        this.door.update(deltaTime, puzzleSolved);
        if (this.door.isPlayerAtDoor(Player)) Puzzle.complete();
        Evolution.checkUnlocks(Player);
    },

    render(time) {
        Renderer.drawBackground(this);
        VacuumManager.render(Renderer.ctx, time);
        GearManager.render(time);
        this.door.render(time);
        Player.render(time);
        Particles.render(Renderer.ctx);
    }
};
