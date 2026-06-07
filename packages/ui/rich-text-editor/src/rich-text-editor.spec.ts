import { TestBed } from '@angular/core/testing';
import { KpRichTextEditorComponent } from './rich-text-editor.component';

/**
 * RTE wraps a TipTap editor that needs full DOM. jsdom is mostly fine but
 * some bits (ResizeObserver, IntersectionObserver) aren't there. Stub the
 * ones TipTap or its plugins probe at boot.
 */
class ResizeObserverStub {
  observe(): void { /* no-op */ }
  unobserve(): void { /* no-op */ }
  disconnect(): void { /* no-op */ }
}
(globalThis as unknown as { ResizeObserver: typeof ResizeObserverStub }).ResizeObserver ??= ResizeObserverStub;

describe('KpRichTextEditorComponent', () => {
  function setup(extra: Record<string, unknown> = {}) {
    TestBed.configureTestingModule({ imports: [KpRichTextEditorComponent] });
    const fix = TestBed.createComponent(KpRichTextEditorComponent);
    for (const [k, v] of Object.entries(extra)) fix.componentRef.setInput(k, v);
    fix.detectChanges();
    return { fix, host: fix.nativeElement as HTMLElement, cmp: fix.componentInstance };
  }

  const buttons = (host: HTMLElement) =>
    Array.from(host.querySelectorAll<HTMLButtonElement>('.kp-rte__btn'));

  it('renders the toolbar with role="toolbar" and a full button set', () => {
    const { host } = setup();
    expect(host.querySelector('[role="toolbar"]')).not.toBeNull();
    // history (2) + marks (5) + blocks (6) + lists (2) + align (3) + link/image (2)
    expect(buttons(host).length).toBe(20);
  });

  it('host class includes size + reflects disabled / error', () => {
    const { host } = setup({ size: 'lg', disabled: true, error: true });
    expect(host.classList.contains('kp-rte--lg')).toBe(true);
    expect(host.classList.contains('kp-rte--disabled')).toBe(true);
    expect(host.classList.contains('kp-rte--error')).toBe(true);
    expect(host.getAttribute('aria-disabled')).toBe('true');
  });

  it('toolbar buttons are disabled while [disabled]=true', () => {
    const { host } = setup({ disabled: true });
    // Most toolbar buttons get [disabled]; check that at least the marks group is.
    expect(buttons(host).every((b) => b.disabled)).toBe(true);
  });

  it('writeValue called before editor init stashes the html as pendingValue', () => {
    TestBed.configureTestingModule({ imports: [KpRichTextEditorComponent] });
    const fix = TestBed.createComponent(KpRichTextEditorComponent);
    // No detectChanges yet → ngAfterViewInit hasn't run, editor is null.
    fix.componentInstance.writeValue('<p>hello</p>');
    fix.detectChanges();
    // After init, editor should reflect the stashed content.
    expect(fix.componentInstance.editor?.getHTML()).toContain('hello');
    fix.destroy();
  });

  it('valueChange fires when the editor content updates', () => {
    const { fix, cmp } = setup();
    const spy = vi.fn();
    cmp.valueChange.subscribe(spy);
    cmp.editor?.commands.setContent('<p>changed</p>');
    cmp.editor?.chain().focus().insertContent(' more').run();
    expect(spy).toHaveBeenCalled();
    fix.destroy();
  });

  it('is() / isHeading() / alignIs() are safe to call before editor init', () => {
    TestBed.configureTestingModule({ imports: [KpRichTextEditorComponent] });
    const fix = TestBed.createComponent(KpRichTextEditorComponent);
    const cmp = fix.componentInstance;
    // Editor not yet created — these should not throw.
    expect(cmp.is('bold')).toBe(false);
    expect(cmp.isHeading(1)).toBe(false);
    expect(cmp.alignIs('left')).toBe(false);
    fix.destroy();
  });

  it('toggle("bold") flips the bold mark on a non-empty selection', () => {
    const { fix, cmp } = setup();
    cmp.editor?.commands.setContent('<p>hello</p>');
    cmp.editor?.commands.selectAll();
    cmp.toggle('bold');
    expect(cmp.editor?.getHTML()).toMatch(/<strong>hello<\/strong>/);
    fix.destroy();
  });

  it('setAlign("center") applies textAlign to a paragraph', () => {
    const { fix, cmp } = setup();
    cmp.editor?.commands.setContent('<p>line</p>');
    cmp.editor?.commands.selectAll();
    cmp.setAlign('center');
    expect(cmp.editor?.getHTML()).toMatch(/text-align:\s*center/);
    fix.destroy();
  });

  it('toggleHeading(2) wraps text in an h2', () => {
    const { fix, cmp } = setup();
    cmp.editor?.commands.setContent('<p>title</p>');
    cmp.editor?.commands.selectAll();
    cmp.toggleHeading(2);
    expect(cmp.editor?.getHTML()).toMatch(/<h2[^>]*>title<\/h2>/);
    fix.destroy();
  });

  it('openLinkBar opens the bar and seeds linkDraft from the active link href', () => {
    const { fix, cmp } = setup();
    cmp.editor?.commands.setContent('<p><a href="https://existing.dev">anchor</a></p>');
    cmp.editor?.commands.selectAll();
    cmp.openLinkBar();
    expect(cmp.linkOpen).toBe(true);
    expect(cmp.linkDraft).toBe('https://existing.dev');
    fix.destroy();
  });

  it('applyLink wraps the saved selection with the entered href, then closes the bar', () => {
    const { fix, cmp } = setup();
    cmp.editor?.commands.setContent('<p>anchor</p>');
    cmp.editor?.commands.selectAll();
    cmp.openLinkBar();
    cmp.linkDraft = 'https://example.com';
    cmp.applyLink();
    expect(cmp.editor?.getHTML()).toMatch(/<a [^>]*href="https:\/\/example\.com"/);
    expect(cmp.linkOpen).toBe(false);
    expect(cmp.linkDraft).toBe('');
    fix.destroy();
  });

  it('removeLink unsets the link mark and closes the bar', () => {
    const { fix, cmp } = setup();
    cmp.editor?.commands.setContent('<p><a href="https://x.dev">anchor</a></p>');
    cmp.editor?.commands.selectAll();
    cmp.openLinkBar();
    cmp.removeLink();
    expect(cmp.editor?.getHTML()).not.toMatch(/<a /);
    expect(cmp.linkOpen).toBe(false);
    fix.destroy();
  });

  it('applyLink with an empty draft is a no-op (bar stays open, content unchanged)', () => {
    const { fix, cmp } = setup();
    cmp.editor?.commands.setContent('<p>plain</p>');
    cmp.editor?.commands.selectAll();
    cmp.openLinkBar();
    cmp.linkDraft = '   ';
    const before = cmp.editor?.getHTML();
    cmp.applyLink();
    expect(cmp.editor?.getHTML()).toBe(before);
    expect(cmp.linkOpen).toBe(true);
    fix.destroy();
  });

  it('closeLinkBar resets state without touching the document', () => {
    const { fix, cmp } = setup();
    cmp.editor?.commands.setContent('<p>plain</p>');
    const before = cmp.editor?.getHTML();
    cmp.openLinkBar();
    cmp.linkDraft = 'https://discarded.dev';
    cmp.closeLinkBar();
    expect(cmp.editor?.getHTML()).toBe(before);
    expect(cmp.linkOpen).toBe(false);
    expect(cmp.linkDraft).toBe('');
    fix.destroy();
  });

  it('openLinkBar is a no-op when the editor is disabled', () => {
    const { fix, cmp } = setup({ disabled: true });
    cmp.openLinkBar();
    expect(cmp.linkOpen).toBe(false);
    fix.destroy();
  });

  it('onFileChosen emits (imageUpload) when an observer is subscribed', () => {
    const { fix, cmp } = setup();
    const file = new File(['x'], 'a.png', { type: 'image/png' });
    const upload = vi.fn();
    cmp.imageUpload.subscribe(upload);
    cmp.onFileChosen({ target: { files: [file], value: 'a.png' } } as unknown as Event);
    expect(upload).toHaveBeenCalled();
    const payload = upload.mock.calls[0][0];
    expect(payload.file).toBe(file);
    expect(typeof payload.resolve).toBe('function');
    fix.destroy();
  });

  it('setDisabledState(true) toggles the disabled host class and editor editability', () => {
    const { fix, host, cmp } = setup();
    cmp.setDisabledState(true);
    fix.detectChanges();
    expect(host.classList.contains('kp-rte--disabled')).toBe(true);
    expect(cmp.editor?.isEditable).toBe(false);
    cmp.setDisabledState(false);
    fix.detectChanges();
    expect(cmp.editor?.isEditable).toBe(true);
    fix.destroy();
  });
});
