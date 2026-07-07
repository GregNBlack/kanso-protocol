import { Component, signal, TemplateRef, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KpPopoverDirective, KpPopoverTrigger } from './popover.directive';

@Component({
  standalone: true,
  imports: [KpPopoverDirective],
  template: `
    <button
      #btn
      [kpPopover]="content() ? tpl : null"
      [kpPopoverTrigger]="trigger()"
      [kpPopoverCloseOnAnchorHidden]="closeOnAnchorHidden()"
      [kpPopoverDisabled]="disabled()">Trigger</button>
    <ng-template #tpl><div class="kp-test-panel">Panel content</div></ng-template>
  `,
})
class HostComponent {
  @ViewChild(KpPopoverDirective) dir!: KpPopoverDirective;
  content = signal(true);
  trigger = signal<KpPopoverTrigger>('click');
  disabled = signal(false);
  closeOnAnchorHidden = signal(true);
}

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * jsdom does not implement IntersectionObserver, so tests that exercise the
 * anchor-visibility auto-close install this fake on the global and drive the
 * callback manually via `emit()`.
 */
class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];
  readonly observed: Element[] = [];
  disconnected = false;
  constructor(private readonly cb: IntersectionObserverCallback) {
    MockIntersectionObserver.instances.push(this);
  }
  observe(el: Element): void { this.observed.push(el); }
  unobserve(): void {}
  disconnect(): void { this.disconnected = true; }
  takeRecords(): IntersectionObserverEntry[] { return []; }
  /** Simulate the browser reporting the trigger's intersection state. */
  emit(isIntersecting: boolean): void {
    this.cb(
      [{ isIntersecting } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
}

describe('KpPopoverDirective', () => {
  function setup() {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    const fix = TestBed.createComponent(HostComponent);
    fix.detectChanges();
    const trigger = fix.nativeElement.querySelector('button') as HTMLButtonElement;
    return { fix, trigger };
  }

  const panel = (): HTMLElement | null => document.querySelector('.kp-test-panel');

  afterEach(() => {
    document.querySelectorAll('.kp-test-panel').forEach((n) => n.closest('div[id^="kp-popover-"]')?.remove());
  });

  it('does not render the panel until triggered', () => {
    setup();
    expect(panel()).toBeNull();
  });

  it('opens on click and closes on second click (toggle)', () => {
    const { trigger } = setup();
    trigger.click();
    expect(panel()).not.toBeNull();
    trigger.click();
    expect(panel()).toBeNull();
  });

  it('sets aria-expanded + aria-controls on the trigger while open', () => {
    const { trigger } = setup();
    expect(trigger.hasAttribute('aria-expanded')).toBe(false);
    trigger.click();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.getAttribute('aria-controls')).toMatch(/^kp-popover-\d+$/);
    trigger.click();
    expect(trigger.hasAttribute('aria-expanded')).toBe(false);
  });

  it('closes on Escape', () => {
    const { trigger } = setup();
    trigger.click();
    expect(panel()).not.toBeNull();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(panel()).toBeNull();
  });

  it('closes on outside pointerdown', async () => {
    const { trigger } = setup();
    trigger.click();
    expect(panel()).not.toBeNull();
    await wait(20); // outside-click listener is attached on next frame
    document.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    expect(panel()).toBeNull();
  });

  it('null content suppresses opening', () => {
    const { fix, trigger } = setup();
    fix.componentInstance.content.set(false);
    fix.detectChanges();
    trigger.click();
    expect(panel()).toBeNull();
  });

  it('disabled suppresses opening', () => {
    const { fix, trigger } = setup();
    fix.componentInstance.disabled.set(true);
    fix.detectChanges();
    trigger.click();
    expect(panel()).toBeNull();
  });

  it('manual trigger ignores click, opens via open()', () => {
    const { fix, trigger } = setup();
    fix.componentInstance.trigger.set('manual');
    fix.detectChanges();
    trigger.click();
    expect(panel()).toBeNull();
    fix.componentInstance.dir.open();
    expect(panel()).not.toBeNull();
    fix.componentInstance.dir.close();
    expect(panel()).toBeNull();
  });

  it('positions the panel viewport-aware via the shared util (resolved side + arrow offset)', () => {
    const { trigger } = setup();
    trigger.click();
    const wrapper = panel()?.closest('div[id^="kp-popover-"]') as HTMLElement;
    expect(wrapper).toBeTruthy();
    // Fixed positioning applied.
    expect(wrapper.style.position).toBe('fixed');
    expect(wrapper.style.left).toMatch(/px$/);
    expect(wrapper.style.top).toMatch(/px$/);
    // Resolved side + arrow offset exposed for the inner chrome to consume.
    expect(wrapper.dataset['kpPopoverSide']).toMatch(/^(top|right|bottom|left)$/);
    expect(wrapper.style.getPropertyValue('--kp-popover-arrow-offset')).toMatch(/px$/);
  });

  it('repositions while open on scroll/resize (viewport tracking)', () => {
    const { trigger } = setup();
    trigger.click(); // open
    expect(panel()).not.toBeNull();
    // Capture-phase scroll/resize listeners schedule a rAF reposition so the
    // fixed-positioned panel tracks its trigger instead of drifting.
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame');
    window.dispatchEvent(new Event('scroll'));
    expect(rafSpy).toHaveBeenCalledTimes(1);
    window.dispatchEvent(new Event('resize'));
    rafSpy.mockRestore();
  });

  it('repositions on resize while open (rAF-scheduled)', () => {
    const { trigger } = setup();
    trigger.click(); // open
    expect(panel()).not.toBeNull();
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame');
    window.dispatchEvent(new Event('resize'));
    expect(rafSpy).toHaveBeenCalledTimes(1);
    rafSpy.mockRestore();
  });

  it('auto-closes when the anchor leaves the viewport (IntersectionObserver)', () => {
    const originalIO = globalThis.IntersectionObserver;
    MockIntersectionObserver.instances.length = 0;
    globalThis.IntersectionObserver =
      MockIntersectionObserver as unknown as typeof IntersectionObserver;
    try {
      const { trigger } = setup();
      trigger.click(); // open
      expect(panel()).not.toBeNull();

      const io = MockIntersectionObserver.instances[0];
      expect(io).toBeTruthy();
      expect(io.observed).toContain(trigger); // observing the trigger

      // Still intersecting → panel stays open (initial observe() is a no-op).
      io.emit(true);
      expect(panel()).not.toBeNull();

      // Anchor scrolled out of view → graceful auto-close.
      io.emit(false);
      expect(panel()).toBeNull();
      // Observer torn down on close (no leak).
      expect(io.disconnected).toBe(true);
    } finally {
      globalThis.IntersectionObserver = originalIO;
    }
  });

  it('does not observe the anchor when kpPopoverCloseOnAnchorHidden is false', () => {
    const originalIO = globalThis.IntersectionObserver;
    MockIntersectionObserver.instances.length = 0;
    globalThis.IntersectionObserver =
      MockIntersectionObserver as unknown as typeof IntersectionObserver;
    try {
      const { fix, trigger } = setup();
      fix.componentInstance.closeOnAnchorHidden.set(false);
      fix.detectChanges();
      trigger.click(); // open
      expect(panel()).not.toBeNull();
      expect(MockIntersectionObserver.instances.length).toBe(0);
    } finally {
      globalThis.IntersectionObserver = originalIO;
    }
  });

  it('cleans up scroll/resize listeners + IntersectionObserver on destroy', () => {
    const originalIO = globalThis.IntersectionObserver;
    MockIntersectionObserver.instances.length = 0;
    globalThis.IntersectionObserver =
      MockIntersectionObserver as unknown as typeof IntersectionObserver;
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    try {
      const { fix, trigger } = setup();
      trigger.click(); // open
      expect(panel()).not.toBeNull();
      const io = MockIntersectionObserver.instances[0];

      fix.destroy(); // ngOnDestroy → close()

      expect(panel()).toBeNull();
      expect(io.disconnected).toBe(true);
      expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function), true);
      expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    } finally {
      removeSpy.mockRestore();
      globalThis.IntersectionObserver = originalIO;
    }
  });
});
