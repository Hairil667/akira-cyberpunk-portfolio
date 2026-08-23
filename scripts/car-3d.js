/**
 * APEX MOTORS — REAL 3D SPORTS CAR STUDIO
 * Loads the official Three.js Ferrari GLB model from jsDelivr CDN
 * with full environment reflections (RGBELoader), studio spotlights,
 * paint configurator, night rain highway background.
 */

class Car3DStudio {
  constructor() {
    this.mixer = null;
    this.carRoot = null;
    this.bodyMaterials = [];
    this.rimMaterials  = [];
    this.glassMaterials = [];
    this.headlightsGroup = null;
    this.rearWingObj = null;
    this.wheelObjects = [];

    this.doorsOpen = false;
    this.wingRaised = false;
    this.isDriving   = false;
    this.lightsOn    = true;

    this.roadLines   = [];
    this.trafficCars = [];
    this.exhaustFlames = [];

    this.init();
  }

  init() {
    if (typeof THREE === 'undefined') { console.error('Three.js missing'); return; }
    this.initRainHighwayBg();
    this.initCarStudio();
  }

  /* ==================================================================
     BACKGROUND: RAINY NIGHT HIGHWAY
  ================================================================== */
  initRainHighwayBg() {
    const canvas = document.getElementById('car-canvas-bg');
    if (!canvas) return;
    const W = window.innerWidth, H = window.innerHeight;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(62, W / H, 0.5, 4000);
    camera.position.set(0, 18, 180);
    camera.lookAt(0, 0, -400);

    scene.add(new THREE.AmbientLight(0x080c16, 2.5));
    const cityGlow = new THREE.DirectionalLight(0xff5020, 0.5);
    cityGlow.position.set(0, 200, -500);
    scene.add(cityGlow);

    // Wet road
    const road = new THREE.Mesh(
      new THREE.PlaneGeometry(260, 5000),
      new THREE.MeshStandardMaterial({ color: 0x04050a, roughness: 0.07, metalness: 0.88 })
    );
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, -20, -2000);
    scene.add(road);

