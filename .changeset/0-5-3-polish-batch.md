---
"@kanso-protocol/button": patch
---

**Polish batch: smooth sidebar collapse + theme-toggle redesign + Card `subtle` + icon additions.**

Bumps every `@kanso-protocol/*` package to `0.5.3` under the fixed-group rule. Real changes by package:

- **`@kanso-protocol/card`** — new `appearance="subtle"`. Gray bg (surface-muted), no border, full-strength text — for primary content surfaces visually separated from the page without the chrome of a border or shadow. Sits between `muted` (gray + dimmed text) and `elevated` (shadow + no border).

- **`@kanso-protocol/sidebar`** — smooth collapse animation: host width transitions over 200ms cubic-bezier in lockstep with logo / footer / section-label fades (max-width + opacity). Section labels now always render (visibility:hidden when collapsed) so nav-items don't jump vertically. Top-row padding-bottom tightened 16→8. Icon-slot span gets explicit inline-flex so Tabler glyphs center exactly with the row text.

- **`@kanso-protocol/nav-item`** — `display:none` on label/badge/chevron in collapsed mode replaced with opacity+max-width transitions; padding/gap of the row content interpolates. All 200ms cubic-bezier to match the host width animation.

- **`@kanso-protocol/theme-toggle`** — segmented variant rebuilt to match `<kp-segmented-control>` exactly: borderless track via `--kp-color-segmented-track-bg`, sliding pill via `--kp-color-segmented-segment-bg-selected`, sm/md/lg radii via the segmented ramp. Replaces the previous bordered look.

- **`@kanso-protocol/icon`** — `adjustments-horizontal` added to the baseline Tabler allowlist (regenerated svg-map; baseline now 116 icons). Documentation expanded with a "Bundle strategy" section explaining the curated allowlist + a "Adding more icons" recipe pointing at `@tabler/icons` runtime registration. Package description and `peerDependenciesMeta.optional` updated to surface the `@tabler/icons` relationship.

New (not published to npm — distributed as code, see `docs/templates/workspace.md`):
- **Workspace template** (`packages/examples/template-modern/template-workspace.component.ts`) — reusable, typed scaffold for productivity / admin Angular apps. Header + sidebar + 1 or 2 panes with drag-resize, theme toggle with `system` support, popover-on-outside-click handling. Public API: 10 data inputs, 7 feature flags, 5 presentation knobs, 4 two-way state inputs, 5 outputs, 4 content-projection slots.
