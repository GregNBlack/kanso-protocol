import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { KpTabsComponent } from '../src/tabs.component';
import { KpTabComponent } from '../src/tab.component';
import { KpBadgeComponent } from '@kanso-protocol/badge';

const meta: Meta<KpTabsComponent> = {
  title: 'Components/Tabs',
  component: KpTabsComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [KpTabComponent, KpBadgeComponent] })],
  argTypes: {
    size:      { control: 'inline-radio', options: ['sm', 'md', 'lg'], table: { defaultValue: { summary: 'md' } } },
    fullWidth: { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
  },
};
export default meta;
type Story = StoryObj<KpTabsComponent>;

const star = `<svg kpTabIcon viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 2 L15.1 8.3 L22 9.3 L17 14.1 L18.2 21 L12 17.75 L5.8 21 L7 14.1 L2 9.3 L8.9 8.3 Z"/>
</svg>`;

export const Default: Story = {
  args: { size: 'md', fullWidth: false },
  render: (args) => ({
    props: { ...args, tab: 'overview', select: (v: string) => undefined },
    template: `
      <kp-tabs [size]="size" [fullWidth]="fullWidth">
        <button kpTab label="Overview" [selected]="tab === 'overview'" (selectedChange)="tab = 'overview'"></button>
        <button kpTab label="Activity" [selected]="tab === 'activity'" (selectedChange)="tab = 'activity'"></button>
        <button kpTab label="Settings" [selected]="tab === 'settings'" (selectedChange)="tab = 'settings'"></button>
      </kp-tabs>`,
  }),
};

export const Sizes: Story = {
  render: () => ({
    props: { tab: 'overview' },
    template: `
      <div style="display:flex;flex-direction:column;gap:24px">
        <div>
          <kp-tabs size="sm">
            <button kpTab label="Overview" [selected]="tab === 'overview'" (selectedChange)="tab = 'overview'"></button>
            <button kpTab label="Activity" [selected]="tab === 'activity'" (selectedChange)="tab = 'activity'"></button>
            <button kpTab label="Settings" [selected]="tab === 'settings'" (selectedChange)="tab = 'settings'"></button>
          </kp-tabs>
          <span style="font-size:11px;color: var(--kp-color-gray-600);margin-top:8px;display:block">Small</span>
        </div>
        <div>
          <kp-tabs size="md">
            <button kpTab label="Overview" [selected]="tab === 'overview'" (selectedChange)="tab = 'overview'"></button>
            <button kpTab label="Activity" [selected]="tab === 'activity'" (selectedChange)="tab = 'activity'"></button>
            <button kpTab label="Settings" [selected]="tab === 'settings'" (selectedChange)="tab = 'settings'"></button>
          </kp-tabs>
          <span style="font-size:11px;color: var(--kp-color-gray-600);margin-top:8px;display:block">Medium (default)</span>
        </div>
        <div>
          <kp-tabs size="lg">
            <button kpTab label="Overview" [selected]="tab === 'overview'" (selectedChange)="tab = 'overview'"></button>
            <button kpTab label="Activity" [selected]="tab === 'activity'" (selectedChange)="tab = 'activity'"></button>
            <button kpTab label="Settings" [selected]="tab === 'settings'" (selectedChange)="tab = 'settings'"></button>
          </kp-tabs>
          <span style="font-size:11px;color: var(--kp-color-gray-600);margin-top:8px;display:block">Large</span>
        </div>
      </div>`,
  }),
};

