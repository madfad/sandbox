/**
 * Input Module - Keyboard and mouse handling
 */

const Input = {
    keys: {},
    keyJustPressed: {},
    mouseX: 0,
    mouseY: 0,
    mouseDown: false,

    /**
     * Initialize input handlers
     */
    init() {
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));

        const canvas = document.getElementById('game-canvas');
        canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));

        console.log('🎮 Input initialized');
    },

    /**
     * Handle key down
     */
    onKeyDown(e) {
        if (!this.keys[e.code]) {
            this.keyJustPressed[e.code] = true;
        }
        this.keys[e.code] = true;

        // Prevent default for game keys
        const gameKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
            'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyE', 'Space'];
        if (gameKeys.includes(e.code)) {
            e.preventDefault();
        }
    },

    /**
     * Handle key up
     */
    onKeyUp(e) {
        this.keys[e.code] = false;
    },

    /**
     * Handle mouse move
     */
    onMouseMove(e) {
        const rect = e.target.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;
    },

    /**
     * Handle mouse down
     */
    onMouseDown(e) {
        this.mouseDown = true;
    },

    /**
     * Handle mouse up
     */
    onMouseUp(e) {
        this.mouseDown = false;
    },

    /**
     * Check if a key is currently held down
     */
    isKeyDown(code) {
        return this.keys[code] === true;
    },

    /**
     * Check if a key was just pressed this frame
     */
    isKeyJustPressed(code) {
        return this.keyJustPressed[code] === true;
    },

    /**
     * Get movement direction vector
     */
    getMovementVector() {
        let dx = 0;
        let dy = 0;

        if (this.isKeyDown('ArrowUp') || this.isKeyDown('KeyW')) dy = -1;
        if (this.isKeyDown('ArrowDown') || this.isKeyDown('KeyS')) dy = 1;
        if (this.isKeyDown('ArrowLeft') || this.isKeyDown('KeyA')) dx = -1;
        if (this.isKeyDown('ArrowRight') || this.isKeyDown('KeyD')) dx = 1;

        // Normalize diagonal movement
        if (dx !== 0 && dy !== 0) {
            const length = Math.sqrt(dx * dx + dy * dy);
            dx /= length;
            dy /= length;
        }

        return { x: dx, y: dy };
    },

    /**
     * Clear just pressed states (call at end of frame)
     */
    clearJustPressed() {
        this.keyJustPressed = {};
    }
};
