import { TestBed } from '@angular/core/testing';
import { KpTimePickerComponent } from './timepicker.component';

describe('KpTimePickerComponent', () => {
  function setup(extra: Record<string, unknown> = {}) {
    TestBed.configureTestingModule({ imports: [KpTimePickerComponent] });
    const fix = TestBed.createComponent(KpTimePickerComponent);
    for (const [k, v] of Object.entries(extra)) fix.componentRef.setInput(k, v);
    fix.detectChanges();
    return { fix, host: fix.nativeElement as HTMLElement, cmp: fix.componentInstance };
  }

  afterEach(() => {
    document.querySelectorAll('.kp-tp__panel').forEach((el) => el.remove());
  });

  const trigger = (host: HTMLElement) => host.querySelector('.kp-tp__trigger') as HTMLButtonElement;

  it('shows placeholder when no value is committed', () => {
    const { host } = setup({ placeholder: 'Pick time' });
    expect(trigger(host).textContent?.trim()).toContain('Pick time');
  });

  it('writeValue parses HH:mm and renders trigger text in 24h format', () => {
    const { fix, host, cmp } = setup({ format: '24h' });
    cmp.writeValue('09:05');
    fix.detectChanges();
    expect(trigger(host).textContent?.trim()).toContain('09:05');
  });

  it('writeValue with seconds appears when showSeconds=true', () => {
    const { fix, host, cmp } = setup({ format: '24h', showSeconds: true });
    cmp.writeValue('09:05:42');
    fix.detectChanges();
    expect(trigger(host).textContent?.trim()).toContain('09:05:42');
  });

  it('12h format renders the AM/PM suffix', () => {
    const { fix, host, cmp } = setup({ format: '12h' });
    cmp.writeValue('14:30');
    fix.detectChanges();
    expect(trigger(host).textContent?.trim()).toContain('02:30 PM');
  });

  it('toggle() opens / closes the panel and emits openChange', () => {
    const { fix, cmp } = setup();
    const open = vi.fn();
    cmp.openChange.subscribe(open);
    cmp.toggle();
    fix.detectChanges();
    expect(cmp.isOpen).toBe(true);
    expect(open).toHaveBeenCalledWith(true);
    cmp.cancel();
    expect(cmp.isOpen).toBe(false);
    expect(open).toHaveBeenLastCalledWith(false);
  });

  it('hourItems in 24h covers 0..23 in natural order', () => {
    const items = setup({ format: '24h' }).cmp.hourItems;
    expect(items[0]).toBe(0);
    expect(items[23]).toBe(23);
    expect(items.length).toBe(24);
  });

  it('hourItems in 12h starts with 12, then 1..11', () => {
    const items = setup({ format: '12h' }).cmp.hourItems;
    expect(items[0]).toBe(12);
    expect(items[1]).toBe(1);
    expect(items[11]).toBe(11);
  });

  it('minuteItems honours the configured step', () => {
    expect(setup({ minuteStep: 15 }).cmp.minuteItems).toEqual([0, 15, 30, 45]);
  });

  it('secondItems honours the configured step when showSeconds=true', () => {
    expect(setup({ showSeconds: true, secondStep: 30 }).cmp.secondItems).toEqual([0, 30]);
  });

  it('pickHour in 12h respects current period (AM stays 0..11, PM shifts +12)', () => {
    const { cmp } = setup({ format: '12h' });
    cmp.draftPeriod = 'PM';
    cmp.pickHour(3);
    expect(cmp.draftHour).toBe(15);
    cmp.draftPeriod = 'AM';
    cmp.pickHour(12);
    expect(cmp.draftHour).toBe(0);
  });

  it('pickPeriod flips the 24h hour by 12 to keep display consistent', () => {
    const { cmp } = setup({ format: '12h' });
    cmp.draftHour = 9;
    cmp.draftPeriod = 'AM';
    cmp.pickPeriod('PM');
    expect(cmp.draftHour).toBe(21);
    cmp.pickPeriod('AM');
    expect(cmp.draftHour).toBe(9);
  });

  it('apply commits draft, emits valueChange + onChange, then closes', () => {
    const { fix, cmp } = setup({ format: '24h' });
    cmp.toggle();
    fix.detectChanges();
    cmp.draftHour = 8;
    cmp.draftMinute = 30;
    const value = vi.fn();
    const change = vi.fn();
    cmp.valueChange.subscribe(value);
    cmp.registerOnChange(change);
    cmp.apply();
    expect(value).toHaveBeenCalledWith('08:30');
    expect(change).toHaveBeenCalledWith('08:30');
    expect(cmp.isOpen).toBe(false);
  });

  it('cancel closes without committing', () => {
    const { fix, cmp } = setup();
    cmp.toggle();
    fix.detectChanges();
    cmp.draftHour = 5; cmp.draftMinute = 5;
    const change = vi.fn();
    cmp.registerOnChange(change);
    cmp.cancel();
    expect(change).not.toHaveBeenCalled();
    expect(cmp.isOpen).toBe(false);
  });

  it('clear() resets committed value and emits null', () => {
    const { fix, cmp } = setup();
    cmp.writeValue('11:00');
    fix.detectChanges();
    const value = vi.fn();
    cmp.valueChange.subscribe(value);
    cmp.clear(new MouseEvent('click'));
    expect(value).toHaveBeenCalledWith(null);
    expect(cmp.hasValue()).toBe(false);
  });

  it('Escape (when open) cancels without commit', () => {
    const { fix, cmp } = setup();
    cmp.toggle();
    fix.detectChanges();
    cmp.draftHour = 23;
    const change = vi.fn();
    cmp.registerOnChange(change);
    cmp.onEscape();
    expect(change).not.toHaveBeenCalled();
    expect(cmp.isOpen).toBe(false);
  });

  it('setDisabledState blocks toggle', () => {
    const { cmp } = setup();
    cmp.setDisabledState(true);
    cmp.toggle();
    expect(cmp.isOpen).toBe(false);
  });

  it('hostClasses reflect open + size + forceState', () => {
    const { fix, host, cmp } = setup({ size: 'lg', forceState: 'error' });
    expect(host.classList.contains('kp-tp--lg')).toBe(true);
    expect(host.classList.contains('kp-tp--error')).toBe(true);
    cmp.toggle();
    fix.detectChanges();
    expect(host.classList.contains('kp-tp--open')).toBe(true);
  });
});
