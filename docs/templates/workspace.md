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
│ Logo │ Header-nav (flex)         │ [actions] 🔔 ☀ 👤      │  ← transparent header
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
- Responsive: panes stack vertically <1024px, header-nav collapses to current item <768px (when content is breadcrumbs), etc.

[Live demo →](https://gregnblack.github.io/kanso-protocol/?path=/story/templates-workspace--default)

---

## Slot-first API

Most consumer-customised pieces are **content-projection slots**, not
`@Input`s. That gives every projected element its own `routerLink` /
`(click)` / `*ngIf` / state — without forcing this template to grow a
config-shape per concern. Only fixed-shape data (the small `user`
object, `navSections` for the sidebar) and bool feature flags /
presentation knobs stay as Inputs.

The **header-nav** slot deserves a callout: it's intentionally generic.
Project breadcrumbs, an OU/tenant selector, a search input, tabs —
anything. The template treats it as a flex-grow spacer between the
logo and the right-cluster.

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
import { Component } from '@angular/core';
import { KpTemplateWorkspaceComponent, KpWsUser } from './templates/template-workspace.component';
import { KpSidebarSection } from '@kanso-protocol/sidebar';
import {
  KpBreadcrumbsComponent,
  KpBreadcrumbItemComponent,
  KpBreadcrumbSeparatorComponent,
} from '@kanso-protocol/breadcrumbs';
import { KpNotificationCenterComponent, KpNotification } from '@kanso-protocol/notification-center';
import { KpMenuItemComponent } from '@kanso-protocol/menu';
import { KpIconComponent } from '@kanso-protocol/icon';

@Component({
  standalone: true,
  imports: [
    KpTemplateWorkspaceComponent,
    KpBreadcrumbsComponent,
    KpBreadcrumbItemComponent,
    KpBreadcrumbSeparatorComponent,
    KpNotificationCenterComponent,
    KpMenuItemComponent,
    KpIconComponent,
  ],
  template: `
    <kp-template-workspace
      [navSections]="sections"
      [user]="user"
      [unreadCount]="3"
      [(theme)]="theme"
      [(sidebarState)]="sidebarState"
      [(twoPanes)]="twoPanes"
      (navItemClick)="onNav($event)"
      (signOut)="logout()">

      <!-- Header-nav slot — breadcrumbs (or a tenant select / tabs / search). -->
      <kp-breadcrumbs kpWsHeaderNav size="md">
        <kp-breadcrumb-item type="link" href="/">Workspace</kp-breadcrumb-item>
        <kp-breadcrumb-separator/>
        <kp-breadcrumb-item type="current">Dashboard</kp-breadcrumb-item>
      </kp-breadcrumbs>

      <!-- Bell popover content -->
      <kp-notification-center kpWsNotifications
        state="with-items" [notifications]="notifications"/>

      <!-- User menu items — each is a real Angular element with own
           routerLink / click / *ngIf. -->
      <kp-menu-item kpWsUserMenuItems label="Profile"  routerLink="/profile">
        <kp-icon kpMenuItemIcon name="user" size="md"/>
      </kp-menu-item>
      <kp-menu-item kpWsUserMenuItems label="Settings" routerLink="/settings">
        <kp-icon kpMenuItemIcon name="settings" size="md"/>
      </kp-menu-item>

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
  notifications: KpNotification[] = [];

  onNav(item: any) { /* route, etc */ }
  logout() { /* … */ }
}
```

---

## Public API

### Slots (content projection)

| Selector | Where it lands |
|---|---|
| `[kpWsLogo]` | Replaces the default brand block (set `brandMark` / `brandText` to `null` if you want only your custom logo) |
| `[kpWsHeaderNav]` | Centre area of the header — flex-grow. Project breadcrumbs, an OU/tenant selector, tabs, search, anything. Empty = right cluster gets pushed flush right |
| `[kpWsHeaderActions]` | Extra buttons in the right cluster, before the Invite / theme / notif / user controls |
| `[kpWsNotifications]` | Body of the bell popover — typically `<kp-notification-center>` |
| `[kpWsUserMenuItems]` | Items rendered above the Sign-out divider in the user popover — typically `<kp-menu-item>` instances |
| `[kpWsMain]` | Main pane content |
| `[kpWsSide]` | Side pane content (only rendered when `twoPanes` is `true`) |

### Inputs (data)

| Name | Type | Default | Description |
|---|---|---|---|
| `brandMark` | `string \| null` | `'簡素'` | Logo glyph; `null` to hide |
| `brandText` | `string \| null` | `'Kanso Protocol'` | Logo wordmark; `null` to hide |
| `navSections` | `KpSidebarSection[]` | `[]` | Sidebar nav data (same shape as `<kp-sidebar>`) |
| `unreadCount` | `number \| null` | `null` | Bell badge count; `null` = badge hidden |
| `user` | `KpWsUser \| null` | `null` | If `null`, avatar / user menu are hidden |

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
| `(signOut)` | `void` | User clicks Sign out in the user menu |
| `(themeChange)` | `KpWsTheme` | Fires alongside `[(theme)]` |

User-menu items (Profile / Settings / etc.) are now standalone elements
in the `[kpWsUserMenuItems]` slot — wire their own `(click)` /
`routerLink` directly on each `<kp-menu-item>` instance instead of going
through a template-level event.

---

## Cookbook

### 1. Wire up Angular Router

Render the routed view inside `[kpWsMain]`, drive nav-item active state
through `routerLinkActive` instead of the template's default
mark-and-clear behaviour.

```ts
// app.routes.ts
export const routes = [
  { path: 'dashboard', component: DashboardPage },
  { path: 'projects',  component: ProjectsPage  },
  { path: 'team',      component: TeamPage      },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
];

// nav data — drop the `active` flags; routerLinkActive owns that now
sections: KpSidebarSection[] = [
  { label: 'Workspace', items: [
    { label: 'Dashboard', icon: 'layout-dashboard' },
    { label: 'Projects',  icon: 'folder' },
    { label: 'Team',      icon: 'users' },
  ]},
];

onNav(item: KpSidebarNavItem): void {
  this.router.navigate(['/' + item.label.toLowerCase()]);
}
```

```html
<kp-template-workspace
  [navSections]="sections"
  (navItemClick)="onNav($event)">

  <kp-breadcrumbs kpWsHeaderNav size="md">
    <kp-breadcrumb-item type="link" href="/">Workspace</kp-breadcrumb-item>
    <kp-breadcrumb-separator/>
    <kp-breadcrumb-item type="current">{{ pageTitle() }}</kp-breadcrumb-item>
  </kp-breadcrumbs>

  <div kpWsMain>
    <router-outlet/>
  </div>
</kp-template-workspace>
```

> **Heads-up:** the template's default `onNavItemClick` mutates `active`
> flags on `navSections`. When the router drives state, your handler
> should ignore that path and just call `router.navigate`. If you don't
> bind `(navItemClick)` at all, the default mutation runs — harmless but
> redundant.

#### Side pane with routing

Content projection is **static** — it's evaluated at template
instantiation, before routing decides what to render. This means a
`[kpWsSide]` slot at the workspace level can't change per-route by
itself. You have three options:

**A. Routed page owns its own split** (recommended, simplest). Keep
only `<router-outlet>` in `[kpWsMain]`, drop `[kpWsSide]` from the
workspace, and let each routed page render its own split if it wants
one. You lose the workspace's drag-resize / responsive-stack machinery
in exchange for full per-route freedom.

```html
<kp-template-workspace ...>
  <div kpWsMain>
    <router-outlet/>
    <!-- no [kpWsSide] — each routed page renders main + side itself -->
  </div>
</kp-template-workspace>
```

**B. Static side pane shared across routes**. The side pane is the same
context inspector / activity log / mini-chat on every page. Project a
single component into `[kpWsSide]` once at the workspace level — it
stays mounted as routes change.

```html
<kp-template-workspace ...>
  <div kpWsMain><router-outlet/></div>
  <app-context-inspector kpWsSide/>
</kp-template-workspace>
```

**C. Per-route side via Angular named outlets** (keeps the workspace's
drag-resize). Define a `side` outlet alongside the primary one, route
each path to two components — one in primary, one in `side`. `kpWsSide`
becomes `<router-outlet name="side"/>`.

```ts
export const routes = [
  { path: 'dashboard', component: DashboardPage },
  { path: 'dashboard', component: DashboardSide, outlet: 'side' },
  { path: 'projects',  component: ProjectsPage  },
  { path: 'projects',  component: ProjectsSide, outlet: 'side' },
];
```
```html
<kp-template-workspace ...>
  <div kpWsMain><router-outlet/></div>
  <div kpWsSide><router-outlet name="side"/></div>
</kp-template-workspace>
```
URLs become `(...)/dashboard(side:dashboard)` — if that's too noisy,
prefer A or B.

**Decision shortcut:**
| Side-pane content per route | Want template's drag-resize? | Pick |
|---|---|---|
| Same on every route | — | B |
| Different per route | No  | A |
| Different per route | Yes | C |

### 2. Persist sidebar collapse / pane width / theme

Persist the three two-way-bound state inputs to `localStorage` (or your
state library of choice). Bind `[(sidebarState)]`, `[(sidePaneWidth)]`,
`[(theme)]` to signals; mirror them with `effect()`:

```ts
import { Component, effect, signal } from '@angular/core';

readonly sidebarState = signal<KpWsSidebarState>(
  (localStorage.getItem('ws.sb') as KpWsSidebarState) || 'expanded');
readonly sidePaneWidth = signal(Number(localStorage.getItem('ws.sw')) || 360);
readonly theme = signal<KpWsTheme>(
  (localStorage.getItem('ws.theme') as KpWsTheme) || 'system');

constructor() {
  effect(() => localStorage.setItem('ws.sb',    this.sidebarState()));
  effect(() => localStorage.setItem('ws.sw',    String(this.sidePaneWidth())));
  effect(() => localStorage.setItem('ws.theme', this.theme()));
}
```

```html
<kp-template-workspace
  [(sidebarState)]="sidebarState"
  [(sidePaneWidth)]="sidePaneWidth"
  [(theme)]="theme">
  ...
</kp-template-workspace>
```

> Don't store `twoPanes` — that's a per-page choice (some pages don't
> have a side pane), not a global preference.

### 3. Custom logo

Replace the default brand block with anything (logo SVG, link, image):

```html
<kp-template-workspace [brandMark]="null" [brandText]="null">
  <a kpWsLogo routerLink="/" aria-label="Home" style="display:inline-flex">
    <img src="/logo.svg" alt="" height="24"/>
  </a>
  ...
</kp-template-workspace>
```

The two `null`s suppress the built-in `簡素 Kanso Protocol` branding.

### 4. Header-nav recipes

The `[kpWsHeaderNav]` slot is a flex-grow centre area — project anything.

**Breadcrumbs** (most common):
```html
<kp-breadcrumbs kpWsHeaderNav size="md">
  <kp-breadcrumb-item type="link" href="/">Workspace</kp-breadcrumb-item>
  <kp-breadcrumb-separator/>
  <kp-breadcrumb-item type="current">Dashboard</kp-breadcrumb-item>
</kp-breadcrumbs>
```

**Tenant / OU selector** — lateral navigation between siblings (admin /
multi-tenant UIs where users jump between OUs more than they drill into
one):
```html
<div kpWsHeaderNav style="display:flex;align-items:center;gap:8px">
  <span style="font-size:13px;color:var(--kp-color-text-muted)">Tenant:</span>
  <kp-select
    size="sm"
    style="width:fit-content;min-width:220px"
    [options]="tenants"
    [(ngModel)]="currentTenant"/>
</div>
```

**Page tabs** — when the workspace's main pane has multiple sub-views:
```html
<kp-tabs kpWsHeaderNav size="sm" [activeId]="activeTab" (tabChange)="activeTab = $event">
  <kp-tab id="overview" label="Overview"/>
  <kp-tab id="activity" label="Activity"/>
  <kp-tab id="members"  label="Members"/>
</kp-tabs>
```

**Search bar** — global search living in the header:
```html
<kp-search-bar kpWsHeaderNav
  size="md"
  style="max-width:480px"
  placeholder="Search projects, people, files…"
  [(ngModel)]="query"
  (submit)="onSearch($event)"/>
```

[Storybook deeplink → header-nav with custom select](https://gregnblack.github.io/kanso-protocol/?path=/story/templates-workspace--header-nav-custom-select)

### 5. User-menu items with permissions

Each item in `[kpWsUserMenuItems]` is a real Angular element. Use
`*ngIf` / signals to drive visibility:

```html
<kp-template-workspace ...>

  <kp-menu-item kpWsUserMenuItems label="Profile" routerLink="/profile">
    <kp-icon kpMenuItemIcon name="user" size="md"/>
  </kp-menu-item>

  @if (canManageBilling()) {
    <kp-menu-item kpWsUserMenuItems label="Billing" routerLink="/billing">
      <kp-icon kpMenuItemIcon name="credit-card" size="md"/>
    </kp-menu-item>
  }

  @if (isAdmin()) {
    <kp-menu-item kpWsUserMenuItems label="Admin console" routerLink="/admin">
      <kp-icon kpMenuItemIcon name="shield" size="md"/>
    </kp-menu-item>
  }

  <kp-menu-item kpWsUserMenuItems label="Help" (click)="openHelp()">
    <kp-icon kpMenuItemIcon name="help" size="md"/>
  </kp-menu-item>

</kp-template-workspace>
```

`(signOut)` on the host fires when the built-in Sign-out row is clicked
— wire your auth flow there.

### 6. Extra header actions

The right cluster has the bell / theme / avatar / optional Invite button.
Drop additional one-off buttons into `[kpWsHeaderActions]` (rendered
**before** Invite so it stays the rightmost action):

```html
<kp-template-workspace ... [showInviteAction]="true">
  <kp-icon-button kpWsHeaderActions size="md" ariaLabel="Open command palette" (buttonClick)="openCmdK()">
    <kp-icon name="command" size="md"/>
  </kp-icon-button>
  <kp-icon-button kpWsHeaderActions size="md" ariaLabel="Help" (buttonClick)="openHelp()">
    <kp-icon name="help" size="md"/>
  </kp-icon-button>
  ...
</kp-template-workspace>
```

If the same action ships in **every** install, promote it to a
feature-flag input inside your forked copy instead — see "Fork vs slot"
below.

### 7. Hiding pieces selectively

All header elements are gated by `show*` flags. A minimal embedded
console with no popovers, no theme toggle:

```html
<kp-template-workspace
  [navSections]="sections"
  [user]="user"
  [showLayoutToggle]="false"
  [showThemeToggle]="false"
  [showNotifications]="false"
  [showUserMenu]="false">
  <div kpWsMain>...</div>
</kp-template-workspace>
```

[Storybook deeplink → minimal](https://gregnblack.github.io/kanso-protocol/?path=/story/templates-workspace--minimal)

### 8. Single-pane mode

Bind `[twoPanes]="false"` (or two-way-bind to a signal). The side pane
content is simply not rendered; no `<kp-tpl__pane--side>` element exists
in the DOM, so projected `[kpWsSide]` content is dropped.

```html
<kp-template-workspace [twoPanes]="false">
  <div kpWsMain>...</div>
  <!-- [kpWsSide] still allowed in markup, just won't render -->
</kp-template-workspace>
```

[Storybook deeplink → single pane](https://gregnblack.github.io/kanso-protocol/?path=/story/templates-workspace--single-pane)

---

## Decision tree: when to slot vs fork vs add a flag

```
Need to change something?
├── It's a one-off for THIS page/route
│   └── Use a slot ([kpWsHeaderActions], [kpWsHeaderNav], etc.)
│
├── It's app-wide and consistent
│   └── It's already exposed as an Input?
│       ├── YES → bind it ([showInviteAction], [unreadCount], etc.)
│       └── NO  → add a feature-flag Input inside YOUR forked copy
│
└── It's structural (3 panes, RTL drawer, top-only nav, …)
    └── Fork the layout. The template was meant to be edited.
        Don't try to bend it via slots.
```

**Rule of thumb:** slots solve "what content goes here". Forks solve
"what shape does the layout have". If your change touches the
`<kp-app-shell layout="…">` argument, the number of `kp-tpl__pane`
elements, or the sidebar's existence — fork.

---

## Fork vs re-pull from upstream

The canonical template lives at
[`packages/examples/template-modern/template-workspace.component.ts`](https://github.com/GregNBlack/kanso-protocol/blob/main/packages/examples/template-modern/template-workspace.component.ts).

**When re-pulling makes sense:**
- You want a bug-fix or new feature that landed upstream
- Your local diff is small (custom logo, extra `[kpWsHeaderActions]`
  bindings, persistence wiring) — easily replayed on top of fresh
  upstream
- You haven't restructured the JSX

**When to stop re-pulling and own the file:**
- You've added a third pane, swapped the sidebar, or otherwise restructured
- You've forked enough that diffs are larger than the upstream file
- You have project-specific business logic in the component class

**Recipe for re-pulling**:
```bash
# 1. Save your current version
cp src/templates/template-workspace.component.ts \
   src/templates/template-workspace.component.LOCAL.ts

# 2. Pull canonical
curl -o src/templates/template-workspace.component.ts \
  https://raw.githubusercontent.com/GregNBlack/kanso-protocol/main/packages/examples/template-modern/template-workspace.component.ts

# 3. Diff and replay your changes
diff src/templates/template-workspace.component.LOCAL.ts \
     src/templates/template-workspace.component.ts
```

If you find yourself replaying the same diff every time, that diff
deserves a PR upstream — open one.

---

## Troubleshooting

**Theme toggle in the header doesn't sync the Storybook toolbar.**
By design. The template applies the theme by setting
`document.documentElement[data-theme]` directly, but **does not** emit
to Storybook's globals channel — addon-themes responds to global
changes by re-rendering the entire story, which destroys the live
toggle component mid-click and breaks the pill-slide animation.
Toolbar may show stale state in Storybook; in your real app there is
no toolbar, so the trade-off is in your favour. See `applyResolvedTheme`
comment in the component.

**Notification / user popover doesn't close on outside-click.**
Both popovers use `@HostListener('document:click')`. They close when
the click target's closest ancestor is **not** the matching
`.kp-tpl__popover-anchor--*`. If you've replaced the trigger with a
custom element, make sure it (or a wrapping container) carries that
class — otherwise the listener will treat your trigger as "outside"
and immediately close the popover after opening it.

**Two panes stack vertically on narrow screens — drag handle hidden.**
Expected: at `<1024px` the responsive CSS in the template stacks panes
vertically and hides the resize handle. Tune the `@media (max-width:
1023px)` rule if you want a different breakpoint or no stacking.

**`<kp-select>` (or any form control) inside `[kpWsHeaderNav]` throws
"No provider for ControlValueAccessor".**
You forgot to import `FormsModule` (or `ReactiveFormsModule`) in the
component that hosts `<kp-template-workspace>`. The template doesn't
import them itself — they're only relevant if your projected slot
content uses `[(ngModel)]` / `formControlName`.

**Sidebar nav-items appear inactive even though the route matches.**
The default `onNavItemClick` mutates `active` flags on `navSections`.
If you switched to `routerLinkActive` but didn't override
`(navItemClick)`, the click handler still tries to mutate flags that
aren't there. Bind `(navItemClick)` to a no-op (or your routing
handler) to suppress.

**Breadcrumbs disappear below 768px.**
Expected: at `<768px`, the responsive CSS hides all breadcrumb items
except the last. If you projected something other than breadcrumbs
(tabs, search, OU select), the `display:none` rule may still match
because it targets `kp-breadcrumb-item`/`kp-breadcrumb-separator` —
non-breadcrumb content is unaffected. If you want different mobile
behaviour, edit the `@media (max-width: 767px)` block.

**SSR (server-side rendering) — `document is not defined` error.**
The component touches `document` in `ngOnInit` and `applyResolvedTheme`.
Both checks are guarded with `typeof document !== 'undefined'`, so SSR
should not crash — but if you customised those methods, keep the guard
or wrap in `isPlatformBrowser`.

---

## Storybook deeplinks

| Story | Direct link |
|---|---|
| Default (breadcrumbs, two panes) | [open](https://gregnblack.github.io/kanso-protocol/?path=/story/templates-workspace--default) |
| Single pane | [open](https://gregnblack.github.io/kanso-protocol/?path=/story/templates-workspace--single-pane) |
| Sidebar collapsed | [open](https://gregnblack.github.io/kanso-protocol/?path=/story/templates-workspace--sidebar-collapsed) |
| Minimal (no popovers / no toggle) | [open](https://gregnblack.github.io/kanso-protocol/?path=/story/templates-workspace--minimal) |
| Header-nav with custom select | [open](https://gregnblack.github.io/kanso-protocol/?path=/story/templates-workspace--header-nav-custom-select) |
