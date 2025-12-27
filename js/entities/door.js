/**
 * Door Entity - Level exit
 */

class Door {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 48;
        this.height = 80;
        this.isOpen = false;
        this.openProgress = 0;
        this.pulseTimer = 0;
    }

    /**
     * Update door state
     */
    update(deltaTime, circuitComplete) {
        this.pulseTimer += deltaTime;

        // Open door when circuit is complete
        if (circuitComplete && !this.isOpen) {
            this.open();
        }

        // Animate opening
        if (this.isOpen && this.openProgress < 1) {
            this.openProgress = Math.min(1, this.openProgress + deltaTime * 0.003);
        }
    }

    /**
     * Open the door
     */
    open() {
        if (this.isOpen) return;

        this.isOpen = true;
        Particles.createDoorOpenEffect(this.x, this.y);

        // Update message
        const messageEl = document.getElementById('message-text');
        if (messageEl) {
            messageEl.innerHTML = '🚪 <strong>Door unlocked!</strong> Proceed to the next level!';
        }
    }

    /**
     * Render door
     */
    render(time) {
        const spriteName = this.isOpen ? 'doorOpen' : 'door';

        // Scale effect when opening
        if (this.isOpen && this.openProgress < 1) {
            const ctx = Renderer.ctx;
            ctx.save();
            const scale = 1 + Math.sin(this.openProgress * Math.PI) * 0.1;
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
            ctx.scale(scale, scale);
            ctx.translate(-this.width / 2, -this.height / 2);

            const sprite = Sprites.get(spriteName);
            if (sprite) {
                ctx.drawImage(sprite, 0, 0, this.width, this.height);
            }
            ctx.restore();
        } else {
            Renderer.drawSprite(spriteName, this.x, this.y, this.width, this.height);
        }

        // Draw "LOCKED" indicator when closed
        if (!this.isOpen) {
            this.drawLockedIndicator(time);
        } else {
            this.drawOpenIndicator(time);
        }
    }

    /**
     * Draw locked indicator
     */
    drawLockedIndicator(time) {
        const ctx = Renderer.ctx;
        const pulse = Math.sin(time * 0.005) * 0.3 + 0.7;

        ctx.save();
        ctx.font = 'bold 10px Orbitron, monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = `rgba(239, 68, 68, ${pulse})`;
        ctx.fillText('🔒 LOCKED', this.x + this.width / 2, this.y - 8);
        ctx.restore();
    }

    /**
     * Draw open indicator
     */
    drawOpenIndicator(time) {
        const ctx = Renderer.ctx;
        const pulse = Math.sin(time * 0.006) * 0.3 + 0.7;

        ctx.save();
        ctx.font = 'bold 10px Orbitron, monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = `rgba(16, 185, 129, ${pulse})`;
        ctx.shadowColor = 'rgba(16, 185, 129, 0.8)';
        ctx.shadowBlur = 10;
        ctx.fillText('✓ ENTER', this.x + this.width / 2, this.y - 8);
        ctx.restore();
    }

    /**
     * Check if player is at the door
     */
    isPlayerAtDoor(player) {
        return this.isOpen && Collision.checkDoorCollision(player, this);
    }
}
