import { Injectable, signal } from '@angular/core';
import { SessionStore } from '../state/session.store';
import { BandEngineService } from '../services/band-engine.service';

@Injectable({ providedIn: 'root' })
export class AudioService {
  private ctx?: AudioContext;
  private analyser?: AnalyserNode;
  private mic?: MediaStreamAudioSourceNode;
  private rafId?: number;
  private onsetAr: number[] = [];
  private onsetTimes: number[] = [];
  private pitchHist: number[] = [];
  private started = false;

  private readonly NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

  readonly level = signal(0);

  constructor(private session: SessionStore, private band: BandEngineService) {}

  async initMic() {
    if (this.ctx) return;
    // reset analysis buffers so each session starts fresh
    this.onsetAr = [];
    this.onsetTimes = [];
    this.pitchHist = [];
    this.started = false;

    this.ctx = new AudioContext({ latencyHint: 'interactive' });
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
    });
    this.mic = this.ctx.createMediaStreamSource(stream);
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 2048;
    this.mic.connect(this.analyser);
    this.session.setMode('LISTENING');
    this.loop();
  }

  private loop() {
    if (!this.analyser) return;
    const buf = new Float32Array(this.analyser.fftSize);
    const tick = () => {
      this.analyser!.getFloatTimeDomainData(buf);
      let sum = 0;
      for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
      const rms = Math.sqrt(sum / buf.length);
      this.level.set(rms);
      this.onsetAr.push(rms);
      if (this.onsetAr.length > 6) this.onsetAr.shift();

      // pitch detection
      const freq = this.detectPitch(buf, rms);
      if (freq > 0) {
        const note = this.freqToNote(freq);
        const pc = this.noteToClass(note);
        this.pitchHist.push(pc);
        if (this.pitchHist.length > 64) this.pitchHist.shift();
        this.session.setPitch(note);
        this.updateKeyAndChord();
      }

      if (!this.started && this.onsetAr.length === 6) {
        const avg = (this.onsetAr[0]+this.onsetAr[1]+this.onsetAr[2]+this.onsetAr[3]+this.onsetAr[4]) / 5;
        const rising = this.onsetAr[5] > Math.max(0.08, avg * 2.8);
        if (rising) {
          this.started = true;
          // Trigger band start and tempo update
          this.onOnset();
        }
      }

      this.rafId = requestAnimationFrame(tick);
    };
    tick();
  }

  private onOnset() {
    const now = performance.now();
    if (this.onsetTimes.length) {
      const diff = now - this.onsetTimes[this.onsetTimes.length - 1];
      const bpm = Math.round(60000 / diff);
      this.session.setTempo(bpm);
      this.band.setTempo(bpm);
    }
    this.onsetTimes.push(now);
    if (this.onsetTimes.length > 8) this.onsetTimes.shift();
  }

  private updateKeyAndChord() {
    if (!this.pitchHist.length) return;
    const counts = new Array(12).fill(0);
    for (const pc of this.pitchHist) counts[pc]++;
    const keyIdx = counts.indexOf(Math.max(...counts));
    const key = this.NOTE_NAMES[keyIdx];
    this.session.setKey(key);

    const recent = this.pitchHist.slice(-8);
    const rc = new Array(12).fill(0);
    for (const pc of recent) rc[pc]++;
    const root = rc.indexOf(Math.max(...rc));
    if (rc[root] > 0) {
      const hasMinor = rc[(root + 3) % 12] > 0;
      const hasMajor = rc[(root + 4) % 12] > 0;
      const chord = this.NOTE_NAMES[root] + (hasMinor && !hasMajor ? 'm' : '');
      this.session.setChord(chord);
      this.band.setChord(chord);
    }
  }

  private detectPitch(buf: Float32Array, rms: number): number {
    if (!this.ctx || rms < 0.01) return 0;
    const sampleRate = this.ctx.sampleRate;
    const size = buf.length;
    const maxSamples = Math.floor(size / 2);
    let bestOffset = -1;
    let bestCorrelation = 0;
    let lastCorrelation = 1;

    for (let offset = 4; offset < maxSamples; offset++) {
      let correlation = 0;
      for (let i = 0; i < maxSamples; i++) {
        correlation += Math.abs(buf[i] - buf[i + offset]);
      }
      correlation = 1 - (correlation / maxSamples);
      if (correlation > 0.9 && correlation > lastCorrelation) {
        bestCorrelation = correlation;
        bestOffset = offset;
      } else if (bestCorrelation > 0 && correlation < bestCorrelation) {
        const shift = (correlation - lastCorrelation) / bestCorrelation;
        return sampleRate / (bestOffset + 8 * shift);
      }
      lastCorrelation = correlation;
    }

    if (bestCorrelation > 0.92) {
      return sampleRate / bestOffset;
    }
    return 0;
  }

  private freqToNote(freq: number): string {
    const A4 = 440;
    const n = Math.round(12 * Math.log2(freq / A4)) + 69;
    const name = this.NOTE_NAMES[n % 12];
    const octave = Math.floor(n / 12) - 1;
    return `${name}${octave}`;
  }

  private noteToClass(note: string): number {
    const name = note.replace(/\d/g, '');
    return this.NOTE_NAMES.indexOf(name);
  }

  stop() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.started = false;
    this.onsetAr = [];
    this.onsetTimes = [];
    this.pitchHist = [];
    this.session.setPitch(null);
    this.session.setKey(null);
    this.session.setMode('IDLE');
    try { this.ctx?.close(); } catch {}
    this.ctx = undefined;
  }
}
