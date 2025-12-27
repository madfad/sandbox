/**
 * Level 1 - The Workshop
 * Tutorial level teaching basic mechanics
 * Uses random placement for gears and wires
 */

const Level1 = {
    id: 1,
    name: 'The Workshop',
    description: 'Learn the basics of wire connection',
    dark: false,

    // Player start position (in open area left side)
    playerStart: { x: 80, y: 240 },

    // Door position (level exit - right side in gap)
    doorPosition: { x: 720, y: 200 },

    // Canvas bounds for generation
    bounds: { width: 800, height: 500 },

    // Number of gears to generate
    gearCount: 5,

    // Wall layout - fixed walls, objects are randomized around them
    walls: [
        // Border walls
        { x: 0, y: 0, width: 800, height: 32 },      // Top
        { x: 0, y: 468, width: 800, height: 32 },    // Bottom
        { x: 0, y: 0, width: 32, height: 500 },      // Left
        { x: 768, y: 0, width: 32, height: 180 },    // Right top (door gap at 180-300)
        { x: 768, y: 300, width: 32, height: 200 },  // Right bottom

        // Interior obstacles - creating interesting but navigable paths
        { x: 200, y: 32, width: 32, height: 120 },   // Vertical wall from top
        { x: 200, y: 200, width: 180, height: 32 },  // Horizontal wall mid-left
        { x: 350, y: 32, width: 32, height: 168 },   // Vertical wall creating corridor
        { x: 450, y: 150, width: 32, height: 150 },  // Center vertical wall
        { x: 200, y: 350, width: 200, height: 32 },  // Bottom horizontal wall
        { x: 550, y: 250, width: 150, height: 32 }   // Right side horizontal
    ],

    // Level initialization - generates random positions each time
    init() {
        console.log('🎲 Generating random positions for Level 1...');

        // Generate random wire positions
        this.wires = LevelGenerator.generateWirePositions(
            this.walls,
            this.bounds,
            50  // margin
        );

        // Generate random gear positions (avoiding wires, door, player)
        const gearPositions = LevelGenerator.generateGearPositions(
            this.gearCount,
            this.walls,
            this.bounds,
            this.wires,
            this.doorPosition,
            this.playerStart
        );
        this.gears = gearPositions;

        console.log('  Wires:', this.wires);
        console.log('  Gears:', this.gears);

        // Create door
        this.door = new Door(this.doorPosition.x, this.doorPosition.y);

        // Initialize subsystems with generated positions
        WireManager.init(this.wires);
        GearManager.init(this.gears);
        Player.reset(this.playerStart.x, this.playerStart.y);
        Puzzle.init(this);

        // Update UI
        document.getElementById('current-level').textContent = `${this.id} - ${this.name}`;
        Player.showMessage('Welcome to <strong>The Workshop</strong>! Use WASD or Arrow Keys to move. Find the wire ends and connect them!');

        return this;
    },

    // Update level state
    update(deltaTime) {
        WireManager.update(deltaTime, Player);
        GearManager.update(deltaTime, Player);
        this.door.update(deltaTime, Player.isCircuitComplete());
        Puzzle.update(Player, this.door);

        // Check for new device unlocks
        Evolution.checkUnlocks(Player);
    },

    // Render level
    render(time) {
        // Background
        Renderer.drawBackground(this);

        // Wire connections (drawn first, behind entities)
        WireManager.renderConnections(Player, time);

        // Entities
        WireManager.render(time);
        GearManager.render(time);
        this.door.render(time);
        Player.render(time);

        // Particles on top
        Particles.render(Renderer.ctx);
    }
};
