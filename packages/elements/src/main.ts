/**
 * Kanso custom-elements bundle.
 *
 * Registers every element-selector Kanso component as a native custom
 * element (`<kp-badge>`, `<kp-card>`, …) via @angular/elements, so React,
 * Vue, Svelte, or plain HTML can consume the design system without Angular.
 *
 * Inputs map to element attributes/properties; outputs map to DOM
 * CustomEvents. Components render in light DOM, so the global
 * `@kanso-protocol/ui/styles/tokens.css` + brand themes apply unchanged.
 *
 * Loaded as a module script it auto-defines on import; or import
 * `defineKansoElements()` and call it yourself to control timing.
 */
import { KANSO_ELEMENTS } from './registry.generated';
import { defineKansoElement } from './runtime';

let defined: Promise<void> | null = null;

/** Define all Kanso custom elements. Idempotent. */
export function defineKansoElements(): Promise<void> {
  if (defined) return defined;
  // Register every element through the shared runtime (one Angular app,
  // form-associated where applicable) — same one-shot promise as before.
  defined = Promise.all(
    KANSO_ELEMENTS.map(({ tag, component }) => defineKansoElement(tag, component)),
  ).then(() => undefined);
  return defined;
}

// Auto-define for the `<script type="module" src="kanso-elements.mjs">` path.
if (typeof customElements !== 'undefined') {
  void defineKansoElements();
}
