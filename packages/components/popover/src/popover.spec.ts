import { TestBed } from '@angular/core/testing';
import { KpPopoverComponent } from './popover.component';

describe('KpPopoverComponent', () => {
  function setup(extra: Record<string, unknown> = {}) {
    TestBed.configureTestingModule({ imports: [KpPopoverComponent] });
    const fix = TestBed.createComponent(KpPopoverComponent);
    fix.componentRef.setInput('title', 'Confirm action');
    for (const [k, v] of Object.entries(extra)) fix.componentRef.setInput(k, v);
    fix.detectChanges();
    return { fix, host: fix.nativeElement as HTMLElement, cmp: fix.componentInstance };
  }

  it('renders the title and gets role="dialog" on host', () => {
    const { host } = setup();
    expect(host.getAttribute('role')).toBe('dialog');
    expect(host.querySelector('.kp-popover__title')?.textContent).toBe('Confirm action');
  });

  it('hides description by default', () => {
    expect(setup().host.querySelector('.kp-popover__description')).toBeNull();
  });

  it('renders description when provided', () => {
    const { host } = setup({ description: 'You cannot undo this.' });
    expect(host.querySelector('.kp-popover__description')?.textContent).toBe('You cannot undo this.');
  });

  it('renders the close button by default', () => {
    expect(setup().host.querySelector('.kp-popover__close')).not.toBeNull();
  });

  it('hides the close button when closable=false', () => {
    const { host } = setup({ closable: false });
    expect(host.querySelector('.kp-popover__close')).toBeNull();
  });

  it('handleClose stops propagation and emits (close)', () => {
    const { cmp } = setup();
    const ev = new MouseEvent('click', { bubbles: true });
    const stop = vi.spyOn(ev, 'stopPropagation');
    const spy = vi.fn();
    cmp.close.subscribe(spy);
    cmp.handleClose(ev);
    expect(stop).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(ev);
  });

  it('omits the arrow when arrowPosition="none"', () => {
    const { host } = setup();
    expect(host.querySelector('.kp-popover__arrow')).toBeNull();
  });

  it('renders the arrow with the correct host class for the chosen side', () => {
    const { host } = setup({ arrowPosition: 'top-center' });
    expect(host.querySelector('.kp-popover__arrow')).not.toBeNull();
    expect(host.classList.contains('kp-popover--arrow-top-center')).toBe(true);
  });

  it('arrow geometry depends on side: top/bottom use horizontal base, left/right rotate', () => {
    const { cmp } = setup({ size: 'md', arrowPosition: 'top-center' });
    expect(cmp.arrowW).toBe(12);
    expect(cmp.arrowH).toBe(8);
    expect(cmp.arrowPath).toMatch(/^M 0 8 L 6 0 L 12 8 Z$/);
  });

  it('arrow geometry rotates dimensions when side is "left"', () => {
    const { cmp } = setup({ size: 'md', arrowPosition: 'left-center' });
    expect(cmp.arrowW).toBe(8);
    expect(cmp.arrowH).toBe(12);
  });

  it('size class follows the size input', () => {
    const { host } = setup({ size: 'lg' });
    expect(host.classList.contains('kp-popover--lg')).toBe(true);
  });

  it('closeIconSize is 16 for sm', () => {
    expect(setup({ size: 'sm' }).cmp.closeIconSize).toBe(16);
  });

  it('closeIconSize is 18 for md', () => {
    expect(setup({ size: 'md' }).cmp.closeIconSize).toBe(18);
  });

  it('header divider absent by default', () => {
    expect(setup().host.querySelector('.kp-popover__header + .kp-popover__divider')).toBeNull();
  });

  it('header divider renders when showHeaderDivider=true', () => {
    const { host } = setup({ showHeaderDivider: true });
    expect(host.querySelector('.kp-popover__header + .kp-popover__divider')).not.toBeNull();
  });

  it('footer slot hidden by default', () => {
    expect(setup().host.querySelector('.kp-popover__footer-group.kp-popover__hidden')).not.toBeNull();
  });

  it('footer slot visible when showFooter=true', () => {
    const { host } = setup({ showFooter: true });
    expect(host.querySelector('.kp-popover__footer-group.kp-popover__hidden')).toBeNull();
  });
});
