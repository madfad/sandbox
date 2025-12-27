/**
 * Puzzle Entities for Levels 5-14
 * Contains: Ice, Glass, VacuumObject, SignalReceiver, BouncePad, LaserSensor, WeakWall, PowerPlatform, Hazard, and their managers
 */

// ================== ICE BLOCK (Heater Puzzle) ==================
class IceBlock {
    constructor(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.isMelted = false;
        this.meltProgress = 0;
        this.meltTime = 1500; // 1.5 seconds to melt
    }

    update(deltaTime, player) {
        if (this.isMelted) return;

        if (player.deviceType === 'heater') {
            const dx = (this.x + this.width / 2) - (player.x + player.width / 2);
            const dy = (this.y + this.height / 2) - (player.y + player.height / 2);
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 100) {
                this.meltProgress += deltaTime * (1 - dist / 100);
                if (this.meltProgress >= this.meltTime) {
                    this.isMelted = true;
                    Particles.createCollectionBurst(this.x + this.width / 2, this.y + this.height / 2);
                }
            }
        } else {
            this.meltProgress = Math.max(0, this.meltProgress - deltaTime * 0.5);
        }
    }

    render(ctx, time) {
        if (this.isMelted) return;

        const progress = this.meltProgress / this.meltTime;
        const alpha = 1 - progress * 0.5;

        ctx.save();
        ctx.globalAlpha = alpha;

        // Draw ice block
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x + this.width, this.y + this.height);
        gradient.addColorStop(0, '#bfdbfe');
        gradient.addColorStop(0.5, '#93c5fd');
        gradient.addColorStop(1, '#60a5fa');
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x, this.y, this.width * (1 - progress * 0.3), this.height * (1 - progress * 0.3));

        // Shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillRect(this.x + 4, this.y + 4, 12, 6);

        // Melt progress indicator
        if (progress > 0) {
            ctx.strokeStyle = '#f97316';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 25, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();
    }

    getCollisionRect() {
        return this.isMelted ? null : { x: this.x, y: this.y, width: this.width, height: this.height };
    }
}

const IceManager = {
    blocks: [],
    init(data) {
        this.blocks = data.map((d, i) => new IceBlock(i, d.x, d.y));
    },
    update(dt, player) {
        this.blocks.forEach(b => b.update(dt, player));
    },
    render(ctx, time) {
        this.blocks.forEach(b => b.render(ctx, time));
    },
    getCollisionRects() {
        return this.blocks.map(b => b.getCollisionRect()).filter(r => r);
    },
    allMelted() {
        return this.blocks.every(b => b.isMelted);
    }
};

// ================== GLASS WALL (Speaker Puzzle) ==================
class GlassWall {
    constructor(id, x, y, frequency = 1) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 64;
        this.isShattered = false;
        this.frequency = frequency; // 1-3, player distance determines frequency
        this.shatterProgress = 0;
        this.shatterTime = 800;
    }

    update(deltaTime, player) {
        if (this.isShattered) return;

        if (player.deviceType === 'speaker') {
            const dx = (this.x + this.width / 2) - (player.x + player.width / 2);
            const dy = (this.y + this.height / 2) - (player.y + player.height / 2);
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Different frequencies at different distances
            const playerFreq = dist < 80 ? 1 : (dist < 140 ? 2 : 3);

            if (dist < 180 && playerFreq === this.frequency) {
                this.shatterProgress += deltaTime;
                if (this.shatterProgress >= this.shatterTime) {
                    this.isShattered = true;
                    Particles.createCollectionBurst(this.x + this.width / 2, this.y + this.height / 2);
                }
            } else {
                this.shatterProgress = Math.max(0, this.shatterProgress - deltaTime);
            }
        }
    }

    render(ctx, time) {
        if (this.isShattered) return;

        const progress = this.shatterProgress / this.shatterTime;

        ctx.save();

        // Glass panel with vibration
        const vibrate = progress > 0 ? Math.sin(time * 0.05) * progress * 3 : 0;
        ctx.translate(vibrate, 0);

        ctx.fillStyle = `rgba(147, 197, 253, ${0.6 - progress * 0.3})`;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Frame
        ctx.strokeStyle = '#6b7280';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        // Frequency indicator
        const colors = ['#22c55e', '#eab308', '#ef4444'];
        ctx.fillStyle = colors[this.frequency - 1];
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + 10, 5, 0, Math.PI * 2);
        ctx.fill();

        // Cracks when shattering
        if (progress > 0.3) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(this.x + 5, this.y + 20);
            ctx.lineTo(this.x + this.width / 2, this.y + this.height / 2);
            ctx.lineTo(this.x + this.width - 5, this.y + this.height - 15);
            ctx.stroke();
        }

        ctx.restore();
    }

    getCollisionRect() {
        return this.isShattered ? null : { x: this.x, y: this.y, width: this.width, height: this.height };
    }
}

