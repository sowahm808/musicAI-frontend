import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-band-control',
  imports: [NgFor, FormsModule],
  template: `
  <div class="panel">
    <h3>Band</h3>
    <div class="chips">
      <span class="chip" *ngFor="let i of instruments">
        {{i}} <button (click)="remove.emit(i)">×</button>
      </span>
    </div>
    <form (submit)="onAdd($event)">
      <input placeholder="Add instrument (e.g., bass)" [(ngModel)]="name" name="inst">
      <button type="submit">Add</button>
    </form>
  </div>
  `,
  styles: [`
    .panel{border:1px solid #e5e7eb;padding:.75rem;border-radius:.5rem;min-width:260px}
    .chips{display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:.5rem}
    .chip{border:1px solid #e5e7eb;padding:.25rem .5rem;border-radius:1rem}
    input{padding:.4rem;border:1px solid #e5e7eb;border-radius:.25rem;margin-right:.5rem}
    button{padding:.4rem .7rem;border:1px solid #e5e7eb;border-radius:.25rem;background:#fff;cursor:pointer}
  `]
})
export class BandControlComponent {
  @Input({ required: true }) instruments!: string[];
  @Output() add = new EventEmitter<string>();
  @Output() remove = new EventEmitter<string>();
  name = '';

  onAdd(e: Event) {
    e.preventDefault();
    const v = (this.name || '').trim().toLowerCase();
    if (v) this.add.emit(v);
    this.name = '';
  }
}
