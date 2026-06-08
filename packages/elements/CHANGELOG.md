# @kanso-protocol/elements

## 0.1.2

### Patch Changes

- Rebuild the custom-elements bundle against `@kanso-protocol/ui@5.2.0`, carrying the accordion animation, combobox dropdown sizing, dialog `start` footer, drawer `[modal]`/`floating`/`[elevated]`, and popover positioning improvements to React / Vue / plain-HTML consumers. No API change.

## 0.1.1

### Patch Changes

- Rebuild the custom-elements bundle against `@kanso-protocol/ui@5.1.2`, picking up the tooltip edge-positioning fix (arrow stays on the trigger near a viewport edge; tooltip repositions on scroll). No API change — the bundle just carries the latest component code.

## 0.1.0

### Minor Changes

- Initial release. Framework-agnostic custom elements for the Kanso Protocol design system: all 73 `kp-*` element-selector components (`<kp-badge>`, `<kp-card>`, `<kp-select>`, …) registered via `@angular/elements`, bundled with the Angular runtime so React / Vue / Svelte / plain HTML can render Kanso with no Angular host. Light-DOM rendering, so `@kanso-protocol/ui/styles/tokens.css` + brand themes apply. Auto-defines on import, or call `defineKansoElements()`. See `docs/web-components.md`.
