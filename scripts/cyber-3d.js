/**
 * AKIRA CYBERPUNK 3D ENGINE
 * Built with Three.js (WebGL)
 * Interactive 3D Background, Mecha Hangar, Cyber Hologram Core & Weapons
 */

class Cyber3DSystem {
  constructor() {
    this.bgScene = null;
    this.heroScene = null;
    this.mechaScene = null;
    this.weaponScene = null;
    this.init();
  }

  init() {
    if (typeof THREE === 'undefined') {
      console.error('Three.js not found');
      return;
    }

    this.initBackground3D();
    this.initHeroCore3D();
    this.initMechaHangar3D();
    this.initWeapons3D();
    this.bindScrollParallax();
  }

  /* ==========================================================================
     1. GLOBAL 3D CYBER SPACE BACKGROUND
     ========================================================================== */
  initBackground3D() {
    const canvas = document.getElementById('cyber-3d-bg');
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.z = 600;

    // A. 3D Particle Starfield & Cyber Dust
    const particleCount = 1000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const goldColor = new THREE.Color(0xffb703);
    const cyanColor = new THREE.Color(0x00f0ff);
    const darkGold = new THREE.Color(0x92400e);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 1600;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 1600;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1200;

      const choice = Math.random();
      const col = choice > 0.6 ? goldColor : (choice > 0.3 ? cyanColor : darkGold);
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 3.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, particleMaterial);
    scene.add(particles);

    // B. Floating 3D Wireframe Cyber Polyhedrons
    const floatingGroup = new THREE.Group();
    const shapes = [];
    const geomList = [
      new THREE.OctahedronGeometry(18, 0),
      new THREE.TetrahedronGeometry(16, 0),
      new THREE.IcosahedronGeometry(14, 0)
    ];

