# Sidebar

> App side navigation container. Expanded (240px) or collapsed (64px), data-driven sections of `NavItem`s, optional search slot, user footer with Avatar.

## Contract

`<kp-sidebar>` renders a vertical nav rail. Content is data-driven via `[sections]` — each section has an optional label and a list of `KpSidebarNavItem` rows. The sidebar owns the expanded/collapsed width switch; the toggle button emits `toggle` so the parent app can persist the state.

## API

### Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `widthState` | `'expanded' \| 'collapsed'` | `'expanded'` | 240px vs 64px |
| `appearance` | `'light' \| 'dark'` | `'light'` | Surface color |
| `showLogo` | `boolean` | `true` | |
| `logoText` | `string` | `'Kanso Protocol'` | |
| `showSearch` | `boolean` | `false` | Reveal the search slot |
| `showSectionLabels` | `boolean` | `true` | Uppercase labels above each section |
| `showUserFooter` | `boolean` | `true` | Bottom user block |
| `sections` | `KpSidebarSection[]` | `[]` | Data-driven sections |
| `userName`, `userEmail`, `userInitials` | `string \| null` | `null` | Footer user data |

### Outputs

| Name | Payload | Fires when |
|------|---------|------------|
| `toggle` | `void` | Expand/collapse button clicked |
| `itemClick` | `KpSidebarNavItem` | Any nav item clicked |
| `userMenuClick` | `void` | Footer menu dots clicked |

### Projection slots

| Selector | Slot |
|----------|------|
| `[kpSidebarLogo]` | Replace default logo mark + text |
| `[kpSidebarSearch]` | Search input above sections |

### `KpSidebarNavItem`

```ts
interface KpSidebarNavItem {
  label: string;
  icon?: string;
  href?: string;
  active?: boolean;
  badge?: string;
  children?: KpSidebarNavItem[];
  expanded?: boolean;
}
```

## Widths

| State | Width | Hides |
|-------|-------|-------|
| `expanded` | 240 | — |
| `collapsed` | 64 | Labels, badges, chevrons, section headers, footer text |

## Do / Don't

### Do
- **Persist `widthState`** in localStorage. Users expect the sidebar to stay where they left it.
- **Group actions into 2–3 sections max**. Long undifferentiated rails are hard to scan; prefer a dense first section + smaller footer section.
- **Use the "active" flag on exactly one item** at a time. Let the consumer compute it from the current route.

### Don't
- Don't mix navigation and CTAs in sidebar items. A "Upgrade" CTA belongs in the Header, not as a NavItem.
- Don't nest more than 2 levels. Side rails get unreadable fast.
- Don't hide the collapse toggle — discoverability matters. Keep it reachable in both states.

## Accessibility

- `role="navigation"` on the host.
- Collapse toggle announces its state via `aria-label`.
- Active item inherits `aria-current="page"` from the NavItem.

## References

- **Figma**: `Sidebar` Component Set (Patterns page) — 4 variants: expanded/collapsed × light/dark
- **Storybook**: https://gregnblack.github.io/kanso-protocol/?path=/docs/patterns-sidebar
- **Source**: `packages/patterns/sidebar/src/`
- **Tokens**: `sidebar/bg`, `sidebar/bg-dark`, `sidebar/border`, `sidebar/section-label`

## Changelog

- `0.1.0` — Initial release. 2 widths × 2 appearances, data-driven sections, user footer with Avatar.
