import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KpCheckboxComponent } from './checkbox.component';

/**
 * Checkbox is a custom element — no nested <input>. Semantics come from
 * host attributes (`role="checkbox"`, `aria-checked`, `aria-disabled`,
 * tabindex), state toggles on click / Space.
 */
describe('KpCheckboxComponent', () => {
  let fixture: ComponentFixture<KpCheckboxComponent>;
  let component: KpCheckboxComponent;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [KpCheckboxComponent] }).compileComponents();
    fixture = TestBed.createComponent(KpCheckboxComponent);
    component = fixture.componentInstance;
    host = fixture.nativeElement as HTMLElement;
  });

  it('exposes role="checkbox" on the host', () => {
    fixture.detectChanges();
    expect(host.getAttribute('role')).toBe('checkbox');
  });

  it('applies size + color classes', () => {
    fixture.componentRef.setInput('size', 'lg');
    fixture.componentRef.setInput('color', 'danger');
    fixture.detectChanges();
    expect(host.className).toContain('kp-checkbox--lg');
    expect(host.className).toContain('kp-checkbox--danger');
  });

  it('reflects checked via aria-checked and kp-checkbox--checked class', () => {
    fixture.componentRef.setInput('checked', true);
    fixture.detectChanges();
    expect(host.getAttribute('aria-checked')).toBe('true');
    expect(host.className).toContain('kp-checkbox--checked');
  });

  it('reflects indeterminate via aria-checked="mixed"', () => {
    fixture.componentRef.setInput('indeterminate', true);
    fixture.detectChanges();
    expect(host.getAttribute('aria-checked')).toBe('mixed');
  });

  it('reflects disabled via aria-disabled + tabindex=-1', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    expect(host.getAttribute('aria-disabled')).toBe('true');
    expect(host.getAttribute('tabindex')).toBe('-1');
  });

  it('is keyboard-focusable (tabindex=0) when enabled', () => {
    fixture.detectChanges();
    expect(host.getAttribute('tabindex')).toBe('0');
  });

  it('emits (checkedChange)=true when clicked from rest', () => {
    fixture.detectChanges();
    const spy = vi.fn();
    component.checkedChange.subscribe(spy);
    host.click();
    expect(spy).toHaveBeenCalledWith(true);
  });

  it('does not toggle when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const spy = vi.fn();
    component.checkedChange.subscribe(spy);
    host.click();
    expect(spy).not.toHaveBeenCalled();
  });

  it('ControlValueAccessor: writeValue updates checked', () => {
    component.writeValue(true);
    fixture.detectChanges();
    expect(component.checked).toBe(true);
  });
});
