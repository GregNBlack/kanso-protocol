import { TestBed } from '@angular/core/testing';
import { KpProgressLinearComponent } from './progress-linear.component';

describe('KpProgressLinearComponent', () => {
  function setup() {
    TestBed.configureTestingModule({ imports: [KpProgressLinearComponent] });
    const fix = TestBed.createComponent(KpProgressLinearComponent);
    return { fix, host: fix.nativeElement as HTMLElement };
  }

  it('role="progressbar" with aria-value* for determinate progress', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('value', 40);
    fix.detectChanges();
    const bar = host.querySelector('[role="progressbar"]') || host;
    expect(bar.getAttribute('role') === 'progressbar' || host.getAttribute('role') === 'progressbar').toBe(true);
    const node = bar.getAttribute('role') === 'progressbar' ? bar : host;
    expect(node.getAttribute('aria-valuenow')).toBe('40');
    expect(node.getAttribute('aria-valuemin')).toBe('0');
    expect(node.getAttribute('aria-valuemax')).toBe('100');
  });

  it('does not have aria-valuenow in indeterminate mode', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('indeterminate', true);
    fix.detectChanges();
    const node = host.querySelector('[role="progressbar"]') || host;
    expect(node.getAttribute('aria-valuenow')).toBeNull();
  });

  it('clamps value to [0,100]', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('value', 150);
    fix.detectChanges();
    const node = host.querySelector('[role="progressbar"]') || host;
    expect(Number(node.getAttribute('aria-valuenow'))).toBeLessThanOrEqual(100);

    fix.componentRef.setInput('value', -10);
    fix.detectChanges();
    expect(Number(node.getAttribute('aria-valuenow'))).toBeGreaterThanOrEqual(0);
  });

  it('applies size + color classes', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('size', 'lg');
    fix.componentRef.setInput('color', 'success');
    fix.detectChanges();
    expect(host.className).toContain('kp-progress-linear--lg');
    expect(host.className).toContain('kp-progress-linear--success');
  });
});
