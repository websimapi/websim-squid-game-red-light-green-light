class BodyDetection {
    constructor() {
        this.pose = null;
        this.camera = null;
        this.video = null;
        this.canvas = null;
        this.ctx = null;
        this.isInitialized = false;
        this.currentPose = null;
        this.movementDetector = new MovementDetector();
    }

    async init() {
        this.video = document.getElementById('webcam');
        this.canvas = document.getElementById('poseCanvas');
        this.ctx = this.canvas.getContext('2d');

        try {
            // Get webcam stream
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480 }
            });
            this.video.srcObject = stream;
            
            // Initialize pose detection (simplified for demo)
            this.isInitialized = true;
            this.startDetection();
            
        } catch (error) {
            console.error('Failed to initialize body detection:', error);
        }
    }

    startDetection() {
        // Simplified pose detection loop
        const detect = () => {
            if (!this.isInitialized) return;
            
            // Simulate pose detection with random movements
            this.simulatePoseDetection();
            
            requestAnimationFrame(detect);
        };
        
        detect();
    }

    simulatePoseDetection() {
        // Simulate body pose landmarks for demo
        const now = Date.now();
        const simulatedPose = {
            leftWrist: {
                x: 0.3 + Math.sin(now * 0.005) * 0.1,
                y: 0.5 + Math.cos(now * 0.003) * 0.1
            },
            rightWrist: {
                x: 0.7 + Math.sin(now * 0.004) * 0.1,
                y: 0.5 + Math.cos(now * 0.006) * 0.1
            },
            leftAnkle: {
                x: 0.4 + Math.sin(now * 0.007) * 0.05,
                y: 0.8 + Math.cos(now * 0.008) * 0.05
            },
            rightAnkle: {
                x: 0.6 + Math.sin(now * 0.009) * 0.05,
                y: 0.8 + Math.cos(now * 0.007) * 0.05
            }
        };

        this.currentPose = simulatedPose;
        this.movementDetector.update(simulatedPose);
        this.drawPose(simulatedPose);
    }

    drawPose(pose) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#44ff44';
        
        // Draw pose points
        Object.values(pose).forEach(point => {
            this.ctx.beginPath();
            this.ctx.arc(
                point.x * this.canvas.width,
                point.y * this.canvas.height,
                5, 0, 2 * Math.PI
            );
            this.ctx.fill();
        });
    }

    getMovementSpeed() {
        return this.movementDetector.getSpeed();
    }
}

class MovementDetector {
    constructor() {
        this.previousPose = null;
        this.movementHistory = [];
        this.speed = 0;
    }

    update(pose) {
        if (!this.previousPose) {
            this.previousPose = pose;
            return;
        }

        // Calculate movement
        let totalMovement = 0;
        
        ['leftWrist', 'rightWrist', 'leftAnkle', 'rightAnkle'].forEach(joint => {
            if (pose[joint] && this.previousPose[joint]) {
                const dx = pose[joint].x - this.previousPose[joint].x;
                const dy = pose[joint].y - this.previousPose[joint].y;
                totalMovement += Math.sqrt(dx * dx + dy * dy);
            }
        });

        // Update movement history
        this.movementHistory.push(totalMovement);
        if (this.movementHistory.length > 10) {
            this.movementHistory.shift();
        }

        // Calculate speed
        this.speed = this.movementHistory.reduce((a, b) => a + b, 0) / this.movementHistory.length;
        this.speed = Math.min(this.speed * 100, 1); // Normalize to 0-1

        this.previousPose = pose;
    }

    getSpeed() {
        return this.speed;
    }
}

window.bodyDetection = new BodyDetection();

