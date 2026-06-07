# @kanso-protocol/ui

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
