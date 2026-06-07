import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KpToggleComponent } from './toggle.component';

describe('KpToggleComponent', () => {
  let fixture: ComponentFixture<KpToggleComponent>;
  let host: HTMLElement;
  let input: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [KpToggleComponent] }).compileComponents();
    fixture = TestBed.createComponent(KpToggleComponent);
    host = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
    input = host.querySelector('input[type="checkbox"]') as HTMLInputElement;
  });

  it('renders <input type="checkbox" role="switch">', () => {
    expect(input).toBeTruthy();
    expect(input.type).toBe('checkbox');
    expect(input.getAttribute('role')).toBe('switch');
  });

  it('forwards [on] to native input.checked', () => {
    fixture.componentRef.setInput('on', true);
    fixture.detectChanges();
    expect(input.checked).toBe(true);
  });

  it('forwards [disabled] to native input', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    expect(input.disabled).toBe(true);
  });

  it('forwards required / name / value for FormData participation', () => {
    fixture.componentRef.setInput('required', true);
    fixture.componentRef.setInput('name', 'notif');
    fixture.componentRef.setInput('value', '1');
    fixture.detectChanges();
    expect(input.required).toBe(true);
    expect(input.getAttribute('name')).toBe('notif');
    expect(input.getAttribute('value')).toBe('1');
  });

  it('native change drives (onChangeEvent) and updates `on`', () => {
    const spy = vi.fn();
    fixture.componentInstance.onChangeEvent.subscribe(spy);
    input.checked = true;
    input.dispatchEvent(new Event('change', { bubbles: true }));
    expect(spy).toHaveBeenCalledWith(true);
    expect(fixture.componentInstance.on).toBe(true);
  });
});
