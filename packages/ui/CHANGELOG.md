# @kanso-protocol/ui

## 5.9.0

### Minor Changes

- f4d12e7: **NotificationCenter** — long-list pagination. Set `[pageSize]` to show the first N items with a "Show more" button that reveals the next page client-side; `(loadMore)` emits the new visible count so server-driven lists can append. Null `pageSize` shows everything, as before. Resolves the notification-center open question → promoted `beta → stable` (patterns now 16 stable · 4 beta).

## 5.8.0

### Minor Changes

- 707a87a: **UserMenu** — new `[presence]` input drives the avatar's presence dot (`online` / `away` / `busy` / `offline`, or `null` to hide it). Previously the dot was hard-coded to `online`. Resolves the user-menu open question → promoted `beta → stable` (patterns now 15 stable · 5 beta).

## 5.7.0

### Minor Changes

- 89b2799: **Sidebar** — optional collapse persistence. Set `[persistKey]="'…'"` and the expanded/collapsed choice is saved to `localStorage` under that key and restored on init (SSR-safe — no-op on the server / when storage is unavailable). Without a key, collapse stays session-scoped (in-memory), as before. Resolves the sidebar open question → promoted `beta → stable` (patterns now 14 stable · 6 beta).

## 5.6.0

### Minor Changes

- e59dc03: **StatCard** — new built-in data-driven sparkline. Pass `[sparklineData]="[…]"` (a numeric series, ≥2 points) to draw an inline trend line, colored by the card's trend tone (success / danger / accent). The `[kpStatCardSparkline]` projection slot still takes precedence for a custom chart, and `[showSparkline]` without data falls back to the placeholder. Resolves the stat-card open question → promoted `beta → stable` (patterns now 13 stable · 7 beta).

## 5.5.0

### Minor Changes

- 17957d7: **MarkdownViewer** — the default parser now lazy-loads `marked` via dynamic `import()` instead of a static top-level import, so consumers who don't render markdown eagerly can code-split it out of their initial bundle. `[parser]` now accepts a **synchronous or async** function (`(md) => string | Promise<string>`); rendering resolves on a microtask and triggers change detection. This resolves the markdown-viewer open question → promoted `beta → stable` (now 34 stable · 6 beta · 1 experimental).

## 5.4.1

### Patch Changes

- 97d999c: **Menu** — `<kp-dropdown-menu>` gains proper WAI-ARIA roving keyboard navigation. `Arrow Down` / `Arrow Up` move focus across enabled items (wrapping), `Home` / `End` jump to first / last, and section labels, dividers, and disabled items are skipped. `Tab` still works as before. This resolves the menu's last open API question, promoting it `beta → stable` (now 30 stable · 10 beta · 1 experimental).

## 5.4.0

### Minor Changes

- 39f0fff: i18n polish — unify validation messages under `KP_STRINGS` and auto-detect the timepicker clock format.
  - **Validation messages folded into `KP_STRINGS`.** Form-field validation copy now lives under `KP_STRINGS.validation` (one token for all localizable strings) — `{ provide: KP_STRINGS, useValue: { validation: { required: '…' } } }`. The standalone `KP_VALIDATION_MESSAGES` token is **deprecated but still honored** (merged on top), so existing apps keep working. Overrides may be partial; per-field `[errors]` still wins. Types + defaults (`KpValidationMessages`, `KP_DEFAULT_VALIDATION_MESSAGES`) now live in the `i18n` entry point and are re-exported from `form-field` for back-compat.
  - **`<kp-time-picker>` defaults to `format="auto"`**, deriving 12h/24h from `KP_LOCALE` (e.g. `en-US` → 12h, `de-DE` → 24h) via `Intl`. Pass `format="12h"` / `"24h"` to force a convention. Behavior change: under the default, a 12h locale now renders a 12h picker instead of the previous fixed 24h.

## 5.3.1

### Patch Changes

- 203ebf9: Dark theme token consistency — the dark theme's primary/accent semantic tokens now reference the accent ramp (`var(--kp-color-blue-*)`) instead of hardcoded literals, so a runtime brand recolor cascades through the dark theme exactly like it already did in light. 216 semantic overrides in `tokens/themes/dark.json` were converted from literals to references (173 were exact duplicates of a ramp stop — zero visual change; 43 primary/accent off-ramp tints were snapped to the lightness-nearest accent stop — a small refinement of the dark primary foreground/border shades). Status, neutral, and surface tokens stay fixed by design (a danger badge is red regardless of brand). The dark CSS format now honors `outputReferences` so these var() chains are preserved.

  Also adds a **Theme Editor** Storybook page (Foundations) for generating a custom theme: pick a brand color to recolor the whole accent ramp, or hand-tune any stop of any ramp in light/dark, with a live preview and CSS / DTCG-JSON export. (Storybook-only; not shipped in the package.)

## 5.3.0

### Minor Changes

