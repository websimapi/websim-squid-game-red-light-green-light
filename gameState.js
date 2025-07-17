class GameState {
    constructor() {
        this.state = 'menu'; // menu, playing, redLight, greenLight, gameOver, victory
        this.playerDistance = 0;
        this.finishDistance = 50;
        this.dollTimer = 0;
        this.dollPhase = 'green'; // green, turning, red
        this.dollTurnDuration = 3000; // 3 seconds
        this.dollRedDuration = 2000; // 2 seconds
        this.playerSpeed = 0;
        this.lastFrameTime = 0;
        this.gameStartTime = 0;
        
        this.ui = {
            instructions: document.getElementById('instructions'),
            gameInfo: document.getElementById('gameInfo'),
            status: document.getElementById('status'),
            distance: document.getElementById('distance'),
            speed: document.getElementById('speed')
        };
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        document.getElementById('startButton').addEventListener('click', () => {
            this.startGame();
        });
    }
    
    async startGame() {
        this.state = 'playing';
        this.gameStartTime = Date.now();
        this.playerDistance = 0;
        this.dollTimer = 0;
        this.dollPhase = 'green';
        
        // Hide instructions, show game info
        this.ui.instructions.style.display = 'none';
        this.ui.gameInfo.style.display = 'block';
        
        // Initialize body detection
        await window.bodyDetection.init();
        
        // Start doll cycle
        this.startDollCycle();
        
        // Start audio
        window.audioManager.play('ambient');
    }
    
    startDollCycle() {
        // Random time between 3-10 seconds for green light
        const greenTime = 3000 + Math.random() * 7000;
        
        this.dollPhase = 'green';
        this.dollTimer = greenTime;
        this.updateStatus('GREEN LIGHT - MOVE!');
        this.ui.gameInfo.className = 'green-light';
        
        // Play Korean phrase
        window.audioManager.play('koreanPhrase');
        
        setTimeout(() => {
            this.dollPhase = 'turning';
            this.dollTimer = 1000; // 1 second turn time
            this.updateStatus('DOLL TURNING...');
            window.audioManager.play('dollTurn');
            
            setTimeout(() => {
                this.dollPhase = 'red';
                this.dollTimer = this.dollRedDuration;
                this.updateStatus('RED LIGHT - STOP!');
                this.ui.gameInfo.className = 'red-light';
                
                setTimeout(() => {
                    if (this.state === 'playing') {
                        this.startDollCycle(); // Restart cycle
                    }
                }, this.dollRedDuration);
                
            }, 1000);
        }, greenTime);
    }
    
    update(deltaTime) {
        if (this.state !== 'playing') return;
        
        // Get movement speed from body detection
        this.playerSpeed = window.bodyDetection.getMovementSpeed();
        
        // Check if player is moving during red light
        if (this.dollPhase === 'red' && this.playerSpeed > 0.1) {
            this.gameOver();
            return;
        }
        
        // Update player position during green light
        if (this.dollPhase === 'green') {
            this.playerDistance += this.playerSpeed * deltaTime * 0.01;
        }
        
        // Check victory condition
        if (this.playerDistance >= this.finishDistance) {
            this.victory();
            return;
        }
        
        // Update UI
        this.ui.distance.textContent = `Distance: ${this.playerDistance.toFixed(1)}m`;
        this.ui.speed.textContent = `Speed: ${(this.playerSpeed * 100).toFixed(0)}%`;
    }
    
    gameOver() {
        this.state = 'gameOver';
        this.updateStatus('ELIMINATED!');
        window.audioManager.play('gunshot');
        window.audioManager.stop('ambient');
        
        // Show restart option after 3 seconds
        setTimeout(() => {
            this.ui.instructions.style.display = 'block';
            this.ui.gameInfo.style.display = 'none';
            this.ui.instructions.innerHTML = `
                <h2>ELIMINATED!</h2>
                <p>You moved during red light!</p>
                <button id="restartButton">Try Again</button>
            `;
            
            document.getElementById('restartButton').addEventListener('click', () => {
                this.startGame();
            });
        }, 3000);
    }
    
    victory() {
        this.state = 'victory';
        this.updateStatus('VICTORY!');
        window.audioManager.play('victory');
        window.audioManager.stop('ambient');
        
        setTimeout(() => {
            this.ui.instructions.style.display = 'block';
            this.ui.gameInfo.style.display = 'none';
            this.ui.instructions.innerHTML = `
                <h2>CONGRATULATIONS!</h2>
                <p>You crossed the finish line!</p>
                <button id="playAgainButton">Play Again</button>
            `;
            
            document.getElementById('playAgainButton').addEventListener('click', () => {
                this.startGame();
            });
        }, 3000);
    }
    
    updateStatus(text) {
        this.ui.status.textContent = text;
    }
    
    getDollPhase() {
        return this.dollPhase;
    }
    
    getPlayerDistance() {
        return this.playerDistance;
    }
    
    getPlayerSpeed() {
        return this.playerSpeed;
    }
}

window.gameState = new GameState();

