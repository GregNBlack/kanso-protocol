# Stability matrix

The authoritative, per-surface stability snapshot for the current major line (`5.x`). For every component / pattern / token surface it records the tier, the coverage behind it, and any open API question.

> This file replaced `1.0-readiness.md`. Kanso never shipped a formal `1.0` milestone — the project went from `0.x` straight through to the single-package `5.0` (see [ADR 0002](adrs/0002-single-package-secondary-entry-points.md)). "Readiness for 1.0" is therefore retired; what matters now is **API stability within the 5.x line**, which is what the tiers below mean.

## Tiers

- **`stable`** — API frozen for `5.x`; no breaking change without a major bump. Full coverage (see rubric).
- **`beta`** — shipping and supported, but either an open API decision remains or behavioral coverage (spec / visual) is incomplete. May see additive change in a minor; avoid relying on edge-case behavior.
- **`experimental`** — public but the API may still change in a minor. Pin exact versions.
- **`internal`** — not for direct consumption.

## Rubric — what a tier requires

A surface is **`stable`** when all hold:

1. **docs** — a contract doc in `docs/components/<name>.md` or `docs/patterns/<name>.md`.
2. **a11y** — zero `critical` axe-core violations in **both** light and dark themes (gated in CI on every release; `serious`/`moderate` addressed per-story, see `.storybook/test-runner.ts`).
3. **spec** — a unit spec covering the documented behavior — **or** the *no-logic exception*: purely presentational / pure-layout surfaces (and single trivial interactions like one dismiss) are covered by visual + a11y and need no unit spec.
4. **visual** — a visual-regression baseline (both themes) — waived for pure-layout primitives, whose rendering is a trivial box.
5. **no open API question** — design decisions that could change the public surface are resolved.

`beta` is the honest home for anything that clears most of these but has a real open API question or a missing behavioral spec/visual. Coverage legend below: `docs` · `a11y` (critical-clean) · `spec` (test count) · `visual`.

## Token surface

| Area | Status | Notes |
|---|---|---|
| Color (primitive ramps) | `stable` | DTCG-sourced, frozen value set. |
| Color (semantic) | `beta` | Names settled. A few component-specific tokens (`--kp-form-helper`, `--kp-button-bg`) still bypass the semantic layer; reconciliation open (see token questions). |
| Spacing / sizing | `stable` | 4 / 8 / 12 / 16 px scale, matches Figma. |
| Radius | `stable` | 8 / 10 / 12 / 14 / 16 px + `full`. |
| Typography | `beta` | Onest font + 11 / 12 / 13 / 14 / 16 / 20 px scale. Open: line-height across sizes. |
| Motion | `beta` | Duration tokens fixed; ease tokens under review. `prefers-reduced-motion` honored. |
| Elevation | `beta` | Three levels (`raised`, `floating`, `overlay`). Open: dark-mode shadow values. |
| Dark theme | `stable` | Three-layer architecture (primitive → semantic → theme override) with `color.text.*` / `surface.*` / `border.*` families plus the `*.on-dark.*` invariant group. Lint-enforced: zero direct primitive refs in component/pattern CSS. Both themes covered by visual regression and axe in CI. |

**Open semantic-token questions** (would be breaking, hence the `beta` on the semantic layer):
- `--kp-color-white` carries both "surface elevation 0" and "high-contrast text on saturated bg"; in dark the surface meaning wins and the text meaning fails. Likely needs a `color.fg.on-color` split.
- Are `gray-300 / gray-400` stable text colors across both themes, or do we need a `color.text.muted` that swaps independently?

## Components

Status as of `5.0.0`. Coverage = `docs` · `a11y` · `spec(n)` · `visual`. All components pass the a11y critical gate in both themes.

