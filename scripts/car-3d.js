/**
 * APEX 3D REALISTIC HYPERCAR & NIGHT HIGHWAY STUDIO ENGINE
 * Built with Three.js (WebGL)
 * High-Detail Procedural Aerodynamic Supercar, Wet Asphalt Highway, Traffic Light Trails,
 * Scissor Doors, Active Aero, Exhaust Flames & Drive Simulator
 */

class Car3DStudio {
  constructor() {
    this.bgScene = null;
    this.carScene = null;
    this.carGroup = null;
    this.carPaintMat = null;
    this.wheels = [];
    this.headlights = [];
    this.leftDoor = null;
    this.rightDoor = null;
    this.rearWing = null;
    this.underglowLight = null;
    this.underglowMesh = null;
    this.exhaustFlames = [];

    this.lightsOn = true;
    this.doorsOpen = false;
    this.wingRaised = false;
    this.isDriving = false;
    this.speed = 1.0;
    this.roadSegments = [];
    this.trafficCars = [];
    this.tunnelArches = [];

    this.init();
  }

  init() {
    if (typeof THREE === 'undefined') {
      console.error('Three.js is required');
      return;
    }

    this.initNightHighwayBackground();
    this.initHypercarStudio();
  }

  /* ==========================================================================
     1. 3D NIGHT HIGHWAY & ILLUMINATED METROPOLIS BACKGROUND
     ========================================================================== */
  initNightHighwayBackground() {
    const canvas = document.getElementById('car-canvas-bg');
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 3000);
    camera.position.set(0, 15, 120);

    // Moonlight & Ambient City Glow
    const ambient = new THREE.AmbientLight(0x0e131f, 1.5);
    scene.add(ambient);

    const moon = new THREE.DirectionalLight(0x38bdf8, 1.2);
    moon.position.set(-100, 300, -200);
    scene.add(moon);

