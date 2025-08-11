import { Injectable, signal, computed } from '@angular/core';

export type Mode = 'IDLE'|'LISTENING'|'REHEARSAL'|'FULL';

@Injectable({ providedIn: 'root' })
export class SessionStore {
  readonly mode = signal<Mode>('IDLE');
  readonly key = signal<string | null>(null);
  readonly tempo = signal<number | null>(null);
  readonly chord = signal<string>('C');
  readonly pitch = signal<string | null>(null);
  readonly instruments = signal<string[]>(['guitar','keys','drums']);
  readonly style = signal<string>('pop_rock');
  readonly metronome = signal<boolean>(false);

  readonly hud = computed(() => ({
    mode: this.mode(),
    key: this.key(),
    pitch: this.pitch(),
    chord: this.chord(),
    tempo: this.tempo() ?? 92,
    metronome: this.metronome(),
    instruments: this.instruments()
  }));

  addInstrument(name: string) {
    this.instruments.update(arr => arr.includes(name) ? arr : [...arr, name]);
  }
  removeInstrument(name: string) {
    this.instruments.update(arr => arr.filter(i => i !== name));
  }
  setChord(c: string) { this.chord.set(c); }
  setKey(k: string | null) { this.key.set(k); }
  setPitch(p: string | null) { this.pitch.set(p); }
  setTempo(bpm: number | null) { this.tempo.set(bpm); }
  setMode(m: Mode) { this.mode.set(m); }
  setStyle(s: string) { this.style.set(s); }
  setMetronome(on: boolean) { this.metronome.set(on); }
}
