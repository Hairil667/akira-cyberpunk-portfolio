/**
 * APEX MOTORS // CINEMATIC 3D SUPERCAR STUDIO
 * Features:
 * - Real Ferrari 3D GLB Model (High-Poly, Photorealistic PBR Paint)
 * - Ultra-Reflective Dark Showroom Floor & Illuminated Turntable
 * - Suspended Linear Overhead LED Softbox Tubes (Real Supercar Studio Reflections)
 * - Vertical Studio Neon Pillars for Cinematic Depth
 * - ACES Filmic Tone Mapping & High Dynamic Range Lighting
 * - 60 FPS Mobile Touch Orbit & Bespoke Color Customizer
 */

class CinematicCarStudio {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.carRoot = null;
    this.bodyMaterials = [];
    this.wheelMeshes = [];
    this.exhaustFlames = [];

    this.isAutoRotating = true;
    this.areLightsOn = true;

    // Smooth Orbit & Camera State
    this.targetTheta = 0.65;
    this.targetPhi = 0.28;
    this.currentTheta = 0.65;
    this.currentPhi = 0.28;
    this.targetRadius = 52;
    this.currentRadius = 52;

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

    // 1. High-Performance WebGL Renderer with ACES Filmic Tone Mapping
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 2.2;
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
    this.updateCamera();

    // 2. Synthetic Studio HDRI Reflection Texture
    this.setupStudioEnvironment();

    // 3. Cinematic Studio Lighting Rig
    this.setupLighting();

    // 4. Luxury Showroom Stage (Reflective Floor, Platform, Overhead LED Tubes & Pillars)
    this.setupShowroomStage();

    // 5. Load Real Ferrari 3D GLB Model
    this.loadRealFerrariModel();

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

    // 8. 60 FPS Render Loop with Smooth Damping
    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (this.isAutoRotating) {
        this.targetTheta += 0.004;
      }

      // Smooth Lerp Damping
      this.currentTheta += (this.targetTheta - this.currentTheta) * 0.08;
      this.currentPhi += (this.targetPhi - this.currentPhi) * 0.08;
      this.currentRadius += (this.targetRadius - this.currentRadius) * 0.08;

      this.updateCamera();

      // Exhaust flame particles decay
      for (let i = this.exhaustFlames.length - 1; i >= 0; i--) {
        const flame = this.exhaustFlames[i];
        flame.position.z -= 0.8;
        flame.scale.multiplyScalar(0.88);
        flame.material.opacity *= 0.88;
        if (flame.scale.x < 0.06) {
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
    this.camera.position.y = this.currentRadius * Math.cos(this.currentPhi) + 3.2;
    this.camera.position.z = this.currentRadius * Math.sin(this.currentPhi) * Math.cos(this.currentTheta);
    this.camera.lookAt(0, 2.5, 0);
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
    skyGrad.addColorStop(0.5, '#0c1222');
    skyGrad.addColorStop(1, '#05070d');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 1024, 512);

    // Overhead Key Softbox Reflection
    const keySoftbox = ctx.createRadialGradient(512, 100, 0, 512, 100, 240);
    keySoftbox.addColorStop(0, 'rgba(255, 250, 240, 0.85)');
    keySoftbox.addColorStop(0.5, 'rgba(255, 250, 240, 0.35)');
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
    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambient);

    // Key Spotlight (Casts crisp shadows and glossy specular highlights)
    const keySpot = new THREE.SpotLight(0xfff8ee, 6.5, 260, Math.PI / 4.2, 0.35, 1.5);
    keySpot.position.set(35, 85, 50);
    keySpot.castShadow = true;
    keySpot.shadow.mapSize.setScalar(2048);
    keySpot.shadow.bias = -0.0001;
    this.scene.add(keySpot);
    this.scene.add(keySpot.target);

    // Cyan Rim Light (Carves out the silhouette from the rear)
    const rimSpot = new THREE.SpotLight(0x38bdf8, 4.5, 220, Math.PI / 3.5, 0.5, 2.0);
    rimSpot.position.set(-50, 45, -60);
    this.scene.add(rimSpot);
    this.scene.add(rimSpot.target);

