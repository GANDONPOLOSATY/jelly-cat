// Web Audio API synthesizer for jelly cat sounds: squishes, purrs, meows, boings

class SoundFX {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private purrOsc: OscillatorNode | null = null;
  private purrGain: GainNode | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.purrGain) {
      this.purrGain.gain.linearRampToValueAtTime(0.0001, this.ctx?.currentTime || 0);
    }
  }

  public playSquish(intensity: number = 0.5) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const startFreq = 260 + Math.random() * 80 + intensity * 60;
      const endFreq = 110 + Math.random() * 30;

      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.12);

      const vol = Math.min(0.25, 0.08 + intensity * 0.15);
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {}
  }

  public playBoing() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(480, now + 0.18);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.35);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.36);
    } catch {}
  }

  public playMeow(pitchMultiplier: number = 1.0) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';

      const base = 480 * pitchMultiplier;
      osc.frequency.setValueAtTime(base * 0.9, now);
      osc.frequency.exponentialRampToValueAtTime(base * 1.35, now + 0.15);
      osc.frequency.exponentialRampToValueAtTime(base * 0.95, now + 0.38);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.22, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.45);
    } catch {}
  }

  public startPurr() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      if (this.purrOsc) return;

      const now = this.ctx.currentTime;
      this.purrOsc = this.ctx.createOscillator();
      this.purrGain = this.ctx.createGain();

      this.purrOsc.type = 'sawtooth';
      this.purrOsc.frequency.setValueAtTime(32, now);

      this.purrGain.gain.setValueAtTime(0.0001, now);
      this.purrGain.gain.linearRampToValueAtTime(0.08, now + 0.4);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, now);

      this.purrOsc.connect(filter);
      filter.connect(this.purrGain);
      this.purrGain.connect(this.ctx.destination);

      this.purrOsc.start(now);
    } catch {}
  }

  public stopPurr() {
    if (!this.purrGain || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      this.purrGain.gain.linearRampToValueAtTime(0.0001, now + 0.2);
      setTimeout(() => {
        if (this.purrOsc) {
          try {
            this.purrOsc.stop();
            this.purrOsc.disconnect();
          } catch {}
          this.purrOsc = null;
          this.purrGain = null;
        }
      }, 250);
    } catch {
      this.purrOsc = null;
      this.purrGain = null;
    }
  }

  public playChomp() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.08);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch {}
  }
}

export const sound = new SoundFX();
