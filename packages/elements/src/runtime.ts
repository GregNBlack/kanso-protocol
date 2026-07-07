/**
 * Shared custom-elements runtime.
 *
 * A single zoneless Angular application backs every Kanso `<kp-*>` element,
 * whether it's registered through the all-in-one bundle (`main.ts`) or a
 * granular per-component entry (`define/<name>.ts`). Centralizing the
 * bootstrap here means importing three granular entries still spins up ONE
 * Angular platform, and both paths share the same form-association wiring.
 */
import { type ApplicationRef, provideZonelessChangeDetection, type Type } from '@angular/core';
import { createApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { withFormAssociation } from './form-associated';

// Lazily created on first define; memoized so every element shares it.
let appRef: Promise<ApplicationRef> | null = null;
function application(): Promise<ApplicationRef> {
  return (appRef ??= createApplication({ providers: [provideZonelessChangeDetection()] }));
}

// In-flight / completed registration per tag → repeated calls are idempotent
// (the same element may be pulled in by two granular entries).
const registrations = new Map<string, Promise<void>>();

/**
 * Define a single Kanso custom element. Idempotent, and a no-op where
 * `customElements` is absent (SSR). Form-control tags are upgraded to be
 * form-associated via {@link withFormAssociation}; every other tag is
 * registered exactly as the all-in-one bundle always has.
 */
export function defineKansoElement(tag: string, component: Type<unknown>): Promise<void> {
  if (typeof customElements === 'undefined') return Promise.resolve();

  const inFlight = registrations.get(tag);
  if (inFlight) return inFlight;
  if (customElements.get(tag)) {
    const done = Promise.resolve();
    registrations.set(tag, done);
    return done;
  }

  const done = application().then((ref) => {
    if (customElements.get(tag)) return;
    const ctor = createCustomElement(component, { injector: ref.injector });
    customElements.define(tag, withFormAssociation(tag, ctor));
  });
  registrations.set(tag, done);
  return done;
}
