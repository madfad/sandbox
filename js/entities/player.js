/**
 * Player Entity - The device character
 */

const Player = {
    x: 100,
    y: 200,
    width: 48,
    height: 48,
    speed: 4,
    deviceType: 'lightSwitch',
    gearsCollected: 0,
    connectedWires: [],
    isOn: false,

    // Animation state
    animTime: 0,
    bobAmount: 3,

    // Device-specific properties
    devices: {
        lightSwitch: {
            name: 'Light Switch',
            sprite: 'lightSwitch',
            spriteOn: 'lightSwitchOn',
            speed: 4,
            ability: 'Connect wires to power circuits',
            gearsRequired: 0
        },
        flashlight: {
            name: 'Flashlight',
            sprite: 'flashlight',
            speed: 4.5,
            ability: 'Illuminate dark areas',
            gearsRequired: 5,
            lightRadius: 150
        },
        magnet: {
            name: 'Magnet',
            sprite: 'magnet',
            speed: 3.5,
            ability: 'Pull metal objects towards you',
            gearsRequired: 10
        },
        fan: {
            name: 'Fan',
            sprite: 'fan',
            speed: 5,
            ability: 'Blow objects away with wind',
            gearsRequired: 15
        },
        heater: {
            name: 'Heater',
            sprite: 'heater',
            speed: 3.5,
            ability: 'Melt ice blocks to clear paths',
            gearsRequired: 20
        },
        speaker: {
            name: 'Speaker',
            sprite: 'speaker',
            speed: 4,
            ability: 'Shatter glass with sound waves',
            gearsRequired: 25
        },
        vacuum: {
            name: 'Vacuum',
            sprite: 'vacuum',
            speed: 4,
            ability: 'Suck objects towards you',
            gearsRequired: 30
        },
        antenna: {
            name: 'Antenna',
            sprite: 'antenna',
            speed: 4.5,
            ability: 'Send signals through walls',
            gearsRequired: 35
        },
        spring: {
            name: 'Spring',
            sprite: 'spring',
            speed: 5.5,
            ability: 'Bounce to reach distant areas',
            gearsRequired: 40
        },
        laser: {
            name: 'Laser',
            sprite: 'laser',
            speed: 4,
            ability: 'Activate sensors with precision',
            gearsRequired: 45
        },
        drill: {
            name: 'Drill',
            sprite: 'drill',
            speed: 3,
            ability: 'Break through weak walls',
            gearsRequired: 50
        },
        battery: {
            name: 'Battery',
            sprite: 'battery',
            speed: 3.5,
            ability: 'Power platforms temporarily',
            gearsRequired: 55,
            charge: 100
        },
        stopwatch: {
            name: 'Stopwatch',
            sprite: 'stopwatch',
            speed: 4,
            ability: 'Slow down moving hazards',
            gearsRequired: 60
        }
    },

    /**
     * Initialize player
     */
    init(x, y) {
        this.x = x;
        this.y = y;
        this.connectedWires = [];
        this.isOn = false;
        this.animTime = 0;
    },

    /**
     * Reset player state for new level
     */
    reset(x, y) {
        this.x = x;
        this.y = y;
        this.connectedWires = [];
        this.isOn = false;
    },

    /**
     * Update player state
     */
    update(deltaTime, level) {
        this.animTime += deltaTime;

        // Get movement input
        const movement = Input.getMovementVector();
        const currentDevice = this.devices[this.deviceType];
        const speed = currentDevice.speed;

        // Calculate new position
        let newX = this.x + movement.x * speed;
        let newY = this.y + movement.y * speed;

        // Apply wall collision
        const resolved = Collision.resolveWallCollision(
            { x: newX, y: newY, width: this.width, height: this.height },
            level.walls || [],
            Renderer.width,
            Renderer.height
        );

        this.x = resolved.x;
        this.y = resolved.y;

        // Create spark trail when moving and connected
        if (this.connectedWires.length > 0 && (movement.x !== 0 || movement.y !== 0)) {
            if (Math.random() < 0.1) {
                Particles.createSpark(
                    this.x + this.width / 2 + (Math.random() - 0.5) * 20,
                    this.y + this.height / 2 + (Math.random() - 0.5) * 20,
                    '#4ade80'
                );
            }
        }
    },

    /**
     * Render player
     */
    render(time) {
        const currentDevice = this.devices[this.deviceType];
        let spriteName = currentDevice.sprite;

        // Use 'on' sprite for light switch when connected
        if (this.deviceType === 'lightSwitch' && this.connectedWires.length >= 2) {
            spriteName = currentDevice.spriteOn;
        }

        // Bobbing animation
        const bobOffset = Math.sin(time * 0.003) * this.bobAmount;

        // Special rendering for fan (spinning animation)
        if (this.deviceType === 'fan') {
            this.renderFan(time, bobOffset);
        } else {
            Renderer.drawSprite(spriteName, this.x, this.y + bobOffset, this.width, this.height);
        }

        // Draw connection indicator
        if (this.connectedWires.length === 1) {
            this.drawConnectionIndicator(time);
        }
    },

    /**
     * Draw indicator showing one wire is connected
     */
    drawConnectionIndicator(time) {
        const ctx = Renderer.ctx;
        const pulse = Math.sin(time * 0.01) * 0.3 + 0.7;

        ctx.save();
        ctx.strokeStyle = `rgba(251, 191, 36, ${pulse})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(
            this.x + this.width / 2,
            this.y + this.height / 2,
            this.width / 2 + 8,
            0,
            Math.PI * 2
        );
        ctx.stroke();
        ctx.restore();
    },

    /**
     * Connect to a wire
     */
    connectWire(wire) {
        if (!this.connectedWires.includes(wire.id)) {
            this.connectedWires.push(wire.id);
            wire.connected = true;
            Particles.createWireEffect(wire.x + wire.width, wire.y + wire.height / 2);

            // Play connection sound indicator
            this.showMessage(`Wire ${this.connectedWires.length}/2 connected!`);

            return true;
        }
        return false;
    },

    /**
     * Check if circuit is complete
     */
    isCircuitComplete() {
        return this.connectedWires.length >= 2;
    },

    /**
     * Collect a gear
     */
    collectGear() {
        this.gearsCollected++;
        this.updateUI();
    },

    /**
     * Evolve to next device
     */
    evolve(newDeviceType) {
        if (this.devices[newDeviceType]) {
            this.deviceType = newDeviceType;
            Particles.createEvolutionEffect(
                this.x + this.width / 2,
                this.y + this.height / 2
            );
            this.updateUI();
            return true;
        }
        return false;
    },

    /**
     * Get the next available evolution
     */
    getNextEvolution() {
        const deviceOrder = ['lightSwitch', 'flashlight', 'magnet'];
        const currentIndex = deviceOrder.indexOf(this.deviceType);

        if (currentIndex < deviceOrder.length - 1) {
            const nextDevice = deviceOrder[currentIndex + 1];
            const deviceInfo = this.devices[nextDevice];

            if (this.gearsCollected >= deviceInfo.gearsRequired) {
                return {
                    type: nextDevice,
                    ...deviceInfo
                };
            }
        }

        return null;
    },

    /**
     * Update UI elements
     */
    updateUI() {
        const gearCountEl = document.getElementById('gear-count');
        const deviceEl = document.getElementById('current-device');
        const nextUpgradeEl = document.getElementById('next-upgrade');

        if (gearCountEl) gearCountEl.textContent = this.gearsCollected;
        if (deviceEl) deviceEl.textContent = this.devices[this.deviceType].name;

        // Update next upgrade threshold using Evolution system
        const nextUnlock = Evolution.getNextUnlockRequirement();
        if (nextUnlock && nextUpgradeEl) {
            nextUpgradeEl.textContent = nextUnlock.gears;
        } else if (nextUpgradeEl) {
            nextUpgradeEl.textContent = 'MAX';
        }
    },

    /**
     * Show message to player
     */
    showMessage(text) {
        const messageEl = document.getElementById('message-text');
        if (messageEl) {
            messageEl.innerHTML = text;
        }
    },

    /**
     * Get center position
     */
    getCenter() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        };
    },

    /**
     * Render fan with spinning blades animation
     */
    renderFan(time, bobOffset) {
        const ctx = Renderer.ctx;
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2 + bobOffset;

        ctx.save();

        // Fan cage/frame
        ctx.strokeStyle = '#6b7280';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 20, 0, Math.PI * 2);
        ctx.stroke();

        // Inner cage ring
        ctx.beginPath();
        ctx.arc(centerX, centerY, 14, 0, Math.PI * 2);
        ctx.stroke();

        // Spinning fan blades
        const spinSpeed = 0.015; // Radians per ms
        const rotation = (time * spinSpeed) % (Math.PI * 2);

        // Fan blade gradient
        const bladeGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 12);
        bladeGradient.addColorStop(0, '#00d4ff');
        bladeGradient.addColorStop(1, '#0891b2');
        ctx.fillStyle = bladeGradient;

        // Draw 3 spinning blades
        for (let i = 0; i < 3; i++) {
            const angle = rotation + (i / 3) * Math.PI * 2;
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(angle);
            ctx.beginPath();
            ctx.ellipse(0, -8, 4, 10, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Center hub
        ctx.fillStyle = '#374151';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
        ctx.fill();

        // Hub highlight
        ctx.fillStyle = '#6b7280';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
        ctx.fill();

        // Base
        ctx.fillStyle = '#4b5563';
        ctx.fillRect(centerX - 6, centerY + 18, 12, 6);

        // Wind particle effect when active
        if (Math.random() < 0.3) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 30 + Math.random() * 20;
            Particles.createSpark(
                centerX + Math.cos(angle) * dist,
                centerY + Math.sin(angle) * dist,
                '#7dd3fc'
            );
        }

        ctx.restore();
    }
};
