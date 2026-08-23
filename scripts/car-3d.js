/**
 * APEX MOTORS — CINEMATIC 3D STUDIO
 * Real Ferrari GLB (local) + synthetic HDRI env + ACES tonemapping + cinematic rainy night highway
 */

class Car3DStudio {
  constructor() {
    this.carRoot   = null;
    this.bodyMats  = [];
    this.wheelObjs = [];
    this.flames    = [];
    this.isDriving = false;
    this.roadLines = [];
    this.trafficCars = [];
    this._init();
  }

  _init() {
    if (typeof THREE === 'undefined') return;
    this._initBg();
    this._initStudio();
  }

  /* =================================================================
     CINEMATIC RAINY NIGHT HIGHWAY BACKGROUND
  ================================================================= */
  _initBg() {
    const canvas = document.getElementById('car-canvas-bg');
    if (!canvas) return;

    const W = window.innerWidth, H = window.innerHeight;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.7;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x01020a, 0.0012);
    const camera = new THREE.PerspectiveCamera(56, W/H, 0.5, 3000);
    camera.position.set(0, 22, 200);
    camera.lookAt(0, 4, -200);

    // Sky backdrop
    const skyC = document.createElement('canvas');
    skyC.width = 4; skyC.height = 256;
    const skyCtx = skyC.getContext('2d');
    const sg = skyCtx.createLinearGradient(0, 0, 0, 256);
    sg.addColorStop(0, '#000510'); sg.addColorStop(0.5, '#070a1a'); sg.addColorStop(1, '#12081e');
    skyCtx.fillStyle = sg; skyCtx.fillRect(0,0,4,256);
    const sky = new THREE.Mesh(new THREE.PlaneGeometry(6000, 2000),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(skyC), depthWrite: false }));
    sky.position.set(0, 300, -1500);
    scene.add(sky);

    // Wet asphalt with baked neon reflections
    const rC = document.createElement('canvas');
    rC.width = 512; rC.height = 512;
    const rc = rC.getContext('2d');
    rc.fillStyle = '#03040a'; rc.fillRect(0,0,512,512);
    const streak = (x, y, w, h, col, a) => {
      const g = rc.createLinearGradient(x, y, x, y+h);
      g.addColorStop(0,`rgba(${col},0)`); g.addColorStop(0.5,`rgba(${col},${a})`); g.addColorStop(1,`rgba(${col},0)`);
      rc.fillStyle = g; rc.fillRect(x,y,w,h);
    };
    streak(215,0,80,512,'245,158,11',0.14);
    streak(85,60,45,340,'0,220,255',0.09);
    streak(375,40,55,380,'255,60,60',0.07);
    streak(310,100,30,280,'200,80,255',0.06);
    const rTex = new THREE.CanvasTexture(rC);
    rTex.wrapS = THREE.RepeatWrapping; rTex.wrapT = THREE.RepeatWrapping; rTex.repeat.set(3,20);
    const road = new THREE.Mesh(new THREE.PlaneGeometry(270, 5000),
      new THREE.MeshStandardMaterial({ map: rTex, color: 0x131828, roughness: 0.07, metalness: 0.88 }));
    road.rotation.x = -Math.PI/2; road.position.set(0,-22,-2000);
    scene.add(road);

    // Road edge lines
    [-135, 135].forEach(x => {
      const el = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 5000),
        new THREE.MeshBasicMaterial({ color: 0xffffff }));
      el.rotation.x = -Math.PI/2; el.position.set(x,-21.9,-2000);
      scene.add(el);
    });

    // Animated center dashes
    for (let i = 0; i < 90; i++) {
      const l = new THREE.Mesh(new THREE.PlaneGeometry(1.8,18),
        new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.9 }));
      l.rotation.x = -Math.PI/2; l.position.set(0,-21.7,-40-i*60);
      scene.add(l); this.roadLines.push(l);
    }
    [-58, 58].forEach(x => {
      for (let i = 0; i < 55; i++) {
        const l = new THREE.Mesh(new THREE.PlaneGeometry(0.9,14),
          new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.4 }));
        l.rotation.x = -Math.PI/2; l.position.set(x,-21.7,-40-i*90);
        scene.add(l); this.roadLines.push(l);
      }
    });

    // Neon puddle reflections on road
    const nCols = [0xff2200,0x00ddff,0xffaa00,0xaa00ff,0x00ff88];
    for (let i = 0; i < 22; i++) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(Math.random()*4+1, Math.random()*100+50),
        new THREE.MeshBasicMaterial({ color: nCols[i%nCols.length], transparent: true,
          opacity: Math.random()*0.14+0.04, blending: THREE.AdditiveBlending }));
      m.rotation.x = -Math.PI/2; m.position.set((Math.random()-0.5)*240,-21.6,-150-i*200);
      scene.add(m);
    }

    // Street lamps
    const lmpMat = new THREE.MeshStandardMaterial({ color: 0x181c2e, metalness: 0.92, roughness: 0.4 });
    for (let i = 0; i < 30; i++) {
      [-148, 148].forEach(sx => {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.48,0.68,58,8), lmpMat);
        pole.position.set(sx, 7, -100-i*210); scene.add(pole);
        const ax = sx > 0 ? sx-7 : sx+7;
        const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.28,0.28,16,6), lmpMat);
        arm.rotation.z = Math.PI/2; arm.position.set(ax, 33, -100-i*210); scene.add(arm);
        const lx = sx > 0 ? sx-14 : sx+14;
        const head = new THREE.Mesh(new THREE.BoxGeometry(5.5,2.2,6.5),
          new THREE.MeshBasicMaterial({ color: 0xffe090 }));
        head.position.set(lx, 33, -100-i*210); scene.add(head);
        const pl = new THREE.PointLight(0xffcc66, 4.0, 160, 2);
        pl.position.set(lx, 32, -100-i*210); scene.add(pl);
        const cone = new THREE.Mesh(new THREE.ConeGeometry(24, 58, 20, 1, true),
          new THREE.MeshBasicMaterial({ color: 0xffcc66, transparent: true, opacity: 0.042, side: THREE.BackSide }));
        cone.rotation.x = Math.PI; cone.position.set(lx, 2, -100-i*210); scene.add(cone);
        const pool = new THREE.Mesh(new THREE.PlaneGeometry(55, 75),
          new THREE.MeshBasicMaterial({ color: 0xffcc66, transparent: true, opacity: 0.055, blending: THREE.AdditiveBlending }));
        pool.rotation.x = -Math.PI/2; pool.position.set(lx,-21.4,-100-i*210); scene.add(pool);
      });
    }

    // Traffic cars
    const tCols = [0xff1133,0xffffff,0x00ccff,0xf59e0b,0x2255ff,0x11cc55,0xdd0077,0xff8800];
    for (let i = 0; i < 18; i++) {
      const g = new THREE.Group();
      const col = tCols[i%tCols.length];
      const bm = new THREE.MeshStandardMaterial({ color: col, metalness: 0.85, roughness: 0.15 });
      g.add(new THREE.Mesh(new THREE.BoxGeometry(10,4.5,21), bm));
      const cab = new THREE.Mesh(new THREE.BoxGeometry(8.5,3.2,12), bm);
      cab.position.y = 3.9; g.add(cab);
      [-3,3].forEach(x => {
        const hl = new THREE.Mesh(new THREE.BoxGeometry(2.4,1.1,0.6), new THREE.MeshBasicMaterial({ color: 0xffffff }));
        hl.position.set(x,0,10.6); g.add(hl);
        const hgl = new THREE.PointLight(0xffffff, 3.0, 60, 2);
        hgl.position.set(x,0,13); g.add(hgl);
        const tl = new THREE.Mesh(new THREE.BoxGeometry(2.8,0.9,0.5), new THREE.MeshBasicMaterial({ color: 0xff0022 }));
        tl.position.set(x,0.5,-10.6); g.add(tl);
        const tgl = new THREE.PointLight(0xff0022, 2.0, 40, 2);
        tgl.position.set(x,0.5,-12); g.add(tgl);
      });
      [-4.8,4.8].forEach(wx => [-6.5,6.5].forEach(wz => {
        const w = new THREE.Mesh(new THREE.CylinderGeometry(2,2,2.2,12),
          new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 }));
        w.rotation.z = Math.PI/2; w.position.set(wx,-2.2,wz); g.add(w);
      }));
      const lane = i%4;
      const lx = lane===0?-78:lane===1?-28:lane===2?28:78;
      g.position.set(lx,-19,-420-i*270);
      g._speed = Math.random()*2.2+1.0;
      if (lx>0) g.rotation.y = Math.PI;
      scene.add(g); this.trafficCars.push(g);
    }

    // City skyline
    for (let i = 0; i < 65; i++) {
      const h = Math.random()*520+100;
      const w = Math.random()*65+30;
      const d = Math.random()*65+30;
      const side = i%2===0?1:-1;
      const bx = side*(Math.random()*520+200);
      const bz = -1300-Math.random()*1300;
      const b = new THREE.Mesh(new THREE.BoxGeometry(w,h,d),
        new THREE.MeshStandardMaterial({ color: 0x050710, metalness: 0.83, roughness: 0.6 }));
      b.position.set(bx,h/2-24,bz); scene.add(b);
      // Window grid texture
      const wc = document.createElement('canvas');
      wc.width = 128; wc.height = 512;
      const wctx = wc.getContext('2d');
      wctx.fillStyle = '#040610'; wctx.fillRect(0,0,128,512);
      for (let wy=0;wy<64;wy++) for (let wx2=0;wx2<16;wx2++)
        if (Math.random()>0.40) {
          wctx.fillStyle = ['#ffe0a0','#b0d8ff','#ffaa60','#eeeeff','#aaffcc','#ffddaa'][Math.floor(Math.random()*6)];
          wctx.fillRect(wx2*8+1,wy*8+1,6,5);
        }
      const wm = new THREE.Mesh(new THREE.PlaneGeometry(w*0.88,h*0.84),
        new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(wc), transparent: true, opacity: 0.88 }));
      wm.position.set(bx+(side>0?-w/2-0.4:w/2+0.4), h/2-24, bz);
      wm.rotation.y = side>0?0:Math.PI; scene.add(wm);
      // Rooftop light
      if (Math.random()>0.5) {
        const ac = [0xff2244,0x00ddff,0xffaa00][Math.floor(Math.random()*3)];
        const ant = new THREE.Mesh(new THREE.SphereGeometry(1.3,8,8), new THREE.MeshBasicMaterial({ color: ac }));
        ant.position.set(bx,h-22,bz); scene.add(ant);
        const agl = new THREE.PointLight(ac, 3.5, 100, 2); agl.position.copy(ant.position); scene.add(agl);
      }
    }

    // Overhead highway gantries
    const gantryMat = new THREE.MeshStandardMaterial({ color: 0x1c2236, metalness: 0.9 });
    for (let i = 0; i < 12; i++) {
      const fz = -280-i*330;
      const frame = new THREE.Mesh(new THREE.BoxGeometry(290,2.5,2.5), gantryMat);
      frame.position.set(0,52,fz); scene.add(frame);
      [-138,138].forEach(x => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(1.4,1.4,74,8), gantryMat);
        leg.position.set(x,15,fz); scene.add(leg);
      });
      const nCol = [0x00ddff, 0xff2244, 0xf59e0b][i%3];
      const neonStrip = new THREE.Mesh(new THREE.BoxGeometry(250,0.7,0.7), new THREE.MeshBasicMaterial({ color: nCol }));
      neonStrip.position.set(0,51,fz); scene.add(neonStrip);
      const ngl = new THREE.PointLight(nCol, 5, 250, 2); ngl.position.set(0,51,fz); scene.add(ngl);
    }

    // Rain — line segments for realistic streaks
    const RC = 2600;
    const rGeo = new THREE.BufferGeometry();
    const rBuf = new Float32Array(RC*6);
    for (let i=0;i<RC;i++) {
      const x=(Math.random()-0.5)*750, y=Math.random()*290-22, z=Math.random()*-1600+200;
      rBuf[i*6]=x; rBuf[i*6+1]=y; rBuf[i*6+2]=z;
      rBuf[i*6+3]=x-0.5; rBuf[i*6+4]=y-8; rBuf[i*6+5]=z;
    }
    rGeo.setAttribute('position', new THREE.BufferAttribute(rBuf,3));
    const rainLines = new THREE.LineSegments(rGeo, new THREE.LineBasicMaterial({ color: 0x7799cc, transparent: true, opacity: 0.42 }));
    scene.add(rainLines);
    const rA = rGeo.attributes.position;

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth/window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    let mx=0,my=0;
    window.addEventListener('mousemove', e => { mx=(e.clientX/window.innerWidth-0.5)*2; my=(e.clientY/window.innerHeight-0.5)*2; });

    const animBg = () => {
      requestAnimationFrame(animBg);
      const spd = this.isDriving ? 12 : 2.6;

      this.roadLines.forEach(l => { l.position.z += spd*2.0; if (l.position.z>200) l.position.z -= 5400; });
      this.trafficCars.forEach(tc => {
        tc.position.z += (spd-tc._speed)*2.0;
        if (tc.position.z>300) tc.position.z=-4900;
        if (tc.position.z<-4900) tc.position.z=300;
      });
      for (let i=0;i<RC;i++) {
        rA.array[i*6+1]-=5.5+spd*0.5; rA.array[i*6+4]-=5.5+spd*0.5;
        rA.array[i*6]-=spd*0.12; rA.array[i*6+3]-=spd*0.12;
        if (rA.array[i*6+1]<-22) {
          const nx=(Math.random()-0.5)*750, nz=Math.random()*-1600+200;
          rA.array[i*6]=nx; rA.array[i*6+1]=285; rA.array[i*6+2]=nz;
          rA.array[i*6+3]=nx-0.5; rA.array[i*6+4]=277; rA.array[i*6+5]=nz;
        }
      }
      rA.needsUpdate=true;
      camera.position.x+=(mx*15-camera.position.x)*0.04;
      camera.position.y+=(-my*5+22-camera.position.y)*0.04;
      camera.lookAt(camera.position.x*0.1, 4, -300);
      renderer.render(scene, camera);
    };
    animBg();
  }

  /* =================================================================
     CAR STUDIO: REAL FERRARI GLB + HDRI + ACES
  ================================================================= */
  _initStudio() {
    const container = document.querySelector('.car-3d-stage-box');
    const canvas    = document.getElementById('car-3d-canvas');
    if (!container || !canvas) return;

    const W = container.clientWidth||900, H = container.clientHeight||500;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
    renderer.physicallyCorrectLights = true;
    renderer.toneMapping             = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure     = 2.5;
    renderer.outputEncoding          = THREE.sRGBEncoding;

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, W/H, 0.1, 800);

    // Synthetic HDRI environment (canvas equirectangular → PMREMGenerator)
    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    const ec = document.createElement('canvas');
    ec.width=1024; ec.height=512;
    const ectx = ec.getContext('2d');
    // Sky
    const eSky = ectx.createLinearGradient(0,0,0,512);
    eSky.addColorStop(0,'#000408'); eSky.addColorStop(0.48,'#040815'); eSky.addColorStop(0.5,'#080c1a'); eSky.addColorStop(1,'#030508');
    ectx.fillStyle=eSky; ectx.fillRect(0,0,1024,512);
    // Key light streak (simulates studio softbox)
    const kg=ectx.createRadialGradient(512,128,0,512,128,220);
    kg.addColorStop(0,'rgba(255,248,235,0.72)'); kg.addColorStop(1,'rgba(255,248,235,0)');
    ectx.fillStyle=kg; ectx.fillRect(300,0,424,260);
    // Rim light (blue-cyan)
    const rg=ectx.createRadialGradient(100,200,0,100,200,180);
    rg.addColorStop(0,'rgba(50,200,255,0.45)'); rg.addColorStop(1,'rgba(50,200,255,0)');
    ectx.fillStyle=rg; ectx.fillRect(0,100,280,300);
    // Neon floor bounce
    ectx.fillStyle='rgba(245,158,11,0.2)'; ectx.fillRect(350,440,300,72);
    ectx.fillStyle='rgba(0,220,255,0.14)'; ectx.fillRect(0,420,250,92);

    const envTex = new THREE.CanvasTexture(ec);
    envTex.mapping = THREE.EquirectangularReflectionMapping;
    const envRT = pmrem.fromEquirectangular(envTex);
    scene.environment = envRT.texture;

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const key = new THREE.SpotLight(0xfff8ee, 9.0, 300, Math.PI/4.5, 0.28, 1.5);
    key.position.set(40, 100, 58); key.castShadow=true; key.shadow.mapSize.setScalar(2048);
    scene.add(key); scene.add(key.target);
    const rim = new THREE.SpotLight(0x44bbff, 6.0, 240, Math.PI/3.8, 0.55, 2);
    rim.position.set(-65, 58, -75); scene.add(rim); scene.add(rim.target);
    const underNeon = new THREE.PointLight(0x00ddff, 4.0, 70, 2);
    underNeon.position.set(0,-5,0); scene.add(underNeon);
    const rearNeon = new THREE.PointLight(0xff2244, 3.0, 90, 2);
    rearNeon.position.set(0,12,-50); scene.add(rearNeon);

    // Pedestal
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(42,44,1.6,90),
      new THREE.MeshStandardMaterial({ color: 0x040610, metalness: 0.97, roughness: 0.09, envMapIntensity: 3.0 }));
    ped.position.y=-0.88; ped.receiveShadow=true; scene.add(ped);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(43,0.45,16,100),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b }));
    ring.rotation.x=Math.PI/2; ring.position.y=-0.06; scene.add(ring);
    // Neon pool on floor
    const pool = new THREE.Mesh(new THREE.PlaneGeometry(85,85),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.07, blending: THREE.AdditiveBlending }));
    pool.rotation.x=-Math.PI/2; pool.position.y=-0.4; scene.add(pool);

    // Load GLTFLoader + Ferrari model
    const hint = document.querySelector('.car-3d-hint');
    if (hint) hint.textContent = '⟳ LOADING MODEL...';
    const ls = document.createElement('script');
    ls.src = 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/js/loaders/GLTFLoader.js';
    document.head.appendChild(ls);

    ls.onload = () => {
      const loader = new THREE.GLTFLoader();
      loader.load('models/ferrari.glb',
        (gltf) => {
          const car = gltf.scene;
          car.scale.setScalar(3.8);
          car.position.set(0, 0.5, 0);

          car.traverse(child => {
            if (!child.isMesh) return;
            child.castShadow = child.receiveShadow = true;
            const mat = child.material;
            if (!mat || !(mat.isMeshStandardMaterial || mat.isMeshPhysicalMaterial)) return;
            const n = (child.name||'').toLowerCase();
            mat.envMapIntensity = 3.0;
            if (!n.includes('glass') && !n.includes('window') && !n.includes('screen')) {
              mat.clearcoat = 1.0; mat.clearcoatRoughness = 0.05;
              this.bodyMats.push(mat);
            }
            if (n.includes('wheel')||n.includes('rim')||n.includes('tyre')||n.includes('tire')) this.wheelObjs.push(child);
          });

          scene.add(car);
          this.carRoot = car;
          this.setPaintColor('#c41e3a');
          document.querySelectorAll('.color-swatch-btn').forEach(b=>b.classList.remove('active'));
          const rd = document.querySelector('[data-color="#c41e3a"]');
          if (rd) rd.classList.add('active');
          if (hint) hint.textContent = 'DRAG 360° • SCROLL ZOOM • PINCH ON MOBILE';
        },
        prog => { const p=prog.total>0?Math.round(prog.loaded/prog.total*100):''; if(hint)hint.textContent=`⟳ LOADING MODEL ${p}%`; },
        err => { console.error(err); if(hint) hint.textContent='DRAG 360° • SCROLL ZOOM'; }
      );
    };

    // Orbit
    let dragging=false, autoRot=true, theta=0.68, phi=0.27, radius=54;
    const updCam = () => {
      camera.position.x=radius*Math.sin(phi)*Math.sin(theta);
      camera.position.y=radius*Math.cos(phi)+3.5;
      camera.position.z=radius*Math.sin(phi)*Math.cos(theta);
      camera.lookAt(0,3.5,0);
    };
    updCam();
    let px=0,py=0;
    canvas.addEventListener('mousedown',e=>{dragging=true;autoRot=false;px=e.clientX;py=e.clientY;});
    window.addEventListener('mouseup',()=>dragging=false);
    canvas.addEventListener('mousemove',e=>{if(!dragging)return;theta-=(e.clientX-px)*0.011;phi=Math.max(0.08,Math.min(1.48,phi+(e.clientY-py)*0.011));px=e.clientX;py=e.clientY;updCam();});
    canvas.addEventListener('wheel',e=>{e.preventDefault();radius=Math.max(20,Math.min(100,radius+e.deltaY*0.06));updCam();},{passive:false});
    canvas.addEventListener('touchstart',e=>{if(e.touches.length===1){dragging=true;autoRot=false;px=e.touches[0].clientX;py=e.touches[0].clientY;}},{passive:true});
    canvas.addEventListener('touchmove',e=>{if(!dragging||e.touches.length!==1)return;theta-=(e.touches[0].clientX-px)*0.011;phi=Math.max(0.08,Math.min(1.48,phi+(e.touches[0].clientY-py)*0.011));px=e.touches[0].clientX;py=e.touches[0].clientY;updCam();},{passive:true});
    canvas.addEventListener('touchend',()=>dragging=false);
    let lpd=0;
    canvas.addEventListener('touchstart',e=>{if(e.touches.length===2)lpd=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);},{passive:true});
    canvas.addEventListener('touchmove',e=>{if(e.touches.length===2){const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);radius=Math.max(20,Math.min(100,radius-(d-lpd)*0.1));lpd=d;updCam();}},{passive:true});

    // Buttons
    document.querySelectorAll('.color-swatch-btn').forEach(btn=>{
      btn.addEventListener('click',()=>{
        document.querySelectorAll('.color-swatch-btn').forEach(s=>s.classList.remove('active'));
        btn.classList.add('active');
        this.setPaintColor(btn.dataset.color);
        if(window.carAudio)window.carAudio.playClick();
      });
    });
    const bind=(id,fn)=>{const el=document.getElementById(id);if(el)el.addEventListener('click',fn);};
    bind('btn-rev-engine',()=>{this._flames(scene);this._shake();if(window.carAudio)window.carAudio.playEngineRev();});
    bind('btn-toggle-lights',()=>{
      underNeon.intensity=underNeon.intensity>0?0:4.0;
      rearNeon.intensity=rearNeon.intensity>0?0:3.0;
      document.getElementById('btn-toggle-lights')?.classList.toggle('active');
      if(window.carAudio)window.carAudio.playLightsToggle();
    });
    bind('btn-toggle-wing',()=>{document.getElementById('btn-toggle-wing')?.classList.toggle('active');if(window.carAudio)window.carAudio.playAeroServo();});
    bind('btn-toggle-doors',()=>{document.getElementById('btn-toggle-doors')?.classList.toggle('active');if(window.carAudio)window.carAudio.playAeroServo();});
    const drBtn=document.getElementById('btn-drive-mode');
    if(drBtn)drBtn.addEventListener('click',()=>{
      this.isDriving=!this.isDriving;
      drBtn.classList.toggle('active',this.isDriving);
      drBtn.innerHTML=this.isDriving?'<span>🛑</span> STOP DRIVE':'<span>🚀</span> ACCELERATE';
      if(this.isDriving){this._flames(scene);if(window.carAudio)window.carAudio.playEngineRev();}
      if(window.carAudio)window.carAudio.playClick();
    });
    document.querySelectorAll('.btn-cam-preset').forEach(btn=>{
      btn.addEventListener('click',()=>{
        const v=btn.dataset.view;
        if(v==='front'){theta=-0.38;phi=0.24;radius=52;}
        else if(v==='side'){theta=Math.PI/2;phi=0.24;radius=50;}
        else if(v==='rear'){theta=Math.PI+0.38;phi=0.24;radius=52;}
        else{theta=0.68;phi=0.27;radius=54;}
        updCam();if(window.carAudio)window.carAudio.playClick();
      });
    });
    window.addEventListener('resize',()=>{const nW=container.clientWidth||900,nH=container.clientHeight||500;camera.aspect=nW/nH;camera.updateProjectionMatrix();renderer.setSize(nW,nH);});

    let time=0;
    const clock=new THREE.Clock();
    const animate=()=>{
      requestAnimationFrame(animate);
      const dt=clock.getDelta(); time+=dt;
      if(autoRot&&!dragging){theta+=0.0035;updCam();}
      if(this.isDriving&&this.carRoot){
        this.carRoot.position.y=0.5+Math.sin(time*22)*0.09;
        this.wheelObjs.forEach(w=>w.rotation.x+=0.28);
      }
      for(let i=this.flames.length-1;i>=0;i--){
        const f=this.flames[i];
        f.position.z-=1.0;f.scale.multiplyScalar(0.86);f.material.opacity*=0.86;
        if(f.scale.x<0.05){scene.remove(f);this.flames.splice(i,1);}
      }
      ped.rotation.y-=0.0018;
      renderer.render(scene,camera);
    };
    animate();
  }

  setPaintColor(hex) { this.bodyMats.forEach(m=>m.color.setStyle(hex)); }

  _flames(scene) {
    if(!this.carRoot)return;
    const cx=this.carRoot.position.x,cy=this.carRoot.position.y,cz=this.carRoot.position.z;
    [-5.5,-2,2,5.5].forEach(ox=>{
      for(let i=0;i<7;i++){
        const g=new THREE.SphereGeometry(0.5+Math.random()*0.7,8,8);
        const m=new THREE.MeshBasicMaterial({ color:Math.random()>0.4?0x00ddff:0xff5500,transparent:true,opacity:0.95,blending:THREE.AdditiveBlending });
        const f=new THREE.Mesh(g,m);
        f.position.set(cx+ox,cy+0.6,cz-13-i*2.5);
        scene.add(f);this.flames.push(f);
      }
    });
  }

  _shake(){
    if(!this.carRoot)return;
    const oy=this.carRoot.position.y;let c=0;
    const iv=setInterval(()=>{
      this.carRoot.position.y=oy+(Math.random()-0.5)*0.55;
      if(++c>28){clearInterval(iv);this.carRoot.position.y=oy;}
    },32);
  }
}

document.addEventListener('DOMContentLoaded',()=>{window.car3D=new Car3DStudio();});