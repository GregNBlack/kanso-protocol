import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { KpUserMenuComponent } from '../src/user-menu.component';
import { KpAvatarComponent } from '@kanso-protocol/avatar';

const meta: Meta<KpUserMenuComponent> = {
  title: 'Patterns/UserMenu',
  component: KpUserMenuComponent,
  decorators: [moduleMetadata({ imports: [KpAvatarComponent] })],
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'inline-radio', options: ['sm','md'], table: { defaultValue: { summary: 'md' } } },
  },
  parameters: { layout: 'centered' },
};
export default meta;
type Story = StoryObj<KpUserMenuComponent>;

const ROW = (icon: string, label: string) => `
  <button style="all:unset;display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:6px;font-size:13px;color: var(--kp-color-gray-700);cursor:pointer;font-family:Onest,system-ui,sans-serif" onmouseover="this.style.background='#F4F4F5'" onmouseout="this.style.background='transparent'">
    <span style="display:inline-flex;width:16px;height:16px;color: var(--kp-color-gray-500)">
      ${icon}
    </span>
    <span>${label}</span>
  </button>
`;

const USER_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>';
const SETTINGS_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';
const CARD_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/></svg>';
const USERS_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="7" r="4"/><path d="M1 21a8 8 0 0 1 16 0M16 3.13a4 4 0 0 1 0 7.75M23 21a8 8 0 0 0-4.45-7.15"/></svg>';
const HELP_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 0 1 6 0c0 2-3 3-3 3M12 17h.01"/></svg>';
const MSG_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9 8.5 8.5 0 0 1 8.5 8.5z"/></svg>';

const ITEMS = `
  <div kpUserMenuItems style="display:flex;flex-direction:column">
    ${ROW(USER_ICON, 'Profile')}
    ${ROW(SETTINGS_ICON, 'Settings')}
    ${ROW(CARD_ICON, 'Billing')}
    ${ROW(USERS_ICON, 'Team')}
  </div>
`;

const HELP = `
  <div kpUserMenuHelp style="display:flex;flex-direction:column">
    ${ROW(HELP_ICON, 'Help & documentation')}
    ${ROW(MSG_ICON, 'Send feedback')}
  </div>
`;

export const Playground: Story = {
  args: { size: 'md' },
  render: (args) => ({
    props: args,
    template: `<kp-user-menu [size]="size" [showEmail]="showEmail" [showPlanBadge]="showPlanBadge" [showThemeToggle]="showThemeToggle" [showHelpLink]="showHelpLink">${ITEMS}${HELP}</kp-user-menu>`,
  }),
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display:flex;gap:24px;align-items:flex-start">
        <kp-user-menu size="sm">${ITEMS}${HELP}</kp-user-menu>
        <kp-user-menu size="md">${ITEMS}${HELP}</kp-user-menu>
      </div>
    `,
  }),
};

export const WithPlanBadge: Story = {
  args: { showPlanBadge: true, planName: 'Pro' },
  render: (args) => ({
    props: args,
    template: `<kp-user-menu [showPlanBadge]="showPlanBadge" [planName]="planName">${ITEMS}${HELP}</kp-user-menu>`,
  }),
};

export const Minimal: Story = {
  args: { showEmail: false, showHelpLink: false },
  render: (args) => ({
    props: args,
    template: `<kp-user-menu [showEmail]="showEmail" [showHelpLink]="showHelpLink">${ITEMS}</kp-user-menu>`,
  }),
};
