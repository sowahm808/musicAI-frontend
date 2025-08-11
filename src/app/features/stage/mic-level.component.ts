import { Component, inject } from '@angular/core';
import { AudioService } from '../../core/audio/audio.service';

@Component({
  standalone: true,
  selector: 'app-mic-level',
  template: `
  <div class="meter">
    <div class="bar" [style.width.%]="level()*100"></div>
  </div>
  `,
  styles: [`
    .meter{height:.5rem;background:#e5e7eb;border-radius:.25rem;overflow:hidden;}
    .bar{height:100%;background:#4ade80;transition:width .1s linear;}
  `]
})
export class MicLevelComponent {
  private audio = inject(AudioService);
  level = this.audio.level;
}
