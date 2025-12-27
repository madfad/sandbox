/**
 * Particles Module - Visual effects system
 */

const Particles = {
    particles: [],

    /**
     * Create a spark particle
     */
    createSpark(x, y, color = '#fbbf24') {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 3;

        this.particles.push({
            type: 'spark',
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1.0,
            decay: 0.02 + Math.random() * 0.03,
            size: 4 + Math.random() * 4,
            color: color
        });
    },

    /**
     * Create a collection burst effect
     */
    createCollectionBurst(x, y, count = 12) {
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const speed = 2 + Math.random() * 2;

            this.particles.push({
                type: 'spark',
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                decay: 0.025,
                size: 6,
                color: '#fbbf24'
            });
        }
    },

    /**
     * Create wire connection effect
     */
    createWireEffect(x, y) {
        for (let i = 0; i < 8; i++) {
            this.createSpark(x, y, '#4ade80');
        }
    },

    /**
     * Create evolution particles
     */
    createEvolutionEffect(x, y) {
        for (let i = 0; i < 30; i++) {
            const angle = (i / 30) * Math.PI * 2;
            const speed = 3 + Math.random() * 4;
            const colors = ['#00d4ff', '#a855f7', '#fbbf24'];

            this.particles.push({
                type: 'spark',
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                decay: 0.015,
                size: 8 + Math.random() * 4,
                color: colors[Math.floor(Math.random() * colors.length)]
            });
        }
    },

    /**
     * Create door open effect
     */
    createDoorOpenEffect(x, y) {
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI - Math.PI / 2; // Upward bias
            const speed = 2 + Math.random() * 3;

            this.particles.push({
                type: 'spark',
                x: x + Math.random() * 48,
                y: y + Math.random() * 80,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1,
                life: 1.0,
                decay: 0.02,
                size: 6 + Math.random() * 4,
                color: '#10b981'
            });
        }
    },

    /**
     * Update all particles
     */
    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            // Update position
            p.x += p.vx;
            p.y += p.vy;

            // Apply gravity for some particles
            if (p.type === 'spark') {
                p.vy += 0.1;
            }

            // Decay life
            p.life -= p.decay;

            // Remove dead particles
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    },

    /**
     * Render all particles
     */
    render(ctx) {
        this.particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.life;

            if (p.type === 'spark') {
                // Glow effect
                ctx.shadowColor = p.color;
                ctx.shadowBlur = 10;

                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        });
    },

    /**
     * Clear all particles
     */
    clear() {
        this.particles = [];
    }
};
