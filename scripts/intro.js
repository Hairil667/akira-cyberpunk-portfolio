/**
 * Cyberpunk Intro Boot & Neural Link Sequence
 */
document.addEventListener('DOMContentLoaded', () => {
  const introModal = document.getElementById('cyber-intro');
  const progressBar = document.getElementById('intro-progress-bar');
  const progressText = document.getElementById('intro-progress-text');
  const consoleLog = document.getElementById('intro-console-logs');
  const enterBtn = document.getElementById('intro-enter-btn');
  const skipBtn = document.getElementById('intro-skip-btn');

  const bootLogs = [
    "[SYS_BOOT] INITIALIZING NEURAL CYBERNETIC LINK...",
    "[SECURITY] BIOMETRIC SIGNATURE SCAN: OK",
    "[SECURITY] IDENTITY CONFIRMED: OPERATIVE 'AKIRA'",
    "[MECHA_CORE] CALIBRATING RX-09 RONIN GYROSCOPES...",
    "[ARSENAL] HF-09 PLASMA KATANA READY | APEX-9000 ARMED",
    "[SECTOR_MAP] CONNECTING TO NEO-TOKYO TACTICAL GRID...",
    "[GOLD_MATRIX] 100% QUANTUM SYNC ACHIEVED.",
    "[STATUS] SYSTEM OPERATIONAL. READY FOR CLEARANCE."
  ];

  let progress = 0;
  let logIndex = 0;

  function typeNextLog() {
    if (logIndex < bootLogs.length && consoleLog) {
      const line = document.createElement('div');
      line.className = 'intro-log-line';
      line.textContent = bootLogs[logIndex];
      consoleLog.appendChild(line);
      consoleLog.scrollTop = consoleLog.scrollHeight;
      if (window.cyberAudio) window.cyberAudio.playHover();
      logIndex++;
    }
  }

  const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 12) + 6;
    if (progress > 100) progress = 100;

    if (progressBar) progressBar.style.width = progress + '%';
    if (progressText) progressText.textContent = progress + '%';

    if (progress > logIndex * 14) {
      typeNextLog();
    }

    if (progress >= 100) {
      clearInterval(interval);
      while (logIndex < bootLogs.length) {
        typeNextLog();
      }
      if (enterBtn) {
        enterBtn.classList.remove('hidden');
        enterBtn.classList.add('ready');
      }
    }
  }, 120);

  function finishIntro() {
    if (window.cyberAudio) {
      window.cyberAudio.playBoot();
    }
    if (introModal) {
      introModal.classList.add('fade-out');
      setTimeout(() => {
        introModal.style.display = 'none';
        document.body.classList.remove('intro-active');
      }, 700);
    }
  }

  if (enterBtn) {
    enterBtn.addEventListener('click', finishIntro);
  }

  if (skipBtn) {
    skipBtn.addEventListener('click', finishIntro);
  }
});
