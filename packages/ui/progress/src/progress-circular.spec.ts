import { TestBed } from '@angular/core/testing';
import { KpProgressCircularComponent } from './progress-circular.component';

describe('KpProgressCircularComponent', () => {
  function setup() {
    TestBed.configureTestingModule({ imports: [KpProgressCircularComponent] });
    const fix = TestBed.createComponent(KpProgressCircularComponent);
    return { fix, host: fix.nativeElement as HTMLElement };
  }

  it('role="progressbar" with aria-value* for determinate progress', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('value', 66);
    fix.detectChanges();
    const node = host.querySelector('[role="progressbar"]') ?? host;
    expect(node.getAttribute('aria-valuenow')).toBe('66');
    expect(node.getAttribute('aria-valuemin')).toBe('0');
    expect(node.getAttribute('aria-valuemax')).toBe('100');
  });

  it('indeterminate drops aria-valuenow', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('indeterminate', true);
    fix.detectChanges();
    const node = host.querySelector('[role="progressbar"]') ?? host;
    expect(node.getAttribute('aria-valuenow')).toBeNull();
  });

  it('showValue=true renders the numeric label', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('value', 42);
    fix.componentRef.setInput('showValue', true);
    fix.detectChanges();
    expect(host.textContent).toContain('42');
  });

  it('applies size + color classes', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('size', 'lg');
    fix.componentRef.setInput('color', 'danger');
    fix.detectChanges();
    expect(host.className).toContain('kp-progress-circular--lg');
    expect(host.className).toContain('kp-progress-circular--danger');
  });
});
