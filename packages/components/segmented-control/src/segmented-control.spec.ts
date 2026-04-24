import { TestBed } from '@angular/core/testing';
import { KpSegmentedControlComponent } from './segmented-control.component';

// jsdom has no ResizeObserver; the component installs one in ngAfterViewInit
// to animate the selected-pill. A no-op stub is enough for unit coverage.
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

  const getSegs = (host: HTMLElement) =>
    Array.from(host.querySelectorAll<HTMLButtonElement>('.kp-segmented-control__segment'));

  it('renders a segment per option', () => {
    const { host } = setup();
    expect(getSegs(host).length).toBe(3);
  });

  it('selected segment reflects aria-selected=true', () => {
    const { host } = setup();
    const segs = getSegs(host);
    expect(segs[0].getAttribute('aria-selected')).toBe('true');
    expect(segs[1].getAttribute('aria-selected')).toBe('false');
  });

  it('clicking a segment emits (valueChange)', () => {
    const { fix, host } = setup();
    const spy = vi.fn();
    fix.componentInstance.valueChange.subscribe(spy);
    getSegs(host)[1].click();
    fix.detectChanges();
    expect(spy).toHaveBeenCalledWith('grid');
  });

  it('disabled option does not emit on click', () => {
    const { fix, host } = setup();
    const spy = vi.fn();
    fix.componentInstance.valueChange.subscribe(spy);
    getSegs(host)[2].click();
    fix.detectChanges();
    expect(spy).not.toHaveBeenCalled();
  });

  it('disabled control: every segment gets disabled', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('disabled', true);
    fix.detectChanges();
    getSegs(host).forEach((b) => expect(b.disabled).toBe(true));
  });
});
