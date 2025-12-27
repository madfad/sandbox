/**
 * Level 8 - The Signal Tower
 * Puzzle: Send signals through walls to activate receivers
 * Requires ANTENNA device (unlocked at 35 gears)
 */
const Level8 = {
    id: 8,
    name: 'The Signal Tower',
    description: 'Send signals through walls',
    dark: false,
    requiredDevice: 'antenna',
    playerStart: { x: 60, y: 220 },
    doorPosition: { x: 720, y: 200 },
    bounds: { width: 800, height: 500 },
    gearCount: 5,

    receivers: [
        { x: 250, y: 100 },
        { x: 450, y: 300 },
        { x: 600, y: 150 }
    ],

    walls: [
        { x: 0, y: 0, width: 800, height: 32 },
        { x: 0, y: 468, width: 800, height: 32 },
        { x: 0, y: 0, width: 32, height: 500 },
        { x: 768, y: 0, width: 32, height: 180 },
        { x: 768, y: 300, width: 32, height: 200 },
        // Walls that block movement but not signals
        { x: 180, y: 32, width: 32, height: 200 },
        { x: 180, y: 320, width: 32, height: 148 },
        { x: 350, y: 150, width: 32, height: 200 },
        { x: 520, y: 32, width: 32, height: 150 },
        { x: 520, y: 280, width: 32, height: 188 }
    ],

    init() {
        this.door = new Door(this.doorPosition.x, this.doorPosition.y);
        SignalManager.init(this.receivers);
        const gearPositions = LevelGenerator.generateGearPositions(this.gearCount, this.walls, this.bounds, this.receivers, this.doorPosition, this.playerStart);
        GearManager.init(gearPositions);
        Player.reset(this.playerStart.x, this.playerStart.y);
        Puzzle.init(this);
        document.getElementById('current-level').textContent = `${this.id} - ${this.name}`;

        if (Player.deviceType === 'antenna') {
            Player.showMessage('📡 <strong>The Signal Tower</strong> - Your signal passes through walls! Activate all receivers.');
        } else if (Evolution.isUnlocked('antenna')) {
            Player.showMessage('⚠️ Press <strong>E</strong> to switch to your Antenna.');
        } else {
            Player.showMessage('⚠️ You need an <strong>Antenna</strong> (35 gears) to solve this!');
        }
        return this;
    },

    update(deltaTime) {
        GearManager.update(deltaTime, Player);
        SignalManager.update(deltaTime, Player);
        const puzzleSolved = SignalManager.allActivated();
        this.door.update(deltaTime, puzzleSolved);
        if (this.door.isPlayerAtDoor(Player)) Puzzle.complete();
        Evolution.checkUnlocks(Player);
    },

    render(time) {
        Renderer.drawBackground(this);
        SignalManager.render(Renderer.ctx, time);
        GearManager.render(time);
        this.door.render(time);
        Player.render(time);
        Particles.render(Renderer.ctx);
    }
};
