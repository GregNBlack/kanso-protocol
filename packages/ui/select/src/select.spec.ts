import { TestBed } from '@angular/core/testing';
import { KpSelectComponent, KpSelectOption } from './select.component';

describe('KpSelectComponent', () => {
  const OPTIONS: KpSelectOption[] = [
    { value: 'apple',  label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry', disabled: true },
  ];

  // Icons + descriptions are optional per-option enrichments.
  const RICH: KpSelectOption[] = [
    { value: 'card', label: 'Card', icon: 'credit-card', description: 'Pay with a saved card' },
    { value: 'cash', label: 'Cash', icon: 'currency-dollar' },
    { value: 'later', label: 'Later', description: 'Invoice me monthly' },
  ];

  function setup(extra: Record<string, unknown> = {}) {
    TestBed.configureTestingModule({ imports: [KpSelectComponent] });
    const fix = TestBed.createComponent(KpSelectComponent);
    fix.componentRef.setInput('options', OPTIONS);
    fix.componentRef.setInput('placeholder', 'Pick a fruit');
    for (const [k, v] of Object.entries(extra)) fix.componentRef.setInput(k, v);
    fix.detectChanges();
    return { fix, host: fix.nativeElement as HTMLElement, cmp: fix.componentInstance };
  }

  afterEach(() => {
    document.querySelectorAll('.kp-select__dropdown').forEach((el) => el.remove());
  });

  const trigger = (host: HTMLElement) => host.querySelector('.kp-select__trigger') as HTMLButtonElement;
  // Dropdown is portaled to <body>.
  const opts = () => Array.from(document.querySelectorAll<HTMLElement>('.kp-select__option'));

  it('renders the trigger with placeholder when no value is set', () => {
    const { host } = setup();
    expect(trigger(host).textContent).toContain('Pick a fruit');
  });

  it('toggle() opens / closes the dropdown and emits openChange', () => {
    const { fix, cmp } = setup();
    const open = vi.fn();
    cmp.openChange.subscribe(open);
    cmp.toggle();
    fix.detectChanges();
    expect(cmp.isOpen).toBe(true);
    expect(opts().length).toBe(3);
    cmp.toggle();
    expect(cmp.isOpen).toBe(false);
    expect(open).toHaveBeenLastCalledWith(false);
  });

  it('pick() in single mode writes value, closes, and emits onChange', () => {
    const { fix, cmp } = setup();
    cmp.toggle();
    fix.detectChanges();
    const change = vi.fn();
    cmp.registerOnChange(change);
    cmp.pick(OPTIONS[1], new MouseEvent('click'));
    expect(change).toHaveBeenCalledWith('banana');
    expect(cmp.isOpen).toBe(false);
  });

  it('pick() in multi mode toggles values without closing', () => {
    const { fix, cmp } = setup({ multiple: true });
    cmp.toggle();
    fix.detectChanges();
    const change = vi.fn();
    cmp.registerOnChange(change);
    cmp.pick(OPTIONS[0], new MouseEvent('click'));
    cmp.pick(OPTIONS[1], new MouseEvent('click'));
    cmp.pick(OPTIONS[0], new MouseEvent('click')); // toggle off
    expect(change).toHaveBeenLastCalledWith(['banana']);
    expect(cmp.isOpen).toBe(true);
  });

  it('pick() ignores disabled options', () => {
    const { fix, cmp } = setup();
    cmp.toggle();
    fix.detectChanges();
    const change = vi.fn();
    cmp.registerOnChange(change);
    cmp.pick(OPTIONS[2], new MouseEvent('click'));
    expect(change).not.toHaveBeenCalled();
  });

  it('writeValue (single) updates the displayed text via the option label', () => {
    const { fix, host, cmp } = setup();
    cmp.writeValue('apple');
    fix.detectChanges();
    expect(trigger(host).textContent).toContain('Apple');
  });

  it('writeValue (multi) shows the count summary when more than one is selected', () => {
    const { fix, host, cmp } = setup({ multiple: true });
    cmp.writeValue(['apple', 'banana']);
    fix.detectChanges();
    expect(trigger(host).textContent).toContain('Selected 2');
  });

  it('clear() resets the value and emits null in single mode', () => {
    const { fix, cmp } = setup();
    cmp.writeValue('apple');
    fix.detectChanges();
    const change = vi.fn();
    cmp.registerOnChange(change);
    cmp.clear(new MouseEvent('click'));
    expect(change).toHaveBeenCalledWith(null);
    expect(cmp.hasValue()).toBe(false);
  });

  it('Escape closes the dropdown', () => {
    const { fix, cmp } = setup();
    cmp.toggle();
    fix.detectChanges();
    cmp.onEscape();
    expect(cmp.isOpen).toBe(false);
  });

  it('setDisabledState(true) makes toggle a no-op', () => {
    const { cmp } = setup();
    cmp.setDisabledState(true);
    cmp.toggle();
    expect(cmp.isOpen).toBe(false);
  });

  it('floating label only applies on lg / xl sizes', () => {
    const sm = setup({ size: 'sm', label: 'Fruit', floatingLabel: true }).cmp;
    expect(sm.showFloatingLabel()).toBe(false);
  });

  it('floating label visible on lg + label set', () => {
    const lg = setup({ size: 'lg', label: 'Fruit', floatingLabel: true });
    expect(lg.cmp.showFloatingLabel()).toBe(true);
    expect(lg.host.classList.contains('kp-select--floating')).toBe(true);
  });

  it('hostClasses reflects open and forceState', () => {
    const { fix, host, cmp } = setup({ forceState: 'error' });
    expect(host.classList.contains('kp-select--error')).toBe(true);
    cmp.toggle();
    fix.detectChanges();
    expect(host.classList.contains('kp-select--open')).toBe(true);
  });

  it('renders an Icon (kp-icon) only for options that declare one', () => {
    const { fix, cmp } = setup({ options: RICH });
    cmp.toggle();
    fix.detectChanges();
    const rows = opts();
    expect(rows[0].querySelector('kp-icon')).toBeTruthy();  // card
    expect(rows[1].querySelector('kp-icon')).toBeTruthy();  // cash
    expect(rows[2].querySelector('kp-icon')).toBeNull();    // later — no icon
  });

  it('renders the description line and associates it via aria-label', () => {
    const { fix, cmp } = setup({ options: RICH });
    cmp.toggle();
    fix.detectChanges();
    const rows = opts();
    const desc = rows[0].querySelector('.kp-select__option-description');
    expect(desc?.textContent).toContain('Pay with a saved card');
    expect(rows[0].getAttribute('aria-label')).toBe('Card, Pay with a saved card');
    expect(rows[1].querySelector('.kp-select__option-description')).toBeNull(); // cash — no description
  });

  it('plain (label-only) options render no icon or description slot', () => {
    const { fix, cmp } = setup();
    cmp.toggle();
    fix.detectChanges();
    const rows = opts();
    expect(rows.every((r) => r.querySelector('kp-icon') === null)).toBe(true);
    expect(rows.every((r) => r.querySelector('.kp-select__option-description') === null)).toBe(true);
    expect(rows.every((r) => r.getAttribute('aria-label') === null)).toBe(true);
    expect(rows[0].querySelector('.kp-select__option-label')?.textContent).toContain('Apple');
  });

  it('shows the selected option icon in the trigger (single mode)', () => {
    const { fix, host, cmp } = setup({ options: RICH });
    cmp.writeValue('card');
    fix.detectChanges();
    expect(trigger(host).querySelector('kp-icon.kp-select__value-icon')).toBeTruthy();
    // Option without an icon leaves the trigger glyph off.
    cmp.writeValue('later');
    fix.detectChanges();
    expect(trigger(host).querySelector('kp-icon.kp-select__value-icon')).toBeNull();
  });

  it('renders a hidden form-mirror <input> alongside the trigger', () => {
    const { host } = setup({ name: 'fruit', required: true });
    const mirror = host.querySelector('input.kp-select__form-mirror') as HTMLInputElement;
    expect(mirror).toBeTruthy();
    expect(mirror.getAttribute('name')).toBe('fruit');
    expect(mirror.required).toBe(true);
  });

  it('form-mirror value tracks single-mode selection', () => {
    const { fix, host, cmp } = setup({ name: 'fruit' });
    cmp.writeValue('apple');
    fix.detectChanges();
    const mirror = host.querySelector('input.kp-select__form-mirror') as HTMLInputElement;
    expect(mirror.value).toBe('apple');
  });

  it('form-mirror value comma-joins multi-mode selection', () => {
    const { fix, host, cmp } = setup({ name: 'fruit', multiple: true });
    cmp.writeValue(['apple', 'banana']);
    fix.detectChanges();
    const mirror = host.querySelector('input.kp-select__form-mirror') as HTMLInputElement;
    expect(mirror.value).toBe('apple,banana');
  });
});
