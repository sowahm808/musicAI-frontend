import { Component, OnInit, inject } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-library',
  imports: [NgIf, NgFor],
  template: `
  <section class="page">
    <h2>Library</h2>
    <ng-container *ngIf="charts.length; else empty">
      <ol>
        <li *ngFor="let c of charts; index as i">
          {{ c.name }} ({{ c.chords.length }} chords)
          <button (click)="load(i)">Load</button>
          <button (click)="remove(i)">Delete</button>
        </li>
      </ol>
    </ng-container>
    <ng-template #empty>
      <p>No saved charts yet.</p>
    </ng-template>
  </section>
  `,
  styles: [`.page{max-width:960px;margin:1rem auto;padding:1rem}`],
})
export class LibraryPage implements OnInit {
  private router = inject(Router);
  charts: { name: string; chords: string[] }[] = [];

  ngOnInit() {
    const saved = localStorage.getItem('charts');
    if (saved) {
      try {
        this.charts = JSON.parse(saved);
      } catch {
        this.charts = [];
      }
    }
  }

  load(i: number) {
    const chart = this.charts[i];
    localStorage.setItem('lastChart', JSON.stringify(chart.chords));
    this.router.navigate(['/stage']);
  }

  remove(i: number) {
    this.charts.splice(i, 1);
    localStorage.setItem('charts', JSON.stringify(this.charts));
  }
}

