/**
 * APEX MOTORS // OFFICIAL 3D FERRARI SUPERCAR SHOWROOM
 * Built with Three.js (WebGL) + DRACOLoader
 * High-detail realistic Ferrari 3D model with PBR clearcoat paint,
 * ambient occlusion contact shadow, reflective turntable, overhead linear LED softboxes,
 * studio neon pillars, and 60 FPS mobile touch orbit
 */

class CinematicCarStudio {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.carModel = null;
    this.bodyMaterial = null;
    this.detailsMaterial = null;
    this.glassMaterial = null;
    this.wheelMeshes = [];
    this.exhaustFlames = [];

    this.isAutoRotating = true;

    // Smooth Orbit & Camera State
    this.targetTheta = 0.65;
    this.targetPhi = 0.28;
    this.currentTheta = 0.65;
    this.currentPhi = 0.28;
    this.targetRadius = 5.2;
    this.currentRadius = 5.2;

    this.init();
  }

  init() {
    if (typeof THREE === 'undefined') {
      console.error('Three.js is required');
      return;
    }

    const container = document.querySelector('.car-viewer-container');
    const canvas = document.getElementById('car-3d-canvas');
    if (!container || !canvas) return;

    const width = container.clientWidth || 900;
    const height = container.clientHeight || 500;

    // 1. High-Performance WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.8;
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    this.updateCamera();

    // 2. Synthetic HDRI Studio Reflection Environment
    this.setupStudioEnvironment();

    // 3. Cinematic 3-Point Studio Lighting
    this.setupLighting();

    // 4. Luxury Showroom Stage (Reflective Floor, Platform, Overhead LED Tubes & Neon Pillars)
    this.setupShowroomStage();

    // 5. Load Real Ferrari 3D Model with DRACOLoader
    this.loadFerrariModel();

    // 6. Bind Touch, Mouse & UI Controls
    this.setupInteractions(canvas);
    this.bindUI();

    // 7. Window Resize Handler
    window.addEventListener('resize', () => {
      const w = container.clientWidth || 900;
      const h = container.clientHeight || 500;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });

    // 8. 60 FPS Render Loop
    const animate = () => {
      requestAnimationFrame(animate);

      if (this.isAutoRotating) {
        this.targetTheta += 0.0035;
      }

      // Smooth Lerp Damping
      this.currentTheta += (this.targetTheta - this.currentTheta) * 0.08;
      this.currentPhi += (this.targetPhi - this.currentPhi) * 0.08;
      this.currentRadius += (this.targetRadius - this.currentRadius) * 0.08;

      this.updateCamera();

      // Exhaust flame particles decay
      for (let i = this.exhaustFlames.length - 1; i >= 0; i--) {
        const flame = this.exhaustFlames[i];
        flame.position.z -= 0.1;
        flame.scale.multiplyScalar(0.88);
        flame.material.opacity *= 0.88;
        if (flame.scale.x < 0.02) {
          this.scene.remove(flame);
          this.exhaustFlames.splice(i, 1);
        }
      }

      this.renderer.render(this.scene, this.camera);
    };

    animate();
  }

  updateCamera() {
    this.camera.position.x = this.currentRadius * Math.sin(this.currentPhi) * Math.sin(this.currentTheta);
    this.camera.position.y = this.currentRadius * Math.cos(this.currentPhi) + 0.35;
    this.camera.position.z = this.currentRadius * Math.sin(this.currentPhi) * Math.cos(this.currentTheta);
    this.camera.lookAt(0, 0.25, 0);
  }

  /* ==========================================================================
     SYNTHETIC STUDIO HDRI (Clearcoat Specular Reflection)
     ========================================================================== */
  setupStudioEnvironment() {
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    pmremGenerator.compileEquirectangularShader();

    const envCanvas = document.createElement('canvas');
    envCanvas.width = 1024;
    envCanvas.height = 512;
    const ctx = envCanvas.getContext('2d');

    // Studio Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 512);
    skyGrad.addColorStop(0, '#040711');
    skyGrad.addColorStop(0.5, '#0d1324');
    skyGrad.addColorStop(1, '#05070e');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 1024, 512);

    // Overhead Key Softbox Reflection
    const keySoftbox = ctx.createRadialGradient(512, 100, 0, 512, 100, 240);
    keySoftbox.addColorStop(0, 'rgba(255, 250, 240, 0.9)');
    keySoftbox.addColorStop(0.5, 'rgba(255, 250, 240, 0.4)');
    keySoftbox.addColorStop(1, 'rgba(255, 250, 240, 0)');
    ctx.fillStyle = keySoftbox;
    ctx.fillRect(250, 0, 524, 250);

    // Cyan & Amber Side Studio Lights
    ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.fillRect(60, 120, 240, 100);

    ctx.fillStyle = 'rgba(245, 158, 11, 0.35)';
    ctx.fillRect(720, 120, 240, 100);

    const envTexture = new THREE.CanvasTexture(envCanvas);
    envTexture.mapping = THREE.EquirectangularReflectionMapping;
    const envRenderTarget = pmremGenerator.fromEquirectangular(envTexture);
    this.scene.environment = envRenderTarget.texture;
  }

  /* ==========================================================================
     CINEMATIC 3-POINT STUDIO LIGHTING
     ========================================================================== */
  setupLighting() {
    // Ambient fill
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambient);

    // Key Spotlight (Casts specular reflections on the car hood)
    const keySpot = new THREE.SpotLight(0xfff8ee, 4.5, 30, Math.PI / 4.2, 0.35, 1.5);
    keySpot.position.set(4, 8, 5);
    this.scene.add(keySpot);
    this.scene.add(keySpot.target);

    // Cyan Rim Light (Carves out the silhouette from the rear)
    const rimSpot = new THREE.SpotLight(0x38bdf8, 3.5, 25, Math.PI / 3.5, 0.5, 2.0);
    rimSpot.position.set(-5, 5, -6);
    this.scene.add(rimSpot);
    this.scene.add(rimSpot.target);

    // Golden Ground Bounce Light
    const groundBounce = new THREE.PointLight(0xf59e0b, 2.0, 8);
    groundBounce.position.set(0, -0.4, 0);
    this.scene.add(groundBounce);

    // Rear Taillight Accent Light
    const rearRedLight = new THREE.PointLight(0xff1e38, 1.8, 8);
    rearRedLight.position.set(0, 0.8, -4);
    this.scene.add(rearRedLight);
  }

  /* ==========================================================================
     LUXURY SHOWROOM STAGE
     ========================================================================== */
  setupShowroomStage() {
    // A. Reflective Showroom Floor
    const floorGeo = new THREE.CylinderGeometry(4.2, 4.5, 0.15, 64);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x05070e,
      metalness: 0.95,
      roughness: 0.12,
      envMapIntensity: 2.8
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.y = -0.08;
    this.scene.add(floorMesh);

    // B. Glowing Golden Platform Ring
    const ringGeo = new THREE.TorusGeometry(4.25, 0.04, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.005;
    this.scene.add(ring);

    // C. Suspended Overhead Linear LED Softbox Tubes
    const ledTubeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    [-1.8, 0, 1.8].forEach(x => {
      const tubeGeo = new THREE.CylinderGeometry(0.035, 0.035, 4.5, 16);
      const tube = new THREE.Mesh(tubeGeo, ledTubeMat);
      tube.rotation.x = Math.PI / 2;
      tube.position.set(x, 2.8, 0);
      this.scene.add(tube);

      const tubeLight = new THREE.PointLight(0xffffff, 0.8, 5);
      tubeLight.position.set(x, 2.6, 0);
      this.scene.add(tubeLight);
    });

    // D. Vertical Studio Neon Light Pillars (Cinematic Depth)
    const pillarPositions = [
      { x: -3.5, z: -3.5, color: 0x38bdf8 },
      { x: 3.5, z: -3.5, color: 0xf59e0b },
      { x: -4.2, z: 2.0, color: 0x38bdf8 },
      { x: 4.2, z: 2.0, color: 0xf59e0b }
    ];

    pillarPositions.forEach(p => {
      const pillarGeo = new THREE.CylinderGeometry(0.025, 0.025, 3.2, 12);
      const pillarMat = new THREE.MeshBasicMaterial({ color: p.color });
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.set(p.x, 1.4, p.z);
      this.scene.add(pillar);

      const pLight = new THREE.PointLight(p.color, 1.0, 4);
      pLight.position.set(p.x, 1.4, p.z);
      this.scene.add(pLight);
    });
  }

  /* ==========================================================================
     LOAD REAL FERRARI 3D MODEL WITH DRACOLOADER
     ========================================================================== */
  loadFerrariModel() {
    const hint = document.querySelector('.viewer-hint');
    if (hint) hint.textContent = '⟳ LOADING 3D HYPERCAR...';

    // 1. Define Photorealistic PBR Materials
    this.bodyMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xc41e3a, // Carmine Red Default
      metalness: 0.75,
      roughness: 0.22,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      envMapIntensity: 2.5
    });

    this.detailsMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 1.0,
      roughness: 0.25,
      envMapIntensity: 2.8
    });

    this.glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x111827,
      metalness: 0.1,
      roughness: 0.05,
      transmission: 0.85,
      transparent: true,
      opacity: 0.9,
      envMapIntensity: 2.5
    });

    // 2. Setup DRACOLoader & GLTFLoader
    const dracoLoader = new THREE.DRACOLoader();
    dracoLoader.setDecoderPath('scripts/draco/');

    const gltfLoader = new THREE.GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    // 3. Load Ambient Occlusion Ground Contact Shadow
    const shadowTexture = new THREE.TextureLoader().load('models/ferrari_ao.png');

    gltfLoader.load(
      'models/ferrari.glb',
      (gltf) => {
        const car = gltf.scene.children[0] || gltf.scene;

        // Assign Specific High-End Materials by Name
        const bodyPart = car.getObjectByName('body');
        if (bodyPart) bodyPart.material = this.bodyMaterial;

        const rimParts = ['rim_fl', 'rim_fr', 'rim_rr', 'rim_rl', 'trim'];
        rimParts.forEach(name => {
          const part = car.getObjectByName(name);
          if (part) part.material = this.detailsMaterial;
        });

        const glassPart = car.getObjectByName('glass');
        if (glassPart) glassPart.material = this.glassMaterial;

        // Collect Wheels
        this.wheelMeshes = [];
        ['wheel_fl', 'wheel_fr', 'wheel_rl', 'wheel_rr'].forEach(name => {
          const w = car.getObjectByName(name);
          if (w) this.wheelMeshes.push(w);
        });

        // Add Realistic Ground Contact Shadow
        const shadowMesh = new THREE.Mesh(
          new THREE.PlaneGeometry(0.655 * 4, 1.3 * 4),
          new THREE.MeshBasicMaterial({
            map: shadowTexture,
            blending: THREE.MultiplyBlending,
            toneMapped: false,
            transparent: true,
            opacity: 0.85
          })
        );
        shadowMesh.rotation.x = -Math.PI / 2;
        shadowMesh.position.y = 0.002;
        shadowMesh.renderOrder = 2;
        car.add(shadowMesh);

        this.scene.add(car);
        this.carModel = car;

        if (hint) hint.textContent = 'DRAG 360° TO ROTATE • PINCH TO ZOOM';
      },
      (xhr) => {
        const pct = xhr.total > 0 ? Math.round((xhr.loaded / xhr.total) * 100) : '';
        if (hint) hint.textContent = `⟳ LOADING 3D HYPERCAR... ${pct}%`;
      },
      (error) => {
        console.error('Error loading Ferrari 3D model:', error);
        if (hint) hint.textContent = 'DRAG 360° TO ROTATE • PINCH TO ZOOM';
      }
    );
  }

  /* ==========================================================================
     PAINT COLOR CHANGER
     ========================================================================== */
  setPaintColor(hexColor) {
    if (this.bodyMaterial) {
      this.bodyMaterial.color.setStyle(hexColor);
      this.bodyMaterial.needsUpdate = true;
    }
  }

  /* ==========================================================================
     INTERACTIONS (Mouse & 1-Finger Touch Orbit with Inertia)
     ========================================================================== */
  setupInteractions(canvas) {
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;

    const onStart = (x, y) => {
      isDragging = true;
      this.isAutoRotating = false;
      prevX = x;
      prevY = y;
    };

    const onMove = (x, y) => {
      if (!isDragging) return;
      const dx = x - prevX;
      const dy = y - prevY;

      this.targetTheta -= dx * 0.01;
      this.targetPhi = Math.max(0.08, Math.min(1.48, this.targetPhi + dy * 0.01));

      prevX = x;
      prevY = y;
    };

    const onEnd = () => {
      isDragging = false;
    };

    // Mouse Events
    canvas.addEventListener('mousedown', e => onStart(e.clientX, e.clientY));
    window.addEventListener('mousemove', e => onMove(e.clientX, e.clientY));
    window.addEventListener('mouseup', onEnd);

    // Mobile Touch Events (1-Finger Orbit)
    canvas.addEventListener('touchstart', e => {
      if (e.touches.length === 1) {
        onStart(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    canvas.addEventListener('touchmove', e => {
      if (e.touches.length === 1) {
        onMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    canvas.addEventListener('touchend', onEnd);

    // Pinch Zoom (2-Finger)
    let lastPinchDist = 0;
    canvas.addEventListener('touchstart', e => {
      if (e.touches.length === 2) {
        lastPinchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    }, { passive: true });

    canvas.addEventListener('touchmove', e => {
      if (e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        this.targetRadius = Math.max(2.5, Math.min(9.0, this.targetRadius - (dist - lastPinchDist) * 0.01));
        lastPinchDist = dist;
      }
    }, { passive: true });

    // Mouse Wheel Zoom
    canvas.addEventListener('wheel', e => {
      e.preventDefault();
      this.targetRadius = Math.max(2.5, Math.min(9.0, this.targetRadius + e.deltaY * 0.005));
    }, { passive: false });
  }

  /* ==========================================================================
     UI BINDINGS & SOUNDS
     ========================================================================== */
  bindUI() {
    // Paint Swatches
    const swatches = document.querySelectorAll('.swatch-btn');
    swatches.forEach(btn => {
      btn.addEventListener('click', () => {
        swatches.forEach(s => s.classList.remove('active'));
        btn.classList.add('active');
        const color = btn.getAttribute('data-color');
        this.setPaintColor(color);
        if (window.carAudio) window.carAudio.playClick();
      });
    });

    // Rev V8 Engine
    const btnRev = document.getElementById('btn-rev');
    if (btnRev) {
      btnRev.addEventListener('click', () => {
        if (window.carAudio) window.carAudio.playEngineRev();
        this.spawnExhaustFlames();
        this.shakeSuspension();
      });
    }

    // Toggle Turntable Auto-Rotate
    const btnTurntable = document.getElementById('btn-turntable');
    if (btnTurntable) {
      btnTurntable.addEventListener('click', () => {
        this.isAutoRotating = !this.isAutoRotating;
        btnTurntable.classList.toggle('active', this.isAutoRotating);
        if (window.carAudio) window.carAudio.playClick();
      });
    }

    // Camera Angle Presets
    const btnPresets = document.querySelectorAll('.btn-preset');
    btnPresets.forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.getAttribute('data-view');
        this.isAutoRotating = false;
        if (view === 'front') {
          this.targetTheta = -0.38;
          this.targetPhi = 0.25;
          this.targetRadius = 5.0;
        } else if (view === 'side') {
          this.targetTheta = Math.PI / 2;
          this.targetPhi = 0.25;
          this.targetRadius = 4.8;
        } else if (view === 'rear') {
          this.targetTheta = Math.PI + 0.38;
          this.targetPhi = 0.25;
          this.targetRadius = 5.0;
        } else if (view === 'reset') {
          this.targetTheta = 0.65;
          this.targetPhi = 0.28;
          this.targetRadius = 5.2;
          this.isAutoRotating = true;
        }
        if (window.carAudio) window.carAudio.playClick();
      });
    });
  }

  // Exhaust Blue Flame Animation
  spawnExhaustFlames() {
    if (!this.carModel) return;
    const cx = this.carModel.position.x;
    const cy = this.carModel.position.y;
    const cz = this.carModel.position.z;

    [-0.35, -0.15, 0.15, 0.35].forEach(ox => {
      for (let i = 0; i < 5; i++) {
        const flameGeo = new THREE.SphereGeometry(0.05 + Math.random() * 0.05, 8, 8);
        const flameMat = new THREE.MeshBasicMaterial({
          color: Math.random() > 0.4 ? 0x38bdf8 : 0xf59e0b,
          transparent: true,
          opacity: 0.95,
          blending: THREE.AdditiveBlending
        });
        const flame = new THREE.Mesh(flameGeo, flameMat);
        flame.position.set(cx + ox, cy + 0.15, cz - 1.2 - i * 0.2);
        this.scene.add(flame);
        this.exhaustFlames.push(flame);
      }
    });
  }

  shakeSuspension() {
    if (!this.carModel) return;
    const startY = this.carModel.position.y;
    let count = 0;
    const interval = setInterval(() => {
      count++;
      this.carModel.position.y = startY + (Math.random() - 0.5) * 0.035;
      if (count > 22) {
        clearInterval(interval);
        this.carModel.position.y = startY;
      }
    }, 32);
  }
}

// Instantiate on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.cinematicCarStudio = new CinematicCarStudio();
});
