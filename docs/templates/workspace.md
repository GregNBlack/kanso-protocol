# Workspace template

A drop-in scaffold for productivity / admin Angular apps. Header on top,
left sidebar with nav, content area below — split into one or two
panes with a draggable resize handle.

> Templates are **distributed as code, not as npm packages.** Compose
> existing `@kanso-protocol/*` packages, copy a single file into your
> project, own it from there. Re-pull from upstream if you want
> bug-fixes; modify freely the rest of the time. Same convention as
> Material UI templates, Vercel templates, shadcn-ui.

---

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Logo │ Breadcrumbs (flex)         │ [actions] 🔔 ☀ 👤      │  ← transparent header
├──────┬──────────────────────────────────────────────────────┤
│ Side │  ┌────────────────┐ ┌─────────────────────────┐      │  ← 8px outer pad
│ bar  │  │ Main pane       │ │ Side pane (optional)    │      │     8px gap (drag-resize)
│      │  │                 │ │                         │      │
│      │  └────────────────┘ └─────────────────────────┘      │
└──────┴──────────────────────────────────────────────────────┘
```

**Behavior baked in:**
- Sidebar collapse with smooth animation (icons, labels, badges, footer all transition in lockstep)
- Tooltips on collapsed nav-item icons
- Drag-to-resize between panes (240–800px clamp, keyboard nudge with `←/→`)
- Header popovers (notifications, user menu) close on outside-click
- Theme toggle (light / dark / system) — `system` follows the OS preference live
- Responsive: panes stack vertically <1024px, breadcrumbs collapse to current item <768px, etc.
- Storybook integration: theme changes sync with the addon-themes toolbar

[Live demo →](https://gregnblack.github.io/kanso-protocol/?path=/story/templates-workspace--default)

---

## Install

### 1. Add Kanso peer packages

If your project already uses Kanso, you probably have most of these. Add the missing ones:

```bash
npm i @kanso-protocol/core \
      @kanso-protocol/app-shell \
      @kanso-protocol/sidebar \
      @kanso-protocol/nav-item \
      @kanso-protocol/avatar \
      @kanso-protocol/user-menu \
      @kanso-protocol/menu \
      @kanso-protocol/theme-toggle \
      @kanso-protocol/popover \
      @kanso-protocol/notification-center \
      @kanso-protocol/icon \
      @kanso-protocol/button \
      @kanso-protocol/badge \
      @kanso-protocol/breadcrumbs
```

### 2. Copy the template file

Grab [`template-workspace.component.ts`](https://github.com/GregNBlack/kanso-protocol/blob/main/packages/examples/template-modern/template-workspace.component.ts)
and drop it anywhere in your project (e.g. `src/templates/`).

```bash
mkdir -p src/templates
curl -o src/templates/template-workspace.component.ts \
  https://raw.githubusercontent.com/GregNBlack/kanso-protocol/main/packages/examples/template-modern/template-workspace.component.ts
```

### 3. Use it

```ts
import { Component, signal } from '@angular/core';
import {
  KpTemplateWorkspaceComponent,
  KpWsBreadcrumb,
  KpWsUser,
  KpWsUserMenuItem,
} from './templates/template-workspace.component';
import { KpSidebarSection } from '@kanso-protocol/sidebar';

@Component({
  standalone: true,
  imports: [KpTemplateWorkspaceComponent],
  template: `
    <kp-template-workspace
      [navSections]="sections"
      [user]="user"
      [breadcrumbs]="crumbs"
      [userMenuItems]="userMenu"
      [(theme)]="theme"
      [(sidebarState)]="sidebarState"
      [(twoPanes)]="twoPanes"
      (navItemClick)="onNav($event)"
      (signOut)="logout()">

      <div kpWsMain>
        <h1>Dashboard</h1>
        <!-- your real content -->
      </div>

      <div kpWsSide>
        <h2>Inspector</h2>
        <!-- detail / preview / context panel -->
      </div>
    </kp-template-workspace>
  `,
})
export class AppComponent {
  theme = 'light' as const;
  sidebarState = 'expanded' as const;
  twoPanes = true;

  sections: KpSidebarSection[] = [
    { label: 'Workspace', items: [
      { label: 'Dashboard', icon: 'layout-dashboard', active: true },
      { label: 'Projects',  icon: 'folder' },
    ]},
  ];
  user: KpWsUser = { name: 'Greg', initials: 'GB', email: 'greg@example.com' };
  crumbs: KpWsBreadcrumb[] = [
    { label: 'Workspace', href: '/' },
    { label: 'Dashboard' },
  ];
  userMenu: KpWsUserMenuItem[] = [
    { label: 'Profile',  icon: 'user' },
    { label: 'Settings', icon: 'settings' },
  ];

