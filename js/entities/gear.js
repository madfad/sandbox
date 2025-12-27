/**
 * Gear Entity - Collectible gizmos
 */

class Gear {
    constructor(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.collected = false;
        this.glowing = false;
        this.rotationAngle = 0;
        this.pulseTimer = 0;
    }

    /**
     * Update gear state
     */
    update(deltaTime, player) {
        if (this.collected) return;

        this.rotationAngle += deltaTime * 0.002;
        this.pulseTimer += deltaTime;

        // Check if player is near for glow effect
        const distance = Collision.distance(this, player);
        this.glowing = distance < 80;

        // Check for collection
        if (Collision.checkGearCollision(player, this)) {
            this.collect(player);
        }
    }

    /**
     * Collect the gear
     */
    collect(player) {
        if (this.collected) return;

        this.collected = true;
        player.collectGear();

        // Create collection effect
        Particles.createCollectionBurst(
            this.x + this.width / 2,
            this.y + this.height / 2
        );

        // Update message
        player.showMessage(`⚙️ Gear collected! (${player.gearsCollected} total)`);
    }

    /**
     * Render gear
     */
    render(time) {
        if (this.collected) return;

        const ctx = Renderer.ctx;
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;

        // Bobbing animation
        const bobOffset = Math.sin(time * 0.003 + this.id * 0.5) * 4;

        ctx.save();
        ctx.translate(centerX, centerY + bobOffset);
        ctx.rotate(this.rotationAngle);
        ctx.translate(-this.width / 2, -this.height / 2);

        // Draw gear sprite
        const spriteName = this.glowing ? 'gearGlow' : 'gear';
        const sprite = Sprites.get(spriteName);
        if (sprite) {
            ctx.drawImage(sprite, 0, 0, this.width, this.height);
        }

        ctx.restore();

        // Draw glow ring when player is near
        if (this.glowing) {
            const pulse = Math.sin(time * 0.008) * 0.3 + 0.5;
            ctx.save();
            ctx.strokeStyle = `rgba(251, 191, 36, ${pulse})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(centerX, centerY + bobOffset, this.width / 2 + 6, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
    }
}

/**
 * Gear Manager - Handles all gears in a level
 */
const GearManager = {
    gears: [],

    /**
     * Initialize gears for a level
     */
    init(gearData) {
        this.gears = gearData.map((data, index) =>
            new Gear(index, data.x, data.y)
        );
    },

    /**
     * Update all gears
     */
    update(deltaTime, player) {
        this.gears.forEach(gear => gear.update(deltaTime, player));
    },

    /**
     * Render all gears
     */
    render(time) {
        this.gears.forEach(gear => gear.render(time));
    },

    /**
     * Get collected count
     */
    getCollectedCount() {
        return this.gears.filter(g => g.collected).length;
    },

    /**
     * Get total count
     */
    getTotalCount() {
        return this.gears.length;
    },

    /**
     * Reset all gears
     */
    reset() {
        this.gears.forEach(gear => {
            gear.collected = false;
        });
    }
};
