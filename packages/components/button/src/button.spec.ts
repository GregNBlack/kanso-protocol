import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KpButtonComponent } from './button.component';

/**
 * The button host IS the interactive element — there is no nested <button>.
 * All ARIA state is applied directly to the `<kp-button>` host via
 * [attr.aria-*] bindings; the click handler lives on the host and only
 * preventDefault()s when disabled/loading (clicks bubble otherwise).
 */
describe('KpButtonComponent', () => {
  let fixture: ComponentFixture<KpButtonComponent>;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [KpButtonComponent] }).compileComponents();
    fixture = TestBed.createComponent(KpButtonComponent);
    host = fixture.nativeElement as HTMLElement;
  });

  it('renders without errors', () => {
    expect(() => fixture.detectChanges()).not.toThrow();
    expect(host).toBeTruthy();
  });

  it('applies size + variant + color classes to the host', () => {
    const c = fixture.componentInstance;
    c.size = 'lg'; c.variant = 'outline'; c.color = 'danger';
    fixture.detectChanges();
    expect(host.className).toContain('kp-button--lg');
    expect(host.className).toContain('kp-button--outline');
    expect(host.className).toContain('kp-button--danger');
  });

  it('reflects disabled to aria-disabled and kp-button--disabled class', () => {
    fixture.componentInstance.disabled = true;
    fixture.detectChanges();
    expect(host.getAttribute('aria-disabled')).toBe('true');
    expect(host.className).toContain('kp-button--disabled');
  });

  it('reflects loading to aria-busy and kp-button--loading class', () => {
    fixture.componentInstance.loading = true;
    fixture.detectChanges();
    expect(host.getAttribute('aria-busy')).toBe('true');
    expect(host.className).toContain('kp-button--loading');
  });

  it('preventDefault on click when disabled', () => {
    fixture.componentInstance.disabled = true;
    fixture.detectChanges();
    const ev = new MouseEvent('click', { bubbles: true, cancelable: true });
    host.dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(true);
  });

  it('preventDefault on click when loading (loading ≠ disabled, but action is suppressed)', () => {
    fixture.componentInstance.loading = true;
    fixture.detectChanges();
    const ev = new MouseEvent('click', { bubbles: true, cancelable: true });
    host.dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(true);
  });

  it('lets clicks bubble in rest state', () => {
    fixture.detectChanges();
    const ev = new MouseEvent('click', { bubbles: true, cancelable: true });
    host.dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(false);
  });

  it('adds kp-button--icon-only when iconOnly=true and strips the label slot', () => {
    fixture.componentInstance.iconOnly = true;
    fixture.detectChanges();
    expect(host.className).toContain('kp-button--icon-only');
    expect(host.querySelector('.kp-button__label')).toBeNull();
  });

  it('renders the spinner while loading', () => {
    fixture.componentInstance.loading = true;
    fixture.detectChanges();
    expect(host.querySelector('.kp-button__spinner')).not.toBeNull();
  });
});