  onNav(item: any) { /* route, etc */ }
  logout() { /* … */ }
}
```

---

## Public API

### Inputs (data)

| Name | Type | Default | Description |
|---|---|---|---|
| `brandMark` | `string \| null` | `'簡素'` | Logo glyph; `null` to hide |
| `brandText` | `string \| null` | `'Kanso Protocol'` | Logo wordmark; `null` to hide |
| `breadcrumbs` | `KpWsBreadcrumb[]` | `[]` | Empty = no breadcrumbs |
| `navSections` | `KpSidebarSection[]` | `[]` | Sidebar nav data (same shape as `<kp-sidebar>`) |
| `notifications` | `KpNotification[]` | `[]` | Items shown in the bell popover |
| `unreadCount` | `number \| null` | `null` | Bell badge count; `null` = badge hidden |
| `user` | `KpWsUser \| null` | `null` | If `null`, avatar / user menu are hidden |
| `userMenuItems` | `KpWsUserMenuItem[]` | `[]` | Items rendered above the Sign-out divider |

### Inputs (feature flags)

| Name | Default | Description |
|---|---|---|
| `showInviteAction` | `false` | Show the optional Invite-style action button |
| `inviteLabel` | `'Invite'` | Label for the action button |
| `inviteIcon` | `'plus'` | Tabler icon name for the action button |
| `showLayoutToggle` | `true` | Show the single ↔ split toggle in header |
| `showThemeToggle` | `true` | Show the segmented theme switcher |
| `showNotifications` | `true` | Show the bell + popover |
| `showUserMenu` | `true` | Show the avatar + popover |

### Inputs (presentation knobs)

| Name | Default | Description |
|---|---|---|
| `paneRadius` | `16` | Border-radius of pane containers (px) |
| `outerPadding` | `8` | Padding around panes (px) |
| `panesGap` | `8` | Drag-handle width = visual gap between panes (px) |
| `sidePaneMinWidth` | `240` | Resize lower clamp (px) |
| `sidePaneMaxWidth` | `800` | Resize upper clamp (px) |

### State (two-way binding)

| Name | Type | Default | Description |
|---|---|---|---|
| `[(twoPanes)]` | `boolean` | `true` | Single ↔ split mode |
| `[(sidebarState)]` | `'expanded' \| 'collapsed'` | `'expanded'` | Sidebar width state |
| `[(sidePaneWidth)]` | `number` | `360` | Side pane width in px (persistable) |
| `[(theme)]` | `'light' \| 'dark' \| 'system'` | `'light'` | Active theme |

### Outputs (events)

| Event | Payload | Fires when |
|---|---|---|
| `(navItemClick)` | `KpSidebarNavItem` | User clicks any nav item |
| `(inviteClick)` | `void` | User clicks the optional Invite button |
| `(userMenuItemClick)` | `KpWsUserMenuItem` | User clicks any item in the user menu |
| `(signOut)` | `void` | User clicks Sign out in the user menu |
| `(themeChange)` | `KpWsTheme` | Fires alongside `[(theme)]` |

### Slots (content projection)

| Selector | Where it lands |
|---|---|
| `[kpWsLogo]` | Replaces the default brand block (set `brandMark` / `brandText` to `null` if you want only your custom logo) |
| `[kpWsHeaderActions]` | Extra buttons in the right cluster, before the Invite / theme / notif / user controls |
| `[kpWsMain]` | Main pane content |
| `[kpWsSide]` | Side pane content (only rendered when `twoPanes` is `true`) |

---

## Persisting the sidebar / pane width

Bind `[(sidebarState)]` and `[(sidePaneWidth)]` to a persisted store and
restore on mount:

```ts
sidebarState = signal(localStorage.getItem('sb') === 'collapsed' ? 'collapsed' : 'expanded');
sidePaneWidth = signal(Number(localStorage.getItem('side')) || 360);

constructor() {
  effect(() => localStorage.setItem('sb',   this.sidebarState()));
  effect(() => localStorage.setItem('side', String(this.sidePaneWidth())));
}
```

---

## Custom logo

Project a slot and `null` the defaults:

```html
<kp-template-workspace [brandMark]="null" [brandText]="null">
  <a kpWsLogo routerLink="/" class="my-logo">
    <img src="/logo.svg" alt="Acme" height="24"/>
  </a>
  ...
</kp-template-workspace>
```

---

## Customizing further

The template file is yours after copying — modify directly. Common tweaks:

- **More header actions** — drop them into `[kpWsHeaderActions]` slot, or add new feature-flag inputs for permanent ones
- **Different sidebar** — swap `<kp-sidebar>` for your own implementation; the rest of the layout doesn't care
- **3-pane layout** — duplicate the `kp-tpl__pane--side` block, add a second resize handle
- **Different breakpoints** — edit the `@media` rules in the styles array
- **Routed navigation** — `(navItemClick)` gives you the clicked item; route from your handler instead of mutating `active` flags

When you make tweaks, consider whether they belong **upstream** (open a PR) or stay project-specific. The canonical version stays at
[`packages/examples/template-modern/`](https://github.com/GregNBlack/kanso-protocol/tree/main/packages/examples/template-modern).