| Component | Status | Coverage | Notes / open questions |
|---|---|---|---|
| `accordion` | `stable` | docs ✓ · a11y ✓ · spec ✓(4) · visual ✓ | Single/multi expansion, arrow-key focus. |
| `alert` | `stable` | docs ✓ · a11y ✓ · spec ✓(4) · visual ✓ | `(close)` emits before the host removes itself. |
| `avatar` | `stable` | docs ✓ · a11y ✓ · spec ✓(4) · visual ✓ | `[ariaLabel]` fallback to "Avatar". |
| `avatar-group` | `stable` | docs ✓ · a11y ✓ · spec ✓(4) · visual ✓ | Overflow `+N` SR count is a non-blocking polish item. |
| `badge` | `stable` | docs ✓ · a11y ✓ · spec ✓(7) · visual ✓ | `pill` vs `count` split. |
| `breadcrumbs` | `stable` | docs ✓ · a11y ✓ · spec ✓(4) · visual ✓ | Auto (Router) + static (children) variants, both documented. |
| `button` | `stable` | docs ✓ · a11y ✓ · spec ✓(11) · visual ✓ | `[loading]` / `[disabled]` independent by design. |
| `card` | `stable` | docs ✓ · a11y ✓ · spec ✓(4) · visual ✓ | A `[clickable]` variant would be additive. |
| `checkbox` | `stable` | docs ✓ · a11y ✓ · spec ✓(8) · visual ✓ | Indeterminate + ControlValueAccessor covered. |
| `combobox` | `beta` | docs ✓ · a11y ✓ · spec ✓(15) · visual ✓ | **Open:** async-loading API — `(filter)` event vs `[items]` with debounced filter — not finalized. |
| `command-palette` | `beta` | docs ✓ · a11y ✓ · spec ✓(14) · visual ✗ | **Open:** global shortcut via DI vs `[shortcut]` input (multi-palette collisions). No visual baseline yet. |
| `datepicker` | `beta` | docs ✓ · a11y ✓ · spec ✓(25) · visual ✓ | Large surface (`single` + `range`, presets, min/max), i18n-aware. Held at `beta` pending a cycle of range edge-case soak. |
| `dialog` | `stable` | docs ✓ · a11y ✓ · spec ✓(9) · visual ✓ | Native `<dialog>`; nested-Esc contract specced. |
| `divider` | `stable` | docs ✓ · a11y ✓ · spec ✓(5) · visual ✓ | Horizontal / vertical / labeled. |
| `drawer` | `stable` | docs ✓ · a11y ✓ · spec ✓(13) · visual ✓ | `side` is physical (not RTL-flipped); documented. |
| `empty-state` | `stable` | docs ✓ · a11y ✓ · spec ✓(4) · visual ✓ | Slot-based. |
| `file-upload` | `beta` | docs ✓ · a11y ✓ · spec ✓(15) · visual ✗ | Upload transport is consumer-implemented; `accept` is OS-level only. No visual baseline. |
| `form-field` | `stable` | docs ✓ · a11y ✓ · spec ✓(14) · visual ✓ | `KP_VALIDATION_MESSAGES` override contract specced. |
| `icon` | `beta` | docs ✓ · a11y ✓ · spec ✗(0) · visual ✓ | ⚠ Has real logic (registry: `register` / `registerMany` / unknown-name `console.warn`) but **no unit spec** — blocks `stable` until specced. |
| `input` | `stable` | docs ✓ · a11y ✓ · spec ✓(13) · visual ✓ | Password-reveal toggle is default behavior. |
| `markdown-viewer` | `beta` | docs ✓ · a11y ✓ · spec ✓(10) · visual ✓ | **Open:** lazy-load the `marked` parser via dynamic import (bundle perf). |
| `menu` | `beta` | docs ✓ · a11y ✓ · spec ✓(18) · visual ✓ | DropdownMenu / MenuItem / MenuDivider. **Open:** keyboard nav across section labels. |
| `number-stepper` | `stable` | docs ✓ · a11y ✓ · spec ✓(5) · visual ✓ | Integer + fractional via `[step]`. |
| `pagination` | `stable` | docs ✓ · a11y ✓ · spec ✓(5) · visual ✓ | i18n-aware. "Go to page" input would be additive. |
| `popover` | `beta` | docs ✓ · a11y ✓ · spec ✓(23) · visual ✓ | **Open:** anchor positioning on scroll — currently fixed-pos; needs scroll-recompute. |
| `progress` | `stable` | docs ✓ · a11y ✓ · spec ✓(12) · visual ✓ | Linear / Circular / Segmented (both visual stories present). |
| `radio` | `stable` | docs ✓ · a11y ✓ · spec ✓(6) · visual ✓ | Roving tabindex + CVA verified. |
| `rich-text-editor` | `beta` | docs ✓ · a11y ✓ · spec ✓(17) · visual ✗ | Image-upload protocol is consumer-implemented (needs a reference impl). No visual baseline. |
| `segmented-control` | `stable` | docs ✓ · a11y ✓ · spec ✓(6) · visual ✓ | Native radio group under the hood. |
| `select` | `stable` | docs ✓ · a11y ✓ · spec ✓(16) · visual ✓ | Native `<select>` wrapper. A richer custom variant would be additive. |
| `skeleton` | `stable` | docs ✓ · a11y ✓ · spec ✓(4) · visual ✓ | Box / text / circle. |
| `slider` | `stable` | docs ✓ · a11y ✓ · spec ✓(15) · visual ✓ | Single + range. Tick labels would be additive. |
| `table` | `beta` | docs ✓ · a11y ✓ · spec ✓(16) · visual ✓ | Sort + selection. For >500 rows compose `<kp-virtual-list>`; a baked-in `<kp-table-virtual>` is planned (additive). |
| `tabs` | `stable` | docs ✓ · a11y ✓ · spec ✓(11) · visual ✓ | Roving tabindex + overflow slot. |
| `textarea` | `stable` | docs ✓ · a11y ✓ · spec ✓(9) · visual ✓ | Auto-resize + counter. |
| `timepicker` | `beta` | docs ✓ · a11y ✓ · spec ✓(17) · visual ✓ | i18n-aware. **Open:** auto-detect 12h/24h from `KP_LOCALE` (currently `[format]`). |
| `toast` | `beta` | docs ✓ · a11y ✓ · spec ✓(14) · visual ✗ | **Open:** queue ordering across corners. No visual baseline. |
| `toggle` | `stable` | docs ✓ · a11y ✓ · spec ✓(5) · visual ✓ | `[ariaLabel]` supported. |
| `tooltip` | `stable` | docs ✓ · a11y ✓ · spec ✓(9) · visual ✓ | `[kpTooltip]` directive; global default delay would be additive. |
| `tree` | `beta` | docs ✓ · a11y ✓ · spec ✓(22) · visual ✓ | Roving tabindex + expand/collapse. **Open:** lazy-load contract for `expandable` nodes without `children`. |
| `virtual-list` | `experimental` | docs ✓ · a11y ✓ · spec ✓(13) · visual ✗ | Fixed-height window mode only. Variable-height, sticky group headers, and a load-more directive are still-evolving API. |

