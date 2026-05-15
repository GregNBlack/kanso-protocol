# @kanso-protocol/button

## 3.0.0

### Patch Changes

- Updated dependencies
  - @kanso-protocol/core@3.0.0

## 2.0.3

### Patch Changes

- Updated dependencies
  - @kanso-protocol/core@2.0.3

## 2.0.2

### Patch Changes

- Updated dependencies
  - @kanso-protocol/core@2.0.2

## 2.0.1

### Patch Changes

- Updated dependencies
  - @kanso-protocol/core@2.0.1

## 2.0.0

### Patch Changes

- Updated dependencies
  - @kanso-protocol/core@2.0.0

## 1.0.1

### Patch Changes

- Updated dependencies
  - @kanso-protocol/core@1.0.1

## 1.0.0

### Patch Changes

- Updated dependencies [2c9b5ca]
  - @kanso-protocol/core@1.0.0

## 0.5.3

### Patch Changes

- e98ed74: **Polish batch: smooth sidebar collapse + theme-toggle redesign + Card `subtle` + icon additions.**

  Bumps every `@kanso-protocol/*` package to `0.5.3` under the fixed-group rule. Real changes by package:
  - **`@kanso-protocol/card`** — new `appearance="subtle"`. Gray bg (surface-muted), no border, full-strength text — for primary content surfaces visually separated from the page without the chrome of a border or shadow. Sits between `muted` (gray + dimmed text) and `elevated` (shadow + no border).
  - **`@kanso-protocol/sidebar`** — smooth collapse animation: host width transitions over 200ms cubic-bezier in lockstep with logo / footer / section-label fades (max-width + opacity). Section labels now always render (visibility:hidden when collapsed) so nav-items don't jump vertically. Top-row padding-bottom tightened 16→8. Icon-slot span gets explicit inline-flex so Tabler glyphs center exactly with the row text.
  - **`@kanso-protocol/nav-item`** — `display:none` on label/badge/chevron in collapsed mode replaced with opacity+max-width transitions; padding/gap of the row content interpolates. All 200ms cubic-bezier to match the host width animation.
  - **`@kanso-protocol/theme-toggle`** — segmented variant rebuilt to match `<kp-segmented-control>` exactly: borderless track via `--kp-color-segmented-track-bg`, sliding pill via `--kp-color-segmented-segment-bg-selected`, sm/md/lg radii via the segmented ramp. Replaces the previous bordered look.
  - **`@kanso-protocol/icon`** — `adjustments-horizontal` added to the baseline Tabler allowlist (regenerated svg-map; baseline now 116 icons). Documentation expanded with a "Bundle strategy" section explaining the curated allowlist + a "Adding more icons" recipe pointing at `@tabler/icons` runtime registration. Package description and `peerDependenciesMeta.optional` updated to surface the `@tabler/icons` relationship.

  New (not published to npm — distributed as code, see `docs/templates/workspace.md`):
  - **Workspace template** (`packages/examples/template-modern/template-workspace.component.ts`) — reusable, typed scaffold for productivity / admin Angular apps. Header + sidebar + 1 or 2 panes with drag-resize, theme toggle with `system` support, popover-on-outside-click handling. Public API: 10 data inputs, 7 feature flags, 5 presentation knobs, 4 two-way state inputs, 5 outputs, 4 content-projection slots.
  - @kanso-protocol/core@0.5.3

## 0.5.2

### Patch Changes

- e7b9808: **Dark-theme audit r1 + shared kp-icon-button atom + Figma library sync.**

  Aligns every `@kanso-protocol/*` package on `0.5.2` under the existing
  fixed-group rule. The actual code surface that moved since `0.5.1`:

  **New public API (`@kanso-protocol/button`)**
  - `<kp-icon-button>` — shared atom for close / clear / dismiss buttons
    (sizes `xs` / `sm` / `md`; hover/active/focus/disabled tokens; accepts a
    projected SVG, requires `aria-label`). Adopted internally by Popover,
    Dialog, Toast, Input clear-button to remove the previous one-off
    close-button implementations.

  **Behavior changes**
  - `@kanso-protocol/tree` — clicking a parent row now toggles its
    expansion (the chevron alone was too small to hit). Selection +
    `(nodeClick)` still fire; `(expandedChange)` now also fires from
    row-clicks.
  - `@kanso-protocol/user-menu` — internal sign-out now uses
    `<kp-menu-item [danger]>` instead of a custom button so hover / focus
    styling matches the rest of the menu rows.

  **Token + dark-theme audit (`@kanso-protocol/core`)**
  - Full dark-theme audit (`audit-2026-05-05/06/07`) — explicit overrides
    for Alert (subtle / solid / outline / left-accent across all 6 colors),
    Button (primary / danger / neutral default / subtle / outline / ghost),
    Avatar, AvatarGroup count, Card border + bg-elevated, Checkbox border
    hover, Menu item selected fg, NavItem active fg/icon, DropdownMenu,
    Input bg/border/fg/placeholder, Popover bg/border, SegmentedControl
    track + selected segment, plus narrower fixes for breadcrumbs,
    divider, table header, datepicker, sidebar, virtual-list.
  - New semantic families surfaced: `color.text.{muted,disabled}`,
    `color.surface.{muted,strong}`, `color.checkbox.border.hover`,
    `color.card.bg-elevated`. Light values cascade through the gray ramp;
    dark values pulled to deliberately darker hexes for AA contrast.
  - Dropped orphan dark-mode overrides (`color.orange.*`, `color.violet.*`
    primitives that were never defined in `tokens/primitive/color.json`;
    `color.form.helper`, `color.form.label`, `color.stat-card.trend-value-*`,
    `color.textarea.counter`, `color.notif-item.time` — flat overrides that
    shadowed nothing, since the real semantics live nested).

  **Pattern polish**
  - `@kanso-protocol/search-bar` — borders / bg / radius aligned with
    Input chrome; size-aware radius (sm=10 / md=12 / lg=14); keyboard hint
    `<kbd>` inherits `Onest` instead of monospace.
  - `@kanso-protocol/stat-card` — outlined-neutral border (gray.300 dark)
    so the card outline reads against the page bg in dark mode.
  - `@kanso-protocol/table-toolbar` — Filters button supports a count
    badge to the right of the label.
  - `@kanso-protocol/theme-toggle` — sliding-pill animation between light
    / dark / system segments (matches SegmentedControl).
  - `@kanso-protocol/virtual-list` — row template stories now use
    semantic CSS vars so dark-theme renders correctly.

  **Misc fixes**
  - `@kanso-protocol/popover`, `@kanso-protocol/toast`,
    `@kanso-protocol/dialog`, `@kanso-protocol/input` — close / clear
    buttons migrated to `<kp-icon-button>`.

  **Figma library sync**
  - 200 semantic dark-mode variables in the published Figma library
    updated to match `tokens/themes/dark.json` exactly.
  - 6 new semantic variables created in Figma: `color/text/{muted,disabled}`,
    `color/surface/{muted,strong}`, `color/checkbox/border/hover`,
    `color/card/bg-elevated`.
  - File Cover updated: Angular 21 → 18+, 22 → 20 patterns, 900 → 840
    tokens (the README Figma section now matches).
  - @kanso-protocol/core@0.5.2
