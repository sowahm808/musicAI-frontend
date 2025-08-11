import { Injectable, effect, inject } from '@angular/core';
import { SessionStore } from '../state/session.store';
import { BandEngineService } from './band-engine.service';

interface Fingerprint {
  name: string;
  chords: string[];
  key: string;
  tempo: number;
}

const FINGERPRINTS: Fingerprint[] = [
  { name: 'Canon', chords: ['C', 'Am', 'F', 'G'], key: 'C', tempo: 92 }
];

@Injectable({ providedIn: 'root' })
export class FingerprintService {
  private session = inject(SessionStore);
  private band = inject(BandEngineService);

  private history: string[] = [];
  private matched = false;
  private readonly maxUnmatched = 8;

  constructor() {
    effect(() => {
      const mode = this.session.mode();
      if (mode === 'LISTENING') {
        this.history = [];
        this.matched = false;
      }
    });

    effect(() => {
      const mode = this.session.mode();
      const chord = this.session.chord();
      if (mode !== 'LISTENING') return;
      if (!this.history.length || this.history[this.history.length - 1] !== chord) {
        this.history.push(chord);
        if (this.history.length > this.maxUnmatched) {
          this.session.setMode('REHEARSAL');
          return;
        }
        this.checkMatch();
      }
    });
  }

  private checkMatch() {
    for (const fp of FINGERPRINTS) {
      const len = this.history.length;
      if (len > fp.chords.length) continue;
      const slice = this.history.slice(-len);
      const target = fp.chords.slice(0, len);
      const match = slice.every((c, i) => c === target[i]);
      if (match) {
        if (len === fp.chords.length) {
          this.session.setMode('FULL');
          this.session.setKey(fp.key);
          this.session.setTempo(fp.tempo);
          this.band.setTempo(fp.tempo);
          this.matched = true;
        }
        return;
      }
    }
  }
}