    // Golden Ground Bounce Light
    const groundBounce = new THREE.PointLight(0xf59e0b, 2.8, 60);
    groundBounce.position.set(0, -4, 0);
    this.scene.add(groundBounce);

    // Rear Taillight Accent Light
    const rearRedLight = new THREE.PointLight(0xff1e38, 2.0, 70);
    rearRedLight.position.set(0, 8, -40);
    this.scene.add(rearRedLight);
  }

  /* ==========================================================================
     LUXURY SHOWROOM STAGE (Reflective Floor, Overhead LED Tubes & Pillars)
     ========================================================================== */
  setupShowroomStage() {
    // A. Ultra-Reflective Showroom Floor
    const floorGeo = new THREE.CylinderGeometry(42, 45, 1.4, 96);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x05070e,
      metalness: 0.95,
      roughness: 0.12,
      envMapIntensity: 2.8
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.y = -0.7;
    floorMesh.receiveShadow = true;
    this.scene.add(floorMesh);

    // B. Glowing Golden Platform Ring
    const ringGeo = new THREE.TorusGeometry(42.5, 0.4, 16, 96);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.02;
    this.scene.add(ring);

    // C. Suspended Overhead Linear LED Light Tubes (Real Supercar Reveal Look)
    const ledTubeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    [-18, 0, 18].forEach(x => {
      const tubeGeo = new THREE.CylinderGeometry(0.35, 0.35, 45, 16);
      const tube = new THREE.Mesh(tubeGeo, ledTubeMat);
      tube.rotation.x = Math.PI / 2;
      tube.position.set(x, 26, 0);
      this.scene.add(tube);

      // Downward Area Light Simulation
      const tubeLight = new THREE.PointLight(0xffffff, 1.2, 45);
      tubeLight.position.set(x, 24, 0);
      this.scene.add(tubeLight);
    });

    // D. Vertical Studio Neon Light Pillars (Background Depth)
    const pillarPositions = [
      { x: -35, z: -35, color: 0x38bdf8 },
      { x: 35, z: -35, color: 0xf59e0b },
      { x: -42, z: 20, color: 0x38bdf8 },
      { x: 42, z: 20, color: 0xf59e0b }
    ];

    pillarPositions.forEach(p => {
      const pillarGeo = new THREE.CylinderGeometry(0.25, 0.25, 32, 12);
      const pillarMat = new THREE.MeshBasicMaterial({ color: p.color });
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.set(p.x, 14, p.z);
      this.scene.add(pillar);

      const pLight = new THREE.PointLight(p.color, 1.5, 40);
      pLight.position.set(p.x, 14, p.z);
      this.scene.add(pLight);
    });
  }

  /* ==========================================================================
     LOAD REAL FERRARI 3D GLB MODEL
     ========================================================================== */
  loadRealFerrariModel() {
    const hint = document.querySelector('.viewer-hint');
    if (hint) hint.textContent = '⟳ LOADING 3D HYPERCAR...';

    // Verify GLTFLoader
    if (typeof THREE.GLTFLoader === 'undefined') {
      console.error('GLTFLoader not available');
      if (hint) hint.textContent = 'DRAG 360° TO ROTATE • PINCH TO ZOOM';
      return;
    }

    const loader = new THREE.GLTFLoader();
    loader.load(
      'models/ferrari.glb',
      (gltf) => {
        const car = gltf.scene;
        car.scale.setScalar(3.6);
        car.position.set(0, 0.35, 0);

        this.bodyMaterials = [];
        this.wheelMeshes = [];

        // Upgrade All Meshes with Photorealistic PBR Properties
        car.traverse(child => {
          if (!child.isMesh) return;

          child.castShadow = true;
          child.receiveShadow = true;

          const mat = child.material;
          if (!mat) return;

          mat.envMapIntensity = 2.5;

          const name = (child.name || '').toLowerCase();

          // Identify Body Paint vs Glass vs Wheels
          if (!name.includes('glass') && !name.includes('window') && !name.includes('windshield')) {
            mat.clearcoat = 1.0;
            mat.clearcoatRoughness = 0.05;
            mat.metalness = 0.88;
            mat.roughness = 0.12;
            this.bodyMaterials.push(mat);
          } else {
            mat.transparent = true;
            mat.opacity = 0.85;
            mat.roughness = 0.05;
          }

          if (name.includes('wheel') || name.includes('rim') || name.includes('tire') || name.includes('tyre')) {
            this.wheelMeshes.push(child);
          }
        });

        this.scene.add(car);
        this.carRoot = car;

        // Apply Default Signature Carmine Red
        this.setPaintColor('#c41e3a');

        if (hint) hint.textContent = 'DRAG 360° TO ROTATE • PINCH TO ZOOM';
      },
      (xhr) => {
        const pct = xhr.total > 0 ? Math.round((xhr.loaded / xhr.total) * 100) : '';
        if (hint) hint.textContent = `⟳ LOADING 3D HYPERCAR... ${pct}%`;
      },
      (error) => {
        console.error('Error loading 3D Ferrari model:', error);
        if (hint) hint.textContent = 'DRAG 360° TO ROTATE • PINCH TO ZOOM';
      }
    );
  }

  /* ==========================================================================
     PAINT COLOR CHANGER
     ========================================================================== */
  setPaintColor(hexColor) {
    this.bodyMaterials.forEach(mat => {
      mat.color.setStyle(hexColor);
      mat.needsUpdate = true;
    });
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
        this.targetRadius = Math.max(22, Math.min(90, this.targetRadius - (dist - lastPinchDist) * 0.1));
        lastPinchDist = dist;
      }
    }, { passive: true });

    // Mouse Wheel Zoom
    canvas.addEventListener('wheel', e => {
      e.preventDefault();
      this.targetRadius = Math.max(22, Math.min(90, this.targetRadius + e.deltaY * 0.05));
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
          this.targetRadius = 50;
        } else if (view === 'side') {
          this.targetTheta = Math.PI / 2;
          this.targetPhi = 0.25;
          this.targetRadius = 48;
        } else if (view === 'rear') {
          this.targetTheta = Math.PI + 0.38;
          this.targetPhi = 0.25;
          this.targetRadius = 50;
        } else if (view === 'reset') {
          this.targetTheta = 0.65;
          this.targetPhi = 0.28;
          this.targetRadius = 52;
          this.isAutoRotating = true;
        }
        if (window.carAudio) window.carAudio.playClick();
      });
    });
  }

  // Exhaust Blue Flame Animation
  spawnExhaustFlames() {
    if (!this.carRoot) return;
    const cx = this.carRoot.position.x;
    const cy = this.carRoot.position.y;
    const cz = this.carRoot.position.z;

    [-3.2, -1.2, 1.2, 3.2].forEach(ox => {
      for (let i = 0; i < 5; i++) {
        const flameGeo = new THREE.SphereGeometry(0.5 + Math.random() * 0.5, 8, 8);
        const flameMat = new THREE.MeshBasicMaterial({
          color: Math.random() > 0.4 ? 0x38bdf8 : 0xf59e0b,
          transparent: true,
          opacity: 0.95,
          blending: THREE.AdditiveBlending
        });
        const flame = new THREE.Mesh(flameGeo, flameMat);
        flame.position.set(cx + ox, cy + 0.6, cz - 11 - i * 2.2);
        this.scene.add(flame);
        this.exhaustFlames.push(flame);
      }
    });
  }

  shakeSuspension() {
    if (!this.carRoot) return;
    const startY = this.carRoot.position.y;
    let count = 0;
    const interval = setInterval(() => {
      count++;
      this.carRoot.position.y = startY + (Math.random() - 0.5) * 0.35;
      if (count > 22) {
        clearInterval(interval);
        this.carRoot.position.y = startY;
      }
    }, 32);
  }
}

// Instantiate on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.cinematicCarStudio = new CinematicCarStudio();
});