const GlassManager = {
    walls: [],
    init(data) {
        this.walls = data.map((d, i) => new GlassWall(i, d.x, d.y, d.frequency || 1));
    },
    update(dt, player) {
        this.walls.forEach(w => w.update(dt, player));
    },
    render(ctx, time) {
        this.walls.forEach(w => w.render(ctx, time));
    },
    getCollisionRects() {
        return this.walls.map(w => w.getCollisionRect()).filter(r => r);
    },
    allShattered() {
        return this.walls.every(w => w.isShattered);
    }
};

// ================== VACUUM OBJECT (Vacuum Puzzle) ==================
class VacuumObject {
    constructor(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.startX = x;
        this.startY = y;
        this.width = 28;
        this.height = 28;
        this.vx = 0;
        this.vy = 0;
        this.friction = 0.92;
    }

    update(deltaTime, player, walls) {
        if (player.deviceType === 'vacuum') {
            const playerCenter = player.getCenter();
            const objCenter = { x: this.x + this.width / 2, y: this.y + this.height / 2 };

            const dx = playerCenter.x - objCenter.x;
            const dy = playerCenter.y - objCenter.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Vacuum pulls objects TOWARDS player (opposite of fan)
            if (dist < 200 && dist > 40) {
                const strength = (200 - dist) / 200 * 2;
                this.vx += (dx / dist) * strength * 0.1;
                this.vy += (dy / dist) * strength * 0.1;

                if (Math.random() < 0.1) {
                    Particles.createSpark(objCenter.x, objCenter.y, '#c4b5fd');
                }
            }
        }

        // Apply velocity with collision
        let newX = this.x + this.vx;
        let newY = this.y + this.vy;

        // Wall collision
        for (const wall of walls) {
            if (this.rectsOverlap({ x: newX, y: this.y, width: this.width, height: this.height }, wall)) {
                this.vx = -this.vx * 0.5;
                newX = this.x;
            }
            if (this.rectsOverlap({ x: this.x, y: newY, width: this.width, height: this.height }, wall)) {
                this.vy = -this.vy * 0.5;
                newY = this.y;
            }
        }

        // Bounds
        if (newX < 32 || newX + this.width > 768) { this.vx = -this.vx * 0.5; newX = this.x; }
        if (newY < 32 || newY + this.height > 468) { this.vy = -this.vy * 0.5; newY = this.y; }

        this.x = newX;
        this.y = newY;
        this.vx *= this.friction;
        this.vy *= this.friction;
    }

    rectsOverlap(r1, r2) {
        return r1.x < r2.x + r2.width && r1.x + r1.width > r2.x &&
            r1.y < r2.y + r2.height && r1.y + r1.height > r2.y;
    }

    render(ctx, time) {
        ctx.save();
        ctx.fillStyle = '#c4b5fd';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#7c3aed';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    getCenter() {
        return { x: this.x + this.width / 2, y: this.y + this.height / 2 };
    }
}

// Reuse WindTarget for VacuumManager targets
const VacuumManager = {
    objects: [],
    targets: [],
    init(objectData, targetData) {
        this.objects = objectData.map((d, i) => new VacuumObject(i, d.x, d.y));
        this.targets = targetData.map((d, i) => new WindTarget(d.x, d.y));
    },
    update(dt, player, walls) {
        this.objects.forEach(o => o.update(dt, player, walls));
        this.targets.forEach(t => t.update(this.objects));
    },
    render(ctx, time) {
        this.targets.forEach(t => t.render(ctx, time));
        this.objects.forEach(o => o.render(ctx, time));
    },
    allActivated() {
        return this.targets.length > 0 && this.targets.every(t => t.isActivated);
    }
};

