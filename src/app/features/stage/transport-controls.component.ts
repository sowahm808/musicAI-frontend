import { Component, EventEmitter, Output, Input } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-transport-controls',
  imports: [NgIf],
  template: `
    <div class="panel">
      <h3>Transport</h3>
      <div class="row">
        <button (click)="start.emit()">Start</button>
        <button (click)="stop.emit()">Stop</button>
        <label class="tempo">Tempo {{tempo}}
          <input type="range" min="60" max="180" [value]="tempo"
            (input)="tempoChange.emit(+$any($event.target).value)">
        </label>
        <label><input type="checkbox" [checked]="metronome"
          (change)="metronomeChange.emit($any($event.target).checked)">Click</label>
        <button (click)="record.emit()">{{recording ? 'Stop Rec' : 'Record'}}</button>
        <audio *ngIf="recordingUrl" [src]="recordingUrl" controls></audio>
        <button (click)="save.emit()">Save Chart</button>
      </div>
    </div>
  `,
  styles: [`
    :host{display:block}
    .panel{border:1px solid #e5e7eb;padding:.75rem;border-radius:.5rem}
    .row{display:flex;gap:.5rem;align-items:center;flex-wrap:wrap}
    button{padding:.5rem .9rem;border:1px solid #e5e7eb;border-radius:.25rem;background:#fff;cursor:pointer}
    .tempo{display:flex;align-items:center;gap:.25rem}
    @media (max-width:640px){.panel{width:100%}}
  `]
})
export class TransportControlsComponent {
  @Output() start = new EventEmitter<void>();
  @Output() stop = new EventEmitter<void>();
  @Input() tempo = 92;
  @Input() metronome = false;
  @Input() recording = false;
  @Input() recordingUrl: string | null = null;
  @Output() tempoChange = new EventEmitter<number>();
  @Output() metronomeChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<void>();
  @Output() record = new EventEmitter<void>();
}
