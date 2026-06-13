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

Status as of `5.4.0`. Coverage = `docs` · `a11y` · `spec(n)` · `visual`. All components pass the a11y critical gate in both themes.

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
| `command-palette` | `stable` | docs ✓ · a11y ✓ · spec ✓(14) · visual n/a | Per-instance `[shortcut]` input (default `mod+k`, `null` disables) — no DI, no multi-palette collisions. Visual n/a — renders in a top-layer `<dialog>`. |
| `datepicker` | `stable` | docs ✓ · a11y ✓ · spec ✓(25) · visual ✓ | Large surface (`single` + `range`, presets, min/max), i18n-aware. Range edge cases specced (25 tests); API frozen for 5.x. |
| `dialog` | `stable` | docs ✓ · a11y ✓ · spec ✓(9) · visual ✓ | Native `<dialog>`; nested-Esc contract specced. |
| `divider` | `stable` | docs ✓ · a11y ✓ · spec ✓(5) · visual ✓ | Horizontal / vertical / labeled. |
| `drawer` | `stable` | docs ✓ · a11y ✓ · spec ✓(13) · visual ✓ | `side` is physical (not RTL-flipped); documented. |
| `empty-state` | `stable` | docs ✓ · a11y ✓ · spec ✓(4) · visual ✓ | Slot-based. |
| `file-upload` | `stable` | docs ✓ · a11y ✓ · spec ✓(15) · visual ✓ | Upload transport is consumer-implemented **by design** (you wire the request); `accept` maps to the OS dialog. A reference transport would be additive, not breaking. |
| `form-field` | `stable` | docs ✓ · a11y ✓ · spec ✓(14) · visual ✓ | Validation messages via `KP_STRINGS.validation` (5.4.0); `KP_VALIDATION_MESSAGES` deprecated-but-honored. |
| `icon` | `stable` | docs ✓ · a11y ✓ · spec ✓(12) · visual ✓ | Registry (`register` / `registerMany` / unknown-name warning) + size ramp now specced. |
| `input` | `stable` | docs ✓ · a11y ✓ · spec ✓(13) · visual ✓ | Password-reveal toggle is default behavior. |
| `markdown-viewer` | `stable` | docs ✓ · a11y ✓ · spec ✓(12) · visual ✓ | Default parser lazy-loads `marked` via dynamic import (code-splittable); `[parser]` accepts sync **or** async parsers (5.5.0). |
| `menu` | `stable` | docs ✓ · a11y ✓ · spec ✓(19) · visual ✓ | DropdownMenu / MenuItem / MenuDivider. Arrow / Home / End roving nav skips section labels, dividers, and disabled items (5.4.1). |
| `number-stepper` | `stable` | docs ✓ · a11y ✓ · spec ✓(5) · visual ✓ | Integer + fractional via `[step]`. |
| `pagination` | `stable` | docs ✓ · a11y ✓ · spec ✓(5) · visual ✓ | i18n-aware. "Go to page" input would be additive. |
| `popover` | `stable` | docs ✓ · a11y ✓ · spec ✓(24) · visual ✓ | Tracks its trigger — repositions on scroll/resize (rAF-throttled, capture-phase catches scrollable ancestors), detaches on close. |
| `progress` | `stable` | docs ✓ · a11y ✓ · spec ✓(12) · visual ✓ | Linear / Circular / Segmented (both visual stories present). |
| `radio` | `stable` | docs ✓ · a11y ✓ · spec ✓(6) · visual ✓ | Roving tabindex + CVA verified. |
| `rich-text-editor` | `stable` | docs ✓ · a11y ✓ · spec ✓(17) · visual n/a | `(imageUpload)` emits `{ file, resolve }` — host uploads + calls `resolve(url)` to insert (reference story shipped). Visual n/a — caret/selection is non-deterministic. |
| `segmented-control` | `stable` | docs ✓ · a11y ✓ · spec ✓(6) · visual ✓ | Native radio group under the hood. |
| `select` | `stable` | docs ✓ · a11y ✓ · spec ✓(16) · visual ✓ | Native `<select>` wrapper. A richer custom variant would be additive. |
| `skeleton` | `stable` | docs ✓ · a11y ✓ · spec ✓(4) · visual ✓ | Box / text / circle. |
| `slider` | `stable` | docs ✓ · a11y ✓ · spec ✓(15) · visual ✓ | Single + range. Tick labels would be additive. |
| `table` | `stable` | docs ✓ · a11y ✓ · spec ✓(16) · visual ✓ | Sort + selection. For >500 rows compose `<kp-virtual-list>` (documented); a baked-in `<kp-table-virtual>` remains a future **additive** package — not a blocker. |
| `tabs` | `stable` | docs ✓ · a11y ✓ · spec ✓(11) · visual ✓ | Roving tabindex + overflow slot. |
| `textarea` | `stable` | docs ✓ · a11y ✓ · spec ✓(9) · visual ✓ | Auto-resize + counter. |
| `timepicker` | `stable` | docs ✓ · a11y ✓ · spec ✓(17) · visual ✓ | i18n-aware. `[format]` defaults to `"auto"` — derives 12h/24h from `KP_LOCALE` (5.4.0). |
| `toast` | `stable` | docs ✓ · a11y ✓ · spec ✓(16) · visual n/a | Per-corner routing — `show({ position })` targets a corner (unset → top-right); each `<kp-toast-host>` renders only its position's toasts, most-recent `[max]` (5.12.0). Visual n/a — animated. |
| `toggle` | `stable` | docs ✓ · a11y ✓ · spec ✓(5) · visual ✓ | `[ariaLabel]` supported. |
| `tooltip` | `stable` | docs ✓ · a11y ✓ · spec ✓(9) · visual ✓ | `[kpTooltip]` directive; global default delay would be additive. |
| `tree` | `stable` | docs ✓ · a11y ✓ · spec ✓(25) · visual ✓ | Roving tabindex + expand/collapse + lazy-load: `(nodeExpand)` fires for expandable nodes with no children, `loading` shows a spinner row until populated (5.11.0). |
| `virtual-list` | `stable` | docs ✓ · a11y ✓ · spec ✓(13) · visual ✓ | Fixed-height window mode — API frozen for 5.x. Variable-height / sticky group headers ship as a **separate future package**, so the core stays stable. |

