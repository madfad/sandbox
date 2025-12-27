/**
 * Level 2 - The Dark Storage
 * Puzzle: Shine flashlight beam through BOTH mirrors to open the door
 * Requires FLASHLIGHT device (unlocked at 5 gears)
 */

const Level2 = {
    id: 2,
    name: 'The Dark Storage',
    description: 'Redirect light beams through all mirrors',
    dark: true,
    requiredDevice: 'flashlight',

    // Player start position
    playerStart: { x: 60, y: 250 },

    // Door position
    doorPosition: { x: 720, y: 200 },

    // Canvas bounds
    bounds: { width: 800, height: 500 },

    // Number of gears in this level
    gearCount: 6,

    // Mirror positions and angles
    // Player must position to hit Mirror 1, which reflects to Mirror 2
    mirrors: [
        { x: 250, y: 180, angle: Math.PI / 4 },      // Mirror 1: 45 degree angle
        { x: 480, y: 280, angle: -Math.PI / 6 }      // Mirror 2: -30 degree angle
    ],

    // Wall layout - simple for dark navigation
    walls: [
        // Borders
        { x: 0, y: 0, width: 800, height: 32 },
        { x: 0, y: 468, width: 800, height: 32 },
        { x: 0, y: 0, width: 32, height: 500 },
        { x: 768, y: 0, width: 32, height: 180 },
        { x: 768, y: 300, width: 32, height: 200 },

        // Interior walls - create zones
        { x: 180, y: 32, width: 32, height: 120 },
        { x: 180, y: 250, width: 32, height: 218 },
        { x: 380, y: 100, width: 32, height: 150 },
        { x: 380, y: 350, width: 32, height: 118 },
        { x: 550, y: 32, width: 32, height: 180 },
        { x: 550, y: 320, width: 32, height: 148 }
    ],

    // Level initialization
    init() {
        console.log('🔦 Level 2: Mirror Beam Puzzle');

        // Create door
        this.door = new Door(this.doorPosition.x, this.doorPosition.y);

        // Initialize beam system with mirrors only (no receiver)
        BeamManager.init(this.mirrors);

        // Generate random gear positions
        const avoidAreas = this.mirrors.map(m => ({ x: m.x, y: m.y }));
        const gearPositions = LevelGenerator.generateGearPositions(
            this.gearCount,
            this.walls,
            this.bounds,
            avoidAreas,
            this.doorPosition,
            this.playerStart
        );
        GearManager.init(gearPositions);

        // Reset player for this level
        Player.reset(this.playerStart.x, this.playerStart.y);
        Puzzle.init(this);

        // Update UI
        document.getElementById('current-level').textContent = `${this.id} - ${this.name}`;

        // Show appropriate message
        if (Player.deviceType === 'flashlight') {
            Player.showMessage('🔦 <strong>The Dark Storage</strong> - Position yourself to shine light through BOTH mirrors!');
        } else if (Evolution.isUnlocked('flashlight')) {
            Player.showMessage('⚠️ It\'s dark! Press <strong>E</strong> to switch to Flashlight.');
        } else {
            Player.showMessage('⚠️ You need a <strong>Flashlight</strong> (5 gears) to solve this!');
        }

        return this;
    },

    // Update level state
    update(deltaTime) {
        GearManager.update(deltaTime, Player);
        BeamManager.update(deltaTime, Player);

        // Door opens when all mirrors are hit by the beam chain
        const puzzleSolved = BeamManager.isComplete();
        this.door.update(deltaTime, puzzleSolved);

        // Check if player reached door (door.isPlayerAtDoor checks isOpen internally)
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

        // Render beam system (mirrors and beam)
        BeamManager.render(Renderer.ctx, time);

        // Other entities
        GearManager.render(time);
        this.door.render(time);
        Player.render(time);

        // Apply darkness overlay - but illuminate beam path
        this.renderDarknessWithBeam(time);

        // Particles
        Particles.render(Renderer.ctx);
    },

    /**
     * Custom darkness rendering that lights up the beam path
     */
    renderDarknessWithBeam(time) {
        const ctx = Renderer.ctx;
        const player = Player;

        // Create offscreen canvas for darkness
        if (!this.darknessCanvas) {
            this.darknessCanvas = document.createElement('canvas');
            this.darknessCanvas.width = 800;
            this.darknessCanvas.height = 500;
            this.darknessCtx = this.darknessCanvas.getContext('2d');
        }

        const dCtx = this.darknessCtx;
        const playerCenterX = player.x + player.width / 2;
        const playerCenterY = player.y + player.height / 2;

        // Fill with darkness
        dCtx.fillStyle = 'rgba(5, 5, 15, 0.95)';
        dCtx.fillRect(0, 0, 800, 500);

        // Cut out light areas using destination-out
        dCtx.globalCompositeOperation = 'destination-out';

        // Flashlight illumination around player
        if (player.deviceType === 'flashlight') {
            const lightRadius = 160;
            const gradient = dCtx.createRadialGradient(
                playerCenterX, playerCenterY, 0,
                playerCenterX, playerCenterY, lightRadius
            );
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.9)');
            gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.5)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            dCtx.fillStyle = gradient;
            dCtx.beginPath();
            dCtx.arc(playerCenterX, playerCenterY, lightRadius, 0, Math.PI * 2);
            dCtx.fill();

            // Illuminate along beam path
            const beamPath = BeamManager.getBeamPath();
            if (beamPath.length >= 2) {
                for (let i = 0; i < beamPath.length - 1; i++) {
                    const p1 = beamPath[i];
                    const p2 = beamPath[i + 1];

                    // Draw glow along beam segment
                    const dx = p2.x - p1.x;
                    const dy = p2.y - p1.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const steps = Math.ceil(dist / 25);

                    for (let j = 0; j <= steps; j++) {
                        const t = j / steps;
                        const x = p1.x + dx * t;
                        const y = p1.y + dy * t;

                        const beamGlow = dCtx.createRadialGradient(x, y, 0, x, y, 70);
                        beamGlow.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
                        beamGlow.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
                        beamGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
                        dCtx.fillStyle = beamGlow;
                        dCtx.beginPath();
                        dCtx.arc(x, y, 70, 0, Math.PI * 2);
                        dCtx.fill();
                    }
                }

                // Extra glow around mirrors
                BeamManager.mirrors.forEach(mirror => {
                    if (mirror.isLit) {
                        const mc = mirror.getCenter();
                        const mirrorGlow = dCtx.createRadialGradient(mc.x, mc.y, 0, mc.x, mc.y, 100);
                        mirrorGlow.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
                        mirrorGlow.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
                        mirrorGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
                        dCtx.fillStyle = mirrorGlow;
                        dCtx.beginPath();
                        dCtx.arc(mc.x, mc.y, 100, 0, Math.PI * 2);
                        dCtx.fill();
                    }
                });
            }
        } else {
            // Tiny visibility for non-flashlight
            const gradient = dCtx.createRadialGradient(
                playerCenterX, playerCenterY, 0,
                playerCenterX, playerCenterY, 50
            );
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            dCtx.fillStyle = gradient;
            dCtx.beginPath();
            dCtx.arc(playerCenterX, playerCenterY, 50, 0, Math.PI * 2);
            dCtx.fill();
        }

        dCtx.globalCompositeOperation = 'source-over';

        // Draw darkness onto main canvas
        ctx.drawImage(this.darknessCanvas, 0, 0);
    }
};
