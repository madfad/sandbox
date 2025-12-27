/**
 * Level 3 - The Metal Factory
 * Puzzle: Use magnet to pull metal crates onto pressure plates
 * Requires MAGNET device (unlocked at 10 gears)
 */

const Level3 = {
    id: 3,
    name: 'The Metal Factory',
    description: 'Use your magnet to move crates onto plates',
    dark: false,
    requiredDevice: 'magnet',

    // Player start position
    playerStart: { x: 60, y: 220 },

    // Door position
    doorPosition: { x: 720, y: 200 },

    // Canvas bounds
    bounds: { width: 800, height: 500 },

    // Number of gears in this level
    gearCount: 6,

    // Number of crates and plates
    crateCount: 2,

    // Pressure plate positions (fixed positions in open areas)
    pressurePlates: [
        { x: 550, y: 100 },
        { x: 600, y: 380 }
    ],

    // Wall layout
    walls: [
        // Borders
        { x: 0, y: 0, width: 800, height: 32 },
        { x: 0, y: 468, width: 800, height: 32 },
        { x: 0, y: 0, width: 32, height: 500 },
        { x: 768, y: 0, width: 32, height: 180 },
        { x: 768, y: 300, width: 32, height: 200 },

        // Interior walls - factory layout with clear paths
        { x: 200, y: 32, width: 32, height: 150 },
        { x: 200, y: 280, width: 32, height: 188 },
        { x: 400, y: 100, width: 32, height: 200 },
        { x: 400, y: 380, width: 32, height: 88 },
        { x: 550, y: 200, width: 32, height: 150 }
    ],

    // Level initialization
    init() {
        console.log('🧲 Level 3: Magnet Puzzle');

        // Create door
        this.door = new Door(this.doorPosition.x, this.doorPosition.y);

        // Generate random crate positions using LevelGenerator (avoids walls!)
        const cratePositions = LevelGenerator.generatePositions(
            this.crateCount,
            this.walls,
            this.bounds,
            40,  // crate size
            50,  // margin from walls
            [...this.pressurePlates, this.doorPosition, this.playerStart]  // avoid these
        );

        // Initialize crate puzzle with generated positions
        CrateManager.init(
            cratePositions.map(p => ({ x: p.x, y: p.y })),
            this.pressurePlates
        );

        // Generate random gear positions
        const gearPositions = LevelGenerator.generateGearPositions(
            this.gearCount,
            this.walls,
            this.bounds,
            [...cratePositions, ...this.pressurePlates],
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
        if (Player.deviceType === 'magnet') {
            Player.showMessage('🧲 <strong>The Metal Factory</strong> - Get close to metal crates to pull them onto the pressure plates!');
        } else if (Evolution.isUnlocked('magnet')) {
            Player.showMessage('⚠️ Press <strong>E</strong> to switch to your Magnet to solve this puzzle.');
        } else {
            Player.showMessage('⚠️ You need a <strong>Magnet</strong> (10 gears) to solve this puzzle!');
        }

        return this;
    },

    // Update level state
    update(deltaTime) {
        GearManager.update(deltaTime, Player);
        CrateManager.update(deltaTime, Player, this.walls);

        // Door opens when all pressure plates are activated
        const puzzleSolved = CrateManager.allPlatesActivated();
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
        CrateManager.render(Renderer.ctx, time);
        GearManager.render(time);
        this.door.render(time);
        Player.render(time);

        // Particles
        Particles.render(Renderer.ctx);
    }
};
