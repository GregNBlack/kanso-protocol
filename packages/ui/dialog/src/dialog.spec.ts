import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KpDialogComponent } from './dialog.component';

/**
 * Dialog now wraps a native <dialog>. jsdom (Vitest's default DOM) ships
 * a partial implementation — showModal() / close() exist as methods we
 * can spy on, but the top-layer / ::backdrop / focus-trap pieces are
 * browser-only and not asserted here.
 */
describe('KpDialogComponent', () => {
  let fixture: ComponentFixture<KpDialogComponent>;
  let component: KpDialogComponent;

  // Patch missing dialog methods in jsdom if needed
  beforeAll(() => {
    const proto = (globalThis as any).HTMLDialogElement?.prototype;
    if (proto && typeof proto.showModal !== 'function') {
      proto.showModal = function () { this.setAttribute('open', ''); };
      proto.close = function () { this.removeAttribute('open'); this.dispatchEvent(new Event('close')); };
    }
  });

  const getDialog = () =>
    fixture.nativeElement.querySelector('dialog.kp-dialog__el') as HTMLDialogElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [KpDialogComponent] }).compileComponents();
    fixture = TestBed.createComponent(KpDialogComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => { fixture.destroy(); });

  it('renders a native <dialog> element', () => {
    fixture.detectChanges();
    expect(getDialog()).toBeTruthy();
    expect(getDialog().tagName).toBe('DIALOG');
  });

  it('does not have the [open] attribute when open=false', () => {
    fixture.detectChanges();
    expect(getDialog().hasAttribute('open')).toBe(false);
  });

  it('calls showModal() when open=true', async () => {
    fixture.detectChanges();
    const spy = vi.spyOn(getDialog(), 'showModal');
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    await new Promise((r) => queueMicrotask(() => r(null)));
    expect(spy).toHaveBeenCalled();
  });

  it('wires aria-labelledby to title element when title is set', () => {
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('title', 'Confirm delete');
    fixture.detectChanges();
    const dlg = getDialog();
    const labelledby = dlg.getAttribute('aria-labelledby');
    expect(labelledby).toBeTruthy();
    expect(fixture.nativeElement.querySelector('#' + labelledby)?.textContent).toContain('Confirm delete');
  });

  it('uses aria-label fallback when no title is provided', () => {
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('ariaLabel', 'Standalone dialog');
    fixture.detectChanges();
    const dlg = getDialog();
    expect(dlg.getAttribute('aria-label')).toBe('Standalone dialog');
    expect(dlg.getAttribute('aria-labelledby')).toBeNull();
  });

  it('close() emits openChange(false) and closed()', async () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    await new Promise((r) => queueMicrotask(() => r(null)));
    const openSpy = vi.fn();
    const closedSpy = vi.fn();
    component.openChange.subscribe(openSpy);
    component.closed.subscribe(closedSpy);
    component.close();
    expect(openSpy).toHaveBeenCalledWith(false);
    expect(closedSpy).toHaveBeenCalled();
  });

  it('clicking the dialog backdrop (event.target === dialog) triggers close', async () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    await new Promise((r) => queueMicrotask(() => r(null)));
    const spy = vi.spyOn(component, 'close');
    const dlg = getDialog();
    component.onDialogClick({ target: dlg } as unknown as MouseEvent);
    expect(spy).toHaveBeenCalled();
  });

  it('backdrop click is a no-op when closeOnBackdrop=false', () => {
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('closeOnBackdrop', false);
    fixture.detectChanges();
    const spy = vi.spyOn(component, 'close');
    component.onDialogClick({ target: getDialog() } as unknown as MouseEvent);
    expect(spy).not.toHaveBeenCalled();
  });

  it('defaults footerLayout to "end" and applies the matching class', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    const footer = fixture.nativeElement.querySelector('.kp-dialog__footer') as HTMLElement;
    expect(footer.classList.contains('kp-dialog__footer--end')).toBe(true);
  });

  it('applies the start footer class and packs to flex-start when footerLayout="start"', () => {
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('footerLayout', 'start');
    fixture.detectChanges();
    const footer = fixture.nativeElement.querySelector('.kp-dialog__footer') as HTMLElement;
    expect(component.footerLayoutClass).toBe('kp-dialog__footer--start');
    expect(footer.classList.contains('kp-dialog__footer--start')).toBe(true);
  });

  it('cancel event is suppressed when closeOnEsc=false', () => {
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('closeOnEsc', false);
    fixture.detectChanges();
    const ev = new Event('cancel', { cancelable: true });
    component.onCancel(ev);
    expect(ev.defaultPrevented).toBe(true);
  });
});
