# @kanso-protocol/core

## 2.0.3

### Patch Changes

- a11y phase 2: AA contrast cleanup + ARIA cleanup. axe-core violations dropped from ~130 to 14 (zero critical) across 9 rounds; CI gate now blocks on critical impacts (`continue-on-error` removed). Notable token shifts:
  - light `accent.{primary,danger,success,warning,info}.fg`: `brand.600 → brand.700` (AA fix on white)
  - light `badge.{success,info}.filled.bg/border`: `brand.600 → brand.700`
  - light `input.placeholder.default` + `text.disabled` + `tree.node.fg.disabled`: `gray.400 → gray.500`
  - light `header.nav-item.fg.active`: `blue.600 → blue.700`
  - light `progress.{primary,success,danger}.fill`: `brand.600 → brand.700`
  - new primitive `foreground.on-dark-accent-primary` = `#60A5FA` (fixed in both modes, for `kp-header--dark` / `kp-sidebar--dark` active states)
  - dark overrides added for: button outline/ghost fg (primary + danger × rest/hover/focus/loading), badge outline fg (5 colors), badge warning filled fg, header nav-item active, tree node selected/disabled + bg selected, form required optional, input placeholder, text disabled

  All packages bump together per `fixed: [["@kanso-protocol/*"]]` config — listing core only.

## 2.0.2

### Patch Changes

- new `[arrowAlign]` input + dialog top-layer fix + findPortalTarget helper.

## 2.0.1

### Patch Changes

- Fix a11y regression in radio-based controls (checkbox, radio,
  segmented-control, theme-toggle, toggle) introduced in 2.0.0.

  The native `<input>` elements wrapped by the visual controls were
  hidden via `opacity: 0; position: absolute`. Axe-core (and some
  screen-reader heuristics) treat opacity-0 elements as removed from
  the accessibility tree — so `role="radiogroup"` was flagged as
  `aria-required-children: critical` because axe couldn't see the
  implicit `role="radio"` on the hidden inputs.

  Replaced with the canonical sr-only `clip-path: inset(50%)` pattern:
  the input stays in the layout flow and the a11y tree, but is clipped
  to 1×1 px off-screen. Label-wrapping forwards click to the input
  natively (no behaviour change). Visual rendering unchanged.

  Also refreshes visual-regression baselines — many component visuals
  shifted slightly when 2.0.0 swapped custom elements for native HTML
  primitives (inner `<label>` wrapping, native `<button>` defaults, etc.).

## 2.0.0

### Major Changes

