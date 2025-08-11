import { Routes } from '@angular/router';
import { StagePage } from './features/stage/stage.page';
import { LibraryPage } from './features/library/library.page';
import { SettingsPage } from './features/settings/settings.page';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'stage' },
  { path: 'stage', component: StagePage, title: 'LiveBand — Stage' },
  { path: 'library', component: LibraryPage, title: 'LiveBand — Library' },
  { path: 'settings', component: SettingsPage, title: 'LiveBand — Settings' },
  { path: '**', redirectTo: 'stage' },
];
