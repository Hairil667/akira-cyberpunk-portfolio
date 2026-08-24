/**
 * JARVIS // HOLOGRAPHIC 3D VEHICLE PROJECTION SYSTEM
 * Real Ferrari GLB with DRACOLoader + Holographic Blue HDRI + Wireframe Grid Floor
 */

class JarvisCarHologram {
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
    this.gridLines = [];
    this.scanLine = null;
    this.holoRing = null;

    this.isAutoRotating = true;

    this.targetTheta = 0.65;
    this.targetPhi = 0.3;
    this.currentTheta = 0.65;
    this.currentPhi = 0.3;
    this.targetRadius = 5.2;
    this.currentRadius = 5.2;

    this.time = 0;
    this.init();
  }

  init() {
    if (typeof THREE === 'undefined') return;

    const container = document.querySelector('.car-viewer-container');
    const canvas = document.getElementById('car-3d-canvas');
    if (!container || !canvas) return;

    const width = container.clientWidth || 900;
    const height = container.clientHeight || 500;

    this.renderer = new THREE.WebGLRenderer({
      canvas, alpha: true, antialias: true, powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.6;
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 200);
    this.updateCamera();

    this.setupHolographicEnvironment();
    this.setupLighting();
    this.setupHolographicStage();
    this.loadFerrariModel();
    this.setupInteractions(canvas);
    this.bindUI();

    window.addEventListener('resize', () => {
      const w = container.clientWidth || 900;
      const h = container.clientHeight || 500;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });

    const animate = () => {
      requestAnimationFrame(animate);
      this.time += 0.016;

      if (this.isAutoRotating) this.targetTheta += 0.003;

      this.currentTheta += (this.targetTheta - this.currentTheta) * 0.08;
      this.currentPhi += (this.targetPhi - this.currentPhi) * 0.08;
      this.currentRadius += (this.targetRadius - this.currentRadius) * 0.08;
      this.updateCamera();

      // Animate holographic ring
      if (this.holoRing) {
        this.holoRing.rotation.y += 0.008;
        this.holoRing.material.opacity = 0.35 + Math.sin(this.time * 2) * 0.15;
      }

      // Animate scan line
      if (this.scanLine) {
        this.scanLine.position.z = Math.sin(this.time * 0.8) * 3;
        this.scanLine.material.opacity = 0.25 + Math.sin(this.time * 3) * 0.15;
      }

      // Exhaust flame decay
      for (let i = this.exhaustFlames.length - 1; i >= 0; i--) {
        const f = this.exhaustFlames[i];
        f.position.z -= 0.1;
        f.scale.multiplyScalar(0.88);
        f.material.opacity *= 0.88;
        if (f.scale.x < 0.02) {
          this.scene.remove(f);
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

  setupHolographicEnvironment() {
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    pmrem.compileEquirectangularShader();

    const c = document.createElement('canvas');
    c.width = 1024; c.height = 512;
    const ctx = c.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#020408');
    grad.addColorStop(0.5, '#040a18');
    grad.addColorStop(1, '#020406');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    // Holographic cyan key light reflection
    const key = ctx.createRadialGradient(512, 100, 0, 512, 100, 280);
    key.addColorStop(0, 'rgba(56, 189, 248, 0.7)');
    key.addColorStop(0.5, 'rgba(56, 189, 248, 0.25)');
    key.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = key;
    ctx.fillRect(200, 0, 624, 280);

    // Side accent lights
    ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
    ctx.fillRect(60, 130, 200, 80);
    ctx.fillStyle = 'rgba(14, 165, 233, 0.2)';
    ctx.fillRect(760, 130, 200, 80);

    const tex = new THREE.CanvasTexture(c);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    const rt = pmrem.fromEquirectangular(tex);
    this.scene.environment = rt.texture;
  }

  setupLighting() {
    this.scene.add(new THREE.AmbientLight(0x38bdf8, 0.6));

    const key = new THREE.SpotLight(0x38bdf8, 5.0, 30, Math.PI / 4, 0.4, 1.5);
    key.position.set(4, 8, 5);
    this.scene.add(key);
    this.scene.add(key.target);

    const rim = new THREE.SpotLight(0x0ea5e9, 3.5, 25, Math.PI / 3.5, 0.5, 2);
    rim.position.set(-5, 5, -6);
    this.scene.add(rim);
    this.scene.add(rim.target);

    const under = new THREE.PointLight(0x38bdf8, 2.5, 8);
    under.position.set(0, -0.4, 0);
    this.scene.add(under);
  }

  setupHolographicStage() {
    // A. Holographic wireframe grid floor
    const gridMat = new THREE.LineBasicMaterial({
      color: 0x0ea5e9, transparent: true, opacity: 0.15
    });

    for (let i = -6; i <= 6; i++) {
      const points = [new THREE.Vector3(i, -0.01, -6), new THREE.Vector3(i, -0.01, 6)];
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geo, gridMat);
      this.scene.add(line);
    }
    for (let i = -6; i <= 6; i++) {
      const points = [new THREE.Vector3(-6, -0.01, i), new THREE.Vector3(6, -0.01, i)];
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geo, gridMat);
      this.scene.add(line);
    }

    // B. Glowing holographic turntable ring
    const ringGeo = new THREE.TorusGeometry(3.5, 0.03, 16, 96);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8, transparent: true, opacity: 0.5
    });
    this.holoRing = new THREE.Mesh(ringGeo, ringMat);
    this.holoRing.rotation.x = Math.PI / 2;
    this.holoRing.position.y = 0.01;
    this.scene.add(this.holoRing);

    // Outer ring
    const outerRingGeo = new THREE.TorusGeometry(4.0, 0.015, 16, 96);
    const outerRingMat = new THREE.MeshBasicMaterial({
      color: 0x0ea5e9, transparent: true, opacity: 0.25
    });
    const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
    outerRing.rotation.x = Math.PI / 2;
    outerRing.position.y = 0.005;
    this.scene.add(outerRing);

    // C. Vertical scanning beam
    const scanGeo = new THREE.PlaneGeometry(8, 3);
    const scanMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8, transparent: true, opacity: 0.08, side: THREE.DoubleSide
    });
    this.scanLine = new THREE.Mesh(scanGeo, scanMat);
    this.scanLine.position.y = 1.5;
    this.scene.add(this.scanLine);

    // D. Holographic data point markers
    const markerPositions = [
      { x: -2.5, y: 0.8, z: 1.5 },
      { x: 2.5, y: 1.2, z: -0.8 },
      { x: 0, y: 1.8, z: -1.5 },
      { x: -1.5, y: 0.3, z: -1.8 },
    ];

    markerPositions.forEach(p => {
      const dotGeo = new THREE.SphereGeometry(0.04, 8, 8);
      const dotMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8, transparent: true, opacity: 0.7
      });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.set(p.x, p.y, p.z);
      this.scene.add(dot);

      // Vertical line from dot to floor
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(p.x, 0, p.z),
        new THREE.Vector3(p.x, p.y, p.z)
      ]);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x38bdf8, transparent: true, opacity: 0.2
      });
      this.scene.add(new THREE.Line(lineGeo, lineMat));
    });
  }

  loadFerrariModel() {
    const hint = document.querySelector('.viewer-hint');
    if (hint) hint.textContent = '⟳ JARVIS: LOADING VEHICLE HOLOGRAM...';

    this.bodyMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xc41e3a, metalness: 0.75, roughness: 0.22,
      clearcoat: 1.0, clearcoatRoughness: 0.05, envMapIntensity: 2.5
    });

    this.detailsMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff, metalness: 1.0, roughness: 0.25, envMapIntensity: 2.8
    });

    this.glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x111827, metalness: 0.1, roughness: 0.05,
      transmission: 0.85, transparent: true, opacity: 0.9, envMapIntensity: 2.5
    });

    const dracoLoader = new THREE.DRACOLoader();
    dracoLoader.setDecoderPath('scripts/draco/');

    const gltfLoader = new THREE.GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    const shadowTexture = new THREE.TextureLoader().load('models/ferrari_ao.png');

    gltfLoader.load('models/ferrari.glb', (gltf) => {
      const car = gltf.scene.children[0] || gltf.scene;

      const body = car.getObjectByName('body');
      if (body) body.material = this.bodyMaterial;

      ['rim_fl', 'rim_fr', 'rim_rr', 'rim_rl', 'trim'].forEach(n => {
        const p = car.getObjectByName(n);
        if (p) p.material = this.detailsMaterial;
      });

      const glass = car.getObjectByName('glass');
      if (glass) glass.material = this.glassMaterial;

      this.wheelMeshes = [];
      ['wheel_fl', 'wheel_fr', 'wheel_rl', 'wheel_rr'].forEach(n => {
        const w = car.getObjectByName(n);
        if (w) this.wheelMeshes.push(w);
      });

      const shadowMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(0.655 * 4, 1.3 * 4),
        new THREE.MeshBasicMaterial({
          map: shadowTexture, blending: THREE.MultiplyBlending,
          toneMapped: false, transparent: true, opacity: 0.6
        })
      );
      shadowMesh.rotation.x = -Math.PI / 2;
      shadowMesh.position.y = 0.002;
      shadowMesh.renderOrder = 2;
      car.add(shadowMesh);

      this.scene.add(car);
      this.carModel = car;

      if (hint) hint.textContent = 'DRAG TO ROTATE // PINCH TO ZOOM';
    }, (xhr) => {
      const pct = xhr.total > 0 ? Math.round((xhr.loaded / xhr.total) * 100) : '';
      if (hint) hint.textContent = `⟳ JARVIS: LOADING... ${pct}%`;
    }, (err) => {
      console.error('JARVIS: Hologram load error:', err);
      if (hint) hint.textContent = 'DRAG TO ROTATE // PINCH TO ZOOM';
    });
  }

  setPaintColor(hex) {
    if (this.bodyMaterial) {
      this.bodyMaterial.color.setStyle(hex);
      this.bodyMaterial.needsUpdate = true;
    }
  }

  setupInteractions(canvas) {
    let isDragging = false, prevX = 0, prevY = 0;

    const onStart = (x, y) => { isDragging = true; this.isAutoRotating = false; prevX = x; prevY = y; };
    const onMove = (x, y) => {
      if (!isDragging) return;
      this.targetTheta -= (x - prevX) * 0.01;
      this.targetPhi = Math.max(0.08, Math.min(1.48, this.targetPhi + (y - prevY) * 0.01));
      prevX = x; prevY = y;
    };
    const onEnd = () => { isDragging = false; };

    canvas.addEventListener('mousedown', e => onStart(e.clientX, e.clientY));
    window.addEventListener('mousemove', e => onMove(e.clientX, e.clientY));
    window.addEventListener('mouseup', onEnd);

    canvas.addEventListener('touchstart', e => {
      if (e.touches.length === 1) onStart(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    canvas.addEventListener('touchmove', e => {
      if (e.touches.length === 1) onMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    canvas.addEventListener('touchend', onEnd);

    let lastPinch = 0;
    canvas.addEventListener('touchstart', e => {
      if (e.touches.length === 2)
        lastPinch = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
    }, { passive: true });
    canvas.addEventListener('touchmove', e => {
      if (e.touches.length === 2) {
        const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        this.targetRadius = Math.max(2.5, Math.min(9.0, this.targetRadius - (d - lastPinch) * 0.01));
        lastPinch = d;
      }
    }, { passive: true });

    canvas.addEventListener('wheel', e => {
      e.preventDefault();
      this.targetRadius = Math.max(2.5, Math.min(9.0, this.targetRadius + e.deltaY * 0.005));
    }, { passive: false });
  }

  bindUI() {
    document.querySelectorAll('.swatch-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.swatch-btn').forEach(s => s.classList.remove('active'));
        btn.classList.add('active');
        this.setPaintColor(btn.getAttribute('data-color'));
        if (window.carAudio) window.carAudio.playClick();
      });
    });

    const btnRev = document.getElementById('btn-rev');
    if (btnRev) btnRev.addEventListener('click', () => {
      if (window.carAudio) window.carAudio.playEngineRev();
      this.spawnExhaustFlames();
      this.shakeSuspension();
    });

    const btnTurntable = document.getElementById('btn-turntable');
    if (btnTurntable) btnTurntable.addEventListener('click', () => {
      this.isAutoRotating = !this.isAutoRotating;
      btnTurntable.classList.toggle('active', this.isAutoRotating);
      if (window.carAudio) window.carAudio.playClick();
    });

    document.querySelectorAll('.btn-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        const v = btn.getAttribute('data-view');
        this.isAutoRotating = false;
        if (v === 'front') { this.targetTheta = -0.38; this.targetPhi = 0.25; this.targetRadius = 5.0; }
        else if (v === 'side') { this.targetTheta = Math.PI / 2; this.targetPhi = 0.25; this.targetRadius = 4.8; }
        else if (v === 'rear') { this.targetTheta = Math.PI + 0.38; this.targetPhi = 0.25; this.targetRadius = 5.0; }
        else if (v === 'reset') { this.targetTheta = 0.65; this.targetPhi = 0.28; this.targetRadius = 5.2; this.isAutoRotating = true; }
        if (window.carAudio) window.carAudio.playClick();
      });
    });
  }

  spawnExhaustFlames() {
    if (!this.carModel) return;
    [-0.35, -0.15, 0.15, 0.35].forEach(ox => {
      for (let i = 0; i < 5; i++) {
        const g = new THREE.SphereGeometry(0.05 + Math.random() * 0.05, 8, 8);
        const m = new THREE.MeshBasicMaterial({
          color: 0x38bdf8, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending
        });
        const f = new THREE.Mesh(g, m);
        f.position.set(ox, 0.15, -1.2 - i * 0.2);
        this.scene.add(f);
        this.exhaustFlames.push(f);
      }
    });
  }

  shakeSuspension() {
    if (!this.carModel) return;
    const startY = this.carModel.position.y;
    let count = 0;
    const iv = setInterval(() => {
      count++;
      this.carModel.position.y = startY + (Math.random() - 0.5) * 0.035;
      if (count > 22) { clearInterval(iv); this.carModel.position.y = startY; }
    }, 32);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.jarvisCarHologram = new JarvisCarHologram();
});
