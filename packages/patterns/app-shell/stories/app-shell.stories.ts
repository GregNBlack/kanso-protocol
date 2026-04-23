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
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<KpAppShellComponent>;

const BODY = `
  <div kpAppShellBody>
    <kp-container width="wide" padding="md" style="padding-top:24px;padding-bottom:48px">
      <kp-page-header title="Dashboard" description="Welcome back, Greg" [showDescription]="true"/>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:24px">
        <div style="padding:20px;background:#fff;border:1px solid #E4E4E7;border-radius:12px">
          <div style="font-size:12px;color:#71717A">Revenue</div>
          <div style="font-size:28px;font-weight:600;margin-top:4px">$48,329</div>
          <div style="font-size:12px;color:#16A34A;margin-top:8px">+12.5% from last month</div>
        </div>
        <div style="padding:20px;background:#fff;border:1px solid #E4E4E7;border-radius:12px">
          <div style="font-size:12px;color:#71717A">Active users</div>
          <div style="font-size:28px;font-weight:600;margin-top:4px">2,451</div>
          <div style="font-size:12px;color:#16A34A;margin-top:8px">+4.2% from last week</div>
        </div>
        <div style="padding:20px;background:#fff;border:1px solid #E4E4E7;border-radius:12px">
          <div style="font-size:12px;color:#71717A">Conversion</div>
          <div style="font-size:28px;font-weight:600;margin-top:4px">3.8%</div>
          <div style="font-size:12px;color:#DC2626;margin-top:8px">−0.3% from last week</div>
        </div>
      </div>
      <div style="margin-top:16px;padding:20px;background:#fff;border:1px solid #E4E4E7;border-radius:12px;height:240px">
        <div style="font-size:14px;font-weight:500;margin-bottom:8px">Revenue over time</div>
        <div style="height:180px;background:repeating-linear-gradient(90deg,#F4F4F5,#F4F4F5 8px,transparent 8px,transparent 20px);border-radius:6px"></div>
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
        <div kpAppShellFooter style="padding:12px 24px;display:flex;align-items:center;justify-content:space-between;font-size:13px;color:#71717A;font-family:Onest,system-ui,sans-serif">
          <span>© 2026 Kanso Protocol</span>
          <span style="display:flex;gap:16px"><a style="color:inherit">Privacy</a><a style="color:inherit">Terms</a><a style="color:inherit">Contact</a></span>
        </div>
      </kp-app-shell>
    `,
  }),
};
