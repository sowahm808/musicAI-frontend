import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TransportControlsComponent } from './transport-controls.component';

describe('TransportControlsComponent', () => {
  let component: TransportControlsComponent;
  let fixture: ComponentFixture<TransportControlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransportControlsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TransportControlsComponent);
    component = fixture.componentInstance;
  });

  it('shows download link when recordingUrl is set', () => {
    component.recordingUrl = 'blob:test';
    fixture.detectChanges();
    const link = fixture.debugElement.query(By.css('a.download'));
    expect(link).toBeTruthy();
    expect(link.nativeElement.getAttribute('href')).toBe('blob:test');
  });
});