// ================== SIGNAL RECEIVER (Antenna Puzzle) ==================
class SignalReceiver {
    constructor(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.isActivated = false;
        this.signalStrength = 0;
    }

    update(deltaTime, player) {
        if (player.deviceType === 'antenna') {
            const playerCenter = player.getCenter();
            const recvCenter = { x: this.x + this.width / 2, y: this.y + this.height / 2 };

            const dx = recvCenter.x - playerCenter.x;
            const dy = recvCenter.y - playerCenter.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Signal passes through walls but weakens with distance
            if (dist < 300) {
                this.signalStrength = Math.min(100, this.signalStrength + (300 - dist) / 300 * deltaTime * 0.2);
                if (this.signalStrength >= 80) {
                    this.isActivated = true;
                }
            }
        } else {
            this.signalStrength = Math.max(0, this.signalStrength - deltaTime * 0.1);
            if (this.signalStrength < 50) this.isActivated = false;
        }
    }

    render(ctx, time) {
        ctx.save();

        // Receiver box
        ctx.fillStyle = this.isActivated ? '#22c55e' : '#374151';
        if (this.isActivated) {
            ctx.shadowColor = 'rgba(34, 197, 94, 0.6)';
            ctx.shadowBlur = 15;
        }
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Antenna
        ctx.strokeStyle = '#9ca3af';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y);
        ctx.lineTo(this.x + this.width / 2, this.y - 12);
        ctx.stroke();

        // Signal indicator
        ctx.fillStyle = this.isActivated ? '#86efac' : '#6b7280';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 8, 0, Math.PI * 2);
        ctx.fill();

        // Signal strength bar
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(this.x + 4, this.y + this.height - 6, (this.width - 8) * (this.signalStrength / 100), 4);

        ctx.restore();
    }
}

const SignalManager = {
    receivers: [],
    init(data) {
        this.receivers = data.map((d, i) => new SignalReceiver(i, d.x, d.y));
    },
    update(dt, player) {
        this.receivers.forEach(r => r.update(dt, player));
    },
    render(ctx, time) {
        this.receivers.forEach(r => r.render(ctx, time));
    },
    allActivated() {
        return this.receivers.length > 0 && this.receivers.every(r => r.isActivated);
    }
};

// ================== BOUNCE PAD (Spring Puzzle) ==================
class BouncePad {
    constructor(id, x, y, targetX, targetY) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = 48;
        this.height = 16;
        this.targetX = targetX;
        this.targetY = targetY;
        this.compressionAnim = 0;
    }

    checkBounce(player) {
        if (player.deviceType !== 'spring') return false;

        const playerRect = { x: player.x, y: player.y, width: player.width, height: player.height };
        const padRect = { x: this.x, y: this.y - 10, width: this.width, height: this.height + 20 };

        if (this.rectsOverlap(playerRect, padRect)) {
            this.compressionAnim = 1;
            return { x: this.targetX, y: this.targetY };
        }
        return false;
    }

    rectsOverlap(r1, r2) {
        return r1.x < r2.x + r2.width && r1.x + r1.width > r2.x &&
            r1.y < r2.y + r2.height && r1.y + r1.height > r2.y;
    }

    update(deltaTime) {
        if (this.compressionAnim > 0) {
            this.compressionAnim -= deltaTime * 0.005;
        }
    }

    render(ctx, time) {
        ctx.save();

        const compression = Math.max(0, this.compressionAnim);
        const bounceOffset = Math.sin(compression * Math.PI) * 8;

        // Base
        ctx.fillStyle = '#374151';
        ctx.fillRect(this.x, this.y + 8 - bounceOffset, this.width, 8);

        // Spring coils
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3;
        for (let i = 0; i < 3; i++) {
            const y = this.y + 4 - i * 3 - bounceOffset * (i + 1) / 3;
            ctx.beginPath();
            ctx.moveTo(this.x + 6, y);
            ctx.quadraticCurveTo(this.x + this.width / 2, y - 3, this.x + this.width - 6, y);
            ctx.stroke();
        }

        // Arrow indicator
        ctx.strokeStyle = '#86efac';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y - 10);
        ctx.lineTo(this.targetX + 20, this.targetY + 20);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.restore();
    }
}

