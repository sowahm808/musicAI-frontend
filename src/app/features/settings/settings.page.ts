import { Component, OnInit } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-settings',
  template: `
  <section class="page">
    <h2>Settings</h2>
    <p>
      <label>
        <input type="checkbox" [checked]="theme==='dark'" (change)="toggleTheme()" />
        Dark mode
      </label>
    </p>
  </section>
  `,
  styles: [`.page{max-width:960px;margin:1rem auto;padding:1rem}`],
})
export class SettingsPage implements OnInit {
  theme: 'light' | 'dark' = 'light';

  ngOnInit() {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      this.theme = 'dark';
      document.documentElement.classList.add('dark');
    }
  }

  toggleTheme() {
    if (this.theme === 'light') {
      this.theme = 'dark';
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      this.theme = 'light';
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }
}

