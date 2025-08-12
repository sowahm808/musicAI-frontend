import { Component, OnInit, inject } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-library',
  imports: [NgIf, NgFor],
  template: `
  <section class="page">
    <h2 class="text-2xl font-semibold mb-4">Library</h2>
    <ng-container *ngIf="charts.length; else empty">
      <ol class="space-y-2">
        <li *ngFor="let c of charts; index as i" class="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-2 rounded">
          <div>
            <span class="font-medium">{{ c.name }}</span>
            <span class="text-sm text-gray-500 ml-2">({{ c.chords.length }} chords)</span>
          </div>
          <div class="space-x-2">
            <button (click)="load(i)" class="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">Load</button>
            <button (click)="remove(i)" class="px-2 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600">Delete</button>
          </div>
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

