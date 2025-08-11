import { Injectable } from '@angular/core';
import * as Tone from 'tone';
import { SessionStore } from '../state/session.store';

@Injectable({ providedIn: 'root' })
export class BandEngineService {
  private started = false;
  private kit?: Tone.Sampler;
  private keys?: Tone.PolySynth;
  private gtr?: Tone.PolySynth;

  constructor(private session: SessionStore) {}

  async prepare() {
    if (this.started) return;
    if (Tone.context.state !== 'running') {
      // init Tone context on first user interaction
      await Tone.start();
    }

    // Simple instruments (replace with SoundFonts later)
    this.kit = new Tone.Sampler({
      urls: { C3: "kick.wav", D3: "snare.wav", E3: "hihat.wav" },
      baseUrl: "assets/soundfonts/"
    }).toDestination();

    this.keys = new Tone.PolySynth(Tone.Synth).toDestination();
    this.gtr  = new Tone.PolySynth(Tone.Synth).toDestination();

    Tone.Transport.bpm.value = this.session.tempo() ?? 92;

    // Very basic patterns (4/4)
    const drum = new Tone.Part((time, step) => {
      if (!this.kit || step === null) return;
      const beat = step % 4;
      if (beat === 0) this.kit.triggerAttackRelease("C3", "8n", time); // kick
      if (beat === 2) this.kit.triggerAttackRelease("D3", "8n", time); // snare
      this.kit.triggerAttackRelease("E3", "16n", time + 0.0); // hats
      this.kit.triggerAttackRelease("E3", "16n", time + Tone.Time("8n").toSeconds());
    }, [[0,0],[1,1],[2,2],[3,3]]).start(0);

    drum.loop = true; drum.loopEnd = "1m";

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

    this.started = true;
    if (Tone.Transport.state !== 'started') Tone.Transport.start();
  }

  stop() {
    Tone.Transport.stop();
    this.started = false;
  }

  setTempo(bpm: number) { Tone.Transport.bpm.rampTo(bpm, 0.05); }

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

  private chordToNotes(sym: string): string[] {
    // Super-minimal triads for demo
    const map: Record<string, string[]> = {
      'C': ['C4','E4','G4'], 'Am': ['A3','C4','E4'],
      'F': ['F3','A3','C4'], 'G': ['G3','B3','D4'],
      'Dm': ['D3','F3','A3'], 'Em': ['E3','G3','B3']
    };
    return map[sym] ?? ['C4','E4','G4'];
  }
}