const BounceManager = {
    pads: [],
    init(data) {
        this.pads = data.map((d, i) => new BouncePad(i, d.x, d.y, d.targetX, d.targetY));
    },
    update(dt, player) {
        this.pads.forEach(p => {
            p.update(dt);
            const bounce = p.checkBounce(player);
            if (bounce) {
                player.x = bounce.x;
                player.y = bounce.y;
                Particles.createCollectionBurst(player.x + player.width / 2, player.y + player.height / 2);
            }
        });
    },
    render(ctx, time) {
        this.pads.forEach(p => p.render(ctx, time));
    }
};

// ================== LASER SENSOR (Laser Puzzle) ==================
class LaserSensor {
    constructor(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.isActivated = false;
    }

    checkLaserHit(playerCenter) {
        const sensorCenter = { x: this.x + this.width / 2, y: this.y + this.height / 2 };
        const dist = Math.sqrt(
            Math.pow(sensorCenter.x - playerCenter.x, 2) +
            Math.pow(sensorCenter.y - playerCenter.y, 2)
        );
        // Laser has long range but needs line of sight
        return dist < 250;
    }

    update(deltaTime, player) {
        if (player.deviceType === 'laser') {
            this.isActivated = this.checkLaserHit(player.getCenter());
        } else {
            this.isActivated = false;
        }
    }

    render(ctx, time) {
        ctx.save();

        ctx.fillStyle = this.isActivated ? '#ef4444' : '#1f2937';
        if (this.isActivated) {
            ctx.shadowColor = 'rgba(239, 68, 68, 0.8)';
            ctx.shadowBlur = 15;
        }
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
        ctx.fill();

        // Inner ring
        ctx.strokeStyle = this.isActivated ? '#fca5a5' : '#6b7280';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 4, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }
}

const LaserManager = {
    sensors: [],
    init(data) {
        this.sensors = data.map((d, i) => new LaserSensor(i, d.x, d.y));
    },
    update(dt, player) {
        this.sensors.forEach(s => s.update(dt, player));
    },
    render(ctx, time, player) {
        // Draw laser beam if player is laser
        if (player.deviceType === 'laser') {
            const pc = player.getCenter();
            this.sensors.forEach(s => {
                if (s.isActivated) {
                    const sc = { x: s.x + s.width / 2, y: s.y + s.height / 2 };
                    ctx.save();
                    ctx.strokeStyle = '#ef4444';
                    ctx.lineWidth = 2;
                    ctx.shadowColor = 'rgba(239, 68, 68, 0.8)';
                    ctx.shadowBlur = 8;
                    ctx.beginPath();
                    ctx.moveTo(pc.x, pc.y);
                    ctx.lineTo(sc.x, sc.y);
                    ctx.stroke();
                    ctx.restore();
                }
            });
        }
        this.sensors.forEach(s => s.render(ctx, time));
    },
    allActivated() {
        return this.sensors.length > 0 && this.sensors.every(s => s.isActivated);
    }
};

