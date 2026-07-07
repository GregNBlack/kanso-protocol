# Density

> One app-level preference that sets the **default** `size` for size-aware
> components. Explicit per-component `[size]` always wins.

## Contract

Kanso spacing is structural, not a brand axis (see [theming.md](../theming.md)) —
so density is deliberately coarse: three named steps, not a raw px scale. You
provide **one** preference at the app root and every size-aware component that
opts in uses it as its *default* size. A component that is handed an explicit
`[size]` keeps it — density only fills in the blank.

This is an additive, opt-in mechanism, not a global cascade: a component reads
density only if it has adopted the pattern (below). Today the flagship adopter
is **Table**; the rest keep their own `size` default until they adopt it, so
nothing changes for existing code.

Import: `@kanso-protocol/ui/density`

## API

### `KpDensity`

```ts
type KpDensity = 'compact' | 'comfortable' | 'spacious';
```

### `DENSITY_SIZE`

The 1:1 map from density to component `size`. `comfortable` is the historical
default, so an app that never provides density behaves exactly as before (`md`).

| Density | `size` | Example (table row height) |
|---|---|---|
| `compact` | `sm` | 40px |
| `comfortable` *(default)* | `md` | 48px |
| `spacious` | `lg` | 56px |

### `KP_DENSITY`

`InjectionToken<() => KpDensity>` — a **getter**, not a bare value, so the
preference can be backed by a signal / store selector and read lazily. It has
**no default factory**: adopters inject it with `{ optional: true }` and treat
its absence as `'comfortable'`.

### `provideKansoDensity(density)`

`EnvironmentProviders` factory. Accepts a static value or a `Signal<KpDensity>`.

```ts
import { provideKansoDensity } from '@kanso-protocol/ui/density';

// Static — every un-sized table renders at sm (40px rows):
bootstrapApplication(App, {
  providers: [provideKansoDensity('compact')],
});
```

```ts
// Reactive — a user preference the shell flips at runtime:
readonly density = signal<KpDensity>('comfortable');
// in the component's providers:
providers: [provideKansoDensity(this.density)];
```

### `resolveDensitySize(explicit, density)`

The shared helper adopters use so "explicit-size-wins" is implemented
identically everywhere:

```ts
size = explicit ?? DENSITY_SIZE[density?.() ?? 'comfortable']
```

## Table honors it today

`<kp-table>` is the flagship adopter. With `provideKansoDensity('compact')` at
the root, every un-sized table defaults to `sm` (40px rows) — the CRM dense-table
case — while an explicit `<kp-table size="lg">` still renders `lg`. With no
provider and no `size`, the table renders `md`, byte-identical to before.

```html
<!-- app root: providers: [provideKansoDensity('compact')] -->
<kp-table [columns]="cols" [data]="rows"></kp-table>   <!-- → sm -->
<kp-table [columns]="cols" [data]="rows" size="lg"></kp-table> <!-- → lg (explicit wins) -->
```

This composes with the **TableToolbar** density toggle: the toolbar's
`densityChange` output is a *local* per-surface control, while
`provideKansoDensity` is the *app-wide* default. Wire the toolbar to a signal
and pass that same signal to `provideKansoDensity` if you want the toggle to
drive the whole shell (see [table-toolbar.md](./table-toolbar.md)).

## Adopting it in another component

Any size-aware component (`input`, `select`, `menu`, `nav-item`, `form-field`,
…) can adopt density in three lines — no big-bang retrofit:

```ts
import { KP_DENSITY, DENSITY_SIZE } from '@kanso-protocol/ui/density';

private readonly _density = inject(KP_DENSITY, { optional: true });
private _size: KpSize | null = null;                       // null = not explicitly set
@Input() set size(v: KpSize) { this._size = v; }
get effectiveSize(): KpSize {
  return this._size ?? DENSITY_SIZE[this._density?.() ?? 'comfortable'];
}
```

Then render from `effectiveSize` instead of `size`. The `null` sentinel is the
"explicit?" flag: any assigned value — even one equal to the density default —
counts as explicit and wins over app-level density.

## Do / Don't

### Do
- **Provide density once, at the app root.** It's an environment-level default.
- **Keep explicit `[size]` for surfaces that must not move** (a marketing hero
  table, a fixed toolbar) — it always wins.
- **Back it with a signal** if you expose a user-facing density switch.

### Don't
- Don't reach for density to fix a single tight surface — set that surface's
  `[size]` instead. Density is a *system* default.
- Don't assume every component honors it yet. Adoption is incremental; Table is
  the first. Check the component doc.

## References

- **Source**: `packages/ui/density/src/`
- **Adopter**: `packages/ui/table/src/table.component.ts`
- **Related**: [table-toolbar.md](./table-toolbar.md), [theming.md](../theming.md)
