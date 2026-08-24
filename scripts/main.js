/**
 * JARVIS // MAIN APP CONTROLLER
 * Mobile drawer, audio toggle, form handler, HUD animations
 */
document.addEventListener('DOMContentLoaded', () => {
  // Mobile Drawer
  const hamburger = document.getElementById('hamburger-toggle');
  const drawer = document.getElementById('mobile-drawer');
  const backdrop = document.getElementById('mobile-backdrop');

  const toggleDrawer = () => {
    const isOpen = drawer.classList.toggle('open');
    backdrop.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };

  if (hamburger) hamburger.addEventListener('click', toggleDrawer);
  if (backdrop) backdrop.addEventListener('click', toggleDrawer);

  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      if (drawer.classList.contains('open')) toggleDrawer();
    });
  });

  // Audio Toggle
  const soundBtn = document.getElementById('sound-toggle-btn');
  const soundText = document.getElementById('sound-toggle-text');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      const isActive = soundBtn.classList.toggle('active');
      if (soundText) soundText.textContent = isActive ? 'SFX: ON' : 'SFX: OFF';
      if (window.carAudio) {
        window.carAudio.enabled = isActive;
        if (isActive) window.carAudio.init();
      }
    });
  }

  // Reserve Form
  const form = document.getElementById('reserve-form');
  const status = document.getElementById('reserve-status');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (status) {
        status.className = 'form-notify success';
        status.textContent = '✓ JARVIS: Allocation request transmitted. Concierge will respond within 24 hours.';
        status.style.display = 'block';
      }
      setTimeout(() => form.reset(), 1500);
    });
  }

  // Jarvis Boot Sequence Animation
  const bootScreen = document.getElementById('jarvis-boot');
  if (bootScreen) {
    const lines = bootScreen.querySelectorAll('.boot-line');
    lines.forEach((line, i) => {
      line.style.animationDelay = (i * 0.3) + 's';
    });
    setTimeout(() => {
      bootScreen.classList.add('boot-done');
    }, lines.length * 300 + 1200);
  }

  // Live Clock
  const clockEl = document.getElementById('jarvis-clock');
  if (clockEl) {
    const updateClock = () => {
      const now = new Date();
      clockEl.textContent = now.toISOString().replace('T', ' // ').substring(0, 22) + ' UTC';
    };
    updateClock();
    setInterval(updateClock, 1000);
  }
});
