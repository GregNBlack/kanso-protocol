# 簡素 Kanso Protocol

[![CI](https://github.com/GregNBlack/kanso-protocol/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/GregNBlack/kanso-protocol/actions/workflows/ci.yml)
[![Storybook](https://img.shields.io/badge/Storybook-live-FF4785?logo=storybook&logoColor=white)](https://gregnblack.github.io/kanso-protocol)
[![Tests](https://img.shields.io/badge/tests-352%20passing-brightgreen)](https://gregnblack.github.io/kanso-protocol/?path=/docs/foundations-test-coverage--docs)
[![MCP](https://img.shields.io/badge/MCP-ready-7c3aed)](https://www.npmjs.com/package/@kanso-protocol/mcp)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

**Open source design system for Angular, built on architectural consistency.**

Design tokens in W3C DTCG format serve as a single source of truth for both Figma and code. Rules are embedded in architecture, not in agreements.

> **Status: `0.1.x` alpha.** Public API is intentionally unstable until `1.0`. Expect breaking changes in any minor bump — pin the exact version in production. Read the [changelog](CHANGELOG.md) before upgrading.

---

## Why Kanso Protocol?

簡素 (*kanso*) — one of the seven principles of Japanese aesthetics — is the practice of restraint and the removal of the unnecessary. The library follows the same idea: a small, opinionated, internally consistent surface where the rules live in the code, not in conventions.

- **Every value is a token.** Components never carry magic numbers or inline hex. CSS custom properties — generated from W3C DTCG tokens — are the single source of truth shared between Figma and code.
- **Every component follows the same anatomy.** Container → Content → Element. New components don't introduce a new mental model.
- **Every state is explicit.** Six named states (rest / hover / active / focus / disabled / loading), each with its own color and motion tokens.
- **No exception without a record.** When a component departs from the contract, the deviation lives as an ADR with a reason — not as an undocumented one-off.
- **Designed to stay small.** Components are added intentionally, when there's a clear need — not because something might be useful.
- **One npm package per component.** Install only what you use; nothing transitive comes along.
- **AI-native.** Ships with `@kanso-protocol/mcp` — a Model Context Protocol server that exposes the live, typed catalog to Claude Code, Cursor, and VS Code, so the assistant authors Kanso UI from the actual API instead of from training-data guesses.

## Live Preview

**Storybook:** [gregnblack.github.io/kanso-protocol](https://gregnblack.github.io/kanso-protocol)

Every component, pattern and example page is published there with autodocs, live controls, and a light/dark theme toggle.

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

Restart Claude Code, then run `/mcp` to confirm `kanso` appears as ✔ connected with 7 tools.

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

The server registers seven tools at startup (`catalog_overview`, `list_components`, `get_component`, `list_patterns`, `get_pattern`, `list_tokens`, `get_token`).

</details>

### Try it

Once connected, ask your assistant things like:

- *"Which size ramp does `kp-input` support, and which validators does `form-field` translate by default?"*
- *"List every `--kp-color-*` token tied to the danger role."*
- *"I need a settings page with a sidebar of collapsible sections — which Kanso pieces compose that?"*

The assistant calls `list_components` / `get_component` / `list_tokens` under the hood and answers from the live catalog. Full tool reference and the roadmap (Figma bridge in `0.2.x`) live in the [package README](packages/mcp/README.md).

## Install & Use

Install the pieces you need — each component is its own package. Zero transitive dependencies between components, so you only ship what you import.

```bash
npm install @kanso-protocol/core @kanso-protocol/button
```

Load the tokens once in your app bootstrap. The primary distribution is **CSS custom properties** — all components consume them at runtime:

```ts
import '@kanso-protocol/core/styles/tokens.css';
import '@kanso-protocol/core/styles/dark.css';   // optional — enables [data-theme="dark"]
```

**Sass / SCSS consumers** can also import the equivalent compile-time `$kp-*` variables (handy for projects that haven't migrated to CSS custom properties yet):

```scss
@use '@kanso-protocol/core/styles/tokens' as *;   // exposes $kp-color-blue-600 etc.
```

Both files are generated from the same DTCG source; pick whichever fits your stylesheet pipeline. Components themselves only depend on the CSS variables — they work identically regardless of which import you choose.

Use the component as a standalone Angular import:

```ts
import { Component } from '@angular/core';
import { KpButtonComponent } from '@kanso-protocol/button';

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
import { KpButtonComponent } from '@kanso-protocol/button';

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

37 components, each its own npm package — install only what you import. Tokens live in `@kanso-protocol/core` and need to be loaded once for any of them to render correctly.

Install all components in one shot (zsh / bash brace expansion):

```bash
npm i @kanso-protocol/core @kanso-protocol/{accordion,alert,avatar,avatar-group,badge,breadcrumbs,button,card,checkbox,combobox,datepicker,dialog,divider,drawer,empty-state,form-field,icon,input,menu,number-stepper,pagination,popover,progress,radio,rich-text-editor,segmented-control,select,skeleton,slider,table,tabs,textarea,timepicker,toast,toggle,tooltip,tree}
```

Or pick what you need from the catalog. Every component has a formal API contract (props, variants, states, a11y rules) and a live Storybook page with controls.

| Component | Contract | Storybook | Install |
|---|---|---|---|
| Accordion | [accordion.md](docs/components/accordion.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-accordion--docs) | `npm i @kanso-protocol/accordion` |
| Alert | [alert.md](docs/components/alert.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-alert--docs) | `npm i @kanso-protocol/alert` |
| Avatar | [avatar.md](docs/components/avatar.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-avatar--docs) | `npm i @kanso-protocol/avatar` |
| AvatarGroup | [avatar-group.md](docs/components/avatar-group.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-avatargroup--docs) | `npm i @kanso-protocol/avatar-group` |
| Badge | [badge.md](docs/components/badge.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-badge--docs) | `npm i @kanso-protocol/badge` |
| Breadcrumbs | [breadcrumbs.md](docs/components/breadcrumbs.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-breadcrumbs--docs) | `npm i @kanso-protocol/breadcrumbs` |
| Button | [button.md](docs/components/button.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-button--docs) | `npm i @kanso-protocol/button` |
| Card | [card.md](docs/components/card.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-card--docs) | `npm i @kanso-protocol/card` |
| Checkbox | [checkbox.md](docs/components/checkbox.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-checkbox--docs) | `npm i @kanso-protocol/checkbox` |
| Combobox | [combobox.md](docs/components/combobox.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-combobox--docs) | `npm i @kanso-protocol/combobox` |
| DatePicker | [datepicker.md](docs/components/datepicker.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-datepicker--docs) | `npm i @kanso-protocol/datepicker` |
| Dialog | [dialog.md](docs/components/dialog.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-dialog--docs) | `npm i @kanso-protocol/dialog` |
| Divider | [divider.md](docs/components/divider.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-divider--docs) | `npm i @kanso-protocol/divider` |
| Drawer | [drawer.md](docs/components/drawer.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-drawer--docs) | `npm i @kanso-protocol/drawer` |
| DropdownMenu | [dropdown-menu.md](docs/components/dropdown-menu.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-dropdownmenu--docs) | `npm i @kanso-protocol/menu` |
| EmptyState | [empty-state.md](docs/components/empty-state.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-emptystate--docs) | `npm i @kanso-protocol/empty-state` |
| FormField | [form-field.md](docs/components/form-field.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-formfield--docs) | `npm i @kanso-protocol/form-field` |
| Icon | [icon.md](docs/components/icon.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-icon--docs) | `npm i @kanso-protocol/icon` |
| Input | [input.md](docs/components/input.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-input--docs) | `npm i @kanso-protocol/input` |
| NumberStepper | [number-stepper.md](docs/components/number-stepper.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-numberstepper--docs) | `npm i @kanso-protocol/number-stepper` |
| Pagination | [pagination.md](docs/components/pagination.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-pagination--docs) | `npm i @kanso-protocol/pagination` |
| Popover | [popover.md](docs/components/popover.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-popover--docs) | `npm i @kanso-protocol/popover` |
| Progress | [progress.md](docs/components/progress.md) | [linear ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-progress-linear--docs) · [circular ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-progress-circular--docs) · [segmented ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-progress-segmented--docs) | `npm i @kanso-protocol/progress` |
| Radio | [radio.md](docs/components/radio.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-radio--docs) | `npm i @kanso-protocol/radio` |
| RichTextEditor | [rich-text-editor.md](docs/components/rich-text-editor.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-richtexteditor--docs) | `npm i @kanso-protocol/rich-text-editor` |
| SegmentedControl | [segmented-control.md](docs/components/segmented-control.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-segmentedcontrol--docs) | `npm i @kanso-protocol/segmented-control` |
| Select | [select.md](docs/components/select.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-select--docs) | `npm i @kanso-protocol/select` |
| Skeleton | [skeleton.md](docs/components/skeleton.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-skeleton--docs) | `npm i @kanso-protocol/skeleton` |
| Slider | [slider.md](docs/components/slider.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-slider--docs) | `npm i @kanso-protocol/slider` |
| Table | [table.md](docs/components/table.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-table--docs) | `npm i @kanso-protocol/table` |
| Tabs | [tabs.md](docs/components/tabs.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-tabs--docs) | `npm i @kanso-protocol/tabs` |
| Textarea | [textarea.md](docs/components/textarea.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-textarea--docs) | `npm i @kanso-protocol/textarea` |
| TimePicker | [timepicker.md](docs/components/timepicker.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-timepicker--docs) | `npm i @kanso-protocol/timepicker` |
| Toast | [toast.md](docs/components/toast.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-toast--docs) | `npm i @kanso-protocol/toast` |
| Toggle | [toggle.md](docs/components/toggle.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-toggle--docs) | `npm i @kanso-protocol/toggle` |
| Tooltip | [tooltip.md](docs/components/tooltip.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-tooltip--docs) | `npm i @kanso-protocol/tooltip` |
| Tree | [tree.md](docs/components/tree.md) | [live ↗](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-tree--docs) | `npm i @kanso-protocol/tree` |

Adding a new component? Start from [`docs/components/_template.md`](docs/components/_template.md).

## Patterns

Patterns are opinionated compositions of components for specific UI use cases.
They live in `packages/patterns/` and are imported the same way as components.

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

## Figma Integration

Kanso Protocol syncs with Figma via [Tokens Studio](https://tokens.studio):

1. Tokens Studio reads DTCG JSON from this repository
2. Changes to tokens create a Pull Request
3. After merge, tokens update in both code and Figma Variables
4. Components in Figma use Variables — theme switching works automatically

## Guiding Principles

1. **Explicit over implicit.** No magic values — everything through tokens.
2. **Architecture over agreements.** Rules are structural, not written.
3. **Predictability over flexibility.** Limited but predictable API > flexible but chaotic.
4. **Single source of truth.** One change, one place.
5. **Every component is equal.** Same anatomy, same contract, no exceptions without ADR.

## Tech Stack

- **Framework:** Angular 18+
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
