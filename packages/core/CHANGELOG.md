# @kanso-protocol/core

## 4.0.0

### Major Changes

- **BREAKING** — five changes from Sergey's production review batched for the 4.0.0 line.

  ## Fluid form-controls

  `kp-input`, `kp-select`, `kp-textarea`, `kp-date-picker`, `kp-number-stepper` now default to `width: 100%` and stretch inside their layout parent. Inner `__field` elements stretch via `width: 100%` / `flex: 1`. Previously each was hardcoded to 280/320px regardless of context.

  **Migration:** if you relied on the 280px default for isolated layouts, wrap the control in a fixed-width parent or override `width` directly:

  ```html
  <div style="width: 280px"><kp-input size="md" /></div>
  ```

  Inside `kp-form-field`, no migration needed — the field now stretches as expected.

  ## `box-sizing: border-box` global

  Added to `:host` in 21 components/patterns that previously omitted it. Fixes the `kp-table [bordered]` 1px horizontal-scroll bug and prevents the same class of issue everywhere. `kp-dialog` and `kp-drawer` skipped — they use `display: contents` where `box-sizing` has no effect.

  ## `kp-icon-button` deprecated

  `kp-icon-button` is a strict subset of `<button kpButton iconOnly>` — keeping two APIs for one component created inconsistency (icon-button never exposed `variant` / `color`). The component still works in 4.x with a JSDoc `@deprecated` notice and a one-shot dev-mode `console.warn`. Will be removed in 5.0.0.

  **Migration:**

  ```html
  <!-- Before -->
  <kp-icon-button size="sm" ariaLabel="Close" (click)="close()"
    >…</kp-icon-button
  >

  <!-- After -->
  <button
    kpButton
    iconOnly
    size="sm"
    variant="ghost"
    aria-label="Close"
    (click)="close()"
  >
    …
  </button>
  ```

  ## `KpButtonColor` union tightened

  Button's `@Input() color` was typed as `KpColorRole` (7 colors) but only painted 3. New `KpButtonColor` union restricted to the painted set (`'primary' | 'danger' | 'neutral'`). Unsupported colors (`secondary`, `success`, `warning`, `info`) now fail at compile time instead of silently rendering as default ghost.

  `KpColorRole` still exists for components that paint the full 7 (badge, alert, avatar).

  **Migration:** replace `color="success"` / `color="warning"` / `color="info"` / `color="secondary"` on `<button kpButton>` with one of the supported colors, or change the visual treatment via `variant`.

  ## New ADR — CSS Public API

  `docs/adrs/0001-css-public-api.md` formalizes CSS custom properties as the only supported customization surface, with naming convention `--kp-<component>-<property>[--<modifier>]`. Existing components mostly already follow this; ADR documents the rule + lists top 5 retrofit priorities for phase 2.

  Not a breaking change in code, but locks in the contract going forward.

## 3.0.2

### Patch Changes

- Bug fixes + small API addition reported in production review.

  **number-stepper** — `writeValue` now accepts numeric strings (`'10'` → `10`) and warns in dev mode on unparseable input. Previously string defaults silently became `null` with no signal, causing default values to vanish.

  **date-picker (range mode)** — `writeValue` short-circuits when the incoming value is structurally identical to the current one. This breaks the infinite-CD loop with inline model functions returning fresh tuples each tick (`[ngModel]="rangeModel(from(), to())"`). The tab no longer hangs even on a bad model expression; consumers should still pass stable refs for performance.

  **select** — trigger now shows the label of the matching option even when value is an empty string. Previously `value: ''` always rendered as placeholder, making `{ value: '', label: '— Any —' }` filter options invisible in the trigger. Placeholder is now shown only when no option matches.

  **page-header** — new `[align]` input (`'start' | 'center' | 'end'`, default `'start'`). When set to `'center'`/`'end'`, the back-button + title + actions row flips to the requested cross-axis alignment and the back-button's optical 2px offset clears. Also: when `showBottomDivider=false`, the public `--kp-ph-pad-bottom` CSS variable is now forced to `0px` on the host — consumers using it for downstream layout no longer see a phantom 24px gap.

## 3.0.1

