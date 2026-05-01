import { Meta, StoryObj } from '@storybook/angular';
import { KpToggleComponent } from '../src/toggle.component';

const meta: Meta<KpToggleComponent> = {
  title: 'Components/Toggle',
  component: KpToggleComponent,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm','md','lg'] },
    color: { control: 'select', options: ['primary','danger'] },
    on: { control: 'boolean' },
    disabled: { control: 'boolean' },
    forceState: { control: 'select', options: [null,'rest','hover','active','focus','disabled','error'] },
  },
};
export default meta;
type Story = StoryObj<KpToggleComponent>;

export const Default: Story = {
  args: { size: 'md', color: 'primary', on: true },
  render: (args) => ({
    props: args,
    template: `<kp-toggle [size]="size" [color]="color" [on]="on" [disabled]="disabled">Notifications</kp-toggle>`,
  }),
};

export const AllSizes: Story = {
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:12px">
        <kp-toggle size="sm" [on]="true">SM</kp-toggle>
        <kp-toggle size="md" [on]="true">MD</kp-toggle>
        <kp-toggle size="lg" [on]="true">LG</kp-toggle>
      </div>`,
  }),
};

export const States: Story = {
  render: () => ({
    template: `
      <div style="display:flex;gap:16px;align-items:flex-end">
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><kp-toggle [on]="true" forceState="rest" [hasLabel]="false"></kp-toggle><span style="font-size:10px;color: var(--kp-color-gray-600)">rest</span></div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><kp-toggle [on]="true" forceState="hover" [hasLabel]="false"></kp-toggle><span style="font-size:10px;color: var(--kp-color-gray-600)">hover</span></div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><kp-toggle [on]="true" forceState="focus" [hasLabel]="false"></kp-toggle><span style="font-size:10px;color: var(--kp-color-gray-600)">focus</span></div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><kp-toggle [on]="true" forceState="disabled" [hasLabel]="false"></kp-toggle><span style="font-size:10px;color: var(--kp-color-gray-600)">disabled</span></div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><kp-toggle [on]="true" forceState="error" [hasLabel]="false"></kp-toggle><span style="font-size:10px;color: var(--kp-color-gray-600)">error</span></div>
      </div>`,
  }),
};

export const OnOff: Story = {
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:12px">
        <kp-toggle>Off</kp-toggle>
        <kp-toggle [on]="true">On</kp-toggle>
      </div>`,
  }),
};
