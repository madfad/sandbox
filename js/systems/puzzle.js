/**
 * Puzzle System - Manages puzzle state and completion
 */

const Puzzle = {
    currentLevel: null,
    isComplete: false,
    completionTime: 0,
    levelStartTime: 0,

    /**
     * Initialize puzzle for a level
     */
    init(level) {
        this.currentLevel = level;
        this.isComplete = false;
        this.completionTime = 0;
        this.levelStartTime = Date.now();
    },

    /**
     * Update puzzle state
     */
    update(player, door) {
        if (this.isComplete) return;

        // Check if circuit is complete
        if (player.isCircuitComplete()) {
            // Check if player is at door
            if (door.isPlayerAtDoor(player)) {
                this.complete();
            }
        }
    },

    /**
     * Mark puzzle as complete
     */
    complete() {
        if (this.isComplete) return;

        this.isComplete = true;
        this.completionTime = Date.now() - this.levelStartTime;

        // Show completion modal
        this.showCompletionModal();
    },

    /**
     * Show level completion modal
     */
    showCompletionModal() {
        const modal = document.getElementById('level-complete-modal');
        const stats = document.getElementById('level-stats');

        const timeSeconds = (this.completionTime / 1000).toFixed(1);
        const gearsCollected = GearManager.getCollectedCount();
        const totalGears = GearManager.getTotalCount();

        if (stats) {
            stats.innerHTML = `
                ⏱️ Time: <strong>${timeSeconds}s</strong><br>
                ⚙️ Gears: <strong>${gearsCollected}/${totalGears}</strong>
            `;
        }

        if (modal) modal.classList.remove('hidden');
    },

    /**
     * Hide completion modal
     */
    hideCompletionModal() {
        const modal = document.getElementById('level-complete-modal');
        if (modal) modal.classList.add('hidden');
    },

    /**
     * Get puzzle hint based on current state
     */
    getHint(player) {
        if (player.connectedWires.length === 0) {
            return 'Find the exposed wire ends and touch them to connect!';
        } else if (player.connectedWires.length === 1) {
            return 'Good! Now find the second wire end to complete the circuit!';
        } else if (!this.currentLevel.door.isOpen) {
            return 'Circuit connected! The door should open now!';
        } else {
            return 'Door unlocked! Walk to the door to proceed!';
        }
    },

    /**
     * Reset puzzle state
     */
    reset() {
        this.isComplete = false;
        this.completionTime = 0;
        this.levelStartTime = Date.now();
    }
};
