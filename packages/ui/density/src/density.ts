import {
  EnvironmentProviders,
  InjectionToken,
  Signal,
  isSignal,
  makeEnvironmentProviders,
} from '@angular/core';

/**
 * App-level density preference — one semantic dial that sets the DEFAULT
 * `size` for every size-aware Kanso component (dense CRM tables, tight admin
 * forms, roomy marketing surfaces, …). It is intentionally coarse: three
 * named steps rather than a raw px scale, so the choice reads as a product
 * decision, not a styling knob.
 *
 * Density never overrides an explicit per-component `[size]` — a component
 * that is told its size keeps it. Density only fills in the default.
 */
export type KpDensity = 'compact' | 'comfortable' | 'spacious';

/** The component `size` value each density resolves to. */
export type KpDensitySize = 'sm' | 'md' | 'lg';

/**
 * Density → `size` map. `comfortable` is the historical default, so an app
 * with no density provider behaves exactly as it does today (`md`).
 *
 *   compact     → sm   (tightest — dense tables, data grids)
 *   comfortable → md   (default)
 *   spacious    → lg   (roomy — touch / marketing)
 */
export const DENSITY_SIZE: Readonly<Record<KpDensity, KpDensitySize>> = {
  compact: 'sm',
  comfortable: 'md',
  spacious: 'lg',
} as const;

/**
 * App-level density, exposed as a *getter* (`() => KpDensity`) rather than a
 * bare value. A getter lets consumers back the preference with a signal, an
 * NgRx selector, or a plain constant, and lets size-aware components read the
 * current value lazily (so a runtime density switch can re-flow the UI without
 * re-providing the token).
 *
 * Deliberately has **no default factory**: components inject it with
 * `{ optional: true }` and treat its absence as `'comfortable'`. That keeps an
 * app that never calls {@link provideKansoDensity} byte-identical to today.
 *
 * Provide it at the app root via {@link provideKansoDensity}.
 */
export const KP_DENSITY = new InjectionToken<() => KpDensity>('KP_DENSITY');

/**
 * Provide an app-level density preference. Accepts either a static value or a
 * `Signal<KpDensity>` for a runtime-switchable preference.
 *
 * Every size-aware component that reads {@link KP_DENSITY} uses this as its
 * DEFAULT `size`; an explicit `[size]` on the component always wins.
 *
 * @example
 * // Static — every un-sized table renders at `sm` (40px rows):
 * bootstrapApplication(App, {
 *   providers: [provideKansoDensity('compact')],
 * });
 *
 * @example
 * // Reactive — a user preference the shell can flip at runtime:
 * readonly density = signal<KpDensity>('comfortable');
 * providers: [provideKansoDensity(this.density)];
 */
export function provideKansoDensity(
  density: KpDensity | Signal<KpDensity>,
): EnvironmentProviders {
  const getter: () => KpDensity = isSignal(density)
    ? () => density()
    : () => density;
  return makeEnvironmentProviders([{ provide: KP_DENSITY, useValue: getter }]);
}

/**
 * Resolve an effective `size` from an explicit per-component size and the
 * app-level density getter. Shared helper so every size-aware component
 * implements "explicit-size-wins" identically:
 *
 *   size = explicit ?? DENSITY_SIZE[density?.() ?? 'comfortable']
 *
 * `explicit` is `null`/`undefined` when the component's `[size]` was never
 * set; in that case the density default (or the `comfortable` → `md` fallback)
 * applies.
 */
export function resolveDensitySize<S extends KpDensitySize>(
  explicit: S | null | undefined,
  density: (() => KpDensity) | null | undefined,
): S | KpDensitySize {
  if (explicit != null) return explicit;
  return DENSITY_SIZE[density?.() ?? 'comfortable'];
}
