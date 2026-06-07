import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { FormsModule } from '@angular/forms';

import { KpTemplateWorkspaceComponent, KpWsUser } from '../template-workspace.component';
import { KpSidebarSection } from '@kanso-protocol/ui/sidebar';
import {
  KpBreadcrumbsComponent,
  KpBreadcrumbItemComponent,
  KpBreadcrumbSeparatorComponent,
} from '@kanso-protocol/ui/breadcrumbs';
import { KpNotificationCenterComponent, KpNotification } from '@kanso-protocol/ui/notification-center';
import { KpMenuItemComponent } from '@kanso-protocol/ui/menu';
import { KpIconComponent } from '@kanso-protocol/ui/icon';
import { KpSelectComponent, KpSelectOption } from '@kanso-protocol/ui/select';

// ============================================================================
// Mock data — replace with your own when copying the template into a project.
// ============================================================================

const SECTIONS: KpSidebarSection[] = [
  {
    label: 'Workspace',
    items: [
      { label: 'Dashboard',  icon: 'layout-dashboard', active: true },
      { label: 'Projects',   icon: 'folder' },
      { label: 'Team',       icon: 'users' },
      { label: 'Reports',    icon: 'chart-bar' },
    ],
  },
  {
    label: 'Settings',
    items: [
      { label: 'Billing',     icon: 'credit-card' },
      { label: 'Preferences', icon: 'adjustments-horizontal' },
    ],
  },
];

const NOTIFICATIONS: KpNotification[] = [
  { id: '1', avatarInitials: 'SK', title: 'Sarah mentioned you', message: 'in Kanso v0.5.2 release notes.', time: '2m ago',  read: false },
  { id: '2', icon: 'circle-check', appearance: 'success', title: 'Build completed',     message: 'Deployment successful.',                           time: '1h ago',  read: false },
  { id: '3', icon: 'info-circle',  appearance: 'info',    title: 'System maintenance',  message: 'Scheduled for Sunday 2 AM UTC.',                   time: '3h ago',  read: false },
  { id: '4', icon: 'alert-circle', appearance: 'danger',  title: 'Build failed',        message: 'TS errors in template-modern.stories.ts',         time: 'yesterday', read: true },
];

const USER: KpWsUser = {
  name: 'Greg Black',
  email: 'greg@example.com',
  initials: 'GB',
  planName: 'Pro',
  showPlanBadge: true,
};

// ============================================================================
// Storybook config
// ============================================================================

