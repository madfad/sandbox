/**
 * Renderer Module - Canvas rendering system
 */

const Renderer = {
    canvas: null,
    ctx: null,
    width: 800,
    height: 500,
    tileSize: 32,

    /**
     * Initialize the renderer
     */
    init() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');

        this.canvas.width = this.width;
        this.canvas.height = this.height;

        // Enable crisp pixel rendering
        this.ctx.imageSmoothingEnabled = false;

        console.log('🎨 Renderer initialized');
    },

    /**
     * Clear the canvas
     */
    clear() {
        this.ctx.fillStyle = '#0f172a';
        this.ctx.fillRect(0, 0, this.width, this.height);
    },

    /**
     * Draw the level background
     */
    drawBackground(level) {
        const floorTile = Sprites.get('floorTile');
        const wallTile = Sprites.get('wallTile');

        if (!floorTile || !wallTile) return;

        // Draw floor tiles
        for (let y = 0; y < Math.ceil(this.height / this.tileSize); y++) {
            for (let x = 0; x < Math.ceil(this.width / this.tileSize); x++) {
                this.ctx.drawImage(floorTile, x * this.tileSize, y * this.tileSize);
            }
        }

        // Draw walls from level data
        if (level && level.walls) {
            level.walls.forEach(wall => {
                this.ctx.drawImage(wallTile, wall.x, wall.y, wall.width, wall.height);
            });
        }
    },

    /**
     * Draw darkness overlay for flashlight level
     * Uses offscreen canvas for proper light masking
     */
    drawDarkness(level, player) {
        if (!level.dark) return;

        // Create offscreen canvas for darkness mask if not exists
        if (!this.darknessCanvas) {
            this.darknessCanvas = document.createElement('canvas');
            this.darknessCanvas.width = this.width;
            this.darknessCanvas.height = this.height;
            this.darknessCtx = this.darknessCanvas.getContext('2d');
        }

        const dCtx = this.darknessCtx;
        const playerCenterX = player.x + player.width / 2;
        const playerCenterY = player.y + player.height / 2;

        // Fill with darkness
        dCtx.fillStyle = 'rgba(5, 5, 15, 0.97)';
        dCtx.fillRect(0, 0, this.width, this.height);

        // Cut out light area using 'destination-out'
        dCtx.globalCompositeOperation = 'destination-out';

        if (player.deviceType === 'flashlight') {
            // Large flashlight beam - bright center with soft falloff
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

            // Add a secondary warm glow for realism
            const innerGlow = dCtx.createRadialGradient(
                playerCenterX, playerCenterY, 0,
                playerCenterX, playerCenterY, 80
            );
            innerGlow.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
            innerGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
            dCtx.fillStyle = innerGlow;
            dCtx.beginPath();
            dCtx.arc(playerCenterX, playerCenterY, 80, 0, Math.PI * 2);
            dCtx.fill();
        } else {
            // Very small visibility for non-flashlight devices
            const tinyRadius = 50;
            const gradient = dCtx.createRadialGradient(
                playerCenterX, playerCenterY, 0,
                playerCenterX, playerCenterY, tinyRadius
            );
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
            gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

            dCtx.fillStyle = gradient;
            dCtx.beginPath();
            dCtx.arc(playerCenterX, playerCenterY, tinyRadius, 0, Math.PI * 2);
            dCtx.fill();
        }

        // Reset composite operation
        dCtx.globalCompositeOperation = 'source-over';

        // Draw the darkness overlay onto main canvas
        this.ctx.drawImage(this.darknessCanvas, 0, 0);

        // Add atmospheric glow effect around flashlight
        if (player.deviceType === 'flashlight') {
            this.ctx.save();
            const glowGradient = this.ctx.createRadialGradient(
                playerCenterX, playerCenterY, 0,
                playerCenterX, playerCenterY, 120
            );
            glowGradient.addColorStop(0, 'rgba(254, 243, 199, 0.15)');
            glowGradient.addColorStop(0.5, 'rgba(254, 243, 199, 0.05)');
            glowGradient.addColorStop(1, 'rgba(254, 243, 199, 0)');
            this.ctx.fillStyle = glowGradient;
            this.ctx.beginPath();
            this.ctx.arc(playerCenterX, playerCenterY, 120, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
    },

    /**
     * Draw a sprite at position
     */
    drawSprite(spriteName, x, y, width, height) {
        const sprite = Sprites.get(spriteName);
        if (sprite) {
            if (width && height) {
                this.ctx.drawImage(sprite, x, y, width, height);
            } else {
                this.ctx.drawImage(sprite, x, y);
            }
        }
    },

    /**
     * Draw animated sprite with bobbing effect
     */
    drawAnimatedSprite(spriteName, x, y, time, bobAmount = 3) {
        const sprite = Sprites.get(spriteName);
        if (sprite) {
            const bobOffset = Math.sin(time * 0.005) * bobAmount;
            this.ctx.drawImage(sprite, x, y + bobOffset);
        }
    },

    /**
     * Draw wire connection line between two points
     */
    drawWireConnection(x1, y1, x2, y2, active = false) {
        this.ctx.save();

        // Glow effect
        if (active) {
            this.ctx.shadowColor = 'rgba(74, 222, 128, 0.8)';
            this.ctx.shadowBlur = 15;
            this.ctx.strokeStyle = '#4ade80';
        } else {
            this.ctx.strokeStyle = '#64748b';
        }

        this.ctx.lineWidth = 4;
        this.ctx.lineCap = 'round';

        // Draw curved wire
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);

        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2 + 30;

        this.ctx.quadraticCurveTo(midX, midY, x2, y2);
        this.ctx.stroke();

        // White core for active wire
        if (active) {
            this.ctx.strokeStyle = '#86efac';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }

        this.ctx.restore();
    },

    /**
     * Draw text with glow effect
     */
    drawText(text, x, y, options = {}) {
        const {
            font = '16px Orbitron, monospace',
            color = '#ffffff',
            glow = null,
            align = 'left'
        } = options;

        this.ctx.save();
        this.ctx.font = font;
        this.ctx.textAlign = align;
        this.ctx.fillStyle = color;

        if (glow) {
            this.ctx.shadowColor = glow;
            this.ctx.shadowBlur = 10;
        }

        this.ctx.fillText(text, x, y);
        this.ctx.restore();
    },

    /**
     * Draw collection effect (expanding ring)
     */
    drawCollectionEffect(x, y, progress) {
        const radius = 20 + progress * 40;
        const alpha = 1 - progress;

        this.ctx.save();
        this.ctx.strokeStyle = `rgba(251, 191, 36, ${alpha})`;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.restore();
    },

    /**
     * Draw level title overlay
     */
    drawLevelTitle(title, subtitle, alpha = 1) {
        this.ctx.save();
        this.ctx.globalAlpha = alpha;

        // Background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, this.height / 2 - 60, this.width, 120);

        // Title
        this.ctx.font = 'bold 32px Orbitron, monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = '#00d4ff';
        this.ctx.shadowColor = 'rgba(0, 212, 255, 0.8)';
        this.ctx.shadowBlur = 20;
        this.ctx.fillText(title, this.width / 2, this.height / 2);

        // Subtitle
        this.ctx.font = '16px Outfit, sans-serif';
        this.ctx.fillStyle = '#94a3b8';
        this.ctx.shadowBlur = 0;
        this.ctx.fillText(subtitle, this.width / 2, this.height / 2 + 30);

        this.ctx.restore();
    }
};
