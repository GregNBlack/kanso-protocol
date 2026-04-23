import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { KpSidebarComponent, KpSidebarSection } from '../src/sidebar.component';
import { KpAvatarComponent } from '@kanso-protocol/avatar';
import { KpNavItemComponent } from '@kanso-protocol/nav-item';

const SECTIONS: KpSidebarSection[] = [
  {
    label: 'Main',
    items: [
      { label: 'Dashboard', active: true },
      { label: 'Projects', children: [
        { label: 'Active' },
        { label: 'Archived' },
      ], expanded: true },
      { label: 'Team', badge: '12' },
      { label: 'Documents' },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { label: 'Analytics' },
      { label: 'Reports' },
      { label: 'Integrations', badge: 'New' },
    ],
  },
  {
    label: 'Settings',
    items: [
      { label: 'Settings' },
      { label: 'Help' },
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
  parameters: { layout: 'fullscreen' },
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
