# 簡素 Kanso Protocol

[![CI](https://github.com/GregNBlack/kanso-protocol/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/GregNBlack/kanso-protocol/actions/workflows/ci.yml)
[![Storybook](https://img.shields.io/badge/Storybook-live-FF4785?logo=storybook&logoColor=white)](https://gregnblack.github.io/kanso-protocol)
[![Figma Community](https://img.shields.io/badge/Figma-Community-F24E1E?logo=figma&logoColor=white)](https://www.figma.com/community/file/1633266134559104948)
[![Tests](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2FGregNBlack%2Fkanso-protocol%2Fmain%2F.github%2Fbadges%2Ftests.json)](https://gregnblack.github.io/kanso-protocol/?path=/docs/foundations-test-coverage--docs)
[![MCP](https://img.shields.io/badge/MCP-ready-7c3aed)](https://www.npmjs.com/package/@kanso-protocol/mcp)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

**Open source design system for Angular — and any framework via Web Components — built on architectural consistency.**

Design tokens in W3C DTCG format serve as a single source of truth for both Figma and code. Rules are embedded in architecture, not in agreements. Native Angular components ship as [`@kanso-protocol/ui`](https://www.npmjs.com/package/@kanso-protocol/ui); the same components compile to framework-agnostic custom elements as [`@kanso-protocol/elements`](https://www.npmjs.com/package/@kanso-protocol/elements) for React, Vue, or plain HTML.

<!-- stability:start -->
> **Status: `5.x` stable.** Per the [stability matrix](docs/stability.md), the entire component and pattern catalog is `stable` — every component and pattern has its API frozen for `5.x`, with no breaking change without a major bump. The only non-`stable` surfaces are 4 `beta` token layers (Color (semantic), Typography, Motion, Elevation — held by open API questions, not missing coverage) and the `@kanso-protocol/elements` package (`experimental` `0.x` — custom-elements packaging, not any component API). Pin exact versions in production. The `5.0` line consolidated the former 64 per-component packages into a single `@kanso-protocol/ui` package with per-component secondary entry points ([ADR 0002](docs/adrs/0002-single-package-secondary-entry-points.md)) — install once, import per-subpath, tree-shaking preserved. **Upgrading from 4.x?** Follow the [v5 migration guide](docs/MIGRATION-v5.md) (mechanical import-path change; no component API changed). See [`docs/roadmap.md`](docs/roadmap.md) for what's next and the [changelog](CHANGELOG.md) for what landed.
<!-- stability:end -->

---

## Why Kanso Protocol?

簡素 (*kanso*) — one of the seven principles of Japanese aesthetics — is the practice of restraint and the removal of the unnecessary. The library follows the same idea: a small, opinionated, internally consistent surface where the rules live in the code, not in conventions.

- **Every value is a token.** Components never carry magic numbers or inline hex. CSS custom properties — generated from W3C DTCG tokens — are the single source of truth shared between Figma and code.
- **The rules are enforced, not just declared.** The contracts live in CI as gates, not conventions: token integrity (state-matrix completeness + the ramp-step invariant + dark-override existence), WCAG AA contrast measured on real token pairs in both themes, an architectural lint (no raw color / motion / shadow / physical CSS), machine-checked stability facts, and a fresh, drift-free MCP catalog.
- **Every component follows the same anatomy.** Container → Content → Element. New components don't introduce a new mental model.
- **Every state is explicit.** Six named states (rest / hover / active / focus / disabled / loading; form controls add `error`), each with its own color and motion tokens.
- **Accessible by construction.** `:focus-visible` rings (width / offset / color all tokenized), `prefers-reduced-motion` honored by every component, `@media (forced-colors: active)` support for Windows High Contrast, logical properties for RTL, and contrast pairs gated at AA in CI.
- **No exception without a record.** When a component departs from the contract, the deviation lives as an ADR with a reason — not as an undocumented one-off.
- **Designed to stay small.** Components are added intentionally, when there's a clear need — not because something might be useful.
- **One package, per-component entry points.** `npm i @kanso-protocol/ui`, then import each component from its own subpath (`@kanso-protocol/ui/button`). Tree-shaking ships only what you reference.
- **Not just Angular.** The same components ship as framework-agnostic custom elements (`@kanso-protocol/elements`) — use `<kp-*>` from React, Vue, Svelte, or plain HTML. SSR-safe out of the box with `@angular/ssr`.
- **AI-native.** Ships with `@kanso-protocol/mcp` — a Model Context Protocol server (12 tools) that exposes the live, typed catalog to Claude Code, Cursor, and VS Code, so the assistant authors Kanso UI from the actual API instead of from training-data guesses. Includes `check_composition`, which flags contract violations a linter can't catch at runtime (mixed sizes in a row, beta-tier usage).
- **Typed for React/TSX too.** `@kanso-protocol/elements` ships a Custom Elements Manifest (`custom-elements.json`) and `JSX.IntrinsicElements` types, so `<kp-select size="md" />` type-checks in a React/Vue project instead of erroring as an unknown element.

## Live Preview

- **Storybook:** [gregnblack.github.io/kanso-protocol](https://gregnblack.github.io/kanso-protocol) — every component, pattern and example page with autodocs, live controls, and a light/dark theme toggle.
- **Figma Community:** [figma.com/community/file/1633266134559104948](https://www.figma.com/community/file/1633266134559104948) — the full design library; duplicate it into your team to use the components, variables, and example pages directly.

## AI-native: ship with an MCP server

Kanso Protocol is one of the first design systems to ship a [**Model Context Protocol**](https://modelcontextprotocol.io) server out of the box — [`@kanso-protocol/mcp`](https://www.npmjs.com/package/@kanso-protocol/mcp). Your AI assistant (Claude Code, Cursor, VS Code, any MCP-aware client) can introspect the entire catalog over stdio: every component's inputs / outputs / ARIA role / keyboard pattern, every pattern, every design token. No copy-pasting docs, no guessing prop names, no out-of-date snippets.

### Install

The server runs via `npx`, so there's nothing to install globally — pick the snippet for your editor below.

<details open>
<summary><b>Claude Code</b></summary>

One command from the project root:

```bash
claude mcp add kanso -- npx @kanso-protocol/mcp
```

…or, equivalently, drop this into your project's `.mcp.json` (create the file if missing):

```jsonc
{
  "mcpServers": {
    "kanso": { "command": "npx", "args": ["@kanso-protocol/mcp"] }
  }
}
```

Restart Claude Code, then run `/mcp` to confirm `kanso` appears as ✔ connected with 12 tools.

</details>

<details>
<summary><b>Cursor</b></summary>

Open *Settings → Features → MCP* → **Add new MCP server**, then fill:

- Name: `kanso`
- Type: `command`
- Command: `npx @kanso-protocol/mcp`

…or edit `~/.cursor/mcp.json` directly (project-scoped: `.cursor/mcp.json` in repo root):

```jsonc
{
  "mcpServers": {
    "kanso": { "command": "npx", "args": ["@kanso-protocol/mcp"] }
  }
}
```

</details>

<details>
<summary><b>VS Code (Continue, Cline, GitHub Copilot agent mode)</b></summary>

Add to the extension's MCP config — for Continue this is `~/.continue/config.json`, for Cline it's the *Cline MCP Servers* settings panel. Same shape:

```jsonc
{
  "mcpServers": {
    "kanso": { "command": "npx", "args": ["@kanso-protocol/mcp"] }
  }
}
```

</details>

<details>
<summary><b>Other MCP-aware clients (Zed, Windsurf, Goose, custom)</b></summary>

Any client that speaks the [MCP stdio transport](https://modelcontextprotocol.io/docs/concepts/transports) works. Point it at:

```
command: npx
args:    ["@kanso-protocol/mcp"]
```

The server registers twelve tools at startup (`catalog_overview`, `list_components`, `get_component`, `list_patterns`, `get_pattern`, `check_composition`, `list_tokens`, `get_token`, `figma_context`, `figma_for_component`, `figma_for_pattern`, `figma_for_icon`).

</details>

### Try it

Once connected, ask your assistant things like:

- *"Which size ramp does `kp-input` support, and which validators does `form-field` translate by default?"*
- *"List every `--kp-color-*` token tied to the danger role."*
- *"I need a settings page with a sidebar of collapsible sections — which Kanso pieces compose that?"*

The assistant calls `list_components` / `get_component` / `list_tokens` under the hood and answers from the live catalog. Full tool reference — including the Figma bridge tools (`figma_for_component`, `figma_for_pattern`, `figma_for_icon`) — lives in the [package README](packages/mcp/README.md).

## Install & Use

> New here? The [**getting-started guide**](docs/getting-started.md) takes you from install → tokens → first screen → a working form in five steps. It works with [`@angular/ssr`](docs/ssr.md) out of the box.
>
> **Not on Angular?** `npm i @kanso-protocol/elements` gives you the same components as framework-agnostic [custom elements](docs/web-components.md) (`<kp-badge>`, `<kp-card>`, …) for React / Vue / plain HTML.

One package, per-component entry points. Install once; import only what you use — each entry point is a separate ESM module, so tree-shaking ships only what you reference.

```bash
npm install @kanso-protocol/ui
```

Load the tokens once in your app bootstrap. The primary distribution is **CSS custom properties** — all components consume them at runtime:

```ts
import '@kanso-protocol/ui/styles/tokens.css';
import '@kanso-protocol/ui/styles/dark.css';   // optional — enables [data-theme="dark"]
```

**Sass / SCSS consumers** can also import the equivalent compile-time `$kp-*` variables (handy for projects that haven't migrated to CSS custom properties yet):

```scss
@use '@kanso-protocol/ui/styles/tokens' as *;   // exposes $kp-color-blue-600 etc.
```

Both files are generated from the same DTCG source; pick whichever fits your stylesheet pipeline. Components themselves only depend on the CSS variables — they work identically regardless of which import you choose.

**Recolor to your brand** in one line — `npm run theme:brand -- "#7C3AED" > brand.css`, load it after `tokens.css`, and all 114 accent-derived tokens cascade with no rebuild. Light/dark, multi-brand, and fully-custom themes are covered in the [theming guide](docs/theming.md).

Use the component as a standalone Angular import:

```ts
import { Component } from '@angular/core';
import { KpButtonComponent } from '@kanso-protocol/ui/button';

@Component({
  standalone: true,
  imports: [KpButtonComponent],
  template: `<kp-button color="primary" (click)="save()">Save</kp-button>`,
})
export class MyFeatureComponent { save() { /* ... */ } }
```

Switch themes by toggling `data-theme` on `<html>` or `<body>`:

```html
<html data-theme="dark">   <!-- or "light" / omit for light -->
```

See the [Storybook](https://gregnblack.github.io/kanso-protocol) for the full API of every component — props, slots, variants, states, a11y notes.

## Visual regression

A small Playwright suite (`e2e/visual.spec.ts`) takes pixel-level screenshots of a curated set of representative stories — one per component family — in both light and dark themes. Baselines live in `e2e/visual.spec.ts-snapshots/` and are committed alongside source changes.

```bash
# Run against a locally-served Storybook
npm run build-storybook
npx http-server storybook-static --port 6006 --silent &
npm run test:visual

# Update baselines after an intentional visual change
npm run test:visual:update
```

CI runs the same suite under the `visual-regression` job. On a clean PR diffs above `maxDiffPixelRatio` (1%) fail the build; on the very first run (no committed baselines) CI generates them and uploads as a `visual-snapshots` artifact for review.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for dev-environment setup, coding conventions, how to add a component, and the token workflow.

## Development

```bash
git clone https://github.com/GregNBlack/kanso-protocol.git
cd kanso-protocol
npm install
npm run build:tokens    # DTCG JSON → CSS / SCSS / TS
npm run storybook       # localhost:6006
```

## Architecture

```
kanso-protocol/
├── tokens/
│   ├── primitive/        ← Raw values (colors, spacing, sizing)
│   └── semantic/         ← Roles & states (color.primary.default.bg.rest)
├── packages/
│   ├── core/             ← Compiled tokens, types, mixins
│   └── components/
│       └── button/       ← Reference implementation
├── .storybook/           ← Component showcase
└── .github/workflows/    ← CI/CD
```

## Design Tokens

Tokens follow the [W3C DTCG](https://design-tokens.github.io/community-group/format/) specification.

**Naming convention:**
```
{category}.{role}.{variant}.{property}.{state}
```

Example: `color.primary.default.bg.hover`

**Two-level architecture:**

| Level     | Purpose              | Example                              |
|-----------|----------------------|--------------------------------------|
| Primitive | Raw palette values   | `color.blue.600` → `#2563EB`        |
| Semantic  | Interface roles      | `color.primary.default.bg.rest` → `{color.blue.600}` |

## Component Anatomy

Every component follows a unified three-layer model:

```
┌─ Container ──────────────────────────┐
│  padding · border · radius · bg      │
│  ┌─ Content ──────────────────────┐  │
│  │  gap                           │  │
│  │  [Element] [Element] [Element] │  │
│  │   icon      label     badge    │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

> Full vocabulary, naming rules, and the variant-vs-state model live in [`docs/component-anatomy.md`](docs/component-anatomy.md).

## Component Sizes

| Size | Height | Radius | Use case                  |
|------|--------|--------|---------------------------|
| XS   | 24px   | 8px    | Dense UI, tables, tags    |
| SM   | 28px   | 10px   | Secondary actions         |
| MD   | 36px   | 12px   | **Default** — buttons, inputs |
| LG   | 44px   | 14px   | Touch-friendly, primary CTA |
| XL   | 52px   | 16px   | Hero actions              |

## States

Six explicit states for every interactive component:

| State    | Behavior                                        |
|----------|-------------------------------------------------|
| Rest     | Default appearance                              |
| Hover    | Pointer over element                            |
| Active   | Pointer pressed                                 |
| Focus    | Keyboard focus — 2px outline ring               |
| Disabled | Action unavailable — removed from tab order     |
| Loading  | Action in progress — keeps focus, `aria-busy`   |

**Loading ≠ Disabled.** Loading preserves focus and announces state to screen readers.

## Usage

```typescript
import { KpButtonComponent } from '@kanso-protocol/ui/button';

@Component({
  imports: [KpButtonComponent],
  template: `
    <kp-button size="md" variant="default" color="primary">
      Save
    </kp-button>

    <kp-button variant="outline" color="danger" [loading]="isSaving">
      Delete
    </kp-button>
  `,
})
export class MyComponent {
  isSaving = false;
}
```

## Components

42 components, one package. Install once; import each from its own entry point. Tokens live at the package root (`@kanso-protocol/ui` + `@kanso-protocol/ui/styles/*`) and load once for any component to render correctly.

```bash
npm i @kanso-protocol/ui
```

Then import only what you use — each entry point is tree-shaken independently:

```ts
import { KpButtonComponent } from '@kanso-protocol/ui/button';
import { KpSidebarComponent } from '@kanso-protocol/ui/sidebar';
```

Every component has a formal API contract (props, variants, states, a11y rules) and a live Storybook page with controls. The **Import** column below is the entry-point subpath.

| Component | Contract | Storybook | Import |
|---|---|---|---|
| Accordion | [accordion.md](docs/components/accordion.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-accordion--docs) | `@kanso-protocol/ui/accordion` |
| Alert | [alert.md](docs/components/alert.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-alert--docs) | `@kanso-protocol/ui/alert` |
| Avatar | [avatar.md](docs/components/avatar.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-avatar--docs) | `@kanso-protocol/ui/avatar` |
| AvatarGroup | [avatar-group.md](docs/components/avatar-group.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-avatargroup--docs) | `@kanso-protocol/ui/avatar-group` |
| Badge | [badge.md](docs/components/badge.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-badge--docs) | `@kanso-protocol/ui/badge` |
| Breadcrumbs | [breadcrumbs.md](docs/components/breadcrumbs.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-breadcrumbs--docs) | `@kanso-protocol/ui/breadcrumbs` |
| Button | [button.md](docs/components/button.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-button--docs) | `@kanso-protocol/ui/button` |
| Card | [card.md](docs/components/card.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-card--docs) | `@kanso-protocol/ui/card` |
| Checkbox | [checkbox.md](docs/components/checkbox.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-checkbox--docs) | `@kanso-protocol/ui/checkbox` |
| Combobox | [combobox.md](docs/components/combobox.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-combobox--docs) | `@kanso-protocol/ui/combobox` |
| CommandPalette | [command-palette.md](docs/components/command-palette.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-commandpalette--docs) | `@kanso-protocol/ui/command-palette` |
| DatePicker | [datepicker.md](docs/components/datepicker.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-datepicker--docs) | `@kanso-protocol/ui/datepicker` |
| Dialog | [dialog.md](docs/components/dialog.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-dialog--docs) | `@kanso-protocol/ui/dialog` |
| Divider | [divider.md](docs/components/divider.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-divider--docs) | `@kanso-protocol/ui/divider` |
| Drawer | [drawer.md](docs/components/drawer.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-drawer--docs) | `@kanso-protocol/ui/drawer` |
| DropdownMenu | [dropdown-menu.md](docs/components/dropdown-menu.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-dropdownmenu--docs) | `@kanso-protocol/ui/menu` |
| EmptyState | [empty-state.md](docs/components/empty-state.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-emptystate--docs) | `@kanso-protocol/ui/empty-state` |
| FileUpload | [file-upload.md](docs/components/file-upload.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-fileupload--docs) | `@kanso-protocol/ui/file-upload` |
| FormField | [form-field.md](docs/components/form-field.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-formfield--docs) | `@kanso-protocol/ui/form-field` |
| Icon | [icon.md](docs/components/icon.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-icon--docs) | `@kanso-protocol/ui/icon` |
| Input | [input.md](docs/components/input.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-input--docs) | `@kanso-protocol/ui/input` |
| MarkdownViewer | [markdown-viewer.md](docs/components/markdown-viewer.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-markdownviewer--docs) | `@kanso-protocol/ui/markdown-viewer` |
| NumberStepper | [number-stepper.md](docs/components/number-stepper.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-numberstepper--docs) | `@kanso-protocol/ui/number-stepper` |
| Pagination | [pagination.md](docs/components/pagination.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-pagination--docs) | `@kanso-protocol/ui/pagination` |
| Popover | [popover.md](docs/components/popover.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-popover--docs) | `@kanso-protocol/ui/popover` |
| Progress | [progress.md](docs/components/progress.md) | [linear ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-progress-linear--docs) · [circular ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-progress-circular--docs) · [segmented ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-progress-segmented--docs) | `@kanso-protocol/ui/progress` |
| Radio | [radio.md](docs/components/radio.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-radio--docs) | `@kanso-protocol/ui/radio` |
| RichTextEditor | [rich-text-editor.md](docs/components/rich-text-editor.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-richtexteditor--docs) | `@kanso-protocol/ui/rich-text-editor` |
| SegmentedControl | [segmented-control.md](docs/components/segmented-control.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-segmentedcontrol--docs) | `@kanso-protocol/ui/segmented-control` |
| Select | [select.md](docs/components/select.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-select--docs) | `@kanso-protocol/ui/select` |
| Skeleton | [skeleton.md](docs/components/skeleton.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-skeleton--docs) | `@kanso-protocol/ui/skeleton` |
| Slider | [slider.md](docs/components/slider.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-slider--docs) | `@kanso-protocol/ui/slider` |
| Table | [table.md](docs/components/table.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-table--docs) | `@kanso-protocol/ui/table` |
| TableVirtual | [table-virtual.md](docs/components/table-virtual.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-tablevirtual--docs) | `@kanso-protocol/ui/table-virtual` |
| Tabs | [tabs.md](docs/components/tabs.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-tabs--docs) | `@kanso-protocol/ui/tabs` |
| Textarea | [textarea.md](docs/components/textarea.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-textarea--docs) | `@kanso-protocol/ui/textarea` |
| TimePicker | [timepicker.md](docs/components/timepicker.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-timepicker--docs) | `@kanso-protocol/ui/timepicker` |
| Toast | [toast.md](docs/components/toast.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-toast--docs) | `@kanso-protocol/ui/toast` |
| Toggle | [toggle.md](docs/components/toggle.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-toggle--docs) | `@kanso-protocol/ui/toggle` |
| Tooltip | [tooltip.md](docs/components/tooltip.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-tooltip--docs) | `@kanso-protocol/ui/tooltip` |
| Tree | [tree.md](docs/components/tree.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-tree--docs) | `@kanso-protocol/ui/tree` |
| VirtualList | [virtual-list.md](docs/components/virtual-list.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-virtuallist--docs) | `@kanso-protocol/ui/virtual-list` |

Adding a new component? Start from [`docs/components/_template.md`](docs/components/_template.md).

## Patterns

Patterns are opinionated compositions of components for specific UI use cases.
They live in `packages/ui/` and are imported the same way as components.

| Pattern | What it is | Docs |
|---|---|---|
| AppShell | Page chrome — Header + Sidebar + main slot | [docs/patterns/app-shell.md](docs/patterns/app-shell.md) |
| Banner | Full-width announcement strip | [docs/patterns/banner.md](docs/patterns/banner.md) |
| Container | Page max-width + padding | [docs/patterns/container.md](docs/patterns/container.md) |
| FilterBar | Active filter chips + add/save/clear | [docs/patterns/filter-bar.md](docs/patterns/filter-bar.md) |
| FormSection | Titled block of form fields (inline / stacked) | [docs/patterns/form-section.md](docs/patterns/form-section.md) |
| Grid | Equal-column responsive grid | [docs/patterns/grid.md](docs/patterns/grid.md) |
| Header | Top app bar with logo, nav, search, user | [docs/patterns/header.md](docs/patterns/header.md) |
| NavItem | Single sidebar / nav link with icon and badge | [docs/patterns/nav-item.md](docs/patterns/nav-item.md) |
| NotificationCenter | Bell-anchored notification panel | [docs/patterns/notification-center.md](docs/patterns/notification-center.md) |
| PageError | 404 / 500 / generic error page layout | [docs/patterns/page-error.md](docs/patterns/page-error.md) |
| PageHeader | Title + breadcrumbs + actions + tabs | [docs/patterns/page-header.md](docs/patterns/page-header.md) |
| Row | Horizontal flex row primitive | [docs/patterns/row.md](docs/patterns/row.md) |
| SearchBar | Inline + command-palette search | [docs/patterns/search-bar.md](docs/patterns/search-bar.md) |
| SettingsPanel | Card of settings rows with controls | [docs/patterns/settings-panel.md](docs/patterns/settings-panel.md) |
| Sidebar | Expanded / collapsed app sidebar | [docs/patterns/sidebar.md](docs/patterns/sidebar.md) |
| Stack | Vertical flex stack primitive | [docs/patterns/stack.md](docs/patterns/stack.md) |
| StatCard | Single-metric tile for dashboards | [docs/patterns/stat-card.md](docs/patterns/stat-card.md) |
| TableToolbar | Search / filter / actions bar above a table | [docs/patterns/table-toolbar.md](docs/patterns/table-toolbar.md) |
| ThemeToggle | Light / dark / system switcher | [docs/patterns/theme-toggle.md](docs/patterns/theme-toggle.md) |
| UserMenu | Avatar + popover with profile + logout | [docs/patterns/user-menu.md](docs/patterns/user-menu.md) |

## Example Pages

Reference page compositions, built only from Kanso components and patterns —
no forks, no hand-drawn parts. They live in `packages/examples/` (Storybook
only, not published to npm) and serve as the integration test for the system.

| Page | What it shows | Docs |
|---|---|---|
| Login | Centered auth card with form, divider, social buttons | [docs/examples/login.md](docs/examples/login.md) |
| Dashboard | Full app shell: KPIs, charts, recent activity | [docs/examples/dashboard.md](docs/examples/dashboard.md) |
| Settings | Tabs + stack of SettingsPanels (Profile / Preferences / Danger zone) | [docs/examples/settings.md](docs/examples/settings.md) |
| List View | Team members table — toolbar, filters, paginated table | [docs/examples/list-view.md](docs/examples/list-view.md) |
| Detail View | Project record — rich PageHeader + 2/1 grid of cards | [docs/examples/detail-view.md](docs/examples/detail-view.md) |

## Templates

Reusable application scaffolds — composed entirely from `@kanso-protocol/*`
components and patterns, but **distributed as code, not as npm packages.**
Drop the file into your project, install peer packages, own the copy.
Same convention as Material UI templates, Vercel templates, shadcn-ui.

> **Why not npm-publish them?** Templates are compositions, and every
> consumer ends up tweaking the layout. Stable layout APIs are hard
> (one project wants 3 panes, another wants RTL drawer, a third wants
> a mobile-first stack). Code-as-template lets you take it as a
> starting point without inheriting our opinions.

| Template | What it is | Docs |
|---|---|---|
| Workspace | Productivity / admin scaffold — transparent header (logo + flexible header-nav + theme toggle + notifications + user menu), collapsible sidebar with smooth animation, 1-or-2-pane content area with drag-to-resize, light / dark / system theme handling, `prefers-color-scheme` live-tracking. Slot-first API: header-nav / notifications / user-menu items are content-projection slots, so each projected element keeps its own `routerLink` / `(click)` / `*ngIf`. | [docs/templates/workspace.md](docs/templates/workspace.md) |

### Quick start (Workspace)

```bash
# 1. Install peer packages once (skip the ones you already have):
npm i @kanso-protocol/{core,app-shell,sidebar,nav-item,avatar,user-menu,\
menu,theme-toggle,popover,notification-center,icon,button,badge,breadcrumbs}

# 2. Copy the template file into your project:
mkdir -p src/templates
curl -o src/templates/template-workspace.component.ts \
  https://raw.githubusercontent.com/GregNBlack/kanso-protocol/main/packages/examples/template-modern/template-workspace.component.ts
```

Then drop it into a route or page component:

```ts
import { KpTemplateWorkspaceComponent } from './templates/template-workspace.component';
import {
  KpBreadcrumbsComponent,
  KpBreadcrumbItemComponent,
  KpBreadcrumbSeparatorComponent,
} from '@kanso-protocol/ui/breadcrumbs';
import { KpMenuItemComponent } from '@kanso-protocol/ui/menu';
import { KpIconComponent } from '@kanso-protocol/ui/icon';

@Component({
  standalone: true,
  imports: [
    KpTemplateWorkspaceComponent,
    KpBreadcrumbsComponent,
    KpBreadcrumbItemComponent,
    KpBreadcrumbSeparatorComponent,
    KpMenuItemComponent,
    KpIconComponent,
  ],
  template: `
    <kp-template-workspace
      [navSections]="sections"
      [user]="user"
      [(theme)]="theme"
      (signOut)="logout()">

      <!-- Header-nav slot — breadcrumbs (or a tenant select / tabs / search). -->
      <kp-breadcrumbs kpWsHeaderNav size="md">
        <kp-breadcrumb-item type="link" href="/">Workspace</kp-breadcrumb-item>
        <kp-breadcrumb-separator/>
        <kp-breadcrumb-item type="current">Dashboard</kp-breadcrumb-item>
      </kp-breadcrumbs>

      <!-- User-menu items — each is a real Angular element with own routerLink / click. -->
      <kp-menu-item kpWsUserMenuItems label="Profile"  routerLink="/profile">
        <kp-icon kpMenuItemIcon name="user" size="md"/>
      </kp-menu-item>
      <kp-menu-item kpWsUserMenuItems label="Settings" routerLink="/settings">
        <kp-icon kpMenuItemIcon name="settings" size="md"/>
      </kp-menu-item>

      <div kpWsMain><!-- your main content --></div>
      <div kpWsSide><!-- optional side pane --></div>
    </kp-template-workspace>
  `,
})
```

Live demo: [Storybook → Templates / Workspace](https://gregnblack.github.io/kanso-protocol/?path=/story/templates-workspace--default).
Public API contract: [docs/templates/workspace.md](docs/templates/workspace.md).

## Figma Integration

The full design library is published on Figma Community — duplicate it into your team to use the components, variables, and example pages directly:

**[→ Kanso Protocol on Figma Community](https://www.figma.com/community/file/1633266134559104948)**

Inside: 42 components × variants, 20 patterns, 900+ W3C DTCG variables (light + dark modes), Iconography, and 5 example pages (Login, Dashboard, Settings, List View, Detail View).

### Token sync

Tokens stay in lockstep with code via [Tokens Studio](https://tokens.studio):

1. Tokens Studio reads DTCG JSON from this repository
2. Changes to tokens create a Pull Request
3. After merge, tokens update in both code and Figma Variables
4. Components in Figma use Variables — theme switching works automatically

## Built with Kanso

Shipping something built on Kanso Protocol? We'd love to feature it here.

Open a PR adding your project to this list, or [open an issue](https://github.com/GregNBlack/kanso-protocol/issues/new) with `[showcase]` in the title and we'll add it for you.

| Project | What it is | Link |
|---|---|---|
| _Be the first._ | Open-source app, internal tool, side project — anything counts. | [Add yours →](https://github.com/GregNBlack/kanso-protocol/issues/new?title=%5Bshowcase%5D+) |

What we ask for: a one-line description, a public link (live URL or GitHub repo), and a single screenshot or short clip.

## Guiding Principles

1. **Explicit over implicit.** No magic values — everything through tokens.
2. **Architecture over agreements.** Rules are structural, not written.
3. **Predictability over flexibility.** A small, opinionated API beats a configurable one — every consumer gets the same behavior instead of each team building their own dialect.
4. **Single source of truth.** One change, one place.
5. **Every component is equal.** Same anatomy, same contract, no exceptions without ADR.

## Tech Stack

- **Framework:** Angular 21+
- **Monorepo:** Nx
- **Tokens:** W3C DTCG + Style Dictionary 4 (emits CSS custom properties as the primary runtime, plus equivalent SCSS variables and TS constants for compile-time consumers)
- **Docs:** Storybook 8
- **Font:** [Onest](https://fonts.google.com/specimen/Onest) (Google Fonts, Cyrillic)
- **Icons:** [Tabler Icons](https://tabler.io/icons)
- **CI/CD:** GitHub Actions
- **Figma sync:** Tokens Studio
- **AI tooling:** [Model Context Protocol](https://modelcontextprotocol.io) — `@kanso-protocol/mcp`

## License

[MIT](LICENSE) © GregNBlack
