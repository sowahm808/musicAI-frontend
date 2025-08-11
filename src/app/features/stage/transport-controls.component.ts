import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-transport-controls',
  template: `
    <div class="panel">
      <h3>Transport</h3>
      <div class="row">
        <button (click)="start.emit()">Start</button>
        <button (click)="stop.emit()">Stop</button>
      </div>
    </div>
  `,
  styles: [`
    .panel{border:1px solid #e5e7eb;padding:.75rem;border-radius:.5rem}
    .row{display:flex;gap:.5rem}
    button{padding:.5rem .9rem;border:1px solid #e5e7eb;border-radius:.25rem;background:#fff;cursor:pointer}
  `]
})
export class TransportControlsComponent {
  @Output() start = new EventEmitter<void>();
  @Output() stop = new EventEmitter<void>();
}
