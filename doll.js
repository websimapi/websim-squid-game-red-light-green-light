import * as THREE from 'three';

class Doll {
    constructor(scene) {
        this.scene = scene;
        this.dollGroup = new THREE.Group();
        this.head = null;
        this.body = null;
        this.isHeadTurned = false;
        this.headTurnSpeed = 0.05;
        this.targetHeadRotation = 0;
        this.currentHeadRotation = 0;
        
        this.createDoll();
        this.scene.add(this.dollGroup);
    }
    
    createDoll() {
        // Create doll body
        const bodyGeometry = new THREE.CylinderGeometry(1, 1.5, 4, 8);
        const bodyMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xff6b6b,
            shininess: 30
        });
        this.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.body.position.y = 2;
        this.dollGroup.add(this.body);
        
        // Create doll head
        const headGeometry = new THREE.SphereGeometry(1.2, 16, 16);
        const headMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xffdbac,
            shininess: 50
        });
        this.head = new THREE.Mesh(headGeometry, headMaterial);
        this.head.position.y = 5;
        this.dollGroup.add(this.head);
        
        // Create face features
        this.createFace();
        
        // Create arms
        this.createArms();
        
        // Create legs
        this.createLegs();
        
        // Position doll at the end of the track
        this.dollGroup.position.set(0, 0, -45);
        this.dollGroup.scale.setScalar(1.5);
        
        // Initially face the tree (away from players)
        this.dollGroup.rotation.y = Math.PI;
    }
    
    createFace() {
        // Eyes
        const eyeGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.3, 0.2, 1.1);
        this.head.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.3, 0.2, 1.1);
        this.head.add(rightEye);
        
        // Mouth
        const mouthGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 8);
        const mouthMaterial = new THREE.MeshPhongMaterial({ color: 0x8b0000 });
        const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
        mouth.position.set(0, -0.3, 1.1);
        mouth.rotation.x = Math.PI / 2;
        this.head.add(mouth);
        
        // Hair
        const hairGeometry = new THREE.SphereGeometry(1.3, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
        const hairMaterial = new THREE.MeshPhongMaterial({ color: 0x2c1810 });
        const hair = new THREE.Mesh(hairGeometry, hairMaterial);
        hair.position.y = 0.5;
        this.head.add(hair);
    }
    
    createArms() {
        const armGeometry = new THREE.CylinderGeometry(0.2, 0.2, 2, 8);
        const armMaterial = new THREE.MeshPhongMaterial({ color: 0xffdbac });
        
        // Left arm
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-1.5, 1, 0);
        leftArm.rotation.z = Math.PI / 6;
        this.dollGroup.add(leftArm);
        
        // Right arm
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(1.5, 1, 0);
        rightArm.rotation.z = -Math.PI / 6;
        this.dollGroup.add(rightArm);
    }
    
    createLegs() {
        const legGeometry = new THREE.CylinderGeometry(0.25, 0.25, 2, 8);
        const legMaterial = new THREE.MeshPhongMaterial({ color: 0xffdbac });
        
        // Left leg
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.7, -1, 0);
        this.dollGroup.add(leftLeg);
        
        // Right leg
        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.7, -1, 0);
        this.dollGroup.add(rightLeg);
    }
    
    update() {
        const dollPhase = window.gameState.getDollPhase();
        
        // Set target head rotation based on phase
        if (dollPhase === 'green') {
            this.targetHeadRotation = 0; // Face tree
        } else if (dollPhase === 'red') {
            this.targetHeadRotation = Math.PI; // Face players
        }
        
        // Smoothly rotate head
        const rotationDiff = this.targetHeadRotation - this.currentHeadRotation;
        if (Math.abs(rotationDiff) > 0.01) {
            this.currentHeadRotation += rotationDiff * this.headTurnSpeed;
            this.head.rotation.y = this.currentHeadRotation;
        }
        
        // Add slight swaying animation
        const time = Date.now() * 0.001;
        this.dollGroup.rotation.x = Math.sin(time * 0.5) * 0.02;
        this.dollGroup.position.y = Math.sin(time * 0.7) * 0.1;
    }
    
    turnHead(direction) {
        if (direction === 'players') {
            this.targetHeadRotation = Math.PI;
        } else {
            this.targetHeadRotation = 0;
        }
    }
}

export default Doll;

