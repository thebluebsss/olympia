class SoundManager {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private getContext(): AudioContext | null {
    if (!this.enabled) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    delay: number = 0,
    gainVal: number = 0.12
  ) {
    const ctx = this.getContext();
    if (!ctx) return;

    const startTime = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.exponentialRampToValueAtTime(gainVal, startTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);
  }

  public playTick(urgent: boolean = false) {
    this.playTone(urgent ? 880 : 660, 0.07, 'triangle', 0, urgent ? 0.14 : 0.08);
  }

  public playBuzzer() {
    this.playTone(987.77, 0.12, 'sawtooth', 0, 0.16);
    this.playTone(1318.51, 0.25, 'triangle', 0.08, 0.18);
  }

  public playCorrect() {
    this.playTone(523.25, 0.12, 'triangle', 0, 0.15); // C5
    this.playTone(659.25, 0.12, 'triangle', 0.1, 0.15); // E5
    this.playTone(783.99, 0.14, 'triangle', 0.2, 0.15); // G5
    this.playTone(1046.5, 0.35, 'triangle', 0.3, 0.18); // C6
  }

  public playWrong() {
    this.playTone(246.94, 0.18, 'sawtooth', 0, 0.14); // B3
    this.playTone(185.0, 0.35, 'sawtooth', 0.15, 0.14); // F#3
  }

  public playStarOfHope() {
    const notes = [587.33, 739.99, 880, 1174.66, 1479.98];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.18, 'sine', idx * 0.07, 0.14);
    });
  }

  public playRoundStart() {
    this.playTone(440, 0.14, 'triangle', 0, 0.14);
    this.playTone(554.37, 0.14, 'triangle', 0.12, 0.14);
    this.playTone(659.25, 0.14, 'triangle', 0.24, 0.14);
    this.playTone(880, 0.45, 'triangle', 0.36, 0.18);
  }

  public playVictoryFanfare() {
    const chord = [
      { f: 523.25, d: 0.15, t: 0 },
      { f: 523.25, d: 0.15, t: 0.16 },
      { f: 523.25, d: 0.15, t: 0.32 },
      { f: 659.25, d: 0.35, t: 0.48 },
      { f: 783.99, d: 0.35, t: 0.85 },
      { f: 1046.5, d: 0.7, t: 1.22 },
    ];
    chord.forEach((n) => this.playTone(n.f, n.d, 'triangle', n.t, 0.18));
  }
}

export const soundFX = new SoundManager();
