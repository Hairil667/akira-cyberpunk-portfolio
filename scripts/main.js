/**
 * Main Akira Cyberpunk Portfolio Script
 */
document.addEventListener('DOMContentLoaded', () => {
  // 1. Hamburger Menu Logic
  const hamburgerBtn = document.getElementById('hamburger-toggle');
  const navDrawer = document.getElementById('cyber-nav-drawer');
  const navOverlay = document.getElementById('nav-backdrop-overlay');
  const navLinks = document.querySelectorAll('.drawer-nav-link');

  function toggleMenu(forceClose = false) {
    if (window.cyberAudio) window.cyberAudio.playClick();
    const isActive = forceClose ? false : !hamburgerBtn.classList.contains('active');

    hamburgerBtn.classList.toggle('active', isActive);
    navDrawer.classList.toggle('active', isActive);
    navOverlay.classList.toggle('active', isActive);
    hamburgerBtn.setAttribute('aria-expanded', isActive ? 'true' : 'false');
  }

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', () => toggleMenu());
  }

  if (navOverlay) {
    navOverlay.addEventListener('click', () => toggleMenu(true));
  }

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      toggleMenu(true);
    });
  });

  // 2. Audio Toggle Button
  const soundToggleBtn = document.getElementById('sound-toggle-btn');
  const soundIcon = document.getElementById('sound-toggle-icon');
  const soundText = document.getElementById('sound-toggle-text');

  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      if (window.cyberAudio) {
        const isEnabled = window.cyberAudio.toggleSound();
        if (soundText) soundText.textContent = isEnabled ? "SFX: ON" : "SFX: OFF";
        if (soundToggleBtn) {
          soundToggleBtn.classList.toggle('muted', !isEnabled);
        }
        if (isEnabled) window.cyberAudio.playClick();
      }
    });
  }

  // 3. Cyber Matrix & Gold Particle Canvas Background
  const goldCanvas = document.getElementById('gold-matrix-canvas');
  if (goldCanvas) {
    const ctx = goldCanvas.getContext('2d');
    let width = (goldCanvas.width = window.innerWidth);
    let height = (goldCanvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = goldCanvas.width = window.innerWidth;
      height = goldCanvas.height = window.innerHeight;
    });

    const particles = [];
    const numParticles = Math.min(80, Math.floor(window.innerWidth / 18));

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 1,
        alpha: Math.random() * 0.6 + 0.2,
        goldShade: Math.random() > 0.3 ? '#F59E0B' : '#FFE066'
      });
    }

    function renderGoldMatrix() {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle connective cyber grid lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(245, 158, 11, ${0.12 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // Draw particles
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.fillStyle = p.goldShade;
        ctx.globalAlpha = p.alpha;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      });
      ctx.globalAlpha = 1.0;

      requestAnimationFrame(renderGoldMatrix);
    }
    renderGoldMatrix();
  }

  // 4. Real-Time HUD Clock & Coordinates
  const hudClock = document.getElementById('hud-live-clock');
  function updateClock() {
    if (hudClock) {
      const now = new Date();
      const timeStr = now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
      hudClock.textContent = timeStr;
    }
  }
  setInterval(updateClock, 1000);
  updateClock();

  // 5. Interactive Terminal Form
  const terminalForm = document.getElementById('cyber-contact-form');
  const terminalStatus = document.getElementById('terminal-send-status');

  if (terminalForm) {
    terminalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (window.cyberAudio) window.cyberAudio.playClick();

      const sender = document.getElementById('sender-callsign').value || 'OPERATIVE';
      const msg = document.getElementById('sender-message').value;

      if (terminalStatus) {
        terminalStatus.textContent = "[TRANSMITTING ENCRYPTED BURST TO AKIRA'S NEURAL LINK...]";
        terminalStatus.className = "terminal-msg transmitting";

        setTimeout(() => {
          if (window.cyberAudio) window.cyberAudio.playRadarPing();
          terminalStatus.textContent = `[SUCCESS] DISPATCH CONFIRMED: TRANSMISSION LOGGED FROM '${sender.toUpperCase()}'. RESPONSE QUEUED.`;
          terminalStatus.className = "terminal-msg success";
          terminalForm.reset();
        }, 1200);
      }
    });
  }

  // 6. Global Sound Hover Effects on Interactive UI
  const interactiveElements = document.querySelectorAll('button, a, .tactical-card, .weapon-card, .mecha-tab-btn');
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      if (window.cyberAudio) window.cyberAudio.playHover();
    });
  });
});
