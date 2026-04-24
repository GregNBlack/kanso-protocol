import { TestBed } from '@angular/core/testing';
import { KpDatePickerComponent } from './datepicker.component';

describe('KpDatePickerComponent', () => {
  function setup(extra: Record<string, unknown> = {}) {
    TestBed.configureTestingModule({ imports: [KpDatePickerComponent] });
    const fix = TestBed.createComponent(KpDatePickerComponent);
    for (const [k, v] of Object.entries(extra)) fix.componentRef.setInput(k, v);
    fix.detectChanges();
    return { fix, host: fix.nativeElement as HTMLElement, cmp: fix.componentInstance };
  }

  afterEach(() => {
    document.querySelectorAll('.kp-dp__panel').forEach((el) => el.remove());
  });

  const trigger = (host: HTMLElement) => host.querySelector('.kp-dp__trigger') as HTMLButtonElement;

  it('shows placeholder when no value is set', () => {
    const { host } = setup({ placeholder: 'Choose a day' });
    expect(trigger(host).textContent).toContain('Choose a day');
  });

  it('toggle() opens and closes the panel and emits openChange', () => {
    const { fix, cmp } = setup();
    const open = vi.fn();
    cmp.openChange.subscribe(open);
    cmp.toggle();
    fix.detectChanges();
    expect(cmp.isOpen).toBe(true);
    expect(open).toHaveBeenCalledWith(true);
    cmp.toggle();
    expect(cmp.isOpen).toBe(false);
    expect(open).toHaveBeenLastCalledWith(false);
  });

  it('writeValue (single Date) formats the trigger label', () => {
    const { fix, host, cmp } = setup();
    cmp.writeValue(new Date(2025, 5, 14)); // June 14, 2025
    fix.detectChanges();
    expect(trigger(host).textContent).toContain('Jun 14, 2025');
  });

  it('writeValue (range) renders both endpoints with the separator', () => {
    const { fix, host, cmp } = setup({ mode: 'range' });
    cmp.writeValue([new Date(2025, 0, 5), new Date(2025, 0, 9)]);
    fix.detectChanges();
    expect(trigger(host).textContent).toContain('Jan 5, 2025');
    expect(trigger(host).textContent).toContain('Jan 9, 2025');
    expect(trigger(host).textContent).toContain(' – ');
  });

  it('dayCells always produces a 42-cell (6×7) grid', () => {
    const { cmp } = setup();
    expect(cmp.dayCells.length).toBe(42);
  });

  it('pickDay (single) sets value, closes, and fires valueChange + onChange', () => {
    const { fix, cmp } = setup();
    cmp.toggle();
    fix.detectChanges();
    const value = vi.fn();
    const change = vi.fn();
    cmp.valueChange.subscribe(value);
    cmp.registerOnChange(change);
    const target = new Date(2024, 11, 25);
    cmp.pickDay(target);
    expect(value).toHaveBeenCalledWith(target);
    expect(change).toHaveBeenCalledWith(target);
    expect(cmp.isOpen).toBe(false);
  });

  it('pickDay (range) takes two clicks and emits the tuple in order', () => {
    const { fix, cmp } = setup({ mode: 'range' });
    cmp.toggle();
    fix.detectChanges();
    const value = vi.fn();
    cmp.valueChange.subscribe(value);
    const a = new Date(2025, 2, 10);
    const b = new Date(2025, 2, 14);
    cmp.pickDay(a);
    cmp.pickDay(b);
    expect(value).toHaveBeenLastCalledWith([a, b]);
    expect(cmp.isOpen).toBe(false);
  });

  it('pickDay (range) reorders endpoints if user picks the second day before the first', () => {
    const { fix, cmp } = setup({ mode: 'range' });
    cmp.toggle();
    fix.detectChanges();
    const value = vi.fn();
    cmp.valueChange.subscribe(value);
    cmp.pickDay(new Date(2025, 2, 20));
    cmp.pickDay(new Date(2025, 2, 10));
    expect(value).toHaveBeenLastCalledWith([new Date(2025, 2, 10), new Date(2025, 2, 20)]);
  });

  it('navigate(±1) advances viewDate by month in day view', () => {
    const { cmp } = setup();
    cmp.viewDate = new Date(2025, 5, 1);
    cmp.navigate(1);
    expect(cmp.viewDate.getMonth()).toBe(6);
    cmp.navigate(-1);
    expect(cmp.viewDate.getMonth()).toBe(5);
  });

  it('cycleView walks day → month → year → day', () => {
    const { cmp } = setup();
    expect(cmp.view).toBe('day');
    cmp.cycleView(); expect(cmp.view).toBe('month');
    cmp.cycleView(); expect(cmp.view).toBe('year');
    cmp.cycleView(); expect(cmp.view).toBe('day');
  });

  it('pickMonth jumps view to the chosen month and returns to day view', () => {
    const { cmp } = setup();
    cmp.cycleView(); // → month
    cmp.pickMonth(7); // August
    expect(cmp.viewDate.getMonth()).toBe(7);
    expect(cmp.view).toBe('day');
  });

  it('clear() resets value and emits null in single mode', () => {
    const { fix, cmp } = setup();
    cmp.writeValue(new Date(2025, 0, 1));
    fix.detectChanges();
    const value = vi.fn();
    cmp.valueChange.subscribe(value);
    cmp.clear(new MouseEvent('click'));
    expect(value).toHaveBeenCalledWith(null);
    expect(cmp.hasValue()).toBe(false);
  });

  it('min disables earlier days', () => {
    const { fix, cmp } = setup({ min: new Date(2025, 5, 10) });
    cmp.viewDate = new Date(2025, 5, 1);
    fix.detectChanges();
    const cell = cmp.dayCells.find((c) => c.date.getDate() === 5 && !c.outside);
    expect(cell?.disabled).toBe(true);
  });

  it('max disables later days', () => {
    const { fix, cmp } = setup({ max: new Date(2025, 5, 10) });
    cmp.viewDate = new Date(2025, 5, 1);
    fix.detectChanges();
    const cell = cmp.dayCells.find((c) => c.date.getDate() === 20 && !c.outside);
    expect(cell?.disabled).toBe(true);
  });

  it('setDisabledState blocks toggle', () => {
    const { cmp } = setup();
    cmp.setDisabledState(true);
    cmp.toggle();
    expect(cmp.isOpen).toBe(false);
  });

  it('Escape closes the panel', () => {
    const { fix, cmp } = setup();
    cmp.toggle();
    fix.detectChanges();
    cmp.onEscape();
    expect(cmp.isOpen).toBe(false);
  });

  it('headerLabel reflects view + viewDate', () => {
    const { cmp } = setup();
    cmp.viewDate = new Date(2025, 5, 1);
    expect(cmp.headerLabel()).toBe('June 2025');
    cmp.view = 'month';
    expect(cmp.headerLabel()).toBe('2025');
    cmp.view = 'year';
    expect(cmp.headerLabel()).toMatch(/^\d{4} – \d{4}$/);
  });
});
