import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SessionStore } from '../../core/state/session.store';
import { BandEngineService } from '../../core/services/band-engine.service';

@Component({
  standalone: true,
  selector: 'app-style-selector',
  imports: [FormsModule],
  template: `
    <div class="panel">
      <h3>Style</h3>
      <select [(ngModel)]="style" (change)="onChange()">
        <option value="pop_rock">Pop/Rock</option>
        <option value="gospel">Gospel</option>
        <option value="jazz">Jazz</option>
      </select>
    </div>
  `,
  styles: [`
    :host{display:block}
    .panel{border:1px solid #e5e7eb;padding:.75rem;border-radius:.5rem;min-width:200px}
    select{padding:.4rem;border:1px solid #e5e7eb;border-radius:.25rem;width:100%}
    @media (max-width:640px){.panel{min-width:0;width:100%}}
  `]
})
export class StyleSelectorComponent {
  private session = inject(SessionStore);
  private band = inject(BandEngineService);
  style = this.session.style();

  onChange() {
    this.session.setStyle(this.style);
    this.band.setStyle(this.style);
  }
}
