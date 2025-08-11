import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-library',
  imports: [NgIf, NgFor],
  template: `
  <section class="page">
    <h2>Library</h2>
    <ng-container *ngIf="chart?.length; else empty">
      <ol>
        <li *ngFor="let ch of chart">{{ ch }}</li>
      </ol>
      <button (click)="clear()">Clear Last Chart</button>
    </ng-container>
    <ng-template #empty>
      <p>No saved charts yet.</p>
    </ng-template>
  </section>
  `,
  styles: [`.page{max-width:960px;margin:1rem auto;padding:1rem}`],
})
export class LibraryPage implements OnInit {
  chart: string[] | null = null;

  ngOnInit() {
    const saved = localStorage.getItem('lastChart');
    if (saved) {
      try {
        this.chart = JSON.parse(saved);
      } catch {
        this.chart = null;
      }
    }
  }

  clear() {
    localStorage.removeItem('lastChart');
    this.chart = null;
  }
}

