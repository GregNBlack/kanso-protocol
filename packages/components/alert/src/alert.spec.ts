import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KpAlertComponent } from './alert.component';

describe('KpAlertComponent', () => {
  let fixture: ComponentFixture<KpAlertComponent>;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [KpAlertComponent] }).compileComponents();
    fixture = TestBed.createComponent(KpAlertComponent);
    host = fixture.nativeElement as HTMLElement;
  });

  it('applies size, appearance, color classes to the host', () => {
    fixture.componentRef.setInput('size', 'sm');
    fixture.componentRef.setInput('appearance', 'solid');
    fixture.componentRef.setInput('color', 'danger');
    fixture.detectChanges();
    expect(host.className).toContain('kp-alert--sm');
    expect(host.className).toContain('kp-alert--solid');
    expect(host.className).toContain('kp-alert--danger');
  });

  it('renders title and description text when provided', () => {
    fixture.componentRef.setInput('title', 'Update available');
    fixture.componentRef.setInput('description', 'A new version shipped today.');
    fixture.detectChanges();
    expect(host.textContent).toContain('Update available');
    expect(host.textContent).toContain('A new version shipped today.');
  });

  it('renders the close button when closable=true and emits (close) on click', () => {
    fixture.componentRef.setInput('closable', true);
    fixture.detectChanges();
    const btn = host.querySelector('button[aria-label="Close"]') as HTMLButtonElement;
    expect(btn).not.toBeNull();
    const spy = vi.fn();
    fixture.componentInstance.close.subscribe(spy);
    btn.click();
    expect(spy).toHaveBeenCalled();
  });

  it('does not render the close button by default', () => {
    fixture.detectChanges();
    expect(host.querySelector('button[aria-label="Close"]')).toBeNull();
  });
});
