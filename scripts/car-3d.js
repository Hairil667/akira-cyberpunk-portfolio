/**
 * APEX MOTORS // CINEMATIC HYPERCAR 3D STUDIO
 * Ultra-detailed procedural sports car + night city rain highway environment
 */

class Car3DStudio {
  constructor() {
    this.carScene = null;
    this.carGroup = null;
    this.carPaintMat = null;
    this.rimMat = null;
    this.wheels = [];
    this.headlightMeshes = [];
    this.rearWingMesh = null;
    this.leftDoorGroup = null;
    this.rightDoorGroup = null;
    this.underglowLight = null;
    this.exhaustFlames = [];
    this.rainDrops = [];
    this.roadLines = [];
    this.cityLights = [];
    this.trafficCars = [];
    this.tunnelGates = [];

    this.doorsOpen = false;
    this.wingRaised = false;
    this.isDriving = false;
    this.lightsOn = true;

    this.init();
  }

  init() {
    if (typeof THREE === 'undefined') { console.error('Three.js missing'); return; }
    this.initRainHighwayBg();
    this.initCarStudio();
  }

  /* ====================================================================
     BACKGROUND: RAINY NIGHT HIGHWAY + CITY GLOW
  ==================================================================== */
  initRainHighwayBg() {
    const canvas = document.getElementById('car-canvas-bg');
    if (!canvas) return;

    const W = window.innerWidth, H = window.innerHeight;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(62, W / H, 0.5, 3000);
    camera.position.set(0, 18, 180);
    camera.lookAt(0, 0, -400);

    // Ambient warm city glow
    scene.add(new THREE.AmbientLight(0x0a0e1a, 2.0));
    const cityGlow = new THREE.DirectionalLight(0xff6030, 0.6);
    cityGlow.position.set(0, 200, -500);
    scene.add(cityGlow);

    // ==== WET ASPHALT ROAD (long) ====
    const roadGeo = new THREE.PlaneGeometry(220, 4000);
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x060810, roughness: 0.08, metalness: 0.9 });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, -20, -1600);
    scene.add(road);

    // Road edge reflective strips
    [-110, 110].forEach(x => {
      const stripGeo = new THREE.PlaneGeometry(2, 4000);
      const stripMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const strip = new THREE.Mesh(stripGeo, stripMat);
      strip.rotation.x = -Math.PI / 2;
      strip.position.set(x, -19.9, -1600);
      scene.add(strip);
    });

    // Animated center dashed road lines
    for (let i = 0; i < 60; i++) {
      const lGeo = new THREE.PlaneGeometry(1.8, 20);
      const lMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.9 });
      const l = new THREE.Mesh(lGeo, lMat);
      l.rotation.x = -Math.PI / 2;
      l.position.set(0, -19.8, -60 - i * 66);
      scene.add(l);
      this.roadLines.push(l);
    }

    // Lane dividers
    [-55, 55].forEach(x => {
      for (let i = 0; i < 40; i++) {
        const lGeo = new THREE.PlaneGeometry(0.8, 16);
        const lMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
        const l = new THREE.Mesh(lGeo, lMat);
        l.rotation.x = -Math.PI / 2;
        l.position.set(x, -19.8, -50 - i * 100);
        scene.add(l);
        this.roadLines.push(l);
      }
    });

    // ==== STREET LAMPS ====
    for (let i = 0; i < 20; i++) {
      [-130, 130].forEach(x => {
        const poleGeo = new THREE.CylinderGeometry(0.5, 0.5, 50, 8);
        const poleMat = new THREE.MeshStandardMaterial({ color: 0x222234, metalness: 0.9 });
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.set(x, 5, -80 - i * 200);
        scene.add(pole);

        const lampGeo = new THREE.SphereGeometry(2.5, 8, 8);
        const lampMat = new THREE.MeshBasicMaterial({ color: 0xffa040 });
        const lamp = new THREE.Mesh(lampGeo, lampMat);
        lamp.position.set(x > 0 ? x - 10 : x + 10, 28, -80 - i * 200);
        scene.add(lamp);

        // Downward cone of light
        const coneGeo = new THREE.ConeGeometry(18, 45, 16, 1, true);
        const coneMat = new THREE.MeshBasicMaterial({ color: 0xff9900, transparent: true, opacity: 0.06, side: THREE.DoubleSide });
        const cone = new THREE.Mesh(coneGeo, coneMat);
        cone.position.set(x > 0 ? x - 10 : x + 10, 5, -80 - i * 200);
        cone.rotation.x = Math.PI;
        scene.add(cone);

        // Pool of light on road
        const poolGeo = new THREE.PlaneGeometry(38, 55);
        const poolMat = new THREE.MeshBasicMaterial({ color: 0xffe0a0, transparent: true, opacity: 0.07 });
        const pool = new THREE.Mesh(poolGeo, poolMat);
        pool.rotation.x = -Math.PI / 2;
        pool.position.set(x > 0 ? x - 10 : x + 10, -19.5, -80 - i * 200);
        scene.add(pool);
      });
    }

    // ==== TRAFFIC CARS (oncoming & same direction) ====
    const carColors = [0xff0033, 0xffffff, 0x00f0ff, 0xf59e0b, 0x4488ff];
    for (let i = 0; i < 12; i++) {
      const tcGroup = new THREE.Group();
      const tcBody = new THREE.Mesh(
        new THREE.BoxGeometry(12, 5, 22),
        new THREE.MeshStandardMaterial({ color: carColors[i % carColors.length], metalness: 0.8, roughness: 0.2 })
      );
      tcGroup.add(tcBody);

      const roof = new THREE.Mesh(
        new THREE.BoxGeometry(10, 3.5, 13),
        new THREE.MeshStandardMaterial({ color: carColors[i % carColors.length], metalness: 0.8 })
      );
      roof.position.y = 4.2;
      tcGroup.add(roof);

      // Headlights
      [-3.5, 3.5].forEach(x => {
        const hl = new THREE.Mesh(new THREE.SphereGeometry(1.2, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
        hl.position.set(x, 0, 11.2);
        tcGroup.add(hl);
      });
      // Taillights
      [-3.5, 3.5].forEach(x => {
        const tl = new THREE.Mesh(new THREE.BoxGeometry(3, 1, 0.5), new THREE.MeshBasicMaterial({ color: 0xff0022 }));
        tl.position.set(x, 0, -11.2);
        tcGroup.add(tl);
      });

      const lane = i % 4;
      const laneX = lane === 0 ? -75 : lane === 1 ? -25 : lane === 2 ? 25 : 75;
      tcGroup.position.set(laneX, -17, -300 - i * 280);
      tcGroup._speed = Math.random() * 1.8 + 0.8;
      tcGroup._dir = laneX > 0 ? -1 : 1; // opposite lanes face opposite direction
      if (laneX > 0) tcGroup.rotation.y = Math.PI;
      scene.add(tcGroup);
      this.trafficCars.push(tcGroup);
    }

    // ==== CITY SKYLINE (depth) ====
    for (let i = 0; i < 40; i++) {
      const h = Math.random() * 350 + 80;
      const w = Math.random() * 50 + 25;
      const geo = new THREE.BoxGeometry(w, h, w);
      const mat = new THREE.MeshStandardMaterial({ color: 0x07080e, metalness: 0.8, roughness: 0.7 });
      const building = new THREE.Mesh(geo, mat);
      const side = i % 2 === 0 ? 1 : -1;
      building.position.set(side * (Math.random() * 400 + 180), h / 2 - 22, -900 - Math.random() * 900);
      scene.add(building);

      // Building window lights grid (canvas texture)
      const winsGeo = new THREE.PlaneGeometry(w * 0.85, h * 0.8);
      const winsCanvas = document.createElement('canvas');
      winsCanvas.width = 64; winsCanvas.height = 256;
      const ctx = winsCanvas.getContext('2d');
      ctx.fillStyle = '#060810';
      ctx.fillRect(0, 0, 64, 256);
      for (let wy = 0; wy < 32; wy++) {
        for (let wx = 0; wx < 8; wx++) {
          if (Math.random() > 0.45) {
            const colors = ['#ffe0a0', '#a0d4ff', '#ff8040', '#ffffff'];
            ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
            ctx.fillRect(wx * 8 + 1, wy * 8 + 1, 6, 5);
          }
        }
      }
      const winsTex = new THREE.CanvasTexture(winsCanvas);
      const winsMat = new THREE.MeshBasicMaterial({ map: winsTex, transparent: true, opacity: 0.85 });
      const wins = new THREE.Mesh(winsGeo, winsMat);
      wins.position.set(side * (Math.random() * 400 + 180) * 0.999, h / 2 - 22, building.position.z + (side > 0 ? -w / 2 - 0.5 : w / 2 + 0.5));
      wins.rotation.y = side > 0 ? 0 : Math.PI;
      scene.add(wins);
    }

    // ==== RAIN PARTICLES ====
    const rainCount = 1800;
    const rainGeo = new THREE.BufferGeometry();
    const rainPos = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      rainPos[i * 3] = (Math.random() - 0.5) * 500;
      rainPos[i * 3 + 1] = Math.random() * 220 - 20;
      rainPos[i * 3 + 2] = Math.random() * -900 + 80;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
    const rainMat = new THREE.PointsMaterial({ color: 0x88aaff, size: 0.8, transparent: true, opacity: 0.55 });
    const rainMesh = new THREE.Points(rainGeo, rainMat);
    scene.add(rainMesh);

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    let mx = 0, my = 0;
    window.addEventListener('mousemove', e => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    const rainPos3 = rainGeo.attributes.position;

    const animBg = () => {
      requestAnimationFrame(animBg);
      const speed = this.isDriving ? 9 : 2;

      // Road lines scroll
      this.roadLines.forEach(l => {
        l.position.z += speed * 2.2;
        if (l.position.z > 150) l.position.z -= 3960;
      });

      // Traffic cars
      this.trafficCars.forEach(tc => {
        tc.position.z += (speed - tc._speed) * 2.2;
        if (tc.position.z > 200) tc.position.z = -3000;
        if (tc.position.z < -3200) tc.position.z = 180;
      });

      // Rain
      for (let i = 0; i < rainCount; i++) {
        rainPos3.array[i * 3 + 1] -= 4.5 + speed * 0.5;
        rainPos3.array[i * 3] -= speed * 0.15;
        if (rainPos3.array[i * 3 + 1] < -22) {
          rainPos3.array[i * 3 + 1] = 220;
        }
      }
      rainPos3.needsUpdate = true;

      // Subtle camera parallax
      camera.position.x += (mx * 14 - camera.position.x) * 0.04;
      camera.position.y += (-my * 6 + 18 - camera.position.y) * 0.04;
      camera.lookAt(camera.position.x * 0.1, -2, -400);

      renderer.render(scene, camera);
    };
    animBg();
    this.bgScene = { scene, camera, renderer };
  }

  /* ====================================================================
     CAR STUDIO: HIGH-DETAIL SPORTS CAR + STUDIO LIGHTS
  ==================================================================== */
  initCarStudio() {
    const container = document.querySelector('.car-3d-stage-box');
    const canvas = document.getElementById('car-3d-canvas');
    if (!container || !canvas) return;

    const W = container.clientWidth || 900;
    const H = container.clientHeight || 500;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, W / H, 0.1, 800);
    camera.position.set(28, 11, 46);
    camera.lookAt(0, 2, 0);

    // Studio three-point lighting
    scene.add(new THREE.AmbientLight(0xffffff, 1.2));
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.0);
    keyLight.position.set(40, 80, 55);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0x80dfff, 2.2);
    rimLight.position.set(-50, 40, -55);
    scene.add(rimLight);
    const underLight = new THREE.PointLight(0xf59e0b, 2.0, 80);
    underLight.position.set(0, -8, 0);
    scene.add(underLight);

    // Pedestal / turntable platform
    const pedGeo = new THREE.CylinderGeometry(40, 42, 1.5, 80);
    const pedMat = new THREE.MeshStandardMaterial({ color: 0x070810, metalness: 0.92, roughness: 0.15 });
    const pedestal = new THREE.Mesh(pedGeo, pedMat);
    pedestal.position.y = -6.6;
    pedestal.receiveShadow = true;
    scene.add(pedestal);

    // Gold ring around pedestal
    const ringGeo = new THREE.TorusGeometry(41, 0.4, 16, 80);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.y = -5.8;
    ringMesh.rotation.x = Math.PI / 2;
    scene.add(ringMesh);

    // Build the car
    this.carGroup = new THREE.Group();
    this.buildSportsCar();
    scene.add(this.carGroup);

    // ==== ORBIT CONTROLS (manual) ====
    let isDragging = false, autoRotate = true;
    let prevX = 0, prevY = 0;
    let camTheta = 0.65, camPhi = 0.26, camRadius = 52;
    const setCamFromSpherical = () => {
      camera.position.x = camRadius * Math.sin(camPhi) * Math.sin(camTheta);
      camera.position.y = camRadius * Math.cos(camPhi) + 2;
      camera.position.z = camRadius * Math.sin(camPhi) * Math.cos(camTheta);
      camera.lookAt(0, 2, 0);
    };
    setCamFromSpherical();

    canvas.addEventListener('mousedown', e => { isDragging = true; autoRotate = false; prevX = e.clientX; prevY = e.clientY; });
    window.addEventListener('mouseup', () => { isDragging = false; });
    canvas.addEventListener('mousemove', e => {
      if (!isDragging) return;
      camTheta -= (e.clientX - prevX) * 0.012;
      camPhi = Math.max(0.12, Math.min(1.45, camPhi + (e.clientY - prevY) * 0.012));
      prevX = e.clientX; prevY = e.clientY;
      setCamFromSpherical();
    });
    canvas.addEventListener('wheel', e => {
      e.preventDefault();
      camRadius = Math.max(28, Math.min(90, camRadius + e.deltaY * 0.06));
      setCamFromSpherical();
    }, { passive: false });
    canvas.addEventListener('touchstart', e => { if (e.touches.length === 1) { isDragging = true; autoRotate = false; prevX = e.touches[0].clientX; prevY = e.touches[0].clientY; } }, { passive: true });
    canvas.addEventListener('touchmove', e => {
      if (!isDragging || e.touches.length !== 1) return;
      camTheta -= (e.touches[0].clientX - prevX) * 0.012;
      camPhi = Math.max(0.12, Math.min(1.45, camPhi + (e.touches[0].clientY - prevY) * 0.012));
      prevX = e.touches[0].clientX; prevY = e.touches[0].clientY;
      setCamFromSpherical();
    }, { passive: true });
    canvas.addEventListener('touchend', () => { isDragging = false; });

    // Bind paint swatches
    document.querySelectorAll('.color-swatch-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.color-swatch-btn').forEach(s => s.classList.remove('active'));
        btn.classList.add('active');
        this.setPaintColor(btn.dataset.color);
        if (window.carAudio) window.carAudio.playClick();
      });
    });

    // Bind dock buttons
    const bindBtn = (id, fn, toggle) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('click', () => { fn(); if (toggle) el.classList.toggle('active', toggle()); });
    };
    bindBtn('btn-rev-engine', () => { if (window.carAudio) window.carAudio.playEngineRev(); this.spawnFlames(); this.shakeCar(); });
    bindBtn('btn-toggle-lights', () => { this.toggleLights(); if (window.carAudio) window.carAudio.playLightsToggle(); }, () => this.lightsOn);
    bindBtn('btn-toggle-doors', () => { this.toggleDoors(); if (window.carAudio) window.carAudio.playAeroServo(); }, () => this.doorsOpen);
    bindBtn('btn-toggle-wing', () => { this.toggleWing(); if (window.carAudio) window.carAudio.playAeroServo(); }, () => this.wingRaised);
    const btnDrive = document.getElementById('btn-drive-mode');
    if (btnDrive) btnDrive.addEventListener('click', () => {
      this.isDriving = !this.isDriving;
      btnDrive.classList.toggle('active', this.isDriving);
      btnDrive.innerHTML = this.isDriving ? '<span>🛑</span> STOP DRIVE' : '<span>🚀</span> ACCELERATE';
      if (this.isDriving) { this.spawnFlames(); if (window.carAudio) window.carAudio.playEngineRev(); }
      if (window.carAudio) window.carAudio.playClick();
    });

    document.querySelectorAll('.btn-cam-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        const v = btn.dataset.view;
        if (v === 'front') { camTheta = -0.4; camPhi = 0.3; camRadius = 52; }
        else if (v === 'side') { camTheta = Math.PI / 2; camPhi = 0.3; camRadius = 50; }
        else if (v === 'rear') { camTheta = Math.PI - 0.4; camPhi = 0.3; camRadius = 52; }
        else { camTheta = 0.65; camPhi = 0.26; camRadius = 52; }
        setCamFromSpherical();
        if (window.carAudio) window.carAudio.playClick();
      });
    });

    window.addEventListener('resize', () => {
      const nW = container.clientWidth || 900;
      const nH = container.clientHeight || 500;
      camera.aspect = nW / nH;
      camera.updateProjectionMatrix();
      renderer.setSize(nW, nH);
    });

    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.016;

      if (autoRotate && !isDragging) {
        camTheta += 0.004;
        setCamFromSpherical();
      }

      if (this.isDriving) {
        this.wheels.forEach(w => w.rotation.x += 0.28);
        this.carGroup.position.y = Math.sin(time * 22) * 0.09;
      }

      // Exhaust flames decay
      for (let i = this.exhaustFlames.length - 1; i >= 0; i--) {
        const f = this.exhaustFlames[i];
        f.position.z -= 0.7;
        f.scale.multiplyScalar(0.88);
        f.material.opacity *= 0.88;
        if (f.scale.x < 0.08) { this.carGroup.remove(f); this.exhaustFlames.splice(i, 1); }
      }

      pedestal.rotation.y -= 0.002;
      renderer.render(scene, camera);
    };
    animate();
    this.carScene = { scene, camera, renderer };
  }

  /* ====================================================================
     BUILD HIGH-DETAIL PROCEDURAL SPORTS CAR
     Inspired by Ferrari 488 / Lamborghini Huracán / McLaren 720S
  ==================================================================== */
  buildSportsCar() {
    this.carPaintMat = new THREE.MeshPhysicalMaterial({
      color: 0x111317, metalness: 0.9, roughness: 0.12,
      clearcoat: 1.0, clearcoatRoughness: 0.06, reflectivity: 1.0
    });
    const carbon = new THREE.MeshStandardMaterial({ color: 0x0a0b0f, metalness: 0.9, roughness: 0.22 });
    const glass = new THREE.MeshPhysicalMaterial({ color: 0x0d1a2e, transparent: true, opacity: 0.82, roughness: 0.05, transmission: 0.6 });
    this.rimMat = new THREE.MeshStandardMaterial({ color: 0xdde8f0, metalness: 0.98, roughness: 0.04 });
    const ledWhite = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const ledRed = new THREE.MeshBasicMaterial({ color: 0xff0033 });
    const caliperGold = new THREE.MeshBasicMaterial({ color: 0xf59e0b });

    // ============================================================
    // 1. MAIN BODY — low, wide aerodynamic wedge using ExtrudeGeometry
    // ============================================================
    const bodyShape = new THREE.Shape();
    bodyShape.moveTo(-9.5, -2.2);
    bodyShape.lineTo(-9.5, 0.0);
    bodyShape.quadraticCurveTo(-9.2, 3.6, -4.0, 5.0);
    bodyShape.quadraticCurveTo(0, 5.4, 4.0, 5.0);
    bodyShape.quadraticCurveTo(9.2, 3.6, 9.5, 0.0);
    bodyShape.lineTo(9.5, -2.2);
    bodyShape.lineTo(-9.5, -2.2);
    const bodyExt = { depth: 37, bevelEnabled: true, bevelSegments: 8, bevelSize: 1.1, bevelThickness: 1.1, steps: 2 };
    const bodGeo = new THREE.ExtrudeGeometry(bodyShape, bodyExt);
    const bodyMesh = new THREE.Mesh(bodGeo, this.carPaintMat);
    bodyMesh.rotation.y = Math.PI / 2;
    bodyMesh.position.set(18.5, 0.2, -18.5);
    bodyMesh.castShadow = true;
    this.carGroup.add(bodyMesh);

    // 2. COCKPIT CANOPY with strong slope (wedge aerodynamic roofline)
    const canopyShape = new THREE.Shape();
    canopyShape.moveTo(-7.5, 0);
    canopyShape.quadraticCurveTo(-7, 4.8, 0, 5.2);
    canopyShape.quadraticCurveTo(7, 4.8, 7.5, 0);
    const canopyExt = { depth: 14, bevelEnabled: true, bevelSegments: 6, bevelSize: 0.6, bevelThickness: 0.6 };
    const canGeo = new THREE.ExtrudeGeometry(canopyShape, canopyExt);
    const canMesh = new THREE.Mesh(canGeo, glass);
    canMesh.rotation.y = Math.PI / 2;
    canMesh.position.set(7, 4.8, -3.0);
    canMesh.rotation.x = 0.08;
    this.carGroup.add(canMesh);

    // A-pillar & windshield frame
    const wshldGeo = new THREE.BoxGeometry(16.5, 0.7, 10);
    const wshld = new THREE.Mesh(wshldGeo, this.carPaintMat);
    wshld.position.set(0, 9.5, 5.8);
    wshld.rotation.x = 0.65;
    this.carGroup.add(wshld);

    // Rear fastback / flying buttresses
    [-8.2, 8.2].forEach(x => {
      const buttGeo = new THREE.BoxGeometry(1.6, 3.8, 10);
      const butt = new THREE.Mesh(buttGeo, this.carPaintMat);
      butt.position.set(x, 7.2, -9.5);
      butt.rotation.x = 0.35;
      this.carGroup.add(butt);
    });

    // 3. FRONT HOOD with sharp nose and vents
    const hoodGeo = new THREE.BoxGeometry(16.5, 1.8, 14);
    const hood = new THREE.Mesh(hoodGeo, this.carPaintMat);
    hood.position.set(0, 4.5, 14);
    hood.rotation.x = -0.18;
    this.carGroup.add(hood);

    // Front centre vent/opening
    const frontVentGeo = new THREE.BoxGeometry(6, 2.5, 2.5);
    const frontVent = new THREE.Mesh(frontVentGeo, carbon);
    frontVent.position.set(0, 1.5, 18.2);
    this.carGroup.add(frontVent);

    // 4. FRONT SPLITTER — wide, very low, aggressive
    const splGeo = new THREE.BoxGeometry(22, 0.55, 8);
    const spl = new THREE.Mesh(splGeo, carbon);
    spl.position.set(0, -1.8, 17.5);
    this.carGroup.add(spl);

    // Side splitter winglets
    [-11, 11].forEach(x => {
      const wlGeo = new THREE.BoxGeometry(0.55, 4.5, 5.5);
      const wl = new THREE.Mesh(wlGeo, carbon);
      wl.position.set(x, 0.4, 17.0);
      this.carGroup.add(wl);
    });

    // Front bumper inlet
    [-5.5, 5.5].forEach(x => {
      const inletGeo = new THREE.BoxGeometry(4.5, 3, 2);
      const inlet = new THREE.Mesh(inletGeo, carbon);
      inlet.position.set(x, 0.2, 18.8);
      this.carGroup.add(inlet);
    });

    // 5. SHARP-NOSED FRONT FASCIA
    const noseGeo = new THREE.CylinderGeometry(0.01, 3.5, 8, 16, 1);
    const nose = new THREE.Mesh(noseGeo, this.carPaintMat);
    nose.rotation.x = Math.PI / 2;
    nose.position.set(0, 2.8, 20.8);
    this.carGroup.add(nose);

    // 6. HEADLIGHTS — thin slanted quad-blade LED DRL
    this.headlightMeshes = [];
    [-6.5, 6.5].forEach(x => {
      const hlGroup = new THREE.Group();
      // Main laser LED strip (slim)
      const hlGeo = new THREE.BoxGeometry(4.8, 0.6, 1.6);
      const hl = new THREE.Mesh(hlGeo, ledWhite);
      hl.position.set(0, 0, 0);
      hlGroup.add(hl);
      // DRL blade under
      const drlGeo = new THREE.BoxGeometry(4.2, 0.3, 1.0);
      const drl = new THREE.Mesh(drlGeo, ledWhite);
      drl.position.set(0, -1.0, 0.2);
      hlGroup.add(drl);
      hlGroup.position.set(x, 2.5, 18.2);
      hlGroup.rotation.y = x > 0 ? -0.2 : 0.2;
      this.carGroup.add(hlGroup);
      this.headlightMeshes.push(hlGroup);
    });

    // 7. DOORS WITH CARBON SILL & SIDE VENTS
    this.leftDoorGroup = new THREE.Group();
    const lDoorShape = new THREE.Shape();
    lDoorShape.moveTo(0, -2.5);
    lDoorShape.lineTo(0, 4.5);
    lDoorShape.quadraticCurveTo(0.3, 5.0, 1.0, 4.8);
    lDoorShape.lineTo(1.2, -2.5);
    const doorExt = { depth: 14, bevelEnabled: true, bevelSize: 0.4, bevelThickness: 0.4, bevelSegments: 4 };
    const lDoorGeo = new THREE.ExtrudeGeometry(lDoorShape, doorExt);
    const lDoorMesh = new THREE.Mesh(lDoorGeo, this.carPaintMat);
    this.leftDoorGroup.add(lDoorMesh);

    // Side air scoop on door
    const scoopL = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2, 3), carbon);
    scoopL.position.set(1.0, 1.0, 5);
    this.leftDoorGroup.add(scoopL);

    this.leftDoorGroup.position.set(-9.6, 0, -3.5);
    this.carGroup.add(this.leftDoorGroup);

    this.rightDoorGroup = new THREE.Group();
    const rDoorGeo = new THREE.ExtrudeGeometry(lDoorShape, doorExt);
    const rDoorMesh = new THREE.Mesh(rDoorGeo, this.carPaintMat);
    rDoorMesh.scale.x = -1;
    this.rightDoorGroup.add(rDoorMesh);
    const scoopR = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2, 3), carbon);
    scoopR.position.set(-1.0, 1.0, 5);
    this.rightDoorGroup.add(scoopR);
    this.rightDoorGroup.position.set(9.6, 0, -3.5);
    this.carGroup.add(this.rightDoorGroup);

    // Carbon side skirts
    [-10.5, 10.5].forEach(x => {
      const skirtGeo = new THREE.BoxGeometry(0.6, 1.8, 32);
      const skirt = new THREE.Mesh(skirtGeo, carbon);
      skirt.position.set(x, -1.3, 0);
      this.carGroup.add(skirt);
    });

    // Aero side mirrors
    [-9.5, 9.5].forEach(x => {
      const mirGeo = new THREE.BoxGeometry(3.2, 1.0, 1.6);
      const mir = new THREE.Mesh(mirGeo, carbon);
      mir.position.set(x > 0 ? x + 0.5 : x - 0.5, 6.8, 5.5);
      this.carGroup.add(mir);
    });

    // 8. ENGINE DECK LID with large centre air scoop
    const deckGeo = new THREE.BoxGeometry(16, 1.6, 10);
    const deck = new THREE.Mesh(deckGeo, this.carPaintMat);
    deck.position.set(0, 5.5, -11);
    this.carGroup.add(deck);

    const centreScoop = new THREE.Mesh(new THREE.BoxGeometry(7, 2, 7), carbon);
    centreScoop.position.set(0, 6.8, -12);
    this.carGroup.add(centreScoop);

    // 9. ACTIVE REAR WING — twin swan-neck mounts
    this.rearWingMesh = new THREE.Group();
    // Wing blade (main aerofoil)
    const wingBlade = new THREE.Mesh(new THREE.BoxGeometry(22.5, 0.9, 6.5), carbon);
    this.rearWingMesh.add(wingBlade);
    // Second Gurney flap
    const gurney = new THREE.Mesh(new THREE.BoxGeometry(22.5, 1.8, 0.5), carbon);
    gurney.position.set(0, 0.0, -3.5);
    this.rearWingMesh.add(gurney);
    // Swan-neck mounts
    [-7.5, 7.5].forEach(x => {
      const sn = new THREE.Mesh(new THREE.BoxGeometry(0.9, 5.5, 2.2), carbon);
      sn.position.set(x, -3.0, 0.8);
      sn.rotation.x = -0.15;
      this.rearWingMesh.add(sn);
    });
    this.rearWingMesh.position.set(0, 6.8, -18.2);
    this.carGroup.add(this.rearWingMesh);

    // 10. REAR FULL-WIDTH LED TAILLIGHT BAR + OUTLET BUMPER
    const tailbarGeo = new THREE.BoxGeometry(17.5, 0.7, 0.9);
    const tailbar = new THREE.Mesh(tailbarGeo, ledRed);
    tailbar.position.set(0, 2.2, -18.6);
    this.carGroup.add(tailbar);

    // Rear diffuser with fins
    const diffGeo = new THREE.BoxGeometry(18, 2.5, 7.5);
    const diff = new THREE.Mesh(diffGeo, carbon);
    diff.position.set(0, -1.8, -18.2);
    this.carGroup.add(diff);

    // Diffuser aero fins
    for (let i = -3; i <= 3; i++) {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.4, 2.4, 7), carbon);
      fin.position.set(i * 2.8, -0.8, -18.2);
      this.carGroup.add(fin);
    }

    // Exhaust quad tips
    [-5.2, -2.8, 2.8, 5.2].forEach(x => {
      const pipeGeo = new THREE.CylinderGeometry(0.9, 0.9, 2.4, 18);
      const pipe = new THREE.Mesh(pipeGeo, this.rimMat);
      pipe.rotation.x = Math.PI / 2;
      pipe.position.set(x, -0.4, -19.5);
      this.carGroup.add(pipe);
    });

    // 11. FOUR DETAILED PERFORMANCE WHEELS
    const wheelPositions = [
      { x: -10.6, z: 11.5 },
      { x: 10.6, z: 11.5 },
      { x: -10.6, z: -11.5 },
      { x: 10.6, z: -11.5 }
    ];

    wheelPositions.forEach(pos => {
      const wGroup = new THREE.Group();

      // Wide-profile motorsport tire
      const tireGeo = new THREE.TorusGeometry(4.5, 1.55, 20, 48);
      const tireMat = new THREE.MeshStandardMaterial({ color: 0x0e1018, roughness: 0.88 });
      const tireMesh = new THREE.Mesh(tireGeo, tireMat);
      tireMesh.rotation.y = Math.PI / 2;
      wGroup.add(tireMesh);

      // Centre hub cap
      const hubGeo = new THREE.CylinderGeometry(1.5, 1.5, 2.8, 16);
      const hub = new THREE.Mesh(hubGeo, this.rimMat);
      hub.rotation.z = Math.PI / 2;
      wGroup.add(hub);

      // 10 thin spokes
      for (let s = 0; s < 10; s++) {
        const spokeGeo = new THREE.BoxGeometry(2.8, 0.32, 0.22);
        const spoke = new THREE.Mesh(spokeGeo, this.rimMat);
        spoke.rotation.z = (s / 10) * Math.PI * 2;
        spoke.position.set(Math.cos((s / 10) * Math.PI * 2) * 1.4, 0, Math.sin((s / 10) * Math.PI * 2) * 1.4);
        spoke.rotation.x = Math.PI / 2;
        const sg2 = new THREE.BoxGeometry(2.8, 0.32, 0.22);
        const spoke2 = new THREE.Mesh(sg2, this.rimMat);
        spoke2.rotation.y = Math.PI / 2;
        spoke2.position.set(0, Math.cos((s / 10) * Math.PI * 2) * 1.4, Math.sin((s / 10) * Math.PI * 2) * 1.4);
        wGroup.add(spoke2);
      }

      // Outer rim lip
      const rimLipGeo = new THREE.TorusGeometry(3.5, 0.28, 10, 48);
      const rimLip = new THREE.Mesh(rimLipGeo, this.rimMat);
      rimLip.rotation.y = Math.PI / 2;
      wGroup.add(rimLip);

      // Carbon-ceramic rotor
      const rotorGeo = new THREE.CylinderGeometry(3.0, 3.0, 0.45, 32);
      const rotorMat = new THREE.MeshStandardMaterial({ color: 0x444860, metalness: 0.95, roughness: 0.25 });
      const rotor = new THREE.Mesh(rotorGeo, rotorMat);
      rotor.rotation.z = Math.PI / 2;
      wGroup.add(rotor);

      // Gold caliper (front only, visible side)
      const calGeo = new THREE.BoxGeometry(1.5, 2.6, 2.0);
      const cal = new THREE.Mesh(calGeo, caliperGold);
      cal.position.set(pos.x > 0 ? -1.0 : 1.0, 2.0, 0);
      wGroup.add(cal);

      wGroup.position.set(pos.x, -2.0, pos.z);
      this.carGroup.add(wGroup);
      this.wheels.push(wGroup);
    });

    // 12. NEON UNDERGLOW
    this.underglowLight = new THREE.PointLight(0xf59e0b, 3.0, 36);
    this.underglowLight.position.set(0, -5.5, 0);
    this.carGroup.add(this.underglowLight);

    const ugGeo = new THREE.PlaneGeometry(19, 38);
    const ugMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.28, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
    const ugMesh = new THREE.Mesh(ugGeo, ugMat);
    ugMesh.rotation.x = -Math.PI / 2;
    ugMesh.position.y = -5.8;
    this.carGroup.add(ugMesh);
    this._underglowMesh = ugMesh;
  }

  setPaintColor(hex) {
    if (this.carPaintMat) this.carPaintMat.color.setStyle(hex);
    if (this.underglowLight) this.underglowLight.color.setStyle(hex);
    if (this._underglowMesh) this._underglowMesh.material.color.setStyle(hex);
  }

  toggleLights() {
    this.lightsOn = !this.lightsOn;
    this.headlightMeshes.forEach(h => h.visible = this.lightsOn);
  }

  toggleDoors() {
    this.doorsOpen = !this.doorsOpen;
    if (this.leftDoorGroup) {
      this.leftDoorGroup.rotation.z = this.doorsOpen ? -0.55 : 0;
      this.leftDoorGroup.rotation.y = this.doorsOpen ? 0.25 : 0;
      this.leftDoorGroup.position.y = this.doorsOpen ? 4.5 : 0;
    }
    if (this.rightDoorGroup) {
      this.rightDoorGroup.rotation.z = this.doorsOpen ? 0.55 : 0;
      this.rightDoorGroup.rotation.y = this.doorsOpen ? -0.25 : 0;
      this.rightDoorGroup.position.y = this.doorsOpen ? 4.5 : 0;
    }
  }

  toggleWing() {
    this.wingRaised = !this.wingRaised;
    if (this.rearWingMesh) {
      this.rearWingMesh.position.y = this.wingRaised ? 9.5 : 6.8;
      this.rearWingMesh.rotation.x = this.wingRaised ? -0.18 : 0;
    }
  }

  spawnFlames() {
    [-5.2, -2.8, 2.8, 5.2].forEach(x => {
      for (let i = 0; i < 5; i++) {
        const fGeo = new THREE.SphereGeometry(0.9 + Math.random() * 0.6, 8, 8);
        const fMat = new THREE.MeshBasicMaterial({
          color: Math.random() > 0.35 ? 0x00dfff : 0xff6000,
          transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending
        });
        const f = new THREE.Mesh(fGeo, fMat);
        f.position.set(x + (Math.random() - 0.5) * 1.5, -0.4 + Math.random() * 0.8, -19.5 - i * 2.2);
        this.carGroup.add(f);
        this.exhaustFlames.push(f);
      }
    });
  }

  shakeCar() {
    const origY = this.carGroup.position.y;
    let c = 0;
    const iv = setInterval(() => {
      this.carGroup.position.y = origY + (Math.random() - 0.5) * 0.5;
      if (++c > 28) { clearInterval(iv); this.carGroup.position.y = origY; }
    }, 32);
  }
}

document.addEventListener('DOMContentLoaded', () => { window.car3D = new Car3DStudio(); });
