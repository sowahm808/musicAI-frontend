import { Component, inject, signal } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { SessionStore } from '../../core/state/session.store';
import { AudioService } from '../../core/audio/audio.service';
import { BandEngineService } from '../../core/services/band-engine.service';
import { BandHUDComponent } from './hud/band-hud.component';
import { BandControlComponent } from './band-control/band-control.component';
import { TransportControlsComponent } from './transport-controls.component';
import { MicLevelComponent } from './mic-level.component';

@Component({
  standalone: true,
  selector: 'app-stage',
  imports: [NgIf, NgFor, BandHUDComponent, BandControlComponent, TransportControlsComponent, MicLevelComponent],
  template: `
  <section class="stage">
    <app-band-hud [hud]="session.hud()" />
    <app-mic-level *ngIf="session.mode() !== 'IDLE'"></app-mic-level>
    <div class="row">
      <app-band-control
        [instruments]="session.instruments()"
        (add)="onAdd($event)"
        (remove)="onRemove($event)"/>
      <app-transport-controls
        (start)="start()"
        (stop)="stop()" />
    </div>
  </section>
  `,
  styles: [`
    .stage{max-width:960px;margin:1rem auto;padding:1rem}
    .row{display:flex;gap:1rem;flex-wrap:wrap}
  `]
})
export class StagePage {
  session = inject(SessionStore);
  private audio = inject(AudioService);
  private band = inject(BandEngineService);

  async start() {
    await this.band.prepare();        // boot Tone + patterns
    await this.audio.initMic();       // ask mic permission
    this.session.setMode('REHEARSAL');// until we add known-song matching
  }
  stop() {
    this.band.stop();
    this.audio.stop();
  }
  onAdd(name: string) { this.session.addInstrument(name); this.band.addInstrument(name); }
  onRemove(name: string) { this.session.removeInstrument(name); this.band.removeInstrument(name); }
}