export const TabContent: Story = {
  name: 'Tab Content',
  render: () => ({
    props: { tab: 'overview' },
    template: `
      <div style="display:flex;flex-direction:column;gap:16px">
        <kp-tabs>
          <button kpTab label="Overview" [selected]="tab === 'overview'" (selectedChange)="tab = 'overview'"></button>
          <button kpTab label="Activity" [selected]="tab === 'activity'" (selectedChange)="tab = 'activity'"></button>
          <button kpTab label="Settings" [selected]="tab === 'settings'" (selectedChange)="tab = 'settings'"></button>
        </kp-tabs>

        <kp-tabs>
          <button kpTab label="Overview" [selected]="tab === 'overview'" (selectedChange)="tab = 'overview'">${star}</button>
          <button kpTab label="Activity" [selected]="tab === 'activity'" (selectedChange)="tab = 'activity'">${star}</button>
          <button kpTab label="Settings" [selected]="tab === 'settings'" (selectedChange)="tab = 'settings'">${star}</button>
        </kp-tabs>

        <kp-tabs>
          <button kpTab label="Inbox"    [selected]="tab === 'inbox'"   (selectedChange)="tab = 'inbox'">
            <kp-badge kpTabBadge size="xs" [pill]="true" appearance="subtle" color="neutral">12</kp-badge>
          </button>
          <button kpTab label="Unread"   [selected]="tab === 'unread'"  (selectedChange)="tab = 'unread'">
            <kp-badge kpTabBadge size="xs" [pill]="true" color="primary">3</kp-badge>
          </button>
          <button kpTab label="Archived" [selected]="tab === 'archived'"(selectedChange)="tab = 'archived'">
            <kp-badge kpTabBadge size="xs" [pill]="true" appearance="subtle" color="neutral">24</kp-badge>
          </button>
        </kp-tabs>

        <kp-tabs>
          <button kpTab label="Messages"      [selected]="tab === 'msg'"   (selectedChange)="tab = 'msg'">
            ${star}
            <kp-badge kpTabBadge size="xs" [pill]="true" appearance="subtle" color="neutral">5</kp-badge>
          </button>
          <button kpTab label="Notifications" [selected]="tab === 'notif'" (selectedChange)="tab = 'notif'">
            ${star}
            <kp-badge kpTabBadge size="xs" [pill]="true" appearance="subtle" color="neutral">12</kp-badge>
          </button>
          <button kpTab label="Alerts"        [selected]="tab === 'alerts'"(selectedChange)="tab = 'alerts'">
            ${star}
            <kp-badge kpTabBadge size="xs" [pill]="true" color="danger">1</kp-badge>
          </button>
        </kp-tabs>
      </div>`,
  }),
};

export const States: Story = {
  render: () => ({
    template: `
      <kp-tabs>
        <button kpTab label="Default"></button>
        <button kpTab label="Selected" [selected]="true"></button>
        <button kpTab label="Disabled" [disabled]="true"></button>
      </kp-tabs>
      <p style="font-size:11px;color: var(--kp-color-gray-600);margin:8px 0 0 0">Hover + focus states are interactive — move the mouse over "Default" or tab into it.</p>`,
  }),
};

export const Layout: Story = {
  render: () => ({
    props: { tab: 'overview' },
    template: `
      <div style="display:flex;flex-direction:column;gap:24px">
        <kp-tabs>
          <button kpTab label="Overview" [selected]="tab === 'overview'" (selectedChange)="tab = 'overview'"></button>
          <button kpTab label="Details"  [selected]="tab === 'details'"  (selectedChange)="tab = 'details'"></button>
          <button kpTab label="Billing"  [selected]="tab === 'billing'"  (selectedChange)="tab = 'billing'"></button>
          <button kpTab label="Team"     [selected]="tab === 'team'"     (selectedChange)="tab = 'team'"></button>
        </kp-tabs>

        <div style="width:600px">
          <kp-tabs [fullWidth]="true">
            <button kpTab label="Overview" [selected]="tab === 'overview'" (selectedChange)="tab = 'overview'"></button>
            <button kpTab label="Details"  [selected]="tab === 'details'"  (selectedChange)="tab = 'details'"></button>
            <button kpTab label="Billing"  [selected]="tab === 'billing'"  (selectedChange)="tab = 'billing'"></button>
            <button kpTab label="Team"     [selected]="tab === 'team'"     (selectedChange)="tab = 'team'"></button>
          </kp-tabs>
        </div>
      </div>`,
  }),
};

export const Overflow: Story = {
  render: () => ({
    props: { tab: 'overview' },
    template: `
      <kp-tabs>
        <button kpTab label="Overview" [selected]="tab === 'overview'" (selectedChange)="tab = 'overview'"></button>
        <button kpTab label="Activity" [selected]="tab === 'activity'" (selectedChange)="tab = 'activity'"></button>
        <button kpTab label="Settings" [selected]="tab === 'settings'" (selectedChange)="tab = 'settings'"></button>
        <button kpTab label="Team"     [selected]="tab === 'team'"     (selectedChange)="tab = 'team'"></button>
        <button kpTabsMore style="all:unset;display:inline-flex;align-items:center;gap:4px;padding:0 16px;font-family:Onest,system-ui,sans-serif;font-weight:500;font-size:14px;color: var(--kp-color-gray-600);cursor:pointer">
          More
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </button>
      </kp-tabs>`,
  }),
};
