# @kanso-protocol/elements

## 0.3.0

### Minor Changes

- - **Tree-shakeable per-component entry points.** `@kanso-protocol/elements/<name>` registers just that element (`defineKp<Name>()` / side-effect import); the all-in-one `@kanso-protocol/elements` bundle is unchanged. Entries are generated from the same catalog and share one lazily-created zoneless Angular runtime, so importing several still spins up one runtime.
  - **Native `<form>` participation via `ElementInternals`.** Form-control elements (input, textarea, number-stepper, slider, checkbox, toggle, radio, date-picker, time-picker) are now `formAssociated`: they reflect their value with `setFormValue`, and implement `formResetCallback` + `formDisabledCallback`. Feature-detected (no-op where `ElementInternals` is unsupported) and done entirely in the wrapper layer — the Angular components' `ControlValueAccessor` is untouched.

## 0.2.0

### Minor Changes

- Design-system integrity pass — make the architecture enforce what it declares.
  - **Enforcement gates (CI + husky).** `validate:tokens` (state-matrix completeness, the rest→hover→active ramp-step invariant, dark-override existence); `check:contrast` (WCAG AA on curated foreground/background token pairs in both themes — caught and fixed `icon-warning`, which was 2.15:1); machine-readable stability (`docs/stability.json` + a README/stability drift guard); and the `raw-motion-duration` / `raw-shadow` lint rules promoted from warn to error.
  - **Accessibility.** Tokenized focus ring (`--kp-focus-ring-width` / `-offset`); `prefers-reduced-motion` honored across all 43 animated components; `@media (forced-colors: active)` support for 29 interactive components (Windows High Contrast).
  - **MCP.** New `check_composition` tool (12 total) flags mixed sizes in a row and beta-tier usage; the manifest is deduped (one primary record per component + `subSelectors`), carries a `stability` tier, includes the previously-missing `table-virtual`, is deterministic, and is guarded by a CI freshness gate; Figma-node lookups degrade gracefully instead of serving a wrong node.
  - **Elements DX.** Ships `custom-elements.json` (Custom Elements Manifest) and generated `JSX.IntrinsicElements` types so `<kp-*>` type-checks in React/TSX; the elements bundle is now under the bundle-size budget; client-only SSR behavior is documented.
  - **Brand tool.** `generate-brand-theme` now measures WCAG contrast per hue (with `--enforce-aa`) instead of asserting the false "preserved by construction" guarantee.

  No breaking changes — every addition is additive and visually neutral (media-gated or value-identical).

## 0.1.4

### Patch Changes

- **New: `<kp-table-virtual>`** — a windowed table for large datasets (>500 rows), bundling `<kp-table>` + `<kp-virtual-list>` so consumers don't wire virtualization by hand. A sticky header sits over a virtualized body; header and rows share one CSS grid template (give columns a `width` or they share `1fr`); fixed `[rowHeight]` keeps scrolling cheap. Reuses Table's `KpTableColumn` model with `accessor` text cells + `kpVirtualTableCell` templates for rich cells, and emits `(rowClick)`. Semantics are a labelled list (mirroring `<kp-virtual-list>`), not a `role="grid"`. New secondary entry point `@kanso-protocol/ui/table-virtual` (and a `kp-table-virtual` custom element). This closes the last roadmap "Later" item — the catalog is feature-complete and fully `stable`.

## 0.1.3

### Patch Changes

- Rebuild the custom-elements bundle against `@kanso-protocol/ui@5.3.0` so the new Badge `counter` input and the textarea/button/filter-bar/header fixes are exposed as web components.

## 0.1.2

### Patch Changes

- Rebuild the custom-elements bundle against `@kanso-protocol/ui@5.2.0`, carrying the accordion animation, combobox dropdown sizing, dialog `start` footer, drawer `[modal]`/`floating`/`[elevated]`, and popover positioning improvements to React / Vue / plain-HTML consumers. No API change.

## 0.1.1

### Patch Changes

- Rebuild the custom-elements bundle against `@kanso-protocol/ui@5.1.2`, picking up the tooltip edge-positioning fix (arrow stays on the trigger near a viewport edge; tooltip repositions on scroll). No API change — the bundle just carries the latest component code.

## 0.1.0

### Minor Changes

- Initial release. Framework-agnostic custom elements for the Kanso Protocol design system: all 73 `kp-*` element-selector components (`<kp-badge>`, `<kp-card>`, `<kp-select>`, …) registered via `@angular/elements`, bundled with the Angular runtime so React / Vue / Svelte / plain HTML can render Kanso with no Angular host. Light-DOM rendering, so `@kanso-protocol/ui/styles/tokens.css` + brand themes apply. Auto-defines on import, or call `defineKansoElements()`. See `docs/web-components.md`.
