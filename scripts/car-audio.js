/**
 * APEX HYPERCAR AUDIO ENGINE
 * Procedural Web Audio API Engine Synthesizer
 * Realistic V8 Twin-Turbo Engine Rumble, Throttle Rev, Turbo Whistle & Studio SFX
 */

class CarAudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.isRevving = false;
    this.initContext();
  }

  initContext() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      this.ctx = new AudioContextClass();
    }
  }

  ensureContext() {
    if (!this.ctx) this.initContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleSound() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  // 1. Supercar Engine Rev (V8 Roar + Turbo Spool)
  playEngineRev() {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx || this.isRevving) return;

    this.isRevving = true;
    try {
      const now = this.ctx.currentTime;

      // Low bass cylinder rumble
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(65, now);
      osc1.frequency.exponentialRampToValueAtTime(320, now + 0.6);
      osc1.frequency.exponentialRampToValueAtTime(140, now + 1.2);
      osc1.frequency.exponentialRampToValueAtTime(60, now + 2.0);

      gain1.gain.setValueAtTime(0.2, now);
      gain1.gain.linearRampToValueAtTime(0.35, now + 0.6);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 2.2);

      // Distort / Exhaust resonance
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(3600, now + 0.6);
      filter.frequency.exponentialRampToValueAtTime(600, now + 2.0);

      osc1.connect(filter);
      filter.connect(gain1);
      gain1.connect(this.ctx.destination);

      osc1.start(now);
      osc1.stop(now + 2.2);

      // Turbo Spool Whistle
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(800, now);
      osc2.frequency.exponentialRampToValueAtTime(4500, now + 0.7);
      osc2.frequency.exponentialRampToValueAtTime(1200, now + 1.4);

      gain2.gain.setValueAtTime(0.001, now);
      gain2.gain.linearRampToValueAtTime(0.08, now + 0.6);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);

      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now);
      osc2.stop(now + 1.6);

      setTimeout(() => {
        this.isRevving = false;
      }, 2200);
    } catch (e) {
      console.warn("Engine audio error", e);
      this.isRevving = false;
    }
  }

  // 2. Headlight LED Laser Activation
  playLightsToggle() {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(2400, now + 0.08);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {
      console.warn("Lights audio err", e);
    }
  }

  // 3. Active Aero Wing Servo Whirr
  playAeroServo() {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.linearRampToValueAtTime(540, now + 0.3);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {
      console.warn("Aero audio err", e);
    }
  }

  // 4. UI Click & Swatch Selection
  playClick() {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.exponentialRampToValueAtTime(450, now + 0.05);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {
      console.warn("Click audio err", e);
    }
  }

  playHover() {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, now);

      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.03);
    } catch (e) {
      console.warn("Hover audio err", e);
    }
  }
}

// Global instance
window.carAudio = new CarAudioEngine();
