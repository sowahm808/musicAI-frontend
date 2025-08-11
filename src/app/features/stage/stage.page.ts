import { Component, inject } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { SessionStore } from '../../core/state/session.store';
import { AudioService } from '../../core/audio/audio.service';
import { BandEngineService } from '../../core/services/band-engine.service';
import { AnalysisStreamService } from '../../core/services/analysis-stream.service';
import { Subscription } from 'rxjs';
import { BandHUDComponent } from './hud/band-hud.component';
import { BandControlComponent } from './band-control/band-control.component';
import { TransportControlsComponent } from './transport-controls.component';
import { MicLevelComponent } from './mic-level.component';
import { StyleSelectorComponent } from './style-selector.component';
import { GatewayService } from '../../core/services/gateway.service';

@Component({
  standalone: true,
  selector: 'app-stage',
  imports: [NgIf, NgFor, BandHUDComponent, BandControlComponent, TransportControlsComponent, MicLevelComponent, StyleSelectorComponent],
  template: `
  <section class="stage">
    <app-band-hud [hud]="session.hud()" />
    <app-mic-level *ngIf="session.mode() !== 'IDLE'"></app-mic-level>
    <div class="row">
      <app-band-control
        [instruments]="session.instruments()"
        (add)="onAdd($event)"
        (remove)="onRemove($event)"/>
      <app-style-selector />
      <app-transport-controls
        [tempo]="session.tempo() ?? 92"
        [metronome]="session.metronome()"
        (tempoChange)="onTempo($event)"
        (metronomeChange)="onMetronome($event)"
        (start)="start()"
        (stop)="stop()"
        (save)="saveChart()" />    
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
  private analysis = inject(AnalysisStreamService);
  private gw = inject(GatewayService);


  private chordSub?: Subscription;
  private chart: string[] = [];


  async start() {
    await this.band.prepare();        // boot Tone + patterns
    await this.audio.initMic();       // ask mic permission
    this.gw.connect();                // start receiving analysis events
    this.session.setMode('LISTENING');// until first analysis flips to FULL
    this.session.setMode('REHEARSAL');// until we add known-song matching
    this.chart = [];
    this.chordSub = this.analysis.connect().subscribe(ch => {
      this.session.setChord(ch);
      this.chart.push(ch);
    });
  }
  stop() {
    this.gw.disconnect();
    this.band.stop();
    this.audio.stop();
    this.chordSub?.unsubscribe();
  }
  onTempo(bpm: number) { this.session.setTempo(bpm); this.band.setTempo(bpm); }
  onMetronome(on: boolean) { this.session.setMetronome(on); this.band.toggleMetronome(on); }
  saveChart() {
    localStorage.setItem('lastChart', JSON.stringify(this.chart));
  }
  onAdd(name: string) { this.session.addInstrument(name); this.band.addInstrument(name); }
  onRemove(name: string) { this.session.removeInstrument(name); this.band.removeInstrument(name); }

  
}
