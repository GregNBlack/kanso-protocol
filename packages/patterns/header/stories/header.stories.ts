import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { KpHeaderComponent, KpHeaderNavItem } from '../src/header.component';
import { KpAvatarComponent } from '@kanso-protocol/avatar';

const NAV: KpHeaderNavItem[] = [
  { label: 'Dashboard', href: '#', active: true },
  { label: 'Projects',  href: '#' },
  { label: 'Team',      href: '#' },
  { label: 'Documents', href: '#' },
];

const meta: Meta<KpHeaderComponent> = {
  title: 'Patterns/Header',
  component: KpHeaderComponent,
  decorators: [moduleMetadata({ imports: [KpAvatarComponent] })],
  tags: ['autodocs'],
  argTypes: {
    size:              { control: 'inline-radio', options: ['sm','md','lg'], table: { defaultValue: { summary: 'md' } } },
    appearance:        { control: 'inline-radio', options: ['light','dark'], table: { defaultValue: { summary: 'light' } } },
    showLogo:          { control: 'boolean', table: { defaultValue: { summary: 'true' } } },
    showMainNav:       { control: 'boolean', table: { defaultValue: { summary: 'true' } } },
    showSearch:        { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
    showThemeToggle:   { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
    showNotifications: { control: 'boolean', table: { defaultValue: { summary: 'true' } } },
    showCta:           { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
    showUserMenu:      { control: 'boolean', table: { defaultValue: { summary: 'true' } } },
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
type Story = StoryObj<KpHeaderComponent>;

export const Playground: Story = {
  args: {
    size: 'md',
    appearance: 'light',
    navItems: NAV,
    showSearch: true,
    showNotifications: true,
    notificationsCount: '3',
    showUserMenu: true,
    userName: 'Greg Black',
    userInitials: 'GB',
    userRole: 'Admin',
  },
};

export const Sizes: Story = {
  render: () => ({
    props: { nav: NAV },
    template: `
      <div style="background: var(--kp-color-gray-100);display:flex;flex-direction:column;gap:24px;padding:24px">
        <kp-header size="sm" [navItems]="nav" userName="Greg" userInitials="GB"/>
        <kp-header size="md" [navItems]="nav" userName="Greg Black" userRole="Admin" userInitials="GB" [showSearch]="true" notificationsCount="3"/>
        <kp-header size="lg" [navItems]="nav" userName="Greg Black" userRole="Admin" userInitials="GB" [showSearch]="true" notificationsCount="3"/>
      </div>
    `,
  }),
};

export const Appearances: Story = {
  render: () => ({
    props: { nav: NAV },
    template: `
      <div style="display:flex;flex-direction:column;gap:24px">
        <kp-header appearance="light" [navItems]="nav" userName="Greg Black" userRole="Admin" userInitials="GB" [showSearch]="true" notificationsCount="3"/>
        <kp-header appearance="dark"  [navItems]="nav" userName="Greg Black" userRole="Admin" userInitials="GB" [showSearch]="true" notificationsCount="3"/>
      </div>
    `,
  }),
};

export const Minimal: Story = {
  args: { showMainNav: false, showNotifications: false, showSearch: false, userName: 'GB', userInitials: 'GB' },
};

export const WithCTA: Story = {
  render: () => ({
    props: { nav: [
      { label: 'Product',  href: '#' },
      { label: 'Pricing',  href: '#' },
      { label: 'Docs',     href: '#' },
      { label: 'Blog',     href: '#' },
    ] },
    template: `
      <kp-header
        size="lg"
        [navItems]="nav"
        [showSearch]="false"
        [showNotifications]="false"
        [showUserMenu]="false"
        [showCta]="true"
        ctaLabel="Get started"
      />
    `,
  }),
};

export const SaaSApp: Story = {
  args: {
    size: 'md',
    navItems: NAV,
    showSearch: true,
    showThemeToggle: true,
    showNotifications: true,
    notificationsCount: '5',
    showUserMenu: true,
    userName: 'Greg Black',
    userInitials: 'GB',
    userRole: 'Admin',
    showUserStatus: true,
  },
};

export const AdminPanel: Story = {
  args: {
    size: 'md',
    navItems: NAV,
    showSearch: false,
    showNotifications: true,
    notificationsCount: '12',
    showUserMenu: true,
    userName: 'Greg Black',
    userInitials: 'GB',
    userRole: 'Admin',
  },
};
