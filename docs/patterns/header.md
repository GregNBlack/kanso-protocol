# Header (Topbar)

> Application topbar. Three-section layout (left / center / right) with optional logo, inline nav, search slot, notifications, theme toggle, CTA, and user menu.

## Contract

`<kp-header>` renders a sticky-ready topbar with three sections:

- **Left** — logo + main navigation
- **Center** — search (projection slot `[kpHeaderSearch]` or placeholder with `[showSearch]="true"`)
- **Right** — theme toggle · notifications · CTA · user menu

Everything is toggleable via boolean inputs; the layout collapses cleanly when sections are hidden.

## API

### Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Topbar height (48 / 64 / 80) |
| `appearance` | `'light' \| 'dark'` | `'light'` | Light or dark surface |
| `showLogo` | `boolean` | `true` | Show the default logo mark + title (or replace via `[kpHeaderLogo]`) |
| `logoText` | `string` | `'Kanso Protocol'` | Title next to the logo mark |
| `showMainNav` | `boolean` | `true` | Render the inline nav from `navItems` |
| `navItems` | `KpHeaderNavItem[]` | `[]` | `{ label, href?, active? }` — renders as links |
| `showSearch` | `boolean` | `false` | Render built-in search placeholder; override with `[kpHeaderSearch]` slot |
| `searchPlaceholder` | `string` | `'Search anything...'` | |
| `showThemeToggle` | `boolean` | `false` | |
| `showNotifications` | `boolean` | `true` | |
| `notificationsCount` | `string \| number \| null` | `null` | Badge number; no badge when null |
| `showCta` | `boolean` | `false` | Prominent right-side action |
| `ctaLabel` | `string` | `'Get started'` | |
| `showUserMenu` | `boolean` | `true` | |
| `userName`, `userRole`, `userInitials` | `string \| null` | `null` | User block data |
| `showUserStatus` | `boolean` | `false` | Presence dot on the user avatar |

### Outputs

| Name | Fires when |
|------|------------|
| `themeToggle` | Theme button clicked |
| `notificationsClick` | Bell clicked |
| `ctaClick` | CTA clicked |
| `userMenuClick` | User block clicked |

### Projection slots

| Selector | Slot |
|----------|------|
| `[kpHeaderLogo]` | Replace the default logo mark + title |
| `[kpHeaderSearch]` | Custom search (takes precedence over `[showSearch]`) |
| `[kpHeaderActions]` | Extra buttons before the user menu |

## Composition recipes

| Recipe | Config |
|--------|--------|
| **SaaS default** | nav + search + notifications + user menu |
| **Admin panel** | nav + notifications + user menu (no search) |
| **Marketing** | `size="lg"` · nav + CTA; no avatar, notifications, or search |
| **Minimal** | logo + user menu only |

## Do / Don't

### Do
- **Pick one size per app** (most use `md`). Switching sizes per route is disorienting.
- **Use `appearance="dark"`** deliberately — e.g. dark-themed admin. Don't switch it based on theme toggle alone (use semantic tokens).
- Wire `notificationsClick` / `userMenuClick` to open `DropdownMenu` / `NotificationCenter` patterns.

### Don't
- Don't stuff more than 4–5 nav items inline. Group under a secondary menu.
- Don't put marketing-style CTAs ("Upgrade") in a logged-in SaaS header by default — reserve for paywall states.
- Don't hide the user menu in the default app state. If you're logged in, your avatar belongs there.

## Accessibility

- `role="banner"` on the host.
- Nav carries `aria-label="Primary"`; active item has `aria-current="page"`.
- Notification bell exposes the count via `aria-live="polite"`.

## References

- **Figma pattern**: [`Header` Component Set](https://www.figma.com/design/ahRfe4BdMAyoK0I3lnicp6/Design-System)
- **Storybook**: https://gregnblack.github.io/kanso-protocol/?path=/docs/patterns-header
- **Source**: `packages/patterns/header/src/`
- **Tokens**: `header/bg`, `header/bg-dark`, `header/border`, `header/nav-item/*`, `header/divider`

## Changelog

- `0.1.0` — Initial release. 3 sizes × 2 appearances, all sections toggleable, data-driven nav.
