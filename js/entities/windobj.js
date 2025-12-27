/**
 * Wind Object Entity - Lightweight objects blown by fan (like feathers/leaves)
 * Used in fan-specific puzzles
 */

class WindObject {
    constructor(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.startX = x;  // Remember starting position
        this.startY = y;
        this.width = 28;
        this.height = 28;
        this.vx = 0;
        this.vy = 0;
        this.friction = 0.92;  // Higher friction = slower, more controllable
        this.isBeingBlown = false;
        this.stuckTimer = 0;  // Track if stuck in corner
        this.rotation = Math.random() * Math.PI * 2;
    }

    /**
     * Apply initial burst to dislodge from corners
     */
    applyBurst(playerCenter) {
        const objCenter = this.getCenter();
        const dx = objCenter.x - playerCenter.x;
        const dy = objCenter.y - playerCenter.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0 && distance < 300) {
            // Gentler burst away from player
            const burstStrength = 4;
            this.vx += (dx / distance) * burstStrength;
            this.vy += (dy / distance) * burstStrength;

            // Add some randomness to prevent stuck in same corner
            this.vx += (Math.random() - 0.5) * 2;
            this.vy += (Math.random() - 0.5) * 2;
        }
    }

    /**
     * Update object position based on wind
     */
    update(deltaTime, player, walls) {
        const prevX = this.x;
        const prevY = this.y;

        // Check if fan is active and player is nearby
        if (player.deviceType === 'fan') {
            const playerCenter = player.getCenter();
            const objCenter = this.getCenter();

            const dx = objCenter.x - playerCenter.x;
            const dy = objCenter.y - playerCenter.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Fan blows objects away within range
            if (distance < 200 && distance > 30) {
                this.isBeingBlown = true;

                // Calculate wind force (gentler for better control)
                const windStrength = (200 - distance) / 200 * 2;
                const windX = (dx / distance) * windStrength;
                const windY = (dy / distance) * windStrength;

                this.vx += windX * 0.08;
                this.vy += windY * 0.08;

                // Add slight perpendicular wobble for more natural movement
                const perpX = -dy / distance;
                const perpY = dx / distance;
                this.vx += perpX * Math.sin(Date.now() * 0.008) * 0.1;
                this.vy += perpY * Math.sin(Date.now() * 0.008) * 0.1;

                // Create wind particle effect
                if (Math.random() < 0.15) {
                    Particles.createSpark(objCenter.x, objCenter.y, '#7dd3fc');
                }
            } else {
                this.isBeingBlown = false;
            }
        } else {
            this.isBeingBlown = false;
        }

        // Apply velocity with improved collision handling
        let newX = this.x + this.vx;
        let newY = this.y + this.vy;

        // Check wall collision with bounce
        let hitWallX = false;
        let hitWallY = false;

        if (this.checkWallCollision(newX, this.y, walls)) {
            this.vx = -this.vx * 0.6;  // Bounce off wall
            newX = this.x;
            hitWallX = true;
        }

        if (this.checkWallCollision(this.x, newY, walls)) {
            this.vy = -this.vy * 0.6;  // Bounce off wall
            newY = this.y;
            hitWallY = true;
        }

        // If still stuck after bounce, try diagonal escape
        if (hitWallX && hitWallY) {
            this.stuckTimer += deltaTime;

            // After being stuck for a bit, try to escape
            if (this.stuckTimer > 200) {
                // Add random velocity to escape corner
                this.vx += (Math.random() - 0.5) * 6;
                this.vy += (Math.random() - 0.5) * 6;
                this.stuckTimer = 0;
            }
        } else {
            this.stuckTimer = 0;
        }

        this.x = newX;
        this.y = newY;

        // Apply friction
        this.vx *= this.friction;
        this.vy *= this.friction;

        // Cap maximum velocity (lower for more control)
        const maxSpeed = 5;
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > maxSpeed) {
            this.vx = (this.vx / speed) * maxSpeed;
            this.vy = (this.vy / speed) * maxSpeed;
        }

        // Stop if very slow
        if (Math.abs(this.vx) < 0.05) this.vx = 0;
        if (Math.abs(this.vy) < 0.05) this.vy = 0;

        // Update rotation based on movement
        if (this.vx !== 0 || this.vy !== 0) {
            this.rotation += 0.05;
        }
    }

    /**
     * Check collision with walls
     */
    checkWallCollision(x, y, walls) {
        const objRect = { x, y, width: this.width, height: this.height };

        for (const wall of walls) {
            if (this.rectsOverlap(objRect, wall)) {
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
     * Render wind object (a feather/leaf)
     */
    render(ctx, time) {
        ctx.save();

        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;

        ctx.translate(centerX, centerY);
        ctx.rotate(this.rotation);

        // Glow when being blown
        if (this.isBeingBlown) {
            ctx.shadowColor = 'rgba(0, 212, 255, 0.6)';
            ctx.shadowBlur = 15;
        }

        // Feather/leaf shape
        ctx.fillStyle = this.isBeingBlown ? '#7dd3fc' : '#bae6fd';
        ctx.beginPath();
        ctx.ellipse(0, 0, this.width / 2, this.height / 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Center vein
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-this.width / 3, 0);
        ctx.lineTo(this.width / 3, 0);
        ctx.stroke();

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
 * Wind Target - Wind objects must be blown onto this
 */
class WindTarget {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 48;
        this.height = 48;
        this.isActivated = false;
    }

    /**
     * Update target state - check if a wind object is on it
     */
    update(windObjects) {
        this.isActivated = false;

        for (const obj of windObjects) {
            const objCenter = obj.getCenter();
            const targetCenter = this.getCenter();

            const distance = Math.sqrt(
                Math.pow(objCenter.x - targetCenter.x, 2) +
                Math.pow(objCenter.y - targetCenter.y, 2)
            );

            if (distance < 35) {
                this.isActivated = true;
                break;
            }
        }
    }

    /**
     * Render wind target
     */
    render(ctx, time) {
        ctx.save();

        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;

        // Swirl pattern
        ctx.strokeStyle = this.isActivated ? '#4ade80' : '#0ea5e9';
        ctx.lineWidth = 3;

        if (this.isActivated) {
            ctx.shadowColor = 'rgba(74, 222, 128, 0.6)';
            ctx.shadowBlur = 15;
        }

        // Draw spiral
        ctx.beginPath();
        for (let i = 0; i < 720; i += 20) {
            const angle = (i / 180) * Math.PI;
            const radius = 5 + (i / 720) * 18;
            const px = centerX + Math.cos(angle + time * 0.002) * radius;
            const py = centerY + Math.sin(angle + time * 0.002) * radius;
            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.stroke();

        // Center
        ctx.fillStyle = this.isActivated ? '#4ade80' : '#38bdf8';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
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
 * Wind Manager - Handles all wind objects and targets in a level
 */
const WindManager = {
    objects: [],
    targets: [],
    lastDeviceType: null,

    /**
     * Initialize wind objects and targets for a level
     */
    init(objectData, targetData) {
        this.objects = objectData.map((data, index) =>
            new WindObject(index, data.x, data.y)
        );
        this.targets = targetData.map((data, index) =>
            new WindTarget(data.x, data.y)
        );
        this.lastDeviceType = null;
    },

    /**
     * Update all wind objects and targets
     */
    update(deltaTime, player, walls) {
        // Check if player just switched TO fan - apply burst
        if (player.deviceType === 'fan' && this.lastDeviceType !== 'fan') {
            console.log('💨 Fan activated - applying wind burst!');
            const playerCenter = player.getCenter();
            this.objects.forEach(obj => obj.applyBurst(playerCenter));
        }
        this.lastDeviceType = player.deviceType;

        this.objects.forEach(obj => obj.update(deltaTime, player, walls));
        this.targets.forEach(target => target.update(this.objects));
    },

    /**
     * Render all wind objects and targets
     */
    render(ctx, time) {
        // Render targets first (under objects)
        this.targets.forEach(target => target.render(ctx, time));
        this.objects.forEach(obj => obj.render(ctx, time));
    },

    /**
     * Check if all targets are activated
     */
    allTargetsActivated() {
        return this.targets.length > 0 && this.targets.every(t => t.isActivated);
    },

    /**
     * Reset all wind objects and targets
     */
    reset() {
        this.objects.forEach(obj => {
            obj.x = obj.startX;
            obj.y = obj.startY;
            obj.vx = 0;
            obj.vy = 0;
        });
        this.targets.forEach(target => target.isActivated = false);
    }
};
