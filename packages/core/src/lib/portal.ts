/**
 * Find the right portal target for a floating overlay (select dropdown,
 * combobox listbox, popover panel, etc.) so it stays in the same
 * stacking context as its trigger.
 *
 * Background: Kanso `<kp-dialog>` uses native `<dialog>.showModal()`
 * which places the dialog in the browser's **top-layer**. Anything
 * portaled to `document.body` ends up BELOW the top-layer — invisible
 * and inert. To stay visible / interactive, overlays must portal
 * inside the nearest open `<dialog>` ancestor instead.
 *
 * Outside a dialog, `document.body` is still the right target so the
 * overlay isn't clipped by any transformed / overflow:hidden ancestor.
 *
 * @example
 * const target = findPortalTarget(this.host.nativeElement, this.doc);
 * if (target && el.parentElement !== target) target.appendChild(el);
 */
export function findPortalTarget(host: HTMLElement, doc: Document): HTMLElement {
  let el: HTMLElement | null = host;
  while (el) {
    if (el.tagName === 'DIALOG' && (el as HTMLDialogElement).open) return el;
    el = el.parentElement;
  }
  return doc.body;
}
