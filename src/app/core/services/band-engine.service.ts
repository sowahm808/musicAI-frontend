import { Injectable } from '@angular/core';
import * as Tone from 'tone';
import { SessionStore } from '../state/session.store';

export interface DrumPattern {
  kick: number[];
  snare: number[];
}

const DRUM_STYLE_PRESETS: Record<string, DrumPattern> = {
  pop_rock: { kick: [0], snare: [2] },
  gospel: { kick: [0, 2], snare: [1, 3] },
  jazz: { kick: [0], snare: [2] }
};

@Injectable({ providedIn: 'root' })
export class BandEngineService {
  private started = false;
  private kit?: Tone.Sampler;
  private bass?: Tone.Sampler;
  private keys?: Tone.PolySynth;
  private gtr?: Tone.PolySynth;
  private metSynth?: Tone.MembraneSynth;
  private metLoop?: Tone.Loop;
  private drum?: Tone.Part;
  private currentStyle = 'pop_rock';
  private drumOverride?: Partial<DrumPattern>;

  constructor(private session: SessionStore) {}

  async prepare() {
    if (this.started) return;
    if (Tone.context.state !== 'running') {
      // init Tone context on first user interaction
      await Tone.start();
    }

    // Simple instruments (replace with SoundFonts later)
    this.kit = new Tone.Sampler({
      urls: { C3: 'kick.wav', D3: 'snare.wav', E3: 'hihat.wav' },
      baseUrl: 'soundfonts/'
    }).toDestination();

    this.bass = new Tone.Sampler({
      urls: { C2: 'bass_C2.wav' },
      baseUrl: 'soundfonts/'
    }).toDestination();

    this.keys = new Tone.PolySynth(Tone.Synth).toDestination();
    this.gtr  = new Tone.PolySynth(Tone.Synth).toDestination();

    this.metSynth = new Tone.MembraneSynth().toDestination();
    this.metLoop = new Tone.Loop((time) => {
      this.metSynth?.triggerAttackRelease('C2', '16n', time);
    }, '4n');

    Tone.Transport.bpm.value = this.session.tempo() ?? 92;
    this.applyStyle();

    const pad = new Tone.Loop((time) => {
      const chord = this.session.chord();
      const notes = this.chordToNotes(chord);
      this.keys?.triggerAttackRelease(notes, "1m", time);
      // Transpose the chord up one octave for the guitar part.
      // `Tone.Frequency().transpose()` returns a FrequencyClass, which needs to
      // be converted back to a note string for `triggerAttackRelease`.
      const gtrNotes = notes.map(n => Tone.Frequency(n).transpose(12).toNote());
      this.gtr?.triggerAttackRelease(gtrNotes, "2n", time);
    }, "1m").start(0);

    new Tone.Loop((time) => {
      const note = this.chordRoot(this.session.chord());
      this.bass?.triggerAttackRelease(note, '1m', time);
    }, '1m').start(0);


    this.started = true;
    if (Tone.Transport.state !== 'started') Tone.Transport.start();
  }

  stop() {
    Tone.Transport.stop();
    this.started = false;
  }

  setTempo(bpm: number) { Tone.Transport.bpm.rampTo(bpm, 0.05); }

  toggleMetronome(on: boolean) {
    if (!this.metLoop) return;
    if (on) this.metLoop.start(0); else this.metLoop.stop(0);
  }

  setChord(chord: string) {
    // no action needed; pad loop reads latest chord each bar
  }

  addInstrument(name: string) {
    // Placeholder for future: load sampler/soundfont by name
    // (we’re already playing gtr/keys/drums)
  }
  removeInstrument(name: string) {
    // For MVP we won’t hard-remove; no-op here
  }

  setStyle(style: string, override?: Partial<DrumPattern>) {
    this.currentStyle = style;
    this.drumOverride = override;
    if (this.started) this.applyStyle();
  }

  overrideDrumPattern(override: Partial<DrumPattern>) {
    this.drumOverride = { ...this.drumOverride, ...override };
    if (this.started) this.applyStyle();
  }

  private applyStyle() {
    const preset = DRUM_STYLE_PRESETS[this.currentStyle] ?? DRUM_STYLE_PRESETS['pop_rock'];
    const pattern: DrumPattern = { ...preset, ...this.drumOverride };
    Tone.Transport.swing = this.currentStyle === 'jazz' ? 0.2 : 0;
    this.createDrumPart(pattern);
  }

  private createDrumPart(pattern: DrumPattern) {
    if (this.drum) {
      this.drum.stop(0);
      this.drum.dispose();
    }
    this.drum = new Tone.Part((time, step) => {
      if (!this.kit || step === null) return;
      const beat = step % 4;
      if (pattern.kick.includes(beat)) this.kit.triggerAttackRelease('C3', '8n', time);
      if (pattern.snare.includes(beat)) this.kit.triggerAttackRelease('D3', '8n', time);
      this.kit.triggerAttackRelease('E3', '16n', time + 0.0);
      this.kit.triggerAttackRelease('E3', '16n', time + Tone.Time('8n').toSeconds());
    }, [[0, 0], [1, 1], [2, 2], [3, 3]]).start(0);
    this.drum.loop = true;
    this.drum.loopEnd = '1m';
  }

  private chordToNotes(sym: string): string[] {
    // Super-minimal triads for demo
    const map: Record<string, string[]> = {
      'C': ['C4','E4','G4'], 'Am': ['A3','C4','E4'],
      'F': ['F3','A3','C4'], 'G': ['G3','B3','D4'],
      'Dm': ['D3','F3','A3'], 'Em': ['E3','G3','B3']
    };
    return map[sym] ?? ['C4','E4','G4'];
  }

  private chordRoot(sym: string): string {
    const map: Record<string, string> = {
      'C': 'C2', 'Am': 'A1', 'F': 'F1', 'G': 'G1', 'Dm': 'D1', 'Em': 'E1'
    };
    return map[sym] ?? 'C2';
  }
}
