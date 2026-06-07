import { TestBed } from '@angular/core/testing';
import { KpDividerComponent } from './divider.component';

describe('KpDividerComponent', () => {
  function setup() {
    TestBed.configureTestingModule({ imports: [KpDividerComponent] });
    const fix = TestBed.createComponent(KpDividerComponent);
    return { fix, host: fix.nativeElement as HTMLElement };
  }

  it('defaults to horizontal + no label', () => {
    const { fix, host } = setup();
    fix.detectChanges();
    expect(host.className).toContain('kp-divider--horizontal');
    expect(host.querySelector('.kp-divider__label')).toBeNull();
  });

  it('renders a label when `label` prop is set', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('label', 'Or');
    fix.detectChanges();
    const lbl = host.querySelector('.kp-divider__label');
    expect(lbl?.textContent).toContain('Or');
  });

  it('applies vertical orientation class', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('orientation', 'vertical');
    fix.detectChanges();
    expect(host.className).toContain('kp-divider--vertical');
  });

  it('drops the leading line when labelPosition="start"', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('label', 'Or');
    fix.componentRef.setInput('labelPosition', 'start');
    fix.detectChanges();
    // start → label first, then line → exactly 1 line
    expect(host.querySelectorAll('.kp-divider__line').length).toBe(1);
  });

  it('renders two lines around a centered label', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('label', 'Or');
    fix.componentRef.setInput('labelPosition', 'center');
    fix.detectChanges();
    expect(host.querySelectorAll('.kp-divider__line').length).toBe(2);
  });
});
