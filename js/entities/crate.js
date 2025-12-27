/**
 * Metal Crate Entity - Can be pushed/pulled by magnet
 * Used in magnet-specific puzzles
 */

class MetalCrate {
    constructor(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.targetX = x;
        this.targetY = y;
        this.isBeingPulled = false;
        this.pullSpeed = 2;
    }

    /**
     * Update crate position
     */
    update(deltaTime, player, walls) {
        // Check if magnet is active and player is nearby
        if (player.deviceType === 'magnet') {
            const playerCenter = player.getCenter();
            const crateCenter = this.getCenter();

            const dx = playerCenter.x - crateCenter.x;
            const dy = playerCenter.y - crateCenter.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Magnet pulls crates within range
            if (distance < 150 && distance > 60) {
                this.isBeingPulled = true;

                // Move towards player
                const pullStrength = (150 - distance) / 150;
                const moveX = (dx / distance) * this.pullSpeed * pullStrength;
                const moveY = (dy / distance) * this.pullSpeed * pullStrength;

                // Check collision before moving
                const newX = this.x + moveX;
                const newY = this.y + moveY;

                if (!this.checkWallCollision(newX, this.y, walls)) {
                    this.x = newX;
                }
                if (!this.checkWallCollision(this.x, newY, walls)) {
                    this.y = newY;
                }

                // Create particle effect
                if (Math.random() < 0.1) {
                    Particles.createSpark(crateCenter.x, crateCenter.y, '#a855f7');
                }
            } else {
                this.isBeingPulled = false;
            }
        } else {
            this.isBeingPulled = false;
        }
    }

    /**
     * Check collision with walls
     */
    checkWallCollision(x, y, walls) {
        const crateRect = { x, y, width: this.width, height: this.height };

        for (const wall of walls) {
            if (this.rectsOverlap(crateRect, wall)) {
                return true;
            }
        }

        // Also check canvas bounds
        if (x < 32 || x + this.width > 768 || y < 32 || y + this.height > 468) {
            return true;
        }

        return false;
    }

    /**
     * Check if two rectangles overlap
     */
    rectsOverlap(rect1, rect2) {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    }

    /**
     * Render crate
     */
    render(ctx, time) {
        ctx.save();

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(this.x + 4, this.y + 4, this.width, this.height);

        // Main crate body
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x + this.width, this.y + this.height);
        gradient.addColorStop(0, '#6b7280');
        gradient.addColorStop(0.5, '#9ca3af');
        gradient.addColorStop(1, '#4b5563');
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Metal edges
        ctx.strokeStyle = '#374151';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x + 1, this.y + 1, this.width - 2, this.height - 2);

        // Cross pattern
        ctx.strokeStyle = '#4b5563';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x + 5, this.y + 5);
        ctx.lineTo(this.x + this.width - 5, this.y + this.height - 5);
        ctx.moveTo(this.x + this.width - 5, this.y + 5);
        ctx.lineTo(this.x + 5, this.y + this.height - 5);
        ctx.stroke();

        // Magnetic indicator
        if (this.isBeingPulled) {
            ctx.fillStyle = '#a855f7';
            ctx.shadowColor = 'rgba(168, 85, 247, 0.8)';
            ctx.shadowBlur = 15;
        } else {
            ctx.fillStyle = '#6b21a8';
        }
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    /**
     * Get center position
     */
    getCenter() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        };
    }
}

/**
 * Pressure Plate - Must have a crate on it to activate
 */
class PressurePlate {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 48;
        this.height = 48;
        this.isActivated = false;
    }

    /**
     * Update plate state - check if a crate is on it
     */
    update(crates) {
        this.isActivated = false;

        for (const crate of crates) {
            const crateCenter = crate.getCenter();
            const plateCenter = this.getCenter();

            const distance = Math.sqrt(
                Math.pow(crateCenter.x - plateCenter.x, 2) +
                Math.pow(crateCenter.y - plateCenter.y, 2)
            );

            if (distance < 30) {
                this.isActivated = true;
                break;
            }
        }
    }

    /**
     * Render pressure plate
     */
    render(ctx, time) {
        ctx.save();

        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;

        // Base plate
        ctx.fillStyle = this.isActivated ? '#4ade80' : '#374151';
        if (this.isActivated) {
            ctx.shadowColor = 'rgba(74, 222, 128, 0.6)';
            ctx.shadowBlur = 15;
        }
        ctx.fillRect(this.x + 4, this.y + 4, this.width - 8, this.height - 8);

        // Border
        ctx.strokeStyle = this.isActivated ? '#86efac' : '#6b7280';
        ctx.lineWidth = 3;
        ctx.strokeRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);

        // Down arrow indicator
        ctx.fillStyle = this.isActivated ? '#fff' : '#9ca3af';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 0;
        ctx.fillText('▼', centerX, centerY + 6);

        ctx.restore();
    }

    /**
     * Get center position
     */
    getCenter() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        };
    }
}

/**
 * Crate Manager - Handles all crates and pressure plates in a level
 */
const CrateManager = {
    crates: [],
    plates: [],

    /**
     * Initialize crates and plates for a level
     */
    init(crateData, plateData) {
        this.crates = crateData.map((data, index) =>
            new MetalCrate(index, data.x, data.y)
        );
        this.plates = plateData.map((data, index) =>
            new PressurePlate(data.x, data.y)
        );
    },

    /**
     * Update all crates and plates
     */
    update(deltaTime, player, walls) {
        this.crates.forEach(crate => crate.update(deltaTime, player, walls));
        this.plates.forEach(plate => plate.update(this.crates));
    },

    /**
     * Render all crates and plates
     */
    render(ctx, time) {
        // Render plates first (under crates)
        this.plates.forEach(plate => plate.render(ctx, time));
        this.crates.forEach(crate => crate.render(ctx, time));
    },

    /**
     * Check if all plates are activated
     */
    allPlatesActivated() {
        return this.plates.length > 0 && this.plates.every(p => p.isActivated);
    },

    /**
     * Reset all crates and plates
     */
    reset() {
        // Reset crates to original positions would need storing initial positions
        this.plates.forEach(plate => plate.isActivated = false);
    }
};
