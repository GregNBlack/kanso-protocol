import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KpTooltipDirective } from './tooltip.directive';

@Component({
  standalone: true,
  imports: [KpTooltipDirective],
  template: `
    <button
      [kpTooltip]="text()"
      [kpTooltipDisabled]="disabled()"
      [kpTooltipDelay]="0"
      kpTooltipPosition="top">Trigger</button>
  `,
})
class HostComponent {
  text = signal<string | null>('Hello');
  disabled = signal(false);
}

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

describe('KpTooltipDirective', () => {
  function setup(text: string | null = 'Hello', disabled = false) {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    const fix = TestBed.createComponent(HostComponent);
    fix.componentInstance.text.set(text);
    fix.componentInstance.disabled.set(disabled);
    fix.detectChanges();
    const trigger = fix.nativeElement.querySelector('button') as HTMLButtonElement;
    return { fix, trigger };
  }

  function findTooltip(): HTMLElement | null {
    return document.querySelector('kp-tooltip-internal') as HTMLElement | null;
  }

  afterEach(() => {
    document.querySelectorAll('kp-tooltip-internal').forEach((n) => n.remove());
  });

  it('does not render anything until the trigger receives an event', () => {
    setup();
    expect(findTooltip()).toBeNull();
  });

  it('renders on mouseenter (after delay) and removes on mouseleave', async () => {
    const { trigger } = setup();
    trigger.dispatchEvent(new MouseEvent('mouseenter'));
    await wait(10);
    expect(findTooltip()).not.toBeNull();
    trigger.dispatchEvent(new MouseEvent('mouseleave'));
    await wait(200);
    expect(findTooltip()).toBeNull();
  });

  it('renders on focusin', async () => {
    const { trigger } = setup();
    trigger.dispatchEvent(new FocusEvent('focusin'));
    await wait(10);
    expect(findTooltip()).not.toBeNull();
  });

  it('writes aria-describedby on the trigger while visible', async () => {
    const { trigger } = setup();
    expect(trigger.hasAttribute('aria-describedby')).toBe(false);
    trigger.dispatchEvent(new MouseEvent('mouseenter'));
    await wait(10);
    const id = trigger.getAttribute('aria-describedby');
    expect(id).toMatch(/^kp-tooltip-\d+$/);
    expect(findTooltip()?.id).toBe(id);
    trigger.dispatchEvent(new MouseEvent('mouseleave'));
    await wait(200);
    expect(trigger.hasAttribute('aria-describedby')).toBe(false);
  });

  it('hides on Escape', async () => {
    const { trigger } = setup();
    trigger.dispatchEvent(new MouseEvent('mouseenter'));
    await wait(10);
    expect(findTooltip()).not.toBeNull();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(findTooltip()).toBeNull();
  });

  it('null text suppresses the tooltip', async () => {
    const { trigger } = setup(null);
    trigger.dispatchEvent(new MouseEvent('mouseenter'));
    await wait(10);
    expect(findTooltip()).toBeNull();
  });

  it('empty/whitespace text suppresses the tooltip', async () => {
    const { trigger } = setup('   ');
    trigger.dispatchEvent(new MouseEvent('mouseenter'));
    await wait(10);
    expect(findTooltip()).toBeNull();
  });

  it('kpTooltipDisabled=true suppresses regardless of text', async () => {
    const { trigger } = setup('Hello', true);
    trigger.dispatchEvent(new MouseEvent('mouseenter'));
    await wait(10);
    expect(findTooltip()).toBeNull();
  });

  it('renders the supplied label text', async () => {
    const { trigger } = setup('Copy link');
    trigger.dispatchEvent(new MouseEvent('mouseenter'));
    await wait(10);
    expect(findTooltip()?.textContent).toContain('Copy link');
  });
});