**Components: 27 `stable` · 13 `beta` · 1 `experimental`.**

## Patterns

Patterns compose components. Pure-layout and presentational patterns take the no-logic exception (no unit spec required); behavioral patterns need a spec to reach `stable`.

| Pattern | Status | Coverage | Notes / open questions |
|---|---|---|---|
| `app-shell` | `beta` | docs ✓ · a11y ✓ · spec ✗ · visual ✗ | Header + Sidebar + main composition. Needs spec + visual baseline. |
| `banner` | `stable` | docs ✓ · a11y ✓ · spec — · visual ✓ | Presentational + single dismiss (no-logic exception). |
| `container` | `stable` | docs ✓ · a11y ✓ · spec — · visual — | Pure layout (max-width + padding). |
| `filter-bar` | `beta` | docs ✓ · a11y ✓ · spec ✗ · visual ✓ | Active-filter chips. **Open:** multi-select chip groups. Needs spec. |
| `form-section` | `stable` | docs ✓ · a11y ✓ · spec — · visual — | Presentational title block (no-logic exception). |
| `grid` | `stable` | docs ✓ · a11y ✓ · spec — · visual — | Pure layout (equal-column responsive). |
| `header` | `beta` | docs ✓ · a11y ✓ · spec ✗ · visual ✓ | Logo + nav + search + user-menu slot. **Open:** mobile breakpoint. Needs spec. |
| `nav-item` | `beta` | docs ✓ · a11y ✓ · spec ✗ · visual ✗ | Collapsed-mode `aria-label`. Needs spec + visual. |
| `notification-center` | `beta` | docs ✓ · a11y ✓ · spec ✗ · visual ✗ | **Open:** pagination of long lists. Needs spec + visual. |
| `page-error` | `stable` | docs ✓ · a11y ✓ · spec — · visual ✓ | Presentational (404 / 500 / generic). |
| `page-header` | `beta` | docs ✓ · a11y ✓ · spec ✗ · visual ✓ | Title + breadcrumbs + actions + tabs. **Open:** collapsible variant. Needs spec. |
| `row` | `stable` | docs ✓ · a11y ✓ · spec — · visual — | Pure layout (flex primitive). |
| `search-bar` | `stable` | docs ✓ · a11y ✓ · spec ✓(2) · visual ✓ | Inline + command-palette variants settled. |
| `settings-panel` | `beta` | docs ✓ · a11y ✓ · spec ✓(3) · visual ✗ | SettingsRow children. **Open:** drag-to-reorder. No visual baseline. |
| `sidebar` | `beta` | docs ✓ · a11y ✓ · spec ✗ · visual ✓ | Expanded / collapsed. **Open:** persistent vs session-scoped collapse. Needs spec. |
| `stack` | `stable` | docs ✓ · a11y ✓ · spec — · visual — | Pure layout (flex primitive). |
| `stat-card` | `beta` | docs ✓ · a11y ✓ · spec ✗ · visual ✓ | Single-metric tile + trend. **Open:** sparkline integration. Needs spec. |
| `table-toolbar` | `beta` | docs ✓ · a11y ✓ · spec ✗ · visual ✓ | Search + filter + actions slots. Needs spec. |
| `theme-toggle` | `stable` | docs ✓ · a11y ✓ · spec ✓(6) · visual ✓ | Light / dark / system. |
| `user-menu` | `beta` | docs ✓ · a11y ✓ · spec ✗ · visual ✓ | Avatar + menu. **Open:** presence indicator as a separate component. Needs spec. |

