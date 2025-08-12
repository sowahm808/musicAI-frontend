import { Component, inject, effect, HostListener } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { SessionStore } from '../../core/state/session.store';
import { AudioService } from '../../core/audio/audio.service';
import { BandEngineService } from '../../core/services/band-engine.service';
import { FingerprintService } from '../../core/services/fingerprint.service';
import { BandHUDComponent } from './hud/band-hud.component';
import { BandControlComponent } from './band-control/band-control.component';
import { TransportControlsComponent } from './transport-controls.component';
import { MicLevelComponent } from './mic-level.component';
import { StyleSelectorComponent } from './style-selector.component';

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
  private fp = inject(FingerprintService);
  private chart: string[] = [];

  private record = effect(() => {
    const chord = this.session.chord();
    if (this.session.mode() !== 'IDLE') {
      if (this.chart[this.chart.length - 1] !== chord) {
        this.chart.push(chord);
      }
    }
  });


  async start() {
    await this.band.prepare();        // boot Tone + patterns
    await this.audio.initMic();       // ask mic permission
    this.session.setMode('LISTENING');// wait for fingerprint match
    this.chart = [];
  }
  stop() {
    this.band.stop();
    this.audio.stop();
  }
  onTempo(bpm: number) { this.session.setTempo(bpm); this.band.setTempo(bpm); }
  onMetronome(on: boolean) { this.session.setMetronome(on); this.band.toggleMetronome(on); }
  saveChart() {
    const name = window.prompt('Chart name?') || `Chart ${new Date().toLocaleString()}`;
    const charts = JSON.parse(localStorage.getItem('charts') ?? '[]');
    charts.push({ name, chords: this.chart });
    localStorage.setItem('charts', JSON.stringify(charts));
    localStorage.setItem('lastChart', JSON.stringify(this.chart));
  }
  onAdd(name: string) { this.session.addInstrument(name); this.band.addInstrument(name); }
  onRemove(name: string) { this.session.removeInstrument(name); this.band.removeInstrument(name); }

  @HostListener('window:keydown', ['$event'])
  handleKey(e: KeyboardEvent) {
    const target = e.target as HTMLElement;
    const tag = target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || (target as any).isContentEditable) {
      return;
    }
    if (e.code === 'Space') {
      e.preventDefault();
      if (this.session.mode() === 'IDLE') {
        this.start();
      } else {
        this.stop();
      }
    } else if (e.key.toLowerCase() === 'm') {
      e.preventDefault();
      this.onMetronome(!this.session.metronome());
    } else if ((e.key.toLowerCase() === 's') && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      this.saveChart();
    }
  }

}
