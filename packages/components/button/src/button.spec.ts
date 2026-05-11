import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KpButtonComponent } from './button.component';

/**
 * Button is an attribute selector `button[kpButton]` on a real native
 * <button>. TestBed.createComponent of an attribute-selector component
 * makes a generic host element, so we test through a wrapper that
 * actually puts the directive on a real button. Signal-based fields
 * avoid Angular 21's strict CD complaining about field mutation between
 * detectChanges passes.
 */
@Component({
  standalone: true,
  imports: [KpButtonComponent],
  template: `
    <button kpButton
      [type]="type()"
      [size]="size()"
      [variant]="variant()"
      [color]="color()"
      [disabled]="disabled()"
      [loading]="loading()"
      [iconOnly]="iconOnly()">Click</button>
  `,
})
class HostComponent {
  type = signal<'button' | 'submit' | 'reset'>('button');
  size = signal<'xs' | 'sm' | 'md' | 'lg' | 'xl'>('md');
  variant = signal<'default' | 'subtle' | 'outline' | 'ghost'>('default');
  color = signal<'primary' | 'danger' | 'neutral'>('primary');
  disabled = signal(false);
  loading = signal(false);
  iconOnly = signal(false);
}

describe('KpButtonComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let btn: HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    btn = fixture.nativeElement.querySelector('button[kpButton]') as HTMLButtonElement;
  });

  it('renders a native <button>', () => {
    expect(btn.tagName).toBe('BUTTON');
  });

  it('defaults type to "button"', () => {
    expect(btn.getAttribute('type')).toBe('button');
  });

  it('forwards [type] to the native type attribute', () => {
    host.type.set('submit');
    fixture.detectChanges();
    expect(btn.getAttribute('type')).toBe('submit');
    expect(btn.type).toBe('submit');
  });

  it('applies size + variant + color classes', () => {
    host.size.set('lg');
    host.variant.set('outline');
    host.color.set('danger');
    fixture.detectChanges();
    expect(btn.className).toContain('kp-button--lg');
    expect(btn.className).toContain('kp-button--outline');
    expect(btn.className).toContain('kp-button--danger');
  });

  it('sets native disabled when [disabled]=true', () => {
    host.disabled.set(true);
    fixture.detectChanges();
    expect(btn.disabled).toBe(true);
  });

  it('sets native disabled and aria-busy when [loading]=true', () => {
    host.loading.set(true);
    fixture.detectChanges();
    expect(btn.disabled).toBe(true);
    expect(btn.className).toContain('kp-button--loading');
    expect(btn.getAttribute('aria-busy')).toBe('true');
  });

  it('disabled button does not fire click', () => {
    host.disabled.set(true);
    fixture.detectChanges();
    const handler = vi.fn();
    btn.addEventListener('click', handler);
    btn.click();
    expect(handler).not.toHaveBeenCalled();
  });

  it('rest button fires click normally', () => {
    const handler = vi.fn();
    btn.addEventListener('click', handler);
    btn.click();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('iconOnly adds kp-button--icon-only and strips the label slot', () => {
    host.iconOnly.set(true);
    fixture.detectChanges();
    expect(btn.className).toContain('kp-button--icon-only');
    expect(btn.querySelector('.kp-button__label')).toBeNull();
  });

  it('renders the spinner while loading', () => {
    host.loading.set(true);
    fixture.detectChanges();
    expect(btn.querySelector('.kp-button__spinner')).not.toBeNull();
  });
});
