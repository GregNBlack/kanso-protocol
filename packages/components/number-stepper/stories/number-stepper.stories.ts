import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { KpNumberStepperComponent } from '../src/number-stepper.component';
import { KpFormFieldComponent } from '@kanso-protocol/form-field';

const meta: Meta<KpNumberStepperComponent> = {
  title: 'Components/NumberStepper',
  component: KpNumberStepperComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({ imports: [FormsModule, KpFormFieldComponent] }),
  ],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      table: { defaultValue: { summary: 'md' } },
    },
    min: {
      control: 'number',
      type: { name: 'number', required: false },
      description: 'Minimum allowed value (leave empty for no minimum)',
    },
    max: {
      control: 'number',
      type: { name: 'number', required: false },
      description: 'Maximum allowed value (leave empty for no maximum)',
    },
    step: {
      control: 'number',
      type: { name: 'number', required: false },
      table: { defaultValue: { summary: '1' } },
    },
    prefix: { control: 'text', type: { name: 'string', required: false } },
    suffix: { control: 'text', type: { name: 'string', required: false } },
    ariaLabel: { control: 'text', type: { name: 'string', required: false } },
    disabled: { control: 'boolean' },
    forceState: {
      control: 'select',
      options: [null, 'rest', 'hover', 'active', 'focus', 'disabled', 'error'],
    },
  },
};
export default meta;
type Story = StoryObj<KpNumberStepperComponent>;

export const Default: Story = {
  args: { size: 'md', step: 1 },
  render: (args) => ({
    props: { ...args, value: 1 },
    template: `<kp-number-stepper [(ngModel)]="value" [size]="size" [min]="min" [max]="max" [step]="step" [prefix]="prefix" [suffix]="suffix" [disabled]="disabled" [forceState]="forceState"></kp-number-stepper>`,
  }),
};

export const Sizes: Story = {
  render: () => ({
    props: { v1: 1, v2: 1, v3: 1, v4: 1, v5: 1 },
    template: `
      <div style="display:flex;align-items:flex-start;gap:24px">
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px"><kp-number-stepper size="xs" [(ngModel)]="v1"></kp-number-stepper><span style="font-size:11px;color: var(--kp-color-gray-500)">xs · 24px</span></div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px"><kp-number-stepper size="sm" [(ngModel)]="v2"></kp-number-stepper><span style="font-size:11px;color: var(--kp-color-gray-500)">sm · 28px</span></div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px"><kp-number-stepper size="md" [(ngModel)]="v3"></kp-number-stepper><span style="font-size:11px;color: var(--kp-color-gray-500)">md · 36px</span></div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px"><kp-number-stepper size="lg" [(ngModel)]="v4"></kp-number-stepper><span style="font-size:11px;color: var(--kp-color-gray-500)">lg · 44px</span></div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px"><kp-number-stepper size="xl" [(ngModel)]="v5"></kp-number-stepper><span style="font-size:11px;color: var(--kp-color-gray-500)">xl · 52px</span></div>
      </div>`,
  }),
};

export const States: Story = {
  render: () => ({
    template: `
      <div style="display:flex;align-items:flex-start;gap:24px;flex-wrap:wrap">
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px"><kp-number-stepper forceState="rest"></kp-number-stepper><span style="font-size:11px;color: var(--kp-color-gray-500)">rest</span></div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px"><kp-number-stepper forceState="hover"></kp-number-stepper><span style="font-size:11px;color: var(--kp-color-gray-500)">hover</span></div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px"><kp-number-stepper forceState="focus"></kp-number-stepper><span style="font-size:11px;color: var(--kp-color-gray-500)">focus</span></div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px"><kp-number-stepper forceState="disabled"></kp-number-stepper><span style="font-size:11px;color: var(--kp-color-gray-500)">disabled</span></div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px"><kp-number-stepper forceState="error"></kp-number-stepper><span style="font-size:11px;color: var(--kp-color-gray-500)">error</span></div>
      </div>`,
  }),
};

export const AtLimits: Story = {
  name: 'At Limits',
  render: () => ({
    props: {
      vMin: 0,
      vMid: 5,
      vMax: 100,
      label: (v: number) => v <= 0 ? 'At minimum' : v >= 100 ? 'At maximum' : 'In range',
    },
    template: `
      <div style="display:flex;align-items:flex-start;gap:24px;flex-wrap:wrap">
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <kp-number-stepper [(ngModel)]="vMin" [min]="0" [max]="100"></kp-number-stepper>
          <span style="font-size:11px;color: var(--kp-color-gray-500)">{{ label(vMin) }}</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <kp-number-stepper [(ngModel)]="vMid" [min]="0" [max]="100"></kp-number-stepper>
          <span style="font-size:11px;color: var(--kp-color-gray-500)">{{ label(vMid) }}</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <kp-number-stepper [(ngModel)]="vMax" [min]="0" [max]="100"></kp-number-stepper>
          <span style="font-size:11px;color: var(--kp-color-gray-500)">{{ label(vMax) }}</span>
        </div>
      </div>`,
  }),
};

export const PrefixAndSuffix: Story = {
  name: 'Prefix & Suffix',
  render: () => ({
    props: { v1: 5, v2: 99, v3: 12, v4: 500 },
    template: `
      <div style="display:flex;align-items:flex-start;gap:24px;flex-wrap:wrap">
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <kp-number-stepper [(ngModel)]="v1"></kp-number-stepper>
          <span style="font-size:11px;color: var(--kp-color-gray-500)">Plain</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <kp-number-stepper [(ngModel)]="v2" prefix="$"></kp-number-stepper>
          <span style="font-size:11px;color: var(--kp-color-gray-500)">Currency</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <kp-number-stepper [(ngModel)]="v3" suffix="kg"></kp-number-stepper>
          <span style="font-size:11px;color: var(--kp-color-gray-500)">Unit</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <kp-number-stepper [(ngModel)]="v4" prefix="€" suffix=".00"></kp-number-stepper>
          <span style="font-size:11px;color: var(--kp-color-gray-500)">Both affixes</span>
        </div>
      </div>`,
  }),
};

export const InFormField: Story = {
  name: 'In FormField',
  render: () => ({
    props: { qty: 1, price: 99, weight: 5 },
    template: `
      <div style="display:flex;align-items:flex-start;gap:24px;flex-wrap:wrap">
        <kp-form-field label="Quantity" helper="How many items to order" style="width:280px">
          <kp-number-stepper [(ngModel)]="qty" [min]="1"></kp-number-stepper>
        </kp-form-field>
        <kp-form-field label="Price" required="required-asterisk" helper="In USD" style="width:280px">
          <kp-number-stepper [(ngModel)]="price" prefix="$" [min]="0"></kp-number-stepper>
        </kp-form-field>
        <kp-form-field label="Weight" required="optional" style="width:280px">
          <kp-number-stepper size="lg" [(ngModel)]="weight" suffix="kg" [min]="0"></kp-number-stepper>
        </kp-form-field>
      </div>`,
  }),
};
