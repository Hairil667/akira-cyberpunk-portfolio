/**
 * APEX MOTORS // MAIN APPLICATION SCRIPT
 */
document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Drawer Navigation
  const hamburgerBtn = document.getElementById('hamburger-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const navBackdrop = document.getElementById('mobile-backdrop');
  const drawerLinks = document.querySelectorAll('.mobile-drawer-link');

  function toggleDrawer(forceClose = false) {
    if (window.carAudio) window.carAudio.playClick();
    const isOpen = forceClose ? false : !mobileDrawer.classList.contains('open');
    mobileDrawer.classList.toggle('open', isOpen);
    navBackdrop.classList.toggle('open', isOpen);
  }

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', () => toggleDrawer());
  }

  if (navBackdrop) {
    navBackdrop.addEventListener('click', () => toggleDrawer(true));
  }

  drawerLinks.forEach(link => {
    link.addEventListener('click', () => toggleDrawer(true));
  });

  // 2. Audio Toggle
  const soundBtn = document.getElementById('sound-toggle-btn');
  const soundText = document.getElementById('sound-toggle-text');

  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      if (window.carAudio) {
        const isEnabled = window.carAudio.toggleSound();
        if (soundText) soundText.textContent = isEnabled ? "SFX: ON" : "SFX: OFF";
        soundBtn.classList.toggle('active', isEnabled);
        if (isEnabled) window.carAudio.playClick();
      }
    });
  }

  // 3. Reservation / Configurator Form
  const reserveForm = document.getElementById('reserve-form');
  const reserveStatus = document.getElementById('reserve-status');

  if (reserveForm) {
    reserveForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (window.carAudio) window.carAudio.playClick();

      const name = document.getElementById('client-name').value || 'Client';
      const model = document.getElementById('selected-model').value || 'Apex GT-One';

      if (reserveStatus) {
        reserveStatus.textContent = `CONFIGURING ${model.toUpperCase()} ALLOCATION FOR ${name.toUpperCase()}...`;
        reserveStatus.className = "form-status-msg";
        reserveStatus.style.display = "block";

        setTimeout(() => {
          if (window.carAudio) window.carAudio.playEngineRev();
          reserveStatus.textContent = `ALLOCATION RESERVED: Welcome to the Apex Circle, ${name}. Our concierge will contact you shortly.`;
          reserveStatus.className = "form-status-msg success";
          reserveForm.reset();
        }, 1200);
      }
    });
  }

  // 4. Button Hover SFX
  const interactiveElements = document.querySelectorAll('button, a, .spec-strip-card, .model-card, .eng-feature-item');
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      if (window.carAudio) window.carAudio.playHover();
    });
  });
});
