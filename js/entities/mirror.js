/**
 * Mirror Entity - Reflects flashlight beam
 * Light beams bounce off mirrors - when all mirrors are lit, puzzle is solved
 */

class Mirror {
    constructor(id, x, y, angle = 0) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = 48;
        this.height = 8;
        this.angle = angle; // Angle in radians (0 = horizontal)
        this.isLit = false;
        this.incomingAngle = 0;
    }

    /**
     * Get the center position
     */
    getCenter() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        };
    }

    /**
     * Check if a ray hits this mirror
     * Returns hit point or null
     */
    checkRayHit(rayOrigin, rayAngle, maxDistance = 400) {
        const center = this.getCenter();

        // Get mirror endpoints
        const halfLen = this.width / 2;
        const cos = Math.cos(this.angle);
        const sin = Math.sin(this.angle);

        const p1 = {
            x: center.x - cos * halfLen,
            y: center.y - sin * halfLen
        };
        const p2 = {
            x: center.x + cos * halfLen,
            y: center.y + sin * halfLen
        };

        // Ray direction
        const rayDir = {
            x: Math.cos(rayAngle),
            y: Math.sin(rayAngle)
        };

        // Ray end point
        const rayEnd = {
            x: rayOrigin.x + rayDir.x * maxDistance,
            y: rayOrigin.y + rayDir.y * maxDistance
        };

        // Line segment intersection
        const hit = this.lineIntersection(rayOrigin, rayEnd, p1, p2);

        if (hit) {
            // Calculate distance
            const dist = Math.sqrt(
                Math.pow(hit.x - rayOrigin.x, 2) +
                Math.pow(hit.y - rayOrigin.y, 2)
            );

            if (dist > 20 && dist < maxDistance) { // Min distance to avoid self-hit
                return { point: hit, distance: dist };
            }
        }

        return null;
    }

    /**
     * Line segment intersection
     */
    lineIntersection(p1, p2, p3, p4) {
        const denom = (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);
        if (Math.abs(denom) < 0.0001) return null;

        const ua = ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / denom;
        const ub = ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / denom;

        if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
            return {
                x: p1.x + ua * (p2.x - p1.x),
                y: p1.y + ua * (p2.y - p1.y)
            };
        }

        return null;
    }

    /**
     * Calculate reflection angle
     */
    getReflectionAngle(incomingAngle) {
        // Mirror normal is perpendicular to mirror surface
        const normalAngle = this.angle + Math.PI / 2;

        // Reflection: outgoing = 2 * normal - incoming
        const reflected = 2 * normalAngle - incomingAngle;
        return reflected;
    }

    /**
     * Render mirror
     */
    render(ctx, time) {
        ctx.save();

        const center = this.getCenter();
        ctx.translate(center.x, center.y);
        ctx.rotate(this.angle);

        // Mirror frame/stand
        ctx.fillStyle = '#4b5563';
        ctx.fillRect(-this.width / 2 - 4, -6, this.width + 8, 12);

        // Mirror surface (reflective)
        const gradient = ctx.createLinearGradient(-this.width / 2, 0, this.width / 2, 0);
        if (this.isLit) {
            gradient.addColorStop(0, '#fef3c7');
            gradient.addColorStop(0.5, '#fef9c3');
            gradient.addColorStop(1, '#fef3c7');
            ctx.shadowColor = 'rgba(254, 243, 199, 0.8)';
            ctx.shadowBlur = 20;
        } else {
            gradient.addColorStop(0, '#94a3b8');
            gradient.addColorStop(0.5, '#e2e8f0');
            gradient.addColorStop(1, '#94a3b8');
        }
        ctx.fillStyle = gradient;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

        // Shine effect
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(-this.width / 2 + 4, -this.height / 2 + 1, this.width - 8, 2);

        ctx.restore();
    }
}

/**
 * Beam Manager - Handles flashlight beam and reflections
 * Puzzle is complete when ALL mirrors are lit by the beam chain
 */
