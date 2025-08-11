import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { LibraryPage } from './library.page';

describe('LibraryPage', () => {
  let component: LibraryPage;
  let fixture: ComponentFixture<LibraryPage>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LibraryPage, RouterTestingModule]
    }).compileComponents();
    router = TestBed.inject(Router);
    localStorage.setItem('charts', JSON.stringify([{ name: 'Test', chords: ['C', 'G'] }]));
    fixture = TestBed.createComponent(LibraryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('loads charts from storage', () => {
    expect(component.charts.length).toBe(1);
  });

  it('load sets lastChart and navigates', () => {
    spyOn(router, 'navigate');
    component.load(0);
    expect(localStorage.getItem('lastChart')).toBe(JSON.stringify(['C', 'G']));
    expect(router.navigate).toHaveBeenCalledWith(['/stage']);
  });

  it('remove deletes chart', () => {
    component.remove(0);
    expect(component.charts.length).toBe(0);
    expect(localStorage.getItem('charts')).toBe(JSON.stringify([]));
  });
});
