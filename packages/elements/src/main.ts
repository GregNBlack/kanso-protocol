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
import { provideZonelessChangeDetection } from '@angular/core';
import { createApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { KANSO_ELEMENTS } from './registry.generated';

let defined: Promise<void> | null = null;

/** Define all Kanso custom elements. Idempotent. */
export function defineKansoElements(): Promise<void> {
  if (defined) return defined;
  defined = createApplication({
    providers: [provideZonelessChangeDetection()],
  }).then((app) => {
    for (const { tag, component } of KANSO_ELEMENTS) {
      if (typeof customElements !== 'undefined' && !customElements.get(tag)) {
        customElements.define(tag, createCustomElement(component, { injector: app.injector }));
      }
    }
  });
  return defined;
}

// Auto-define for the `<script type="module" src="kanso-elements.mjs">` path.
if (typeof customElements !== 'undefined') {
  void defineKansoElements();
}