- da21948: Storybook review batch — Badge gains an additive numeric counter plus several component fixes.
  - **Badge**: new `counter` input — a small rounded count chip rendered after the label (same idea as the Tabs count), fully additive (never changes the label/icon/dot/shape). Its background is a translucent tint of the current text color, so it adapts to any badge color. When a counter is present the badge's trailing padding tightens to match the chip's top/bottom inset. `count` shape padding is now per-size instead of a flat 2px so multi-digit counts (`12`, `99+`) no longer crowd the edges.
  - **Textarea**: `resize="both"` now resizes on both axes — resize moved from the inner field to the host so the bordered box grows/shrinks together.
  - **Button**: `iconOnly` / `disabled` / `loading` use `booleanAttribute`, so the bare `iconOnly` attribute correctly makes the button square.
  - **FilterBar**: filter chips now match the `sm` control height (28px) so they line up with the “Add filter” / “Clear all” buttons.
  - **Header**: the user button follows button-grammar padding and aligns to the 36px icon-button height.

## 5.2.0

### Minor Changes

- Component improvements from a Storybook review pass:
  - **accordion** — content panel now animates open/close smoothly (CSS `grid-template-rows` 0fr→1fr over `--kp-motion-duration-normal`, content kept in the DOM + `inert`/`aria-hidden` when collapsed; respects `prefers-reduced-motion`).
  - **combobox** — the dropdown panel + options now match the component `size` (the portaled panel previously lost the host size context and always rendered small).
  - **dialog** — new `footerLayout="start"` (actions packed left); mark a footer item `[kpDialogFooterEnd]` to push it (e.g. Cancel) to the right.
  - **drawer** — `[modal]` (set `false` for a non-modal drawer: no backdrop, no scroll-lock, page stays interactive); `[variant]="floating"` (inset from the edges, rounded all corners, works from any side); always-on subtle border; `[elevated]` for an optional shadow (light-theme friendly).
  - **popover** — positioning is now fully viewport-aware via the shared `computeOverlayPosition` (applies the flipped side + arrow offset so the arrow tracks the trigger), repositions on scroll/resize, keeps a gap so it no longer overlaps the trigger, and the inner buttons no longer flash a dark border on open.

  Also: revived the `kanso-lint-tokens` architecture gate (it scanned the pre-v5 `packages/{components,patterns}` paths and silently linted zero files since the single-package migration; now scans `packages/ui/*`), and tokenized one stray raw duration in `theme-toggle`.

## 5.1.2

### Patch Changes

- 7402928: Fix tooltip positioning near a viewport edge. Two gaps remained after the earlier flip/clamp work:
  - **Arrow drifted off the trigger when the body was edge-clamped.** When a trigger sits near a screen edge, the tooltip body is clamped inward, but the arrow stayed centred on the body — so it pointed away from the trigger. `computeOverlayPosition` now returns an `arrowOffset` that re-points the arrow at the trigger centre (clamped into the rounded-corner zone), and the tooltip applies it.
  - **Tooltip didn't follow its trigger on scroll/resize.** The fixed-positioned tooltip is now repositioned (rAF-throttled, capture-phase so scrollable ancestors count) while open, so it no longer drifts toward a screen edge when the page scrolls.

  `KpTooltipDirective` now uses the shared `computeOverlayPosition` util (removing a duplicated copy that could drift from it).

## 5.1.1

### Patch Changes

- SSR hardening. `theme-toggle` no longer throws during server-side teardown (its menu cleanup touched `window` unguarded), and `rich-text-editor` only instantiates its TipTap editor in the browser (`isPlatformBrowser`) — on the server it renders an empty host and boots on hydration. The other overlay/drag components were already guarded. See `docs/ssr.md` for the full SSR contract.

## 5.1.0

### Minor Changes

- `notification-item` rows are now interactive: the previously-declared `click$` output is wired to a real click, and the row is keyboard-operable (focusable, `Enter` / `Space` activate) — matching its `cursor: pointer` affordance. Before, `click$` never fired, so `notification-center`'s `(itemClick)` could not be triggered by a user. No template or input API changed; existing consumers that already subscribe to `itemClick` / `click$` start receiving events. Note rows now join the tab order.

## 5.0.0

### Major Changes

- Consolidate the former 64 per-component npm packages into a single `@kanso-protocol/ui` package with one secondary entry point per component and pattern (ADR 0002).

  **Breaking — packaging only.** No component selector, input, output, or template internal changed. This is a pure import-path migration:
  - Install once: `npm i @kanso-protocol/ui` (replaces all `@kanso-protocol/<name>` dependencies).
  - Import per-subpath: `@kanso-protocol/<name>` → `@kanso-protocol/ui/<name>` (components and patterns share one flat namespace).
  - `@kanso-protocol/core` (tokens / types / utils) folded into the package root: `@kanso-protocol/core` → `@kanso-protocol/ui`.
  - Styles: `@kanso-protocol/core/styles/*` → `@kanso-protocol/ui/styles/*`.
  - i18n: `@kanso-protocol/i18n` → `@kanso-protocol/ui/i18n`.

  Tree-shaking is preserved — each entry point is an independent ESM module. See [`docs/MIGRATION-v5.md`](https://github.com/GregNBlack/kanso-protocol/blob/main/docs/MIGRATION-v5.md) for the upgrade guide and codemod. The legacy 64 packages remain published at their final 4.x with a deprecation notice.
