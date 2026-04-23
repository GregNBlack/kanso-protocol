import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { KpSettingsPanelComponent } from '../src/settings-panel.component';
import { KpSettingsRowComponent } from '../src/settings-row.component';
import { KpToggleComponent } from '@kanso-protocol/toggle';
import { KpSelectComponent } from '@kanso-protocol/select';
import { KpInputComponent } from '@kanso-protocol/input';
import { KpButtonComponent } from '@kanso-protocol/button';
import { KpBadgeComponent } from '@kanso-protocol/badge';

const meta: Meta<KpSettingsPanelComponent> = {
  title: 'Patterns/SettingsPanel',
  component: KpSettingsPanelComponent,
  decorators: [moduleMetadata({ imports: [
    KpSettingsRowComponent, KpToggleComponent, KpSelectComponent, KpInputComponent, KpButtonComponent, KpBadgeComponent,
  ] })],
  tags: ['autodocs'],
  argTypes: {
    size:            { control: 'inline-radio', options: ['sm','md','lg'], table: { defaultValue: { summary: 'md' } } },
    showHeader:      { control: 'boolean', table: { defaultValue: { summary: 'true' } } },
    showDescription: { control: 'boolean', table: { defaultValue: { summary: 'true' } } },
    showOuterBorder: { control: 'boolean', table: { defaultValue: { summary: 'true' } } },
  },
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<KpSettingsPanelComponent>;

const PANEL_FRAME = (inner: string) => `
  <div style="padding:24px;width:100%;box-sizing:border-box;max-width:760px">
    ${inner}
  </div>
`;

export const Playground: Story = {
  args: {
    size: 'md',
    title: 'Notifications',
    description: 'Manage how you receive updates and alerts.',
    showHeader: true,
    showDescription: true,
    showOuterBorder: true,
  },
  render: (args) => ({
    props: args,
    template: PANEL_FRAME(`
      <kp-settings-panel
        [size]="size"
        [title]="title"
        [description]="description"
        [showHeader]="showHeader"
        [showDescription]="showDescription"
        [showOuterBorder]="showOuterBorder">
        <kp-settings-row title="Email notifications"
                         description="Receive an email when something important happens.">
          <kp-toggle [on]="true"/>
        </kp-settings-row>
        <kp-settings-row title="Push notifications"
                         description="Browser push for mentions and direct messages.">
          <kp-toggle [on]="false"/>
        </kp-settings-row>
        <kp-settings-row title="Weekly digest"
                         description="Summary of your activity every Monday morning."
                         [showDivider]="false">
          <kp-toggle [on]="true"/>
        </kp-settings-row>
      </kp-settings-panel>
    `),
  }),
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:32px;padding:24px;width:100%;box-sizing:border-box;max-width:760px">
        <kp-settings-panel size="sm" title="Small" description="Compact rows, smaller text.">
          <kp-settings-row title="Email notifications"><kp-toggle [on]="true"/></kp-settings-row>
          <kp-settings-row title="Push notifications" [showDivider]="false"><kp-toggle [on]="false"/></kp-settings-row>
        </kp-settings-panel>
        <kp-settings-panel size="md" title="Medium" description="The default density.">
          <kp-settings-row title="Email notifications"><kp-toggle [on]="true"/></kp-settings-row>
          <kp-settings-row title="Push notifications" [showDivider]="false"><kp-toggle [on]="false"/></kp-settings-row>
        </kp-settings-panel>
        <kp-settings-panel size="lg" title="Large" description="Bigger title and row padding.">
          <kp-settings-row title="Email notifications"><kp-toggle [on]="true"/></kp-settings-row>
          <kp-settings-row title="Push notifications" [showDivider]="false"><kp-toggle [on]="false"/></kp-settings-row>
        </kp-settings-panel>
      </div>
    `,
  }),
};

export const ControlTypes: Story = {
  render: () => ({
    template: PANEL_FRAME(`
      <kp-settings-panel title="Account" description="A row for every kind of control.">
        <kp-settings-row title="Dark mode"
                         description="Use the dark theme everywhere in the app.">
          <kp-toggle [on]="true"/>
        </kp-settings-row>
        <kp-settings-row title="Language"
                         description="The interface language across the workspace.">
          <kp-select placeholder="English (US)" [options]="[]" style="width:200px"/>
        </kp-settings-row>
        <kp-settings-row title="Display name"
                         description="Shown next to your avatar in shared views.">
          <kp-input placeholder="Greg Black" style="width:240px"/>
        </kp-settings-row>
        <kp-settings-row title="Subscription"
                         description="Active until 23 Apr 2027.">
          <kp-badge color="primary" appearance="filled" pill>Pro</kp-badge>
        </kp-settings-row>
        <kp-settings-row title="Delete account"
                         description="Permanently remove your account and all data."
                         [showDivider]="false">
          <kp-button variant="outline" color="danger" size="sm">
            <span>Delete</span>
          </kp-button>
        </kp-settings-row>
      </kp-settings-panel>
    `),
  }),
};

export const NotificationsSettings: Story = {
  name: 'Use Case — Notifications',
  render: () => ({
    template: PANEL_FRAME(`
      <kp-settings-panel title="Notifications"
                         description="Choose where and when we ping you.">
        <kp-settings-row title="Email notifications"
                         description="A digest of mentions and replies, sent immediately.">
          <kp-toggle [on]="true"/>
        </kp-settings-row>
        <kp-settings-row title="Push notifications"
                         description="Browser push for direct messages and mentions.">
          <kp-toggle [on]="true"/>
        </kp-settings-row>
        <kp-settings-row title="Weekly digest"
                         description="Summary of your week, every Monday at 8 AM.">
          <kp-toggle [on]="false"/>
        </kp-settings-row>
        <kp-settings-row title="Notification frequency"
                         description="How often we batch notifications when you're active."
                         [showDivider]="false">
          <kp-select placeholder="Immediately" [options]="[]" style="width:200px"/>
        </kp-settings-row>
      </kp-settings-panel>
    `),
  }),
};

export const PrivacySettings: Story = {
  name: 'Use Case — Privacy',
  render: () => ({
    template: PANEL_FRAME(`
      <kp-settings-panel title="Privacy"
                         description="Decide what other people can see and do.">
        <kp-settings-row title="Profile visibility"
                         description="Who can see your profile and activity.">
          <kp-select placeholder="Workspace only" [options]="[]" style="width:200px"/>
        </kp-settings-row>
        <kp-settings-row title="Show online status"
                         description="Teammates see a green dot when you're active.">
          <kp-toggle [on]="true"/>
        </kp-settings-row>
        <kp-settings-row title="Allow indexing"
                         description="Let search engines index your public profile.">
          <kp-toggle [on]="false"/>
        </kp-settings-row>
        <kp-settings-row title="Two-factor authentication"
                         description="Required since 12 Jan 2026.">
          <kp-badge color="success" appearance="subtle" pill>Enabled</kp-badge>
        </kp-settings-row>
        <kp-settings-row title="Active sessions"
                         description="3 devices currently signed in."
                         [showDivider]="false">
          <kp-button variant="outline" size="sm"><span>Manage</span></kp-button>
        </kp-settings-row>
      </kp-settings-panel>
    `),
  }),
};
