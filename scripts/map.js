/**
 * Cyber Tactical Map & Radar Grid HUD
 */
class TacticalMap {
  constructor() {
    this.canvas = document.getElementById('radar-canvas');
    this.coordsDisplay = document.getElementById('map-coords-readout');
    this.sectorTitle = document.getElementById('sector-title-readout');
    this.sectorDesc = document.getElementById('sector-desc-readout');
    this.threatBadge = document.getElementById('sector-threat-badge');
    
    this.sectors = {
      s07: {
        name: "SECTOR 07: AKIRA MECHA HANGAR",
        threat: "SECURE [LEVEL 0]",
        threatClass: "threat-secure",
        desc: "Akira's primary mobile bunker & customized mecha maintenance hangar. Houses RX-09 Ronin and Apex Railguns. High-security quantum encrypted perimeter."
      },
      s01: {
        name: "SECTOR 01: CITADEL CORE",
        threat: "MODERATE [LEVEL 2]",
        threatClass: "threat-med",
        desc: "Metropolitan financial and megacorp nerve center. High orbital drone density, dense fiber grid, and heavy corporate cybersecurity."
      },
      s04: {
        name: "SECTOR 04: ORBITAL SPACEPORT",
        threat: "ELEVATED [LEVEL 3]",
        threatClass: "threat-elevated",
        desc: "Atmospheric lift and orbital interceptor catapult arrays. Fast transit gateway to Low Earth Orbit combat stations."
      },
      s11: {
        name: "SECTOR 11: CYBER MATRIX VAULT",
        threat: "CRITICAL [LEVEL 4]",
        threatClass: "threat-high",
        desc: "Subterranean encrypted mainframe vaults & black market neural-mesh network relays. Extreme firewall countermeasures."
      },
      s19: {
        name: "SECTOR 19: PROVING GROUNDS",
        threat: "HAZARDOUS [LEVEL 5]",
        threatClass: "threat-danger",
        desc: "Wasteland proving range for heavy artillery, mecha live-fire ballistic stress testing, and railgun calibration."
      }
    };

    this.angle = 0;
    this.initCanvas();
    this.initInteractivity();
  }

  initCanvas() {
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    this.animate();
  }

  resizeCanvas() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    this.centerX = this.canvas.width / 2;
    this.centerY = this.canvas.height / 2;
    this.maxRadius = Math.min(this.centerX, this.centerY) * 0.95;
  }

  animate() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Dynamic Radar Sweep
    this.angle += 0.025;
    if (this.angle > Math.PI * 2) this.angle = 0;

    const sweepX = this.centerX + Math.cos(this.angle) * this.maxRadius;
    const sweepY = this.centerY + Math.sin(this.angle) * this.maxRadius;

    const grad = ctx.createRadialGradient(this.centerX, this.centerY, 10, this.centerX, this.centerY, this.maxRadius);
    grad.addColorStop(0, 'rgba(245, 158, 11, 0.25)');
    grad.addColorStop(0.8, 'rgba(245, 158, 11, 0.05)');
    grad.addColorStop(1, 'rgba(245, 158, 11, 0)');

    ctx.beginPath();
    ctx.moveTo(this.centerX, this.centerY);
    ctx.arc(this.centerX, this.centerY, this.maxRadius, this.angle - 0.35, this.angle);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Sweep Line
    ctx.beginPath();
    ctx.moveTo(this.centerX, this.centerY);
    ctx.lineTo(sweepX, sweepY);
    ctx.strokeStyle = '#ffd000';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    requestAnimationFrame(() => this.animate());
  }

  initInteractivity() {
    const mapContainer = document.getElementById('map-viewport');
    if (!mapContainer) return;

    // Track mouse coordinates
    mapContainer.addEventListener('mousemove', (e) => {
      const rect = mapContainer.getBoundingClientRect();
      const x = Math.floor(e.clientX - rect.left);
      const y = Math.floor(e.clientY - rect.top);
      const lat = (35.6762 + (y * 0.00015)).toFixed(4);
      const lng = (139.6503 + (x * 0.00015)).toFixed(4);

      if (this.coordsDisplay) {
        this.coordsDisplay.textContent = `X:${x.toString().padStart(4, '0')} | Y:${y.toString().padStart(4, '0')} | [${lat}°N, ${lng}°E]`;
      }
    });

    // Sector hotpoints
    const hotpoints = document.querySelectorAll('.map-sector-node');
    hotpoints.forEach(node => {
      node.addEventListener('mouseenter', () => {
        if (window.cyberAudio) window.cyberAudio.playHover();
      });

      node.addEventListener('click', () => {
        const sectorKey = node.getAttribute('data-sector');
        this.selectSector(sectorKey, node);
      });
    });
  }

  selectSector(key, activeNode) {
    if (window.cyberAudio) window.cyberAudio.playRadarPing();
    
    document.querySelectorAll('.map-sector-node').forEach(n => n.classList.remove('active'));
    if (activeNode) activeNode.classList.add('active');

    const data = this.sectors[key] || this.sectors.s07;

    if (this.sectorTitle) {
      this.sectorTitle.textContent = data.name;
    }
    if (this.sectorDesc) {
      this.sectorDesc.textContent = data.desc;
    }
    if (this.threatBadge) {
      this.threatBadge.textContent = data.threat;
      this.threatBadge.className = `tactical-badge ${data.threatClass}`;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.tacticalMap = new TacticalMap();
});
