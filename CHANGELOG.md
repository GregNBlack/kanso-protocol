# Changelog

Top-level log of every release. Mirrors the [GitHub Releases](https://github.com/GregNBlack/kanso-protocol/releases) page; this file is the authoritative source — release notes are produced from these sections.

## Release cadence

- **Alpha (`0.x.y`)** — API may change in any minor bump. No backward-compatibility guarantees. Pin exact versions.
- **Beta (`1.0.0-beta.N`)** — API frozen; only breaking fixes. Feedback phase.
- **Stable (`>=1.0.0`)** — strict SemVer; breaking changes only in major bumps, with deprecation cycles.

See [`CONTRIBUTING.md` → Versioning policy](CONTRIBUTING.md#versioning-policy) for the rules that decide which segment to bump for a given change.

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
