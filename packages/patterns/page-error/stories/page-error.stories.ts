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
        <button kpButton kpPageErrorPrimary>Go home</button>
        <button kpButton kpPageErrorSecondary variant="ghost">Report broken link</button>
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
        <button kpButton kpPageErrorPrimary>Try again</button>
        <button kpButton kpPageErrorSecondary variant="ghost">Contact support</button>
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
        <button kpButton kpPageErrorPrimary>Retry</button>
        <button kpButton kpPageErrorSecondary variant="ghost">Work offline</button>
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
        <button kpButton kpPageErrorPrimary>Request access</button>
        <button kpButton kpPageErrorSecondary variant="ghost">Go home</button>
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
        <button kpButton kpPageErrorPrimary>Try again</button>
        <button kpButton kpPageErrorSecondary variant="ghost">Contact support with ID</button>
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
        <button kpButton kpPageErrorPrimary>Upgrade plan</button>
        <button kpButton kpPageErrorSecondary variant="ghost">Go home</button>
      </kp-page-error>
    `),
  }),
};
