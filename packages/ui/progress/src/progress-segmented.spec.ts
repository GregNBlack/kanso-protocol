import { TestBed } from '@angular/core/testing';
import { KpProgressSegmentedComponent } from './progress-segmented.component';

describe('KpProgressSegmentedComponent', () => {
  function setup() {
    TestBed.configureTestingModule({ imports: [KpProgressSegmentedComponent] });
    const fix = TestBed.createComponent(KpProgressSegmentedComponent);
    fix.componentRef.setInput('total', 5);
    fix.componentRef.setInput('current', 2);
    fix.detectChanges();
    return { fix, host: fix.nativeElement as HTMLElement };
  }

  it('renders `total` segment elements', () => {
    const { host } = setup();
    expect(host.querySelectorAll('.kp-progress-segmented__segment').length).toBe(5);
  });

  it('marks the first `value` segments as filled', () => {
    const { host } = setup();
    const filled = host.querySelectorAll('.kp-progress-segmented__segment--complete');
    expect(filled.length).toBe(2);
  });

  it('role="progressbar" + aria-value* reflect total/value', () => {
    const { host } = setup();
    const node = host.querySelector('[role="progressbar"]') ?? host;
    expect(node.getAttribute('aria-valuenow')).toBe('2');
    expect(node.getAttribute('aria-valuemax')).toBe('5');
    expect(node.getAttribute('aria-valuemin')).toBe('1');
  });

  it('applies size + color classes', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('size', 'lg');
    fix.componentRef.setInput('color', 'success');
    fix.detectChanges();
    expect(host.className).toContain('kp-progress-segmented--lg');
    expect(host.className).toContain('kp-progress-segmented--success');
  });
});
