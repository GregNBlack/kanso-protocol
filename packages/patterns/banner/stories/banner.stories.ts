import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { KpBannerComponent } from '../src/banner.component';
import { KpButtonComponent } from '@kanso-protocol/button';

const meta: Meta<KpBannerComponent> = {
  title: 'Patterns/Banner',
  component: KpBannerComponent,
  decorators: [moduleMetadata({ imports: [KpButtonComponent] })],
  tags: ['autodocs'],
  argTypes: {
    color:       { control: 'inline-radio', options: ['primary','success','warning','danger','info','neutral'], table: { defaultValue: { summary: 'primary' } } },
    size:        { control: 'inline-radio', options: ['sm','md'], table: { defaultValue: { summary: 'md' } } },
    showIcon:    { control: 'boolean', table: { defaultValue: { summary: 'true' } } },
    showClose:   { control: 'boolean', table: { defaultValue: { summary: 'true' } } },
  },
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<KpBannerComponent>;

export const Playground: Story = {
  args: { color: 'primary', size: 'md', title: 'Global notification message', showIcon: true, showClose: true },
};

export const Appearances: Story = {
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column">
        <kp-banner color="primary" title="🎉 New feature: AI-powered search is now available!"/>
        <kp-banner color="success" title="Changes saved. Your profile is up to date."/>
        <kp-banner color="warning" title="Your trial ends in 3 days"/>
        <kp-banner color="danger"  title="Payment failed — update your card to avoid interruption"/>
        <kp-banner color="info"    title="Scheduled maintenance Saturday 2–4 AM UTC"/>
        <kp-banner color="neutral" title="We've updated our terms of service"/>
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column">
        <kp-banner size="sm" color="warning" title="Small banner — compact padding, smaller text"/>
        <kp-banner size="md" color="warning" title="Medium banner — default size"/>
      </div>
    `,
  }),
};

export const WithAction: Story = {
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column">
        <kp-banner color="warning" title="Your trial ends in 3 days">
          <kp-button kpBannerAction size="sm">Upgrade now</kp-button>
        </kp-banner>
        <kp-banner color="danger" title="Payment failed">
          <kp-button kpBannerAction size="sm" color="danger">Fix now</kp-button>
        </kp-banner>
        <kp-banner color="info" title="New feature — AI-powered search">
          <kp-button kpBannerAction size="sm" variant="outline">Learn more</kp-button>
        </kp-banner>
      </div>
    `,
  }),
};
