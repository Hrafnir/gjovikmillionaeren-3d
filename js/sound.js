// Procedural Web Audio API Sound Effects for Gjøvikmillionæren 3D

class SoundManager {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  playTone(freq, type = 'sine', duration = 0.15, vol = 0.15, delay = 0) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(vol, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  click() {
    this.playTone(580, 'triangle', 0.06, 0.1);
  }

  diceRoll() {
    if (!this.enabled) return;
    this.init();
    for (let i = 0; i < 8; i++) {
      const freq = 220 + Math.random() * 480;
      this.playTone(freq, 'triangle', 0.05, 0.12, i * 0.065);
    }
  }

  step() {
    this.playTone(320 + Math.random() * 90, 'sine', 0.08, 0.14);
  }

  cash() {
    // Classic cha-ching!
    this.playTone(987.77, 'sine', 0.12, 0.18, 0);     // B5
    this.playTone(1318.51, 'sine', 0.32, 0.22, 0.09); // E6
  }

  payRent() {
    this.playTone(392, 'sawtooth', 0.16, 0.12, 0);
    this.playTone(311.13, 'sawtooth', 0.28, 0.14, 0.14);
  }

  build() {
    // Hammer / construction chord
    this.playTone(440, 'triangle', 0.12, 0.16, 0);
    this.playTone(554.37, 'triangle', 0.12, 0.16, 0.08);
    this.playTone(659.25, 'triangle', 0.25, 0.2, 0.16);
  }

  whistle() {
    // Skibladner steam whistle chord!
    if (!this.enabled) return;
    this.init();
    this.playTone(293.66, 'sawtooth', 0.65, 0.08, 0);
    this.playTone(369.99, 'triangle', 0.65, 0.1, 0);
    this.playTone(440.0, 'sine', 0.7, 0.12, 0);
  }

  jailSiren() {
    if (!this.enabled) return;
    this.init();
    for (let i = 0; i < 4; i++) {
      this.playTone(i % 2 === 0 ? 620 : 440, 'sawtooth', 0.22, 0.14, i * 0.22);
    }
  }

  fanfare() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      this.playTone(n, 'triangle', 0.28, 0.2, idx * 0.11);
    });
  }
}

export const sound = new SoundManager();
