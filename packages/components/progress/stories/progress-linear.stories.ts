import { Meta, StoryObj } from '@storybook/angular';
import { KpProgressLinearComponent } from '../src/progress-linear.component';

const meta: Meta<KpProgressLinearComponent> = {
  title: 'Components/Progress/Linear',
  component: KpProgressLinearComponent,
  tags: ['autodocs'],
  argTypes: {
    size:  { control: 'inline-radio', options: ['xs','sm','md','lg'], table: { defaultValue: { summary: 'md' } } },
    color: { control: 'select', options: ['primary','success','danger','warning','neutral'], table: { defaultValue: { summary: 'primary' } } },
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    indeterminate: { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
    showLabel: { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
    labelPosition: { control: 'inline-radio', options: ['top','right'], table: { defaultValue: { summary: 'top' } } },
  },
};
export default meta;
type Story = StoryObj<KpProgressLinearComponent>;

export const Default: Story = {
  args: { size: 'md', color: 'primary', value: 45, showLabel: false, indeterminate: false, labelPosition: 'top', label: 'Uploading' },
  render: (args) => ({
    props: args,
    template: `<kp-progress-linear [size]="size" [color]="color" [value]="value"
                 [indeterminate]="indeterminate" [showLabel]="showLabel"
                 [labelPosition]="labelPosition" [label]="label"/>`,
  }),
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:16px">
        <kp-progress-linear size="xs" [value]="45"/>
        <kp-progress-linear size="sm" [value]="45"/>
        <kp-progress-linear size="md" [value]="45"/>
        <kp-progress-linear size="lg" [value]="45"/>
      </div>`,
  }),
};

export const ColorRoles: Story = {
  name: 'Color Roles',
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:16px">
        <kp-progress-linear [value]="60" color="primary"/>
        <kp-progress-linear [value]="60" color="success"/>
        <kp-progress-linear [value]="60" color="danger"/>
        <kp-progress-linear [value]="60" color="warning"/>
        <kp-progress-linear [value]="60" color="neutral"/>
      </div>`,
  }),
};

export const WithLabel: Story = {
  name: 'With Label',
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:24px">
        <kp-progress-linear [value]="45"  [showLabel]="true" labelPosition="top"   label="Uploading files..."/>
        <kp-progress-linear [value]="78"  [showLabel]="true" labelPosition="right" label="Download"/>
        <kp-progress-linear [value]="100" [showLabel]="true" labelPosition="top"   label="Complete" color="success"/>
      </div>`,
  }),
};

export const Indeterminate: Story = {
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:24px">
        <kp-progress-linear [indeterminate]="true"/>
        <kp-progress-linear [indeterminate]="true" [showLabel]="true" label="Processing..."/>
      </div>`,
  }),
};
