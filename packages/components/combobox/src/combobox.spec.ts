import { TestBed } from '@angular/core/testing';
import { KpComboboxComponent, KpComboboxOption } from './combobox.component';

describe('KpComboboxComponent', () => {
  const OPTIONS: KpComboboxOption[] = [
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'de', label: 'Germany' },
    { value: 'fr', label: 'France', disabled: true },
  ];

  function setup(extra: Partial<KpComboboxComponent> = {}) {
    TestBed.configureTestingModule({ imports: [KpComboboxComponent] });
    const fix = TestBed.createComponent(KpComboboxComponent);
    fix.componentRef.setInput('options', OPTIONS);
    for (const [k, v] of Object.entries(extra)) fix.componentRef.setInput(k, v);
    fix.detectChanges();
    return { fix, host: fix.nativeElement as HTMLElement, cmp: fix.componentInstance };
  }

  const inputEl = (host: HTMLElement) => host.querySelector('input.kp-cb__input') as HTMLInputElement;
  // Dropdown is portaled into <body> after open, so query the whole document.
  const options = (_host: HTMLElement) =>
    Array.from(document.querySelectorAll<HTMLElement>('.kp-cb__option'));

  afterEach(() => {
    // Portaled dropdowns linger between tests; clear them.
    document.querySelectorAll('.kp-cb__dropdown').forEach((el) => el.remove());
  });

  it('renders an input with role="combobox"', () => {
    const { host } = setup();
    expect(inputEl(host).getAttribute('role')).toBe('combobox');
  });

  it('opens dropdown on trigger click and lists options', () => {
    const { fix, host, cmp } = setup();
    cmp.onTriggerClick();
    fix.detectChanges();
    expect(cmp.isOpen).toBe(true);
    expect(options(host).length).toBe(4);
  });

  it('typing into the input updates query, emits queryChange, and filters list', () => {
    const { fix, host, cmp } = setup();
    cmp.onTriggerClick();
    fix.detectChanges();
    const spy = vi.fn();
    cmp.queryChange.subscribe(spy);
    const input = inputEl(host);
    input.value = 'united';
    input.dispatchEvent(new Event('input'));
    fix.detectChanges();
    expect(cmp.query).toBe('united');
    expect(spy).toHaveBeenCalledWith('united');
    // Highlight wraps matches in <mark>, so collapse whitespace before comparing.
    const labels = options(host).map((o) => o.textContent?.replace(/\s+/g, ' ').trim());
    expect(labels).toEqual(['United States', 'United Kingdom']);
  });

  it('pick() in single mode writes value, closes dropdown, and emits onChange', () => {
    const { fix, cmp } = setup();
    cmp.onTriggerClick();
    fix.detectChanges();
    const onChange = vi.fn();
    cmp.registerOnChange(onChange);
    cmp.pick(OPTIONS[1]);
    fix.detectChanges();
    expect(onChange).toHaveBeenCalledWith('uk');
    expect(cmp.isOpen).toBe(false);
  });

  it('pick() in multi mode toggles values and keeps dropdown open', () => {
    const { fix, cmp } = setup({ multiple: true });
    cmp.onTriggerClick();
    fix.detectChanges();
    const onChange = vi.fn();
    cmp.registerOnChange(onChange);
    cmp.pick(OPTIONS[0]);
    cmp.pick(OPTIONS[2]);
    cmp.pick(OPTIONS[0]); // toggles off
    expect(onChange).toHaveBeenLastCalledWith(['de']);
    expect(cmp.isOpen).toBe(true);
  });

  it('Escape key closes the dropdown', () => {
    const { fix, host, cmp } = setup();
    cmp.onTriggerClick();
    fix.detectChanges();
    const ev = new KeyboardEvent('keydown', { key: 'Escape' });
    inputEl(host).dispatchEvent(ev);
    fix.detectChanges();
    expect(cmp.isOpen).toBe(false);
  });

  it('ArrowDown skips disabled options when moving active index', () => {
    const { fix, cmp } = setup();
    cmp.onTriggerClick();
    fix.detectChanges();
    cmp.activeIndex = 2; // Germany
    cmp.onKeyDown(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    // France is disabled — should wrap to United States (index 0)
    expect(cmp.activeIndex).toBe(0);
  });

  it('Enter on active option picks it', () => {
    const { fix, cmp } = setup();
    cmp.onTriggerClick();
    fix.detectChanges();
    const onChange = vi.fn();
    cmp.registerOnChange(onChange);
    cmp.activeIndex = 1;
    cmp.onKeyDown(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(onChange).toHaveBeenCalledWith('uk');
  });

  it('Enter on a disabled active option is a no-op', () => {
    const { fix, cmp } = setup();
    cmp.onTriggerClick();
    fix.detectChanges();
    const onChange = vi.fn();
    cmp.registerOnChange(onChange);
    cmp.activeIndex = 3; // France, disabled
    cmp.onKeyDown(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('writeValue (single) shows the option label in the input when closed', () => {
    const { fix, host, cmp } = setup();
    cmp.writeValue('uk');
    fix.detectChanges();
    expect(inputEl(host).value).toBe('United Kingdom');
  });

  it('writeValue (multi) renders the count summary when collapsed', () => {
    const { fix, host, cmp } = setup({ multiple: true });
    cmp.writeValue(['us', 'de']);
    fix.detectChanges();
    expect(host.querySelector('.kp-cb__summary')?.textContent).toBe('2 selected');
  });

  it('clear() resets value and emits null in single mode', () => {
    const { fix, cmp } = setup();
    cmp.writeValue('us');
    fix.detectChanges();
    const onChange = vi.fn();
    cmp.registerOnChange(onChange);
    cmp.clear(new MouseEvent('click'));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('setDisabledState() blocks open + interactions', () => {
    const { fix, cmp } = setup();
    cmp.setDisabledState(true);
    fix.detectChanges();
    cmp.onTriggerClick();
    expect(cmp.isOpen).toBe(false);
  });

  it('highlight() returns matched/unmatched segments for the active query', () => {
    const { cmp } = setup();
    cmp.query = 'uni';
    const segs = cmp.highlight('United States');
    expect(segs).toEqual([
      { text: 'Uni', match: true },
      { text: 'ted States', match: false },
    ]);
  });

  it('Backspace on empty query in multi mode pops the last selection', () => {
    const { fix, cmp } = setup({ multiple: true });
    cmp.writeValue(['us', 'uk']);
    cmp.onTriggerClick();
    fix.detectChanges();
    const onChange = vi.fn();
    cmp.registerOnChange(onChange);
    cmp.onKeyDown(new KeyboardEvent('keydown', { key: 'Backspace' }));
    expect(onChange).toHaveBeenCalledWith(['us']);
  });
});
