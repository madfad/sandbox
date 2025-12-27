/**
 * Wire Entity - Connection points for circuits
 */

class Wire {
    constructor(id, x, y, type = 'end') {
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.type = type; // 'end' or 'junction'
        this.connected = false;
        this.active = false;
        this.sparkTimer = 0;
    }

    /**
     * Update wire state
     */
    update(deltaTime, player) {
        this.sparkTimer += deltaTime;

        // Check if player is near
        const distance = Collision.distance(this, player);
        this.active = distance < 60;

        // Create spark effect when active
        if (this.active && !this.connected && this.sparkTimer > 100) {
            this.sparkTimer = 0;
            if (Math.random() < 0.3) {
                Particles.createSpark(
                    this.x + this.width / 2 + (Math.random() - 0.5) * 10,
                    this.y + this.height / 2 + (Math.random() - 0.5) * 10
                );
            }
        }
    }

    /**
     * Render wire
     */
    render(time) {
        let spriteName = 'wireEnd';

        if (this.connected) {
            spriteName = 'wireConnected';
        } else if (this.active) {
            spriteName = 'wireEndActive';
        }

        // Bobbing animation
        const bobOffset = Math.sin(time * 0.004 + this.id) * 2;

        Renderer.drawSprite(spriteName, this.x, this.y + bobOffset, this.width, this.height);

        // Draw interaction hint when active
        if (this.active && !this.connected) {
            this.drawInteractionHint(time);
        }
    }

    /**
     * Draw hint for player to connect
     */
    drawInteractionHint(time) {
        const ctx = Renderer.ctx;
        const pulse = Math.sin(time * 0.008) * 0.5 + 0.5;

        ctx.save();
        ctx.font = 'bold 12px Orbitron, monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = `rgba(251, 191, 36, ${pulse})`;
        ctx.shadowColor = 'rgba(251, 191, 36, 0.8)';
        ctx.shadowBlur = 8;
        ctx.fillText('TOUCH TO CONNECT', this.x + this.width / 2, this.y - 10);
        ctx.restore();
    }

    /**
     * Check if player can connect
     */
    canConnect(player) {
        return this.active && !this.connected && !player.connectedWires.includes(this.id);
    }
}

/**
 * Wire Manager - Handles all wires in a level
 */
const WireManager = {
    wires: [],

    /**
     * Initialize wires for a level
     */
    init(wireData) {
        this.wires = wireData.map((data, index) =>
            new Wire(index, data.x, data.y, data.type || 'end')
        );
    },

    /**
     * Update all wires
     */
    update(deltaTime, player) {
        this.wires.forEach(wire => wire.update(deltaTime, player));

        // Check for wire connections
        this.wires.forEach(wire => {
            if (wire.canConnect(player) && Collision.checkWireCollision(player, wire)) {
                player.connectWire(wire);
            }
        });
    },

    /**
     * Render all wires
     */
    render(time) {
        this.wires.forEach(wire => wire.render(time));
    },

    /**
     * Render wire connection lines (from player to connected wires)
     */
    renderConnections(player, time) {
        const playerCenter = player.getCenter();

        this.wires.forEach(wire => {
            if (wire.connected) {
                Renderer.drawWireConnection(
                    wire.x + wire.width,
                    wire.y + wire.height / 2,
                    playerCenter.x,
                    playerCenter.y,
                    true
                );
            }
        });
    },

    /**
     * Get wire by ID
     */
    getWire(id) {
        return this.wires.find(w => w.id === id);
    },

    /**
     * Check if all wires are connected
     */
    allConnected() {
        return this.wires.every(wire => wire.connected);
    },

    /**
     * Reset all wires
     */
    reset() {
        this.wires.forEach(wire => {
            wire.connected = false;
            wire.active = false;
        });
    }
};
