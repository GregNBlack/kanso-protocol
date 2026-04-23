# AppShell

> Root application template. Composes **Header + Sidebar + Main + Footer** with four layout modes.

## Contract

`<kp-app-shell>` is a thin structural wrapper: it arranges the chrome of your app (topbar, side nav, optional banner, optional footer) and a scrolling content area. Everything visible is a projection slot — you pass real `<kp-header>`, `<kp-sidebar>`, `<kp-banner>`, etc. instances.

The shell owns **placement**, not **content**. Persisting sidebar expand state, routing, and responsive breakpoints are the consumer's job.

## API

### Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `layout` | `'sidebar-left' \| 'sidebar-right' \| 'no-sidebar' \| 'sidebar-collapsed'` | `'sidebar-left'` | Sidebar placement / hide |
| `showHeader` | `boolean` | `true` | |
| `showSidebar` | `boolean` | `true` | Pair with `layout !== 'no-sidebar'` |
| `showFooter` | `boolean` | `false` | |
| `showBanner` | `boolean` | `false` | Strip under the header |

### Projection slots

| Selector | Slot |
|----------|------|
| `[kpAppShellHeader]` | Topbar (use `<kp-header>`) |
| `[kpAppShellBanner]` | Optional global strip under the header |
| `[kpAppShellSidebar]` | Side navigation (use `<kp-sidebar>`) |
| `[kpAppShellBody]` | Main scrolling content |
| `[kpAppShellFooter]` | Optional footer strip |

## Layouts

| Value | Usage |
|-------|-------|
| `sidebar-left` | Default SaaS layout. |
| `sidebar-right` | Chat / activity-centric apps where the side list is supplementary. |
| `no-sidebar` | Marketing pages, simple apps (header + content). |
| `sidebar-collapsed` | Dense mode — sidebar at 64px. |

## Do / Don't

### Do
- **Wire Header `toggle` output to `layout`** switching between `sidebar-left` and `sidebar-collapsed` if you want a collapse button.
- **Use `kpAppShellBanner` for ephemeral system messages** (trial expiring, maintenance). Not for navigation.
- **Keep the body scrollable** — the shell's grid does this for you. Don't wrap body content in `overflow: hidden` containers.

### Don't
- Don't stack two AppShells (e.g. per-route). The shell is the *app* root — route under `[kpAppShellBody]`.
- Don't hide the header unless the page is intentionally immersive (`PageError`, `LoginPage`). Those use dedicated patterns instead.

## References

- **Figma**: `AppShell` Component Set (Patterns page) — 4 layouts, with/without banner/footer demos.
- **Storybook**: https://gregnblack.github.io/kanso-protocol/?path=/docs/patterns-appshell
- **Source**: `packages/patterns/app-shell/src/`

## Changelog

- `0.1.0` — Initial release. 4 layouts, banner + footer slots.
