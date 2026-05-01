import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { KpFormSectionComponent } from '../src/form-section.component';
import { KpDividerComponent } from '@kanso-protocol/divider';
import { KpFormFieldComponent } from '@kanso-protocol/form-field';
import { KpInputComponent } from '@kanso-protocol/input';
import { KpButtonComponent } from '@kanso-protocol/button';

const meta: Meta<KpFormSectionComponent> = {
  title: 'Patterns/FormSection',
  component: KpFormSectionComponent,
  decorators: [moduleMetadata({ imports: [KpDividerComponent, KpFormFieldComponent, KpInputComponent, KpButtonComponent] })],
  tags: ['autodocs'],
  argTypes: {
    layout:          { control: 'inline-radio', options: ['inline', 'stacked'], table: { defaultValue: { summary: 'inline' } } },
    size:            { control: 'inline-radio', options: ['sm', 'md', 'lg'],    table: { defaultValue: { summary: 'md' } } },
    showDescription: { control: 'boolean', table: { defaultValue: { summary: 'true' } } },
    showDivider:     { control: 'boolean', table: { defaultValue: { summary: 'true' } } },
  },
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<KpFormSectionComponent>;

const PERSONAL_FIELDS = `
  <kp-form-field label="First name"><kp-input placeholder="Greg"/></kp-form-field>
  <kp-form-field label="Last name"><kp-input placeholder="Black"/></kp-form-field>
  <kp-form-field label="Email"><kp-input type="email" placeholder="greg@example.com"/></kp-form-field>
`;

export const Playground: Story = {
  args: {
    layout: 'inline',
    size: 'md',
    title: 'Personal information',
    description: 'This information will be displayed publicly so be careful what you share.',
    showDescription: true,
    showDivider: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="padding:24px;width:100%;box-sizing:border-box;max-width:1100px">
        <kp-form-section
          [layout]="layout"
          [size]="size"
          [title]="title"
          [description]="description"
          [showDescription]="showDescription"
          [showDivider]="showDivider">
          ${PERSONAL_FIELDS}
        </kp-form-section>
      </div>
    `,
  }),
};

export const Layouts: Story = {
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:48px;padding:24px;width:100%;box-sizing:border-box;max-width:1100px">
        <kp-form-section layout="inline"
                         title="Personal information"
                         description="This information will be displayed publicly so be careful what you share.">
          ${PERSONAL_FIELDS}
        </kp-form-section>
        <kp-form-section layout="stacked"
                         title="Personal information"
                         description="This information will be displayed publicly so be careful what you share.">
          ${PERSONAL_FIELDS}
        </kp-form-section>
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:48px;padding:24px;width:100%;box-sizing:border-box;max-width:1100px">
        <kp-form-section size="sm" title="Small section" description="Tighter spacing, smaller title.">
          ${PERSONAL_FIELDS}
        </kp-form-section>
        <kp-form-section size="md" title="Medium section" description="Default size for most form pages.">
          ${PERSONAL_FIELDS}
        </kp-form-section>
        <kp-form-section size="lg" title="Large section" description="Bigger title and gap — good for hero forms or onboarding.">
          ${PERSONAL_FIELDS}
        </kp-form-section>
      </div>
    `,
  }),
};

export const ProfileSettings: Story = {
  name: 'Use Case — Profile Settings',
  render: () => ({
    template: `
      <div style="padding:32px;width:100%;box-sizing:border-box;max-width:1100px">
        <h2 style="margin:0 0 24px;font:600 24px Onest;color: var(--kp-color-gray-900)">Profile</h2>

        <kp-form-section title="Personal information"
                         description="This information will be displayed publicly so be careful what you share.">
          <kp-form-field label="Full name"><kp-input placeholder="Greg Black"/></kp-form-field>
          <kp-form-field label="Email"><kp-input type="email" placeholder="greg@example.com"/></kp-form-field>
          <kp-form-field label="Phone" helper="Used for 2FA only"><kp-input type="tel" placeholder="+1 555 0100"/></kp-form-field>
        </kp-form-section>

        <kp-form-section title="Address"
                         description="Used for billing and shipping. Never displayed publicly.">
          <kp-form-field label="Country"><kp-input placeholder="United States"/></kp-form-field>
          <kp-form-field label="Street"><kp-input placeholder="123 Market St"/></kp-form-field>
          <kp-form-field label="City"><kp-input placeholder="San Francisco"/></kp-form-field>
          <kp-form-field label="ZIP code"><kp-input placeholder="94103"/></kp-form-field>
        </kp-form-section>

        <kp-form-section title="Preferences"
                         description="Personalise how the app feels and behaves."
                         [showDivider]="false">
          <kp-form-field label="Language"><kp-input placeholder="English (US)"/></kp-form-field>
          <kp-form-field label="Timezone"><kp-input placeholder="America/Los_Angeles"/></kp-form-field>
          <kp-form-field label="Theme"><kp-input placeholder="Light"/></kp-form-field>
        </kp-form-section>

        <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:24px">
          <kp-button variant="ghost" color="neutral" size="sm">
            <span>Cancel</span>
          </kp-button>
          <kp-button variant="default" color="primary" size="sm">
            <span>Save changes</span>
          </kp-button>
        </div>
      </div>
    `,
  }),
};

export const OnboardingWizard: Story = {
  name: 'Use Case — Onboarding Wizard',
  render: () => ({
    template: `
      <div style="padding:48px;width:100%;box-sizing:border-box;max-width:760px;margin:0 auto">
        <kp-form-section layout="stacked" size="lg"
                         title="Tell us about yourself"
                         description="We'll use this to personalise your workspace. You can always change it later."
                         [showDivider]="false">
          <kp-form-field label="Full name"><kp-input placeholder="Greg Black"/></kp-form-field>
          <kp-form-field label="Work email"><kp-input type="email" placeholder="greg@company.com"/></kp-form-field>
          <kp-form-field label="Company"><kp-input placeholder="Acme Inc."/></kp-form-field>
          <kp-form-field label="Role"><kp-input placeholder="Product Designer"/></kp-form-field>
          <kp-form-field label="Team size" helper="Helps us recommend the right plan."><kp-input placeholder="10–50"/></kp-form-field>
        </kp-form-section>

        <div style="display:flex;justify-content:space-between;margin-top:32px">
          <kp-button variant="ghost" color="neutral" size="md"><span>Back</span></kp-button>
          <kp-button variant="default" color="primary" size="md"><span>Continue</span></kp-button>
        </div>
      </div>
    `,
  }),
};
