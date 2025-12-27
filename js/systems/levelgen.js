/**
 * Level Generator - Random placement of objects avoiding walls
 */

const LevelGenerator = {
    /**
     * Generate random positions for objects that don't overlap with walls
     * @param {number} count - Number of positions to generate
     * @param {Array} walls - Array of wall objects with x, y, width, height
     * @param {Object} bounds - Canvas bounds {width, height}
     * @param {number} objectSize - Size of the object being placed
     * @param {number} margin - Margin from walls and edges
     * @param {Array} existingPositions - Positions to avoid (other objects)
     * @returns {Array} Array of {x, y} positions
     */
    generatePositions(count, walls, bounds, objectSize = 32, margin = 40, existingPositions = []) {
        const positions = [];
        const maxAttempts = 100; // Prevent infinite loops

        for (let i = 0; i < count; i++) {
            let attempts = 0;
            let validPosition = null;

            while (attempts < maxAttempts && !validPosition) {
                // Generate random position within bounds (with margin from edges)
                const x = margin + Math.random() * (bounds.width - objectSize - margin * 2);
                const y = margin + Math.random() * (bounds.height - objectSize - margin * 2);

                const candidate = { x, y, width: objectSize, height: objectSize };

                // Check if position is valid
                if (this.isValidPosition(candidate, walls, existingPositions, positions, margin)) {
                    validPosition = { x, y };
                }

                attempts++;
            }

            if (validPosition) {
                positions.push(validPosition);
            } else {
                console.warn(`Could not find valid position for object ${i + 1}`);
                // Fallback to center area
                positions.push({
                    x: bounds.width / 2 + (Math.random() - 0.5) * 100,
                    y: bounds.height / 2 + (Math.random() - 0.5) * 100
                });
            }
        }

        return positions;
    },

    /**
     * Check if a position is valid (not overlapping with walls or other objects)
     */
    isValidPosition(candidate, walls, existingPositions, newPositions, margin) {
        // Check against walls
        for (const wall of walls) {
            // Expand wall bounds by margin
            const expandedWall = {
                x: wall.x - margin,
                y: wall.y - margin,
                width: wall.width + margin * 2,
                height: wall.height + margin * 2
            };

            if (this.rectsOverlap(candidate, expandedWall)) {
                return false;
            }
        }

        // Check against existing positions
        for (const pos of existingPositions) {
            const existingRect = { x: pos.x, y: pos.y, width: candidate.width, height: candidate.height };
            const expandedExisting = {
                x: existingRect.x - margin / 2,
                y: existingRect.y - margin / 2,
                width: existingRect.width + margin,
                height: existingRect.height + margin
            };

            if (this.rectsOverlap(candidate, expandedExisting)) {
                return false;
            }
        }

        // Check against newly placed positions in this batch
        for (const pos of newPositions) {
            const newRect = { x: pos.x, y: pos.y, width: candidate.width, height: candidate.height };
            const expandedNew = {
                x: newRect.x - margin / 2,
                y: newRect.y - margin / 2,
                width: newRect.width + margin,
                height: newRect.height + margin
            };

            if (this.rectsOverlap(candidate, expandedNew)) {
                return false;
            }
        }

        return true;
    },

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
    },

    /**
     * Generate wire positions (need 2, should be spread apart)
     */
    generateWirePositions(walls, bounds, margin = 50) {
        const positions = [];
        const maxAttempts = 50;

        // First wire - prefer left/top area
        let attempts = 0;
        while (attempts < maxAttempts && positions.length === 0) {
            const x = margin + Math.random() * (bounds.width / 2 - margin);
            const y = margin + Math.random() * (bounds.height - 64 - margin);

            const candidate = { x, y, width: 32, height: 32 };
            if (this.isValidPosition(candidate, walls, [], [], margin)) {
                positions.push({ x, y, type: 'end' });
            }
            attempts++;
        }

        // Second wire - prefer right/bottom area, must be far from first
        attempts = 0;
        while (attempts < maxAttempts && positions.length === 1) {
            const x = bounds.width / 2 + Math.random() * (bounds.width / 2 - margin * 2);
            const y = margin + Math.random() * (bounds.height - 64 - margin);

            // Ensure minimum distance from first wire
            const dx = x - positions[0].x;
            const dy = y - positions[0].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 200) { // Minimum 200px apart
                const candidate = { x, y, width: 32, height: 32 };
                if (this.isValidPosition(candidate, walls, positions, [], margin)) {
                    positions.push({ x, y, type: 'end' });
                }
            }
            attempts++;
        }

        // Fallback if couldn't generate spread positions
        if (positions.length < 2) {
            console.warn('Using fallback wire positions');
            return [
                { x: 80, y: 80, type: 'end' },
                { x: bounds.width - 120, y: bounds.height - 120, type: 'end' }
            ];
        }

        return positions;
    },

    /**
     * Generate gear positions
     */
    generateGearPositions(count, walls, bounds, wirePositions, doorPosition, playerStart) {
        // Create list of positions to avoid (wires, door, player start)
        const avoid = [
            ...wirePositions.map(w => ({ x: w.x, y: w.y })),
            { x: doorPosition.x, y: doorPosition.y },
            { x: playerStart.x, y: playerStart.y }
        ];

        return this.generatePositions(count, walls, bounds, 32, 45, avoid);
    }
};