**Patterns: 9 `stable` · 11 `beta`.**

## Documentation surface

| Surface | Status | Notes |
|---|---|---|
| `README.md` | `stable` | Components table, single-package install, MCP install, contributing pointers. |
| `CHANGELOG.md` | `stable` | Per-package; CI gate enforces updates on version bumps. |
| `CONTRIBUTING.md` | `beta` | Versioning + add-a-component flow. Open: edge-case coverage in the walkthrough. |
| `docs/components/<name>.md` | `stable` | Every component has a contract doc. |
| `docs/patterns/<name>.md` | `stable` | All 20 patterns documented. |
| `docs/MIGRATION-v5.md` | `stable` | 4.x → 5.0 single-package upgrade guide + codemod. |
| `docs/stability.md` | `beta` | This file. Update on every PR that changes a tier or coverage. |

## Tooling surface

| Tool | Status | Notes |
|---|---|---|
| `@kanso-protocol/mcp` | `stable` | Catalog server, **11 stdio tools** (`catalog_overview`, `list_components`, `get_component`, `list_patterns`, `get_pattern`, `list_tokens`, `get_token`, `figma_context`, `figma_for_component`, `figma_for_pattern`, `figma_for_icon`). `figma_for_*` / `get_component` return a `codeConnect` block resolving a Figma node ref → real `@kanso-protocol/ui/<name>` import. |
| `@kanso-protocol/ui/i18n` | `beta` | `KP_LOCALE` / `KP_STRINGS` + Intl helpers. **Open:** fold `KP_VALIDATION_MESSAGES` into `KP_STRINGS`; auto-detect 12h/24h. |
| `kanso-lint-tokens` | `stable` | Architectural rule checker (raw colors, physical CSS, raw motion/shadows). |
| Style Dictionary build | `stable` | Light + dark via custom `css/variables-dark` format. |
| `check-changelog.js` | `stable` | CI + pre-push hook. |
| `check-no-stale-refs.js` | `stable` | CI guard: no pre-v5 package/path references. |
| `check-lockfile-workspaces.js` | `stable` | CI guard: lockfile workspace set matches disk. |
| `publish-libs.js` | `stable` | Publishes unpublished `dist/packages/**` (single `@kanso-protocol/ui` + `@kanso-protocol/mcp`). |
| Visual regression suite | `stable` | `e2e/visual.spec.ts` — 54 stories × 2 themes = 108 snapshots; runs in CI in the Playwright container. |

## Known coverage gaps (tracked)

The honest backlog behind the `beta` tiers — none block usage, but each is what stands between a surface and `stable`:

- **`icon` has no unit spec** despite real registry logic. Highest-value gap (it's otherwise a heavily-used `stable`-grade component).
- **Behavioral patterns lacking specs:** `app-shell`, `filter-bar`, `header`, `nav-item`, `notification-center`, `page-header`, `sidebar`, `stat-card`, `table-toolbar`, `user-menu`.
- **No visual baseline:** `command-palette`, `file-upload`, `rich-text-editor`, `toast`, `virtual-list` (components); `app-shell`, `nav-item`, `notification-center`, `settings-panel` (patterns).
- **RTL pass** — components use logical properties throughout, but there's no automated `dir="rtl"` snapshot spec.
- **Keyboard-map doc** — most components implement WAI-ARIA patterns; a central per-component chord reference doesn't exist yet.

## Out of scope (by design)

- **Charts** — use a charting library of choice; Kanso documents the recommendation rather than shipping one.
- **React / Vue ports** — Angular-only. The Figma library is framework-agnostic for mockups.
