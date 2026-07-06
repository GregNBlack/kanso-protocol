# Changelog

Top-level log of every release. Mirrors the [GitHub Releases](https://github.com/GregNBlack/kanso-protocol/releases) page; this file is the authoritative source — release notes are produced from these sections.

## Release cadence

- **Alpha (`0.x.y`)** — API may change in any minor bump. No backward-compatibility guarantees. Pin exact versions.
- **Beta (`1.0.0-beta.N`)** — API frozen; only breaking fixes. Feedback phase.
- **Stable (`>=1.0.0`)** — strict SemVer; breaking changes only in major bumps, with deprecation cycles.

See [`CONTRIBUTING.md` → Versioning policy](CONTRIBUTING.md#versioning-policy) for the rules that decide which segment to bump for a given change.

---

## 2026-07-06 — feat: design-system integrity — enforce what the system declares

A cross-cutting pass that turns Kanso's stated contracts into machine-checked gates, raises the accessibility ceiling, and hardens the AI + React developer experience. Every change is additive and visually neutral (media-gated or value-identical) — no component API changed.

### Bumps

- `@kanso-protocol/ui` `5.15.0` → `5.16.0` *(minor — a11y additions, tokenized focus ring, `icon.warning` AA fix)*
- `@kanso-protocol/mcp` `4.2.1` → `4.3.0` *(minor — `check_composition` tool, deduped/stability-tiered/deterministic manifest)*
- `@kanso-protocol/elements` `0.1.4` → `0.2.0` *(minor — Custom Elements Manifest + JSX types, bundle-size gated)*

### What changed

- **Enforcement (CI + husky).** `validate:tokens` — state-matrix completeness (216/216), the rest→hover→active ramp-step invariant, and dark-override existence. `check:contrast` — WCAG AA measured on curated foreground/background token pairs in both themes (caught and fixed `--kp-color-icon-warning`, which resolved to 2.15:1 on white). `check:stability` — `docs/stability.json` as the machine-readable tier source with a README/stability.md drift guard. The `raw-motion-duration` / `raw-shadow` lint rules promoted from warn to error. `check-no-stale-refs` extended to catch the `path.join('packages','components',…)` form.
- **Accessibility.** Focus ring tokenized (`--kp-focus-ring-width` / `-offset`; 33 inline `2px` sites replaced, value-identical); `prefers-reduced-motion` honored by all 43 animated components (was 10); `@media (forced-colors: active)` support added to 29 interactive components for Windows High Contrast.
- **MCP.** New `check_composition` tool flags mixed sizes in a row and beta-tier usage (12 tools total). The manifest is deduped (one primary record per component + `subSelectors`), carries a `stability` tier, includes the previously-missing `table-virtual`, is deterministic, and is guarded by a CI freshness gate; Figma-node lookups degrade gracefully instead of serving a wrong node.
- **Elements / React DX.** Ships `custom-elements.json` (Custom Elements Manifest) and generated `JSX.IntrinsicElements` types, so `<kp-*>` type-checks in React/TSX; the ~1.9 MB bundle is now under the bundle-size budget; client-only SSR behavior is documented in `docs/web-components.md`.
- **Brand tool.** `generate-brand-theme` now measures WCAG contrast per hue (with an `--enforce-aa` flag) instead of asserting the false "contrast preserved by construction" guarantee.
- **Fixes.** Restored the missing `icons.allowlist.json` and corrected `generate-icon-map.js`'s stale v5 paths (`svg-map.generated.ts` reproduces byte-identically); README component count corrected to 42 with the `table-virtual` row; docs reconciled with code (state model incl. `error`, family-specific ARIA mapping, anatomy).

## 2026-05-05 — refactor(tokens): semantic `color.foreground.on-saturated` primitive

Aligns code tokens with the Figma library by introducing an explicit primitive for "always-white text on saturated brand backgrounds". Replaces 30 inline `{color.white}` aliases that previously needed the `#FFFFFF` override list in `dark.json` because `color.white` itself inverts to `#18181B` (the elevation surface). Same final pixels, cleaner architecture, and lets Tokens Studio sync code → Figma without overwriting the manually-added Figma primitive.

### Bumps

- `@kanso-protocol/core` `0.5.0` → `0.5.1` *(patch — no resolved-value changes)*

### What changed

- **`tokens/primitive/color.json`** — new `color.foreground.on-saturated` primitive. Stays `#FFFFFF` in BOTH modes (no dark.json override). Serves as the explicit semantic primitive for "fg on saturated brand bg" — decoupled from `color.white` which represents the elevation surface and inverts to dark.
- **`tokens/semantic/color.json`** — 30 references retargeted from `{color.white}` → `{color.foreground.on-saturated}`:
  - `primary.default.fg.{rest,hover,active,focus,loading}` (5)
  - `danger.default.fg.{rest,hover,active,focus,loading}` (5)
  - `badge.{primary,danger,success,info}.filled.fg` + `dot` (8)
  - `alert.{primary,danger,success,info}.solid.fg-title` + `icon` + `accent` (12)
  - `pagination.item.fg.selected` + `icon.selected` (2)
  - `stepper.indicator.fg.{active,completed,error}` (3)
- **`tokens/themes/dark.json`** — removed redundant `#FFFFFF` overrides on `primary.default.fg.{rest,hover,active,focus,loading}` and `danger.default.fg.*` (now flow through on-saturated automatically). `disabled` overrides retained — they need the explicit light-gray pivot since `color.gray.400` would otherwise invert to `#52525B` (too dark on saturated bg).

### Resolved values: identical

Light mode: `primary.default.fg.rest` = `#FFFFFF` (was `#FFFFFF`, via `color.white`).
Dark mode: `primary.default.fg.rest` = `#FFFFFF` (was `#FFFFFF`, via the now-removed dark.json override).

Same for every refactored token. Verified via `npm run build:tokens` + diff of `dark.css`.

### Why this matters for Figma sync

The Figma library has the same `color/foreground/on-saturated` primitive (created manually during the dark-mode refactor). With code now mirroring that structure, Tokens Studio push (code → Figma) will:
- Match the existing primitive (no-op on values)
- Confirm the 30 alias targets (no-op)
- Not try to delete the on-saturated primitive

Token sync is now safe to run.

### Migration

None for code consumers — `--kp-color-primary-default-fg-rest` etc. resolve to the same final hex. If you alias the new primitive directly: `--kp-color-foreground-on-saturated` is now public and stable across modes.

---

## 2026-05-05 — feat(dialog): close button always rendered; header hugs content

Iteration on the previous change. After the chromeless / Show-Header refactor, the close button was moved inside the header's flex flow. We're now removing the `[showClose]` toggle entirely — the close X is always present so the header's built-in dismiss path is consistent across every dialog. Header itself hugs its content (no min-height); the empty-header self-collapse rule from the prior commit still applies.

### Bumps

- `@kanso-protocol/dialog` (`0.2.0` published; this iteration ships in the next release — same minor since the API is still in flux)

### What changed

- `[showClose]: boolean` removed. Close button always renders inside the header.
- Header had no min-height before and still doesn't — natural flex hug.
- Figma component-set: `Show Close` boolean property removed (15 variants unbound + property deleted). Close button moved back inside the Header frame as a flex child. Added `Show Title` boolean property tied to the Title text node so designers can toggle title/description independently.

### Migration

If you were setting `[showClose]="false"` to hide the X, drop the prop. If you need a truly close-less dialog (rare — most modals should be dismissible), wrap your dialog and apply `display: none` to the close button via your own CSS using `::ng-deep` or a host-level modifier. The default behavior — close always available — matches every shipped dialog pattern in Kanso.

---

## 2026-04-28 — feat(dialog): header always renders, title/description independently toggleable

Removed the `[showHeader]` toggle. Header is now always rendered; its content (hero icon, title, description, close button) is controlled by individual flags. Without a title, the header collapses to "just the close X in the corner" via `:empty`-style CSS — no more crooked layout when the dialog is used chromeless.

### Bumps

- `@kanso-protocol/dialog` `0.1.2` → `0.2.0` *(minor — `[showHeader]` input removed; breaking for the few callers that used it)*
- `@kanso-protocol/command-palette` (no version bump — internal template adjustment to drop the now-removed input; behavior unchanged)

### What changed

- `[showHeader]: boolean` removed.
- Header markup always renders. Its content tree:
  - `[kpDialogHeroIcon]` slot (gated by `[showHeroIcon]`)
  - `<h2>` title (rendered only when `[title]` is non-empty)
  - `<p>` description (rendered only when `[showDescription]` is true and `[description]` is non-empty)
  - close `<button>` (rendered when `[showClose]` is true)
- Close button moved from absolute positioning at the panel level to flow as a flex child inside the header. Visual position unchanged (top-right corner) but it now respects auto-layout and stays aligned even when title wraps.
- ARIA: `aria-labelledby` is set to the title id when a title is present; otherwise `aria-label` from `[ariaLabel]` is applied to the panel.
- Body's `--no-header` modifier removed (no longer needed); `--no-footer` retained.

### Why

Three rendering states were possible in the old API: `showHeader=true` with title (normal), `showHeader=true` without title (rendered an empty padded bar), `showHeader=false` (body stuck to panel edge). The first two looked broken; the third was a special chromeless mode. Collapsing the toggle and making the header self-collapse via CSS gives one shape that works for all three: title + description + close all become independently optional, and the close-only header looks clean.

### Migration

If you set `[showHeader]="false"` to render a chromeless dialog (e.g. for a custom modal panel), drop the prop. To suppress the close button, set `[showClose]="false"` instead — the header will collapse to nothing and the panel will look identical to the old chromeless mode.

`@kanso-protocol/command-palette` ships pre-migrated; users of that component see no change.

### Figma

The Dialog component-set in the Kanso Figma library was updated in lockstep — Close moved into the Header frame as the last horizontal child, header padding reset to symmetric 16px on all sides. All 15 Size × Footer Layout variants synced.

---

## 2026-04-28 — fix(dialog): body breathing room when header/footer is off

When `[showHeader]=false` or `[showFooter]=false`, the body content sat flush against the panel edge. Now the body adds 16px padding only on the affected side — header/footer still own their own padding when present, so headered dialogs are unchanged.

### Bumps

- `@kanso-protocol/dialog` `0.1.1` → `0.1.2` *(patch — visible-only-with-no-chrome)*

### What changed

- `<div class="kp-dialog__body">` now toggles `--no-header` / `--no-footer` modifier classes when the corresponding chrome is hidden.
- Two CSS rules added: `.kp-dialog__body--no-header { padding-top: 16px; }` and `.kp-dialog__body--no-footer { padding-bottom: 16px; }`.

### Migration

None. Existing headered+footered dialogs render identically.

---

## 2026-04-28 — fix(alert): icon color matches title color

In every Alert variant, the leading icon and the title text now share one color (`--kp-alert-fg-title`). Previously they were defined as separate tokens that often resolved to different shades — e.g. `subtle` variant had `title=blue-900` but `icon=blue-600`. Designers expected one visual identity per variant, not two.

### Bumps

- `@kanso-protocol/alert` `0.1.2` → `0.1.3` *(patch — observable color shift in subtle / outline / left-accent variants)*

### What changed

- `.kp-alert__icon` CSS now reads `var(--kp-alert-fg-title)` instead of `var(--kp-alert-icon)`.
- All 24 per-variant `--kp-alert-icon: ...` declarations removed — single source of truth, less drift surface.

### Visual impact

- `solid` and `warning` variants: no change (title and icon were already the same in these).
- `subtle`, `outline`, `left-accent` variants: icon is now slightly darker to match the title's deeper shade. Contrast against the variant background goes UP.

### Migration

None. If a consumer was overriding `--kp-alert-icon` in custom CSS, that override no longer takes effect — switch to `--kp-alert-fg-title` (which also drives the title and close button).

---

## 2026-04-28 — fix(dialog): clean up portal element on destroy

`<kp-dialog>` portals its root into `<body>` via `appendChild` to escape transformed / clipped ancestors. The portal moves the element out of Angular's view tree, so `ngOnDestroy` was leaving the orphaned element in `<body>` after the component went away — a slow-grow DOM leak in long-lived apps that mount and unmount dialogs frequently, and the cause of test-isolation flakes when multiple `<kp-command-palette>` fixtures ran in sequence (the prior test's dialog stayed in body, polluting `document.body.textContent` queries).

### Bumps

- `@kanso-protocol/dialog` `0.1.0` → `0.1.1` *(patch — no API change)*

### What changed

- `KpDialogComponent.ngOnDestroy` now removes its root from `document.body` if it had been portaled there. Pairs with the existing `appendChild` lazy-portal in `ngAfterViewChecked`.
- `command-palette.spec.ts` — added an `afterEach` that explicitly destroys the active fixture, plus narrowed the empty-state assertion to query the `.kp-cmdk__empty` element directly instead of reading `document.body.textContent` (which would have been polluted by orphaned portals across the test run).

### Migration

None. Behavior is strictly better — no consumer change needed.

---

## 2026-04-28 — i18n migration: timepicker + file-upload + command-palette + search-bar

Closes the i18n cross-cutting work in `docs/1.0-readiness.md` (item 2). Every component that hardcoded English strings or AM/PM markers now reads through `KP_STRINGS` / `kpDayPeriod()`. Existing English consumers see no change — defaults match prior literals.

### Bumps

- `@kanso-protocol/i18n` `0.1.0` → `0.2.0` *(new keys: `timeHour`, `timeMinute`, `timeSecond`, `timeDayPeriod`, `timeNow` — minor, additive)*
- `@kanso-protocol/timepicker` `0.1.0` → `0.2.0`
- `@kanso-protocol/file-upload` `0.1.0` → `0.2.0`
- `@kanso-protocol/command-palette` `0.1.0` → `0.2.0`
- `@kanso-protocol/search-bar` `0.1.1` → `0.2.0`

### What changed

**`@kanso-protocol/i18n`**
- Five new keys for timepicker chrome: `timeHour`, `timeMinute`, `timeSecond`, `timeDayPeriod`, `timeNow`. English defaults match the prior hardcoded literals (`'Hour'`, `'Min'`, `'Sec'`, `'AM/PM'`, `'Now'`).

**`@kanso-protocol/timepicker`** *(0.2.0 minor — new i18n peer)*
- AM/PM markers in trigger text and column buttons now from `kpDayPeriod(0|13, locale)` — locale-aware (`AM`/`PM` in en-US, `am`/`pm` lowercase in en-GB, period markers in other locales). Falls back to `'AM'`/`'PM'` if the locale uses 24h format only.
- Column labels (`Hour` / `Min` / `Sec` / `AM/PM`) read from `KP_STRINGS`.
- Footer buttons now `strings.timeNow` / `strings.cancel` / `strings.confirm` (was hardcoded `Now` / `Cancel` / `Apply`).
- ARIA labels (`Clear time`, `Choose time`) bound to `strings.clear` / `strings.selectTime`.
- `[placeholder]` input now `string | null`; `null` falls through to `strings.selectTime`.

**`@kanso-protocol/file-upload`** *(0.2.0 minor — new i18n peer)*
- `[title]`, `[ariaLabel]` now `string | null`; `null` falls through to `strings.dropzoneTitle`.
- "Uploaded" status pill now `strings.dropzoneUploaded`.
- Per-row remove button aria-label now `strings.dropzoneRemove(filename)` (function-typed string in the registry).

**`@kanso-protocol/command-palette`** *(0.2.0 minor — new i18n peer)*
- `[placeholder]`, `[emptyMessage]`, `[ariaLabel]` now `string | null`; `null` falls through to `strings.commandPalettePlaceholder` / `strings.noResults` / `'Command palette'` respectively.

**`@kanso-protocol/search-bar`** *(0.2.0 minor — new i18n peer)*
- `[placeholder]` now falls through to `strings.searchPlaceholder` when `null`.
- `[shortcutHint]` now falls through to `strings.commandPaletteHint` (default `⌘K`) when `null`.

### Migration

For consumers using English: **no action needed** — every hardcoded literal becomes the corresponding `KP_DEFAULT_STRINGS_EN` value, byte-for-byte.

For consumers passing custom strings via `[title]` / `[placeholder]` / etc.: keep doing what you do — the explicit input still wins over the registry.

For consumers wanting full localization:

```ts
providers: [
  { provide: KP_LOCALE, useValue: 'fr-FR' },
  { provide: KP_STRINGS, useValue: {
      clear: 'Effacer',
      cancel: 'Annuler',
      confirm: 'Valider',
      timeNow: 'Maintenant',
      timeHour: 'Heure', timeMinute: 'Min', timeSecond: 'Sec',
      dropzoneTitle: 'Déposez vos fichiers ici',
      dropzoneRemove: (n) => `Supprimer ${n}`,
      dropzoneUploaded: 'Envoyé',
      commandPalettePlaceholder: 'Commande ou recherche…',
      noResults: 'Aucun résultat',
      searchPlaceholder: 'Rechercher…',
  }},
]
```

`docs/i18n.md` updated with the per-component status table.

---

## 2026-04-28 — `@kanso-protocol/i18n` + datepicker locale-aware

First step on the i18n cross-cutting work in `docs/1.0-readiness.md`. Ships a small DI-backed i18n primitive layer and migrates the datepicker as proof.

### New package

- `@kanso-protocol/i18n@0.1.0` *(experimental)* — peer of `@angular/core` only.

### What's in the box

- **`KP_LOCALE`** injection token — BCP-47 tag (default: `navigator.language` || `'en-US'`).
- **`KP_STRINGS`** injection token — `Partial<KpLocaleStrings>`. Override only the keys you need; missing ones fall through to `KP_DEFAULT_STRINGS_EN`.
- **`injectKpLocale()`** / **`injectKpStrings()`** — convenience accessors for component constructors.
- **Intl helpers** — `kpFormatDate`, `kpFormatTime`, `kpMonthNames`, `kpWeekdayNames`, `kpDayPeriod`. Each caches formatters per `(locale, options)` so they're cheap to call in render loops.

### Why a small registry

Anything that `Intl.DateTimeFormat` can derive (month names, day-period markers, time formats) is **not** a string in the registry — components call the helpers and they localize for free. The registry only holds chrome that has no Intl equivalent (button labels, ARIA fallbacks, dropzone copy).

This keeps the registry small enough that a consumer can sensibly translate it inline without a full message-catalog framework.

### Component migration

- **`@kanso-protocol/datepicker` `0.1.0` → `0.2.0`** *(minor — new `@kanso-protocol/i18n` peer dep)*
  - Month names (long + short) now from `kpMonthNames(locale)`.
  - Weekday labels from `kpWeekdayNames(locale, firstDayOfWeek, 'narrow')`.
  - Date format via `kpFormatDate(d, locale, { dateStyle: 'medium' })` — `dateFormatter` input still wins for custom needs.
  - Default presets (Today / Yesterday / This week / Last week / This month / Last month) pulled from `KP_STRINGS` so they translate alongside the rest.
  - ARIA labels (`Clear date`, `Previous`, `Next`) bound to `strings.clear` / `strings.previousMonth` / `strings.nextMonth`.

### Doc

- `docs/i18n.md` — usage + which components are migrated + roadmap.
- `docs/1.0-readiness.md` cross-cutting (2) updated to reflect the in-progress migration.

### Migration

For datepicker consumers using English: **no action needed**. Default factory and string defaults match the previous hardcoded behavior.

To switch the picker to another locale:

```ts
bootstrapApplication(AppComponent, {
  providers: [
    { provide: KP_LOCALE, useValue: 'fr-FR' },
    { provide: KP_STRINGS, useValue: {
        today: 'Aujourd\\'hui',
        yesterday: 'Hier',
        clear: 'Effacer',
        previousMonth: 'Mois précédent',
        nextMonth: 'Mois suivant',
    }},
  ],
});
```

### Tooling

- `scripts/build-libs.js` — adds discovery of `packages/i18n` and stops hardcoding `'core'` as the dist folder name for `core`-layer packages (now uses `folderName`). Lets future shared peers (e.g. `@kanso-protocol/utils`) drop into `packages/<name>` without code changes to the build script.

### Remaining migrations

`timepicker`, `file-upload`, `command-palette`, `search-bar` — all have keys defined in `KP_STRINGS` but components still hardcode them in `@Input` defaults. Tracked in `docs/1.0-readiness.md`.

---

## 2026-04-28 — `@kanso-protocol/virtual-list` — fixed-height window virtualization

Fourth and final gap-fill from `docs/1.0-readiness.md`. Generic window-mode virtual scroller for fixed-height rows. Renders only the visible window + an overscan buffer; below ~100 rows just render normally — virtualization adds complexity for nothing.

### New package

- `@kanso-protocol/virtual-list@0.1.0` *(experimental)*

### What it does

- O(1) per-scroll math (`Math.floor(scrollTop / itemHeight)`), no measurement pass.
- Translated window: rendered rows live inside `transform: translate3d(0, visibleStart * itemHeight, 0)`. Outer spacer keeps the scrollbar honest.
- Generic over item shape — pass any `T[]`, project a `<ng-template kpVirtualRow let-item let-i="index">`.
- `[overscan]` buffer for smooth scroll, `[trackBy]` for reconciliation, `(rangeChange)` event for prefetching / "showing N of M" indicators.
- `scrollToIndex(i, 'start' | 'center' | 'end')` imperative method.
- ARIA `role="list"` + per-row `role="listitem"` with `aria-rowcount` / `aria-rowindex`.

### Why fixed-height only

Variable-height needs either pre-measured heights or measure-on-mount with a position cache + careful invalidation. Both add complexity and risk reflow per scroll. Fixed-height is the 90% case (data tables, log viewers, chat scrolls). Variable-height ships separately as `<kp-variable-virtual-list>` (roadmap) so the simple fast path stays simple.

### Integration with `kp-table`

For >500 table rows: compose `<kp-virtual-list>` around your row cell template. A baked-in `<kp-table-virtual>` is on the roadmap so users get virtualization with zero composition glue.

### Migration

None — new package.

---

## 2026-04-28 — `@kanso-protocol/command-palette` — standalone ⌘K-style launcher

Third gap-fill from `docs/1.0-readiness.md`. Modal command launcher composing `<kp-dialog>` (chromeless) with internal input + grouped result list. Owns keyboard navigation (↑/↓/Home/End/Enter/Esc) and a configurable global open-shortcut (default `mod+k` — ⌘ on Mac, Ctrl elsewhere).

### New package

- `@kanso-protocol/command-palette@0.1.0` *(experimental)*

### Why a separate component from `search-bar` `variant="command-palette"`

`search-bar`'s command-palette variant gives you the **panel UI** but not the rest: no modal wrapper, no global open-shortcut, no keyboard navigation across items, no focus-trap-on-open / restore-on-close. Anyone using it as a real ⌘K experience had to wire those themselves.

`@kanso-protocol/command-palette` packages those concerns:
- Composes `<kp-dialog>` (peer dep) → focus trap, backdrop, Esc-to-close come for free.
- `[shortcut]` input registers a `window:keydown` listener that toggles `open` on the configured combo. `mod` resolves to ⌘ / Ctrl per platform; the kbd hint in the footer renders accordingly.
- Internal `↑/↓/Home/End/Enter` handler walks visible items, **skipping disabled**, with `aria-activedescendant` for screen-reader users.
- `(filterChange)` keystroke event lets the consumer own filter logic — local list, debounced API, fuzzy matcher, whatever.
- `<kp-search-bar variant="command-palette">` stays for use inside an existing layout (e.g. embedded inside a docs sidebar). It's a panel, not a modal — different intent.

### Migration

None — new package. If you were building an ad-hoc ⌘K on top of `search-bar`, swap to `<kp-command-palette>` and drop the boilerplate.

---

## 2026-04-28 — `@kanso-protocol/markdown-viewer` — read-only markdown renderer

Second gap-fill from `docs/1.0-readiness.md`. CommonMark + GFM via bundled `marked@^7`, pluggable parser, three sizes (sm / md / lg), sanitized-by-default output via Angular's `[innerHTML]` automatic sanitizer.

### New package

- `@kanso-protocol/markdown-viewer@0.1.0` *(experimental)*

### Why a separate component from `rich-text-editor`

`rich-text-editor` is the *write* path — TipTap-backed, emits HTML. `markdown-viewer` is the *read* path. They have different bundle sizes, different lifecycle constraints (the editor needs a dispose hook; the viewer doesn't), and different consumer mental models. Splitting them keeps each one small and intent-clear.

### Why `marked` and not zero-dep

A markdown viewer that doesn't parse markdown isn't a markdown viewer. `marked@7` is ~30 KB minified, MIT, and battle-tested. Declared as `dependencies` (not peer) so consumers don't have to install it; `allowedNonPeerDependencies` in `ng-package.json` whitelists it for ng-packagr.

For consumers who want plugins (footnotes, KaTeX, embeds), `[parser]` accepts any `(md: string) => string` — drop in `markdown-it` + plugins, `remark`, or a custom function.

### Migration

None — new package.

---

## 2026-04-28 — `@kanso-protocol/file-upload` — drag-and-drop dropzone

First component closing a `1.0` gap from `docs/1.0-readiness.md`. Drag-and-drop + click-to-browse with constraint validation (`accept` / `maxSize` / `maxFiles`) and a managed file list. The component owns the row state; the consumer drives upload progress via `setProgress(id, n)` and finalizes via `setStatus(id, 'success' | 'error')`.

### New package

- `@kanso-protocol/file-upload@0.1.0` *(experimental)*

### What's in the box

- Two layouts: `appearance="default"` (vertical zone with icon + label) and `appearance="compact"` (single-row strip for dialogs / form sections).
- Three sizes: `sm` / `md` / `lg`.
- A11y: zone is `role="button"` with keyboard activation (`Enter` / `Space`); per-row progress is `role="progressbar"` with proper aria values.
- `(filesAdded)` / `(filesRejected)` / `(fileRemoved)` event surface.
- `setProgress(id, n)` + `setStatus(id, status, error?)` imperative methods for the consumer to drive upload state.
- Token-only colors via `color.accent.{primary,danger,success}.fg` — auto-correct in dark mode.

### Tests + docs

- 13-case spec covering ingest, multi vs single, rejection by size / count / type, removal, progress + status mutation, format helpers, disabled state.
- `docs/components/file-upload.md` contract.
- README catalog row + total bumped 37 → 38.

### Open questions before promoting to `beta`

- Server upload contract is consumer-implemented — Kanso could ship a reference adapter (XHR / fetch with progress events) as a separate `*-upload-adapter` package or guide.
- `accept` is OS-level only (filters the picker dialog, doesn't validate magic bytes). Document that re-validation on the server is required.
- No image preview thumbnail variant yet — TBD in a follow-up.

---

## 2026-04-28 — un-invert brand action shades + white solid-button fg (Step B of dark refactor)

Step B of the dark architecture rebuild — applies the actual visual fix that Step A enabled. Solid-bg buttons now render with saturated brand bg (proper hover darkens correctly) and white fg (matches light-mode hierarchy). Accent text on the page surface is unaffected — it goes through `color.accent.*` and keeps its light-mode-readable hex.

### Bumps

- `@kanso-protocol/core` `0.4.0` → `0.5.0` *(observable visual change in dark mode — minor)*

### What changed in `tokens/themes/dark.json`

- **Brand stops `600 / 700 / 800` un-inverted** for `blue`, `red`, `green`, `amber`, `cyan`, `orange`, `violet`. They now resolve to the same saturated light-mode values (e.g. `blue.600` = `#2563EB` in both modes). Solid bg buttons get correct hover → active progression.
- **`primary.default.fg.{rest,hover,active,focus,loading}` → `#FFFFFF`**. Same for `danger.default.fg.*`. Disabled stays at `#A1A1AA`. Pairs the saturated bg with a white label, matching the light-mode contrast intent.
- **Subtle stops `50 / 100 / 200` remain inverted** — those drive `*.subtle.bg` (low-emphasis backgrounds) and need the dark surface treatment.

### Why this didn't regress like the original phase A

The fix that broke last time was un-inverting brand primitives without first decoupling the components that read them directly for text on the page. Step A added `color.accent.*` and migrated 21 components to use it. So when Step B un-inverts the primitives, only the things that *should* change (solid-bg buttons) actually change — accent text on the page goes through `accent.*-fg`, which stays at `#60A5FA` / `#F87171` / etc. and remains readable.

### Migration

None for token consumers using the public `--kp-color-accent-*` or `--kp-color-{primary,danger}.default.*` variables.

If your own CSS reads `--kp-color-blue-600` / `red-600` / `green-600` / `amber-600` / `cyan-600` / `orange-600` / `violet-600` directly **for text colors** in dark mode, those will now look saturated. Switch to `--kp-color-accent-*-fg` to get the semantic dark-mode-readable value.

### Tooling

- `scripts/publish-libs.js` — added `isAlreadyPublished` skip for npm registry propagation lag (no-op for fresh versions; only kicks in when re-running after a partial publish).

---

## 2026-05-04 — semantic accent tokens + component migration (Step A of dark refactor)

Step A of the proper dark theme architecture rebuild — set up the right token plumbing so Phase A (un-invert action shades) can land safely in Step B. Visually a no-op: same hex values resolve in both modes, just through a new semantic layer.

### Bumps

- `@kanso-protocol/core` `0.3.2` → `0.4.0` *(new `color.accent.*` semantic token family — minor)*
- `@kanso-protocol/combobox` `0.1.1` → `0.1.2`
- `@kanso-protocol/input` `0.1.0` → `0.1.1`
- `@kanso-protocol/rich-text-editor` `0.1.2` → `0.1.3`
- `@kanso-protocol/select` `0.1.0` → `0.1.1`
- `@kanso-protocol/notification-center` `0.1.0` → `0.1.1`
- `@kanso-protocol/stat-card` `0.1.0` → `0.1.1`
- `@kanso-protocol/theme-toggle` `0.1.0` → `0.1.1`
- `@kanso-protocol/user-menu` `0.2.0` → `0.2.1`

### What changed

**New token family `color.accent.*`** in `tokens/semantic/color.json`:

- `accent.primary.fg` → `{color.blue.600}` (light) / `#60A5FA` (dark)
- `accent.danger.fg` → `{color.red.600}` (light) / `#F87171` (dark)
- `accent.success.fg` → `{color.green.600}` (light) / `#4ADE80` (dark)
- `accent.warning.fg` → `{color.amber.600}` (light) / `#FBBF24` (dark)
- `accent.info.fg` → `{color.cyan.600}` (light) / `#22D3EE` (dark)

Designed for **text rendered on the page surface** (selected tabs, active breadcrumb links, danger labels in user-menu, success/danger trend indicators in stat-card, etc.). Decoupled from solid-button bg, which lets each be tuned independently in dark mode without contradiction.

**Migrated 21 direct primitive references** in component / pattern CSS to the new accent tokens:

- `combobox`, `input`, `rich-text-editor`, `select`, `notification-center` — option/error text colors
- `stat-card` — trend indicators (good/bad → success/danger)
- `theme-toggle` — active state
- `user-menu` — danger row text

Each `color: var(--kp-color-{blue,red,green}-600|700)` became `color: var(--kp-color-accent-{primary,danger,success}-fg)`. **Same hex value resolves in both themes** — visually a no-op confirmed by `visual-regression` CI gate (50/50 baselines pass).

### Why this is Step A and not the full fix

Step A is the no-op refactor — token plumbing is in place. Step B (the next release) will:

1. Un-invert brand action shades `600/700/800` in `tokens/themes/dark.json`. Solid bg buttons get saturated dark-blue / dark-red bg, hover correctly darkens vs rest.
2. Override `*.default.fg.*` for solid buttons back to `#FFFFFF` to match the saturated bgs.
3. Components that use `--kp-color-accent-*-fg` are unaffected (they have explicit dark overrides). Components that still use brand primitives directly stay correct visually because step A's migration covered the text-color uses.

VR catches anything I missed.

### Migration

If your own CSS reads brand primitives for accent text — switch to `--kp-color-accent-*-fg`. Existing direct-primitive uses keep working in this release; Step B won't break them either if they're for non-text uses (border, background icon).

---

## 2026-05-04 — full revert of dark architecture phases A+B+C

The phase A+B+C bundle landed at 168 failed / 163 passed — a 30-story regression vs the pre-refactor baseline of 138 / 193. Root cause: phase A un-inverted brand `600/700/800` stops, which fixed solid buttons but broke every component that references brand primitives DIRECTLY for accent text (`<kp-tab--selected>`, `<kp-breadcrumb>`, `<kp-pagination__item--active>`, etc.). Those switched from a readable light-blue (`#60A5FA`) to a saturated dark-blue (`#2563EB`) that fails contrast on the dark page bg.

The fix that wouldn't regress requires synchronously editing every component CSS file that hardcodes a `var(--kp-color-blue-600)`-style reference to use a semantic accent token instead. That's ~20 component edits + a new `color.accent.*` token family. Out of scope for a single CI cycle.

### Bumps

- `@kanso-protocol/core` `0.3.1` → `0.3.2` *(patch — visual values restored to designer-pass state)*

### Migration

None — visual state goes back to where `core@0.2.5` was. Designer-pass picks for `*.subtle.fg` and the round-2 entries for form-field / stat-card / etc. all preserved.

### What we learned

The dark theme architecture has TWO classes of contrast issue that pull in opposite directions:

1. **Solid bg buttons / badges** — pastel inverted brand bgs paired with dark designer fg picks. Visually less "dark mode" but contrast-correct.
2. **Direct primitive accents** — `var(--kp-color-blue-600)` for accent text that needs to read on the dark page.

A clean fix needs both: un-invert the action ramp AND introduce `color.accent.*` semantics so accent-text components stop reaching for primitive values. Tracked for a separate, thorough refactor.

---

## 2026-05-04 — dark architecture phase C: outline / ghost fg

Follow-up to phase A+B. With brand action shades now staying at light values in dark, `outline` / `ghost` button variants (transparent bg, fg sits on the page bg `#09090B`) had `blue.600 = #2563EB` as fg — only 3.74:1 against the dark page, fails AA.

Phase C overrides `outline.fg.*` and `ghost.fg.*` to lighter shades for dark mode:

- `primary` → `blue-400 (#60A5FA)` rest, `blue-300 (#93C5FD)` hover, `blue-200 (#BFDBFE)` active
- `danger`  → `red-400 (#F87171)` rest, `red-300 (#FCA5A5)` hover, `red-200 (#FECACA)` active
- `neutral` → `gray-300 (#D4D4D8)` rest, `gray-200 (#E4E4E7)` hover, `gray-100 (#F4F4F5)` active

All 6 states (rest / hover / active / focus / disabled / loading) for each color × variant.

### Bumps

- `@kanso-protocol/core` `0.3.0` → `0.3.1`

### Also in this release

README clarifies the dual `tokens.css` + `_tokens.scss` story. CSS custom properties are the primary distribution; `_tokens.scss` exposes the equivalent compile-time `$kp-*` variables for legacy Sass consumers.

### Migration

None — pure dark-theme refinement. Light theme unchanged.

---

## 2026-05-03 — dark theme architecture: split brand inversion

The first big architectural pass on dark theme. Stops fighting the primitive-inversion strategy by being explicit about WHICH stops in the brand ramps should invert and which shouldn't.

### Bumps

- `@kanso-protocol/core` `0.2.5` → `0.3.0` *(minor — visual changes for any component using saturated brand colors in dark mode)*

### What changed

**Phase A — un-invert action shades**

For each brand ramp (`blue / red / green / amber / cyan / orange / violet`) the `600 / 700 / 800` stops now stay at their LIGHT values in dark mode. The `50 / 100 / 200` stops still invert (they drive `subtle.bg` darkening). The mid-stops (`300 / 400 / 500`) stay at light values too.

Why this matters: in light mode `blue.700` is darker than `blue.600` — the standard "press to darken" hover convention. After full primitive inversion in dark mode, `blue.700` was lighter than `blue.600`, which made every solid-bg hover state appear to brighten instead of deepen, and forced the designer's deep-tone fg picks (`#172554`) to contend with bg's that lightened toward them.

After this change in dark mode:
- `--kp-color-blue-600` = `#2563EB` (saturated action blue, same as light)
- `--kp-color-blue-700` = `#1D4ED8` (deeper, hover/active)
- `--kp-color-blue-800` = `#1E40AF` (deepest, active)
- Same for `red / green / amber / cyan / orange / violet`

**Phase B — solid-button fg back to white**

With saturated bgs returning to dark mode, white text is the natural contrast pair. Overrides:

- `primary.default.fg.{rest, hover, active, focus, loading}` → `#FFFFFF`
- `danger.default.fg.{rest, hover, active, focus, loading}` → `#FFFFFF`
- `*.default.fg.disabled` → `#A1A1AA`
- `neutral.default.fg.*` unchanged (it sits on inverted gray surface, dark text was correct)

This supersedes the designer-pass picks for these same tokens in `core@0.2.0/0.2.3`. Designer's picks were correct *for the previous architecture* where dark-mode bgs were pastel; with bgs back at saturated values, white fg is both the canonical choice and a stronger contrast pair (often 8-12:1 instead of 4-7:1).

### Migration

If you depended on the dark-mode pastel-blue look of `<kp-button color="primary" variant="default">` (post `0.2.0`), the new look is saturated-blue + white text — closer to the light-mode rendering. Subtle / outline / ghost variants are unchanged.

### Why minor (not patch)

Visual changes for every consumer using saturated brand colors in dark theme. Per [Versioning policy](CONTRIBUTING.md#versioning-policy): observable rendering shift = minor.

---

## 2026-05-02 — revert solid-button bg state overrides

The 0.2.4 "fix" was based on a wrong contrast intuition. I assumed that lighter bg + dark fg gave low contrast, but it's the opposite — lighter bg with dark fg = HIGHER contrast. The primitive-inverted dark mode hover/active bgs (which lighten to `#93C5FD` / `#BFDBFE`) actually pair well with the designer's deep `fg.rest = #172554` (`7.83:1` and `14:1` respectively). My override darkened the bg toward the fg instead, dropping ratios into the 2-3:1 range.

Reverts the bg state overrides added in `0.2.4`. Designer's `fg.rest` picks now hold via the natural primitive cascade for hover/active/focus/loading.

### Bumps

- `@kanso-protocol/core` `0.2.4` → `0.2.5`

---

## 2026-05-02 — fix(tokens): solid-button bg state direction in dark

Architectural fix that follows the designer-pass: in light mode, `*.default.bg.hover` (`blue-700`) is *darker* than `*.default.bg.rest` (`blue-600`), giving the standard "press-to-darken" feel. After primitive ramp inversion in dark mode, `blue-700` (which becomes `#93C5FD` light) is *lighter* than `blue-600` (which becomes `#60A5FA` light) — so the hover state appears to "press up to lighter" instead of "press down to darker". This made the designer's deep-tone fg picks (`#172554`, `#450A0A`) fail contrast on hover/active because the bg lightened toward them.

### Bumps

- `@kanso-protocol/core` `0.2.3` → `0.2.4`

### What changed

Explicit bg overrides in `tokens/themes/dark.json` that re-invert the hover/active values back to "darker than rest":

- `primary.default.bg.hover`  → `#2563EB` *(light's blue-600)*
- `primary.default.bg.active` → `#1D4ED8` *(light's blue-700)*
- `primary.default.bg.focus`  → `#60A5FA` *(same as rest — focus shouldn't change tone)*
- `primary.default.bg.loading`→ `#60A5FA`
- `danger.default.bg.hover`   → `#DC2626` *(light's red-600)*
- `danger.default.bg.active`  → `#B91C1C` *(light's red-700)*
- `danger.default.bg.focus`   → `#F87171`
- `danger.default.bg.loading` → `#F87171`
- `neutral.default.bg.hover`  → `#E4E4E7`
- `neutral.default.bg.active` → `#D4D4D8`

Designer's `fg.rest` picks now hold contrast across all interactive states because hover/active bgs are deeper, not lighter.

### Migration

None. Pure dark.css refinement. Light mode unchanged.

---

## 2026-05-01 — designer-pass round 2 (full 32-token integration)

Designer returned the picker with 32 selections — 18 from round 1 (with 2 revised values) + 14 new entries from round 2. All applied to `tokens/themes/dark.json`.

### Bumps

- `@kanso-protocol/core` `0.2.2` → `0.2.3`

### Revised from round 1

- `primary.default.fg.rest`: `#0F1729` → `#172554`  *(blue-50 light = the deepest blue — designer prefers a tinted dark over the near-black almost-black)*
- `nav-item.fg.disabled`: `#52525B` → `#71717A`  *(gray-500 pivot — slightly lighter for nav-item context)*

### New round-2 entries

- `form.helper`: `#A1A1AA`  &nbsp; — form-field hint text below input
- `form.label`: `#D4D4D8`  &nbsp; — form-field label above input
- `stat-card.trend-value-good`: `#4ADE80`  &nbsp; — positive trend (green)
- `stat-card.trend-value-bad`: `#F87171`  &nbsp; — negative trend (red)
- `stat-card.trend-value-neutral`: `#A1A1AA`
- `textarea.counter`: `#71717A`
- `alert.primary.subtle.fg-title`: `#DBEAFE`
- `alert.primary.subtle.fg-desc`: `#BFDBFE`
- `divider.label`: `#A1A1AA`
- `datepicker.day.fg.rest`: `#F4F4F5`
- `datepicker.day.fg.outside`: `#71717A`  *(designer kept the failing-AA value — likely intentional muted-style choice; revisit if axe complains)*
- `table.row.fg`: `#F4F4F5`
- `sidebar.section-label`: `#A1A1AA`
- `notif-item.time`: `#71717A`  *(same caveat as datepicker outside — borderline AA)*

### Migration

None — pure dark.css value updates within `@kanso-protocol/core`. Light theme rendering is unchanged.

---

## 2026-05-01 — designer-pass disabled-state correction + picker round 2 entries

Fixes my mistake on disabled values (`#71717A` actually fails AA at 3.5:1 on the dark-bg `#18181B` it sits on for many components) and adds 15 new entries to the Foundations / Dark Mode Token Picker for round 2.

### Bumps

- `@kanso-protocol/core` `0.2.1` → `0.2.2`

### Fix

- `primary.default.fg.disabled`, `danger.default.fg.disabled`, `neutral.default.fg.disabled` — moved from `#71717A` (gray-500 pivot, 3.5:1 on dark surfaces) to `#A1A1AA` (gray-400 light, 5.3:1). Subtle variants stay at `#52525B` since they sit on the deeper subtle backgrounds where contrast there is fine.

### Picker round 2

The Foundations / Dark Mode Token Picker now includes 15 additional entries (existing 18 + 15 = 33 total) covering the components that didn't make it into batch 1:

- form-field helper / label
- stat-card trend (good / bad / neutral)
- textarea counter chip
- alert primary subtle title / desc
- divider inline label
- datepicker day rest / outside-month
- table row cell
- sidebar section label
- notification-item time

Designer can revisit the picker page, scroll to the new entries, fill them in, and paste a fresh JSON for batch 2 integration.

---

## 2026-05-01 — designer-pass: button state extension

Patch follow-up to the designer-pass core@0.2.0. Algorithmic propagation of the .rest picks to the other 5 button states (hover, active, focus, loading, disabled) for the picked color × variant combos, plus neutral.subtle.fg.* family that was missed in batch 1.

### Bumps

- `@kanso-protocol/core` `0.2.0` → `0.2.1`

### What changed

For each `{primary,danger,neutral}.{default,subtle}.fg.*` already touched in 0.2.0:

- `hover`, `active`, `focus`, `loading` inherit the `.rest` value from designer's pick (consistent fg across these states is the project default — light mode does the same).
- `disabled` overrides to a muted `gray-500` / `gray-600` pivot — readable but visibly de-emphasised.
- `subtle` variant gets a slight progression: `.rest` → blue/red-300 light, `.hover` → blue/red-200, `.active` → blue/red-100. Mirrors the light-mode hover progression in reverse.
- `neutral.subtle.fg.*` was missing entirely from batch 1 — added with `gray-300` light at .rest, progressing to `gray-100` on active.

### Migration

None. dark.css gains additional explicit overrides; consumers already cascaded through to primitive-inverted defaults in 0.2.0, so the visual delta is "slightly better contrast on hovered/active subtle buttons" — no API change.

---

## 2026-05-01 — designer-pass on dark-mode color contrast

First wave from the Foundations / Dark Mode Token Picker page. Designer walked through the 18 most-flagged failing token pairs, picked an aesthetically-acceptable fg per entry, exported JSON, integrated into `tokens/themes/dark.json`. After this release the dark theme should be much closer to WCAG AA across the catalog.

### Bumps

- `@kanso-protocol/core` `0.1.0` → `0.2.0` *(new semantic-token overrides in dark.css that consumers may observe — minor)*

### What changed (dark.css overrides)

Buttons:
- `--kp-color-primary-default-fg-rest` → `#0F1729`  *(almost-black on the light-blue dark-mode primary surface)*
- `--kp-color-danger-default-fg-rest`  → `#450A0A`  *(deepest red on the light-red dark-mode danger surface)*
- `--kp-color-neutral-default-fg-rest` → `#09090B`  *(true black on the inverted-white neutral surface)*
- `--kp-color-primary-subtle-fg-rest`  → `#93C5FD`
- `--kp-color-danger-subtle-fg-rest`   → `#FCA5A5`

Badges (subtle variants — pair with the existing dark subtle.bg overrides):
- `--kp-color-badge-primary-subtle-fg` → `#93C5FD`
- `--kp-color-badge-danger-subtle-fg`  → `#FCA5A5`
- `--kp-color-badge-success-subtle-fg` → `#86EFAC`
- `--kp-color-badge-warning-subtle-fg` → `#FDE68A`
- `--kp-color-badge-info-subtle-fg`    → `#67E8F9`
- `--kp-color-badge-neutral-subtle-fg` → `#D4D4D8`

Body / muted text:
- `--kp-color-card-fg-desc`              → `#A1A1AA`
- `--kp-color-input-fg-default`          → `#71717A`
- `--kp-color-popover-fg-desc`           → `#A1A1AA`
- `--kp-color-tabs-tab-fg-rest`          → `#A1A1AA`
- `--kp-color-nav-item-fg-disabled`      → `#52525B`
- `--kp-color-breadcrumbs-item-fg-link-rest` → `#93C5FD`
- `--kp-color-table-header-fg`           → `#A1A1AA`

### Migration

If you'd manually targeted these computed dark-mode values from your own CSS, recheck — they've moved. Tokens themselves are unchanged in light mode; behaviour is identical for `data-theme="light"` consumers.

### Why minor

Per [Versioning policy](CONTRIBUTING.md#versioning-policy): changes to token *values* (not names/structure) are normally patch — but these are observable in dark theme rendering of every `<kp-button>`, `<kp-badge>`, `<kp-card>`, etc. Calling it minor honors the spirit of "consumers may notice".

---

## 2026-04-30 (a11y wave 6 — structural roles + final landmark cleanup)

Wave 6 closes `aria-required-children`, `aria-required-parent`, `aria-command-name`, `aria-hidden-focus`, and the rest of `landmark-no-duplicate-banner` / `landmark-unique`. After this wave the only remaining theme-agnostic violations on the radar are story-level contrast issues (one-off cases worth addressing per-story, not at scale).

### Bumps

- `@kanso-protocol/tabs`      `0.2.0` → `0.3.0`
- `@kanso-protocol/menu`      `0.1.0` → `0.2.0`
- `@kanso-protocol/user-menu` `0.1.0` → `0.2.0`
- `@kanso-protocol/card`      `0.1.1` → `0.1.2`
- `@kanso-protocol/popover`   `0.2.1` → `0.2.2`
- `@kanso-protocol/button`    `0.3.0` → `0.3.1`

### What changed

**Structural role moves** (the minor bumps)

- `<kp-tabs>` — `role="tablist"` moved from the host to the inner `.kp-tabs__row` div. The host has both the row of tabs and an optional `[kpTabsMore]` slot which is not a tab; `role="tablist"` on the host therefore failed `aria-required-children`.
- `<kp-dropdown-menu>` — `role="menu"` moved from the host to the inner `.kp-dropdown-menu__body` div. Search field and footer buttons live alongside the menuitems on the host; restricting `role="menu"` to the items-only wrapper closes `aria-required-children`.
- `<kp-user-menu>` — same pattern. `role="menu"` is now on the items-bearing `<div class="kp-user-menu__group">` wrappers (not the host). The internal "Sign out" button gets explicit `role="menuitem"` so it satisfies `aria-required-children` on its parent group.

**Internal cleanup** (the patch bumps)

- `<kp-card>` and `<kp-popover>` — inner `<footer>` element replaced with `<div class="...__footer">`. Same reason as the wave-5 `<header>` swap: HTML5 `<footer>` is implicitly a `contentinfo` landmark, and stories that render multiple cards on a page tripped `landmark-no-duplicate-contentinfo`. Class names unchanged.
- `<kp-button>` — `.kp-button__label--hidden` no longer uses `display: none`. The label is still visually hidden during loading state, but stays in the accessibility tree (sr-only pattern) so the button keeps its accessible name. Closes `aria-command-name` on `[loading]` buttons.
- `<kp-menu-item>` — the `kp-menu-item__leading` slot is no longer `aria-hidden="true"`. Consumers may project interactive markers (`<kp-checkbox kpMenuItemLeading>` / `<kp-radio kpMenuItemLeading>`) into that slot, and an aria-hidden ancestor of a focusable element triggers `aria-hidden-focus`.

**Story-level exemptions** (no bumps)

- `Components/Pagination`, `Components/Accordion`, `Components/Card`, `Components/Popover` — disabled `landmark-unique` / `landmark-no-duplicate-contentinfo` for showcase stories that legitimately render multiple instances side by side.

### Migration

- `<kp-tabs>` — if you queried `kp-tabs[role="tablist"]` from CSS or JS, switch to `kp-tabs .kp-tabs__row` (or use the host element directly — the inner row is mainly an a11y boundary).
- `<kp-dropdown-menu>` and `<kp-user-menu>` — same. Internal styling that depended on `role="menu"` on the host needs to target the inner wrappers. Public class names and outputs are unchanged.
- The card/popover footer change is a tag swap; class names are unchanged. Anything matching by class keeps working.

### Why three minor and three patch

Per [Versioning policy](CONTRIBUTING.md#versioning-policy): moving a public ARIA role from one element to another is a DOM-shape change a consumer's selectors might rely on — minor. Tag swaps with identical class names that don't relocate any role/data attribute are internal — patch.

---

## 2026-04-30 (a11y wave 5 — long tail)

Wave 5 takes a final pass at the remaining theme-agnostic violations exposed by waves 1–4. Focus areas: HTML5 landmark elements that get implicit `banner` roles inside components (card / popover), nested-interactive in tabs, aria-allowed-attr on table sort buttons, label on form-input components, and story-level exemptions for shell-page demos.

### Bumps

- `@kanso-protocol/tabs`              `0.1.2` → `0.2.0` *(host is the focus + click target now; no inner button)*
- `@kanso-protocol/card`              `0.1.0` → `0.1.1`
- `@kanso-protocol/popover`           `0.2.0` → `0.2.1`
- `@kanso-protocol/table`             `0.1.0` → `0.1.1`
- `@kanso-protocol/segmented-control` `0.2.0` → `0.2.1`
- `@kanso-protocol/number-stepper`    `0.2.0` → `0.2.1`
- `@kanso-protocol/combobox`          `0.1.0` → `0.1.1`

### What changed

**Component fixes**

- `<kp-card>` — replaced inner `<header>` element with `<div class="kp-card__header">`. `<header>` is an HTML5 landmark (banner role implicitly) and stories that render multiple cards on a page tripped axe's `landmark-no-duplicate-banner`. The class name is unchanged so consumer styles still work.
- `<kp-popover>` — same `<header>` → `<div>` change inside the component template.
- `<kp-tabs>` — the `<kp-tab>` host already declared `role="tab"` + `tabindex` + handled focus, but the template wrapped its content in `<button class="kp-tab__btn">` — two interactive layers nested. axe flagged this as `nested-interactive`. The host is now the click + keyboard activation target directly; the inner element is a non-interactive `<span>`. Arrow-key navigation between tabs is unchanged (still owned by `<kp-tabs>` via roving tabindex), and `<kp-tabs>` now focuses the host element instead of querying for an inner button.
- `<kp-table>` — `aria-sort` moved from the inner sort button to the `<th class="kp-table__cell--header">` it lives in. axe's `aria-allowed-attr` rule allows `aria-sort` only on elements with role `columnheader` / `rowheader`, which `<th scope="col">` provides implicitly.
- `<kp-segmented-control>` — segments in icon-only display now get `[aria-label]` from the option's `label` (or `value` as fallback) so screen readers can name each tab.
- `<kp-number-stepper>` — input falls back to `aria-label="Number input"` instead of `null` when no `[ariaLabel]` is set.
- `<kp-combobox>` — input falls back to `aria-label="Combobox"` instead of `null`.

**Story-level exemptions** (no package bumps — Storybook only)

- Shell-page demos (Examples / Dashboard / Settings / List View / Detail View, Patterns / AppShell / Header / Sidebar / PageHeader / NotificationCenter) intentionally compose multiple landmark-bearing components on one page. Real consumers see one shell per page; the demo legitimately needs to render several side by side. Disabled `landmark-unique`, `landmark-no-duplicate-banner`, `landmark-no-duplicate-contentinfo` on those stories via `parameters.a11y.config.rules`.
- `Patterns / SettingsPanel` and `Examples / Login` — disabled `aria-toggle-field-name` for stories that intentionally show toggle / checkbox visual states without a projected label.

### Migration

- `<kp-tabs>`: if you queried the inner `button.kp-tab__btn` to programmatically click or focus a tab, switch to the `<kp-tab>` host element directly (`document.querySelector('kp-tab[label="Foo"]').click()` or `.focus()`).
- All other changes are internal: same class names, same DOM-shape from the consumer's perspective.

### Why one minor (tabs) and six patch

Per [Versioning policy](CONTRIBUTING.md#versioning-policy), removing a previously-public DOM target (`button.kp-tab__btn` → `span.kp-tab__btn`) is a renames/removes change and earns minor. The card/popover header change is a tag change visible in the DOM but semantically identical — no public input/output/class is renamed. The rest are internal aria-attribute additions.

---

## 2026-04-30 (a11y wave 4 — popover dialog name + RTE regression)

Wave 4 closes `aria-dialog-name` and reverts a subtle regression introduced in wave 3.

### Bumps

- `@kanso-protocol/popover`           `0.1.2` → `0.2.0`
- `@kanso-protocol/rich-text-editor`  `0.1.1` → `0.1.2`

### What changed

- `<kp-popover>` — new `[ariaLabel]` input. `role="dialog"` requires an accessible name; host now binds `[attr.aria-label]` to `title || ariaLabel || "Popover"`, so a popover with a visible title gets it as the SR name automatically; otherwise the `[ariaLabel]` override or the literal "Popover" is used.
- `<kp-rich-text-editor>` — wave 3's `aria-label="Rich text editor"` on the wrapper div was *worse* than the original gap. The wrapper has no role (TipTap mounts a child element with `role="textbox"`), so aria-label on it triggered `aria-prohibited-attr`. Moved the aria-label to TipTap's own ProseMirror element via `editorProps.attributes.aria-label` — that's the element with role="textbox" and where the rule expects the name.

### Migration

- Popover with `<kp-popover title="Foo">` keeps working; SR now announces "Foo, dialog". For title-less popovers, set `[ariaLabel]` explicitly.
- Patch on RTE — fully internal; no API change.

### Why minor for popover (and not patch)

New `[ariaLabel]` input on the public surface. Per [Versioning policy](CONTRIBUTING.md#versioning-policy), additive inputs are minor.

---

## 2026-04-30 (a11y wave 3 — patch)

Wave 3 closes the long tail of `aria-input-field-name`, `link-name`, `button-name` violations that emerged after waves 1+2. All internal aria-fixes — no public API changes — so all bumps are patch.

### Bumps

- `@kanso-protocol/slider`            `0.1.0` → `0.1.1`
- `@kanso-protocol/nav-item`          `0.1.0` → `0.1.1`
- `@kanso-protocol/search-bar`        `0.1.0` → `0.1.1`
- `@kanso-protocol/rich-text-editor`  `0.1.0` → `0.1.1`
- `@kanso-protocol/breadcrumbs`       `0.2.2` → `0.2.3`

### What changed

- `<kp-slider>` thumb (single mode) — falls back to `aria-label="Slider"` when no `[ariaLabel]` is set, instead of `null`.
- `<kp-nav-item>` collapsed mode — the inner button now gets `[attr.aria-label]="label"` when collapsed (label is hidden via `display:none` in collapsed mode, so screen readers had no name otherwise).
- `<kp-search-bar>` command-palette variant — input has `aria-label` mirroring the placeholder. The inline variant already had it.
- `<kp-rich-text-editor>` — editor div now has `aria-label="Rich text editor"` so the TipTap-injected `role="textbox"` is properly named.
- `<kp-breadcrumb-item>` — link / button fall back to `[aria-label]` (defaulting to `"Home"`) when no visible `label` or projected text is provided. Covers icon-only home breadcrumbs.

### Why patch (not minor)

Per [Versioning policy](CONTRIBUTING.md#versioning-policy): "Fixes a visual / behavioural bug without changing the public surface" → patch. None of these add or rename inputs / outputs / slots / classes. Internal accessibility hardening only.

---

## `0.4.0` — 2026-04-30 (a11y wave 2)

Wave 2 of the a11y audit — `aria-toggle-field-name` (12 violations) for the three roles that need an accessible name when used standalone, plus a fallback for the avatar's `role="img"`.

### Bumps

- `@kanso-protocol/toggle`   `0.1.0` → `0.2.0`
- `@kanso-protocol/checkbox` `0.1.0` → `0.2.0`
- `@kanso-protocol/radio`    `0.1.0` → `0.2.0`
- `@kanso-protocol/avatar`   `0.1.0` → `0.2.0`

### What changed

- `<kp-toggle>`, `<kp-checkbox>`, `<kp-radio>` — added `[ariaLabel]` input. When the visible label is projected via `<ng-content>` the projected text is the accessible name (no aria-label set, so it doesn't shadow). When `[hasLabel]="false"` (icon-only) and no `[ariaLabel]` is given, the host falls back to a sensible default (`"Toggle"` / `"Checkbox"` / `"Radio"`) so screen readers always have a name to announce.
- `<kp-avatar>` — when no `alt`, `initials`, or `ariaLabelOverride` is provided, the host now defaults to `aria-label="Avatar"` instead of leaving the name empty (which violated `aria-img-name`).

### Migration

Additive only — none required if you projected text labels (everyone using `<kp-toggle>Notifications</kp-toggle>` keeps the same accessible name). If you previously used `[hasLabel]="false"` and provided a name via a wrapping `<label>` or `aria-labelledby`, that still works; the new fallback only kicks in when nothing else is set.

---

## `0.3.0` — 2026-04-30 (a11y wave 1)

First wave of fixes from a CI-driven a11y audit (`test-storybook` running axe-core against every story in light + dark themes; results showed 260 of 330 stories had at least one moderate+ violation). This release covers `aria-progressbar-name` and `aria-prohibited-attr` on the most common offenders.

### Bumps

- `@kanso-protocol/button` `0.2.0` → `0.3.0`
- `@kanso-protocol/progress` `0.1.0` → `0.2.0`

### What changed

- `<kp-button>` — host now has `role="button"` and `tabindex` (0 when enabled, -1 when disabled). Existing `[aria-label]` set on `<kp-button>` (used by icon-only buttons) is no longer flagged as `aria-prohibited-attr`. Added a keydown handler so Enter/Space activate the button — native `<button>` got this for free; the custom-element host needed it explicit.
- `<kp-progress-linear>`, `<kp-progress-circular>`, `<kp-progress-segmented>` — added `[ariaLabel]` input. Defaults to `'Progress'` so screen readers always have an accessible name. Linear's existing fallback to the visible `label` is preserved.

### Migration

- **Tab order may shift** on pages using `<kp-button>` if you previously relied on the host element being skipped by the tab loop. The host is now in tab order with `tabindex=0`. If you intentionally need it non-focusable, set `tabindex="-1"` on the host directly.
- `<kp-progress-linear>` — if you set `[label]` and want the SR name to differ, set `[ariaLabel]`. Default behavior is unchanged.

### Why minor

`role="button"` on `<kp-button>` is observable in the DOM — anything matching `kp-button:not([role])` in CSS or scripts is broken. Tabindex change shifts focus order. New `[ariaLabel]` input is additive. Per [Versioning policy](CONTRIBUTING.md#versioning-policy), any of these alone earns minor.

### Out of scope

- Color-contrast violations in dark mode (~167 instances). Those need token-level work — a separate release.
- `aria-toggle-field-name` on toggle/checkbox/radio used standalone in stories (without label projection). Will be addressed in wave 2 along with custom-element ARIA hygiene for card / sidebar / breadcrumbs.

---

## `0.2.0` — 2026-04-30

Audit-driven cleanup pass. Same class of fixes as `0.1.1` (memory leaks, hardcoded sizes), now applied to the rest of the components after a systematic walk through every `*.component.ts`. Bumped as **minor** because public readonly properties were removed — see Migration below.

### Bumps

- `@kanso-protocol/button` `0.1.0` → `0.2.0`
- `@kanso-protocol/number-stepper` `0.1.0` → `0.2.0` *(peer: `button >=0.2.0`)*
- `@kanso-protocol/segmented-control` `0.1.3` → `0.2.0`
- `@kanso-protocol/tree` `0.1.0` → `0.2.0`

### What changed

Replaced TypeScript ternary-based icon-size getters with CSS custom properties — same pattern that closed `closeIconSize` / `closeSize` in `0.1.1`. Now every component sizes its glyphs via `--kp-<component>-icon-size`, settable from outside without touching TS.

- `<kp-button>` — `iconSizeMap` field removed; loading spinner and projected icons (`[kpButtonIconLeft]` / `[kpButtonIconRight]`) now size via `--kp-button-icon-size` set per `xs / sm / md / lg / xl`.
- `<kp-number-stepper>` — `iconSizeMap` + `iconSize` getter removed; the projected `+` / `−` icons inherit their size from the inner `<kp-button>`.
- `<kp-segmented-control>` — `iconSizeMap` + `iconSize` getter removed; option icons size via `--kp-segmented-icon-size`.
- `<kp-tree>` — `paddingForLevel(level)` method removed; row indentation now lives entirely in CSS via `padding-inline-start: calc(var(--kp-tree-pad-x) + var(--kp-tree-row-level, 0) * var(--kp-tree-indent))`. The level is supplied per-row via `[style.--kp-tree-row-level]="level"`.

### Migration

If you read these public properties from outside the components (rare — they were intended as internal helpers but were accessible), switch to the CSS custom-property equivalent:

| Before | After |
|---|---|
| `buttonCmp.iconSizeMap[size]` | `getComputedStyle(host).getPropertyValue('--kp-button-icon-size')` or set `--kp-button-icon-size` directly |
| `stepperCmp.iconSize` | (none — icons size via the inner button automatically) |
| `segmentedCmp.iconSize` | `--kp-segmented-icon-size` |
| `treeCmp.paddingForLevel(n)` | (none — level is set inline as `--kp-tree-row-level` and CSS does the math) |

If you didn't reference these internally — there's no migration needed. The visual output is identical.

### Why not a patch

Strict reading of [Versioning policy](CONTRIBUTING.md#versioning-policy): removing a TypeScript-public property is a renames/removes change to the public surface. Even if these properties were never documented as public API, they appeared in the generated `.d.ts` and were therefore reachable by consumers. Bumping minor honors the rule established in `0.1.3`.

---

## `0.1.3` — 2026-04-29

Fixes the visually broken pill-with-text case in `<kp-badge>` and disambiguates the API.

### Bumps

- `@kanso-protocol/badge` `0.1.2` → `0.1.3`
- `@kanso-protocol/header` `0.1.0` → `0.1.1` *(peer: `badge >=0.1.3`)*

### What changed

`<kp-badge>` had `[pill]` doing double duty — both *"fully rounded sides"* and *"circular short-number counter"*. Non-closable pill badges with text content (`Pro`, `Active`, `Enabled`) were forced into `padding-inline: 2px` and looked cramped against the curved edges.

The two intents are now separate inputs:

- **`[pill]`** — only `border-radius: full` + normal padding. For chips and word-bearing tags.
- **`[count]` (new)** — full radius + `min-width = height` + tight 2px padding + center alignment. For notification-style counters (`1`, `12`, `99+`). Pair with `size="xs"`.

### Migration

- `[pill]="true"` on word-bearing tags (`Pro`, `Online`, `Design`, etc.) — **no action required**. The visual now looks correct (more breathing room).
- `[pill]="true"` on short numeric counters — **switch to `[count]="true"`**:

```html
<!-- before -->
<kp-badge size="xs" color="danger" [pill]="true">12</kp-badge>

<!-- after -->
<kp-badge size="xs" color="danger" [count]="true">12</kp-badge>
```

The repo's own `<kp-header>` notification badge is migrated as part of this release.

---

## `0.1.2` — 2026-04-26

Hotfix for CI / consumer-app build failures introduced by `0.1.1`.

### Bumps

- `@kanso-protocol/accordion`, `alert`, `badge`, `popover`, `segmented-control`, `tabs` — `0.1.1` → `0.1.2`
- `@kanso-protocol/breadcrumbs` — `0.2.1` → `0.2.2`

### Why a hotfix

`0.1.1` shipped with `import { takeUntilDestroyed } from '@angular/core/rxjs-interop'` in the four components touched by the memory-leak fix. That subpath only resolves when the consumer's `tsconfig.json` uses `moduleResolution: "bundler"` (or `node16` / `nodenext`); under the legacy `node` resolver the import fails with `TS2307: Cannot find module '@angular/core/rxjs-interop'`. Storybook's webpack + ts-loader pipeline, and any downstream consumer with a default Angular `tsconfig.base.json`, hit the same error.

### What changed

Replaced `takeUntilDestroyed(DestroyRef)` with the classic `Subject<void> + takeUntil(destroyed$) + ngOnDestroy` pattern. Equivalent unsubscribe semantics, works under any `moduleResolution`. No public API change.

### Migration

- **Do not use `0.1.1`.** It is published on npm but unbuildable in projects with `moduleResolution: "node"`. `npm i @kanso-protocol/<name>@latest` resolves to `0.1.2` automatically.
- If you pinned `0.1.1` exactly, bump to `0.1.2` (or `0.2.2` for `breadcrumbs`).

---

## `0.1.1` — 2026-04-25

> **Skip this version. It is published but unusable in consumer projects with `moduleResolution: "node"`.** Use `0.1.2` instead.

### Bumps

- `@kanso-protocol/accordion`, `alert`, `badge`, `popover`, `segmented-control`, `tabs` — `0.1.0` → `0.1.1`
- `@kanso-protocol/breadcrumbs` — `0.1.0` → `0.2.1` *(`0.2.0` was an aborted release artifact from a `fixed: ["@kanso-protocol/*"]` group bump)*

### What changed

- **Memory leaks fixed** in `<kp-accordion>`, `<kp-breadcrumbs>`, `<kp-tabs>`, `<kp-segmented-control>`. `QueryList.changes` and per-item `EventEmitter` subscriptions were never unsubscribed — `ngOnDestroy` is now wired up everywhere.
- **Hardcoded sizes replaced** with CSS custom properties:
  - `<kp-badge>`, `<kp-alert>`, `<kp-popover>` — close-icon size moved out of TS getters into `--kp-badge-close-size` / `--kp-alert-close-icon-size` / `--kp-popover-close-icon-size`.
  - `<kp-badge>` — pill radius now resolves to the existing `--kp-radius-full` token instead of three hand-tuned 9 / 11 / 13 px values.

### Known issue

Imports `@angular/core/rxjs-interop` for `takeUntilDestroyed`, which doesn't resolve under `moduleResolution: "node"`. Replaced in `0.1.2`.

---

## `0.1.0` — initial alpha

First public release of the Angular component library + design tokens.

### Foundations

- **W3C DTCG tokens** — color, spacing, radius, motion, typography. Single source of truth shared by Figma library and CSS variables (built via Style Dictionary).
- **Light + dark themes** — every primitive token has both modes. Apply with `data-theme="dark"` on any ancestor (commonly `<html>`).
- **CSS-first composition** — every component reads tokens via CSS custom properties, so consumers can re-skin a single component or the whole system without forking.

### Components — `@kanso-protocol/{name}` (36 packages)

`accordion`, `alert`, `avatar`, `avatar-group`, `badge`, `breadcrumbs`, `button`, `card`, `checkbox`, `combobox`, `datepicker`, `dialog`, `divider`, `drawer`, `empty-state`, `form-field`, `input`, `menu`, `number-stepper`, `pagination`, `popover`, `progress`, `radio`, `rich-text-editor`, `segmented-control`, `select`, `skeleton`, `slider`, `table`, `tabs`, `textarea`, `timepicker`, `toast`, `toggle`, `tooltip`, `tree`.

Highlights:

- **Form controls** (`input`, `textarea`, `select`, `combobox`, `checkbox`, `radio`, `toggle`, `slider`, `datepicker`, `timepicker`, `number-stepper`) implement `ControlValueAccessor` — they plug into Reactive Forms and template-driven `ngModel` the same way native inputs do.
- **Form-field** auto-detects an `NgControl` content child, listens to `statusChanges` + `valueChanges`, and renders the right validation message via the `KP_VALIDATION_MESSAGES` injection token (defaults cover `required`, `email`, `min`, `max`, `minLength`, `maxLength`, `pattern`).
- **Overlays** (`dialog`, `drawer`, `popover`, `menu`, `tooltip`, `toast`) portal into `<body>` to escape clipped / transformed ancestors. Backdrop click + Esc close where appropriate.
- **Toast** queue is signal-driven via `KpToastService`; drop one (or more, one per corner) `<kp-toast-host/>` anywhere.
- **Rich text editor** is built on TipTap (ProseMirror) and exposes its HTML via `ControlValueAccessor` like every other form control. Toolbar covers history, marks, blocks, lists, alignment, link (inline editor), and image (delegated to host app via `(imageUpload)`).

### Patterns — `@kanso-protocol/{name}` (20 packages)

`app-shell`, `banner`, `container`, `filter-bar`, `form-section`, `grid`, `header`, `nav-item`, `notification-center`, `page-error`, `page-header`, `row`, `search-bar`, `settings-panel`, `sidebar`, `stack`, `stat-card`, `table-toolbar`, `theme-toggle`, `user-menu`.

Patterns are larger compositions (page shells, layouts, multi-control bars) built on top of components. Each is its own publishable package so consumers only pay for what they import.

### AI tooling — `@kanso-protocol/mcp`

A first-class [Model Context Protocol](https://modelcontextprotocol.io) server ships in the same release. Wire it into Claude Code / Cursor / VS Code with one line:

```jsonc
{ "mcpServers": { "kanso": { "command": "npx", "args": ["@kanso-protocol/mcp"] } } }
```

Seven stdio tools — `catalog_overview`, `list_components`, `get_component`, `list_patterns`, `get_pattern`, `list_tokens`, `get_token` — let your assistant introspect the live catalog (inputs, outputs, ARIA roles, keyboard patterns, every CSS variable) instead of guessing from training data. Manifest is regenerated from sources via `ts-morph` on every build, so it never drifts. Figma bridge (`figma_component_for(name)`, `figma_token_for(name)`) lands in `0.2.x`.

### Quality

- **352 unit tests across 38 spec files** (Vitest + Angular `@angular/build:unit-test` runner) covering every shipped component. See the live [Storybook Test Coverage page](https://gregnblack.github.io/kanso-protocol/?path=/docs/foundations-test-coverage--docs).
- **Storybook** docs deployed to `https://gregnblack.github.io/kanso-protocol/` — every component and pattern has stories with controls, source, and usage docs.
- **CI** — install + tests + Storybook build + `ng-packagr` build for all 57 packages (56 libs + MCP server) on every push.

### Known limitations / out of scope for `0.1.0`

- **API is intentionally unstable.** Until `1.0`, any minor bump (`0.x.y`) may include breaking changes. Pin exact versions in production.
- **SSR validation pending.** Components access the DOM exclusively via `inject(DOCUMENT)` or inside `ngAfterViewInit` / `ngAfterViewChecked` (which don't run on the server), and teardown logic is guarded with `typeof window !== 'undefined'`. Static analysis suggests they should render on bare-metal `@angular/platform-server`, but a full SSR + hydration test is on the `0.2.x` track.
- **Manual a11y audit pending.** Components ship with the WAI-ARIA keyboard patterns for their roles (`tablist` Left/Right/Home/End, `tree` Arrow+Expand/Collapse, `datepicker` grid Arrow+PageUp/Down+Home/End+Enter, `slider` Arrow+PageUp/Down+Home/End, `combobox` Arrow+Enter+Escape, plus Escape on every overlay), roving-tabindex where applicable, and a `prefers-reduced-motion` pass. A formal screen-reader audit is still on the `0.2.x` track.
- **RTL validation pending.** Components use CSS logical properties (`margin-inline-start`, `padding-inline-end`, `border-start-start-radius`, `text-align: start`, etc.) throughout — setting `dir="rtl"` on an ancestor should flip horizontal layout without overrides. Formal RTL validation (visual regression on Arabic / Hebrew content) is on the `0.2.x` track. Drawer's `side="left" | "right"` remains a physical API by design.
- **Onest font + Tabler icons** are referenced via the host app's font/icon stack; no CDN vendoring inside packages yet.

### Install

```sh
npm install @kanso-protocol/<package>
# e.g. npm install @kanso-protocol/button @kanso-protocol/input @kanso-protocol/form-field
```

Components are standalone and tree-shakeable — import only what you use.
