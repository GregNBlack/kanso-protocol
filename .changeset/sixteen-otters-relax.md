---
"@kanso-protocol/ui": minor
---

Sixteen fixes/additions reported from a production integration, filed as GitHub issues #49–#64 and fixed in one pass:

**New surface (minor):**
- `kp-table`: `selectOnRowClick` (default `true`), `rowKey` for identity-based selection instead of object-reference matching, `showHeader`.
- `kp-card`: `[kpCardHeaderLeading]`, `[kpCardTitle]`, `[kpCardDescription]` projectable header slots (same fallback-content pattern as `kp-page-header`'s `[kpPageHeaderTitle]`).
- `kp-banner`: `variant="inline"` for banners dropped into page content instead of pinned under the app Header.
- Icon set: added `eye`, `eye-off`, `key`, `arrow-right`, `heartbeat`.

**Bug fixes (patch-level, bundled into this minor since they ship together):**
- `kp-table`: a non-sortable column's header rendered inside a `<button disabled>`, which swallows pointer events on anything projected into a custom `kpTableHeader` template (e.g. a hand-built select-all checkbox) — non-sortable headers now render a plain `<div>`. `column.width` now also applies to `<td>`, not just `<th>`.
- `kp-tooltip`: the arrow kept its pre-flip shape after `computeOverlayPosition` picked the opposite side near a viewport edge (`ComponentRef.instance` assignment + `markForCheck()` doesn't mark an `OnPush` component's own view dirty — switched to `setInput`). Also: border color created a visible seam across the arrow's base (now aliases `tooltip.bg`).
- `kp-dialog` / `kp-banner` / `kp-drawer` / `kp-card` / `kp-empty-state` / `kp-page-header`: a static `title="…"` leaked onto the host as a native HTML attribute, triggering the browser's tooltip over the whole element.
- `kp-checkbox` / `kp-radio`: the empty (unchecked, enabled) box/dot had no background at all (transparent) — token was only ever set by the disabled/checked/error branches. `kp-checkbox`: label inherited the host's `line-height: 1`, clipping glyphs and producing a spurious 1px scrollbar in `kp-dialog`; box now aligns to the label's first line. `kp-radio`: hover border pulled from a different token family than rest, stranding it when the checkbox border tokens were recolored.
- `kp-banner`: `showClose` defaulted to `true` but the close button only emitted an output — nothing hid the banner. It now hides itself and still emits `close` for persisting the dismissal.
- `kp-date-picker` / `kp-time-picker`: held a minimum width (a fixed `200px` on time-picker; missing `min-width: 0` on date-picker) that refused to shrink in a grid/flex cell — overflowed a two-column "Date | Time" form row.
- Dark theme: `border.default`, `checkbox.border.rest`, the neutral outline button's border, and `badge.neutral.outline.border` all sat within one gray stop of the elevated surfaces they outline — some (`dialog.divider`) resolved to the exact same hex as the panel background, making dividers/borders in `kp-card`, `kp-dialog`, `kp-drawer`, `kp-checkbox`, and the neutral outline button invisible. Also aliased `divider.line`, `tabs.track-border`, and `dialog.divider` to `color.border.default` instead of each duplicating its own literal, so they track any theme's contour brightness automatically going forward.

Fixes #49, #50, #51, #52, #53, #54, #55, #56, #57, #58, #59, #60, #61, #62, #63, #64.
