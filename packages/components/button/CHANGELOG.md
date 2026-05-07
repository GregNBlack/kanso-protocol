# @kanso-protocol/button

## 0.5.2

### Patch Changes

- e7b9808: **Dark-theme audit r1 + shared kp-icon-button atom + Figma library sync.**

  Aligns every `@kanso-protocol/*` package on `0.6.0` under the existing
  fixed-group rule. The actual code surface that moved since `0.5.x`:

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
