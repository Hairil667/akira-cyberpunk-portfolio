/**
 * SAMURAI 3D ENGINE // 侍 3D WebGL
 * Built with Three.js
 * 3D Sakura Storm, 3D Samurai Kabuto & Oni Mask, 3D Katana Forge & Blade Slash FX
 */

class Samurai3DSystem {
  constructor() {
    this.bgScene = null;
    this.heroScene = null;
    this.katanaScene = null;
    this.init();
  }

  init() {
    if (typeof THREE === 'undefined') {
      console.error('Three.js is required for Samurai 3D');
      return;
    }

    this.initSakuraStorm3D();
    this.initHeroKabuto3D();
    this.initKatanaForge3D();
    this.initMouseSlashTrail();
    this.bindParallax();
  }

  /* ==========================================================================
     1. 3D SAKURA STORM & JAPANESE LANTERNS BACKGROUND
     ========================================================================== */
  initSakuraStorm3D() {
    const canvas = document.getElementById('samurai-3d-bg');
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.z = 500;

    // Ambient Moonlight & Lantern Warmth
    const ambientLight = new THREE.AmbientLight(0x221122, 1.2);
    scene.add(ambientLight);

    const moonLight = new THREE.DirectionalLight(0xffb7c5, 1.5);
    moonLight.position.set(100, 300, 200);
    scene.add(moonLight);

    // A. 3D Sakura Petal Geometry
    const petalCount = 280;
    const petals = [];

    // Create a curved organic petal shape
    const petalShape = new THREE.Shape();
    petalShape.moveTo(0, 0);
    petalShape.quadraticCurveTo(3, 6, 0, 10);
    petalShape.quadraticCurveTo(-3, 6, 0, 0);

    const petalGeo = new THREE.ShapeGeometry(petalShape);
    const petalMat = new THREE.MeshStandardMaterial({
      color: 0xffb7c5,
      emissive: 0x992244,
      emissiveIntensity: 0.3,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      roughness: 0.4
    });

    const sakuraGroup = new THREE.Group();
    for (let i = 0; i < petalCount; i++) {
      const mesh = new THREE.Mesh(petalGeo, petalMat);
      mesh.position.set(
        (Math.random() - 0.5) * 1200,
        Math.random() * 800 - 400,
        (Math.random() - 0.5) * 800
      );

      const scale = Math.random() * 1.2 + 0.6;
      mesh.scale.set(scale, scale, scale);

      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      petals.push({
        mesh,
        speedY: Math.random() * 0.8 + 0.4,
        speedX: Math.random() * 0.6 - 0.2,
        rotSpeedX: (Math.random() - 0.5) * 0.03,
        rotSpeedY: (Math.random() - 0.5) * 0.03,
        wobbleSpeed: Math.random() * 0.02 + 0.01,
        wobbleAmp: Math.random() * 1.5 + 0.5,
        wobbleOffset: Math.random() * Math.PI * 2
      });

      sakuraGroup.add(mesh);
    }
    scene.add(sakuraGroup);

    // B. Floating Glowing Lanterns
    const lanterns = [];
    const lanternGeo = new THREE.CylinderGeometry(4, 5, 10, 8);
    const lanternMat = new THREE.MeshStandardMaterial({
      color: 0xe63946,
      emissive: 0xff4d4d,
      emissiveIntensity: 0.9,
      roughness: 0.2
    });

    for (let i = 0; i < 16; i++) {
      const mesh = new THREE.Mesh(lanternGeo, lanternMat);
      mesh.position.set(
        (Math.random() - 0.5) * 1000,
        Math.random() * 600 - 300,
        (Math.random() - 0.5) * 600 - 100
      );
      lanterns.push({
        mesh,
        baseY: mesh.position.y,
        floatSpeed: Math.random() * 0.015 + 0.005,
        offset: Math.random() * Math.PI * 2
      });
      scene.add(mesh);
    }

    // C. 3D Torii Gate Silhouette in Background
    const toriiGroup = new THREE.Group();
    const toriiMat = new THREE.MeshBasicMaterial({ color: 0x180b12, transparent: true, opacity: 0.6 });

    // Pillars
    [-70, 70].forEach(x => {
      const colGeo = new THREE.CylinderGeometry(4, 5, 180, 12);
      const col = new THREE.Mesh(colGeo, toriiMat);
      col.position.set(x, 0, 0);
      toriiGroup.add(col);
    });

    // Beams
    const beam1Geo = new THREE.BoxGeometry(200, 10, 8);
    const beam1 = new THREE.Mesh(beam1Geo, toriiMat);
    beam1.position.set(0, 85, 0);
    toriiGroup.add(beam1);

    const beam2Geo = new THREE.BoxGeometry(160, 6, 6);
    const beam2 = new THREE.Mesh(beam2Geo, toriiMat);
    beam2.position.set(0, 60, 0);
    toriiGroup.add(beam2);

    toriiGroup.position.set(0, -60, -350);
    toriiGroup.scale.set(1.5, 1.5, 1.5);
    scene.add(toriiGroup);

    // Resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Mouse Tracking for Wind Parallax
    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;
    window.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX - window.innerWidth / 2) * 0.15;
      mouseY = (e.clientY - window.innerHeight / 2) * 0.15;
    });

    // Background Animation Loop
    let time = 0;
    const animateBg = () => {
      requestAnimationFrame(animateBg);
      time += 0.015;

      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      // Animate Sakura Petals
      petals.forEach(p => {
        p.mesh.position.y -= p.speedY;
        p.mesh.position.x += Math.sin(time * p.wobbleSpeed + p.wobbleOffset) * p.wobbleAmp + p.speedX;
        p.mesh.rotation.x += p.rotSpeedX;
        p.mesh.rotation.y += p.rotSpeedY;

        if (p.mesh.position.y < -450) {
          p.mesh.position.y = 450;
          p.mesh.position.x = (Math.random() - 0.5) * 1200;
        }
      });

      // Animate Lanterns
      lanterns.forEach(l => {
        l.mesh.position.y = l.baseY + Math.sin(time + l.offset) * 12;
        l.mesh.rotation.y += 0.005;
      });

      camera.position.x = targetX * 0.3;
      camera.position.y = -targetY * 0.3;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animateBg();
    this.bgScene = { scene, camera, renderer, toriiGroup };
  }

  bindParallax() {
    window.addEventListener('scroll', () => {
      if (this.bgScene) {
        const scrollPct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight || 1);
        this.bgScene.camera.position.z = 500 - scrollPct * 150;
        this.bgScene.toriiGroup.position.y = -60 + scrollPct * 80;
      }
    });
  }

  /* ==========================================================================
     2. HERO SAMURAI 3D STAGE (KABUTO HELMET & ONI MEMPO MASK)
     ========================================================================== */
  initHeroKabuto3D() {
    const container = document.getElementById('samurai-hero-stage');
    const canvas = document.getElementById('samurai-hero-canvas');
    if (!container || !canvas) return;

    const width = container.clientWidth || 450;
    const height = container.clientHeight || 450;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 95);

    // Cinematic Lighting
    const ambient = new THREE.AmbientLight(0x331122, 1.4);
    scene.add(ambient);

    const redLight = new THREE.PointLight(0xe63946, 2.5, 150);
    redLight.position.set(30, 40, 40);
    scene.add(redLight);

    const goldLight = new THREE.PointLight(0xd4af37, 2.5, 150);
    goldLight.position.set(-30, -20, 35);
    scene.add(goldLight);

    const rimLight = new THREE.DirectionalLight(0xffb7c5, 1.8);
    rimLight.position.set(0, 50, -50);
    scene.add(rimLight);

    const kabutoGroup = new THREE.Group();

    // Materials
    const blackLacquerMat = new THREE.MeshStandardMaterial({
      color: 0x0c0d14,
      metalness: 0.85,
      roughness: 0.2,
      emissive: 0x08080f
    });

    const goldSamuraiMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.95,
      roughness: 0.15,
      emissive: 0x553300
    });

    const crimsonArmorMat = new THREE.MeshStandardMaterial({
      color: 0x991b1b,
      metalness: 0.7,
      roughness: 0.3,
      emissive: 0x330005
    });

    const glowingEyeMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });

    // 1. Helmet Dome (Hachi)
    const domeGeo = new THREE.SphereGeometry(18, 32, 24, 0, Math.PI * 2, 0, Math.PI / 1.7);
    const domeMesh = new THREE.Mesh(domeGeo, blackLacquerMat);
    domeMesh.position.y = 8;
    kabutoGroup.add(domeMesh);

    // Top Tehen Ring
    const tehenGeo = new THREE.TorusGeometry(3.5, 0.8, 16, 32);
    const tehenMesh = new THREE.Mesh(tehenGeo, goldSamuraiMat);
    tehenMesh.position.y = 26;
    tehenMesh.rotation.x = Math.PI / 2;
    kabutoGroup.add(tehenMesh);

    // 2. Golden Crescent Moon Horn (Maedate)
    const hornCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-22, 18, 16),
      new THREE.Vector3(0, 36, 18),
      new THREE.Vector3(22, 18, 16)
    );
    const hornGeo = new THREE.TubeGeometry(hornCurve, 32, 1.8, 12, false);
    const hornMesh = new THREE.Mesh(hornGeo, goldSamuraiMat);
    kabutoGroup.add(hornMesh);

    // Central Sun Crest
    const crestGeo = new THREE.CylinderGeometry(4.5, 4.5, 1, 32);
    const crestMesh = new THREE.Mesh(crestGeo, goldSamuraiMat);
    crestMesh.position.set(0, 24, 17.5);
    crestMesh.rotation.x = Math.PI / 2;
    kabutoGroup.add(crestMesh);

    // 3. Shikoro Neck Guard
    [-2, -7, -12].forEach((y, idx) => {
      const plateGeo = new THREE.CylinderGeometry(20 + idx * 2.5, 22 + idx * 2.5, 3.5, 32, 1, true, Math.PI * 0.7, Math.PI * 1.6);
      const plateMesh = new THREE.Mesh(plateGeo, idx % 2 === 0 ? crimsonArmorMat : blackLacquerMat);
      plateMesh.position.y = y + 8;
      plateMesh.rotation.y = -Math.PI / 2;
      kabutoGroup.add(plateMesh);
    });

    // 4. Oni Mempo War Mask
    const maskGeo = new THREE.BoxGeometry(16, 13, 10);
    const maskMesh = new THREE.Mesh(maskGeo, crimsonArmorMat);
    maskMesh.position.set(0, -2, 7);
    kabutoGroup.add(maskMesh);

    // Glowing Eyes
    [-4.5, 4.5].forEach(x => {
      const eyeGeo = new THREE.BoxGeometry(3, 1, 1);
      const eyeMesh = new THREE.Mesh(eyeGeo, glowingEyeMat);
      eyeMesh.position.set(x, 2, 12.2);
      eyeMesh.rotation.z = x > 0 ? -0.2 : 0.2;
      kabutoGroup.add(eyeMesh);
    });

    // Oni Fangs
    [-2.5, 2.5].forEach(x => {
      const fangGeo = new THREE.ConeGeometry(0.9, 3.5, 8);
      const fangMesh = new THREE.Mesh(fangGeo, goldSamuraiMat);
      fangMesh.position.set(x, -6.5, 12.5);
      fangMesh.rotation.x = Math.PI;
      kabutoGroup.add(fangMesh);
    });

    // 5. Dual Crossed Katanas
    [-1, 1].forEach(side => {
      const bladeGeo = new THREE.BoxGeometry(1.4, 75, 0.4);
      const bladeMesh = new THREE.Mesh(bladeGeo, new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        metalness: 0.95,
        roughness: 0.1
      }));
      bladeMesh.position.set(side * 2, 4, -8);
      bladeMesh.rotation.z = side * 0.65;
      kabutoGroup.add(bladeMesh);

      const tsubaGeo = new THREE.CylinderGeometry(3.5, 3.5, 0.8, 16);
      const tsubaMesh = new THREE.Mesh(tsubaGeo, goldSamuraiMat);
      tsubaMesh.position.set(side * 18, -20, -8);
      tsubaMesh.rotation.z = side * 0.65;
      kabutoGroup.add(tsubaMesh);
    });

    // 6. Floating Sakura Aura
    const auraCount = 60;
    const auraGeo = new THREE.BufferGeometry();
    const auraPos = new Float32Array(auraCount * 3);
    for (let i = 0; i < auraCount; i++) {
      const rad = Math.random() * 25 + 20;
      const ang = Math.random() * Math.PI * 2;
      auraPos[i * 3] = Math.cos(ang) * rad;
      auraPos[i * 3 + 1] = (Math.random() - 0.5) * 45;
      auraPos[i * 3 + 2] = Math.sin(ang) * rad;
    }
    auraGeo.setAttribute('position', new THREE.BufferAttribute(auraPos, 3));
    const auraMat = new THREE.PointsMaterial({
      size: 3.5,
      color: 0xffb7c5,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    const auraPoints = new THREE.Points(auraGeo, auraMat);
    kabutoGroup.add(auraPoints);

    scene.add(kabutoGroup);

    // Stance Mode Buttons
    const stanceBtns = document.querySelectorAll('.btn-stance');
    stanceBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        stanceBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const stance = btn.getAttribute('data-stance');

        if (window.samuraiAudio) window.samuraiAudio.playClick();

        if (stance === 'iaijutsu') {
          glowingEyeMat.color.setHex(0x00f0ff);
          redLight.color.setHex(0x00f0ff);
          goldLight.color.setHex(0xd4af37);
        } else if (stance === 'bloodoath') {
          glowingEyeMat.color.setHex(0xff0033);
          redLight.color.setHex(0xff0033);
          goldLight.color.setHex(0xff5500);
        } else if (stance === 'goldendawn') {
          glowingEyeMat.color.setHex(0xffd000);
          redLight.color.setHex(0xffd000);
          goldLight.color.setHex(0xffffff);
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
      if (window.samuraiAudio) window.samuraiAudio.playHover();
    });

    window.addEventListener('mouseup', () => { isDragging = false; });

    canvas.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      kabutoGroup.rotation.y += dx * 0.009;
      kabutoGroup.rotation.x += dy * 0.009;
      prevX = e.clientX;
      prevY = e.clientY;
    });

    // Touch Support
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
      kabutoGroup.rotation.y += dx * 0.009;
      kabutoGroup.rotation.x += dy * 0.009;
      prevX = e.touches[0].clientX;
      prevY = e.touches[0].clientY;
    }, { passive: true });

    canvas.addEventListener('touchend', () => { isDragging = false; });

    // Resize
    window.addEventListener('resize', () => {
      const w = container.clientWidth || 450;
      const h = container.clientHeight || 450;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });

    // Animation Loop
    let time = 0;
    const animateKabuto = () => {
      requestAnimationFrame(animateKabuto);
      time += 0.012;

      if (!isDragging) {
        kabutoGroup.rotation.y += 0.006;
        kabutoGroup.position.y = Math.sin(time) * 2;
      }

      auraPoints.rotation.y += 0.015;

      renderer.render(scene, camera);
    };

    animateKabuto();
    this.heroScene = { scene, camera, renderer, kabutoGroup };
  }

  /* ==========================================================================
     3. 3D KATANA FORGE (THE DOJO)
     ========================================================================== */
  initKatanaForge3D() {
    const container = document.querySelector('.katana-forge-box');
    const canvas = document.getElementById('katana-3d-canvas');
    if (!container || !canvas) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 480;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 10, 85);

    // Forge Lighting
    const ambient = new THREE.AmbientLight(0x221111, 1.4);
    scene.add(ambient);

    const forgeGlow = new THREE.PointLight(0xe63946, 3, 120);
    forgeGlow.position.set(0, -15, 20);
    scene.add(forgeGlow);

    const bladeKeyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    bladeKeyLight.position.set(40, 60, 50);
    scene.add(bladeKeyLight);

    const swordHolder = new THREE.Group();
    scene.add(swordHolder);

    let autoRotate = true;
    let isWireframe = false;

    // Blade Data for UI update
    const bladeData = {
      murasama: {
        title: "妖刀村正 // MURASAMA HF-09 [DEMON BLADE]",
        desc: "Forged in folded crimson tamahagane steel and tempered in high-frequency plasma. It oscillates at 4.8 THz, slicing through reinforced cyber armor like mist.",
        sharpness: "99%",
        hardness: "94%",
        enchant: "96%",
        speed: "98%"
      },
      raikiri: {
        title: "雷切 // RAIKIRI TITANIUM [LIGHTNING BLADE]",
        desc: "Tempered during high-voltage thunderstorms. Emits crackling 200,000-volt ionic arcs that electro-cut all digital defenses on contact.",
        sharpness: "96%",
        hardness: "98%",
        enchant: "99%",
        speed: "95%"
      },
      kusanagi: {
        title: "草薙剣 // KUSANAGI SACRED GOLD [DIVINE BLADE]",
        desc: "Ancient imperial golden heirloom resonating with pure Shinto spiritual energy. Cleanses corrupted algorithms and radiates divine brilliance.",
        sharpness: "95%",
        hardness: "92%",
        enchant: "100%",
        speed: "100%"
      }
    };

    // Build Katana 1: Murasama
    const buildMurasama = () => {
      const g = new THREE.Group();

      const bladeGeo = new THREE.BoxGeometry(1.6, 52, 0.35);
      const bladeMat = new THREE.MeshStandardMaterial({
        color: 0x111118,
        emissive: 0x990022,
        emissiveIntensity: 0.7,
        metalness: 0.95,
        roughness: 0.15
      });
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.position.y = 12;
      g.add(blade);

      const habakiGeo = new THREE.BoxGeometry(2.4, 3.5, 0.8);
      const habakiMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.95 });
      const habaki = new THREE.Mesh(habakiGeo, habakiMat);
      habaki.position.y = -14;
      g.add(habaki);

      const tsubaGeo = new THREE.CylinderGeometry(4.5, 4.5, 0.9, 8);
      const tsuba = new THREE.Mesh(tsubaGeo, habakiMat);
      tsuba.position.y = -16;
      g.add(tsuba);

      const tsukaGeo = new THREE.CylinderGeometry(1.6, 1.6, 18, 16);
      const tsukaMat = new THREE.MeshStandardMaterial({ color: 0x880015, roughness: 0.6 });
      const tsuka = new THREE.Mesh(tsukaGeo, tsukaMat);
      tsuka.position.y = -25.5;
      g.add(tsuka);

      const kashiraGeo = new THREE.SphereGeometry(2, 16, 16);
      const kashira = new THREE.Mesh(kashiraGeo, habakiMat);
      kashira.position.y = -35;
      g.add(kashira);

      return g;
    };

    // Build Katana 2: Raikiri
    const buildRaikiri = () => {
      const g = new THREE.Group();

      const bladeGeo = new THREE.BoxGeometry(1.5, 54, 0.3);
      const bladeMat = new THREE.MeshStandardMaterial({
        color: 0x00f0ff,
        emissive: 0x0088cc,
        emissiveIntensity: 0.8,
        metalness: 0.95,
        roughness: 0.1
      });
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.position.y = 12;
      g.add(blade);

      for (let i = -8; i <= 28; i += 12) {
        const ringGeo = new THREE.TorusGeometry(2.2, 0.4, 8, 24);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.y = i;
        ring.rotation.x = Math.PI / 2;
        g.add(ring);
      }

      const tsubaGeo = new THREE.CylinderGeometry(4.5, 4.5, 0.8, 16);
      const tsubaMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9 });
      const tsuba = new THREE.Mesh(tsubaGeo, tsubaMat);
      tsuba.position.y = -15.5;
      g.add(tsuba);

      const tsukaGeo = new THREE.CylinderGeometry(1.5, 1.5, 18, 16);
      const tsukaMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
      const tsuka = new THREE.Mesh(tsukaGeo, tsukaMat);
      tsuka.position.y = -25;
      g.add(tsuka);

      return g;
    };

    // Build Katana 3: Kusanagi
    const buildKusanagi = () => {
      const g = new THREE.Group();

      const goldBladeGeo = new THREE.BoxGeometry(1.8, 50, 0.4);
      const goldBladeMat = new THREE.MeshStandardMaterial({
        color: 0xffd000,
        emissive: 0xd4af37,
        emissiveIntensity: 0.6,
        metalness: 0.98,
        roughness: 0.1
      });
      const blade = new THREE.Mesh(goldBladeGeo, goldBladeMat);
      blade.position.y = 12;
      g.add(blade);

      const tsubaGeo = new THREE.CylinderGeometry(5, 5, 1, 32);
      const tsuba = new THREE.Mesh(tsubaGeo, goldBladeMat);
      tsuba.position.y = -14;
      g.add(tsuba);

      const tsukaGeo = new THREE.CylinderGeometry(1.7, 1.7, 16, 16);
      const tsukaMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
      const tsuka = new THREE.Mesh(tsukaGeo, tsukaMat);
      tsuka.position.y = -23;
      g.add(tsuka);

      return g;
    };

    const loadBlade = (type) => {
      while (swordHolder.children.length > 0) {
        swordHolder.remove(swordHolder.children[0]);
      }

      if (type === 'murasama') swordHolder.add(buildMurasama());
      else if (type === 'raikiri') swordHolder.add(buildRaikiri());
      else if (type === 'kusanagi') swordHolder.add(buildKusanagi());

      // Update UI Text & Meters
      const info = bladeData[type];
      if (info) {
        const titleEl = document.getElementById('blade-title-display');
        const descEl = document.getElementById('blade-desc-display');
        const barSharpness = document.getElementById('blade-bar-sharpness');
        const valSharpness = document.getElementById('blade-val-sharpness');
        const barHardness = document.getElementById('blade-bar-hardness');
        const valHardness = document.getElementById('blade-val-hardness');
        const barEnchant = document.getElementById('blade-bar-enchant');
        const valEnchant = document.getElementById('blade-val-enchant');
        const barSpeed = document.getElementById('blade-bar-speed');
        const valSpeed = document.getElementById('blade-val-speed');

        if (titleEl) titleEl.textContent = info.title;
        if (descEl) descEl.textContent = info.desc;
        if (barSharpness) barSharpness.style.width = info.sharpness;
        if (valSharpness) valSharpness.textContent = info.sharpness;
        if (barHardness) barHardness.style.width = info.hardness;
        if (valHardness) valHardness.textContent = info.hardness;
        if (barEnchant) barEnchant.style.width = info.enchant;
        if (valEnchant) valEnchant.textContent = info.enchant;
        if (barSpeed) barSpeed.style.width = info.speed;
        if (valSpeed) valSpeed.textContent = info.speed;
      }

      setWireframe(isWireframe);
    };

    const setWireframe = (val) => {
      isWireframe = val;
      swordHolder.traverse(c => {
        if (c.isMesh) c.material.wireframe = val;
      });
    };

    loadBlade('murasama');

    // Switch Blade Tabs
    const tabs = document.querySelectorAll('.blade-tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const bladeType = tab.getAttribute('data-blade');
        loadBlade(bladeType);
        if (window.samuraiAudio) window.samuraiAudio.playBladeClash();
      });
    });

    // Toolbar Controls
    const toolBtns = document.querySelectorAll('.btn-katana-tool');
    toolBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-tool');
        if (window.samuraiAudio) window.samuraiAudio.playClick();

        if (action === 'wireframe') {
          btn.classList.toggle('active');
          setWireframe(btn.classList.contains('active'));
        } else if (action === 'autorotate') {
          autoRotate = !autoRotate;
          btn.classList.toggle('active', autoRotate);
        } else if (action === 'slash') {
          let swing = 0;
          const startRot = swordHolder.rotation.z;
          const swingInterval = setInterval(() => {
            swing += 0.2;
            swordHolder.rotation.z = Math.sin(swing * Math.PI) * 0.8;
            if (swing >= 1) {
              clearInterval(swingInterval);
              swordHolder.rotation.z = startRot;
            }
          }, 20);
          if (window.samuraiAudio) window.samuraiAudio.playKatanaSlash();
        } else if (action === 'reset') {
          camera.position.set(0, 10, 85);
          swordHolder.rotation.set(0, 0, 0);
        }
      });
    });

    // Drag to Orbit
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
      swordHolder.rotation.y += dx * 0.01;
      swordHolder.rotation.x += dy * 0.01;
      prevX = e.clientX;
      prevY = e.clientY;
    });

    // Mouse Wheel Zoom
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      camera.position.z += e.deltaY * 0.05;
      camera.position.z = Math.max(35, Math.min(130, camera.position.z));
    }, { passive: false });

    // Touch support
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
      swordHolder.rotation.y += dx * 0.01;
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
    const animateKatana = () => {
      requestAnimationFrame(animateKatana);

      if (autoRotate && !isDragging) {
        swordHolder.rotation.y += 0.01;
      }

      renderer.render(scene, camera);
    };

    animateKatana();
    this.katanaScene = { scene, camera, renderer, swordHolder };
  }

  /* ==========================================================================
     4. INTERACTIVE MOUSE KATANA SLASH TRAIL FX
     ========================================================================== */
  initMouseSlashTrail() {
    const canvas = document.getElementById('slash-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });

    const points = [];
    const sparks = [];
    let lastSlashTime = 0;

    window.addEventListener('mousemove', (e) => {
      const pt = { x: e.clientX, y: e.clientY, age: 0, life: 18 };
      points.push(pt);

      if (points.length > 2) {
        const p1 = points[points.length - 1];
        const p2 = points[points.length - 2];
        const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        const now = Date.now();
        if (dist > 35 && now - lastSlashTime > 400) {
          lastSlashTime = now;
          if (window.samuraiAudio) window.samuraiAudio.playKatanaSlash();

          for (let i = 0; i < 8; i++) {
            sparks.push({
              x: p1.x,
              y: p1.y,
              vx: (Math.random() - 0.5) * 6,
              vy: (Math.random() - 0.5) * 6,
              life: Math.random() * 20 + 10,
              maxLife: 30,
              color: Math.random() > 0.5 ? '#ffb7c5' : '#e5c07b'
            });
          }
        }
      }
    });

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        points.push({
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          age: 0,
          life: 18
        });
      }
    }, { passive: true });

    const renderSlash = () => {
      requestAnimationFrame(renderSlash);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (points.length > 1) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length; i++) {
          const xc = (points[i].x + points[i - 1].x) / 2;
          const yc = (points[i].y + points[i - 1].y) / 2;
          ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
        }

        ctx.strokeStyle = 'rgba(255, 183, 197, 0.65)';
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        ctx.shadowColor = '#e63946';
        ctx.shadowBlur = 10;
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      for (let i = points.length - 1; i >= 0; i--) {
        points[i].age++;
        if (points[i].age > points[i].life) {
          points.splice(i, 1);
        }
      }

      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.life--;

        ctx.fillStyle = s.color;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(s.x, s.y, (s.life / s.maxLife) * 2.5, 0, Math.PI * 2);
        ctx.fill();

        if (s.life <= 0) sparks.splice(i, 1);
      }
    };

    renderSlash();
  }
}

// Instantiate on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  window.samurai3D = new Samurai3DSystem();
});
