/**
 * Level 4 - The Wind Tunnel
 * Puzzle: Use fan to blow objects onto wind targets
 * Requires FAN device (unlocked at 15 gears)
 */

const Level4 = {
    id: 4,
    name: 'The Wind Tunnel',
    description: 'Use your fan to blow objects to targets',
    dark: false,
    requiredDevice: 'fan',

    // Player start position
    playerStart: { x: 60, y: 240 },

    // Door position
    doorPosition: { x: 720, y: 200 },

    // Canvas bounds
    bounds: { width: 800, height: 500 },

    // Number of gears in this level
    gearCount: 5,

    // Wind object positions (can be blown)
    windObjects: [
        { x: 200, y: 200 },
        { x: 300, y: 380 }
    ],

    // Wind target positions (objects must reach here)
    windTargets: [
        { x: 550, y: 100 },
        { x: 600, y: 400 }
    ],

    // Wall layout - wind tunnel corridors
    walls: [
        // Borders
        { x: 0, y: 0, width: 800, height: 32 },
        { x: 0, y: 468, width: 800, height: 32 },
        { x: 0, y: 0, width: 32, height: 500 },
        { x: 768, y: 0, width: 32, height: 180 },
        { x: 768, y: 300, width: 32, height: 200 },

        // Interior - tunnel walls
        { x: 150, y: 32, width: 32, height: 150 },
        { x: 150, y: 280, width: 32, height: 188 },
        { x: 280, y: 150, width: 200, height: 32 },
        { x: 350, y: 300, width: 32, height: 168 },
        { x: 500, y: 32, width: 32, height: 180 },
        { x: 500, y: 320, width: 32, height: 148 }
    ],

    // Level initialization
    init() {
        console.log('💨 Level 4: Fan Puzzle');

        // Create door
        this.door = new Door(this.doorPosition.x, this.doorPosition.y);

        // Initialize wind puzzle
        WindManager.init(this.windObjects, this.windTargets);

        // Generate random gear positions
        const gearPositions = LevelGenerator.generateGearPositions(
            this.gearCount,
            this.walls,
            this.bounds,
            [...this.windObjects, ...this.windTargets],
            this.doorPosition,
            this.playerStart
        );
        GearManager.init(gearPositions);

        // Reset player
        Player.reset(this.playerStart.x, this.playerStart.y);
        Puzzle.init(this);

        // Update UI
        document.getElementById('current-level').textContent = `${this.id} - ${this.name}`;

        // Show appropriate message
        if (Player.deviceType === 'fan') {
            Player.showMessage('💨 <strong>The Wind Tunnel</strong> - Blow the objects onto the swirl targets!');
        } else if (Evolution.isUnlocked('fan')) {
            Player.showMessage('⚠️ Press <strong>E</strong> to switch to your Fan to solve this puzzle.');
        } else {
            Player.showMessage('⚠️ You need a <strong>Fan</strong> to solve this puzzle! Collect more gears (15 needed).');
        }

        return this;
    },

    // Update level state
    update(deltaTime) {
        GearManager.update(deltaTime, Player);
        WindManager.update(deltaTime, Player, this.walls);

        // Door opens when all wind targets are activated
        const puzzleSolved = WindManager.allTargetsActivated();
        this.door.update(deltaTime, puzzleSolved);

        // Check if player reached door
        if (this.door.isPlayerAtDoor(Player)) {
            Puzzle.complete();
        }

        // Check for device unlocks
        Evolution.checkUnlocks(Player);
    },

    // Render level
    render(time) {
        // Background
        Renderer.drawBackground(this);

        // Render puzzle elements
        WindManager.render(Renderer.ctx, time);
        GearManager.render(time);
        this.door.render(time);
        Player.render(time);

        // Particles
        Particles.render(Renderer.ctx);
    }
};
