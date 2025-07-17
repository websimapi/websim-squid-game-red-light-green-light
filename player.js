import * as THREE from 'three';
import { RigidBody, World, Box, Vec3 } from 'cannon-es';

class Player {
    constructor(scene, world) {
        this.scene = scene;
        this.world = world;
        this.playerGroup = new THREE.Group();
        this.ragdollMode = false;
        this.bodyParts = [];
        this.ragdollBodies = [];
        this.position = { x: 0, y: 0, z: 30 };
        
        this.createPlayer();
        this.scene.add(this.playerGroup);
        
        // Position player at start
        this.playerGroup.position.set(0, 0, 30);
    }
    
    createPlayer() {
        // Create player body parts
        this.createTorso();
        this.createHead();
        this.createArms();
        this.createLegs();
    }
    
    createTorso() {
        const torsoGeometry = new THREE.BoxGeometry(1, 1.5, 0.5);
        const torsoMaterial = new THREE.MeshPhongMaterial({ color: 0x4a90e2 });
        const torso = new THREE.Mesh(torsoGeometry, torsoMaterial);
        torso.position.y = 2;
        this.playerGroup.add(torso);
        this.bodyParts.push({ mesh: torso, name: 'torso' });
    }
    
    createHead() {
        const headGeometry = new THREE.SphereGeometry(0.4, 16, 16);
        const headMaterial = new THREE.MeshPhongMaterial({ color: 0xffdbac });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 3.2;
        this.playerGroup.add(head);
        this.bodyParts.push({ mesh: head, name: 'head' });
    }
    
    createArms() {
        const armGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 8);
        const armMaterial = new THREE.MeshPhongMaterial({ color: 0xffdbac });
        
        // Left arm
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.7, 2, 0);
        this.playerGroup.add(leftArm);
        this.bodyParts.push({ mesh: leftArm, name: 'leftArm' });
        
        // Right arm
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(0.7, 2, 0);
        this.playerGroup.add(rightArm);
        this.bodyParts.push({ mesh: rightArm, name: 'rightArm' });
    }
    
    createLegs() {
        const legGeometry = new THREE.CylinderGeometry(0.12, 0.12, 1.2, 8);
        const legMaterial = new THREE.MeshPhongMaterial({ color: 0x2c3e50 });
        
        // Left leg
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.3, 0.6, 0);
        this.playerGroup.add(leftLeg);
        this.bodyParts.push({ mesh: leftLeg, name: 'leftLeg' });
        
        // Right leg
        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.3, 0.6, 0);
        this.playerGroup.add(rightLeg);
        this.bodyParts.push({ mesh: rightLeg, name: 'rightLeg' });
    }
    
    update(deltaTime) {
        if (this.ragdollMode) {
            this.updateRagdoll();
            return;
        }
        
        // Update player position based on movement
        const distance = window.gameState.getPlayerDistance();
        this.playerGroup.position.z = 30 - distance;
        
        // Add running animation
        const speed = window.gameState.getPlayerSpeed();
        if (speed > 0.1) {
            this.animateRunning();
        }
    }
    
    animateRunning() {
        const time = Date.now() * 0.01;
        
        // Animate arms
        const leftArm = this.bodyParts.find(p => p.name === 'leftArm');
        const rightArm = this.bodyParts.find(p => p.name === 'rightArm');
        
        if (leftArm && rightArm) {
            leftArm.mesh.rotation.x = Math.sin(time) * 0.5;
            rightArm.mesh.rotation.x = -Math.sin(time) * 0.5;
        }
        
        // Animate legs
        const leftLeg = this.bodyParts.find(p => p.name === 'leftLeg');
        const rightLeg = this.bodyParts.find(p => p.name === 'rightLeg');
        
        if (leftLeg && rightLeg) {
            leftLeg.mesh.rotation.x = Math.sin(time * 1.2) * 0.3;
            rightLeg.mesh.rotation.x = -Math.sin(time * 1.2) * 0.3;
        }
        
        // Bob up and down
        this.playerGroup.position.y = Math.sin(time * 2) * 0.1;
    }
    
    activateRagdoll() {
        this.ragdollMode = true;
        
        // Create physics bodies for each body part
        this.bodyParts.forEach(part => {
            const worldPos = new THREE.Vector3();
            part.mesh.getWorldPosition(worldPos);
            
            // Create physics body
            const shape = new Box(new Vec3(0.2, 0.2, 0.2));
            const body = new RigidBody(1, shape);
            body.position.set(worldPos.x, worldPos.y, worldPos.z);
            
            // Add some random force
            body.velocity.set(
                (Math.random() - 0.5) * 10,
                Math.random() * 5,
                (Math.random() - 0.5) * 10
            );
            
            this.world.addBody(body);
            this.ragdollBodies.push({ body, mesh: part.mesh });
        });
    }
    
    updateRagdoll() {
        // Update mesh positions from physics bodies
        this.ragdollBodies.forEach(({ body, mesh }) => {
            mesh.position.copy(body.position);
            mesh.quaternion.copy(body.quaternion);
        });
    }
}

export default Player;

