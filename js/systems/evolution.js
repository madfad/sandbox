/**
 * Evolution System - Handles device switching and unlock notifications
 * Players can switch between any unlocked devices with E (next) and F (previous)
 */

const Evolution = {
    // Track which devices have been unlocked
    unlockedDevices: ['lightSwitch'],
    deviceOrder: ['lightSwitch', 'flashlight', 'magnet', 'fan', 'heater', 'speaker', 'vacuum', 'antenna', 'spring', 'laser', 'drill', 'battery', 'stopwatch'],

    // Modal state
    modalVisible: false,
    pendingUnlock: null,

    /**
     * Initialize evolution system
     */
    init() {
        // Listen for device switching keys
        document.addEventListener('keydown', (e) => {
            if (e.code === 'KeyE') {
                if (this.modalVisible) {
                    this.confirmUnlock();
                } else {
                    this.switchToNextDevice();
                }
            } else if (e.code === 'KeyF') {
                this.switchToPreviousDevice();
            } else if (e.code === 'Escape') {
                this.hideModal();
            }
        });

        // Add click handler for close button
        const closeBtn = document.getElementById('upgrade-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideModal());
        }

        // Reset unlocked devices
        this.unlockedDevices = ['lightSwitch'];
        this.modalVisible = false;
        this.pendingUnlock = null;
    },

    /**
     * Check if player has enough gears to unlock new devices
     */
    checkUnlocks(player) {
        const gearsRequired = {
            'flashlight': 5,
            'magnet': 10,
            'fan': 15,
            'heater': 20,
            'speaker': 25,
            'vacuum': 30,
            'antenna': 35,
            'spring': 40,
            'laser': 45,
            'drill': 50,
            'battery': 55,
            'stopwatch': 60
        };

        for (const [device, required] of Object.entries(gearsRequired)) {
            if (player.gearsCollected >= required && !this.unlockedDevices.includes(device)) {
                // Show unlock modal
                this.showUnlockModal(device, player);
                return true;
            }
        }

        return false;
    },

    /**
     * Show unlock modal popup
     */
    showUnlockModal(deviceType, player) {
        const deviceInfo = player.devices[deviceType];
        if (!deviceInfo) return;

        this.modalVisible = true;
        this.pendingUnlock = deviceType;

        const modal = document.getElementById('upgrade-modal');
        const deviceName = document.querySelector('#next-device-preview .device-name');
        const deviceAbility = document.querySelector('#next-device-preview .device-ability');

        if (deviceName) deviceName.textContent = deviceInfo.name.toUpperCase();
        if (deviceAbility) deviceAbility.textContent = deviceInfo.ability;

        if (modal) modal.classList.remove('hidden');

        console.log(`🔓 Unlock available: ${deviceType}`);
    },

    /**
     * Hide unlock modal (dismiss without switching)
     */
    hideModal() {
        const modal = document.getElementById('upgrade-modal');
        if (modal) modal.classList.add('hidden');

        // Unlock the device anyway (so popup doesn't keep appearing)
        // but DON'T switch to it
        if (this.pendingUnlock && !this.unlockedDevices.includes(this.pendingUnlock)) {
            this.unlockedDevices.push(this.pendingUnlock);
            console.log(`🔓 ${this.pendingUnlock} unlocked (dismissed - not switched)`);
        }

        this.pendingUnlock = null;
        this.modalVisible = false;
    },

    /**
     * Confirm unlock and switch to new device
     */
    confirmUnlock() {
        if (!this.pendingUnlock) return;

        const deviceType = this.pendingUnlock;

        // Add to unlocked devices
        if (!this.unlockedDevices.includes(deviceType)) {
            this.unlockedDevices.push(deviceType);
        }

        // Switch to the new device
        this.switchToDevice(deviceType);

        // Hide modal
        this.pendingUnlock = null;
        this.hideModal();

        // Show success message
        const deviceInfo = Player.devices[deviceType];
        Player.showMessage(`⚡ <strong>${deviceInfo.name} UNLOCKED!</strong> ${deviceInfo.ability}`);

        console.log(`✅ Unlocked and switched to: ${deviceType}`);
    },

    /**
     * Switch to the next unlocked device (E key)
     */
    switchToNextDevice() {
        if (this.unlockedDevices.length <= 1) return;

        const currentIndex = this.deviceOrder.indexOf(Player.deviceType);

        // Find next unlocked device
        for (let i = 1; i <= this.deviceOrder.length; i++) {
            const nextIndex = (currentIndex + i) % this.deviceOrder.length;
            const nextDevice = this.deviceOrder[nextIndex];

            if (this.unlockedDevices.includes(nextDevice) && nextDevice !== Player.deviceType) {
                this.switchToDevice(nextDevice);
                return;
            }
        }
    },

    /**
     * Switch to the previous unlocked device (F key)
     */
    switchToPreviousDevice() {
        if (this.unlockedDevices.length <= 1) return;

        const currentIndex = this.deviceOrder.indexOf(Player.deviceType);

        // Find previous unlocked device
        for (let i = 1; i <= this.deviceOrder.length; i++) {
            const prevIndex = (currentIndex - i + this.deviceOrder.length) % this.deviceOrder.length;
            const prevDevice = this.deviceOrder[prevIndex];

            if (this.unlockedDevices.includes(prevDevice) && prevDevice !== Player.deviceType) {
                this.switchToDevice(prevDevice);
                return;
            }
        }
    },

    /**
     * Switch to a specific device
     */
    switchToDevice(deviceType) {
        if (!this.unlockedDevices.includes(deviceType)) {
            console.warn(`Device ${deviceType} not unlocked`);
            return false;
        }

        if (Player.deviceType === deviceType) return false;

        const oldDevice = Player.deviceType;
        Player.deviceType = deviceType;
        Player.updateUI();

        // Create visual effect
        Particles.createEvolutionEffect(
            Player.x + Player.width / 2,
            Player.y + Player.height / 2
        );

        const deviceInfo = Player.devices[deviceType];
        Player.showMessage(`🔄 Switched to <strong>${deviceInfo.name}</strong>! ${deviceInfo.ability}`);

        console.log(`Switched from ${oldDevice} to ${deviceType}`);
        return true;
    },

    /**
     * Get list of unlocked devices for UI
     */
    getUnlockedDevices() {
        return this.unlockedDevices.map(type => ({
            type,
            ...Player.devices[type],
            isCurrent: type === Player.deviceType
        }));
    },

    /**
     * Check if a specific device is unlocked
     */
    isUnlocked(deviceType) {
        return this.unlockedDevices.includes(deviceType);
    },

    /**
     * Get gear requirement for next locked device
     */
    getNextUnlockRequirement() {
        const gearsRequired = {
            'flashlight': 5,
            'magnet': 10,
            'fan': 15,
            'heater': 20,
            'speaker': 25,
            'vacuum': 30,
            'antenna': 35,
            'spring': 40,
            'laser': 45,
            'drill': 50,
            'battery': 55,
            'stopwatch': 60
        };

        for (const device of this.deviceOrder) {
            if (!this.unlockedDevices.includes(device)) {
                return { device, gears: gearsRequired[device] };
            }
        }

        return null; // All unlocked
    }
};
