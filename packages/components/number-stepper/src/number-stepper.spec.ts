import { TestBed } from '@angular/core/testing';
import { KpNumberStepperComponent } from './number-stepper.component';

describe('KpNumberStepperComponent', () => {
  function setup() {
    TestBed.configureTestingModule({ imports: [KpNumberStepperComponent] });
    const fix = TestBed.createComponent(KpNumberStepperComponent);
    return { fix, host: fix.nativeElement as HTMLElement };
  }

  it('renders − and + buttons plus an input', () => {
    const { fix, host } = setup();
    fix.detectChanges();
    expect(host.querySelectorAll('kp-button').length).toBeGreaterThanOrEqual(2);
    expect(host.querySelector('input')).not.toBeNull();
  });

  it('+ button increments value by step', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('step', 5);
    fix.detectChanges();
    fix.componentInstance.writeValue(10);
    fix.detectChanges();
    const incBtn = host.querySelectorAll('kp-button')[1] as HTMLButtonElement;
    incBtn.click();
    fix.detectChanges();
    expect(fix.componentInstance.value).toBe(15);
  });

  it('− button decrements value by step', () => {
    const { fix, host } = setup();
    fix.componentInstance.writeValue(10);
    fix.detectChanges();
    const decBtn = host.querySelectorAll('kp-button')[0] as HTMLButtonElement;
    decBtn.click();
    fix.detectChanges();
    expect(fix.componentInstance.value).toBe(9);
  });

  it('clamps to min and max', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('min', 0);
    fix.componentRef.setInput('max', 10);
    fix.detectChanges();
    fix.componentInstance.writeValue(10);
    fix.detectChanges();
    (host.querySelectorAll('kp-button')[1] as HTMLButtonElement).click(); // +
    fix.detectChanges();
    expect(fix.componentInstance.value).toBe(10);
    fix.componentInstance.writeValue(0);
    fix.detectChanges();
    (host.querySelectorAll('kp-button')[0] as HTMLButtonElement).click(); // −
    fix.detectChanges();
    expect(fix.componentInstance.value).toBe(0);
  });

  it('disabled blocks both buttons + the input', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('disabled', true);
    fix.detectChanges();
    host.querySelectorAll('kp-button').forEach((b) =>
      expect(b.getAttribute('aria-disabled')).toBe('true'),
    );
    expect((host.querySelector('input') as HTMLInputElement).disabled).toBe(true);
  });
});
