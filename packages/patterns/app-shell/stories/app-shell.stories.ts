import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { KpAppShellComponent } from '../src/app-shell.component';
import { KpHeaderComponent, KpHeaderNavItem } from '@kanso-protocol/header';
import { KpSidebarComponent, KpSidebarSection } from '@kanso-protocol/sidebar';
import { KpAvatarComponent } from '@kanso-protocol/avatar';
import { KpNavItemComponent } from '@kanso-protocol/nav-item';
import { KpBadgeComponent } from '@kanso-protocol/badge';
import { KpContainerComponent } from '@kanso-protocol/container';
import { KpPageHeaderComponent } from '@kanso-protocol/page-header';

const NAV: KpHeaderNavItem[] = [
  { label: 'Dashboard', active: true },
  { label: 'Projects' },
  { label: 'Team' },
  { label: 'Documents' },
];

const SECTIONS: KpSidebarSection[] = [
  { label: 'Main', items: [
    { label: 'Dashboard', icon: 'layout-dashboard', active: true },
    { label: 'Projects', icon: 'folder' },
    { label: 'Team', icon: 'users', badge: '12' },
    { label: 'Documents', icon: 'file-text' },
  ] },
  { label: 'Workspace', items: [
    { label: 'Analytics', icon: 'chart-bar' },
    { label: 'Reports', icon: 'chart-infographic' },
  ] },
];

const meta: Meta<KpAppShellComponent> = {
  title: 'Patterns/AppShell',
  component: KpAppShellComponent,
  decorators: [moduleMetadata({ imports: [
    KpHeaderComponent, KpSidebarComponent, KpAvatarComponent,
    KpNavItemComponent, KpBadgeComponent, KpContainerComponent, KpPageHeaderComponent,
  ] })],
  tags: ['autodocs'],
  argTypes: {
    layout: { control: 'inline-radio', options: ['sidebar-left','sidebar-right','no-sidebar','sidebar-collapsed'], table: { defaultValue: { summary: 'sidebar-left' } } },
  },
  parameters: {
    layout: 'fullscreen',
    // Pattern stories compose multiple landmark-bearing components (Header,
    // Sidebar, footer, etc.) on a single page — that's the *correct* shape
    // for a real app shell, but it triggers landmark-unique / no-duplicate-*
    // rules in axe. Real consumers see only one shell per page; the demo
    // legitimately needs to render several side by side. Disable the rules
    // here, not in the components themselves.
    a11y: { config: { rules: [
      { id: 'landmark-unique', enabled: false },
      { id: 'landmark-no-duplicate-banner', enabled: false },
      { id: 'landmark-no-duplicate-contentinfo', enabled: false },
    ] } },
  },
};
export default meta;
type Story = StoryObj<KpAppShellComponent>;

// Stat-card with semantic tokens (matches both light + dark modes).
const STAT_CARD = (label: string, value: string, delta: string, tone: 'success' | 'danger') => `
  <div style="padding:20px;background:var(--kp-color-surface-base);border:1px solid var(--kp-color-border-default);border-radius:14px">
    <div style="font-size:12px;color:var(--kp-color-text-muted)">${label}</div>
    <div style="font-size:28px;font-weight:600;margin-top:4px;color:var(--kp-color-text-strong)">${value}</div>
    <div style="font-size:12px;margin-top:8px;color:var(--kp-color-alert-${tone}-subtle-fg-title)">${delta}</div>
  </div>
`;

// 12-bar mock chart — semantic primary fill, alternating heights for
// a real "data over time" feel. No repeating-gradient zebra.
const CHART_BARS = [62, 48, 70, 55, 80, 68, 90, 72, 85, 78, 95, 88];
const CHART = `
  <div style="display:flex;align-items:flex-end;gap:6px;height:180px;padding:8px 4px">
    ${CHART_BARS.map((h) => `
      <div style="
        flex:1;
        height:${h}%;
        background:var(--kp-color-primary-default-bg-rest);
        border-radius:4px 4px 0 0;
        opacity:0.85;
      "></div>
    `).join('')}
  </div>
`;

