import { Meta, StoryObj } from '@storybook/angular';
import { KpProgressCircularComponent } from '../src/progress-circular.component';

const meta: Meta<KpProgressCircularComponent> = {
  title: 'Components/Progress/Circular',
  component: KpProgressCircularComponent,
  tags: ['autodocs'],
  argTypes: {
    size:  { control: 'inline-radio', options: ['xs','sm','md','lg','xl'], table: { defaultValue: { summary: 'md' } } },
    color: { control: 'select', options: ['primary','success','danger','warning','neutral'], table: { defaultValue: { summary: 'primary' } } },
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    indeterminate: { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
    showValue: { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
  },
};
export default meta;
type Story = StoryObj<KpProgressCircularComponent>;

export const Default: Story = {
  args: { size: 'md', color: 'primary', value: 65, indeterminate: false, showValue: true },
  render: (args) => ({
    props: args,
    template: `<kp-progress-circular [size]="size" [color]="color" [value]="value"
                 [indeterminate]="indeterminate" [showValue]="showValue"/>`,
  }),
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display:flex;align-items:center;gap:32px">
        <kp-progress-circular size="xs" [value]="65"/>
        <kp-progress-circular size="sm" [value]="65"/>
        <kp-progress-circular size="md" [value]="65" [showValue]="true"/>
        <kp-progress-circular size="lg" [value]="65" [showValue]="true"/>
        <kp-progress-circular size="xl" [value]="65" [showValue]="true"/>
      </div>`,
  }),
};

export const ColorRoles: Story = {
  name: 'Color Roles',
  render: () => ({
    template: `
      <div style="display:flex;align-items:center;gap:24px">
        <kp-progress-circular size="lg" [value]="75" [showValue]="true" color="primary"/>
        <kp-progress-circular size="lg" [value]="75" [showValue]="true" color="success"/>
        <kp-progress-circular size="lg" [value]="75" [showValue]="true" color="danger"/>
        <kp-progress-circular size="lg" [value]="75" [showValue]="true" color="warning"/>
        <kp-progress-circular size="lg" [value]="75" [showValue]="true" color="neutral"/>
      </div>`,
  }),
};

export const Values: Story = {
  render: () => ({
    template: `
      <div style="display:flex;align-items:center;gap:24px">
        <kp-progress-circular size="lg" [value]="10"  [showValue]="true"/>
        <kp-progress-circular size="lg" [value]="25"  [showValue]="true"/>
        <kp-progress-circular size="lg" [value]="50"  [showValue]="true"/>
        <kp-progress-circular size="lg" [value]="75"  [showValue]="true"/>
        <kp-progress-circular size="lg" [value]="100" [showValue]="true" color="success"/>
      </div>`,
  }),
};

export const Indeterminate: Story = {
  render: () => ({
    template: `
      <div style="display:flex;align-items:center;gap:32px">
        <kp-progress-circular size="sm" [indeterminate]="true"/>
        <kp-progress-circular size="md" [indeterminate]="true"/>
        <kp-progress-circular size="lg" [indeterminate]="true"/>
      </div>`,
  }),
};
