import * as THREE from 'three';
import { World, NaiveBroadphase, Vec3, ContactMaterial } from 'cannon-es';
import Doll from './doll.js';
import Player from './player.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.world = null;
        this.doll = null;
        this.player = null;
        this.lastTime = 0;
        
        this.init();
        this.animate();
    }
    
    init() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 5, 35);
        this.camera.lookAt(0, 0, 0);
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvas,
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Initialize physics world
        this.world = new World();
        this.world.gravity.set(0, -9.82, 0);
        this.world.broadphase = new NaiveBroadphase();
        
        // Create environment
        this.createEnvironment();
        
        // Create lighting
        this.createLighting();
        
        // Create game objects
        this.doll = new Doll(this.scene);
        this.player = new Player(this.scene, this.world);
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    createEnvironment() {
        // Create ground
        const groundGeometry = new THREE.PlaneGeometry(20, 80);
        const groundMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x90EE90,
            side: THREE.DoubleSide
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
        
        // Create track lines
        const lineGeometry = new THREE.PlaneGeometry(0.2, 80);
        const lineMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
        
        // Side lines
        const leftLine = new THREE.Mesh(lineGeometry, lineMaterial);
        leftLine.rotation.x = -Math.PI / 2;
        leftLine.position.set(-5, 0.01, 0);
        this.scene.add(leftLine);
        
        const rightLine = new THREE.Mesh(lineGeometry, lineMaterial);
        rightLine.rotation.x = -Math.PI / 2;
        rightLine.position.set(5, 0.01, 0);
        this.scene.add(rightLine);
        
        // Finish line
        const finishGeometry = new THREE.PlaneGeometry(10, 0.5);
        const finishMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
        const finishLine = new THREE.Mesh(finishGeometry, finishMaterial);
        finishLine.rotation.x = -Math.PI / 2;
        finishLine.position.set(0, 0.01, -20);
        this.scene.add(finishLine);
        
        // Create tree behind doll
        this.createTree();
        
        // Create barriers/walls
        this.createBarriers();
    }
    
    createTree() {
        // Tree trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.7, 8, 8);
        const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.set(0, 4, -50);
        trunk.castShadow = true;
        this.scene.add(trunk);
        
        // Tree crown
        const crownGeometry = new THREE.SphereGeometry(4, 16, 16);
        const crownMaterial = new THREE.MeshPhongMaterial({ color: 0x228B22 });
        const crown = new THREE.Mesh(crownGeometry, crownMaterial);
        crown.position.set(0, 10, -50);
        crown.castShadow = true;
        this.scene.add(crown);
    }
    
    createBarriers() {
        // Create side barriers
        const barrierGeometry = new THREE.BoxGeometry(1, 5, 80);
        const barrierMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
        
        const leftBarrier = new THREE.Mesh(barrierGeometry, barrierMaterial);
        leftBarrier.position.set(-12, 2.5, 0);
        leftBarrier.castShadow = true;
        this.scene.add(leftBarrier);
        
        const rightBarrier = new THREE.Mesh(barrierGeometry, barrierMaterial);
        rightBarrier.position.set(12, 2.5, 0);
        rightBarrier.castShadow = true;
        this.scene.add(rightBarrier);
    }
    
    createLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);
        
        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 100;
        directionalLight.shadow.camera.left = -20;
        directionalLight.shadow.camera.right = 20;
        directionalLight.shadow.camera.top = 20;
        directionalLight.shadow.camera.bottom = -20;
        this.scene.add(directionalLight);
        
        // Point light for dramatic effect
        const pointLight = new THREE.PointLight(0xff4444, 0.5, 50);
        pointLight.position.set(0, 10, -40);
        this.scene.add(pointLight);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const currentTime = Date.now();
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Update game state
        window.gameState.update(deltaTime);
        
        // Update physics
        this.world.step(1/60);
        
        // Update game objects
        if (this.doll) this.doll.update();
        if (this.player) this.player.update(deltaTime);
        
        // Check for game over condition
        if (window.gameState.state === 'gameOver' && this.player && !this.player.ragdollMode) {
            this.player.activateRagdoll();
        }
        
        // Update camera position to follow player
        this.updateCamera();
        
        // Render
        this.renderer.render(this.scene, this.camera);
    }
    
    updateCamera() {
        if (this.player) {
            const playerZ = this.player.playerGroup.position.z;
            this.camera.position.z = playerZ + 5;
            this.camera.lookAt(0, 2, playerZ - 10);
        }
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Game();
});

