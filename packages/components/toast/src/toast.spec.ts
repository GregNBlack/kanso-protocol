import { TestBed } from '@angular/core/testing';
import { KpToastService } from './toast.service';
import { KpToastHostComponent } from './toast-host.component';

describe('KpToastService', () => {
  let svc: KpToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    svc = TestBed.inject(KpToastService);
    svc.dismissAll();
  });

  it('show() returns an incrementing id and adds to the queue', () => {
    const a = svc.show({ title: 'A' });
    const b = svc.show({ title: 'B' });
    expect(b).toBeGreaterThan(a);
    expect(svc.toasts().length).toBe(2);
  });

  it('appearance defaults to "neutral"', () => {
    svc.show({ title: 'plain' });
    expect(svc.toasts()[0].appearance).toBe('neutral');
  });

  it('duration defaults to 5000ms when omitted', () => {
    svc.show({ title: 'pop' });
    expect(svc.toasts()[0].duration).toBe(5000);
  });

  it('appearance helpers (success/danger/warning/...) set the right key', () => {
    const ids = [
      svc.success('s'),
      svc.danger('d'),
      svc.warning('w'),
      svc.info('i'),
      svc.primary('p'),
      svc.neutral('n'),
    ];
    const list = svc.toasts();
    expect(list.find((t) => t.id === ids[0])?.appearance).toBe('success');
    expect(list.find((t) => t.id === ids[1])?.appearance).toBe('danger');
    expect(list.find((t) => t.id === ids[2])?.appearance).toBe('warning');
    expect(list.find((t) => t.id === ids[3])?.appearance).toBe('info');
    expect(list.find((t) => t.id === ids[4])?.appearance).toBe('primary');
    expect(list.find((t) => t.id === ids[5])?.appearance).toBe('neutral');
  });

  it('dismiss(id) removes one toast and leaves the rest', () => {
    const a = svc.show({ title: 'A' });
    svc.show({ title: 'B' });
    svc.dismiss(a);
    const titles = svc.toasts().map((t) => t.title);
    expect(titles).toEqual(['B']);
  });

  it('dismissAll() clears the queue', () => {
    svc.show({ title: 'X' });
    svc.show({ title: 'Y' });
    svc.dismissAll();
    expect(svc.toasts().length).toBe(0);
  });

  it('auto-dismiss fires after the configured duration', () => {
    vi.useFakeTimers();
    const id = svc.show({ title: 'short', duration: 250 });
    expect(svc.toasts().some((t) => t.id === id)).toBe(true);
    vi.advanceTimersByTime(300);
    expect(svc.toasts().some((t) => t.id === id)).toBe(false);
    vi.useRealTimers();
  });

  it('duration:0 is sticky — never auto-dismisses', () => {
    vi.useFakeTimers();
    const id = svc.show({ title: 'sticky', duration: 0 });
    vi.advanceTimersByTime(60_000);
    expect(svc.toasts().some((t) => t.id === id)).toBe(true);
    svc.dismiss(id);
    vi.useRealTimers();
  });
});

describe('KpToastHostComponent', () => {
  function setupHost(extra: Record<string, unknown> = {}) {
    TestBed.configureTestingModule({ imports: [KpToastHostComponent] });
    const fix = TestBed.createComponent(KpToastHostComponent);
    for (const [k, v] of Object.entries(extra)) fix.componentRef.setInput(k, v);
    fix.detectChanges();
    return { fix, cmp: fix.componentInstance, svc: TestBed.inject(KpToastService) };
  }

  afterEach(() => {
    document.querySelectorAll('.kp-th__stack').forEach((el) => el.remove());
  });

  const stack = () => document.querySelector('.kp-th__stack') as HTMLElement | null;
  const renderedToasts = () => Array.from(document.querySelectorAll('.kp-th__toast'));

  it('renders a queued toast inside its stack', () => {
    const { fix, svc } = setupHost();
    svc.dismissAll();
    svc.show({ title: 'Hello' });
    fix.detectChanges();
    expect(renderedToasts().length).toBe(1);
    expect(renderedToasts()[0].textContent).toContain('Hello');
  });

  it('stack class encodes position + size', () => {
    const { cmp } = setupHost({ position: 'bottom-left', size: 'sm' });
    expect(cmp.stackClasses()).toBe('kp-th__stack--bottom-left kp-th__stack--sm');
  });

  it('caps the rendered set at `max`, dropping the oldest', () => {
    const { fix, svc } = setupHost({ max: 2 });
    svc.dismissAll();
    svc.show({ title: 'A' });
    svc.show({ title: 'B' });
    svc.show({ title: 'C' });
    fix.detectChanges();
    const titles = renderedToasts().map((el) => el.querySelector('.kp-th__title')?.textContent);
    expect(titles).toEqual(['B', 'C']);
  });

  it('dismiss button removes the toast from the queue', () => {
    const { fix, svc } = setupHost();
    svc.dismissAll();
    svc.show({ title: 'go away' });
    fix.detectChanges();
    const closeBtn = renderedToasts()[0].querySelector('.kp-th__close') as HTMLButtonElement;
    closeBtn.click();
    fix.detectChanges();
    expect(svc.toasts().length).toBe(0);
  });

  it('host carries aria-live="polite" + aria-atomic="false"', () => {
    const { fix } = setupHost();
    const host = fix.nativeElement as HTMLElement;
    expect(host.getAttribute('aria-live')).toBe('polite');
    expect(host.getAttribute('aria-atomic')).toBe('false');
  });

  it('action button: clicking invokes the handler with the toast id', () => {
    const { fix, svc } = setupHost();
    svc.dismissAll();
    const handler = vi.fn();
    const id = svc.show({ title: 'with action', action: { label: 'Undo', handler } });
    fix.detectChanges();
    const action = document.querySelector('.kp-th__action') as HTMLButtonElement;
    action.click();
    expect(handler).toHaveBeenCalledWith(id);
  });
});
