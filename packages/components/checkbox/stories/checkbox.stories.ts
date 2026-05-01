import { Meta, StoryObj } from '@storybook/angular';
import { KpCheckboxComponent } from '../src/checkbox.component';

const meta: Meta<KpCheckboxComponent> = {
  title: 'Components/Checkbox',
  component: KpCheckboxComponent,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm','md','lg'] },
    color: { control: 'select', options: ['primary','danger'] },
    checked: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
    disabled: { control: 'boolean' },
    forceState: { control: 'select', options: [null,'rest','hover','active','focus','disabled','error'] },
  },
};
export default meta;
type Story = StoryObj<KpCheckboxComponent>;

export const Default: Story = {
  args: { size: 'md', color: 'primary', checked: true, indeterminate: false },
  render: (args) => ({
    props: args,
    template: `<kp-checkbox [size]="size" [color]="color" [checked]="checked" [indeterminate]="indeterminate" [disabled]="disabled">Remember me</kp-checkbox>`,
  }),
};

export const AllSizes: Story = {
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:12px">
        <kp-checkbox size="sm" [checked]="true">SM</kp-checkbox>
        <kp-checkbox size="md" [checked]="true">MD</kp-checkbox>
        <kp-checkbox size="lg" [checked]="true">LG</kp-checkbox>
      </div>`,
  }),
};

export const States: Story = {
  render: () => ({
    template: `
      <div style="display:flex;gap:16px;align-items:flex-end">
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><kp-checkbox [checked]="true" forceState="rest" [hasLabel]="false"></kp-checkbox><span style="font-size:10px;color: var(--kp-color-gray-500)">rest</span></div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><kp-checkbox [checked]="true" forceState="hover" [hasLabel]="false"></kp-checkbox><span style="font-size:10px;color: var(--kp-color-gray-500)">hover</span></div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><kp-checkbox [checked]="true" forceState="focus" [hasLabel]="false"></kp-checkbox><span style="font-size:10px;color: var(--kp-color-gray-500)">focus</span></div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><kp-checkbox [checked]="true" forceState="disabled" [hasLabel]="false"></kp-checkbox><span style="font-size:10px;color: var(--kp-color-gray-500)">disabled</span></div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><kp-checkbox [checked]="true" forceState="error" [hasLabel]="false"></kp-checkbox><span style="font-size:10px;color: var(--kp-color-gray-500)">error</span></div>
      </div>`,
  }),
};

export const CheckedStates: Story = {
  render: () => ({
    template: `
      <div style="display:flex;gap:16px;align-items:flex-end">
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><kp-checkbox [hasLabel]="false"></kp-checkbox><span style="font-size:10px;color: var(--kp-color-gray-500)">unchecked</span></div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><kp-checkbox [checked]="true" [hasLabel]="false"></kp-checkbox><span style="font-size:10px;color: var(--kp-color-gray-500)">checked</span></div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><kp-checkbox [indeterminate]="true" [hasLabel]="false"></kp-checkbox><span style="font-size:10px;color: var(--kp-color-gray-500)">indeterminate</span></div>
      </div>`,
  }),
};

export const Danger: Story = {
  render: () => ({
    template: `<kp-checkbox color="danger" [checked]="true">Delete permanently</kp-checkbox>`,
  }),
};
