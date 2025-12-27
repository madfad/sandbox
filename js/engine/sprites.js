/**
 * Sprites Module - Programmatic Pixel Art Generation
 * Creates all game sprites using Canvas API
 */

const Sprites = {
    cache: {},

    /**
     * Initialize and pre-render all sprites
     */
    init() {
        // Original devices
        this.cache.lightSwitch = this.createLightSwitch();
        this.cache.lightSwitchOn = this.createLightSwitch(true);
        this.cache.flashlight = this.createFlashlight();
        this.cache.flashlightBeam = this.createFlashlightBeam();
        this.cache.magnet = this.createMagnet();
        this.cache.fan = this.createFan();

        // New devices
        this.cache.heater = this.createHeater();
        this.cache.speaker = this.createSpeaker();
        this.cache.vacuum = this.createVacuum();
        this.cache.antenna = this.createAntenna();
        this.cache.spring = this.createSpring();
        this.cache.laser = this.createLaser();
        this.cache.drill = this.createDrill();
        this.cache.battery = this.createBattery();
        this.cache.stopwatch = this.createStopwatch();

        // Collectibles and environment
        this.cache.gear = this.createGear();
        this.cache.gearGlow = this.createGear(true);
        this.cache.wireEnd = this.createWireEnd();
        this.cache.wireEndActive = this.createWireEnd(true);
        this.cache.wireConnected = this.createWireEnd(true, true);
        this.cache.door = this.createDoor();
        this.cache.doorOpen = this.createDoor(true);
        this.cache.floorTile = this.createFloorTile();
        this.cache.wallTile = this.createWallTile();
        this.cache.spark = this.createSpark();
        this.cache.metalCrate = this.createMetalCrate();
        this.cache.windParticle = this.createWindParticle();

        // New puzzle elements
        this.cache.iceBlock = this.createIceBlock();
        this.cache.glassWall = this.createGlassWall();

        console.log('✨ Sprites initialized (13 devices + puzzle elements)');
    },

    /**
     * Create a temporary canvas for drawing sprites
     */
    createCanvas(width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas;
    },

    /**
     * Light Switch Sprite - 48x48 friendly toggle switch
     */
    createLightSwitch(isOn = false) {
        const canvas = this.createCanvas(48, 48);
        const ctx = canvas.getContext('2d');

        // Base plate - rounded rectangle
        ctx.fillStyle = '#e8e8e8';
        ctx.beginPath();
        ctx.roundRect(8, 4, 32, 40, 6);
        ctx.fill();

        // Plate shadow
        ctx.fillStyle = '#c5c5c5';
        ctx.beginPath();
        ctx.roundRect(8, 38, 32, 6, [0, 0, 6, 6]);
        ctx.fill();

        // Inner plate area
        ctx.fillStyle = '#f5f5f5';
        ctx.beginPath();
        ctx.roundRect(12, 8, 24, 28, 4);
        ctx.fill();

        // Toggle switch
        const toggleY = isOn ? 10 : 22;
        const toggleColor = isOn ? '#4ade80' : '#94a3b8';
        const glowColor = isOn ? 'rgba(74, 222, 128, 0.6)' : 'rgba(148, 163, 184, 0.3)';

        // Toggle glow
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 8;
        ctx.fillStyle = toggleColor;
        ctx.beginPath();
        ctx.roundRect(16, toggleY, 16, 12, 3);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Toggle highlight
        ctx.fillStyle = isOn ? '#86efac' : '#cbd5e1';
        ctx.fillRect(17, toggleY + 1, 14, 3);

        // Cute face - eyes
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(18, 41, 2, 0, Math.PI * 2);
        ctx.arc(30, 41, 2, 0, Math.PI * 2);
        ctx.fill();

        // Eye highlights
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(19, 40, 0.8, 0, Math.PI * 2);
        ctx.arc(31, 40, 0.8, 0, Math.PI * 2);
        ctx.fill();

        // Smile
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(24, 40, 4, 0.2, Math.PI - 0.2);
        ctx.stroke();

        return canvas;
    },

    /**
     * Flashlight Sprite - 48x48 retro flashlight
     */
    createFlashlight() {
        const canvas = this.createCanvas(48, 48);
        const ctx = canvas.getContext('2d');

        // Body
        const gradient = ctx.createLinearGradient(14, 0, 34, 0);
        gradient.addColorStop(0, '#fbbf24');
        gradient.addColorStop(0.5, '#fcd34d');
        gradient.addColorStop(1, '#f59e0b');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(14, 16, 20, 28, 4);
        ctx.fill();

        // Handle grip lines
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1;
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(16, 28 + i * 4);
            ctx.lineTo(32, 28 + i * 4);
            ctx.stroke();
        }

        // Head/lens area
        ctx.fillStyle = '#374151';
        ctx.beginPath();
        ctx.roundRect(10, 4, 28, 14, [6, 6, 2, 2]);
        ctx.fill();

        // Lens
        ctx.fillStyle = '#fef3c7';
        ctx.shadowColor = 'rgba(254, 243, 199, 0.8)';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(24, 10, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Lens inner
        ctx.fillStyle = '#fef9c3';
        ctx.beginPath();
        ctx.arc(24, 10, 5, 0, Math.PI * 2);
        ctx.fill();

        // Button
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(24, 24, 3, 0, Math.PI * 2);
        ctx.fill();

        return canvas;
    },

    /**
     * Flashlight Beam - for illumination effect
     */
    createFlashlightBeam() {
        const canvas = this.createCanvas(200, 200);
        const ctx = canvas.getContext('2d');

        const gradient = ctx.createRadialGradient(100, 100, 0, 100, 100, 100);
        gradient.addColorStop(0, 'rgba(254, 243, 199, 0.8)');
        gradient.addColorStop(0.3, 'rgba(254, 243, 199, 0.4)');
        gradient.addColorStop(0.6, 'rgba(254, 243, 199, 0.15)');
        gradient.addColorStop(1, 'rgba(254, 243, 199, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(100, 100, 100, 0, Math.PI * 2);
        ctx.fill();

        return canvas;
    },

    /**
     * Gear/Gizmo Collectible - 32x32 shiny golden gear
     */
    createGear(glowing = false) {
        const canvas = this.createCanvas(32, 32);
        const ctx = canvas.getContext('2d');

        const centerX = 16;
        const centerY = 16;
        const outerRadius = 14;
        const innerRadius = 6;
        const teeth = 8;

        // Glow effect
        if (glowing) {
            ctx.shadowColor = 'rgba(251, 191, 36, 0.8)';
            ctx.shadowBlur = 15;
        }

        // Gear gradient
        const gradient = ctx.createRadialGradient(12, 12, 0, 16, 16, 14);
        gradient.addColorStop(0, '#fef08a');
        gradient.addColorStop(0.5, '#fbbf24');
        gradient.addColorStop(1, '#b45309');
        ctx.fillStyle = gradient;

        // Draw gear teeth
        ctx.beginPath();
        for (let i = 0; i < teeth; i++) {
            const angle = (i / teeth) * Math.PI * 2 - Math.PI / 2;
            const nextAngle = ((i + 0.5) / teeth) * Math.PI * 2 - Math.PI / 2;
            const midAngle = ((i + 0.25) / teeth) * Math.PI * 2 - Math.PI / 2;

            const x1 = centerX + Math.cos(angle) * outerRadius;
            const y1 = centerY + Math.sin(angle) * outerRadius;
            const x2 = centerX + Math.cos(midAngle) * (outerRadius - 3);
            const y2 = centerY + Math.sin(midAngle) * (outerRadius - 3);
            const x3 = centerX + Math.cos(nextAngle) * outerRadius;
            const y3 = centerY + Math.sin(nextAngle) * outerRadius;

            if (i === 0) {
                ctx.moveTo(x1, y1);
            } else {
                ctx.lineTo(x1, y1);
            }
            ctx.lineTo(x2, y2);
            ctx.lineTo(x3, y3);
        }
        ctx.closePath();
        ctx.fill();

        ctx.shadowBlur = 0;

        // Inner circle
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
        ctx.fill();

        // Center hole
        ctx.fillStyle = '#1c1917';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
        ctx.fill();

        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.ellipse(13, 12, 4, 3, -0.5, 0, Math.PI * 2);
        ctx.fill();

        return canvas;
    },

    /**
     * Wire End - 32x32 exposed wire with sparks
     */
    createWireEnd(active = false, connected = false) {
        const canvas = this.createCanvas(32, 32);
        const ctx = canvas.getContext('2d');

        // Wire base
        ctx.fillStyle = '#374151';
        ctx.beginPath();
        ctx.roundRect(4, 12, 24, 8, 2);
        ctx.fill();

        // Copper wire exposed end
        const copperColor = connected ? '#4ade80' : (active ? '#fb923c' : '#c2410c');
        ctx.fillStyle = copperColor;
        ctx.beginPath();
        ctx.arc(24, 16, 6, 0, Math.PI * 2);
        ctx.fill();

        // Wire strands
        ctx.strokeStyle = active ? '#fbbf24' : '#a16207';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(18, 14 + i * 2);
            ctx.lineTo(22, 14 + i * 2);
            ctx.stroke();
        }

        // Sparks when active
        if (active && !connected) {
            ctx.strokeStyle = '#fef08a';
            ctx.lineWidth = 2;
            ctx.shadowColor = 'rgba(254, 240, 138, 0.9)';
            ctx.shadowBlur = 8;

            // Spark lines
            const sparkAngles = [0, 0.8, -0.8, 1.5, -1.5];
            sparkAngles.forEach(angle => {
                ctx.beginPath();
                ctx.moveTo(24, 16);
                ctx.lineTo(24 + Math.cos(angle) * 8, 16 + Math.sin(angle) * 8);
                ctx.stroke();
            });
        }

        // Connected glow
        if (connected) {
            ctx.shadowColor = 'rgba(74, 222, 128, 0.8)';
            ctx.shadowBlur = 12;
            ctx.fillStyle = '#86efac';
            ctx.beginPath();
            ctx.arc(24, 16, 4, 0, Math.PI * 2);
            ctx.fill();
        }

        return canvas;
    },

    /**
     * Door - 48x80 industrial metal door
     */
    createDoor(isOpen = false) {
        const canvas = this.createCanvas(48, 80);
        const ctx = canvas.getContext('2d');

        // Door frame
        ctx.fillStyle = '#1f2937';
        ctx.fillRect(0, 0, 48, 80);

        if (isOpen) {
            // Open door - gap with light
            const gradient = ctx.createLinearGradient(8, 0, 40, 0);
            gradient.addColorStop(0, '#10b981');
            gradient.addColorStop(0.5, '#34d399');
            gradient.addColorStop(1, '#10b981');
            ctx.fillStyle = gradient;
            ctx.fillRect(8, 4, 32, 72);

            // Light rays
            ctx.fillStyle = 'rgba(52, 211, 153, 0.3)';
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.moveTo(24, 40);
                ctx.lineTo(8 + i * 12, 76);
                ctx.lineTo(16 + i * 12, 76);
                ctx.closePath();
                ctx.fill();
            }
        } else {
            // Closed door panel
            const gradient = ctx.createLinearGradient(4, 0, 44, 0);
            gradient.addColorStop(0, '#4b5563');
            gradient.addColorStop(0.5, '#6b7280');
            gradient.addColorStop(1, '#4b5563');
            ctx.fillStyle = gradient;
            ctx.fillRect(4, 4, 40, 72);

            // Circuit patterns
            ctx.strokeStyle = '#374151';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(12, 20);
            ctx.lineTo(36, 20);
            ctx.lineTo(36, 40);
            ctx.lineTo(24, 40);
            ctx.lineTo(24, 60);
            ctx.stroke();

            // Handle
            ctx.fillStyle = '#9ca3af';
            ctx.fillRect(32, 38, 8, 12);

            // Status light
            ctx.fillStyle = '#ef4444';
            ctx.shadowColor = 'rgba(239, 68, 68, 0.8)';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(12, 12, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        return canvas;
    },

    /**
     * Floor Tile - 32x32 industrial metal grate
     */
    createFloorTile() {
        const canvas = this.createCanvas(32, 32);
        const ctx = canvas.getContext('2d');

        // Base
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, 32, 32);

        // Grate pattern
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;

        // Diagonal lines
        for (let i = -32; i < 64; i += 8) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i + 32, 32);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(i + 32, 0);
            ctx.lineTo(i, 32);
            ctx.stroke();
        }

        // Edge highlight
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1;
        ctx.strokeRect(0.5, 0.5, 31, 31);

        return canvas;
    },

    /**
     * Wall Tile - 32x32 industrial metal panels
     */
    createWallTile() {
        const canvas = this.createCanvas(32, 32);
        const ctx = canvas.getContext('2d');

        // Base panel
        const gradient = ctx.createLinearGradient(0, 0, 32, 32);
        gradient.addColorStop(0, '#374151');
        gradient.addColorStop(1, '#1f2937');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 32, 32);

        // Panel border
        ctx.strokeStyle = '#4b5563';
        ctx.lineWidth = 2;
        ctx.strokeRect(2, 2, 28, 28);

        // Rivets
        ctx.fillStyle = '#6b7280';
        const rivetPositions = [[6, 6], [26, 6], [6, 26], [26, 26]];
        rivetPositions.forEach(([x, y]) => {
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
        });

        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.fillRect(2, 2, 28, 2);

        return canvas;
    },

    /**
     * Spark particle - 8x8 for effects
     */
    createSpark() {
        const canvas = this.createCanvas(8, 8);
        const ctx = canvas.getContext('2d');

        const gradient = ctx.createRadialGradient(4, 4, 0, 4, 4, 4);
        gradient.addColorStop(0, '#fef08a');
        gradient.addColorStop(0.5, '#fbbf24');
        gradient.addColorStop(1, 'rgba(251, 191, 36, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(4, 4, 4, 0, Math.PI * 2);
        ctx.fill();

        return canvas;
    },

    /**
     * Magnet Sprite - 48x48 horseshoe magnet
     */
    createMagnet() {
        const canvas = this.createCanvas(48, 48);
        const ctx = canvas.getContext('2d');

        // Magnet body - U shape
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';

        // Red pole
        ctx.strokeStyle = '#ef4444';
        ctx.shadowColor = 'rgba(239, 68, 68, 0.5)';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(12, 8);
        ctx.lineTo(12, 32);
        ctx.quadraticCurveTo(12, 42, 24, 42);
        ctx.stroke();

        // Blue pole
        ctx.strokeStyle = '#3b82f6';
        ctx.shadowColor = 'rgba(59, 130, 246, 0.5)';
        ctx.beginPath();
        ctx.moveTo(36, 8);
        ctx.lineTo(36, 32);
        ctx.quadraticCurveTo(36, 42, 24, 42);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Metal tips
        ctx.fillStyle = '#9ca3af';
        ctx.fillRect(7, 4, 10, 8);
        ctx.fillRect(31, 4, 10, 8);

        // Pole labels
        ctx.font = 'bold 10px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.fillText('N', 12, 24);
        ctx.fillText('S', 36, 24);

        // Magnetic field lines (decorative)
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.arc(24, 10, 20, Math.PI, 0);
        ctx.stroke();
        ctx.setLineDash([]);

        return canvas;
    },

    /**
     * Fan Sprite - 48x48 desk fan
     */
    createFan() {
        const canvas = this.createCanvas(48, 48);
        const ctx = canvas.getContext('2d');

        // Fan cage/frame
        ctx.strokeStyle = '#6b7280';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(24, 24, 20, 0, Math.PI * 2);
        ctx.stroke();

        // Inner cage ring
        ctx.beginPath();
        ctx.arc(24, 24, 14, 0, Math.PI * 2);
        ctx.stroke();

        // Fan blades (3 blades)
        const bladeGradient = ctx.createRadialGradient(24, 24, 0, 24, 24, 12);
        bladeGradient.addColorStop(0, '#00d4ff');
        bladeGradient.addColorStop(1, '#0891b2');
        ctx.fillStyle = bladeGradient;

        for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2 - Math.PI / 2;
            ctx.save();
            ctx.translate(24, 24);
            ctx.rotate(angle);
            ctx.beginPath();
            ctx.ellipse(0, -8, 4, 10, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Center hub
        ctx.fillStyle = '#374151';
        ctx.beginPath();
        ctx.arc(24, 24, 5, 0, Math.PI * 2);
        ctx.fill();

        // Hub highlight
        ctx.fillStyle = '#6b7280';
        ctx.beginPath();
        ctx.arc(24, 24, 3, 0, Math.PI * 2);
        ctx.fill();

        // Base
        ctx.fillStyle = '#4b5563';
        ctx.fillRect(18, 42, 12, 6);

        return canvas;
    },

    /**
     * Metal Crate - 40x40 pushable crate for magnet levels
     */
    createMetalCrate() {
        const canvas = this.createCanvas(40, 40);
        const ctx = canvas.getContext('2d');

        // Main crate body
        const gradient = ctx.createLinearGradient(0, 0, 40, 40);
        gradient.addColorStop(0, '#6b7280');
        gradient.addColorStop(0.5, '#9ca3af');
        gradient.addColorStop(1, '#4b5563');
        ctx.fillStyle = gradient;
        ctx.fillRect(2, 2, 36, 36);

        // Metal edges
        ctx.strokeStyle = '#374151';
        ctx.lineWidth = 2;
        ctx.strokeRect(2, 2, 36, 36);

        // Cross pattern
        ctx.strokeStyle = '#4b5563';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(6, 6);
        ctx.lineTo(34, 34);
        ctx.moveTo(34, 6);
        ctx.lineTo(6, 34);
        ctx.stroke();

        // Corner bolts
        ctx.fillStyle = '#1f2937';
        [[6, 6], [34, 6], [6, 34], [34, 34]].forEach(([x, y]) => {
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        });

        // Magnetic indicator
        ctx.fillStyle = '#a855f7';
        ctx.shadowColor = 'rgba(168, 85, 247, 0.6)';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(20, 20, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        return canvas;
    },

    /**
     * Wind Particle - 12x6 for fan wind effects
     */
    createWindParticle() {
        const canvas = this.createCanvas(12, 6);
        const ctx = canvas.getContext('2d');

        const gradient = ctx.createLinearGradient(0, 3, 12, 3);
        gradient.addColorStop(0, 'rgba(0, 212, 255, 0)');
        gradient.addColorStop(0.5, 'rgba(0, 212, 255, 0.6)');
        gradient.addColorStop(1, 'rgba(0, 212, 255, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(6, 3, 6, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        return canvas;
    },

    /**
     * Heater Sprite - 48x48 space heater with glow
     */
    createHeater() {
        const canvas = this.createCanvas(48, 48);
        const ctx = canvas.getContext('2d');

        // Body
        ctx.fillStyle = '#374151';
        ctx.fillRect(10, 12, 28, 30);

        // Grill
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 2;
        for (let y = 18; y < 36; y += 4) {
            ctx.beginPath();
            ctx.moveTo(14, y);
            ctx.lineTo(34, y);
            ctx.stroke();
        }

        // Glow
        ctx.fillStyle = 'rgba(249, 115, 22, 0.3)';
        ctx.beginPath();
        ctx.arc(24, 24, 18, 0, Math.PI * 2);
        ctx.fill();

        // Base
        ctx.fillStyle = '#1f2937';
        ctx.fillRect(8, 40, 32, 6);

        return canvas;
    },

    /**
     * Speaker Sprite - 48x48 speaker with sound waves
     */
    createSpeaker() {
        const canvas = this.createCanvas(48, 48);
        const ctx = canvas.getContext('2d');

        // Speaker body
        ctx.fillStyle = '#1f2937';
        ctx.fillRect(8, 8, 24, 32);

        // Speaker cone
        ctx.fillStyle = '#374151';
        ctx.beginPath();
        ctx.arc(20, 24, 10, 0, Math.PI * 2);
        ctx.fill();

        // Center
        ctx.fillStyle = '#6b7280';
        ctx.beginPath();
        ctx.arc(20, 24, 4, 0, Math.PI * 2);
        ctx.fill();

        // Sound waves
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 2;
        for (let i = 1; i <= 3; i++) {
            ctx.beginPath();
            ctx.arc(32, 24, 5 * i, -Math.PI / 3, Math.PI / 3);
            ctx.stroke();
        }

        return canvas;
    },

    /**
     * Vacuum Sprite - 48x48 vacuum cleaner
     */
    createVacuum() {
        const canvas = this.createCanvas(48, 48);
        const ctx = canvas.getContext('2d');

        // Body
        ctx.fillStyle = '#7c3aed';
        ctx.beginPath();
        ctx.ellipse(24, 28, 14, 16, 0, 0, Math.PI * 2);
        ctx.fill();

        // Intake
        ctx.fillStyle = '#1f2937';
        ctx.beginPath();
        ctx.arc(24, 10, 8, 0, Math.PI * 2);
        ctx.fill();

        // Suction lines
        ctx.strokeStyle = '#c4b5fd';
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 2]);
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(16 + i * 4, 4);
            ctx.lineTo(24, 10);
            ctx.stroke();
        }
        ctx.setLineDash([]);

        return canvas;
    },

    /**
     * Antenna Sprite - 48x48 radio antenna
     */
    createAntenna() {
        const canvas = this.createCanvas(48, 48);
        const ctx = canvas.getContext('2d');

        // Base
        ctx.fillStyle = '#374151';
        ctx.fillRect(20, 36, 8, 10);

        // Antenna pole
        ctx.fillStyle = '#9ca3af';
        ctx.fillRect(22, 8, 4, 30);

        // Top
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(24, 8, 4, 0, Math.PI * 2);
        ctx.fill();

        // Signal waves
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 2;
        for (let i = 1; i <= 3; i++) {
            ctx.beginPath();
            ctx.arc(24, 8, 6 + i * 5, Math.PI * 0.8, Math.PI * 1.2, true);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(24, 8, 6 + i * 5, Math.PI * 1.8, Math.PI * 0.2, true);
            ctx.stroke();
        }

        return canvas;
    },

    /**
     * Spring Sprite - 48x48 coiled spring
     */
    createSpring() {
        const canvas = this.createCanvas(48, 48);
        const ctx = canvas.getContext('2d');

        // Base plate
        ctx.fillStyle = '#374151';
        ctx.fillRect(12, 40, 24, 6);

        // Spring coils
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        for (let i = 0; i < 5; i++) {
            const y = 35 - i * 6;
            ctx.beginPath();
            ctx.moveTo(14, y);
            ctx.quadraticCurveTo(24, y - 4, 34, y);
            ctx.stroke();
        }

        // Top plate
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(14, 6, 20, 4);

        return canvas;
    },

    /**
     * Laser Sprite - 48x48 laser pointer
     */
    createLaser() {
        const canvas = this.createCanvas(48, 48);
        const ctx = canvas.getContext('2d');

        // Body
        ctx.fillStyle = '#1f2937';
        ctx.fillRect(8, 20, 28, 12);

        // Lens
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(38, 26, 4, 0, Math.PI * 2);
        ctx.fill();

        // Button
        ctx.fillStyle = '#374151';
        ctx.fillRect(18, 18, 8, 4);

        // Beam
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.shadowColor = 'rgba(239, 68, 68, 0.8)';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(42, 26);
        ctx.lineTo(48, 26);
        ctx.stroke();

        return canvas;
    },

    /**
     * Drill Sprite - 48x48 power drill
     */
    createDrill() {
        const canvas = this.createCanvas(48, 48);
        const ctx = canvas.getContext('2d');

        // Body
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(8, 18, 24, 16);

        // Handle
        ctx.fillStyle = '#374151';
        ctx.fillRect(10, 32, 8, 12);

        // Drill bit
        ctx.fillStyle = '#9ca3af';
        ctx.beginPath();
        ctx.moveTo(32, 22);
        ctx.lineTo(46, 26);
        ctx.lineTo(32, 30);
        ctx.closePath();
        ctx.fill();

        // Spiral on bit
        ctx.strokeStyle = '#6b7280';
        ctx.lineWidth = 1;
        for (let x = 34; x < 44; x += 3) {
            ctx.beginPath();
            ctx.moveTo(x, 23);
            ctx.lineTo(x + 2, 29);
            ctx.stroke();
        }

        return canvas;
    },

    /**
     * Battery Sprite - 48x48 power battery
     */
    createBattery() {
        const canvas = this.createCanvas(48, 48);
        const ctx = canvas.getContext('2d');

        // Body
        ctx.fillStyle = '#374151';
        ctx.fillRect(12, 12, 24, 32);

        // Terminal
        ctx.fillStyle = '#9ca3af';
        ctx.fillRect(18, 8, 12, 6);

        // Charge indicator
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(16, 18, 16, 22);

        // Plus symbol
        ctx.fillStyle = '#fff';
        ctx.fillRect(22, 24, 4, 12);
        ctx.fillRect(18, 28, 12, 4);

        return canvas;
    },

    /**
     * Stopwatch Sprite - 48x48 stopwatch
     */
    createStopwatch() {
        const canvas = this.createCanvas(48, 48);
        const ctx = canvas.getContext('2d');

        // Top button
        ctx.fillStyle = '#9ca3af';
        ctx.fillRect(22, 4, 4, 6);

        // Watch body
        ctx.fillStyle = '#1f2937';
        ctx.beginPath();
        ctx.arc(24, 28, 18, 0, Math.PI * 2);
        ctx.fill();

        // Watch face
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(24, 28, 14, 0, Math.PI * 2);
        ctx.fill();

        // Hour marks
        ctx.fillStyle = '#374151';
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
            const x = 24 + Math.cos(angle) * 11;
            const y = 28 + Math.sin(angle) * 11;
            ctx.beginPath();
            ctx.arc(x, y, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Hand
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(24, 28);
        ctx.lineTo(24, 18);
        ctx.stroke();

        // Center
        ctx.fillStyle = '#374151';
        ctx.beginPath();
        ctx.arc(24, 28, 3, 0, Math.PI * 2);
        ctx.fill();

        return canvas;
    },

    /**
     * Ice Block - 40x40 for heater puzzles
     */
    createIceBlock() {
        const canvas = this.createCanvas(40, 40);
        const ctx = canvas.getContext('2d');

        // Main block
        const gradient = ctx.createLinearGradient(0, 0, 40, 40);
        gradient.addColorStop(0, '#bfdbfe');
        gradient.addColorStop(0.5, '#93c5fd');
        gradient.addColorStop(1, '#60a5fa');
        ctx.fillStyle = gradient;
        ctx.fillRect(4, 4, 32, 32);

        // Shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillRect(8, 8, 12, 6);

        // Cracks
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(20, 10);
        ctx.lineTo(28, 18);
        ctx.lineTo(24, 28);
        ctx.stroke();

        return canvas;
    },

    /**
     * Glass Wall - 32x64 for speaker puzzles
     */
    createGlassWall() {
        const canvas = this.createCanvas(32, 64);
        const ctx = canvas.getContext('2d');

        // Glass panel
        ctx.fillStyle = 'rgba(147, 197, 253, 0.4)';
        ctx.fillRect(4, 0, 24, 64);

        // Frame
        ctx.strokeStyle = '#6b7280';
        ctx.lineWidth = 2;
        ctx.strokeRect(4, 0, 24, 64);

        // Shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(8, 4, 4, 56);

        return canvas;
    },

    /**
     * Get a sprite from cache
     */
    get(name) {
        return this.cache[name] || null;
    }
};

// Polyfill for roundRect if needed
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, width, height, radii) {
        if (typeof radii === 'number') {
            radii = [radii, radii, radii, radii];
        } else if (Array.isArray(radii)) {
            while (radii.length < 4) radii.push(radii[0] || 0);
        } else {
            radii = [0, 0, 0, 0];
        }

        const [tl, tr, br, bl] = radii;

        this.moveTo(x + tl, y);
        this.lineTo(x + width - tr, y);
        this.quadraticCurveTo(x + width, y, x + width, y + tr);
        this.lineTo(x + width, y + height - br);
        this.quadraticCurveTo(x + width, y + height, x + width - br, y + height);
        this.lineTo(x + bl, y + height);
        this.quadraticCurveTo(x, y + height, x, y + height - bl);
        this.lineTo(x, y + tl);
        this.quadraticCurveTo(x, y, x + tl, y);
        this.closePath();

        return this;
    };
}
