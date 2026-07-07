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

## 1. Light / dark / high-contrast

Set `data-theme` on any element; everything under it switches. Each theme is one stylesheet you opt into — load the ones you need:

```ts
import '@kanso-protocol/ui/styles/tokens.css';          // light (also the :root default)
import '@kanso-protocol/ui/styles/dark.css';            // [data-theme="dark"] overrides
import '@kanso-protocol/ui/styles/high-contrast.css';   // [data-theme="high-contrast"] overrides
```

```html
<html data-theme="dark">                     <!-- whole app -->
<section data-theme="light">                 <!-- island back to light -->
<section data-theme="high-contrast">         <!-- max-contrast island -->
```

The `theme-toggle` pattern wires light / dark / system for you.

### High-contrast (first pass)

`high-contrast` is a **light-based, maximum-contrast** theme (`color-scheme: light`, white page, black text). It's authored with the *same* primitive-ramp-override cascade dark.json uses (`tokens/themes/high-contrast.json`): the gray ramp is pushed to a black-on-white ladder, so every `var(--kp-color-gray-*)` reference cascades to a maximum-contrast value. The result — text, icons, borders and muted text all clear **WCAG AAA (≥7:1)** on the white surface, with strong near-black borders and a high-visibility focus ring (blue-700, ~6.7:1, vs the default blue-400 at ~2:1).

Accents (blue/red/green/amber/cyan) are **not** overridden — they keep their light-theme stops, which are already the strongest audited foreground stops, so brand and status colors stay recognisable and at least AA.

Because the gray ramp is inverted for *contrast* (not for a dark surface), a handful of `gray-200`/`gray-300` stops that double as *tinted surfaces* rather than borders (`surface.strong`, `avatar.bg.default`, the neutral-button subtle/ghost hover/active fills, etc.) would cascade too dark and bury their own content, so they're pinned back to light explicitly at the bottom of the file — exactly the way dark.json pins its alert/badge subtle backgrounds.

**Documented first-pass limitations** (not bugs): disabled control chrome that aliases `gray-200`/`gray-300` stays on the darkened ramp (WCAG exempts disabled controls, and the darker chrome still reads as inactive next to the saturated enabled states); and colored *status foregrounds* keep their light AA-tuned stops (several already ≥7:1, the rest ≥4.5:1) rather than being pushed to AAA. A future pass can tighten both.

### Adding another theme

Themes are data-driven. Drop a `tokens/themes/<name>.json` override file, add an entry to the `THEMES` array in `style-dictionary.config.js` (its `name` + a `prelude` of `color-scheme` / `background` / `color`, and an optional header `note`), and run `npm run build:tokens` — it loops every theme and emits `packages/ui/styles/<name>.css` under `[data-theme="<name>"]`. No per-theme wiring in the build script.

## 2. Recolor to your brand (runtime, no rebuild)

Generate an override of the accent ramp from a single brand hex:

```bash
npm run theme:brand -- "#7C3AED" > brand.css
# or scope it to a wrapper class for multi-brand pages:
npm run theme:brand -- "#7C3AED" --selector ".brand-acme" > brand.css
```

It emits the 11 accent stops, **keeping each stop's lightness + saturation from the reference ramp and swapping only the hue**:

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

Every button, link, focus ring, selected state, accent badge, etc. now uses your hue. Status colors (success/warning/danger/info) and neutrals (gray) are left untouched **by default** — recoloring those carelessly would break their meaning — but you can opt into retinting them with `--neutral` / `--status` ([below](#recoloring-neutrals-and-status-too)).

> **Contrast is measured, not assumed.** The reference lightness ladder is a11y-tuned *for blue*: at a fixed lightness, luminance changes with hue, so a stop that clears WCAG AA on white at blue's hue can fail at yours — a yellow or cyan accent is far lighter than blue at the same lightness. The generator therefore **measures** the foreground stops and prints a per-stop report to **stderr**:
>
> ```text
> contrast report — accent #EAB308 (hue 45°), AA needs 4.5:1
>   stop 600 vs white: 1.80:1 (AA <needs 4.5>: FAIL)
>   stop 700 vs white: 2.17:1 (AA <needs 4.5>: FAIL)
>   stop 400 (accent) vs dark #18181B: 12.45:1 (AA <needs 4.5>: PASS)
> ```
>
> It checks the stops that act as **foreground**: 600 and 700 on white (light-mode text/icon/accent) and 400 on the dark body surface `#18181B`. By default the lightness is kept exactly and failures are reported as warnings only.
>
> Pass **`--enforce-aa`** to auto-nudge any failing foreground stop's lightness (hue + saturation unchanged) until it clears AA; the adjustment is noted in the emitted CSS comment:
>
> ```bash
> npm run theme:brand -- "#EAB308" --enforce-aa > brand.css
> ```
>
> Either way, verify the story you care about through the a11y addon (or `npm run test:storybook`) before shipping — the tool only checks these representative foreground stops.

### Recoloring neutrals and status too

By default the generator recolors only the accent ramp. Two opt-in flags extend it to the rest of the palette — same keep-lightness/saturation hue-swap, same per-hue WCAG measurement (and the same `--enforce-aa` auto-nudge) applied to each recolored ramp:

```bash
# Warm-tinted neutrals (the gray ramp carries a small saturation, so a hue
# swap yields warm/cool grays for borders + surfaces):
npm run theme:brand -- "#7C3AED" --neutral "#78716C" > brand.css

# Retint status ramps (success→green, danger→red, warning→amber, info→cyan):
npm run theme:brand -- "#7C3AED" --status success:#0D9488,danger:#E11D48 > brand.css

# Everything at once, with AA enforcement:
npm run theme:brand -- "#7C3AED" --neutral "#78716C" \
  --status success:#0D9488,danger:#E11D48,warning:#F59E0B,info:#0EA5E9 --enforce-aa > brand.css
```

The positional accent hex becomes optional once `--neutral` or `--status` is present (recolor only what you pass). Each ramp gets its own contrast block on stderr; `--neutral` checks the text stops (500/600/700 on white), `--status` checks 600/700 on white + 400 on the dark surface — so a hue whose luminance drifts (a teal "success", a yellow "warning") is caught, not assumed. Everything lands in one selector block you load after `tokens.css` exactly like the accent-only output.

> **Status colors carry meaning — retint, don't repurpose.** Keep success greenish, danger reddish, etc. Swapping danger to a calm blue defeats the semantic. The tool won't stop you, but the contrast report is the only guardrail.

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

- **Component anatomy / spacing ramp** — structural, not a brand surface. There is no *global* density theme that re-scales the whole shell at once (making one would reverse this stance and touch every component). Density is available **per surface** via each component's `size` input — e.g. a compact data table is `<kp-table size="sm">`, wired from the toolbar's density toggle ([recipe](patterns/table-toolbar.md#wiring-density-to-a-table)).
- **Motion durations / easing** — tokens exist but aren't a branding axis.

See [`docs/tokens.md`](tokens.md) for the full token reference and [`docs/stability.md`](stability.md) for the open semantic-token questions.