// ================== WEAK WALL (Drill Puzzle) ==================
class WeakWall {
    constructor(id, x, y, width, height) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = width || 32;
        this.height = height || 64;
        this.isDestroyed = false;
        this.drillProgress = 0;
        this.drillTime = 1200;
    }

    update(deltaTime, player) {
        if (this.isDestroyed) return;

        if (player.deviceType === 'drill') {
            const playerCenter = player.getCenter();
            const wallCenter = { x: this.x + this.width / 2, y: this.y + this.height / 2 };
            const dist = Math.sqrt(
                Math.pow(wallCenter.x - playerCenter.x, 2) +
                Math.pow(wallCenter.y - playerCenter.y, 2)
            );

            if (dist < 60) {
                this.drillProgress += deltaTime;
                if (Math.random() < 0.2) {
                    Particles.createSpark(wallCenter.x, wallCenter.y, '#f59e0b');
                }
                if (this.drillProgress >= this.drillTime) {
                    this.isDestroyed = true;
                    Particles.createCollectionBurst(wallCenter.x, wallCenter.y);
                }
            }
        } else {
            this.drillProgress = Math.max(0, this.drillProgress - deltaTime * 0.5);
        }
    }

    render(ctx, time) {
        if (this.isDestroyed) return;

        const progress = this.drillProgress / this.drillTime;

        ctx.save();

        // Cracked wall appearance
        ctx.fillStyle = `rgba(107, 114, 128, ${1 - progress * 0.5})`;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Crack pattern
        ctx.strokeStyle = '#374151';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x + 5, this.y + 10);
        ctx.lineTo(this.x + this.width / 2, this.y + this.height / 3);
        ctx.lineTo(this.x + this.width - 8, this.y + this.height / 2);
        ctx.lineTo(this.x + this.width / 2, this.y + this.height - 10);
        ctx.stroke();

        // "WEAK" indicator
        ctx.fillStyle = '#f59e0b';
        ctx.font = '8px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('⚠', this.x + this.width / 2, this.y + this.height / 2 + 3);

        // Drill progress
        if (progress > 0) {
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 20, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();
    }

    getCollisionRect() {
        return this.isDestroyed ? null : { x: this.x, y: this.y, width: this.width, height: this.height };
    }
}

const DrillManager = {
    walls: [],
    init(data) {
        this.walls = data.map((d, i) => new WeakWall(i, d.x, d.y, d.width, d.height));
    },
    update(dt, player) {
        this.walls.forEach(w => w.update(dt, player));
    },
    render(ctx, time) {
        this.walls.forEach(w => w.render(ctx, time));
    },
    getCollisionRects() {
        return this.walls.map(w => w.getCollisionRect()).filter(r => r);
    },
    allDestroyed() {
        return this.walls.every(w => w.isDestroyed);
    }
};

// ================== POWER PLATFORM (Battery Puzzle) ==================
class PowerPlatform {
    constructor(id, x, y, requiredPower) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = 48;
        this.height = 48;
        this.requiredPower = requiredPower || 20;
        this.currentPower = 0;
        this.isActivated = false;
    }

    update(deltaTime, player) {
        if (player.deviceType === 'battery') {
            const playerCenter = player.getCenter();
            const platCenter = { x: this.x + this.width / 2, y: this.y + this.height / 2 };
            const dist = Math.sqrt(
                Math.pow(platCenter.x - playerCenter.x, 2) +
                Math.pow(platCenter.y - playerCenter.y, 2)
            );

            if (dist < 60) {
                this.currentPower = Math.min(100, this.currentPower + deltaTime * 0.08);
                this.isActivated = this.currentPower >= this.requiredPower;
            }
        }

        // Power drains when not charging
        if (player.deviceType !== 'battery' || !this.isPlayerNear(player)) {
            this.currentPower = Math.max(0, this.currentPower - deltaTime * 0.02);
            this.isActivated = this.currentPower >= this.requiredPower;
        }
    }

    isPlayerNear(player) {
        const dist = Math.sqrt(
            Math.pow((this.x + this.width / 2) - (player.x + player.width / 2), 2) +
            Math.pow((this.y + this.height / 2) - (player.y + player.height / 2), 2)
        );
        return dist < 60;
    }

    render(ctx, time) {
        ctx.save();

        // Platform base
        ctx.fillStyle = this.isActivated ? '#22c55e' : '#374151';
        if (this.isActivated) {
            ctx.shadowColor = 'rgba(34, 197, 94, 0.6)';
            ctx.shadowBlur = 15;
        }
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Power level indicator
        ctx.fillStyle = '#1f2937';
        ctx.fillRect(this.x + 4, this.y + 4, this.width - 8, 8);
        ctx.fillStyle = this.currentPower >= this.requiredPower ? '#22c55e' : '#fbbf24';
        ctx.fillRect(this.x + 4, this.y + 4, (this.width - 8) * (this.currentPower / 100), 8);

        // Required threshold marker
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        const thresholdX = this.x + 4 + (this.width - 8) * (this.requiredPower / 100);
        ctx.beginPath();
        ctx.moveTo(thresholdX, this.y + 2);
        ctx.lineTo(thresholdX, this.y + 14);
        ctx.stroke();

        // Lightning symbol
        ctx.fillStyle = this.isActivated ? '#fff' : '#6b7280';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('⚡', this.x + this.width / 2, this.y + this.height / 2 + 10);

        ctx.restore();
    }
}

