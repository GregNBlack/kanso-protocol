import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { KpRadioComponent } from '../src/radio.component';
import { KpRadioGroupComponent } from '../src/radio-group.component';

const meta: Meta<KpRadioComponent> = {
  title: 'Components/Radio',
  component: KpRadioComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({ imports: [KpRadioGroupComponent] }),
  ],
  argTypes: {
    size: { control: 'select', options: ['sm','md','lg'] },
    color: { control: 'select', options: ['primary','danger'] },
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    forceState: { control: 'select', options: [null,'rest','hover','active','focus','disabled','error'] },
  },
};
export default meta;
type Story = StoryObj<KpRadioComponent>;

export const Default: Story = {
  args: { size: 'md', color: 'primary', checked: true },
  render: (args) => ({
    props: args,
    template: `<kp-radio [size]="size" [color]="color" [checked]="checked" [disabled]="disabled">Option A</kp-radio>`,
  }),
};

export const AllSizes: Story = {
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:12px">
        <kp-radio size="sm" [checked]="true">SM</kp-radio>
        <kp-radio size="md" [checked]="true">MD</kp-radio>
        <kp-radio size="lg" [checked]="true">LG</kp-radio>
      </div>`,
  }),
};

export const States: Story = {
  render: () => ({
    template: `
      <div style="display:flex;gap:16px;align-items:flex-end">
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><kp-radio [checked]="true" forceState="rest" [hasLabel]="false"></kp-radio><span style="font-size:10px;color: var(--kp-color-gray-500)">rest</span></div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><kp-radio [checked]="true" forceState="hover" [hasLabel]="false"></kp-radio><span style="font-size:10px;color: var(--kp-color-gray-500)">hover</span></div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><kp-radio [checked]="true" forceState="focus" [hasLabel]="false"></kp-radio><span style="font-size:10px;color: var(--kp-color-gray-500)">focus</span></div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><kp-radio [checked]="true" forceState="disabled" [hasLabel]="false"></kp-radio><span style="font-size:10px;color: var(--kp-color-gray-500)">disabled</span></div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><kp-radio [checked]="true" forceState="error" [hasLabel]="false"></kp-radio><span style="font-size:10px;color: var(--kp-color-gray-500)">error</span></div>
      </div>`,
  }),
};

export const Group: Story = {
  name: 'Group (single-select)',
  render: () => ({
    props: { selected: 'b' },
    template: `
      <kp-radio-group [(value)]="selected">
        <kp-radio value="a">Option A</kp-radio>
        <kp-radio value="b">Option B</kp-radio>
        <kp-radio value="c">Option C</kp-radio>
      </kp-radio-group>

      <div style="margin-top:20px;font-size:12px;color: var(--kp-color-gray-500);font-family:monospace">
        Selected: <strong>{{ selected }}</strong>
      </div>`,
  }),
};

export const HorizontalGroup: Story = {
  name: 'Group (horizontal)',
  render: () => ({
    props: { selected: 'monthly' },
    template: `
      <kp-radio-group [(value)]="selected" orientation="horizontal">
        <kp-radio value="monthly">Monthly</kp-radio>
        <kp-radio value="yearly">Yearly</kp-radio>
        <kp-radio value="lifetime">Lifetime</kp-radio>
      </kp-radio-group>`,
  }),
};
