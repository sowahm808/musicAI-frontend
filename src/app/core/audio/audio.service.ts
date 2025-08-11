import { Injectable } from '@angular/core';
import { SessionStore } from '../state/session.store';

@Injectable({ providedIn: 'root' })
export class AudioService {
  private ctx?: AudioContext;
  private analyser?: AnalyserNode;
  private mic?: MediaStreamAudioSourceNode;
  private rafId?: number;
  private onsetAr: number[] = [];
  private started = false;

  constructor(private session: SessionStore) {}

  async initMic() {
    if (this.ctx) return;
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
      this.onsetAr.push(rms);
      if (this.onsetAr.length > 6) this.onsetAr.shift();

      if (!this.started && this.onsetAr.length === 6) {
        const avg = (this.onsetAr[0]+this.onsetAr[1]+this.onsetAr[2]+this.onsetAr[3]+this.onsetAr[4]) / 5;
        const rising = this.onsetAr[5] > Math.max(0.08, avg * 2.8);
        if (rising) {
          this.started = true;
          // Trigger band start
          this.onOnset();
        }
      }

      this.rafId = requestAnimationFrame(tick);
    };
    tick();
  }

  private onOnset() {
    // Let the orchestrator (BandEngineService) decide FULL vs REHEARSAL later.
    // For now: start default tempo/key.
    if (!this.session.tempo()) this.session.setTempo(92);
  }

  stop() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.started = false;
    this.session.setMode('IDLE');
    try { this.ctx?.close(); } catch {}
    this.ctx = undefined;
  }
}
