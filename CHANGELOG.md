# Changelog

This file is updated by [changesets](https://github.com/changesets/changesets) when packages are versioned. Per-package changelogs live next to each package under `packages/**/CHANGELOG.md`.

## Release cadence

- **Alpha (`0.x.y`)** — API may change in any minor bump. No backward-compatibility guarantees. Pin exact versions.
- **Beta (`1.0.0-beta.N`)** — API frozen; only breaking fixes. Feedback phase.
- **Stable (`>=1.0.0`)** — strict SemVer; breaking changes only in major bumps, with deprecation cycles.

---

## `0.1.0` — initial alpha

First public release of the Angular component library + design tokens.

### Foundations

- **W3C DTCG tokens** — color, spacing, radius, motion, typography. Single source of truth shared by Figma library and CSS variables (built via Style Dictionary).
- **Light + dark themes** — every primitive token has both modes. Apply with `data-theme="dark"` on any ancestor (commonly `<html>`).
- **CSS-first composition** — every component reads tokens via CSS custom properties, so consumers can re-skin a single component or the whole system without forking.

### Components — `@kanso-protocol/{name}` (36 packages)

`accordion`, `alert`, `avatar`, `avatar-group`, `badge`, `breadcrumbs`, `button`, `card`, `checkbox`, `combobox`, `datepicker`, `dialog`, `divider`, `drawer`, `empty-state`, `form-field`, `input`, `menu`, `number-stepper`, `pagination`, `popover`, `progress`, `radio`, `rich-text-editor`, `segmented-control`, `select`, `skeleton`, `slider`, `table`, `tabs`, `textarea`, `timepicker`, `toast`, `toggle`, `tooltip`, `tree`.

Highlights:

- **Form controls** (`input`, `textarea`, `select`, `combobox`, `checkbox`, `radio`, `toggle`, `slider`, `datepicker`, `timepicker`, `number-stepper`) implement `ControlValueAccessor` — they plug into Reactive Forms and template-driven `ngModel` the same way native inputs do.
- **Form-field** auto-detects an `NgControl` content child, listens to `statusChanges` + `valueChanges`, and renders the right validation message via the `KP_VALIDATION_MESSAGES` injection token (defaults cover `required`, `email`, `min`, `max`, `minLength`, `maxLength`, `pattern`).
- **Overlays** (`dialog`, `drawer`, `popover`, `menu`, `tooltip`, `toast`) portal into `<body>` to escape clipped / transformed ancestors. Backdrop click + Esc close where appropriate.
- **Toast** queue is signal-driven via `KpToastService`; drop one (or more, one per corner) `<kp-toast-host/>` anywhere.
- **Rich text editor** is built on TipTap (ProseMirror) and exposes its HTML via `ControlValueAccessor` like every other form control. Toolbar covers history, marks, blocks, lists, alignment, link (inline editor), and image (delegated to host app via `(imageUpload)`).

### Patterns — `@kanso-protocol/{name}` (20 packages)

`app-shell`, `banner`, `container`, `filter-bar`, `form-section`, `grid`, `header`, `nav-item`, `notification-center`, `page-error`, `page-header`, `row`, `search-bar`, `settings-panel`, `sidebar`, `stack`, `stat-card`, `table-toolbar`, `theme-toggle`, `user-menu`.

Patterns are larger compositions (page shells, layouts, multi-control bars) built on top of components. Each is its own publishable package so consumers only pay for what they import.

### Quality

- **330 unit tests across 38 spec files** (Vitest + Angular `@angular/build:unit-test` runner) covering every shipped component. See the live [Storybook Test Coverage page](https://gregnblack.github.io/kanso-protocol/?path=/docs/foundations-test-coverage--docs).
- **Storybook** docs deployed to `https://gregnblack.github.io/kanso-protocol/` — every component and pattern has stories with controls, source, and usage docs.
- **CI** — install + tests + Storybook build + `ng-packagr` build for all 56 packages on every push.

### Known limitations / out of scope for `0.1.0`

- **API is intentionally unstable.** Until `1.0`, any minor bump (`0.x.y`) may include breaking changes. Pin exact versions in production.
- **No SSR yet** — components are tested in browser / jsdom only. SSR support is on the roadmap but not validated for `0.1.0`.
- **Manual a11y audit pending.** Components ship with sensible ARIA roles, labels, and keyboard handling, but a formal screen-reader / focus-trap audit is on the `0.2.x` track.
- **No RTL pass yet** — layout assumes LTR. RTL is on the roadmap.
- **Onest font + Tabler icons** are referenced via the host app's font/icon stack; no CDN vendoring inside packages yet.

### Install

```sh
npm install @kanso-protocol/<package>
# e.g. npm install @kanso-protocol/button @kanso-protocol/input @kanso-protocol/form-field
```

Components are standalone and tree-shakeable — import only what you use.
