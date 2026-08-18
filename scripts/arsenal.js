/**
 * Arsenal & Mecha Hangar Inspector Logic
 */
document.addEventListener('DOMContentLoaded', () => {
  // Mecha Frame Data
  const mechaData = {
    ronin: {
      title: "RX-09 RONIN [BALANCED ASSAULT]",
      image: "assets/svg/mecha-ronin.svg",
      tagline: "High-agility tactical chassis engineered with gold-composite nanoweave and dual high-frequency plasma blade mounts.",
      stats: {
        armor: 85,
        speed: 94,
        firepower: 88,
        energy: 96
      },
      specs: [
        { label: "FRAME WEIGHT", val: "42.8 TONS" },
        { label: "CORE REACTOR", val: "HYPER-GOLD QUANTUM TACHYON" },
        { label: "MAX VELOCITY", val: "480 KM/H" },
        { label: "PRIMARY WEAPON", val: "HF-09 PLASMA KATANA" }
      ]
    },
    goliath: {
      title: "TYPE-88 GOLIATH [HEAVY SIEGE]",
      image: "assets/svg/mecha-goliath.svg",
      tagline: "Super-heavy fortified siege titan equipped with quad missile silos and dual 300mm vortex particle cannons.",
      stats: {
        armor: 99,
        speed: 45,
        firepower: 98,
        energy: 92
      },
      specs: [
        { label: "FRAME WEIGHT", val: "118.5 TONS" },
        { label: "CORE REACTOR", val: "TRIPLE DEUTERIUM-GOLD CELL" },
        { label: "MAX VELOCITY", val: "160 KM/H" },
        { label: "PRIMARY WEAPON", val: "TWIN SIEGE HOWITZERS" }
      ]
    },
    valkyrie: {
      title: "VX-03 VALKYRIE [ORBITAL INTERCEPTOR]",
      image: "assets/svg/mecha-valkyrie.svg",
      tagline: "Ultra-aerodynamic stealth interceptor built for atmospheric dogfights and sub-orbital precision strikes.",
      stats: {
        armor: 62,
        speed: 100,
        firepower: 84,
        energy: 90
      },
      specs: [
        { label: "FRAME WEIGHT", val: "28.2 TONS" },
        { label: "CORE REACTOR", val: "SOLAR PLASMA CONVERTER" },
        { label: "MAX VELOCITY", val: "MACH 8.4" },
        { label: "PRIMARY WEAPON", val: "HIGH-ENERGY PLASMA LANCE" }
      ]
    }
  };

  // Mecha Switcher
  const mechaTabs = document.querySelectorAll('.mecha-tab-btn');
  const mechaImg = document.getElementById('mecha-display-img');
  const mechaTitle = document.getElementById('mecha-title-display');
  const mechaTagline = document.getElementById('mecha-tagline-display');
  const mechaSpecsList = document.getElementById('mecha-specs-list');

  const statArmor = document.getElementById('stat-bar-armor');
  const statSpeed = document.getElementById('stat-bar-speed');
  const statFirepower = document.getElementById('stat-bar-firepower');
  const statEnergy = document.getElementById('stat-bar-energy');

  const valArmor = document.getElementById('stat-val-armor');
  const valSpeed = document.getElementById('stat-val-speed');
  const valFirepower = document.getElementById('stat-val-firepower');
  const valEnergy = document.getElementById('stat-val-energy');

  function updateMecha(frameKey) {
    const data = mechaData[frameKey];
    if (!data) return;

    if (window.cyberAudio) window.cyberAudio.playClick();

    if (mechaImg) {
      mechaImg.style.opacity = '0';
      mechaImg.style.transform = 'scale(0.95)';
      setTimeout(() => {
        mechaImg.src = data.image;
        mechaImg.style.opacity = '1';
        mechaImg.style.transform = 'scale(1)';
      }, 150);
    }

    if (mechaTitle) mechaTitle.textContent = data.title;
    if (mechaTagline) mechaTagline.textContent = data.tagline;

    // Update Stats Bars
    if (statArmor) statArmor.style.width = data.stats.armor + '%';
    if (statSpeed) statSpeed.style.width = data.stats.speed + '%';
    if (statFirepower) statFirepower.style.width = data.stats.firepower + '%';
    if (statEnergy) statEnergy.style.width = data.stats.energy + '%';

    if (valArmor) valArmor.textContent = data.stats.armor + '%';
    if (valSpeed) valSpeed.textContent = data.stats.speed + '%';
    if (valFirepower) valFirepower.textContent = data.stats.firepower + '%';
    if (valEnergy) valEnergy.textContent = data.stats.energy + '%';

    // Update specs table
    if (mechaSpecsList) {
      mechaSpecsList.innerHTML = '';
      data.specs.forEach(spec => {
        const item = document.createElement('div');
        item.className = 'spec-row';
        item.innerHTML = `
          <span class="spec-label">${spec.label}</span>
          <span class="spec-value">${spec.val}</span>
        `;
        mechaSpecsList.appendChild(item);
      });
    }
  }

  mechaTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      mechaTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const frame = tab.getAttribute('data-frame');
      updateMecha(frame);
    });
  });

  // Weapon Test Fire Simulation
  const weaponFireButtons = document.querySelectorAll('.btn-test-fire');
  weaponFireButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const weaponType = btn.getAttribute('data-weapon');
      const card = btn.closest('.weapon-card');

      if (card) {
        card.classList.add('firing');
        setTimeout(() => card.classList.remove('firing'), 400);
      }

      if (window.cyberAudio) {
        if (weaponType === 'katana') {
          window.cyberAudio.playSwordSwing();
        } else if (weaponType === 'railgun') {
          window.cyberAudio.playRailgun();
        } else if (weaponType === 'smg') {
          window.cyberAudio.playSMGBurst();
        } else {
          window.cyberAudio.playClick();
        }
      }
    });
  });
});
