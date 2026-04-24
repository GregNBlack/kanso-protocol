---
"@kanso-protocol/core": minor
"@kanso-protocol/accordion": minor
"@kanso-protocol/alert": minor
"@kanso-protocol/avatar": minor
"@kanso-protocol/avatar-group": minor
"@kanso-protocol/badge": minor
"@kanso-protocol/breadcrumbs": minor
"@kanso-protocol/button": minor
"@kanso-protocol/card": minor
"@kanso-protocol/checkbox": minor
"@kanso-protocol/combobox": minor
"@kanso-protocol/datepicker": minor
"@kanso-protocol/dialog": minor
"@kanso-protocol/divider": minor
"@kanso-protocol/drawer": minor
"@kanso-protocol/empty-state": minor
"@kanso-protocol/form-field": minor
"@kanso-protocol/input": minor
"@kanso-protocol/menu": minor
"@kanso-protocol/number-stepper": minor
"@kanso-protocol/pagination": minor
"@kanso-protocol/popover": minor
"@kanso-protocol/progress": minor
"@kanso-protocol/radio": minor
"@kanso-protocol/rich-text-editor": minor
"@kanso-protocol/segmented-control": minor
"@kanso-protocol/select": minor
"@kanso-protocol/skeleton": minor
"@kanso-protocol/slider": minor
"@kanso-protocol/table": minor
"@kanso-protocol/tabs": minor
"@kanso-protocol/textarea": minor
"@kanso-protocol/timepicker": minor
"@kanso-protocol/toast": minor
"@kanso-protocol/toggle": minor
"@kanso-protocol/tooltip": minor
"@kanso-protocol/tree": minor
"@kanso-protocol/app-shell": minor
"@kanso-protocol/banner": minor
"@kanso-protocol/container": minor
"@kanso-protocol/filter-bar": minor
"@kanso-protocol/form-section": minor
"@kanso-protocol/grid": minor
"@kanso-protocol/header": minor
"@kanso-protocol/nav-item": minor
"@kanso-protocol/notification-center": minor
"@kanso-protocol/page-error": minor
"@kanso-protocol/page-header": minor
"@kanso-protocol/row": minor
"@kanso-protocol/search-bar": minor
"@kanso-protocol/settings-panel": minor
"@kanso-protocol/sidebar": minor
"@kanso-protocol/stack": minor
"@kanso-protocol/stat-card": minor
"@kanso-protocol/table-toolbar": minor
"@kanso-protocol/theme-toggle": minor
"@kanso-protocol/user-menu": minor
---

First public release — `0.1.0-alpha`.

**What's in the box**

- 37 Angular components (form controls, overlays, layout primitives, data display)
- 20 composition patterns (AppShell, Header, Sidebar, FilterBar, StatCard, …)
- `@kanso-protocol/core` — design tokens (CSS vars, SCSS, TS constants) generated from a W3C DTCG source
- Dark theme — `packages/core/styles/dark.css` flips primitives under `[data-theme="dark"]`
- Reactive-forms integration — every form component implements `ControlValueAccessor`
- `KpFormField` auto-reads `NgControl` errors and renders messages from a per-app dictionary (`KP_VALIDATION_MESSAGES`)
- Storybook with live docs: <https://gregnblack.github.io/kanso-protocol>
- 146 unit tests across 26 suites (≈43% of packages covered)
- a11y gate — `@storybook/test-runner` + axe-core on every story (currently advisory)

**Stability**

This is an **alpha**. The public API is *intentionally* marked as mutable for this release:

- Component selectors, inputs, outputs, and CSS class names may change in any 0.x.y bump
- Tokens and variable collections may be renamed as Figma sync stabilizes
- Breaking changes will be called out in the changelog but not gated behind major versions until `1.0.0`

If you're shipping to production, pin the exact version or stay on `main` until we hit `1.0.0`.

**What's missing (roadmap to 1.0)**

- Unit-test coverage for the remaining 12 components (datepicker, drawer, menu, popover, rich-text-editor, select, slider, table, timepicker, toast, tree)
- Manual a11y audit (keyboard, screen readers, focus traps)
- RTL support
- Motion guidelines as tokens
- Vendored fonts + icons (Onest, Tabler — currently via CDN)
