# Theming

Kanso is built to be recolored. This guide covers the three things you'll actually do: **switch light/dark**, **recolor to your brand**, and **build a fully custom theme**.

## How theming works (the 30-second model)

Tokens are layered: **primitive** ramps (`--kp-color-blue-600`, `--kp-color-gray-200`, …) → **semantic** roles (`--kp-color-primary-default-bg-rest`, `--kp-color-text-strong`, …) → components only ever consume the semantic layer (lint-enforced; zero raw primitives in component CSS).

Crucially, the generated CSS keeps the alias chain rather than baking values:

```css
--kp-color-blue-600: #2563eb;                                  /* primitive */
--kp-color-primary-default-bg-rest: var(--kp-color-blue-600);  /* semantic → references it */
```

Because the semantic layer is `var()`-chained to the primitives, **redefining a primitive ramp at runtime cascades to every semantic token that references it** — no rebuild, no recompile. The accent / primary ramp is `--kp-color-blue-*` (the name is historical; it *is* the brand color — 114 semantic tokens chain to it).

## 1. Light / dark

Set `data-theme` on any element; everything under it switches. Load both stylesheets:

```ts
import '@kanso-protocol/ui/styles/tokens.css';   // light (also the :root default)
import '@kanso-protocol/ui/styles/dark.css';     // [data-theme="dark"] overrides
```

```html
<html data-theme="dark">            <!-- whole app -->
<section data-theme="light">        <!-- island back to light -->
```

The `theme-toggle` pattern wires light / dark / system for you.

## 2. Recolor to your brand (runtime, no rebuild)

Generate an override of the accent ramp from a single brand hex:

```bash
npm run theme:brand -- "#7C3AED" > brand.css
# or scope it to a wrapper class for multi-brand pages:
npm run theme:brand -- "#7C3AED" --selector ".brand-acme" > brand.css
```

It emits the 11 accent stops, **keeping each stop's lightness + saturation from the reference ramp and swapping only the hue** — so the contrast relationships Kanso tunes for WCAG AA are preserved by construction:

```css
:root {
  --kp-color-blue-50: #f5efff;
  /* … */
  --kp-color-blue-600: #6e25eb;
  --kp-color-blue-950: #2d1754;
}
```

Load it **after** the token stylesheet:

```ts
import '@kanso-protocol/ui/styles/tokens.css';
import '@kanso-protocol/ui/styles/dark.css';
import './brand.css';   // your generated accent override — wins by cascade order
```

Every button, link, focus ring, selected state, accent badge, etc. now uses your hue. Status colors (success/warning/danger/info) and neutrals (gray) are intentionally untouched — recoloring those would break their meaning.

> **Re-verify contrast for your hue.** The generator preserves the reference lightness ladder, so AA relationships hold in the common case, but a very light or very saturated brand hue can drift. Run the story you care about through the a11y addon (or `npm run test:storybook`) before shipping.

### Multi-brand on one page

Generate each brand scoped to a class and wrap the subtree:

```bash
npm run theme:brand -- "#7C3AED" --selector ".brand-acme"  >> brands.css
npm run theme:brand -- "#0EA5E9" --selector ".brand-globex" >> brands.css
```

```html
<div class="brand-acme">…Acme-colored Kanso…</div>
<div class="brand-globex">…Globex-colored Kanso…</div>
```

### Overriding more than the accent

Any primitive ramp can be overridden the same way — just declare the stops yourself. To shift neutrals or a status color:

```css
:root {
  --kp-color-gray-200: #e7e5e4;   /* warmer borders/surfaces */
  --kp-color-green-700: #15803d;  /* your success green */
}
```

If you'd rather retarget at the semantic level (e.g. point *all* primary backgrounds at a fixed color regardless of ramp), override the semantic token directly:

```css
:root { --kp-color-primary-default-bg-rest: #6e25eb; }
```

## 3. Fully custom theme (build-time, for vendors / forks)

For a permanent brand baked into your own distribution, edit the source tokens and rebuild rather than overriding at runtime:

1. Edit `tokens/primitive/color.json` (the accent ramp, neutrals, status hues) and/or `tokens/semantic/color.json`.
2. Dark-mode deltas live in `tokens/themes/dark.json`.
3. Rebuild: `npm run build:tokens` → regenerates `packages/ui/styles/{tokens.css,dark.css,_tokens.scss}` and the JS/TS token constants.
4. `kanso-lint-tokens` enforces the architecture (no raw colors / physical CSS) — keep it green.

This is the right path when you maintain a fork; for app-level branding, prefer the runtime override in §2 (survives Kanso upgrades untouched).

## Sass consumers

The same tokens ship as compile-time `$kp-*` variables:

```scss
@use '@kanso-protocol/ui/styles/tokens' as *;   // $kp-color-blue-600, …
```

Runtime overrides (§2) still win at the CSS-variable layer, so you can mix both.

## What you can't theme (by design)

- **Component anatomy / spacing ramp** — structural, not a brand surface. Density modes are tracked in [`docs/stability.md`](stability.md), not themable today.
- **Motion durations / easing** — tokens exist but aren't a branding axis.

See [`docs/tokens.md`](tokens.md) for the full token reference and [`docs/stability.md`](stability.md) for the open semantic-token questions.
