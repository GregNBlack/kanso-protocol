import { TestBed } from '@angular/core/testing';
import { KpTooltipComponent } from './tooltip.component';

describe('KpTooltipComponent', () => {
  function setup() {
    TestBed.configureTestingModule({ imports: [KpTooltipComponent] });
    const fix = TestBed.createComponent(KpTooltipComponent);
    return { fix, host: fix.nativeElement as HTMLElement };
  }

  it('role="tooltip" on the host', () => {
    const { fix, host } = setup();
    fix.detectChanges();
    expect(host.getAttribute('role')).toBe('tooltip');
  });

  it('renders the label text', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('label', 'Copy link');
    fix.detectChanges();
    expect(host.textContent).toContain('Copy link');
  });

  it('renders shortcut when provided', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('label', 'Save');
    fix.componentRef.setInput('shortcut', '⌘S');
    fix.detectChanges();
    expect(host.textContent).toContain('⌘S');
  });

  it('applies size class', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('size', 'sm');
    fix.detectChanges();
    expect(host.className).toContain('kp-tooltip--sm');
  });

  it('applies arrowPosition class when set', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('arrowPosition', 'bottom');
    fix.detectChanges();
    expect(host.className).toContain('kp-tooltip--arrow-bottom');
  });
});
