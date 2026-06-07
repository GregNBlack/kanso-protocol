import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KpCheckboxComponent } from './checkbox.component';

/**
 * Checkbox wraps a real native <input type="checkbox"> inside a <label>.
 * Form participation (FormData, required validation, label-association,
 * indeterminate property) is delegated to the native input; the component
 * mirrors state into host classes for CSS targeting.
 */
describe('KpCheckboxComponent', () => {
  let fixture: ComponentFixture<KpCheckboxComponent>;
  let host: HTMLElement;
  let input: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [KpCheckboxComponent] }).compileComponents();
    fixture = TestBed.createComponent(KpCheckboxComponent);
    host = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
    input = host.querySelector('input[type="checkbox"]') as HTMLInputElement;
  });

  it('renders a real <input type="checkbox"> inside a <label>', () => {
    expect(input).toBeTruthy();
    expect(input.type).toBe('checkbox');
    const label = host.querySelector('label');
    expect(label).toBeTruthy();
    expect(label!.contains(input)).toBe(true);
  });

  it('applies size + color classes on the host', () => {
    fixture.componentRef.setInput('size', 'lg');
    fixture.componentRef.setInput('color', 'danger');
    fixture.detectChanges();
    expect(host.className).toContain('kp-checkbox--lg');
    expect(host.className).toContain('kp-checkbox--danger');
  });

  it('forwards [checked] to the native input', () => {
    fixture.componentRef.setInput('checked', true);
    fixture.detectChanges();
    expect(input.checked).toBe(true);
    expect(host.className).toContain('kp-checkbox--checked');
  });

  it('forwards [indeterminate] as a DOM property', () => {
    fixture.componentRef.setInput('indeterminate', true);
    fixture.detectChanges();
    expect(input.indeterminate).toBe(true);
  });

  it('forwards [disabled] to the native input', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    expect(input.disabled).toBe(true);
  });

  it('forwards [required] / [name] / [value] for FormData participation', () => {
    fixture.componentRef.setInput('required', true);
    fixture.componentRef.setInput('name', 'agree');
    fixture.componentRef.setInput('value', 'yes');
    fixture.detectChanges();
    expect(input.required).toBe(true);
    expect(input.getAttribute('name')).toBe('agree');
    expect(input.getAttribute('value')).toBe('yes');
  });

  it('emits (checkedChange) when the native input fires change', () => {
    const spy = vi.fn();
    fixture.componentInstance.checkedChange.subscribe(spy);
    input.checked = true;
    input.dispatchEvent(new Event('change', { bubbles: true }));
    expect(spy).toHaveBeenCalledWith(true);
  });

  it('clears indeterminate when user toggles', () => {
    fixture.componentRef.setInput('indeterminate', true);
    fixture.detectChanges();
    expect(input.indeterminate).toBe(true);
    input.checked = true;
    input.dispatchEvent(new Event('change', { bubbles: true }));
    expect(fixture.componentInstance.indeterminate).toBe(false);
  });
});