**Components: 40 `stable` · 0 `beta` · 0 `experimental`.**

## Patterns

Patterns compose components. Pure-layout and presentational patterns take the no-logic exception (no unit spec required); behavioral patterns need a spec to reach `stable`.

| Pattern | Status | Coverage | Notes / open questions |
|---|---|---|---|
| `app-shell` | `stable` | docs ✓ · a11y ✓ · spec ✓(14) · visual ✓ | Header + Sidebar + main composition. |
| `banner` | `stable` | docs ✓ · a11y ✓ · spec — · visual ✓ | Presentational + single dismiss (no-logic exception). |
| `container` | `stable` | docs ✓ · a11y ✓ · spec — · visual — | Pure layout (max-width + padding). |
| `filter-bar` | `stable` | docs ✓ · a11y ✓ · spec ✓(13) · visual ✓ | Active-filter chips. Multi-value filters encode in the chip label ("Status: 2 selected"); the picker is consumer-owned by design. |
| `form-section` | `stable` | docs ✓ · a11y ✓ · spec — · visual — | Presentational title block (no-logic exception). |
| `grid` | `stable` | docs ✓ · a11y ✓ · spec — · visual — | Pure layout (equal-column responsive). |
| `header` | `beta` | docs ✓ · a11y ✓ · spec ✓(19) · visual ✓ | Logo + nav + search + user-menu slot. **Open:** mobile breakpoint. |
| `nav-item` | `stable` | docs ✓ · a11y ✓ · spec ✓(16) · visual ✓ | Collapsed-mode `aria-label`, active state, depth. |
| `notification-center` | `stable` | docs ✓ · a11y ✓ · spec ✓(22) · visual ✓ | Keyboard-operable rows; `[pageSize]` reveals long lists incrementally via a "Show more" button + `(loadMore)` for server-driven append (5.9.0). |
| `page-error` | `stable` | docs ✓ · a11y ✓ · spec — · visual ✓ | Presentational (404 / 500 / generic). |
| `page-header` | `stable` | docs ✓ · a11y ✓ · spec ✓(15) · visual ✓ | Title + breadcrumbs + actions + tabs; `[collapsed]` compact mode hides breadcrumbs + description (5.10.0). |
| `row` | `stable` | docs ✓ · a11y ✓ · spec — · visual — | Pure layout (flex primitive). |
| `search-bar` | `stable` | docs ✓ · a11y ✓ · spec ✓(2) · visual ✓ | Inline + command-palette variants settled. |
| `settings-panel` | `beta` | docs ✓ · a11y ✓ · spec ✓(3) · visual ✓ | SettingsRow children. **Open:** drag-to-reorder. |
| `sidebar` | `stable` | docs ✓ · a11y ✓ · spec ✓(30) · visual ✓ | Expanded / collapsed; optional `[persistKey]` saves the choice to `localStorage` (SSR-safe), else session-scoped (5.7.0). |
| `stack` | `stable` | docs ✓ · a11y ✓ · spec — · visual — | Pure layout (flex primitive). |
| `stat-card` | `stable` | docs ✓ · a11y ✓ · spec ✓(18) · visual ✓ | Single-metric tile + trend + built-in data-driven sparkline (`[sparklineData]`, colored by trend tone); `[kpStatCardSparkline]` slot still overrides (5.6.0). |
| `table-toolbar` | `stable` | docs ✓ · a11y ✓ · spec ✓(17) · visual ✓ | Search + filter + actions + bulk-select + density. |
| `theme-toggle` | `stable` | docs ✓ · a11y ✓ · spec ✓(6) · visual ✓ | Light / dark / system. |
| `user-menu` | `stable` | docs ✓ · a11y ✓ · spec ✓(20) · visual ✓ | Avatar + menu with a `[presence]` dot (online/away/busy/offline, or null to hide) (5.8.0). |

**Patterns: 18 `stable` · 2 `beta`.**

## Documentation surface