    // A. Endless Reflective Wet Asphalt Highway
    const roadGroup = new THREE.Group();
    const roadGeo = new THREE.PlaneGeometry(180, 2400);
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x050608,
      roughness: 0.15,
      metalness: 0.8
    });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, -18, -400);
    roadGroup.add(road);

    // Glowing Lane Divider Lines
    const laneCount = 40;
    for (let i = 0; i < laneCount; i++) {
      const lineGeo = new THREE.BoxGeometry(0.8, 0.2, 18);
      const lineMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
      const lineMesh = new THREE.Mesh(lineGeo, lineMat);
      lineMesh.position.set(0, -17.8, i * 60 - 1200);
      roadGroup.add(lineMesh);
      this.roadSegments.push(lineMesh);
    }
    scene.add(roadGroup);

    // B. Neon Highway Tunnel Arches
    const archMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    for (let i = 0; i < 12; i++) {
      const archGroup = new THREE.Group();
      const leftPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 60, 8), archMat);
      leftPillar.position.set(-85, 12, 0);
      const rightPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 60, 8), archMat);
      rightPillar.position.set(85, 12, 0);
      const topBeam = new THREE.Mesh(new THREE.BoxGeometry(170, 1.2, 1.2), archMat);
      topBeam.position.set(0, 42, 0);

      archGroup.add(leftPillar);
      archGroup.add(rightPillar);
      archGroup.add(topBeam);
      archGroup.position.set(0, 0, i * -220);
      scene.add(archGroup);
      this.tunnelArches.push(archGroup);
    }

    // C. Distant Traffic Cars with Light Streaks
    for (let i = 0; i < 8; i++) {
      const carGroup = new THREE.Group();
      const carBody = new THREE.Mesh(
        new THREE.BoxGeometry(10, 3.5, 20),
        new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.9 })
      );
      carGroup.add(carBody);

      // Red Taillights
      [-3.5, 3.5].forEach(x => {
        const tLight = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.6, 0.6), new THREE.MeshBasicMaterial({ color: 0xff0033 }));
        tLight.position.set(x, 0.5, -10.2);
        carGroup.add(tLight);
      });

      const laneX = (i % 2 === 0 ? -45 : 45) + (Math.random() - 0.5) * 15;
      carGroup.position.set(laneX, -16, -200 - i * 180);
      carGroup.speed = Math.random() * 1.5 + 1.2;
      scene.add(carGroup);
      this.trafficCars.push(carGroup);
    }

    // D. City Skyline Towers in Distance
    const cityGroup = new THREE.Group();
    for (let i = 0; i < 28; i++) {
      const towerHeight = Math.random() * 200 + 100;
      const towerWidth = Math.random() * 40 + 20;
      const towerGeo = new THREE.BoxGeometry(towerWidth, towerHeight, towerWidth);
      const towerMat = new THREE.MeshStandardMaterial({
        color: 0x080b12,
        roughness: 0.6,
        metalness: 0.8
      });
      const tower = new THREE.Mesh(towerGeo, towerMat);
      const sideX = (i % 2 === 0 ? 1 : -1) * (Math.random() * 300 + 160);
      tower.position.set(sideX, towerHeight / 2 - 20, -600 - Math.random() * 600);
      cityGroup.add(tower);
    }
    scene.add(cityGroup);

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    let mouseX = 0, mouseY = 0;
    window.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX - window.innerWidth / 2) * 0.08;
      mouseY = (e.clientY - window.innerHeight / 2) * 0.08;
    });

    // Background Animation Loop
    const animateBg = () => {
      requestAnimationFrame(animateBg);

      const currentSpeed = this.isDriving ? 8.0 : 1.2;

      // Animate road lines
      this.roadSegments.forEach(seg => {
        seg.position.z += currentSpeed * 2.5;
        if (seg.position.z > 300) {
          seg.position.z -= 1400;
        }
      });

      // Animate tunnel arches
      this.tunnelArches.forEach(arch => {
        arch.position.z += currentSpeed * 2.5;
        if (arch.position.z > 200) {
          arch.position.z -= 220 * 12;
        }
      });

      // Animate traffic cars
      this.trafficCars.forEach(tc => {
        tc.position.z += (currentSpeed - tc.speed) * 2.0;
        if (tc.position.z > 150) {
          tc.position.z -= 1600;
        } else if (tc.position.z < -1800) {
          tc.position.z = 100;
        }
      });

      camera.position.x += (mouseX - camera.position.x) * 0.05;
      camera.position.y += (-mouseY + 15 - camera.position.y) * 0.05;
      camera.lookAt(0, 0, -300);

      renderer.render(scene, camera);
    };

    animateBg();
    this.bgScene = { scene, camera, renderer };
  }

  /* ==========================================================================
     2. 3D REALISTIC HYPERCAR STUDIO
     ========================================================================== */
  initHypercarStudio() {
    const container = document.querySelector('.car-3d-stage-box');
    const canvas = document.getElementById('car-3d-canvas');
    if (!container || !canvas) return;

    const width = container.clientWidth || 850;
    const height = container.clientHeight || 480;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
    camera.position.set(30, 10, 48);

    // Studio Spotlight Rigging & Reflections
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const mainSpot = new THREE.SpotLight(0xffffff, 3.5, 150, Math.PI / 4, 0.4);
    mainSpot.position.set(30, 60, 40);
    mainSpot.castShadow = true;
    scene.add(mainSpot);

    const rimSpot = new THREE.SpotLight(0x00f0ff, 2.8, 150, Math.PI / 3, 0.5);
    rimSpot.position.set(-40, 40, -40);
    scene.add(rimSpot);

    const rearSpot = new THREE.SpotLight(0xf59e0b, 2.0, 100);
    rearSpot.position.set(0, 30, -50);
    scene.add(rearSpot);

    // Studio Pedestal Floor
    const floorGeo = new THREE.CylinderGeometry(38, 40, 1.2, 64);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x08090d,
      metalness: 0.9,
      roughness: 0.18
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -6.2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Glowing Pedestal Ring
    const ringGeo = new THREE.TorusGeometry(39, 0.35, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = -5.5;
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);

    // Build the Detailed Hypercar
    this.carGroup = new THREE.Group();
    this.buildRealisticHypercar();
    scene.add(this.carGroup);

    // Touch & Orbit Drag
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
      camera.position.y = Math.max(3, Math.min(28, camera.position.y));
      camera.lookAt(0, 1.5, 0);
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
      camera.position.y = Math.max(3, Math.min(28, camera.position.y));
      camera.lookAt(0, 1.5, 0);
      prevX = e.touches[0].clientX;
      prevY = e.touches[0].clientY;
    }, { passive: true });

    canvas.addEventListener('touchend', () => { isDragging = false; });

    // Zoom
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      camera.position.z += e.deltaY * 0.04;
      camera.position.z = Math.max(25, Math.min(85, camera.position.z));
    }, { passive: false });

    // Bind Paint Color Swatches
    const swatches = document.querySelectorAll('.color-swatch-btn');
    swatches.forEach(btn => {
      btn.addEventListener('click', () => {
        swatches.forEach(s => s.classList.remove('active'));
        btn.classList.add('active');
        const color = btn.getAttribute('data-color');
        this.setPaintColor(color);
        if (window.carAudio) window.carAudio.playClick();
      });
    });

    // Bind Action Buttons
    const btnRev = document.getElementById('btn-rev-engine');
    const btnLights = document.getElementById('btn-toggle-lights');
    const btnDoors = document.getElementById('btn-toggle-doors');
    const btnWing = document.getElementById('btn-toggle-wing');
    const btnDrive = document.getElementById('btn-drive-mode');
    const btnCamPreset = document.querySelectorAll('.btn-cam-preset');

    if (btnRev) {
      btnRev.addEventListener('click', () => {
        if (window.carAudio) window.carAudio.playEngineRev();
        this.triggerExhaustBackfire();
        this.shakeSuspension();
      });
    }

    if (btnLights) {
      btnLights.addEventListener('click', () => {
        this.toggleHeadlights();
        btnLights.classList.toggle('active', this.lightsOn);
        if (window.carAudio) window.carAudio.playLightsToggle();
      });
    }

    if (btnDoors) {
      btnDoors.addEventListener('click', () => {
        this.toggleDoors();
        btnDoors.classList.toggle('active', this.doorsOpen);
        if (window.carAudio) window.carAudio.playAeroServo();
      });
    }

    if (btnWing) {
      btnWing.addEventListener('click', () => {
        this.toggleWing();
        btnWing.classList.toggle('active', this.wingRaised);
        if (window.carAudio) window.carAudio.playAeroServo();
      });
    }

    if (btnDrive) {
      btnDrive.addEventListener('click', () => {
        this.isDriving = !this.isDriving;
        btnDrive.classList.toggle('active', this.isDriving);
        if (this.isDriving) {
          btnDrive.textContent = "STOP DRIVE 🛑";
          if (window.carAudio) window.carAudio.playEngineRev();
          this.triggerExhaustBackfire();
        } else {
          btnDrive.textContent = "ACCELERATE 🚀";
        }
        if (window.carAudio) window.carAudio.playClick();
      });
    }

    btnCamPreset.forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.getAttribute('data-view');
        if (window.carAudio) window.carAudio.playClick();
        if (view === 'front') {
          camera.position.set(0, 6, 45);
          this.carGroup.rotation.y = Math.PI / 4.5;
        } else if (view === 'side') {
          camera.position.set(45, 5, 0);
          this.carGroup.rotation.y = 0;
        } else if (view === 'rear') {
          camera.position.set(0, 7, -46);
          this.carGroup.rotation.y = Math.PI;
        } else if (view === 'reset') {
          camera.position.set(30, 10, 48);
          this.carGroup.rotation.set(0, 0, 0);
        }
        camera.lookAt(0, 1.5, 0);
      });
    });

    window.addEventListener('resize', () => {
      const w = container.clientWidth || 850;
      const h = container.clientHeight || 480;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });

    // Studio Animation Loop
    let time = 0;
    const animateStudio = () => {
      requestAnimationFrame(animateStudio);
      time += 0.01;

      if (autoRotate && !isDragging && !this.isDriving) {
        this.carGroup.rotation.y += 0.004;
      }

      // Rotate wheels when driving
      if (this.isDriving) {
        this.wheels.forEach(w => {
          w.rotation.x += 0.25;
        });
        this.carGroup.position.y = Math.sin(time * 20) * 0.08;
      }

      // Update exhaust flames
      for (let i = this.exhaustFlames.length - 1; i >= 0; i--) {
        const flame = this.exhaustFlames[i];
        flame.position.z -= 0.6;
        flame.scale.multiplyScalar(0.92);
        flame.material.opacity *= 0.9;
        if (flame.scale.x < 0.1 || flame.material.opacity < 0.05) {
          this.carGroup.remove(flame);
          this.exhaustFlames.splice(i, 1);
        }
      }

      floor.rotation.y -= 0.002;

      renderer.render(scene, camera);
    };

    animateStudio();
    this.carScene = { scene, camera, renderer };
  }

  /* ==========================================================================
     3. HIGH-DETAIL AERODYNAMIC SUPERCAR GEOMETRY
     ========================================================================== */
  buildRealisticHypercar() {
    this.wheels = [];
    this.headlights = [];
    this.exhaustFlames = [];

    // Realistic PBR Metallic Paint
    this.carPaintMat = new THREE.MeshPhysicalMaterial({
      color: 0x111317,
      metalness: 0.88,
      roughness: 0.14,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      reflectivity: 0.95
    });

    const carbonFiberMat = new THREE.MeshStandardMaterial({
      color: 0x0a0b0e,
      metalness: 0.92,
      roughness: 0.25
    });

    const darkGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0x0f172a,
      transparent: true,
      opacity: 0.85,
      roughness: 0.08,
      transmission: 0.75
    });

    const chromeTitaniumMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.98,
      roughness: 0.05
    });

    const ledLaserMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const redLedMat = new THREE.MeshBasicMaterial({ color: 0xff0044 });

    // 1. Sleek Aerodynamic Lower Monocoque (Curved Side Profile)
    const chassisShape = new THREE.Shape();
    chassisShape.moveTo(-18, -1.5);
    chassisShape.lineTo(-17, 1.2);
    chassisShape.quadraticCurveTo(-10, 3.8, -2, 4.2);
    chassisShape.quadraticCurveTo(8, 3.8, 14, 1.8);
    chassisShape.lineTo(17.5, -0.8);
    chassisShape.lineTo(17.5, -1.8);
    chassisShape.lineTo(-18, -1.8);

    const extrudeSettings = { depth: 15.5, bevelEnabled: true, bevelSegments: 6, steps: 2, bevelSize: 0.8, bevelThickness: 0.8 };
    const chassisGeo = new THREE.ExtrudeGeometry(chassisShape, extrudeSettings);
    const chassisMesh = new THREE.Mesh(chassisGeo, this.carPaintMat);
    chassisMesh.rotation.y = Math.PI / 2;
    chassisMesh.position.set(7.75, 0, 0);
    this.carGroup.add(chassisMesh);

    // 2. Aerodynamic Cockpit Glass Canopy (Interior Cockpit Silhouette)
    const canopyShape = new THREE.Shape();
    canopyShape.moveTo(-8, 0);
    canopyShape.quadraticCurveTo(-4, 4.2, 0, 4.4);
    canopyShape.quadraticCurveTo(5, 4.2, 8, 0);

    const canopyGeo = new THREE.ExtrudeGeometry(canopyShape, { depth: 11.5, bevelEnabled: true, bevelSegments: 4, bevelSize: 0.5, bevelThickness: 0.5 });
    const canopyMesh = new THREE.Mesh(canopyGeo, darkGlassMat);
    canopyMesh.rotation.y = Math.PI / 2;
    canopyMesh.position.set(5.75, 3.2, -0.5);
    this.carGroup.add(canopyMesh);

    // Roof Center Air Scoop
    const scoopGeo = new THREE.BoxGeometry(3.5, 0.8, 8);
    const scoopMesh = new THREE.Mesh(scoopGeo, carbonFiberMat);
    scoopMesh.position.set(0, 7.8, -0.5);
    this.carGroup.add(scoopMesh);

    // 3. Aggressive Front Splitter & Bumper with Winglets
    const splitterGeo = new THREE.BoxGeometry(18, 0.6, 7);
    const splitter = new THREE.Mesh(splitterGeo, carbonFiberMat);
    splitter.position.set(0, -1.8, 17.5);
    this.carGroup.add(splitter);

    // Side Winglets on Splitter
    [-9, 9].forEach(x => {
      const wingletGeo = new THREE.BoxGeometry(0.6, 2.5, 4);
      const winglet = new THREE.Mesh(wingletGeo, carbonFiberMat);
      winglet.position.set(x, -0.6, 17.5);
      this.carGroup.add(winglet);
    });

    // 4. Laser LED Matrix Headlights & Daytime Running Lights
    [-5.6, 5.6].forEach(x => {
      const hlGeo = new THREE.BoxGeometry(3.6, 0.7, 1.2);
      const hlMesh = new THREE.Mesh(hlGeo, ledLaserMat);
      hlMesh.position.set(x, 1.6, 17.6);
      this.carGroup.add(hlMesh);
      this.headlights.push(hlMesh);

      // Light Cone Beam Projection on Ground
      const beamGeo = new THREE.ConeGeometry(5, 30, 16);
      const beamMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending
      });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.rotation.x = -Math.PI / 2.2;
      beam.position.set(x, 0.5, 32);
      this.carGroup.add(beam);
      this.headlights.push(beam);
    });

    // 5. Functional Dihedral Scissor Doors (Swan Wing)
    this.leftDoor = new THREE.Group();
    const lDoorMesh = new THREE.Mesh(new THREE.BoxGeometry(1.2, 5.5, 12), this.carPaintMat);
    this.leftDoor.add(lDoorMesh);
    this.leftDoor.position.set(-8.2, 2.2, 0);
    this.carGroup.add(this.leftDoor);

    this.rightDoor = new THREE.Group();
    const rDoorMesh = new THREE.Mesh(new THREE.BoxGeometry(1.2, 5.5, 12), this.carPaintMat);
    this.rightDoor.add(rDoorMesh);
    this.rightDoor.position.set(8.2, 2.2, 0);
    this.carGroup.add(this.rightDoor);

    // Carbon Side Mirrors
    [-8.8, 8.8].forEach(x => {
      const mirror = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.9, 1.4), carbonFiberMat);
      mirror.position.set(x, 4.4, 5);
      this.carGroup.add(mirror);
    });

    // 6. Active Rear Swan-Neck Spoiler & Wing
    this.rearWing = new THREE.Group();
    const wingBlade = new THREE.Mesh(new THREE.BoxGeometry(20, 0.7, 5.5), carbonFiberMat);
    this.rearWing.add(wingBlade);

    // Swan-Neck Struts
    [-6.5, 6.5].forEach(x => {
      const strut = new THREE.Mesh(new THREE.BoxGeometry(0.8, 5, 2.2), carbonFiberMat);
      strut.position.set(x, -2.5, 0);
      strut.rotation.x = -0.2;
      this.rearWing.add(strut);
    });

    this.rearWing.position.set(0, 5.2, -17.5);
    this.carGroup.add(this.rearWing);

    // 7. Full-Width Sculpted Rear LED Lightbar
    const tailLightGeo = new THREE.BoxGeometry(16.5, 0.7, 0.8);
    const tailLight = new THREE.Mesh(tailLightGeo, redLedMat);
    tailLight.position.set(0, 1.8, -18.4);
    this.carGroup.add(tailLight);

    // Rear Carbon Diffuser with Aero Fins
    const diffuser = new THREE.Mesh(new THREE.BoxGeometry(17, 1.8, 6), carbonFiberMat);
    diffuser.position.set(0, -1.6, -17.8);
    this.carGroup.add(diffuser);

    // 4 Quad Titanium Exhaust Pipes
    [-3.8, -1.8, 1.8, 3.8].forEach(x => {
      const pipeGeo = new THREE.CylinderGeometry(0.8, 0.8, 2.2, 16);
      const pipe = new THREE.Mesh(pipeGeo, chromeTitaniumMat);
      pipe.rotation.x = Math.PI / 2;
      pipe.position.set(x, -0.6, -18.8);
      this.carGroup.add(pipe);
    });

    // 8. 4 High-Performance 10-Spoke Forged Alloy Wheels with Brembo Calipers
    const wheelCoords = [
      { x: -8.4, z: 11.2 },
      { x: 8.4, z: 11.2 },
      { x: -8.4, z: -11.2 },
      { x: 8.4, z: -11.2 }
    ];

    wheelCoords.forEach(pos => {
      const wheelAssembly = new THREE.Group();

      // Performance Tire (Pirelli P-Zero Tread)
      const tireGeo = new THREE.CylinderGeometry(4.4, 4.4, 2.6, 32);
      const tireMat = new THREE.MeshStandardMaterial({ color: 0x14161f, roughness: 0.85 });
      const tire = new THREE.Mesh(tireGeo, tireMat);
      tire.rotation.z = Math.PI / 2;
      wheelAssembly.add(tire);

      // Forged Alloy Rim
      const rimGeo = new THREE.CylinderGeometry(3.0, 3.0, 2.7, 10);
      const rim = new THREE.Mesh(rimGeo, chromeTitaniumMat);
      rim.rotation.z = Math.PI / 2;
      wheelAssembly.add(rim);

      // Drilled Carbon-Ceramic Rotor Disc
      const discGeo = new THREE.CylinderGeometry(2.5, 2.5, 0.4, 24);
      const discMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.95 });
      const disc = new THREE.Mesh(discGeo, discMat);
      disc.rotation.z = Math.PI / 2;
      wheelAssembly.add(disc);

      // Gold Brembo Brake Caliper
      const caliperGeo = new THREE.BoxGeometry(1.4, 2.4, 1.8);
      const caliperMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
      const caliper = new THREE.Mesh(caliperGeo, caliperMat);
      caliper.position.set(pos.x > 0 ? -0.8 : 0.8, 1.8, 0);
      wheelAssembly.add(caliper);

      wheelAssembly.position.set(pos.x, -2.2, pos.z);
      this.carGroup.add(wheelAssembly);
      this.wheels.push(wheelAssembly);
    });

    // 9. Ground Neon Underglow Kit
    this.underglowLight = new THREE.PointLight(0xf59e0b, 2.5, 30);
    this.underglowLight.position.set(0, -4.5, 0);
    this.carGroup.add(this.underglowLight);

    const underglowPlaneGeo = new THREE.PlaneGeometry(16, 34);
    const underglowPlaneMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });
    this.underglowMesh = new THREE.Mesh(underglowPlaneGeo, underglowPlaneMat);
    this.underglowMesh.rotation.x = -Math.PI / 2;
    this.underglowMesh.position.y = -4.8;
    this.carGroup.add(this.underglowMesh);
  }

  // Paint Color Changer
  setPaintColor(colorHex) {
    if (!this.carPaintMat) return;
    this.carPaintMat.color.setStyle(colorHex);

    if (this.underglowLight && this.underglowMesh) {
      this.underglowLight.color.setStyle(colorHex);
      this.underglowMesh.material.color.setStyle(colorHex);
    }
  }

  // Toggle Headlights
  toggleHeadlights() {
    this.lightsOn = !this.lightsOn;
    this.headlights.forEach(l => {
      l.visible = this.lightsOn;
    });
  }

  // Toggle Scissor / Dihedral Doors
  toggleDoors() {
    this.doorsOpen = !this.doorsOpen;
    if (this.leftDoor && this.rightDoor) {
      this.leftDoor.rotation.z = this.doorsOpen ? -0.65 : 0;
      this.leftDoor.rotation.y = this.doorsOpen ? 0.35 : 0;
      this.leftDoor.position.y = this.doorsOpen ? 5.5 : 2.2;

      this.rightDoor.rotation.z = this.doorsOpen ? 0.65 : 0;
      this.rightDoor.rotation.y = this.doorsOpen ? -0.35 : 0;
      this.rightDoor.position.y = this.doorsOpen ? 5.5 : 2.2;
    }
  }

  // Toggle Active Aero Spoiler
  toggleWing() {
    this.wingRaised = !this.wingRaised;
    if (this.rearWing) {
      this.rearWing.position.y = this.wingRaised ? 8.2 : 5.2;
      this.rearWing.rotation.x = this.wingRaised ? -0.2 : 0;
    }
  }

  // Exhaust Blue Flame Particle Backfire
  triggerExhaustBackfire() {
    [-3.8, -1.8, 1.8, 3.8].forEach(x => {
      for (let i = 0; i < 4; i++) {
        const flameGeo = new THREE.SphereGeometry(0.8, 8, 8);
        const flameMat = new THREE.MeshBasicMaterial({
          color: Math.random() > 0.3 ? 0x00f0ff : 0xf59e0b,
          transparent: true,
          opacity: 0.9,
          blending: THREE.AdditiveBlending
        });
        const flame = new THREE.Mesh(flameGeo, flameMat);
        flame.position.set(x, -0.6, -19.5 - i * 1.5);
        this.carGroup.add(flame);
        this.exhaustFlames.push(flame);
      }
    });
  }

  // Suspension Shake
  shakeSuspension() {
    let count = 0;
    const startY = this.carGroup.position.y;
    const shakeInterval = setInterval(() => {
      count++;
      this.carGroup.position.y = startY + (Math.random() - 0.5) * 0.45;
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
