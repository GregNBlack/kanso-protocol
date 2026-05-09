# @kanso-protocol/core

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
