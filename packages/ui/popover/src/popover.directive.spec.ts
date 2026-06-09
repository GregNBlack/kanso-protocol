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
      [kpPopoverDisabled]="disabled()">Trigger</button>
    <ng-template #tpl><div class="kp-test-panel">Panel content</div></ng-template>
  `,
})
class HostComponent {
  @ViewChild(KpPopoverDirective) dir!: KpPopoverDirective;
  content = signal(true);
  trigger = signal<KpPopoverTrigger>('click');
  disabled = signal(false);
}

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

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
});
