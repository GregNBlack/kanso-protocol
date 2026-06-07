import { TestBed } from '@angular/core/testing';
import { KpSliderComponent } from './slider.component';

describe('KpSliderComponent', () => {
  function setup(extra: Record<string, unknown> = {}) {
    TestBed.configureTestingModule({ imports: [KpSliderComponent] });
    const fix = TestBed.createComponent(KpSliderComponent);
    for (const [k, v] of Object.entries(extra)) fix.componentRef.setInput(k, v);
    fix.detectChanges();
    return { fix, host: fix.nativeElement as HTMLElement, cmp: fix.componentInstance };
  }

  const thumbs = (host: HTMLElement) =>
    Array.from(host.querySelectorAll<HTMLButtonElement>('.kp-sl__thumb'));

  it('renders one thumb in single mode', () => {
    expect(thumbs(setup().host).length).toBe(1);
  });

  it('renders two thumbs in range mode', () => {
    expect(thumbs(setup({ mode: 'range' }).host).length).toBe(2);
  });

  it('thumb gets role=slider and aria-valuemin/max/now', () => {
    const { host, cmp } = setup({ min: 0, max: 50 });
    cmp.value0 = 20;
    const t = thumbs(host)[0];
    expect(t.getAttribute('role')).toBe('slider');
    expect(t.getAttribute('aria-valuemin')).toBe('0');
    expect(t.getAttribute('aria-valuemax')).toBe('50');
  });

  it('writeValue (number) snaps to step and updates value0', () => {
    const { cmp } = setup({ step: 5 });
    cmp.writeValue(43);
    expect(cmp.value0).toBe(45);
  });

  it('writeValue (tuple) sorts endpoints into value0 / value1', () => {
    const { cmp } = setup({ mode: 'range' });
    cmp.writeValue([90, 10]);
    expect(cmp.value0).toBe(10);
    expect(cmp.value1).toBe(90);
  });

  it('pct() returns clamped 0..100 percentage', () => {
    const { cmp } = setup({ min: 0, max: 200 });
    expect(cmp.pct(50)).toBe(25);
    expect(cmp.pct(-50)).toBe(0);
    expect(cmp.pct(500)).toBe(100);
  });

  it('ArrowRight/Up advances by step; Shift multiplies by 10', () => {
    const { cmp } = setup({ step: 1 });
    cmp.value0 = 10;
    const change = vi.fn();
    cmp.valueChange.subscribe(change);
    cmp.onKeyDown(new KeyboardEvent('keydown', { key: 'ArrowRight' }), 0);
    expect(cmp.value0).toBe(11);
    cmp.onKeyDown(new KeyboardEvent('keydown', { key: 'ArrowUp', shiftKey: true }), 0);
    expect(cmp.value0).toBe(21);
    expect(change).toHaveBeenCalled();
  });

  it('Home / End jump to min / max', () => {
    const { cmp } = setup({ min: 5, max: 95 });
    cmp.onKeyDown(new KeyboardEvent('keydown', { key: 'End' }), 0);
    expect(cmp.value0).toBe(95);
    cmp.onKeyDown(new KeyboardEvent('keydown', { key: 'Home' }), 0);
    expect(cmp.value0).toBe(5);
  });

  it('range mode: value0 cannot exceed value1 and vice versa', () => {
    const { cmp } = setup({ mode: 'range', min: 0, max: 100 });
    cmp.writeValue([20, 60]);
    cmp.onKeyDown(new KeyboardEvent('keydown', { key: 'End' }), 0);
    expect(cmp.value0).toBe(60); // pinned at value1
    cmp.onKeyDown(new KeyboardEvent('keydown', { key: 'Home' }), 1);
    expect(cmp.value1).toBe(60); // pinned at value0
  });

  it('disabled blocks keyboard input', () => {
    const { cmp } = setup({ disabled: true });
    cmp.value0 = 10;
    cmp.onKeyDown(new KeyboardEvent('keydown', { key: 'ArrowRight' }), 0);
    expect(cmp.value0).toBe(10);
  });

  it('setDisabledState propagates the disabled host class', () => {
    const { fix, host, cmp } = setup();
    cmp.setDisabledState(true);
    fix.detectChanges();
    expect(host.classList.contains('kp-sl--disabled')).toBe(true);
  });

  it('formatValue uses custom formatter when provided', () => {
    const { cmp } = setup({ valueFormatter: (v: number) => `${v}%` });
    expect(cmp.formatValue(42)).toBe('42%');
  });

  it('fillLeft + fillWidth track the current value(s)', () => {
    const { cmp } = setup({ min: 0, max: 100 });
    cmp.writeValue(40);
    expect(cmp.fillLeft).toBe(0);
    expect(cmp.fillWidth).toBe(40);
    cmp.mode = 'range';
    cmp.writeValue([20, 80]);
    expect(cmp.fillLeft).toBe(20);
    expect(cmp.fillWidth).toBe(60);
  });

  it('hostClasses includes size + mode', () => {
    const { host } = setup({ size: 'lg', mode: 'range' });
    expect(host.classList.contains('kp-sl--lg')).toBe(true);
    expect(host.classList.contains('kp-sl--range')).toBe(true);
  });

  it('value getter returns plain number in single mode and tuple in range mode', () => {
    const { cmp } = setup({ mode: 'single' });
    cmp.writeValue(33);
    expect(cmp.value).toBe(33);
    cmp.mode = 'range';
    cmp.writeValue([10, 50]);
    expect(cmp.value).toEqual([10, 50]);
  });
});
