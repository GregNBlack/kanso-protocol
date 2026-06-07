import { TestBed } from '@angular/core/testing';
import { KpSegmentedControlComponent } from './segmented-control.component';

// jsdom has no ResizeObserver — component uses it to animate the pill.
class ResizeObserverStub {
  observe() { /* no-op */ }
  unobserve() { /* no-op */ }
  disconnect() { /* no-op */ }
}
(globalThis as unknown as { ResizeObserver: typeof ResizeObserverStub }).ResizeObserver = ResizeObserverStub;

describe('KpSegmentedControlComponent', () => {
  function setup() {
    TestBed.configureTestingModule({ imports: [KpSegmentedControlComponent] });
    const fix = TestBed.createComponent(KpSegmentedControlComponent);
    fix.componentRef.setInput('options', [
      { value: 'list',  label: 'List' },
      { value: 'grid',  label: 'Grid' },
      { value: 'board', label: 'Board', disabled: true },
    ]);
    fix.detectChanges();
    fix.componentInstance.writeValue('list');
    fix.detectChanges();
    return { fix, host: fix.nativeElement as HTMLElement };
  }

  const getInputs = (host: HTMLElement) =>
    Array.from(host.querySelectorAll<HTMLInputElement>('input[type="radio"]'));

  it('renders a native radio per option, all sharing the same name', () => {
    const { host } = setup();
    const inputs = getInputs(host);
    expect(inputs.length).toBe(3);
    expect(inputs[0].name).toBe(inputs[1].name);
    expect(inputs[1].name).toBe(inputs[2].name);
  });

  it('host has role="radiogroup"', () => {
    const { host } = setup();
    expect(host.getAttribute('role')).toBe('radiogroup');
  });

  it('selected segment reflects native input.checked', () => {
    const { host } = setup();
    const inputs = getInputs(host);
    expect(inputs[0].checked).toBe(true);
    expect(inputs[1].checked).toBe(false);
  });

  it('changing a radio emits (valueChange)', () => {
    const { fix, host } = setup();
    const spy = vi.fn();
    fix.componentInstance.valueChange.subscribe(spy);
    const inputs = getInputs(host);
    inputs[1].checked = true;
    inputs[1].dispatchEvent(new Event('change', { bubbles: true }));
    fix.detectChanges();
    expect(spy).toHaveBeenCalledWith('grid');
  });

  it('disabled option has native disabled attribute', () => {
    const { host } = setup();
    const inputs = getInputs(host);
    expect(inputs[2].disabled).toBe(true);
  });

  it('disabled control: every input gets disabled', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('disabled', true);
    fix.detectChanges();
    getInputs(host).forEach((b) => expect(b.disabled).toBe(true));
  });
});