const BODY = `
  <div kpAppShellBody>
    <kp-container width="wide" padding="md" style="padding-top:24px;padding-bottom:48px">
      <kp-page-header title="Dashboard" description="Welcome back, Greg" [showDescription]="true"/>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:24px">
        ${STAT_CARD('Revenue',      '$48,329', '+12.5% from last month', 'success')}
        ${STAT_CARD('Active users', '2,451',   '+4.2% from last week',    'success')}
        ${STAT_CARD('Conversion',   '3.8%',    '−0.3% from last week',    'danger')}
      </div>
      <div style="margin-top:16px;padding:20px;background:var(--kp-color-surface-base);border:1px solid var(--kp-color-border-default);border-radius:14px">
        <div style="font-size:14px;font-weight:500;margin-bottom:12px;color:var(--kp-color-text-strong)">Revenue over time</div>
        ${CHART}
      </div>
    </kp-container>
  </div>
`;

export const Playground: Story = {
  args: { layout: 'sidebar-left', showHeader: true, showSidebar: true, showFooter: false, showBanner: false },
  render: (args) => ({
    props: { ...args, nav: NAV, sections: SECTIONS },
    template: `
      <kp-app-shell [layout]="layout" [showHeader]="showHeader" [showSidebar]="showSidebar" [showFooter]="showFooter" [showBanner]="showBanner">
        <kp-header kpAppShellHeader size="md" [navItems]="nav" userName="Greg Black" userInitials="GB" userRole="Admin" [showSearch]="true" notificationsCount="3"/>
        <kp-sidebar kpAppShellSidebar [showLogo]="false" [showUserFooter]="false" [sections]="sections" userName="Greg Black" userInitials="GB" userEmail="greg@example.com"/>
        ${BODY}
      </kp-app-shell>
    `,
  }),
};

export const NoSidebar: Story = {
  args: { layout: 'no-sidebar', showHeader: true, showSidebar: false },
  render: (args) => ({
    props: { ...args, nav: NAV },
    template: `
      <kp-app-shell [layout]="layout" [showSidebar]="showSidebar">
        <kp-header kpAppShellHeader [navItems]="nav" userName="Greg Black" userInitials="GB"/>
        ${BODY}
      </kp-app-shell>
    `,
  }),
};

export const SidebarCollapsed: Story = {
  args: { layout: 'sidebar-collapsed' },
  render: (args) => ({
    props: { ...args, nav: NAV, sections: SECTIONS },
    template: `
      <kp-app-shell layout="sidebar-collapsed">
        <kp-header kpAppShellHeader [navItems]="nav" userName="Greg Black" userInitials="GB"/>
        <kp-sidebar kpAppShellSidebar widthState="collapsed" [showLogo]="false" [showUserFooter]="false" [sections]="sections" userInitials="GB"/>
        ${BODY}
      </kp-app-shell>
    `,
  }),
};

export const WithBanner: Story = {
  args: { showBanner: true },
  render: (args) => ({
    props: { ...args, nav: NAV, sections: SECTIONS },
    template: `
      <kp-app-shell [showBanner]="showBanner">
        <kp-header kpAppShellHeader [navItems]="nav" userName="Greg Black" userInitials="GB"/>
        <div kpAppShellBanner style="padding:10px 24px;background:#FFFBEB;border-bottom:1px solid #FCD34D;font-size:13px;color:#92400E;display:flex;justify-content:space-between;align-items:center">
          <span>Your trial expires in <strong>3 days</strong>. Upgrade now to keep all features.</span>
        </div>
        <kp-sidebar kpAppShellSidebar [showLogo]="false" [showUserFooter]="false" [sections]="sections" userName="Greg Black" userInitials="GB" userEmail="greg@example.com"/>
        ${BODY}
      </kp-app-shell>
    `,
  }),
};

export const WithFooter: Story = {
  args: { showFooter: true },
  render: (args) => ({
    props: { ...args, nav: NAV, sections: SECTIONS },
    template: `
      <kp-app-shell [showFooter]="showFooter">
        <kp-header kpAppShellHeader [navItems]="nav" userName="Greg Black" userInitials="GB"/>
        <kp-sidebar kpAppShellSidebar [showLogo]="false" [showUserFooter]="false" [sections]="sections" userName="Greg Black" userInitials="GB" userEmail="greg@example.com"/>
        ${BODY}
        <div kpAppShellFooter style="padding:12px 24px;display:flex;align-items:center;justify-content:space-between;font-size:13px;color: var(--kp-color-gray-600);font-family:Onest,system-ui,sans-serif">
          <span>© 2026 Kanso Protocol</span>
          <span style="display:flex;gap:16px"><a style="color:inherit">Privacy</a><a style="color:inherit">Terms</a><a style="color:inherit">Contact</a></span>
        </div>
      </kp-app-shell>
    `,
  }),
};
