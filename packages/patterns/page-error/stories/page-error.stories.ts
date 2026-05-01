import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { KpPageErrorComponent } from '../src/page-error.component';
import { KpButtonComponent } from '@kanso-protocol/button';

const meta: Meta<KpPageErrorComponent> = {
  title: 'Patterns/PageError',
  component: KpPageErrorComponent,
  decorators: [moduleMetadata({ imports: [KpButtonComponent] })],
  tags: ['autodocs'],
  argTypes: {
    type:          { control: 'inline-radio', options: ['404','500','offline','access-denied'], table: { defaultValue: { summary: '404' } } },
    showPrimary:   { control: 'boolean', table: { defaultValue: { summary: 'true' } } },
    showSecondary: { control: 'boolean', table: { defaultValue: { summary: 'true' } } },
  },
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<KpPageErrorComponent>;

const SHELL = (inner: string) => `
  <div style="background: var(--kp-color-white);min-height:600px;width:100%">
    ${inner}
  </div>
`;

export const NotFound: Story = {
  args: { type: '404' },
  render: (args) => ({
    props: args,
    template: SHELL(`
      <kp-page-error [type]="type">
        <kp-button kpPageErrorPrimary>Go home</kp-button>
        <kp-button kpPageErrorSecondary variant="ghost">Report broken link</kp-button>
      </kp-page-error>
    `),
  }),
};

export const ServerError: Story = {
  args: { type: '500' },
  render: (args) => ({
    props: args,
    template: SHELL(`
      <kp-page-error [type]="type">
        <kp-button kpPageErrorPrimary>Try again</kp-button>
        <kp-button kpPageErrorSecondary variant="ghost">Contact support</kp-button>
      </kp-page-error>
    `),
  }),
};

export const Offline: Story = {
  args: { type: 'offline' },
  render: (args) => ({
    props: args,
    template: SHELL(`
      <kp-page-error [type]="type">
        <kp-button kpPageErrorPrimary>Retry</kp-button>
        <kp-button kpPageErrorSecondary variant="ghost">Work offline</kp-button>
      </kp-page-error>
    `),
  }),
};

export const AccessDenied: Story = {
  args: { type: 'access-denied' },
  render: (args) => ({
    props: args,
    template: SHELL(`
      <kp-page-error [type]="type">
        <kp-button kpPageErrorPrimary>Request access</kp-button>
        <kp-button kpPageErrorSecondary variant="ghost">Go home</kp-button>
      </kp-page-error>
    `),
  }),
};

export const WithSupportId: Story = {
  render: () => ({
    template: SHELL(`
      <kp-page-error
        type="500"
        description="We're experiencing issues. Error ID: #A7F3B2"
      >
        <kp-button kpPageErrorPrimary>Try again</kp-button>
        <kp-button kpPageErrorSecondary variant="ghost">Contact support with ID</kp-button>
      </kp-page-error>
    `),
  }),
};

export const AccessDeniedPaywall: Story = {
  render: () => ({
    template: SHELL(`
      <kp-page-error
        type="access-denied"
        title="Team analytics is a Pro feature"
        description="This section is available on the Pro plan. Upgrade to access team analytics and advanced reporting."
      >
        <kp-button kpPageErrorPrimary>Upgrade plan</kp-button>
        <kp-button kpPageErrorSecondary variant="ghost">Go home</kp-button>
      </kp-page-error>
    `),
  }),
};
