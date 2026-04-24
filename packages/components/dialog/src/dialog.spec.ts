import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KpDialogComponent } from './dialog.component';

/**
 * Dialog portals its rendered root into <body> (not its own host element),
 * so queries go through `document` instead of `fixture.nativeElement`.
 */
describe('KpDialogComponent', () => {
  let fixture: ComponentFixture<KpDialogComponent>;
  let component: KpDialogComponent;

  const getDialog = () => document.querySelector('[role="dialog"]') as HTMLElement | null;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [KpDialogComponent] }).compileComponents();
    fixture = TestBed.createComponent(KpDialogComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    // Portaled dialogs stick to body — clean up between tests.
    fixture.destroy();
    document.querySelectorAll('.kp-dialog__root').forEach((el) => el.remove());
  });

  it('does not render a dialog when open=false', () => {
    fixture.detectChanges();
    expect(getDialog()).toBeNull();
  });

  it('renders role="dialog" + aria-modal when open=true', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    const dlg = getDialog();
    expect(dlg).not.toBeNull();
    expect(dlg!.getAttribute('aria-modal')).toBe('true');
  });

  it('wires aria-labelledby to the title element when showHeader=true', () => {
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('title', 'Confirm delete');
    fixture.detectChanges();
    const dlg = getDialog()!;
    const labelledby = dlg.getAttribute('aria-labelledby');
    expect(labelledby).toBeTruthy();
    expect(document.getElementById(labelledby!)?.textContent).toContain('Confirm delete');
  });

  it('uses aria-label fallback when showHeader=false', () => {
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('showHeader', false);
    fixture.componentRef.setInput('ariaLabel', 'Standalone dialog');
    fixture.detectChanges();
    const dlg = getDialog()!;
    expect(dlg.getAttribute('aria-label')).toBe('Standalone dialog');
  });

  it('close() emits openChange(false) and closed()', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    const openSpy = vi.fn();
    const closedSpy = vi.fn();
    component.openChange.subscribe(openSpy);
    component.closed.subscribe(closedSpy);
    component.close();
    expect(openSpy).toHaveBeenCalledWith(false);
    expect(closedSpy).toHaveBeenCalled();
  });

  it('backdrop click triggers close when closeOnBackdrop=true', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    const spy = vi.spyOn(component, 'close');
    component.onBackdropClick();
    expect(spy).toHaveBeenCalled();
  });

  it('backdrop click is a no-op when closeOnBackdrop=false', () => {
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('closeOnBackdrop', false);
    fixture.detectChanges();
    const spy = vi.spyOn(component, 'close');
    component.onBackdropClick();
    expect(spy).not.toHaveBeenCalled();
  });
});