- **Breaking — 10 components refactored to use real native HTML primitives.**

  The previous implementations re-implemented form-control behavior in
  custom elements via `role` attributes, manual key handlers, and
  JS-mirrored state. They didn't participate in `<form>` submission,
  didn't appear in FormData, didn't trigger HTML5 validation, and
  couldn't be associated with `<label for>`. Browser-native APIs like
  `<dialog>.showModal()` and `<input type=radio>` mutual-exclusion were
  re-implemented when they should have been used directly.

  This release replaces those with real native elements:

  ### Component-by-component
  - **Button** — selector changed from `<kp-button>` to `button[kpButton]`
    (attribute on a native `<button>`). Forwards `type` / `form` / `name`
    / `value` / `formaction` natively. New `[type]` input (defaults to
    `"button"`).
  - **Checkbox** — wraps a real `<input type="checkbox">` inside a
    `<label>`. New inputs: `name`, `value`, `required`. Indeterminate is
    now the native DOM property.
  - **Radio** — wraps a real `<input type="radio">`. Inside a
    `<kp-radio-group>`, browser-native mutual-exclusion via shared `name`
    replaces manual register/unregister deselection.
  - **Toggle** — wraps `<input type="checkbox" role="switch">`. New
    inputs: `name`, `value`, `required`.
  - **Tab** — selector changed from `<kp-tab>` to `button[kpTab]`.
  - **SegmentedControl** — segments are real `<input type="radio">` in a
    `role="radiogroup"`. Browser handles arrow-key navigation + mutual
    exclusion. New `[name]` input.
  - **ThemeToggle** — segmented variant is now a real radio group.
  - **FileUpload** — drop zone is a real `<label>` wrapping `<input
type="file">`. New inputs: `name`, `required`.
  - **Dialog** — backed by the native `<dialog>` element. Focus trap,
    top-layer stacking, ESC-to-close, and `::backdrop` styling are
    browser-native. Component falls back to attribute toggling in
    environments missing `showModal()` (e.g. jsdom).
  - **Select** — adds a hidden mirror `<input>` so the listbox
    participates in FormData and HTML5 validation. New inputs: `name`,
    `required`.

  ### Migration

  ```diff
  - <kp-button variant="default" color="primary">Save</kp-button>
  + <button kpButton variant="default" color="primary" type="submit">Save</button>

  - <kp-tab label="Inbox" [selected]="..."/>
  + <button kpTab label="Inbox" [selected]="..."></button>
  ```

  Checkbox / Radio / Toggle / FileUpload / SegmentedControl / Dialog /
  ThemeToggle / Select keep their existing tags — their template
  internals changed but the public selector is unchanged.

  ### Dark-mode polish (bundled)

  `color/tabs/tab/fg/selected` and `color/tabs/tab/icon/selected` now
  have a dark-mode override (`#FAFAFA`) — the brand-blue `#2563eb` had
  weak contrast against the dark page bg. Light mode is unchanged.

## 1.0.1

### Patch Changes

- Fix dark-mode contrast for floating overlays — popovers were nearly
  indistinguishable from the page background.

  In dark mode, `--kp-color-surface-base` (`#18181b`) is only ~7 ΔL away
  from the page bg (`--kp-color-surface-subtle`, `#09090b`). Every
  floating overlay used `surface-base` for its panel, so they all
  visually merged with the page underneath them.

  Routes the panels through `--kp-color-popover-bg` instead — already
  defined as `#1f1f22` in dark, ~11 extra ΔL above the page, clearly
  separated. Borders likewise switch to `popover-border`.

  Affected components:
  - `kp-select` dropdown panel
  - `kp-combobox` dropdown panel
  - `kp-dropdown-menu` (used by Menu, etc.)
  - `kp-user-menu`
  - `kp-notification-center` (panel) + `kp-notification-item` (now
    transparent so it inherits from the panel)
  - `kp-toast` (neutral variant)

  Bonus: fix a dark-mode hover inversion in `kp-user-menu` rows — hover
  used to set `surface-subtle` (#09090b in dark, _darker_ than the
  panel), now uses `surface-muted` (#27272a, properly lifted).

  No light-mode change: `popover-bg` is `#FFFFFF` in light, identical to
  the previous `surface-base` value.

## 1.0.0

### Minor Changes

- 2c9b5ca: Bump `@angular/*` peer-dependency floor from `>=18.0.0` to `>=21.0.0`
  across every `@kanso-protocol/*` package.

  **Why now**: Angular 18 is EOL (Nov 2025), 19-LTS expires this month.
  The library is developed and tested exclusively on Angular 21; the
  declared `>=18` range was historical and didn't reflect what we
  actually run in CI. Aligning to `>=21` makes the support matrix honest
  and lets future code use the latest stable APIs without compatibility
  shims.

  **Migration**: consumers on Angular ≤20 will hit a peer-dependency
  warning on install. There are no functional changes — every API the
  library uses (`@if`/`@for`/`@defer`, signal-based `input()`/`output()`/
  `model()`/`effect()`) was already stable in Angular 18, so nothing
  breaks at runtime. Either upgrade Angular to 21, or pin
  `@kanso-protocol/*` to `0.5.x`.

## 0.5.3

## 0.5.2
