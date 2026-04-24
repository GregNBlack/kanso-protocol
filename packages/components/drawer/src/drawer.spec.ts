import { TestBed } from '@angular/core/testing';
import { KpDrawerComponent } from './drawer.component';

/**
 * Drawer portals its root into <body>, so queries go through `document`.
 */
describe('KpDrawerComponent', () => {
  function setup(extra: Record<string, unknown> = {}) {
    TestBed.configureTestingModule({ imports: [KpDrawerComponent] });
    const fix = TestBed.createComponent(KpDrawerComponent);
    for (const [k, v] of Object.entries(extra)) fix.componentRef.setInput(k, v);
    fix.detectChanges();
    return { fix, cmp: fix.componentInstance };
  }

  const getPanel = () => document.querySelector('.kp-drawer__panel') as HTMLElement | null;
  const getRoot = () => document.querySelector('.kp-drawer__root') as HTMLElement | null;

  afterEach(() => {
    document.querySelectorAll('.kp-drawer__root').forEach((el) => el.remove());
    // Reset body overflow that the drawer may have set.
    document.body.style.overflow = '';
  });

  it('does not render anything when open=false', () => {
    setup();
    expect(getPanel()).toBeNull();
  });

  it('renders panel with role=dialog and aria-modal when open=true', () => {
    const { fix } = setup();
    fix.componentRef.setInput('open', true);
    fix.detectChanges();
    const panel = getPanel();
    expect(panel).not.toBeNull();
    expect(panel!.getAttribute('role')).toBe('dialog');
    expect(panel!.getAttribute('aria-modal')).toBe('true');
  });

  it('wires aria-labelledby to the title when showHeader=true', () => {
    const { fix } = setup();
    fix.componentRef.setInput('open', true);
    fix.componentRef.setInput('title', 'Filters');
    fix.detectChanges();
    const labelledby = getPanel()!.getAttribute('aria-labelledby');
    expect(labelledby).toBeTruthy();
    expect(document.getElementById(labelledby!)?.textContent?.trim()).toBe('Filters');
  });

  it('uses aria-label fallback when showHeader=false', () => {
    const { fix } = setup();
    fix.componentRef.setInput('open', true);
    fix.componentRef.setInput('showHeader', false);
    fix.componentRef.setInput('ariaLabel', 'Quick settings');
    fix.detectChanges();
    expect(getPanel()!.getAttribute('aria-label')).toBe('Quick settings');
  });

  it('side class on root reflects the configured side', () => {
    const { fix } = setup({ side: 'left' });
    fix.componentRef.setInput('open', true);
    fix.detectChanges();
    expect(getRoot()!.classList.contains('kp-drawer--left')).toBe(true);
  });

  it('close() emits openChange(false) and eventually closed()', async () => {
    vi.useFakeTimers();
    const { fix, cmp } = setup();
    fix.componentRef.setInput('open', true);
    fix.detectChanges();
    const open = vi.fn();
    const closed = vi.fn();
    cmp.openChange.subscribe(open);
    cmp.closed.subscribe(closed);
    cmp.close();
    expect(open).toHaveBeenCalledWith(false);
    // Exit animation runs for 220ms, then closed fires.
    vi.advanceTimersByTime(250);
    expect(closed).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('backdrop click triggers close when closeOnBackdrop=true', () => {
    const { fix, cmp } = setup();
    fix.componentRef.setInput('open', true);
    fix.detectChanges();
    const spy = vi.spyOn(cmp, 'close');
    cmp.onBackdropClick();
    expect(spy).toHaveBeenCalled();
  });

  it('backdrop click is a no-op when closeOnBackdrop=false', () => {
    const { fix, cmp } = setup();
    fix.componentRef.setInput('open', true);
    fix.componentRef.setInput('closeOnBackdrop', false);
    fix.detectChanges();
    const spy = vi.spyOn(cmp, 'close');
    cmp.onBackdropClick();
    expect(spy).not.toHaveBeenCalled();
  });

  it('Escape calls close when closeOnEsc=true', () => {
    const { fix, cmp } = setup();
    fix.componentRef.setInput('open', true);
    fix.detectChanges();
    const spy = vi.spyOn(cmp, 'close');
    cmp.onEscape(new Event('keydown'));
    expect(spy).toHaveBeenCalled();
  });

  it('Escape is a no-op when closeOnEsc=false', () => {
    const { fix, cmp } = setup();
    fix.componentRef.setInput('open', true);
    fix.componentRef.setInput('closeOnEsc', false);
    fix.detectChanges();
    const spy = vi.spyOn(cmp, 'close');
    cmp.onEscape(new Event('keydown'));
    expect(spy).not.toHaveBeenCalled();
  });

  it('renders a footer slot when showFooter=true', () => {
    const { fix } = setup();
    fix.componentRef.setInput('open', true);
    fix.componentRef.setInput('showFooter', true);
    fix.detectChanges();
    expect(document.querySelector('.kp-drawer__footer')).not.toBeNull();
  });

  it('renders the close button by default and hides it when showClose=false', () => {
    const { fix } = setup();
    fix.componentRef.setInput('open', true);
    fix.detectChanges();
    expect(document.querySelector('.kp-drawer__close')).not.toBeNull();
    fix.componentRef.setInput('showClose', false);
    fix.detectChanges();
    expect(document.querySelector('.kp-drawer__close')).toBeNull();
  });

  it('locks document body scroll while open and restores on close', async () => {
    vi.useFakeTimers();
    document.body.style.overflow = 'auto';
    const { fix, cmp } = setup();
    fix.componentRef.setInput('open', true);
    fix.detectChanges();
    expect(document.body.style.overflow).toBe('hidden');
    cmp.close();
    vi.advanceTimersByTime(250);
    expect(document.body.style.overflow).toBe('auto');
    vi.useRealTimers();
  });
});