const BeamManager = {
    mirrors: [],
    beamPath: [], // Array of points the beam travels through
    maxReflections: 5,
    allMirrorsLit: false,
    litTimer: 0,
    requiredLitTime: 500, // Must keep all mirrors lit for 0.5 seconds

    /**
     * Initialize with mirrors (no receiver needed)
     */
    init(mirrorData) {
        this.mirrors = mirrorData.map((data, index) =>
            new Mirror(index, data.x, data.y, data.angle || 0)
        );
        this.beamPath = [];
        this.allMirrorsLit = false;
        this.litTimer = 0;
    },

    /**
     * Trace the beam from flashlight through mirrors
     */
    traceBeam(player) {
        this.beamPath = [];

        // Reset all mirrors
        this.mirrors.forEach(m => m.isLit = false);

        if (player.deviceType !== 'flashlight') {
            return 0; // Return number of mirrors hit
        }

        const playerCenter = player.getCenter();

        // Find the closest mirror the player can hit
        let bestMirror = null;
        let bestHit = null;
        let bestDist = Infinity;
        let bestAngle = 0;

        // Try multiple angles to find a mirror
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 16) {
            for (const mirror of this.mirrors) {
                const hit = mirror.checkRayHit(playerCenter, angle, 200);
                if (hit && hit.distance < bestDist) {
                    bestDist = hit.distance;
                    bestMirror = mirror;
                    bestHit = hit;
                    bestAngle = angle;
                }
            }
        }

        if (!bestMirror || !bestHit) {
            return 0;
        }

        // Start beam path
        this.beamPath.push(playerCenter);
        this.beamPath.push(bestHit.point);
        bestMirror.isLit = true;
        bestMirror.incomingAngle = bestAngle;

        let mirrorsHit = 1;

        // Trace reflections
        let currentPos = bestHit.point;
        let currentMirror = bestMirror;
        let currentAngle = currentMirror.getReflectionAngle(bestAngle);

        for (let i = 0; i < this.maxReflections; i++) {
            // Check if beam hits another mirror
            let nextMirror = null;
            let nextHit = null;
            let nextDist = Infinity;

            for (const mirror of this.mirrors) {
                if (mirror === currentMirror) continue;

                const hit = mirror.checkRayHit(currentPos, currentAngle, 400);
                if (hit && hit.distance < nextDist) {
                    nextDist = hit.distance;
                    nextMirror = mirror;
                    nextHit = hit;
                }
            }

            if (nextMirror && nextHit) {
                this.beamPath.push(nextHit.point);
                nextMirror.isLit = true;
                nextMirror.incomingAngle = currentAngle;
                mirrorsHit++;
                currentPos = nextHit.point;
                currentMirror = nextMirror;
                currentAngle = currentMirror.getReflectionAngle(currentAngle);
            } else {
                // Beam ends - add final segment
                const endPoint = {
                    x: currentPos.x + Math.cos(currentAngle) * 300,
                    y: currentPos.y + Math.sin(currentAngle) * 300
                };
                this.beamPath.push(endPoint);
                break;
            }
        }

        return mirrorsHit;
    },

    /**
     * Update beam system
     */
    update(deltaTime, player) {
        const mirrorsHit = this.traceBeam(player);
        const allLit = mirrorsHit === this.mirrors.length && this.mirrors.length > 0;

        if (allLit) {
            this.litTimer += deltaTime;
            if (this.litTimer >= this.requiredLitTime) {
                this.allMirrorsLit = true;
            }
        } else {
            this.litTimer = Math.max(0, this.litTimer - deltaTime * 2);
        }
    },

    /**
     * Draw illumination around beam path (lights up the dark)
     */
    drawBeamIllumination(ctx) {
        if (this.beamPath.length < 2) return;

        // Create illumination along the beam path
        for (let i = 0; i < this.beamPath.length - 1; i++) {
            const p1 = this.beamPath[i];
            const p2 = this.beamPath[i + 1];

            // Draw glow circles along the beam segment
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const steps = Math.ceil(dist / 30);

            for (let j = 0; j <= steps; j++) {
                const t = j / steps;
                const x = p1.x + dx * t;
                const y = p1.y + dy * t;

                // Light glow at this point
                const gradient = ctx.createRadialGradient(x, y, 0, x, y, 60);
                gradient.addColorStop(0, 'rgba(254, 243, 199, 0.15)');
                gradient.addColorStop(0.5, 'rgba(254, 243, 199, 0.05)');
                gradient.addColorStop(1, 'rgba(254, 243, 199, 0)');
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(x, y, 60, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    },

    /**
     * Render beam and all components
     */
    render(ctx, time) {
        // Render mirrors
        this.mirrors.forEach(mirror => mirror.render(ctx, time));

        // Render beam path
        if (this.beamPath.length >= 2) {
            ctx.save();

            // Beam glow
            ctx.strokeStyle = 'rgba(254, 243, 199, 0.5)';
            ctx.lineWidth = 16;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();
            ctx.moveTo(this.beamPath[0].x, this.beamPath[0].y);
            for (let i = 1; i < this.beamPath.length; i++) {
                ctx.lineTo(this.beamPath[i].x, this.beamPath[i].y);
            }
            ctx.stroke();

            // Beam core
            ctx.strokeStyle = '#fef3c7';
            ctx.lineWidth = 6;
            ctx.shadowColor = 'rgba(254, 243, 199, 1)';
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.moveTo(this.beamPath[0].x, this.beamPath[0].y);
            for (let i = 1; i < this.beamPath.length; i++) {
                ctx.lineTo(this.beamPath[i].x, this.beamPath[i].y);
            }
            ctx.stroke();

            // Animated particles along beam
            const particleT = (time % 500) / 500;
            for (let i = 0; i < this.beamPath.length - 1; i++) {
                const p1 = this.beamPath[i];
                const p2 = this.beamPath[i + 1];
                const px = p1.x + (p2.x - p1.x) * particleT;
                const py = p1.y + (p2.y - p1.y) * particleT;

                ctx.fillStyle = '#fff';
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.arc(px, py, 4, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        }

        // Show progress indicator when close to solving
        if (this.litTimer > 0 && !this.allMirrorsLit) {
            const progress = this.litTimer / this.requiredLitTime;
            ctx.save();
            ctx.strokeStyle = '#4ade80';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(400, 30, 15, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
    },

    /**
     * Check if puzzle is complete (all mirrors lit)
     */
    isComplete() {
        return this.allMirrorsLit;
    },

    /**
     * Get beam path for illumination in darkness
     */
    getBeamPath() {
        return this.beamPath;
    },

    /**
     * Reset
     */
    reset() {
        this.allMirrorsLit = false;
        this.litTimer = 0;
        this.beamPath = [];
    }
};
