# Changelog

Top-level log of every release. Mirrors the [GitHub Releases](https://github.com/GregNBlack/kanso-protocol/releases) page; this file is the authoritative source — release notes are produced from these sections.

## Release cadence

- **Alpha (`0.x.y`)** — API may change in any minor bump. No backward-compatibility guarantees. Pin exact versions.
- **Beta (`1.0.0-beta.N`)** — API frozen; only breaking fixes. Feedback phase.
- **Stable (`>=1.0.0`)** — strict SemVer; breaking changes only in major bumps, with deprecation cycles.

See [`CONTRIBUTING.md` → Versioning policy](CONTRIBUTING.md#versioning-policy) for the rules that decide which segment to bump for a given change.

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
