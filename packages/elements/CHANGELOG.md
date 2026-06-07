# @kanso-protocol/elements

## 0.1.0

### Minor Changes

- Initial release. Framework-agnostic custom elements for the Kanso Protocol design system: all 73 `kp-*` element-selector components (`<kp-badge>`, `<kp-card>`, `<kp-select>`, …) registered via `@angular/elements`, bundled with the Angular runtime so React / Vue / Svelte / plain HTML can render Kanso with no Angular host. Light-DOM rendering, so `@kanso-protocol/ui/styles/tokens.css` + brand themes apply. Auto-defines on import, or call `defineKansoElements()`. See `docs/web-components.md`.
