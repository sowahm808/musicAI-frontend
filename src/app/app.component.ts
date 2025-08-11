import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <header class="topbar">
      <h1>LiveBand AI</h1>
      <nav>
        <a routerLink="/stage">Stage</a>
        <a routerLink="/library">Library</a>
        <a routerLink="/settings">Settings</a>
      </nav>
    </header>
    <router-outlet />
  `,
  styles: [`
    .topbar{display:flex;align-items:center;justify-content:space-between;
      padding:.75rem 1rem;border-bottom:1px solid #e5e7eb}
    nav a{margin-left:1rem;text-decoration:none}
    nav a.active{font-weight:600}
    h1{margin:0;font-size:1.1rem}
  `]
})
export class AppComponent {}