| Surface | Status | Notes |
|---|---|---|
| `README.md` | `stable` | Components table, single-package install, MCP install, contributing pointers. |
| `CHANGELOG.md` | `stable` | Per-package; CI gate enforces updates on version bumps. |
| `CONTRIBUTING.md` | `beta` | Versioning + add-a-component flow. Open: edge-case coverage in the walkthrough. |
| `docs/components/<name>.md` | `stable` | Every component has a contract doc. |
| `docs/patterns/<name>.md` | `stable` | All 20 patterns documented. |
| `docs/MIGRATION-v5.md` | `stable` | 4.x → 5.0 single-package upgrade guide + codemod. |
| `docs/getting-started.md` | `stable` | Install → tokens → screen → forms onboarding. |
| `docs/theming.md` | `stable` | Brand recolor, light/dark, custom themes. |
| `docs/ssr.md` | `stable` | SSR / hydration contract. |
| `docs/web-components.md` | `stable` | Using Kanso outside Angular via custom elements. |
| `docs/keyboard-map.md` | `stable` | Cross-component keyboard chord reference. |
| `docs/stability.md` | `beta` | This file. Update on every PR that changes a tier or coverage. |

## Tooling surface

| Tool | Status | Notes |
|---|---|---|
| `@kanso-protocol/mcp` | `stable` | Catalog server, **11 stdio tools** (`catalog_overview`, `list_components`, `get_component`, `list_patterns`, `get_pattern`, `list_tokens`, `get_token`, `figma_context`, `figma_for_component`, `figma_for_pattern`, `figma_for_icon`). `figma_for_*` / `get_component` return a `codeConnect` block resolving a Figma node ref → real `@kanso-protocol/ui/<name>` import. |
| `@kanso-protocol/ui/i18n` | `stable` | `KP_LOCALE` / `KP_STRINGS` (incl. `validation`) + Intl helpers. Validation messages folded into `KP_STRINGS.validation`; timepicker auto-detects 12h/24h (5.4.0). `KP_VALIDATION_MESSAGES` kept as a deprecated alias. |
| `@kanso-protocol/elements` | `experimental` | Framework-agnostic custom elements (all 73 `kp-*` components) for React / Vue / plain HTML. `0.x` — API stable, packaging (single bundle, embeds Angular runtime) may evolve. Build + runtime smoke gated in CI (`web-components` job). See [`docs/web-components.md`](web-components.md). |
| `publish-libs.js` | `stable` | Publishes unpublished `dist/packages/**` (`@kanso-protocol/ui` + `/mcp` + `/elements`). |
| `kanso-lint-tokens` | `stable` | Architectural rule checker (raw colors, physical CSS, raw motion/shadows). |
| Style Dictionary build | `stable` | Light + dark via custom `css/variables-dark` format. |
| `check-changelog.js` | `stable` | CI + pre-push hook. |
| `check-no-stale-refs.js` | `stable` | CI guard: no pre-v5 package/path references. |
| `check-lockfile-workspaces.js` | `stable` | CI guard: lockfile workspace set matches disk. |
| Visual regression suite | `stable` | `e2e/visual.spec.ts` — 60 stories × 2 themes + 55 RTL = 175 snapshots; runs in CI in the Playwright container. |

## Coverage gaps — status

The audit's gaps have been closed; what remains `beta` is held by open **API questions**, not missing coverage:

- ~~`icon` has no unit spec~~ → **done** (12 tests); promoted to `stable`.
- ~~Behavioral patterns lacking specs~~ → **done**: every pattern now has a spec (app-shell 14 · filter-bar 13 · header 19 · nav-item 16 · notification-center 20 · page-header 14 · sidebar 27 · stat-card 16 · table-toolbar 17 · user-menu 17). app-shell, nav-item, and table-toolbar promoted to `stable`.
- ~~No visual baseline~~ → **done** for the in-flow surfaces (file-upload, virtual-list, app-shell, nav-item, notification-center, settings-panel). `command-palette`, `rich-text-editor`, and `toast` are marked **visual n/a** — they render in a top-layer/portal or animate, so a `#storybook-root` snapshot can't capture them deterministically (this is a deliberate exclusion, not a gap).
- ~~RTL pass~~ → **done**: `e2e/visual.spec.ts` snapshots the full catalog (55 stories, all but 5 direction-neutral ones) under `dir="rtl"`.
- ~~Keyboard-map doc~~ → **done**: [`docs/keyboard-map.md`](keyboard-map.md) — per-component chord reference.

**Remaining is API-level only** — the `beta` surfaces each carry one open design question (multi-select chip groups, mobile header breakpoint, notification pagination, sidebar collapse persistence, sparkline, drag-reorder, presence indicator, combobox async API, etc.). Those are product decisions, not coverage debt; resolving each promotes its surface to `stable`.

## Out of scope (by design)

- **Charts** — use a charting library of choice; Kanso documents the recommendation rather than shipping one.
- **First-class React / Vue rewrites** — out of scope. Non-Angular consumers use the framework-agnostic [`@kanso-protocol/elements`](web-components.md) custom elements (experimental `0.x`) rather than hand-ported components. The Figma library is framework-agnostic for mockups.
