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

Most design systems break consistency through convention drift — developers and designers interpret rules differently over time. Kanso Protocol solves this by making rules architectural:

- **Every value is a token.** No magic numbers, no hardcoded colors.
- **Every component follows the same anatomy.** Container → Content → Element.
- **Every state is explicit.** No opacity overlays — clean, predictable colors.
- **One source of truth.** Change a token in one place — it updates in Figma and code.
- **AI-native.** Ships with a Model Context Protocol server so your assistant authors Kanso UI from the live catalog, not from training data.

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

Load the CSS tokens once in your app bootstrap (e.g. `styles.scss` or `main.ts`):

```ts
import '@kanso-protocol/core/styles/tokens.css';
import '@kanso-protocol/core/styles/dark.css';   // optional — enables [data-theme="dark"]
```

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

## Component API contracts

Every component has a formal API contract in `docs/components/`. Read the contract before using a component — it describes the API, variants, states, accessibility requirements, and usage rules.

- [Button](docs/components/button.md)
- [Input](docs/components/input.md)
- [Icon](docs/components/icon.md)
- [Spinner](docs/components/spinner.md)
- [Checkbox](docs/components/checkbox.md)
- [Radio](docs/components/radio.md)
- [Toggle](docs/components/toggle.md)
- [FormField](docs/components/form-field.md)
- [MenuItem](docs/components/menu-item.md)
- [DropdownMenu](docs/components/dropdown-menu.md)
- [Textarea](docs/components/textarea.md)
- [RichTextEditor](docs/components/rich-text-editor.md)

Template for new components: [`docs/components/_template.md`](docs/components/_template.md)

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
- **Tokens:** W3C DTCG + Style Dictionary 4
- **Docs:** Storybook 8
- **Font:** [Onest](https://fonts.google.com/specimen/Onest) (Google Fonts, Cyrillic)
- **Icons:** [Tabler Icons](https://tabler.io/icons)
- **CI/CD:** GitHub Actions
- **Figma sync:** Tokens Studio
- **AI tooling:** [Model Context Protocol](https://modelcontextprotocol.io) — `@kanso-protocol/mcp`

## License

[MIT](LICENSE) © GregNBlack
