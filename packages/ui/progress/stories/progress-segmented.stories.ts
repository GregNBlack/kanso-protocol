import { Meta, StoryObj } from '@storybook/angular';
import { KpProgressSegmentedComponent } from '../src/progress-segmented.component';

const meta: Meta<KpProgressSegmentedComponent> = {
  title: 'Components/Progress/Segmented',
  component: KpProgressSegmentedComponent,
  tags: ['autodocs'],
  argTypes: {
    size:    { control: 'inline-radio', options: ['xs','sm','md','lg'], table: { defaultValue: { summary: 'md' } } },
    color:   { control: 'select', options: ['primary','success','danger','warning','neutral'], table: { defaultValue: { summary: 'primary' } } },
    total:   { control: { type: 'number', min: 2, max: 12, step: 1 } },
    current: { control: { type: 'number', min: 0, max: 12, step: 1 } },
    showLabels:      { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
    showStepCounter: { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
  },
};
export default meta;
type Story = StoryObj<KpProgressSegmentedComponent>;

export const Default: Story = {
  args: { size: 'md', color: 'primary', total: 5, current: 2, showLabels: false, showStepCounter: false },
  render: (args) => ({
    props: args,
    template: `<kp-progress-segmented [size]="size" [color]="color" [total]="total" [current]="current"
                 [showLabels]="showLabels" [showStepCounter]="showStepCounter"/>`,
  }),
};

export const TotalSegments: Story = {
  name: 'Total Segments',
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:24px">
        <kp-progress-segmented [total]="3" [current]="2"/>
        <kp-progress-segmented [total]="5" [current]="3"/>
        <kp-progress-segmented [total]="7" [current]="4"/>
        <kp-progress-segmented [total]="8" [current]="6"/>
      </div>`,
  }),
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:16px">
        <kp-progress-segmented size="xs" [total]="5" [current]="3"/>
        <kp-progress-segmented size="sm" [total]="5" [current]="3"/>
        <kp-progress-segmented size="md" [total]="5" [current]="3"/>
        <kp-progress-segmented size="lg" [total]="5" [current]="3"/>
      </div>`,
  }),
};

export const WithStepCounter: Story = {
  name: 'With Step Counter',
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:24px">
        <kp-progress-segmented [total]="5" [current]="2" [showStepCounter]="true"/>
        <kp-progress-segmented [total]="4" [current]="4" [showStepCounter]="true" color="success"/>
      </div>`,
  }),
};

export const WithLabels: Story = {
  name: 'With Labels',
  render: () => ({
    template: `
      <kp-progress-segmented [total]="4" [current]="2"
        [showStepCounter]="true" [showLabels]="true"
        [labels]="['Details','Payment','Review','Complete']"/>`,
  }),
};

export const ColorRoles: Story = {
  name: 'Color Roles',
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:16px">
        <kp-progress-segmented [total]="5" [current]="3" color="primary"/>
        <kp-progress-segmented [total]="5" [current]="5" color="success"/>
        <kp-progress-segmented [total]="5" [current]="4" color="warning"/>
      </div>`,
  }),
};
