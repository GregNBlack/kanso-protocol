# @kanso-protocol/avatar

## 1.0.0

### Minor Changes

- [`ecf9f67`](https://github.com/GregNBlack/kanso-protocol/commit/ecf9f675eac32407c8e345baa2162d923b6c964c) Thanks [@ManekeeNeko](https://github.com/ManekeeNeko)! - First public release — `0.1.0-alpha`.

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

  This is an **alpha**. The public API is _intentionally_ marked as mutable for this release:
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

### Patch Changes

- Updated dependencies [[`ecf9f67`](https://github.com/GregNBlack/kanso-protocol/commit/ecf9f675eac32407c8e345baa2162d923b6c964c)]:
  - @kanso-protocol/core@1.0.0