const PowerManager = {
    platforms: [],
    init(data) {
        this.platforms = data.map((d, i) => new PowerPlatform(i, d.x, d.y, d.requiredPower));
    },
    update(dt, player) {
        this.platforms.forEach(p => p.update(dt, player));
    },
    render(ctx, time) {
        this.platforms.forEach(p => p.render(ctx, time));
    },
    allActivated() {
        return this.platforms.length > 0 && this.platforms.every(p => p.isActivated);
    }
};

// ================== HAZARD (Stopwatch Puzzle) ==================
class Hazard {
    constructor(id, x, y, width, height, speed, axis) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.startX = x;
        this.startY = y;
        this.width = width || 32;
        this.height = height || 32;
        this.speed = speed || 2;
        this.axis = axis || 'x'; // 'x' or 'y'
        this.direction = 1;
        this.range = 150;
        this.timeScale = 1;
        this.rotation = 0;
    }

    update(deltaTime, player) {
        // Stopwatch slows down hazards
        if (player.deviceType === 'stopwatch') {
            const playerCenter = player.getCenter();
            const hazardCenter = { x: this.x + this.width / 2, y: this.y + this.height / 2 };
            const dist = Math.sqrt(
                Math.pow(hazardCenter.x - playerCenter.x, 2) +
                Math.pow(hazardCenter.y - playerCenter.y, 2)
            );

            if (dist < 200) {
                this.timeScale = 0.2; // 80% slowdown
            } else {
                this.timeScale = Math.min(1, this.timeScale + deltaTime * 0.002);
            }
        } else {
            this.timeScale = Math.min(1, this.timeScale + deltaTime * 0.002);
        }

        const movement = this.speed * this.direction * this.timeScale;

        if (this.axis === 'x') {
            this.x += movement;
            if (this.x > this.startX + this.range || this.x < this.startX - this.range) {
                this.direction *= -1;
            }
        } else {
            this.y += movement;
            if (this.y > this.startY + this.range || this.y < this.startY - this.range) {
                this.direction *= -1;
            }
        }

        this.rotation += 0.1 * this.timeScale;
    }

    render(ctx, time) {
        ctx.save();

        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;

        ctx.translate(centerX, centerY);
        ctx.rotate(this.rotation);

        // Saw blade
        ctx.fillStyle = this.timeScale < 0.5 ? '#60a5fa' : '#ef4444';
        if (this.timeScale < 0.5) {
            ctx.shadowColor = 'rgba(96, 165, 250, 0.6)';
            ctx.shadowBlur = 15;
        }

        // Draw saw teeth
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const innerR = this.width / 3;
            const outerR = this.width / 2;
            ctx.lineTo(Math.cos(angle) * outerR, Math.sin(angle) * outerR);
            ctx.lineTo(Math.cos(angle + Math.PI / 8) * innerR, Math.sin(angle + Math.PI / 8) * innerR);
        }
        ctx.closePath();
        ctx.fill();

        // Center
        ctx.fillStyle = '#374151';
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    getCollisionRect() {
        return { x: this.x + 4, y: this.y + 4, width: this.width - 8, height: this.height - 8 };
    }

    checkPlayerCollision(player) {
        const pr = { x: player.x, y: player.y, width: player.width, height: player.height };
        const hr = this.getCollisionRect();
        return pr.x < hr.x + hr.width && pr.x + pr.width > hr.x &&
            pr.y < hr.y + hr.height && pr.y + pr.height > hr.y;
    }
}

const HazardManager = {
    hazards: [],
    init(data) {
        this.hazards = data.map((d, i) => new Hazard(i, d.x, d.y, d.width, d.height, d.speed, d.axis));
    },
    update(dt, player) {
        this.hazards.forEach(h => h.update(dt, player));
    },
    render(ctx, time) {
        this.hazards.forEach(h => h.render(ctx, time));
    },
    checkCollisions(player) {
        return this.hazards.some(h => h.checkPlayerCollision(player));
    }
};
