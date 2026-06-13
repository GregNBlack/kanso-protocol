# @kanso-protocol/elements

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
