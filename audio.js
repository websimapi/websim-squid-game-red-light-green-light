class AudioManager {
    constructor() {
        this.sounds = {};
        this.audioContext = null;
        this.init();
    }

    async init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            await this.loadSounds();
        } catch (error) {
            console.error('Audio initialization failed:', error);
        }
    }

    async loadSounds() {
        // Load placeholder sounds
        this.sounds = {
            koreanPhrase: await this.createSound('korean-phrase.mp3'),
            gunshot: await this.createSound('gunshot.mp3'),
            victory: await this.createSound('victory.mp3'),
            ambient: await this.createSound('ambient.mp3'),
            dollTurn: await this.createSound('doll-turn.mp3')
        };
    }

    async createSound(filename) {
        // For now, return a placeholder that can play silence
        return {
            play: () => {
                console.log(`Playing: ${filename}`);
            },
            stop: () => {
                console.log(`Stopping: ${filename}`);
            }
        };
    }

    play(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName].play();
        }
    }

    stop(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName].stop();
        }
    }
}

window.audioManager = new AudioManager();

