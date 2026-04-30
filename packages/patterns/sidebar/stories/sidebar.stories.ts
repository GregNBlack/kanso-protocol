import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { KpSidebarComponent, KpSidebarSection } from '../src/sidebar.component';
import { KpAvatarComponent } from '@kanso-protocol/avatar';
import { KpNavItemComponent } from '@kanso-protocol/nav-item';

const SECTIONS: KpSidebarSection[] = [
  {
    label: 'Main',
    items: [
      { label: 'Dashboard', icon: 'layout-dashboard', active: true },
      { label: 'Projects', icon: 'folder', children: [
        { label: 'Active' },
        { label: 'Archived' },
      ], expanded: true },
      { label: 'Team', icon: 'users', badge: '12' },
      { label: 'Documents', icon: 'file-text' },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { label: 'Analytics', icon: 'chart-bar' },
      { label: 'Reports', icon: 'chart-infographic' },
      { label: 'Integrations', icon: 'plug', badge: 'New' },
    ],
  },
  {
    label: 'Settings',
    items: [
      { label: 'Settings', icon: 'settings' },
      { label: 'Help', icon: 'help-circle' },
    ],
  },
];

const meta: Meta<KpSidebarComponent> = {
  title: 'Patterns/Sidebar',
  component: KpSidebarComponent,
  decorators: [moduleMetadata({ imports: [KpAvatarComponent, KpNavItemComponent] })],
  tags: ['autodocs'],
  argTypes: {
    widthState:        { control: 'inline-radio', options: ['expanded','collapsed'], table: { defaultValue: { summary: 'expanded' } } },
    appearance:        { control: 'inline-radio', options: ['light','dark'], table: { defaultValue: { summary: 'light' } } },
    showLogo:          { control: 'boolean', table: { defaultValue: { summary: 'true' } } },
    showSearch:        { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
    showSectionLabels: { control: 'boolean', table: { defaultValue: { summary: 'true' } } },
    showUserFooter:    { control: 'boolean', table: { defaultValue: { summary: 'true' } } },
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
type Story = StoryObj<KpSidebarComponent>;

export const Playground: Story = {
  args: {
    widthState: 'expanded',
    appearance: 'light',
    sections: SECTIONS,
    userName: 'Greg Black',
    userEmail: 'greg@example.com',
    userInitials: 'GB',
  },
};

export const States: Story = {
  render: () => ({
    props: { sections: SECTIONS },
    template: `
      <div style="display:flex;gap:24px;padding:24px;background:#F4F4F5;min-height:100vh">
        <kp-sidebar [sections]="sections" widthState="expanded" userName="Greg Black" userEmail="greg@example.com" userInitials="GB"/>
        <kp-sidebar [sections]="sections" widthState="collapsed" userInitials="GB"/>
      </div>
    `,
  }),
};

export const DarkVariant: Story = {
  args: { widthState: 'expanded', appearance: 'dark', sections: SECTIONS, userName: 'Greg Black', userEmail: 'greg@example.com', userInitials: 'GB' },
};

export const WithContext: Story = {
  render: () => ({
    props: { sections: SECTIONS },
    template: `
      <div style="display:flex;min-height:100vh;background:#F4F4F5">
        <kp-sidebar [sections]="sections" userName="Greg Black" userEmail="greg@example.com" userInitials="GB"/>
        <div style="flex:1;padding:40px;font-family:Onest,system-ui,sans-serif">
          <div style="background:#fff;border:1px solid #E4E4E7;border-radius:16px;padding:40px;min-height:400px">
            <h1 style="margin:0 0 12px 0;font-size:24px;font-weight:600;color:#18181B">Dashboard</h1>
            <p style="margin:0;color:#71717A">Main content area sits next to the sidebar.</p>
          </div>
        </div>
      </div>
    `,
  }),
};