### Patch Changes

- **Table**
  - New token `table.row.bg.striped` — was sharing the value with `bg.hover`, so hovering a zebra-even row was invisible. Light → `gray.50`, dark → `#09090B`.
  - `table.row.bg.hover` bumped: light `gray.50 → gray.100`, dark `#09090B → #27272A` — now reads visibly darker than the striped band underneath.
  - `table.row.bg.selected` bumped: light `blue.50 → blue.100`, dark `#172554 → #1E2A4F` — unmistakable brand tint instead of "barely tinted".
  - Striped rows now react to `:hover` — the previous CSS specificity ordering let the striped rule beat the plain hover rule; added a scoped striped+hover override with matching specificity.
  - `bordered` toggle now actually shows the border with rounded corners. `<table>` with `border-collapse: collapse` doesn't support `border-radius` or `overflow: hidden`; moved the bordered chrome onto `:host` (block element) so border + radius + clipping all render correctly.
  - Default story binds `[selectable]` / `[(selected)]` so the Storybook controls panel actually drives the example.

  **Tooltip**

  Four positioning bugs reported in production by Sergey, all in `tooltip.directive.ts`:
  1. `attachView` marks the view dirty but doesn't run change-detection synchronously. `positionTooltip()` read pre-render dimensions (no size class → no padding/font tokens → wrong height) and shifted the tooltip off-centre. Now calls `changeDetectorRef.detectChanges()` before measuring.
  2. `position: fixed` + no `width` made the browser shrink-to-fit against `viewport - left`. Tooltips near the right edge collapsed into vertical letter columns. Added `width: max-content` on the internal host.
  3. `arrowAlign` was hardcoded to `'center'` — when viewport clamping shifted the tooltip horizontally, the arrow no longer pointed at the trigger (miss up to ~95px on edge icon buttons). New `@Input() kpTooltipAlign` + position math uses an `arrowOffset(extent)` helper so the arrow point sits on the trigger's centre.
  4. Font-swap race (Onest async-loads via `@font-face`) shifted box height 2-4px after first paint. Added per-size `min-height` matching `pad-y * 2 + line-height`, plus `document.fonts.ready` re-position as defense-in-depth.

  **Sidebar**

  When `showLogo=false` (used in template-workspace and any consumer that hides the brand mark), the collapse toggle was floating at the left edge of the row. Added a scoped rule so the toggle aligns to the right edge in that case. Collapsed-state centring is preserved.

  **Figma**

  Token sync — added `color/table/row/bg/striped`, updated hover + selected values across light/dark modes to match the code.

  **Tests**

  Test counter `442 → 446` (+10 directive tests for tooltip, −4 from the deleted component tests). 46/62 packages now have specs.

## 3.0.0

### Major Changes

- **BREAKING:** `@kanso-protocol/tooltip` rewritten as a directive. `<kp-tooltip>` component removed; `[kpTooltip]` directive is the only public API.

  Before — non-functional styled body, consumer had to wire visibility / positioning / hover:

  ```html
  <kp-tooltip label="Save" arrowPosition="bottom" />
  ```

  After — attach to any focusable element; auto-shows on hover/focus, hides on leave/blur/Escape, auto-positions with viewport-edge flipping, portals above modals via `findPortalTarget`:

  ```html
  <button [kpTooltip]="'Save changes'" kpTooltipPosition="top">Save</button>
  <button [kpTooltip]="'Quick search'" kpTooltipShortcut="⌘K">Search</button>
  <!-- null/empty/disabled to suppress -->
  <button [kpTooltip]="collapsed ? label : null" kpTooltipPosition="right">
    …
  </button>
  ```

  Migration:
  - Replace `KpTooltipComponent` imports with `KpTooltipDirective`
  - Remove any controlled-visibility plumbing (signals, mouseenter listeners, manual portals)
  - Apply `[kpTooltip]` on the trigger element itself

  Internal: `KpTooltipInternalComponent` still owns the visual chrome (arrow, label, shortcut, sizes) but is not exported from the package surface.

  `kp-nav-item` migrated internally — drops its custom portal+positioning code in favor of `[kpTooltip]`.

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