    for (let i = 0; i < 24; i++) {
      const geo = geomList[i % geomList.length];
      const mat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0xffb703 : 0x00f0ff,
        wireframe: true,
        transparent: true,
        opacity: 0.25
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        (Math.random() - 0.5) * 1200,
        (Math.random() - 0.5) * 1000,
        (Math.random() - 0.5) * 600
      );
      mesh.rotationSpeed = {
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02
      };
      shapes.push(mesh);
      floatingGroup.add(mesh);
    }
    scene.add(floatingGroup);

    // C. 3D Cyber Horizon Grid Floor
    const gridHelper = new THREE.GridHelper(1600, 40, 0xffb703, 0x1f293d);
    gridHelper.position.y = -350;
    gridHelper.position.z = -200;
    gridHelper.rotation.x = 0.2;
    scene.add(gridHelper);

    // Parallax tracking
    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;

    window.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX - window.innerWidth / 2) * 0.2;
      mouseY = (e.clientY - window.innerHeight / 2) * 0.2;
    });

    // Resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Animation Loop
    const animateBg = () => {
      requestAnimationFrame(animateBg);

      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      particles.rotation.y += 0.0006;
      particles.rotation.x += 0.0003;

      shapes.forEach(s => {
        s.rotation.x += s.rotationSpeed.x;
        s.rotation.y += s.rotationSpeed.y;
      });

      floatingGroup.rotation.y += 0.001;

      camera.position.x = targetX * 0.4;
      camera.position.y = -targetY * 0.4;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animateBg();
    this.bgScene = { scene, camera, renderer, gridHelper };
  }

  bindScrollParallax() {
    window.addEventListener('scroll', () => {
      if (this.bgScene) {
        const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight || 1);
        this.bgScene.camera.position.z = 600 - scrollPercent * 200;
        this.bgScene.gridHelper.position.z = -200 + scrollPercent * 150;
      }
    });
  }

  /* ==========================================================================
     2. HERO 3D TACTICAL QUANTUM CORE
     ========================================================================== */
  initHeroCore3D() {
    const container = document.getElementById('hero-3d-viewport');
    const canvas = document.getElementById('hero-3d-canvas');
    if (!container || !canvas) return;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 110;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLightGold = new THREE.PointLight(0xffd000, 2, 200);
    pointLightGold.position.set(20, 30, 40);
    scene.add(pointLightGold);

    const pointLightCyan = new THREE.PointLight(0x00f0ff, 2, 200);
    pointLightCyan.position.set(-20, -30, -20);
    scene.add(pointLightCyan);

    const coreGroup = new THREE.Group();

    // 1. Central Quantum Faceted Icosahedron Reactor
    const coreGeo = new THREE.IcosahedronGeometry(18, 1);
    const coreMat = new THREE.MeshPhongMaterial({
      color: 0xffb703,
      emissive: 0xd97706,
      emissiveIntensity: 0.6,
      wireframe: false,
      shininess: 90,
      transparent: true,
      opacity: 0.88
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreGroup.add(coreMesh);

    // Inner Wireframe Energy Cage
    const cageGeo = new THREE.IcosahedronGeometry(23, 1);
    const cageMat = new THREE.MeshBasicMaterial({
      color: 0xffe066,
      wireframe: true,
      transparent: true,
      opacity: 0.7
    });
    const cageMesh = new THREE.Mesh(cageGeo, cageMat);
    coreGroup.add(cageMesh);

    // 2. Gyroscopic Tactical Gimbal Rings
    const ring1Geo = new THREE.TorusGeometry(32, 0.7, 16, 64);
    const ring1Mat = new THREE.MeshBasicMaterial({ color: 0xffd000, wireframe: true, transparent: true, opacity: 0.8 });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    coreGroup.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(38, 0.8, 16, 64);
    const ring2Mat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, wireframe: true, transparent: true, opacity: 0.7 });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = Math.PI / 3;
    coreGroup.add(ring2);

    const ring3Geo = new THREE.TorusGeometry(44, 0.9, 16, 64);
    const ring3Mat = new THREE.MeshBasicMaterial({ color: 0xffb703, wireframe: true, transparent: true, opacity: 0.5 });
    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3.rotation.y = Math.PI / 4;
    coreGroup.add(ring3);

    // 3. Orbiting Data Satellite Nodes
    const satellites = [];
    const satGeo = new THREE.OctahedronGeometry(2.5, 0);
    const satMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });

    for (let i = 0; i < 4; i++) {
      const sat = new THREE.Mesh(satGeo, satMat);
      satellites.push({
        mesh: sat,
        angle: (i * Math.PI) / 2,
        distance: 35 + i * 4,
        speed: 0.02 + i * 0.008
      });
      coreGroup.add(sat);
    }

    // 4. Particle Halo Cloud
    const haloCount = 200;
    const haloGeo = new THREE.BufferGeometry();
    const haloPos = new Float32Array(haloCount * 3);
    for (let i = 0; i < haloCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random()) * 26 + 18;
      const sinPhi = Math.sin(phi);
      haloPos[i * 3] = r * sinPhi * Math.cos(theta);
      haloPos[i * 3 + 1] = r * sinPhi * Math.sin(theta);
      haloPos[i * 3 + 2] = r * Math.cos(phi);
    }
    haloGeo.setAttribute('position', new THREE.BufferAttribute(haloPos, 3));
    const haloMat = new THREE.PointsMaterial({
      size: 2.2,
      color: 0xffd000,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    const haloParticles = new THREE.Points(haloGeo, haloMat);
    coreGroup.add(haloParticles);

    scene.add(coreGroup);

    // Drag Orbit & Interaction
    let isDragging = false;
    let prevMouseX = 0, prevMouseY = 0;
    let rotVelX = 0, rotVelY = 0;

    canvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      if (window.cyberAudio) window.cyberAudio.playHover();
    });

    window.addEventListener('mouseup', () => { isDragging = false; });

    canvas.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      rotVelY = deltaX * 0.008;
      rotVelX = deltaY * 0.008;
      coreGroup.rotation.y += rotVelY;
      coreGroup.rotation.x += rotVelX;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    });

    // Touch support for mobile
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      }
    }, { passive: true });

    canvas.addEventListener('touchmove', (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - prevMouseX;
      const deltaY = e.touches[0].clientY - prevMouseY;
      coreGroup.rotation.y += deltaX * 0.008;
      coreGroup.rotation.x += deltaY * 0.008;
      prevMouseX = e.touches[0].clientX;
      prevMouseY = e.touches[0].clientY;
    }, { passive: true });

    canvas.addEventListener('touchend', () => { isDragging = false; });

    // Mode Buttons
    const modeBtns = document.querySelectorAll('.btn-3d-mode');
    modeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.getAttribute('data-mode');

        if (window.cyberAudio) window.cyberAudio.playClick();

        if (mode === 'quantum') {
          coreMat.color.setHex(0xffb703);
          coreMat.emissive.setHex(0xd97706);
          ring1Mat.color.setHex(0xffd000);
          ring2Mat.color.setHex(0x00f0ff);
        } else if (mode === 'overdrive') {
          coreMat.color.setHex(0xff0055);
          coreMat.emissive.setHex(0x990033);
          ring1Mat.color.setHex(0xff0055);
          ring2Mat.color.setHex(0xffb703);
        } else if (mode === 'stealth') {
          coreMat.color.setHex(0x00f0ff);
          coreMat.emissive.setHex(0x0284c7);
          ring1Mat.color.setHex(0x00f0ff);
          ring2Mat.color.setHex(0x38bdf8);
        }
      });
    });

    // Resize
    window.addEventListener('resize', () => {
      const w = container.clientWidth || 400;
      const h = container.clientHeight || 400;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });

    // Animate Hero Core
    let time = 0;
    const animateHero = () => {
      requestAnimationFrame(animateHero);
      time += 0.015;

      if (!isDragging) {
        coreGroup.rotation.y += 0.008;
        coreGroup.rotation.x += 0.003;
      }

      // Gyroscopic Ring Rotations
      ring1.rotation.z += 0.012;
      ring2.rotation.y += 0.015;
      ring3.rotation.x -= 0.01;

      // Pulse Core Scale
      const pulse = 1 + Math.sin(time * 3) * 0.06;
      coreMesh.scale.set(pulse, pulse, pulse);
      cageMesh.rotation.y -= 0.006;

      // Orbit Satellites
      satellites.forEach((sat, idx) => {
        sat.angle += sat.speed;
        sat.mesh.position.x = Math.cos(sat.angle) * sat.distance;
        sat.mesh.position.z = Math.sin(sat.angle) * sat.distance;
        sat.mesh.position.y = Math.sin(time * 2 + idx) * 10;
        sat.mesh.rotation.x += 0.04;
        sat.mesh.rotation.y += 0.04;
      });

      renderer.render(scene, camera);
    };

    animateHero();
    this.heroScene = { scene, camera, renderer, coreGroup };
  }

  /* ==========================================================================
     3. MECHA HANGAR 3D INTERACTIVE VIEWER
     ========================================================================== */
  initMechaHangar3D() {
    const container = document.querySelector('.mecha-stage-box');
    const canvas = document.getElementById('mecha-3d-canvas');
    if (!container || !canvas) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 480;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 20, 85);

    // Studio Lights
    const ambientLight = new THREE.AmbientLight(0x222233, 1.5);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffd000, 2.0);
    keyLight.position.set(50, 80, 50);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x00f0ff, 1.8);
    fillLight.position.set(-50, 40, -40);
    scene.add(fillLight);

    const bottomLight = new THREE.PointLight(0xffb703, 2, 100);
    bottomLight.position.set(0, -25, 0);
    scene.add(bottomLight);

    // Mecha Stage Platform
    const platformGroup = new THREE.Group();
    const diskGeo = new THREE.CylinderGeometry(28, 30, 2, 32);
    const diskMat = new THREE.MeshStandardMaterial({
      color: 0x0e111a,
      metalness: 0.8,
      roughness: 0.3
    });
    const diskMesh = new THREE.Mesh(diskGeo, diskMat);
    diskMesh.position.y = -22;
    platformGroup.add(diskMesh);

    const ringGeo = new THREE.TorusGeometry(29, 0.6, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.y = -21;
    ringMesh.rotation.x = Math.PI / 2;
    platformGroup.add(ringMesh);

    scene.add(platformGroup);

    // Dynamic Mecha Models Builder
    const mechaHolder = new THREE.Group();
    scene.add(mechaHolder);

    let currentMechaGroup = null;
    let currentShadingMode = 'holo'; // holo, wireframe, gold, explode
    let autoRotate = true;
    let mechaParts = [];

    // Helper: Build Mecha 01 (RX-09 RONIN)
    const buildRoninMecha = () => {
      const g = new THREE.Group();
      mechaParts = [];

      // Materials
      const armorMat = new THREE.MeshStandardMaterial({
        color: 0x181a24,
        metalness: 0.85,
        roughness: 0.25,
        emissive: 0x11131c
      });

      const goldMat = new THREE.MeshStandardMaterial({
        color: 0xffb703,
        metalness: 0.95,
        roughness: 0.15,
        emissive: 0x664400
      });

      const cyanGlowMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });

      // Torso
      const torsoGeo = new THREE.BoxGeometry(12, 14, 9);
      const torso = new THREE.Mesh(torsoGeo, armorMat);
      torso.position.y = 2;
      g.add(torso);
      mechaParts.push({ mesh: torso, origY: 2, explodeVec: new THREE.Vector3(0, 0, 0) });

      // Chest Reactor Core
      const reactorGeo = new THREE.CylinderGeometry(2.5, 2.5, 3, 16);
      const reactor = new THREE.Mesh(reactorGeo, cyanGlowMat);
      reactor.rotation.x = Math.PI / 2;
      reactor.position.set(0, 4, 4.5);
      g.add(reactor);
      mechaParts.push({ mesh: reactor, origY: 4, explodeVec: new THREE.Vector3(0, 2, 4) });

      // Head / Helmet with Oni Visor
      const headGeo = new THREE.BoxGeometry(6, 6, 6);
      const head = new THREE.Mesh(headGeo, goldMat);
      head.position.y = 12;
      const visorGeo = new THREE.BoxGeometry(4.8, 1.2, 1);
      const visor = new THREE.Mesh(visorGeo, cyanGlowMat);
      visor.position.set(0, 12, 3.1);
      g.add(head);
      g.add(visor);
      mechaParts.push({ mesh: head, origY: 12, explodeVec: new THREE.Vector3(0, 8, 0) });
      mechaParts.push({ mesh: visor, origY: 12, explodeVec: new THREE.Vector3(0, 8, 2) });

      // Shoulders
      [-8.5, 8.5].forEach((x, i) => {
        const shGeo = new THREE.BoxGeometry(5.5, 5.5, 6.5);
        const sh = new THREE.Mesh(shGeo, goldMat);
        sh.position.set(x, 7, 0);
        g.add(sh);
        mechaParts.push({ mesh: sh, origY: 7, explodeVec: new THREE.Vector3(x > 0 ? 8 : -8, 4, 0) });

        // Arms
        const armGeo = new THREE.BoxGeometry(3.5, 12, 4);
        const arm = new THREE.Mesh(armGeo, armorMat);
        arm.position.set(x > 0 ? 10 : -10, -1, 0);
        g.add(arm);
        mechaParts.push({ mesh: arm, origY: -1, explodeVec: new THREE.Vector3(x > 0 ? 12 : -12, 0, 0) });
      });

      // Dual Plasma Blades on Back
      [-3.5, 3.5].forEach(x => {
        const bladeGeo = new THREE.BoxGeometry(1.2, 22, 0.4);
        const blade = new THREE.Mesh(bladeGeo, cyanGlowMat);
        blade.position.set(x, 10, -5.5);
        blade.rotation.z = x > 0 ? -0.15 : 0.15;
        g.add(blade);
        mechaParts.push({ mesh: blade, origY: 10, explodeVec: new THREE.Vector3(x > 0 ? 5 : -5, 6, -8) });
      });

      // Legs & Thrusters
      [-4.5, 4.5].forEach(x => {
        const legGeo = new THREE.BoxGeometry(4.5, 16, 5.5);
        const leg = new THREE.Mesh(legGeo, armorMat);
        leg.position.set(x, -12, 0);
        g.add(leg);
        mechaParts.push({ mesh: leg, origY: -12, explodeVec: new THREE.Vector3(x > 0 ? 6 : -6, -6, 0) });

        // Foot
        const footGeo = new THREE.BoxGeometry(5, 3, 9);
        const foot = new THREE.Mesh(footGeo, goldMat);
        foot.position.set(x, -20.5, 1.5);
        g.add(foot);
        mechaParts.push({ mesh: foot, origY: -20.5, explodeVec: new THREE.Vector3(x > 0 ? 6 : -6, -10, 3) });
      });

      return g;
    };

    // Helper: Build Mecha 02 (TYPE-88 GOLIATH)
    const buildGoliathMecha = () => {
      const g = new THREE.Group();
      mechaParts = [];

      const armorMat = new THREE.MeshStandardMaterial({ color: 0x1c1e29, metalness: 0.9, roughness: 0.3 });
      const heavyGoldMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.95, roughness: 0.1 });
      const redGlow = new THREE.MeshBasicMaterial({ color: 0xff0055 });

      // Massive Heavy Torso
      const torsoGeo = new THREE.BoxGeometry(18, 16, 14);
      const torso = new THREE.Mesh(torsoGeo, armorMat);
      torso.position.y = 2;
      g.add(torso);
      mechaParts.push({ mesh: torso, origY: 2, explodeVec: new THREE.Vector3(0, 0, 0) });

      // Reinforced Chest Shield
      const shieldGeo = new THREE.BoxGeometry(14, 10, 3);
      const shield = new THREE.Mesh(shieldGeo, heavyGoldMat);
      shield.position.set(0, 3, 7.5);
      g.add(shield);
      mechaParts.push({ mesh: shield, origY: 3, explodeVec: new THREE.Vector3(0, 2, 7) });

      // Compact Heavy Head
      const headGeo = new THREE.BoxGeometry(7, 5, 7);
      const head = new THREE.Mesh(headGeo, armorMat);
      head.position.y = 12;
      const eyeGeo = new THREE.BoxGeometry(5, 0.8, 1);
      const eye = new THREE.Mesh(eyeGeo, redGlow);
      eye.position.set(0, 12, 3.6);
      g.add(head);
      g.add(eye);
      mechaParts.push({ mesh: head, origY: 12, explodeVec: new THREE.Vector3(0, 8, 0) });
      mechaParts.push({ mesh: eye, origY: 12, explodeVec: new THREE.Vector3(0, 8, 2) });

      // Dual Shoulder Heavy Rail Cannons
      [-10, 10].forEach(x => {
        const cannonGeo = new THREE.CylinderGeometry(2, 2.5, 26, 16);
        const cannon = new THREE.Mesh(cannonGeo, heavyGoldMat);
        cannon.rotation.x = Math.PI / 2;
        cannon.position.set(x, 12, 4);
        g.add(cannon);
        mechaParts.push({ mesh: cannon, origY: 12, explodeVec: new THREE.Vector3(x > 0 ? 8 : -8, 6, 8) });
      });

      // Massive Heavy Legs
      [-6.5, 6.5].forEach(x => {
        const legGeo = new THREE.BoxGeometry(7, 15, 8);
        const leg = new THREE.Mesh(legGeo, armorMat);
        leg.position.set(x, -11, 0);
        g.add(leg);
        mechaParts.push({ mesh: leg, origY: -11, explodeVec: new THREE.Vector3(x > 0 ? 8 : -8, -6, 0) });

        const footGeo = new THREE.BoxGeometry(8.5, 4, 12);
        const foot = new THREE.Mesh(footGeo, heavyGoldMat);
        foot.position.set(x, -20, 1.5);
        g.add(foot);
        mechaParts.push({ mesh: foot, origY: -20, explodeVec: new THREE.Vector3(x > 0 ? 8 : -8, -9, 4) });
      });

      return g;
    };

    // Helper: Build Mecha 03 (VX-03 VALKYRIE)
    const buildValkyrieMecha = () => {
      const g = new THREE.Group();
      mechaParts = [];

      const whiteMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.7, roughness: 0.2 });
      const goldMat = new THREE.MeshStandardMaterial({ color: 0xffd000, metalness: 0.9, roughness: 0.1 });
      const cyanGlow = new THREE.MeshBasicMaterial({ color: 0x00f0ff });

      // Sleek Torso
      const torsoGeo = new THREE.ConeGeometry(7, 16, 5);
      const torso = new THREE.Mesh(torsoGeo, whiteMat);
      torso.position.y = 4;
      g.add(torso);
      mechaParts.push({ mesh: torso, origY: 4, explodeVec: new THREE.Vector3(0, 0, 0) });

      // Sweeping Cyber Wings
      [-1, 1].forEach(side => {
        const wingGeo = new THREE.BoxGeometry(22, 1.2, 8);
        const wing = new THREE.Mesh(wingGeo, cyanGlow);
        wing.position.set(side * 14, 10, -5);
        wing.rotation.z = side * 0.35;
        wing.rotation.y = side * 0.2;
        g.add(wing);
        mechaParts.push({ mesh: wing, origY: 10, explodeVec: new THREE.Vector3(side * 16, 8, -12) });
      });

      // Sleek Legs
      [-4, 4].forEach(x => {
        const legGeo = new THREE.CylinderGeometry(2, 1.5, 17, 8);
        const leg = new THREE.Mesh(legGeo, goldMat);
        leg.position.set(x, -11, 0);
        g.add(leg);
        mechaParts.push({ mesh: leg, origY: -11, explodeVec: new THREE.Vector3(x > 0 ? 6 : -6, -6, 0) });

        const footGeo = new THREE.ConeGeometry(2.5, 6, 4);
        const foot = new THREE.Mesh(footGeo, whiteMat);
        foot.position.set(x, -20, 1);
        foot.rotation.x = Math.PI / 2;
        g.add(foot);
        mechaParts.push({ mesh: foot, origY: -20, explodeVec: new THREE.Vector3(x > 0 ? 6 : -6, -9, 3) });
      });

      return g;
    };

    // Load Initial Mecha
    const loadMecha = (type) => {
      while (mechaHolder.children.length > 0) {
        mechaHolder.remove(mechaHolder.children[0]);
      }

      if (type === 'ronin') currentMechaGroup = buildRoninMecha();
      else if (type === 'goliath') currentMechaGroup = buildGoliathMecha();
      else if (type === 'valkyrie') currentMechaGroup = buildValkyrieMecha();

      mechaHolder.add(currentMechaGroup);
      applyShadingMode(currentShadingMode);
    };

    const applyShadingMode = (mode) => {
      currentShadingMode = mode;
      if (!currentMechaGroup) return;

      currentMechaGroup.traverse((child) => {
        if (child.isMesh) {
          if (mode === 'wireframe') {
            child.material.wireframe = true;
          } else {
            child.material.wireframe = false;
          }
        }
      });
    };

    loadMecha('ronin');

    // Switch Mechas via Tab Nav
    const tabs = document.querySelectorAll('.mecha-tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const frame = tab.getAttribute('data-frame');
        loadMecha(frame);
      });
    });

    // 3D Toolbar Buttons
    const toolBtns = document.querySelectorAll('.btn-mecha-3d-tool');
    toolBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-tool');
        if (window.cyberAudio) window.cyberAudio.playClick();

        if (action === 'wireframe') {
          btn.classList.toggle('active');
          const isWire = btn.classList.contains('active');
          applyShadingMode(isWire ? 'wireframe' : 'solid');
        } else if (action === 'autorotate') {
          autoRotate = !autoRotate;
          btn.classList.toggle('active', autoRotate);
        } else if (action === 'explode') {
          btn.classList.toggle('active');
          const isExploded = btn.classList.contains('active');
          mechaParts.forEach(p => {
            if (isExploded) {
              p.mesh.position.x = p.explodeVec.x;
              p.mesh.position.y = p.origY + p.explodeVec.y;
              p.mesh.position.z = p.explodeVec.z;
            } else {
              p.mesh.position.set(0, p.origY, 0);
            }
          });
        } else if (action === 'reset') {
          camera.position.set(0, 20, 85);
          mechaHolder.rotation.set(0, 0, 0);
        }
      });
    });

    // Orbit Dragging
    let isDragging = false;
    let prevX = 0, prevY = 0;

    canvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
    });

    window.addEventListener('mouseup', () => { isDragging = false; });

    canvas.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      mechaHolder.rotation.y += dx * 0.01;
      camera.position.y += dy * 0.2;
      camera.lookAt(0, 0, 0);
      prevX = e.clientX;
      prevY = e.clientY;
    });

    // Mouse Wheel Zoom
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      camera.position.z += e.deltaY * 0.05;
      camera.position.z = Math.max(40, Math.min(150, camera.position.z));
    }, { passive: false });

    // Touch Controls
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevX = e.touches[0].clientX;
        prevY = e.touches[0].clientY;
      }
    }, { passive: true });

    canvas.addEventListener('touchmove', (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - prevX;
      const dy = e.touches[0].clientY - prevY;
      mechaHolder.rotation.y += dx * 0.01;
      prevX = e.touches[0].clientX;
      prevY = e.touches[0].clientY;
    }, { passive: true });

    canvas.addEventListener('touchend', () => { isDragging = false; });

    // Resize
    window.addEventListener('resize', () => {
      const w = container.clientWidth || 600;
      const h = container.clientHeight || 480;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });

    // Animation Loop
    const animateMecha = () => {
      requestAnimationFrame(animateMecha);

      if (autoRotate && !isDragging) {
        mechaHolder.rotation.y += 0.008;
      }

      platformGroup.rotation.y -= 0.004;

      renderer.render(scene, camera);
    };

    animateMecha();
    this.mechaScene = { scene, camera, renderer, mechaHolder };
  }

  /* ==========================================================================
     4. 3D WEAPON ARSENAL INSPECT MODAL
     ========================================================================== */
  initWeapons3D() {
    const modal = document.getElementById('weapon-3d-modal');
    const canvas = document.getElementById('weapon-3d-canvas');
    const closeBtn = document.getElementById('modal-3d-close-btn');
    if (!modal || !canvas) return;

    const width = 800;
    const height = 500;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 70);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffd000, 2);
    dirLight.position.set(20, 40, 30);
    scene.add(dirLight);

    const weaponGroup = new THREE.Group();
    scene.add(weaponGroup);

    // Build Katana 3D
    const buildKatana = () => {
      const g = new THREE.Group();
      // Blade
      const bladeGeo = new THREE.BoxGeometry(1.2, 45, 0.3);
      const bladeMat = new THREE.MeshStandardMaterial({
        color: 0x00f0ff,
        emissive: 0x00f0ff,
        emissiveIntensity: 0.8,
        metalness: 0.9,
        roughness: 0.1
      });
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.position.y = 12;
      g.add(blade);

      // Guard (Tsuba)
      const guardGeo = new THREE.CylinderGeometry(4, 4, 0.8, 8);
      const guardMat = new THREE.MeshStandardMaterial({ color: 0xffb703, metalness: 0.9 });
      const guard = new THREE.Mesh(guardGeo, guardMat);
      guard.position.y = -10.5;
      g.add(guard);

      // Hilt (Tsuka)
      const hiltGeo = new THREE.CylinderGeometry(1.5, 1.5, 14, 16);
      const hiltMat = new THREE.MeshStandardMaterial({ color: 0x11131c, roughness: 0.8 });
      const hilt = new THREE.Mesh(hiltGeo, hiltMat);
      hilt.position.y = -18;
      g.add(hilt);

      return g;
    };

    // Build Railgun 3D
    const buildRailgun = () => {
      const g = new THREE.Group();
      // Barrel
      const barrelGeo = new THREE.BoxGeometry(40, 3, 3);
      const barrelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9 });
      const barrel = new THREE.Mesh(barrelGeo, barrelMat);
      g.add(barrel);

      // Accelerator Coils
      for (let i = -14; i <= 14; i += 7) {
        const coilGeo = new THREE.TorusGeometry(3.2, 0.6, 8, 24);
        const coilMat = new THREE.MeshBasicMaterial({ color: 0xffd000 });
        const coil = new THREE.Mesh(coilGeo, coilMat);
        coil.rotation.y = Math.PI / 2;
        coil.position.x = i;
        g.add(coil);
      }

      // Stock & Grip
      const stockGeo = new THREE.BoxGeometry(10, 8, 4);
      const stock = new THREE.Mesh(stockGeo, barrelMat);
      stock.position.set(-18, -4, 0);
      g.add(stock);

      return g;
    };

    // Build SMG 3D
    const buildSMG = () => {
      const g = new THREE.Group();
      const bodyGeo = new THREE.BoxGeometry(22, 9, 5);
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.85 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      g.add(body);

      const barrelGeo = new THREE.CylinderGeometry(1.2, 1.2, 8, 16);
      const barrelMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
      const barrel = new THREE.Mesh(barrelGeo, barrelMat);
      barrel.rotation.z = Math.PI / 2;
      barrel.position.set(14, 1, 0);
      g.add(barrel);

      const magGeo = new THREE.BoxGeometry(4, 12, 3);
      const magMat = new THREE.MeshStandardMaterial({ color: 0xffb703 });
      const mag = new THREE.Mesh(magGeo, magMat);
      mag.position.set(2, -8, 0);
      g.add(mag);

      return g;
    };

    const loadWeapon = (type) => {
      while (weaponGroup.children.length > 0) {
        weaponGroup.remove(weaponGroup.children[0]);
      }

      if (type === 'katana') weaponGroup.add(buildKatana());
      else if (type === 'railgun') weaponGroup.add(buildRailgun());
      else if (type === 'smg') weaponGroup.add(buildSMG());
    };

    // Open Modal from Weapons
    const inspectBtns = document.querySelectorAll('.btn-test-fire, .btn-inspect-3d');
    const modalTitle = document.getElementById('modal-3d-weapon-title');

    inspectBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const weaponType = btn.getAttribute('data-weapon') || 'katana';
        loadWeapon(weaponType);
        if (modalTitle) {
          modalTitle.textContent = `3D TACTICAL INSPECTION: ${weaponType.toUpperCase()}`;
        }
        modal.classList.add('open');
        if (window.cyberAudio) window.cyberAudio.playClick();
      });
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('open');
        if (window.cyberAudio) window.cyberAudio.playClick();
      });
    }

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('open');
      }
    });

    // Orbit Drag in Modal
    let isDragging = false;
    let prevX = 0, prevY = 0;

    canvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
    });

    window.addEventListener('mouseup', () => { isDragging = false; });

    canvas.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      weaponGroup.rotation.y += dx * 0.01;
      weaponGroup.rotation.x += dy * 0.01;
      prevX = e.clientX;
      prevY = e.clientY;
    });

    // Animation Loop
    const animateWeapon = () => {
      requestAnimationFrame(animateWeapon);

      if (!isDragging) {
        weaponGroup.rotation.y += 0.01;
      }

      renderer.render(scene, camera);
    };

    animateWeapon();
  }
}

// Instantiate on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.cyber3D = new Cyber3DSystem();
});
