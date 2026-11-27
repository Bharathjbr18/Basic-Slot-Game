interface Tone { frequency: number; duration: number; type?: OscillatorType; volume?: number; delay?: number; }

/** Tiny WebAudio synth, so the game ships without any audio files. */
export class SoundFx {
  private context?: AudioContext;
  private muted = false;

  /** Returns the new muted state. */
  toggleMute(): boolean {
    this.muted = !this.muted;
    return this.muted;
  }

  spinStart(): void { this.play({ frequency: 220, duration: 0.12, type: 'sawtooth', volume: 0.05 }); }

  reelStop(reel: number): void { this.play({ frequency: 160 + reel * 40, duration: 0.09, volume: 0.06 }); }

  win(isBig: boolean): void {
    const notes = [523, 659, 784, 1046].slice(0, isBig ? 4 : 2);
    notes.forEach((frequency, i) => this.play({ frequency, duration: 0.16, type: 'triangle', volume: 0.08, delay: i * 0.1 }));
  }

  private play({ frequency, duration, type = 'square', volume = 0.04, delay = 0 }: Tone): void {
    if (this.muted) return;
    try {
      this.context ??= new AudioContext();
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      const start = this.context.currentTime + delay;
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(volume, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      oscillator.connect(gain).connect(this.context.destination);
      oscillator.start(start);
      oscillator.stop(start + duration);
    } catch {
      // Audio is optional polish; never let it break the game.
    }
  }
}
