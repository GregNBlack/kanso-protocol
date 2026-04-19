import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { KpFormFieldComponent } from '../src/form-field.component';
import { KpInputComponent } from '@kanso-protocol/input';
import { KpRadioComponent, KpRadioGroupComponent } from '@kanso-protocol/radio';

const meta: Meta<KpFormFieldComponent> = {
  title: 'Components/FormField',
  component: KpFormFieldComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [KpInputComponent, KpRadioComponent, KpRadioGroupComponent],
    }),
  ],
  argTypes: {
    label: { control: 'text' },
    helper: { control: 'text' },
    required: { control: 'select', options: ['none', 'optional', 'required-asterisk'] },
    showHelper: { control: 'boolean' },
    error: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<KpFormFieldComponent>;

export const Default: Story = {
  args: {
    label: 'Email',
    helper: "We'll never share it",
    required: 'none',
    showHelper: true,
    error: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <kp-form-field
        [label]="label"
        [helper]="helper"
        [required]="required"
        [showHelper]="showHelper"
        [error]="error">
        <kp-input placeholder="you@example.com"></kp-input>
      </kp-form-field>`,
  }),
};

export const RequiredModes: Story = {
  name: 'Required Modes',
  render: () => ({
    template: `
      <div style="display:flex;gap:40px;align-items:flex-start">
        <div style="display:flex;flex-direction:column;gap:20px;width:320px">
          <kp-form-field label="Email" helper="We'll never share it">
            <kp-input placeholder="you@example.com"></kp-input>
          </kp-form-field>
          <kp-form-field label="Middle name" required="optional" helper="Optional field example">
            <kp-input placeholder="Middle name"></kp-input>
          </kp-form-field>
          <kp-form-field label="Password" required="required-asterisk" helper="Required field example">
            <kp-input type="password" placeholder="••••••••"></kp-input>
          </kp-form-field>
        </div>
      </div>`,
  }),
};

export const States: Story = {
  name: 'States',
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:20px;width:320px">
        <kp-form-field label="Email" helper="Normal state">
          <kp-input placeholder="you@example.com"></kp-input>
        </kp-form-field>
        <kp-form-field label="Email" helper="Field has focus">
          <kp-input placeholder="you@example.com" forceState="focus"></kp-input>
        </kp-form-field>
        <kp-form-field label="Email" [error]="true" helper="Please enter a valid email">
          <kp-input placeholder="not-an-email" forceState="error"></kp-input>
        </kp-form-field>
        <kp-form-field label="Email" [disabled]="true" helper="Field is disabled">
          <kp-input placeholder="you@example.com" forceState="disabled"></kp-input>
        </kp-form-field>
      </div>`,
  }),
};

export const WithoutHelper: Story = {
  name: 'Without Helper',
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:32px;width:320px">
        <kp-form-field label="Compact label" [showHelper]="false">
          <kp-input placeholder="No helper text here"></kp-input>
        </kp-form-field>
        <kp-form-field label="With helper" helper="Just for comparison">
          <kp-input placeholder="Has helper below"></kp-input>
        </kp-form-field>
      </div>`,
  }),
};

export const DifferentControls: Story = {
  name: 'Different Controls',
  render: () => ({
    props: { selectedOption: 'b' },
    template: `
      <div style="display:flex;flex-direction:column;gap:20px;width:320px">
        <kp-form-field label="Name" helper="Standard input">
          <kp-input placeholder="John Doe"></kp-input>
        </kp-form-field>
        <kp-form-field label="Choose one" helper="Pick exactly one option">
          <kp-radio-group [(value)]="selectedOption">
            <kp-radio value="a">Option A</kp-radio>
            <kp-radio value="b">Option B</kp-radio>
            <kp-radio value="c">Option C</kp-radio>
          </kp-radio-group>
        </kp-form-field>
      </div>`,
  }),
};

export const Sizes: Story = {
  name: 'Sizes',
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:20px;width:320px">
        <kp-form-field label="Small field" helper="Compact size">
          <kp-input size="sm" placeholder="SM input"></kp-input>
        </kp-form-field>
        <kp-form-field label="Medium field (default)" helper="Standard size">
          <kp-input size="md" placeholder="MD input"></kp-input>
        </kp-form-field>
        <kp-form-field label="Large field" helper="Larger size for emphasis">
          <kp-input size="lg" placeholder="LG input"></kp-input>
        </kp-form-field>
      </div>`,
  }),
};
