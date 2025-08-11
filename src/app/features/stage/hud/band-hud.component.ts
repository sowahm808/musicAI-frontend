import { Component, Input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-band-hud',
  template: `
  <div class="hud">
    <div><label>Mode</label><strong>{{hud.mode}}</strong></div>
    <div><label>Key</label><strong>{{hud.key ?? '—'}}</strong></div>
    <div><label>Pitch</label><strong>{{hud.pitch ?? '—'}}</strong></div>
    <div><label>Chord</label><strong>{{hud.chord}}</strong></div>
    <div><label>BPM</label><strong>{{hud.tempo}}</strong></div>
    <div><label>Metronome</label><strong>{{hud.metronome ? 'on' : 'off'}}</strong></div>
    <div><label>Instruments</label><strong>{{hud.instruments.join(', ')}}</strong></div>
  </div>
  `,
  styles: [`
    .hud{display:grid;grid-template-columns:repeat(7,1fr);gap:.5rem;
      padding:.75rem;border:1px solid #e5e7eb;border-radius:.5rem;background:#fafafa}
    label{display:block;font-size:.75rem;color:#6b7280}
    strong{font-size:1.1rem}
    @media (max-width:700px){.hud{grid-template-columns:1fr 1fr}}
  `]
})
export class BandHUDComponent {
  @Input({ required: true }) hud!: {
    mode: string; key: string|null; pitch: string|null; chord: string; tempo: number; metronome: boolean; instruments: string[];
  };
}
