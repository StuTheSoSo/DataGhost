import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SoundService {
  private ctx: AudioContext | null = null;
  private muted = false;

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
  }

  get isMuted(): boolean {
    return this.muted;
  }

  // ── Primitives ─────────────────────────────────────────────────────────────

  /** Oscillator tone with optional frequency sweep */
  private tone(
    freq: number,
    durationMs: number,
    volume = 0.12,
    type: OscillatorType = 'sawtooth',
    delayMs = 0,
    freqEnd?: number
  ): void {
    if (this.muted) return;
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    const t0 = ctx.currentTime + delayMs / 1000;
    const t1 = t0 + durationMs / 1000;
    osc.frequency.setValueAtTime(freq, t0);
    if (freqEnd !== undefined) {
      osc.frequency.linearRampToValueAtTime(freqEnd, t1);
    }
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(volume, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t1);
    osc.start(t0);
    osc.stop(t1);
  }

  /** Two slightly detuned oscillators — creates beating, unsettling unison */
  private detunedTone(
    freq: number,
    durationMs: number,
    volume = 0.08,
    type: OscillatorType = 'sawtooth',
    delayMs = 0,
    detuneCents = 9
  ): void {
    this.tone(freq, durationMs, volume, type, delayMs);
    this.tone(freq * Math.pow(2, detuneCents / 1200), durationMs, volume * 0.65, type, delayMs);
  }

  /** Band-pass filtered noise burst */
  private noise(durationMs: number, volume = 0.05, delayMs = 0, centerHz = 300): void {
    if (this.muted) return;
    const ctx = this.getCtx();
    const bufSize = Math.ceil(ctx.sampleRate * (durationMs / 1000));
    const buffer = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;

    const src = ctx.createBufferSource();
    src.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = centerHz;
    filter.Q.value = 0.8;

    const gain = ctx.createGain();
    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    const t0 = ctx.currentTime + delayMs / 1000;
    gain.gain.setValueAtTime(volume, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + durationMs / 1000);
    src.start(t0);
    src.stop(t0 + durationMs / 1000);
  }

  // ── Public Sound Events ────────────────────────────────────────────────────

  /** Terminal key click — keyboard-style click */
  keyClick(): void {
    this.tone(1900, 12, 0.04, 'square');
    this.tone(1400, 10, 0.03, 'square', 10);
  }

  /** Archetype card selection — subtle click */
  uiSelect(): void {
    this.tone(1600, 14, 0.04, 'square');
    this.tone(1200, 10, 0.03, 'square', 10);
  }

  /** Button confirm — soft click */
  uiConfirm(): void {
    this.tone(1500, 16, 0.05, 'square');
  }

  /** Tool started — serious machine whirr and spool-up */
  toolStart(): void {
    this.tone(160, 160, 0.08, 'sawtooth', 0, 210);
    this.noise(80, 0.03, 60, 900);
  }

  /** Tool complete — blunt completion click */
  toolComplete(): void {
    this.tone(600, 90, 0.09, 'square');
    this.tone(520, 80, 0.07, 'square', 90);
  }

  /** Stage advanced — mechanical relay click, no melody */
  stageAdvance(): void {
    this.tone(1200, 45, 0.08, 'square');
    this.tone(900, 45, 0.07, 'square', 55);
  }

  /** Mission complete — firm, low confirmation pulse */
  missionComplete(): void {
    this.tone(320, 180, 0.09, 'triangle');
    this.tone(260, 150, 0.08, 'triangle', 140);
  }

  /** Trace warning 40% — tense analogue pulse */
  traceWarning(): void {
    this.tone(260, 100, 0.12, 'square');
    this.noise(40, 0.03, 0, 400);
  }

  /** Trace critical 75% — hard alarm click pattern */
  traceCritical(): void {
    [0, 120, 240].forEach(delay => {
      this.tone(440, 80, 0.15, 'square', delay);
    });
  }

  /** Mission failed — abrupt failure buzzer */
  missionFail(): void {
    this.tone(440, 180, 0.12, 'sawtooth', 0, 320);
    this.noise(140, 0.08, 60, 1200);
  }

  /** Puzzle correct — serious system acknowledgement */
  puzzleCorrect(): void {
    this.tone(720, 80, 0.08, 'square');
    this.tone(620, 70, 0.07, 'square', 90);
  }

  /** Puzzle incorrect — sharp deny click */
  puzzleIncorrect(): void {
    this.tone(220, 90, 0.10, 'square');
    this.noise(100, 0.05, 60, 1000);
  }

  /** Connect — engineering lock-in sound */
  connect(): void {
    this.tone(180, 200, 0.08, 'sawtooth', 0, 220);
    this.noise(120, 0.04, 100, 700);
  }

  /** Disconnect — abrupt circuit drop */
  disconnect(): void {
    this.noise(80, 0.06, 0, 800);
    this.tone(220, 120, 0.09, 'square');
  }

  /** Timer tick — mechanical heartbeat count */
  timerTick(): void {
    this.tone(1000, 18, 0.06, 'square');
  }
}

