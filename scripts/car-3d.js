/**
 * APEX 3D HYPERCAR STUDIO ENGINE
 * Built with Three.js (WebGL)
 * Procedural 3D Aerodynamic Hypercar, Realistic Studio Lighting, Paint Configurator,
 * Active Aero & Full Mobile Touch Support
 */

class Car3DStudio {
  constructor() {
    this.bgScene = null;
    this.carScene = null;
    this.carGroup = null;
    this.carPaintMat = null;
    this.wheels = [];
    this.headlights = [];
    this.rearWing = null;
    this.lightsOn = true;
    this.wingRaised = false;
    this.spinningWheels = false;
    this.init();
  }

  init() {
    if (typeof THREE === 'undefined') {
      console.error('Three.js is required');
      return;
    }

    this.initBackgroundParticles();
    this.initHypercarStudio();
    this.bindParallax();
  }

  /* ==========================================================================
     1. AMBIENT STUDIO SPEED PARTICLES & HORIZON REFLECTION
     ========================================================================== */
  initBackgroundParticles() {
    const canvas = document.getElementById('car-canvas-bg');
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.z = 600;

    // Ambient floating light particles
    const particleCount = 450;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const amber = new THREE.Color(0xf59e0b);
    const white = new THREE.Color(0xffffff);
    const cyan = new THREE.Color(0x00f0ff);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 1400;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 1000;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 800;

      const choice = Math.random();
      const col = choice > 0.6 ? amber : (choice > 0.3 ? white : cyan);
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 2.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, particleMat);
    scene.add(particles);

