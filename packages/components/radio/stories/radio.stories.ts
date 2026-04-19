import { Meta, StoryObj } from '@storybook/angular';
import { KpRadioComponent } from '../src/radio.component';

const meta: Meta<KpRadioComponent> = {
  title: 'Components/Radio',
  component: KpRadioComponent,
  tags: ['autodocs'],
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
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><kp-radio [checked]="true" forceState="rest" [hasLabel]="false"></kp-radio><span style="font-size:10px;color:#A1A1AA">rest</span></div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><kp-radio [checked]="true" forceState="hover" [hasLabel]="false"></kp-radio><span style="font-size:10px;color:#A1A1AA">hover</span></div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><kp-radio [checked]="true" forceState="focus" [hasLabel]="false"></kp-radio><span style="font-size:10px;color:#A1A1AA">focus</span></div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><kp-radio [checked]="true" forceState="disabled" [hasLabel]="false"></kp-radio><span style="font-size:10px;color:#A1A1AA">disabled</span></div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><kp-radio [checked]="true" forceState="error" [hasLabel]="false"></kp-radio><span style="font-size:10px;color:#A1A1AA">error</span></div>
      </div>`,
  }),
};

export const Group: Story = {
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:12px">
        <kp-radio>Option A</kp-radio>
        <kp-radio [checked]="true">Option B</kp-radio>
        <kp-radio>Option C</kp-radio>
      </div>`,
  }),
};
