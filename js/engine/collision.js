/**
 * Collision Module - Collision detection system
 */

const Collision = {
    /**
     * Check if two rectangles overlap
     */
    rectRect(rect1, rect2) {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    },

    /**
     * Check if a point is inside a rectangle
     */
    pointRect(px, py, rect) {
        return (
            px >= rect.x &&
            px <= rect.x + rect.width &&
            py >= rect.y &&
            py <= rect.y + rect.height
        );
    },

    /**
     * Check if two circles overlap
     */
    circleCircle(c1, c2) {
        const dx = c1.x - c2.x;
        const dy = c1.y - c2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < c1.radius + c2.radius;
    },

    /**
     * Check if a circle overlaps a rectangle
     */
    circleRect(circle, rect) {
        // Find the closest point on the rectangle to the circle center
        const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
        const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));

        // Calculate distance from circle center to closest point
        const dx = circle.x - closestX;
        const dy = circle.y - closestY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance < circle.radius;
    },

    /**
     * Get distance between two entities
     */
    distance(entity1, entity2) {
        const dx = (entity1.x + entity1.width / 2) - (entity2.x + entity2.width / 2);
        const dy = (entity1.y + entity1.height / 2) - (entity2.y + entity2.height / 2);
        return Math.sqrt(dx * dx + dy * dy);
    },

    /**
     * Check player collision with level walls
     * Returns adjusted position
     */
    resolveWallCollision(player, walls, canvasWidth, canvasHeight) {
        let newX = player.x;
        let newY = player.y;

        // Canvas bounds
        if (newX < 0) newX = 0;
        if (newY < 0) newY = 0;
        if (newX + player.width > canvasWidth) newX = canvasWidth - player.width;
        if (newY + player.height > canvasHeight) newY = canvasHeight - player.height;

        // Wall collisions
        walls.forEach(wall => {
            const playerRect = { x: newX, y: newY, width: player.width, height: player.height };

            if (this.rectRect(playerRect, wall)) {
                // Find the minimum translation to resolve collision
                const overlapLeft = (playerRect.x + playerRect.width) - wall.x;
                const overlapRight = (wall.x + wall.width) - playerRect.x;
                const overlapTop = (playerRect.y + playerRect.height) - wall.y;
                const overlapBottom = (wall.y + wall.height) - playerRect.y;

                const minOverlapX = Math.min(overlapLeft, overlapRight);
                const minOverlapY = Math.min(overlapTop, overlapBottom);

                if (minOverlapX < minOverlapY) {
                    if (overlapLeft < overlapRight) {
                        newX = wall.x - player.width;
                    } else {
                        newX = wall.x + wall.width;
                    }
                } else {
                    if (overlapTop < overlapBottom) {
                        newY = wall.y - player.height;
                    } else {
                        newY = wall.y + wall.height;
                    }
                }
            }
        });

        return { x: newX, y: newY };
    },

    /**
     * Check if player is touching a wire end
     */
    checkWireCollision(player, wire) {
        const playerCenter = {
            x: player.x + player.width / 2,
            y: player.y + player.height / 2,
            radius: player.width / 2
        };

        const wireCenter = {
            x: wire.x + wire.width / 2,
            y: wire.y + wire.height / 2,
            radius: wire.width / 2 + 10 // Larger hitbox for easier interaction
        };

        return this.circleCircle(playerCenter, wireCenter);
    },

    /**
     * Check if player is touching a collectible gear
     */
    checkGearCollision(player, gear) {
        if (gear.collected) return false;

        return this.rectRect(
            { x: player.x, y: player.y, width: player.width, height: player.height },
            { x: gear.x, y: gear.y, width: gear.width, height: gear.height }
        );
    },

    /**
     * Check if player is at the door
     */
    checkDoorCollision(player, door) {
        return this.rectRect(
            { x: player.x, y: player.y, width: player.width, height: player.height },
            { x: door.x, y: door.y, width: door.width, height: door.height }
        );
    }
};