    // Studio Grid Floor
    const grid = new THREE.GridHelper(1600, 30, 0x334155, 0x111827);
    grid.position.y = -220;
    grid.position.z = -100;
    scene.add(grid);

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    let mouseX = 0, mouseY = 0;
    window.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX - window.innerWidth / 2) * 0.1;
      mouseY = (e.clientY - window.innerHeight / 2) * 0.1;
    });

    const animateBg = () => {
      requestAnimationFrame(animateBg);
      particles.rotation.y += 0.0008;
      camera.position.x += (mouseX - camera.position.x) * 0.05;
      camera.position.y += (-mouseY - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };

    animateBg();
    this.bgScene = { scene, camera, renderer, grid };
  }

  bindParallax() {
    window.addEventListener('scroll', () => {
      if (this.bgScene) {
        const scrollPct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight || 1);
        this.bgScene.camera.position.z = 600 - scrollPct * 180;
        this.bgScene.grid.position.z = -100 + scrollPct * 120;
      }
    });
  }

  /* ==========================================================================
     2. 3D PROCEDURAL AERODYNAMIC HYPERCAR STUDIO
     ========================================================================== */
  initHypercarStudio() {
    const container = document.querySelector('.car-3d-stage-box');
    const canvas = document.getElementById('car-3d-canvas');
    if (!container || !canvas) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 450;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(28, 12, 45);

    // Studio Key Lights & Soft Reflections
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(40, 80, 50);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x94a3b8, 1.5);
    fillLight.position.set(-40, 40, -40);
    scene.add(fillLight);

    const groundWarmLight = new THREE.PointLight(0xf59e0b, 1.8, 100);
    groundWarmLight.position.set(0, -10, 0);
    scene.add(groundWarmLight);

    // Studio Stage Floor Pedestal
    const floorGeo = new THREE.CylinderGeometry(36, 38, 1.5, 64);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0a0c10,
      metalness: 0.9,
      roughness: 0.2
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.y = -6.5;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // Glowing Pedestal Ring
    const floorRingGeo = new THREE.TorusGeometry(37, 0.4, 16, 64);
    const floorRingMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const floorRing = new THREE.Mesh(floorRingGeo, floorRingMat);
    floorRing.position.y = -5.7;
    floorRing.rotation.x = Math.PI / 2;
    scene.add(floorRing);

    // Build Hypercar Group
    this.carGroup = new THREE.Group();
    this.buildHypercarModel();
    scene.add(this.carGroup);

    // Interaction & Touch Orbit
    let isDragging = false;
    let autoRotate = true;
    let prevX = 0, prevY = 0;

    canvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      autoRotate = false;
      prevX = e.clientX;
      prevY = e.clientY;
    });

    window.addEventListener('mouseup', () => { isDragging = false; });

    canvas.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      this.carGroup.rotation.y += dx * 0.009;
      camera.position.y += dy * 0.15;
      camera.position.y = Math.max(3, Math.min(30, camera.position.y));
      camera.lookAt(0, 2, 0);
      prevX = e.clientX;
      prevY = e.clientY;
    });

    // Mobile Touch Gesture Support
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        autoRotate = false;
        prevX = e.touches[0].clientX;
        prevY = e.touches[0].clientY;
      }
    }, { passive: true });

    canvas.addEventListener('touchmove', (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - prevX;
      const dy = e.touches[0].clientY - prevY;
      this.carGroup.rotation.y += dx * 0.009;
      camera.position.y += dy * 0.15;
      camera.position.y = Math.max(3, Math.min(30, camera.position.y));
      camera.lookAt(0, 2, 0);
      prevX = e.touches[0].clientX;
      prevY = e.touches[0].clientY;
    }, { passive: true });

    canvas.addEventListener('touchend', () => { isDragging = false; });

    // Mouse Wheel Zoom
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      camera.position.z += e.deltaY * 0.04;
      camera.position.z = Math.max(25, Math.min(90, camera.position.z));
    }, { passive: false });

    // Bind Color Swatch Buttons
    const swatches = document.querySelectorAll('.color-swatch-btn');
    swatches.forEach(btn => {
      btn.addEventListener('click', () => {
        swatches.forEach(s => s.classList.remove('active'));
        btn.classList.add('active');
        const colorHex = btn.getAttribute('data-color');
        this.setPaintColor(colorHex);
        if (window.carAudio) window.carAudio.playClick();
      });
    });

    // Bind Action Buttons
    const btnRev = document.getElementById('btn-rev-engine');
    const btnLights = document.getElementById('btn-toggle-lights');
    const btnWing = document.getElementById('btn-toggle-wing');
    const btnWheels = document.getElementById('btn-spin-wheels');
    const btnCamPreset = document.querySelectorAll('.btn-cam-preset');

    if (btnRev) {
      btnRev.addEventListener('click', () => {
        if (window.carAudio) window.carAudio.playEngineRev();
        this.shakeCarSuspension();
      });
    }

    if (btnLights) {
      btnLights.addEventListener('click', () => {
        this.toggleHeadlights();
        btnLights.classList.toggle('active', this.lightsOn);
        if (window.carAudio) window.carAudio.playLightsToggle();
      });
    }

    if (btnWing) {
      btnWing.addEventListener('click', () => {
        this.toggleRearWing();
        btnWing.classList.toggle('active', this.wingRaised);
        if (window.carAudio) window.carAudio.playAeroServo();
      });
    }

    if (btnWheels) {
      btnWheels.addEventListener('click', () => {
        this.spinningWheels = !this.spinningWheels;
        btnWheels.classList.toggle('active', this.spinningWheels);
        if (window.carAudio) window.carAudio.playClick();
      });
    }

    btnCamPreset.forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.getAttribute('data-view');
        if (window.carAudio) window.carAudio.playClick();
        if (view === 'front') {
          camera.position.set(0, 8, 48);
          this.carGroup.rotation.y = Math.PI / 4;
        } else if (view === 'side') {
          camera.position.set(45, 6, 0);
          this.carGroup.rotation.y = 0;
        } else if (view === 'rear') {
          camera.position.set(0, 8, -48);
          this.carGroup.rotation.y = Math.PI;
        } else if (view === 'reset') {
          camera.position.set(28, 12, 45);
          this.carGroup.rotation.set(0, 0, 0);
        }
        camera.lookAt(0, 2, 0);
      });
    });

    // Resize
    window.addEventListener('resize', () => {
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 450;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });

    // Studio Render Loop
    let time = 0;
    const animateCar = () => {
      requestAnimationFrame(animateCar);
      time += 0.01;

      if (autoRotate && !isDragging) {
        this.carGroup.rotation.y += 0.005;
      }

      if (this.spinningWheels) {
        this.wheels.forEach(w => {
          w.rotation.x += 0.15;
        });
      }

      floorMesh.rotation.y -= 0.002;

      renderer.render(scene, camera);
    };

    animateCar();
    this.carScene = { scene, camera, renderer };
  }

  /* ==========================================================================
     3. PROCEDURAL HYPERCAR GEOMETRY & MATERIALS
     ========================================================================== */
  buildHypercarModel() {
    this.wheels = [];
    this.headlights = [];

    // Metallic Car Paint Material
    this.carPaintMat = new THREE.MeshPhysicalMaterial({
      color: 0x111317, // Obsidian Black Default
      metalness: 0.85,
      roughness: 0.18,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      reflectivity: 0.95
    });

    const carbonMat = new THREE.MeshStandardMaterial({
      color: 0x0d0e12,
      metalness: 0.9,
      roughness: 0.3
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x1e293b,
      transparent: true,
      opacity: 0.7,
      roughness: 0.1,
      transmission: 0.85
    });

    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.98,
      roughness: 0.08
    });

    const ledGlowMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const redLightMat = new THREE.MeshBasicMaterial({ color: 0xff0033 });

    // A. Main Monocoque Chassis Lower Body
    const bodyGeo = new THREE.BoxGeometry(16, 4.5, 36);
    const bodyMesh = new THREE.Mesh(bodyGeo, this.carPaintMat);
    bodyMesh.position.y = 0;
    this.carGroup.add(bodyMesh);

    // B. Sloping Aerodynamic Cockpit & Roofline
    const roofGeo = new THREE.BoxGeometry(12, 3.8, 18);
    const roofMesh = new THREE.Mesh(roofGeo, glassMat);
    roofMesh.position.set(0, 3.8, -1);
    this.carGroup.add(roofMesh);

    const roofCapGeo = new THREE.BoxGeometry(11, 0.8, 14);
    const roofCap = new THREE.Mesh(roofCapGeo, this.carPaintMat);
    roofCap.position.set(0, 5.8, -1);
    this.carGroup.add(roofCap);

    // C. Aerodynamic Front Hood & Splitter
    const hoodGeo = new THREE.BoxGeometry(14.5, 2.2, 10);
    const hoodMesh = new THREE.Mesh(hoodGeo, this.carPaintMat);
    hoodMesh.position.set(0, 1.2, 14);
    hoodMesh.rotation.x = 0.12;
    this.carGroup.add(hoodMesh);

    const splitterGeo = new THREE.BoxGeometry(17, 0.8, 6);
    const splitter = new THREE.Mesh(splitterGeo, carbonMat);
    splitter.position.set(0, -1.8, 18);
    this.carGroup.add(splitter);

    // D. Front LED Matrix Headlights
    [-5.5, 5.5].forEach(x => {
      const lightGeo = new THREE.BoxGeometry(3.2, 0.8, 1.2);
      const lightMesh = new THREE.Mesh(lightGeo, ledGlowMat);
      lightMesh.position.set(x, 1.6, 18.2);
      this.carGroup.add(lightMesh);
      this.headlights.push(lightMesh);
    });

    // E. Side Air Intakes & Aerodynamic Skirts
    [-8.2, 8.2].forEach(x => {
      const skirtGeo = new THREE.BoxGeometry(0.8, 2, 22);
      const skirt = new THREE.Mesh(skirtGeo, carbonMat);
      skirt.position.set(x, -1.2, 0);
      this.carGroup.add(skirt);

      const mirrorGeo = new THREE.BoxGeometry(2.5, 1, 1.5);
      const mirror = new THREE.Mesh(mirrorGeo, carbonMat);
      mirror.position.set(x > 0 ? 8.5 : -8.5, 4.2, 5);
      this.carGroup.add(mirror);
    });

    // F. Rear Active Aero Spoiler & Wing
    this.rearWing = new THREE.Group();
    const wingBladeGeo = new THREE.BoxGeometry(18, 0.8, 5);
    const wingBlade = new THREE.Mesh(wingBladeGeo, carbonMat);
    this.rearWing.add(wingBlade);

    [-6, 6].forEach(x => {
      const strutGeo = new THREE.BoxGeometry(0.8, 4, 2);
      const strut = new THREE.Mesh(strutGeo, carbonMat);
      strut.position.set(x, -2, 0);
      this.rearWing.add(strut);
    });

    this.rearWing.position.set(0, 4.5, -17);
    this.carGroup.add(this.rearWing);

    // G. Rear LED Lightbar & Diffuser
    const rearLightGeo = new THREE.BoxGeometry(15, 0.8, 1);
    const rearLight = new THREE.Mesh(rearLightGeo, redLightMat);
    rearLight.position.set(0, 1.8, -18.2);
    this.carGroup.add(rearLight);

    const diffuserGeo = new THREE.BoxGeometry(16, 1.5, 5);
    const diffuser = new THREE.Mesh(diffuserGeo, carbonMat);
    diffuser.position.set(0, -1.8, -17.5);
    this.carGroup.add(diffuser);

    // Twin Exhaust Tips
    [-2.5, 2.5].forEach(x => {
      const exhaustGeo = new THREE.CylinderGeometry(0.9, 0.9, 2, 16);
      const exhaust = new THREE.Mesh(exhaustGeo, chromeMat);
      exhaust.rotation.x = Math.PI / 2;
      exhaust.position.set(x, -0.8, -18.6);
      this.carGroup.add(exhaust);
    });

    // H. 4 High-Performance Wheels with Ceramic Calipers
    const wheelPositions = [
      { x: -8.2, z: 11 },
      { x: 8.2, z: 11 },
      { x: -8.2, z: -11 },
      { x: 8.2, z: -11 }
    ];

    wheelPositions.forEach(pos => {
      const wheelGroup = new THREE.Group();

      // Tire Rubber
      const tireGeo = new THREE.CylinderGeometry(4.2, 4.2, 2.4, 28);
      const tireMat = new THREE.MeshStandardMaterial({ color: 0x171923, roughness: 0.8 });
      const tire = new THREE.Mesh(tireGeo, tireMat);
      tire.rotation.z = Math.PI / 2;
      wheelGroup.add(tire);

      // Alloy Rim Spokes
      const rimGeo = new THREE.CylinderGeometry(2.8, 2.8, 2.5, 12);
      const rim = new THREE.Mesh(rimGeo, chromeMat);
      rim.rotation.z = Math.PI / 2;
      wheelGroup.add(rim);

      // Gold Brake Caliper
      const caliperGeo = new THREE.BoxGeometry(1.2, 2.2, 1.8);
      const caliperMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
      const caliper = new THREE.Mesh(caliperGeo, caliperMat);
      caliper.position.set(pos.x > 0 ? -0.8 : 0.8, 1.8, 0);
      wheelGroup.add(caliper);

      wheelGroup.position.set(pos.x, -2.4, pos.z);
      this.carGroup.add(wheelGroup);
      this.wheels.push(wheelGroup);
    });
  }

  // Paint Color Changer
  setPaintColor(colorHex) {
    if (!this.carPaintMat) return;
    this.carPaintMat.color.setStyle(colorHex);
  }

  // Headlights Toggle
  toggleHeadlights() {
    this.lightsOn = !this.lightsOn;
    this.headlights.forEach(l => {
      l.visible = this.lightsOn;
    });
  }

  // Active Rear Wing Toggle
  toggleRearWing() {
    this.wingRaised = !this.wingRaised;
    if (this.rearWing) {
      this.rearWing.position.y = this.wingRaised ? 7.2 : 4.5;
      this.rearWing.rotation.x = this.wingRaised ? -0.15 : 0;
    }
  }

  // Engine Rev Shake
  shakeCarSuspension() {
    let count = 0;
    const startY = this.carGroup.position.y;
    const shakeInterval = setInterval(() => {
      count++;
      this.carGroup.position.y = startY + (Math.random() - 0.5) * 0.4;
      if (count > 25) {
        clearInterval(shakeInterval);
        this.carGroup.position.y = startY;
      }
    }, 35);
  }
}

// Instantiate on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  window.car3D = new Car3DStudio();
});