const meta: Meta<KpTemplateWorkspaceComponent> = {
  title: 'Templates/Workspace',
  component: KpTemplateWorkspaceComponent,
  decorators: [moduleMetadata({
    imports: [
      KpTemplateWorkspaceComponent,
      KpBreadcrumbsComponent,
      KpBreadcrumbItemComponent,
      KpBreadcrumbSeparatorComponent,
      KpNotificationCenterComponent,
      KpMenuItemComponent,
      KpIconComponent,
      KpSelectComponent,
      FormsModule,
    ],
  })],
  parameters: {
    layout: 'fullscreen',
    a11y: {
      config: {
        rules: [
          { id: 'landmark-unique', enabled: false },
          { id: 'landmark-no-duplicate-contentinfo', enabled: false },
        ],
      },
    },
  },
  argTypes: {
    twoPanes: { control: 'boolean' },
    sidebarState: { control: 'inline-radio', options: ['expanded', 'collapsed'] },
    unreadCount: { control: { type: 'number', min: 0, max: 99 } },
    showInviteAction: { control: 'boolean' },
    showLayoutToggle: { control: 'boolean' },
    showThemeToggle:  { control: 'boolean' },
    showNotifications:{ control: 'boolean' },
    showUserMenu:     { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<KpTemplateWorkspaceComponent>;

const BASE_ARGS = {
  navSections: SECTIONS,
  user: USER,
  unreadCount: 3,
  showInviteAction: true,
};

// ─── Reusable slot fragments ──────────────────────────────────────────────────
// These mirror the slot-first API: each is a real Kanso component instance
// with its own bindings, projected into a named slot on the template.

const HEADER_NAV_BREADCRUMBS = `
  <kp-breadcrumbs kpWsHeaderNav size="md">
    <kp-breadcrumb-item type="link" href="#">Workspace</kp-breadcrumb-item>
    <kp-breadcrumb-separator/>
    <kp-breadcrumb-item type="link" href="#">Projects</kp-breadcrumb-item>
    <kp-breadcrumb-separator/>
    <kp-breadcrumb-item type="current">Kanso v0.5.3</kp-breadcrumb-item>
  </kp-breadcrumbs>
`;

const NOTIFICATIONS_SLOT = `
  <kp-notification-center kpWsNotifications
    state="with-items" [notifications]="notifications"/>
`;

const USER_MENU_ITEMS = `
  <kp-menu-item kpWsUserMenuItems label="Profile" size="md">
    <kp-icon kpMenuItemIcon name="user" size="md"/>
  </kp-menu-item>
  <kp-menu-item kpWsUserMenuItems label="Settings" size="md">
    <kp-icon kpMenuItemIcon name="settings" size="md"/>
  </kp-menu-item>
  <kp-menu-item kpWsUserMenuItems label="Billing" size="md">
    <kp-icon kpMenuItemIcon name="credit-card" size="md"/>
  </kp-menu-item>
`;

const SAMPLE_PANES = `
  <div kpWsMain>
    <header style="display:flex;flex-direction:column;gap:4px;margin-bottom:16px">
      <h2 style="margin:0;font-size:18px;font-weight:500;color:var(--kp-color-text-strong)">Section A</h2>
      <p style="margin:0;font-size:14px;color:var(--kp-color-text-muted)">Primary content area — list, table, dashboard, anything.</p>
    </header>
    <p>Drop your real content here. The pane uses surface.base (white in light, lifted in dark) with the largest radius from the Kanso ramp (16px).</p>
    <p>Switch the layout-toggle in the header to flip between split and single-pane.</p>
  </div>
  <div kpWsSide>
    <header style="display:flex;flex-direction:column;gap:4px;margin-bottom:16px">
      <h2 style="margin:0;font-size:18px;font-weight:500;color:var(--kp-color-text-strong)">Section B</h2>
      <p style="margin:0;font-size:14px;color:var(--kp-color-text-muted)">Optional secondary pane — detail, preview, inspector.</p>
    </header>
    <p>Drag the divider between panes to resize. Width is clamped to 240–800px.</p>
  </div>
`;

/** Map every prop on `args` to an Angular [prop]="prop" binding string. */
function propBindings(args: Record<string, unknown>): string {
  return Object.keys(args)
    .filter((k) => k !== 'theme' && k !== 'notifications')
    .map((k) => `[${k}]="${k}"`).join(' ');
}

const fullStory = (args: Record<string, unknown>): string => `
  <kp-template-workspace ${propBindings(args)}>
    ${HEADER_NAV_BREADCRUMBS}
    ${NOTIFICATIONS_SLOT}
    ${USER_MENU_ITEMS}
    ${SAMPLE_PANES}
  </kp-template-workspace>
`;

export const Default: Story = {
  args: { ...BASE_ARGS, twoPanes: true, sidebarState: 'expanded' },
  render: (args) => ({
    props: { ...args, notifications: NOTIFICATIONS },
    template: fullStory(args as Record<string, unknown>),
  }),
};

export const SinglePane: Story = {
  args: { ...BASE_ARGS, twoPanes: false, sidebarState: 'expanded', unreadCount: 0 },
  render: (args) => ({
    props: { ...args, notifications: NOTIFICATIONS },
    template: fullStory(args as Record<string, unknown>),
  }),
};

export const SidebarCollapsed: Story = {
  args: { ...BASE_ARGS, twoPanes: true, sidebarState: 'collapsed' },
  render: (args) => ({
    props: { ...args, notifications: NOTIFICATIONS },
    template: fullStory(args as Record<string, unknown>),
  }),
};

export const Minimal: Story = {
  args: {
    navSections: SECTIONS.slice(0, 1),
    user: USER,
    unreadCount: null,
    twoPanes: false,
    sidebarState: 'expanded',
    showInviteAction: false,
    showLayoutToggle: false,
    showNotifications: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <kp-template-workspace ${propBindings(args)}>
        ${USER_MENU_ITEMS}
        ${SAMPLE_PANES}
      </kp-template-workspace>
    `,
  }),
};

const TENANT_OPTIONS: KpSelectOption[] = [
  { value: 'acme-eng',     label: 'Acme Corp / Engineering' },
  { value: 'acme-mkt',     label: 'Acme Corp / Marketing' },
  { value: 'acme-fin',     label: 'Acme Corp / Finance' },
  { value: 'globex-plat',  label: 'Globex / Platform' },
];

/**
 * Demonstrates that `[kpWsHeaderNav]` is a generic slot — anything can go
 * there, not just breadcrumbs. This story projects a `<kp-select>`
 * acting as a tenant/OU switcher (typical pattern in admin UIs where
 * users jump laterally between siblings rather than drill down).
 */
export const HeaderNavCustomSelect: Story = {
  name: 'Header nav: custom (OU selector)',
  args: { ...BASE_ARGS, twoPanes: true, sidebarState: 'expanded' },
  render: (args) => ({
    props: { ...args, notifications: NOTIFICATIONS, tenantOptions: TENANT_OPTIONS, tenant: 'acme-eng' },
    template: `
      <kp-template-workspace ${propBindings(args)}>

        <!-- The kpWsHeaderNav slot accepts ANY content. Here: a tenant
             selector — common in admin UIs where users jump laterally
             between OUs instead of drilling into a hierarchy. -->
        <div kpWsHeaderNav style="display:flex;align-items:center;gap:8px;min-width:0">
          <span style="font-size:13px;color:var(--kp-color-text-muted);flex:0 0 auto">Tenant:</span>
          <kp-select
            size="sm"
            style="width:fit-content;min-width:220px"
            [options]="tenantOptions"
            [(ngModel)]="tenant"/>
        </div>

        ${NOTIFICATIONS_SLOT}
        ${USER_MENU_ITEMS}
        ${SAMPLE_PANES}
      </kp-template-workspace>
    `,
  }),
};
