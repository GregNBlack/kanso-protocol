import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KpThemeToggleComponent } from './theme-toggle.component';

describe('KpThemeToggleComponent', () => {
  let fixture: ComponentFixture<KpThemeToggleComponent>;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [KpThemeToggleComponent] }).compileComponents();
    fixture = TestBed.createComponent(KpThemeToggleComponent);
    host = fixture.nativeElement as HTMLElement;
    fixture.componentRef.setInput('variant', 'segmented');
    fixture.componentRef.setInput('currentTheme', 'light');
    fixture.detectChanges();
  });

  const getInputs = () =>
    Array.from(host.querySelectorAll<HTMLInputElement>('input[type="radio"]'));

  it('segmented variant renders three native radios', () => {
    expect(getInputs().length).toBe(3);
  });

  it('all radios share the same name', () => {
    const inputs = getInputs();
    expect(inputs[0].name).toBe(inputs[1].name);
    expect(inputs[1].name).toBe(inputs[2].name);
  });

  it('current theme reflects as input.checked', () => {
    const inputs = getInputs();
    expect(inputs[0].checked).toBe(true);
    expect(inputs[1].checked).toBe(false);
  });

  it('changing radio emits themeChange with the new value', () => {
    const spy = vi.fn();
    fixture.componentInstance.themeChange.subscribe(spy);
    const inputs = getInputs();
    inputs[1].checked = true;
    inputs[1].dispatchEvent(new Event('change', { bubbles: true }));
    expect(spy).toHaveBeenCalledWith('dark');
  });

  it('segments has role=radiogroup', () => {
    expect(host.querySelector('.kp-theme-toggle__segments')?.getAttribute('role')).toBe('radiogroup');
  });

  it('icon variant renders a single cycling button (no radios)', () => {
    fixture.componentRef.setInput('variant', 'icon');
    fixture.detectChanges();
    expect(host.querySelectorAll('input[type="radio"]').length).toBe(0);
    expect(host.querySelector('button.kp-theme-toggle__icon-btn')).toBeTruthy();
  });
});