    // Road edges
    [-130, 130].forEach(x => {
      const strip = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 5000),
        new THREE.MeshBasicMaterial({ color: 0xffffff }));
      strip.rotation.x = -Math.PI / 2;
      strip.position.set(x, -19.9, -2000);
      scene.add(strip);
    });

    // Center dashes (animated)
    for (let i = 0; i < 70; i++) {
      const l = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 18),
        new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.9 }));
      l.rotation.x = -Math.PI / 2;
      l.position.set(0, -19.8, -50 - i * 72);
      scene.add(l);
      this.roadLines.push(l);
    }
    [-55, 55].forEach(x => {
      for (let i = 0; i < 50; i++) {
        const l = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 14),
          new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.45 }));
        l.rotation.x = -Math.PI / 2;
        l.position.set(x, -19.8, -50 - i * 90);
        scene.add(l);
        this.roadLines.push(l);
      }
    });

    // Street lamps
    for (let i = 0; i < 24; i++) {
      [-140, 140].forEach(x => {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 52, 8),
          new THREE.MeshStandardMaterial({ color: 0x1e2030, metalness: 0.9 }));
        pole.position.set(x, 6, -90 - i * 200);
        scene.add(pole);

        const arm = new THREE.Mesh(new THREE.BoxGeometry(x > 0 ? -14 : 14, 0.8, 0.8),
          new THREE.MeshStandardMaterial({ color: 0x1e2030 }));
        arm.position.set(x > 0 ? x - 7 : x + 7, 31, -90 - i * 200);
        scene.add(arm);

        const glow = new THREE.Mesh(new THREE.SphereGeometry(2.8, 8, 8),
          new THREE.MeshBasicMaterial({ color: 0xffcc66 }));
        glow.position.set(x > 0 ? x - 13 : x + 13, 32, -90 - i * 200);
        scene.add(glow);

        const cone = new THREE.Mesh(new THREE.ConeGeometry(20, 50, 16, 1, true),
          new THREE.MeshBasicMaterial({ color: 0xffaa44, transparent: true, opacity: 0.055, side: THREE.DoubleSide }));
        cone.rotation.x = Math.PI;
        cone.position.set(x > 0 ? x - 13 : x + 13, 5, -90 - i * 200);
        scene.add(cone);

        const pool = new THREE.Mesh(new THREE.PlaneGeometry(40, 55),
          new THREE.MeshBasicMaterial({ color: 0xffeea0, transparent: true, opacity: 0.06 }));
        pool.rotation.x = -Math.PI / 2;
        pool.position.set(x > 0 ? x - 13 : x + 13, -19.5, -90 - i * 200);
        scene.add(pool);
      });
    }

    // Traffic cars
    const tColors = [0xff0033, 0xffffff, 0x00cfff, 0xf59e0b, 0x4488ff, 0x22dd44];
    for (let i = 0; i < 14; i++) {
      const g = new THREE.Group();
      const colr = tColors[i % tColors.length];
      const mat = new THREE.MeshStandardMaterial({ color: colr, metalness: 0.8, roughness: 0.2 });
      const b = new THREE.Mesh(new THREE.BoxGeometry(11, 5, 22), mat);
      g.add(b);
      const r = new THREE.Mesh(new THREE.BoxGeometry(9, 3.5, 13), mat);
      r.position.y = 4.2;
      g.add(r);
      [-3.5, 3.5].forEach(x => {
        const hl = new THREE.Mesh(new THREE.SphereGeometry(1.3, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
        hl.position.set(x, 0, 11.5);
        g.add(hl);
        const tl = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.0, 0.5), new THREE.MeshBasicMaterial({ color: 0xff0022 }));
        tl.position.set(x, 0.5, -11.5);
        g.add(tl);
      });
      const lane = i % 4;
      const lx = lane === 0 ? -80 : lane === 1 ? -28 : lane === 2 ? 28 : 80;
      g.position.set(lx, -17, -350 - i * 300);
      g._speed = Math.random() * 2 + 1;
      if (lx > 0) g.rotation.y = Math.PI;
      scene.add(g);
      this.trafficCars.push(g);
    }

    // City skyline
    for (let i = 0; i < 50; i++) {
      const h = Math.random() * 400 + 100;
      const w = Math.random() * 55 + 28;
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, w),
        new THREE.MeshStandardMaterial({ color: 0x060810, metalness: 0.82, roughness: 0.65 }));
      const sx = (i % 2 === 0 ? 1 : -1) * (Math.random() * 450 + 190);
      b.position.set(sx, h / 2 - 22, -1000 - Math.random() * 1200);
      scene.add(b);

      // Window texture
      const wc = document.createElement('canvas');
      wc.width = 64; wc.height = 256;
      const ctx = wc.getContext('2d');
      ctx.fillStyle = '#05060e'; ctx.fillRect(0, 0, 64, 256);
      for (let wy = 0; wy < 32; wy++) for (let wx = 0; wx < 8; wx++)
        if (Math.random() > 0.4) {
          ctx.fillStyle = ['#ffe0a0','#a8d8ff','#ff9055','#e8e8ff'][Math.floor(Math.random()*4)];
          ctx.fillRect(wx * 8 + 1, wy * 8 + 1, 6, 5);
        }
      const wm = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.88, h * 0.82),
        new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(wc), transparent: true, opacity: 0.82 }));
      wm.position.set(sx, h / 2 - 22, b.position.z + (sx > 0 ? -w / 2 - 0.5 : w / 2 + 0.5));
      wm.rotation.y = sx > 0 ? 0 : Math.PI;
      scene.add(wm);
    }

    // Rain particles
    const RC = 2200;
    const rGeo = new THREE.BufferGeometry();
    const rPos = new Float32Array(RC * 3);
    for (let i = 0; i < RC; i++) {
      rPos[i*3]   = (Math.random()-0.5)*600;
      rPos[i*3+1] = Math.random()*240-22;
      rPos[i*3+2] = Math.random()*-1000+80;
    }
    rGeo.setAttribute('position', new THREE.BufferAttribute(rPos, 3));
    const rainMesh = new THREE.Points(rGeo, new THREE.PointsMaterial({ color: 0x88aaff, size: 0.7, transparent: true, opacity: 0.5 }));
    scene.add(rainMesh);
    const rAttr = rGeo.attributes.position;

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

    const animBg = () => {
      requestAnimationFrame(animBg);
      const spd = this.isDriving ? 10 : 2.2;
      this.roadLines.forEach(l => { l.position.z += spd * 2.2; if (l.position.z > 160) l.position.z -= 5000; });
      this.trafficCars.forEach(tc => {
        tc.position.z += (spd - tc._speed) * 2.2;
        if (tc.position.z > 220) tc.position.z = -4500;
        if (tc.position.z < -4500) tc.position.z = 210;
      });
      for (let i = 0; i < RC; i++) {
        rAttr.array[i*3+1] -= 5 + spd * 0.5;
        rAttr.array[i*3]   -= spd * 0.18;
        if (rAttr.array[i*3+1] < -22) rAttr.array[i*3+1] = 240;
      }
      rAttr.needsUpdate = true;
      camera.position.x += (mx * 16 - camera.position.x) * 0.04;
      camera.position.y += (-my * 5 + 18 - camera.position.y) * 0.04;
      camera.lookAt(camera.position.x * 0.12, -2, -400);
      renderer.render(scene, camera);
    };
    animBg();
    this.bgData = { scene, camera, renderer };
  }

  /* ==================================================================
     CAR STUDIO: LOAD REAL FERRARI GLTF MODEL
  ================================================================== */
  initCarStudio() {
    const container = document.querySelector('.car-3d-stage-box');
    const canvas    = document.getElementById('car-3d-canvas');
    if (!container || !canvas) return;

    const W = container.clientWidth  || 900;
    const H = container.clientHeight || 500;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled  = true;
    renderer.shadowMap.type     = THREE.PCFSoftShadowMap;
    renderer.physicallyCorrectLights = true;
    renderer.toneMapping        = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 2.2;
    renderer.outputEncoding     = THREE.sRGBEncoding;

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, W / H, 0.1, 800);

    // Studio Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));

    const keyLight = new THREE.SpotLight(0xffffff, 6.0, 220, Math.PI / 4.5, 0.35, 1.5);
    keyLight.position.set(40, 90, 55);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.setScalar(2048);
    scene.add(keyLight);
    scene.add(keyLight.target);

    const rimLight = new THREE.SpotLight(0x60c8ff, 4.5, 180, Math.PI / 3.5, 0.5, 2);
    rimLight.position.set(-55, 50, -65);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0xffd0a0, 1.2);
    fillLight.position.set(0, -10, 50);
    scene.add(fillLight);

    // Pedestal
    const ped = new THREE.Mesh(
      new THREE.CylinderGeometry(38, 40, 1.4, 80),
      new THREE.MeshStandardMaterial({ color: 0x060810, metalness: 0.95, roughness: 0.12 })
    );
    ped.position.y = -0.75;
    ped.receiveShadow = true;
    scene.add(ped);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(39.5, 0.4, 16, 80),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -0.0;
    scene.add(ring);

    // === LOAD REAL GLB MODEL (Three.js official Ferrari) ===
    const GLTFLoaderScript = document.createElement('script');
    GLTFLoaderScript.src = 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/js/loaders/GLTFLoader.js';
    document.head.appendChild(GLTFLoaderScript);

    // Loading spinner overlay
    const loadOverlay = document.querySelector('.car-3d-hint');
    if (loadOverlay) loadOverlay.textContent = '⟳ LOADING 3D MODEL...';

    GLTFLoaderScript.onload = () => {
      const loader = new THREE.GLTFLoader();

      // Load the real Ferrari model
      loader.load(
        'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/models/gltf/ferrari.glb',
        (gltf) => {
          const car = gltf.scene;
          car.scale.setScalar(3.5);
          car.position.y = 0.3;

          // Scan all materials for body / rim / glass
          this.bodyMaterials  = [];
          this.rimMaterials   = [];
          this.glassMaterials = [];

          car.traverse(child => {
            if (child.isMesh) {
              child.castShadow    = true;
              child.receiveShadow = true;

              const name = (child.name || '').toLowerCase();
              const mat  = child.material;

              if (mat) {
                // Upgrade all body materials to PBR clearcoat paint
                if (name.includes('body') || name.includes('paint') || name.includes('car')) {
                  mat.metalness  = 0.88;
                  mat.roughness  = 0.12;
                  mat.clearcoat  = 1.0;
                  mat.clearcoatRoughness = 0.06;
                  this.bodyMaterials.push(mat);
                }
                // Rims
                if (name.includes('rim') || name.includes('wheel') || name.includes('spoke')) {
                  mat.metalness = 0.98;
                  mat.roughness = 0.04;
                  this.rimMaterials.push(mat);
                }
                // Glass
                if (name.includes('glass') || name.includes('window') || name.includes('wind')) {
                  mat.transparent = true;
                  mat.roughness   = 0.04;
                  mat.metalness   = 0.1;
                  this.glassMaterials.push(mat);
                }

                // Grab wheel references for spinning
                if (name.includes('wheel') || name.includes('tire')) {
                  this.wheelObjects.push(child);
                }
              }
            }
          });

          // If no body material found, grab all opaque mats and upgrade them
          if (this.bodyMaterials.length === 0) {
            car.traverse(child => {
              if (child.isMesh && child.material && !child.material.transparent) {
                const mat = child.material;
                mat.metalness  = 0.88;
                mat.roughness  = 0.12;
                mat.clearcoat  = 1.0;
                mat.clearcoatRoughness = 0.06;
                this.bodyMaterials.push(mat);
              }
            });
          }

          scene.add(car);
          this.carRoot = car;

          if (loadOverlay) loadOverlay.textContent = 'DRAG 360° • SCROLL TO ZOOM • PINCH ON MOBILE';

          // Set default paint color
          this.setPaintColor('#c41e3a'); // Ferrari Red as default
          // Update the active swatch to red
          document.querySelectorAll('.color-swatch-btn').forEach(b => b.classList.remove('active'));
          const redBtn = document.querySelector('[data-color="#c41e3a"]');
          if (redBtn) redBtn.classList.add('active');
        },
        (progress) => {
          const pct = progress.total > 0 ? Math.round(progress.loaded / progress.total * 100) : 0;
          if (loadOverlay) loadOverlay.textContent = `⟳ LOADING 3D MODEL... ${pct}%`;
        },
        (error) => {
          console.error('GLB load error', error);
          if (loadOverlay) loadOverlay.textContent = 'DRAG 360° • SCROLL TO ZOOM';
          // Fallback: build simple placeholder
          this.buildSimpleFallback(scene);
        }
      );
    };

    // === ORBIT CONTROLS ===
    let isDragging = false, autoRotate = true;
    let camTheta = 0.7, camPhi = 0.28, camRadius = 55;
    const updateCam = () => {
      camera.position.x = camRadius * Math.sin(camPhi) * Math.sin(camTheta);
      camera.position.y = camRadius * Math.cos(camPhi) + 3;
      camera.position.z = camRadius * Math.sin(camPhi) * Math.cos(camTheta);
      camera.lookAt(0, 3, 0);
    };
    updateCam();

    let pX = 0, pY = 0;
    canvas.addEventListener('mousedown', e => { isDragging = true; autoRotate = false; pX = e.clientX; pY = e.clientY; });
    window.addEventListener('mouseup', () => { isDragging = false; });
    canvas.addEventListener('mousemove', e => {
      if (!isDragging) return;
      camTheta -= (e.clientX - pX) * 0.011;
      camPhi    = Math.max(0.1, Math.min(1.5, camPhi + (e.clientY - pY) * 0.011));
      pX = e.clientX; pY = e.clientY;
      updateCam();
    });
    canvas.addEventListener('wheel', e => {
      e.preventDefault();
      camRadius = Math.max(22, Math.min(100, camRadius + e.deltaY * 0.06));
      updateCam();
    }, { passive: false });
    canvas.addEventListener('touchstart', e => { if (e.touches.length === 1) { isDragging = true; autoRotate = false; pX = e.touches[0].clientX; pY = e.touches[0].clientY; } }, { passive: true });
    canvas.addEventListener('touchmove', e => {
      if (!isDragging || e.touches.length !== 1) return;
      camTheta -= (e.touches[0].clientX - pX) * 0.011;
      camPhi    = Math.max(0.1, Math.min(1.5, camPhi + (e.touches[0].clientY - pY) * 0.011));
      pX = e.touches[0].clientX; pY = e.touches[0].clientY;
      updateCam();
    }, { passive: true });
    canvas.addEventListener('touchend', () => { isDragging = false; });

    // Pinch-to-zoom
    let lastPinchDist = 0;
    canvas.addEventListener('touchstart', e => { if (e.touches.length === 2) lastPinchDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); }, { passive: true });
    canvas.addEventListener('touchmove', e => {
      if (e.touches.length === 2) {
        const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        camRadius = Math.max(22, Math.min(100, camRadius - (d - lastPinchDist) * 0.1));
        lastPinchDist = d;
        updateCam();
      }
    }, { passive: true });

    // Bind paint swatches
    document.querySelectorAll('.color-swatch-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.color-swatch-btn').forEach(s => s.classList.remove('active'));
        btn.classList.add('active');
        this.setPaintColor(btn.dataset.color);
        if (window.carAudio) window.carAudio.playClick();
      });
    });

    // Bind buttons
    const bindBtn = (id, fn) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('click', fn);
    };
    bindBtn('btn-rev-engine', () => {
      this.spawnFlames(scene);
      this.shakeCar();
      if (window.carAudio) window.carAudio.playEngineRev();
    });
    bindBtn('btn-toggle-lights', () => {
      this.toggleLights();
      document.getElementById('btn-toggle-lights')?.classList.toggle('active', this.lightsOn);
      if (window.carAudio) window.carAudio.playLightsToggle();
    });
    bindBtn('btn-toggle-wing', () => {
      this.wingRaised = !this.wingRaised;
      document.getElementById('btn-toggle-wing')?.classList.toggle('active', this.wingRaised);
      if (window.carAudio) window.carAudio.playAeroServo();
    });
    bindBtn('btn-toggle-doors', () => {
      this.doorsOpen = !this.doorsOpen;
      document.getElementById('btn-toggle-doors')?.classList.toggle('active', this.doorsOpen);
      if (window.carAudio) window.carAudio.playAeroServo();
    });

    const driveBtn = document.getElementById('btn-drive-mode');
    if (driveBtn) driveBtn.addEventListener('click', () => {
      this.isDriving = !this.isDriving;
      driveBtn.classList.toggle('active', this.isDriving);
      driveBtn.innerHTML = this.isDriving ? '<span>🛑</span> STOP DRIVE' : '<span>🚀</span> ACCELERATE';
      if (this.isDriving) { this.spawnFlames(scene); if (window.carAudio) window.carAudio.playEngineRev(); }
      if (window.carAudio) window.carAudio.playClick();
    });

    document.querySelectorAll('.btn-cam-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        const v = btn.dataset.view;
        if (v === 'front') { camTheta = -0.4; camPhi = 0.25; camRadius = 52; }
        else if (v === 'side') { camTheta = Math.PI / 2; camPhi = 0.25; camRadius = 52; }
        else if (v === 'rear') { camTheta = Math.PI + 0.4; camPhi = 0.25; camRadius = 52; }
        else { camTheta = 0.7; camPhi = 0.28; camRadius = 55; }
        updateCam();
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

    // Render loop
    let time = 0;
    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);
      const dt = clock.getDelta();
      time += dt;

      if (autoRotate && !isDragging) {
        camTheta += 0.004;
        updateCam();
      }

      if (this.carRoot) {
        // Bounce when driving
        if (this.isDriving) {
          this.carRoot.position.y = 0.3 + Math.sin(time * 24) * 0.1;
          this.wheelObjects.forEach(w => w.rotation.x += 0.30);
        }
      }

      // Decay exhaust flames
      for (let i = this.exhaustFlames.length - 1; i >= 0; i--) {
        const f = this.exhaustFlames[i];
        f.position.z -= 0.9;
        f.scale.multiplyScalar(0.88);
        f.material.opacity *= 0.88;
        if (f.scale.x < 0.06) { scene.remove(f); this.exhaustFlames.splice(i, 1); }
      }

      ped.rotation.y -= 0.002;
      renderer.render(scene, camera);
    };
    animate();
    this.studioData = { scene, camera, renderer };
  }

  setPaintColor(hex) {
    this.bodyMaterials.forEach(mat => {
      mat.color.setStyle(hex);
      if (mat.clearcoat !== undefined) mat.clearcoat = 1.0;
    });
  }

  toggleLights() {
    this.lightsOn = !this.lightsOn;
    // Toggle emissive on light materials (headlights are usually separate meshes in the Ferrari GLB)
    if (this.carRoot) {
      this.carRoot.traverse(child => {
        if (child.isMesh) {
          const n = (child.name || '').toLowerCase();
          if (n.includes('light') || n.includes('lamp') || n.includes('headlight')) {
            child.visible = this.lightsOn;
          }
        }
      });
    }
  }

  spawnFlames(scene) {
    const positions = [-1.5, -0.5, 0.5, 1.5];
    const ref = this.carRoot;
    if (!ref) return;
    positions.forEach(x => {
      for (let i = 0; i < 6; i++) {
        const geo = new THREE.SphereGeometry(0.6 + Math.random() * 0.5, 8, 8);
        const mat = new THREE.MeshBasicMaterial({
          color: Math.random() > 0.4 ? 0x00ddff : 0xff5500,
          transparent: true, opacity: 0.95,
          blending: THREE.AdditiveBlending
        });
        const f = new THREE.Mesh(geo, mat);
        f.position.set(ref.position.x + x, ref.position.y + 0.5, ref.position.z - 12 - i * 2.2);
        scene.add(f);
        this.exhaustFlames.push(f);
      }
    });
  }

  shakeCar() {
    if (!this.carRoot) return;
    const origY = this.carRoot.position.y;
    let c = 0;
    const iv = setInterval(() => {
      this.carRoot.position.y = origY + (Math.random() - 0.5) * 0.5;
      if (++c > 28) { clearInterval(iv); this.carRoot.position.y = origY; }
    }, 32);
  }

  buildSimpleFallback(scene) {
    // Minimal placeholder if CDN fails
    const g = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(8, 3, 16),
      new THREE.MeshPhysicalMaterial({ color: 0xcc2200, metalness: 0.9, roughness: 0.12, clearcoat: 1 })
    );
    g.add(body);
    scene.add(g);
    this.carRoot = g;
  }
}

document.addEventListener('DOMContentLoaded', () => { window.car3D = new Car3DStudio(); });
