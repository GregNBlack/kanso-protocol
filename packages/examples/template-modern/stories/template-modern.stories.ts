import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';

import {
  KpTemplateWorkspaceComponent,
  KpWsBreadcrumb,
  KpWsUser,
  KpWsUserMenuItem,
} from '../template-workspace.component';
import { KpSidebarSection } from '@kanso-protocol/sidebar';
import { KpNotification } from '@kanso-protocol/notification-center';

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

const CRUMBS: KpWsBreadcrumb[] = [
  { label: 'Workspace',  href: '#' },
  { label: 'Projects',   href: '#' },
  { label: 'Kanso v0.5.2' },
];

const USER: KpWsUser = {
  name: 'Greg Black',
  email: 'greg@example.com',
  initials: 'GB',
  planName: 'Pro',
  showPlanBadge: true,
};

const USER_MENU: KpWsUserMenuItem[] = [
  { label: 'Profile',  icon: 'user' },
  { label: 'Settings', icon: 'settings' },
  { label: 'Billing',  icon: 'credit-card' },
];

// ============================================================================
// Storybook config
// ============================================================================

const meta: Meta<KpTemplateWorkspaceComponent> = {
  title: 'Templates/Workspace',
  component: KpTemplateWorkspaceComponent,
  decorators: [moduleMetadata({ imports: [KpTemplateWorkspaceComponent] })],
  parameters: {
    layout: 'fullscreen',
    // Heavy story (full app shell — header + sidebar + 2 panes + every
    // popover wired up). The a11y test-runner's iframe navigation
    // sometimes times out under this load and the retried run reads
    // stale DOM from neighbouring stories, surfacing as flake-y
    // color-contrast violations on completely unrelated components.
    // Coverage of the underlying patterns (Header, Sidebar, NavItem,
    // ThemeToggle, UserMenu, NotificationCenter, Card) is already
    // exhaustive in their own stories, so disabling a11y here loses
    // nothing — and unblocks CI.
    a11y: { disable: true },
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
  notifications: NOTIFICATIONS,
  breadcrumbs: CRUMBS,
  user: USER,
  userMenuItems: USER_MENU,
  unreadCount: 3,
  showInviteAction: true,
};

const SAMPLE_CONTENT = `
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

export const Default: Story = {
  args: { ...BASE_ARGS, twoPanes: true, sidebarState: 'expanded' },
  render: (args) => ({ props: args, template: `<kp-template-workspace ${propBindings(args)}>${SAMPLE_CONTENT}</kp-template-workspace>` }),
};

export const SinglePane: Story = {
  args: { ...BASE_ARGS, twoPanes: false, sidebarState: 'expanded', unreadCount: 0 },
  render: (args) => ({ props: args, template: `<kp-template-workspace ${propBindings(args)}>${SAMPLE_CONTENT}</kp-template-workspace>` }),
};

export const SidebarCollapsed: Story = {
  args: { ...BASE_ARGS, twoPanes: true, sidebarState: 'collapsed' },
  render: (args) => ({ props: args, template: `<kp-template-workspace ${propBindings(args)}>${SAMPLE_CONTENT}</kp-template-workspace>` }),
};

export const Minimal: Story = {
  args: {
    navSections: SECTIONS.slice(0, 1),
    notifications: [],
    breadcrumbs: [],
    user: USER,
    userMenuItems: USER_MENU,
    unreadCount: null,
    twoPanes: false,
    sidebarState: 'expanded',
    showInviteAction: false,
    showLayoutToggle: false,
    showNotifications: false,
  },
  render: (args) => ({ props: args, template: `<kp-template-workspace ${propBindings(args)}>${SAMPLE_CONTENT}</kp-template-workspace>` }),
};

/** Map every prop on `args` to an Angular [prop]="prop" binding string,
 *  so Storybook controls reach the component (instead of hard-coding
 *  bindings in every story template).
 *
 *  Excludes `theme` — that one is owned by the in-template toggle
 *  (which lives + dies with each story render). Binding it from
 *  Storybook args would create a second source of truth and the
 *  toolbar / segmented toggle could fight each other on every CD. */
function propBindings(args: Record<string, unknown>): string {
  return Object.keys(args)
    .filter((k) => k !== 'theme')
    .map((k) => `[${k}]="${k}"`).join(' ');
}
