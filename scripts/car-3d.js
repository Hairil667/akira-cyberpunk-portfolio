/**
 * APEX MOTORS // LIGHTWEIGHT 60 FPS 3D HYPERCAR STUDIO
 * Ultra-optimized Three.js single canvas engine
 * Zero-lag performance, smooth touch orbit, metallic clearcoat paint customizer
 */

class LightweightCarStudio {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.carGroup = null;
    this.carPaintMaterial = null;
    this.wheelAssemblies = [];
    this.headlightMeshes = [];
    this.rearWingGroup = null;

    this.isAutoRotating = true;
    this.isWheelsSpinning = false;
    this.areLightsOn = true;
    this.isWingRaised = false;

    // Smooth Orbit state
    this.targetRotationY = 0.5;
    this.targetRotationX = 0.2;
    this.currentRotationY = 0.5;
    this.currentRotationX = 0.2;
    this.cameraDistance = 46;

    this.init();
  }

  init() {
    if (typeof THREE === 'undefined') return;

    const container = document.querySelector('.car-viewer-container');
    const canvas = document.getElementById('car-3d-canvas');
    if (!container || !canvas) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 450;

    // 1. Single Lightweight Renderer (60 FPS)
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.8;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(38, width / height, 0.5, 500);
    this.updateCameraPosition();

    // 2. Clean Studio Lighting (Balanced, no heavy shadows)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    this.scene.add(ambientLight);

    const mainKeyLight = new THREE.DirectionalLight(0xfff8ee, 2.2);
    mainKeyLight.position.set(25, 45, 30);
    this.scene.add(mainKeyLight);

    const rimBlueLight = new THREE.DirectionalLight(0x38bdf8, 1.4);
    rimBlueLight.position.set(-30, 25, -35);
    this.scene.add(rimBlueLight);

    const warmUnderLight = new THREE.PointLight(0xf59e0b, 1.5, 40);
    warmUnderLight.position.set(0, -4, 0);
    this.scene.add(warmUnderLight);

    // 3. Studio Turntable Platform
    const pedestalGeo = new THREE.CylinderGeometry(32, 33, 1.2, 48);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x0c0f17,
      metalness: 0.8,
      roughness: 0.3
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -5.4;
    this.scene.add(pedestal);

    const ringGeo = new THREE.TorusGeometry(32.8, 0.25, 12, 48);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -4.8;
    this.scene.add(ring);

    // 4. Build Sleek Aerodynamic Sports Car
    this.carGroup = new THREE.Group();
    this.buildSleekSportsCar();
    this.scene.add(this.carGroup);

    // 5. Setup Smooth Touch & Mouse Controls
    this.setupInteractions(canvas);

    // 6. Bind UI Controls
    this.bindUI();

    // 7. Window Resize
    window.addEventListener('resize', () => {
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 450;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });

    // 8. 60 FPS Render Loop
    const animate = () => {
      requestAnimationFrame(animate);

      if (this.isAutoRotating) {
        this.targetRotationY += 0.005;
      }

      // Smooth Lerp Damping
      this.currentRotationY += (this.targetRotationY - this.currentRotationY) * 0.08;
      this.currentRotationX += (this.targetRotationX - this.currentRotationX) * 0.08;

      this.carGroup.rotation.y = this.currentRotationY;

      // Wheel spinning animation
      if (this.isWheelsSpinning) {
        this.wheelAssemblies.forEach(w => {
          w.rotation.x += 0.2;
        });
      }

      this.updateCameraPosition();
      this.renderer.render(this.scene, this.camera);
    };

    animate();
  }

  updateCameraPosition() {
    const phi = Math.max(0.1, Math.min(1.4, this.currentRotationX));
    this.camera.position.x = this.cameraDistance * Math.sin(phi) * 0.4;
    this.camera.position.y = this.cameraDistance * Math.cos(phi) + 2;
    this.camera.position.z = this.cameraDistance * Math.sin(phi);
    this.camera.lookAt(0, 1, 0);
  }

  /* ==========================================================================
     SLEEK HIGH-END SPORTS CAR MODEL (Optimized Topology, 60 FPS)
     ========================================================================== */
  buildSleekSportsCar() {
    this.wheelAssemblies = [];
    this.headlightMeshes = [];

    // Metallic Clearcoat Paint
    this.carPaintMaterial = new THREE.MeshStandardMaterial({
      color: 0xc41e3a, // Carmine Red Default
      metalness: 0.85,
      roughness: 0.2
    });

    const carbonMat = new THREE.MeshStandardMaterial({
      color: 0x111318,
      metalness: 0.9,
      roughness: 0.35
    });

    const tintedGlassMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.85
    });

    const alloyChromeMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.1
    });

    const ledGlowMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const redLedMat = new THREE.MeshBasicMaterial({ color: 0xff1e38 });

    // A. Main Sleek Aerodynamic Body
    const bodyGeo = new THREE.BoxGeometry(15, 3.8, 34);
    const bodyMesh = new THREE.Mesh(bodyGeo, this.carPaintMaterial);
    bodyMesh.position.y = 0;
    this.carGroup.add(bodyMesh);

    // B. Sloping Aerodynamic Cockpit Canopy
    const canopyGeo = new THREE.BoxGeometry(11.5, 3.2, 16);
    const canopyMesh = new THREE.Mesh(canopyGeo, tintedGlassMat);
    canopyMesh.position.set(0, 3.2, -1);
    this.carGroup.add(canopyMesh);

    const roofCapGeo = new THREE.BoxGeometry(10.5, 0.6, 12);
    const roofCap = new THREE.Mesh(roofCapGeo, this.carPaintMaterial);
    roofCap.position.set(0, 4.9, -1);
    this.carGroup.add(roofCap);

    // C. Sloping Front Hood & Splitter
    const hoodGeo = new THREE.BoxGeometry(14, 1.8, 10);
    const hoodMesh = new THREE.Mesh(hoodGeo, this.carPaintMaterial);
    hoodMesh.position.set(0, 0.8, 13);
    hoodMesh.rotation.x = 0.12;
    this.carGroup.add(hoodMesh);

    const splitterGeo = new THREE.BoxGeometry(16, 0.6, 5);
    const splitter = new THREE.Mesh(splitterGeo, carbonMat);
    splitter.position.set(0, -1.6, 17);
    this.carGroup.add(splitter);

    // D. Front LED Matrix Headlights
    [-5.2, 5.2].forEach(x => {
      const lightGeo = new THREE.BoxGeometry(3.2, 0.6, 1.2);
      const lightMesh = new THREE.Mesh(lightGeo, ledGlowMat);
      lightMesh.position.set(x, 1.2, 17.1);
      this.carGroup.add(lightMesh);
      this.headlightMeshes.push(lightMesh);
    });

    // E. Carbon Side Skirts & Mirrors
    [-7.8, 7.8].forEach(x => {
      const skirtGeo = new THREE.BoxGeometry(0.8, 1.6, 22);
      const skirt = new THREE.Mesh(skirtGeo, carbonMat);
      skirt.position.set(x, -1.0, 0);
      this.carGroup.add(skirt);

      const mirrorGeo = new THREE.BoxGeometry(2.2, 0.8, 1.2);
      const mirror = new THREE.Mesh(mirrorGeo, carbonMat);
      mirror.position.set(x > 0 ? 8.2 : -8.2, 3.6, 4.5);
      this.carGroup.add(mirror);
    });

    // F. Active Rear Swan-Neck Spoiler
    this.rearWingGroup = new THREE.Group();
    const wingBladeGeo = new THREE.BoxGeometry(17, 0.6, 4.5);
    const wingBlade = new THREE.Mesh(wingBladeGeo, carbonMat);
    this.rearWingGroup.add(wingBlade);

    [-5.5, 5.5].forEach(x => {
      const strutGeo = new THREE.BoxGeometry(0.6, 3.8, 1.6);
      const strut = new THREE.Mesh(strutGeo, carbonMat);
      strut.position.set(x, -1.8, 0);
      this.rearWingGroup.add(strut);
    });

    this.rearWingGroup.position.set(0, 4.2, -16.5);
    this.carGroup.add(this.rearWingGroup);

    // G. Rear LED Lightbar & Diffuser
    const rearLightGeo = new THREE.BoxGeometry(14, 0.6, 0.8);
    const rearLight = new THREE.Mesh(rearLightGeo, redLedMat);
    rearLight.position.set(0, 1.5, -17.1);
    this.carGroup.add(rearLight);

    const diffuserGeo = new THREE.BoxGeometry(15, 1.4, 4.5);
    const diffuser = new THREE.Mesh(diffuserGeo, carbonMat);
    diffuser.position.set(0, -1.4, -16.8);
    this.carGroup.add(diffuser);

    // Dual Exhaust Tips
    [-2.8, 2.8].forEach(x => {
      const exhaustGeo = new THREE.CylinderGeometry(0.8, 0.8, 1.8, 16);
      const exhaust = new THREE.Mesh(exhaustGeo, alloyChromeMat);
      exhaust.rotation.x = Math.PI / 2;
      exhaust.position.set(x, -0.6, -17.6);
      this.carGroup.add(exhaust);
    });

    // H. 4 Sport Alloy Wheels with Gold Brake Calipers
    const wheelPositions = [
      { x: -7.8, z: 10.5 },
      { x: 7.8, z: 10.5 },
      { x: -7.8, z: -10.5 },
      { x: 7.8, z: -10.5 }
    ];

    wheelPositions.forEach(pos => {
      const wheelGroup = new THREE.Group();

      // Tire
      const tireGeo = new THREE.CylinderGeometry(3.8, 3.8, 2.2, 24);
      const tireMat = new THREE.MeshStandardMaterial({ color: 0x111317, roughness: 0.85 });
      const tire = new THREE.Mesh(tireGeo, tireMat);
      tire.rotation.z = Math.PI / 2;
      wheelGroup.add(tire);

      // Alloy Rim
      const rimGeo = new THREE.CylinderGeometry(2.6, 2.6, 2.3, 12);
      const rim = new THREE.Mesh(rimGeo, alloyChromeMat);
      rim.rotation.z = Math.PI / 2;
      wheelGroup.add(rim);

      // Gold Caliper
      const caliperGeo = new THREE.BoxGeometry(1.0, 2.0, 1.5);
      const caliperMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
      const caliper = new THREE.Mesh(caliperGeo, caliperMat);
      caliper.position.set(pos.x > 0 ? -0.7 : 0.7, 1.5, 0);
      wheelGroup.add(caliper);

      wheelGroup.position.set(pos.x, -2.0, pos.z);
      this.carGroup.add(wheelGroup);
      this.wheelAssemblies.push(wheelGroup);
    });
  }

  /* ==========================================================================
     INTERACTIONS & TOUCH HANDLERS (Passive, 60 FPS Smooth)
     ========================================================================== */
  setupInteractions(canvas) {
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;

    const startDrag = (x, y) => {
      isDragging = true;
      this.isAutoRotating = false;
      prevX = x;
      prevY = y;
    };

    const moveDrag = (x, y) => {
      if (!isDragging) return;
      const dx = x - prevX;
      const dy = y - prevY;

      this.targetRotationY += dx * 0.008;
      this.targetRotationX += dy * 0.005;
      this.targetRotationX = Math.max(0.1, Math.min(1.2, this.targetRotationX));

      prevX = x;
      prevY = y;
    };

    const endDrag = () => {
      isDragging = false;
    };

    // Mouse Events
    canvas.addEventListener('mousedown', e => startDrag(e.clientX, e.clientY));
    window.addEventListener('mousemove', e => moveDrag(e.clientX, e.clientY));
    window.addEventListener('mouseup', endDrag);

    // Touch Events (Mobile passive)
    canvas.addEventListener('touchstart', e => {
      if (e.touches.length === 1) {
        startDrag(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    canvas.addEventListener('touchmove', e => {
      if (e.touches.length === 1) {
        moveDrag(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    canvas.addEventListener('touchend', endDrag);

    // Wheel Zoom
    canvas.addEventListener('wheel', e => {
      e.preventDefault();
      this.cameraDistance += e.deltaY * 0.04;
      this.cameraDistance = Math.max(26, Math.min(80, this.cameraDistance));
    }, { passive: false });
  }

  /* ==========================================================================
     UI BINDINGS & ACTIONS
     ========================================================================== */
  bindUI() {
    // Swatch selection
    const swatches = document.querySelectorAll('.swatch-btn');
    swatches.forEach(btn => {
      btn.addEventListener('click', () => {
        swatches.forEach(s => s.classList.remove('active'));
        btn.classList.add('active');
        const color = btn.getAttribute('data-color');
        if (this.carPaintMaterial) {
          this.carPaintMaterial.color.setStyle(color);
        }
        if (window.carAudio) window.carAudio.playClick();
      });
    });

    // Rev engine
    const btnRev = document.getElementById('btn-rev');
    if (btnRev) {
      btnRev.addEventListener('click', () => {
        if (window.carAudio) window.carAudio.playEngineRev();
        this.shakeSuspension();
      });
    }

    // Headlights toggle
    const btnLights = document.getElementById('btn-lights');
    if (btnLights) {
      btnLights.addEventListener('click', () => {
        this.areLightsOn = !this.areLightsOn;
        this.headlightMeshes.forEach(m => { m.visible = this.areLightsOn; });
        btnLights.classList.toggle('active', this.areLightsOn);
        if (window.carAudio) window.carAudio.playLightsToggle();
      });
    }

    // Active wing toggle
    const btnWing = document.getElementById('btn-wing');
    if (btnWing) {
      btnWing.addEventListener('click', () => {
        this.isWingRaised = !this.isWingRaised;
        if (this.rearWingGroup) {
          this.rearWingGroup.position.y = this.isWingRaised ? 6.5 : 4.2;
          this.rearWingGroup.rotation.x = this.isWingRaised ? -0.15 : 0;
        }
        btnWing.classList.toggle('active', this.isWingRaised);
        if (window.carAudio) window.carAudio.playAeroServo();
      });
    }

    // Spin wheels
    const btnWheels = document.getElementById('btn-wheels');
    if (btnWheels) {
      btnWheels.addEventListener('click', () => {
        this.isWheelsSpinning = !this.isWheelsSpinning;
        btnWheels.classList.toggle('active', this.isWheelsSpinning);
        if (window.carAudio) window.carAudio.playClick();
      });
    }

    // Camera view presets
    const btnPresets = document.querySelectorAll('.btn-preset');
    btnPresets.forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.getAttribute('data-view');
        this.isAutoRotating = false;
        if (view === 'front') {
          this.targetRotationY = Math.PI / 4;
          this.targetRotationX = 0.2;
        } else if (view === 'side') {
          this.targetRotationY = Math.PI / 2;
          this.targetRotationX = 0.2;
        } else if (view === 'rear') {
          this.targetRotationY = Math.PI;
          this.targetRotationX = 0.2;
        } else if (view === 'reset') {
          this.targetRotationY = 0.5;
          this.targetRotationX = 0.2;
          this.cameraDistance = 46;
          this.isAutoRotating = true;
        }
        if (window.carAudio) window.carAudio.playClick();
      });
    });
  }

  shakeSuspension() {
    let count = 0;
    const startY = this.carGroup.position.y;
    const shakeInterval = setInterval(() => {
      count++;
      this.carGroup.position.y = startY + (Math.random() - 0.5) * 0.35;
      if (count > 20) {
        clearInterval(shakeInterval);
        this.carGroup.position.y = startY;
      }
    }, 35);
  }
}

// Instantiate on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.lightweightCarStudio = new LightweightCarStudio();
});
