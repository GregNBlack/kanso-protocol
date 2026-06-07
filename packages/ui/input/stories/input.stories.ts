import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { KpInputComponent } from '../src/input.component';

const meta: Meta<KpInputComponent> = {
  title: 'Components/Input',
  component: KpInputComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [FormsModule] })],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Component size from the sizing scale',
      table: { defaultValue: { summary: 'md' } },
    },
    type: {
      control: 'text',
      description: 'Native HTML input type',
      table: { defaultValue: { summary: 'text' } },
    },
    placeholder: { control: 'text', table: { defaultValue: { summary: '' } } },
    label: { control: 'text', description: 'Floating label text (lg/xl only)' },
    floatingLabel: { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
    showClear: { control: 'boolean', description: 'Show clear (X) button when input has a value', table: { defaultValue: { summary: 'false' } } },
    disabled: { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
    forceState: {
      control: 'select',
      options: [null, 'rest', 'hover', 'active', 'focus', 'disabled', 'error'],
      description: 'Force visual state for documentation',
      table: { defaultValue: { summary: 'null' } },
    },
  },
};

export default meta;
type Story = StoryObj<KpInputComponent>;

export const Default: Story = {
  args: { size: 'md', placeholder: 'Placeholder', disabled: false, floatingLabel: false },
  render: (args) => ({
    props: args,
    template: `<kp-input [size]="size" [placeholder]="placeholder" [disabled]="disabled" [floatingLabel]="floatingLabel" [label]="label"></kp-input>`,
  }),
};

export const AllSizes: Story = {
  name: 'All Sizes',
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;align-items:flex-start;gap:12px">
        <kp-input size="xs" placeholder="XS · 24px"></kp-input>
        <kp-input size="sm" placeholder="SM · 28px"></kp-input>
        <kp-input size="md" placeholder="MD · 36px"></kp-input>
        <kp-input size="lg" placeholder="LG · 44px"></kp-input>
        <kp-input size="xl" placeholder="XL · 52px"></kp-input>
      </div>`,
  }),
};

export const States: Story = {
  name: 'States',
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:16px">
        <div style="display:flex;flex-direction:column;align-items:flex-start;gap:6px">
          <span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase;letter-spacing:.06em">Rest</span>
          <kp-input forceState="rest" placeholder="Placeholder"></kp-input>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-start;gap:6px">
          <span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase;letter-spacing:.06em">Hover</span>
          <kp-input forceState="hover" placeholder="Placeholder"></kp-input>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-start;gap:6px">
          <span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase;letter-spacing:.06em">Focus</span>
          <kp-input forceState="focus" placeholder="Placeholder"></kp-input>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-start;gap:6px">
          <span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase;letter-spacing:.06em">Disabled</span>
          <kp-input forceState="disabled" placeholder="Placeholder"></kp-input>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-start;gap:6px">
          <span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase;letter-spacing:.06em">Error</span>
          <kp-input forceState="error" placeholder="Error state"></kp-input>
        </div>
      </div>`,
  }),
};

export const FloatingLabel: Story = {
  name: 'Floating Label',
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:24px">
        <div style="display:flex;flex-direction:column;align-items:flex-start;gap:6px">
          <span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase;letter-spacing:.06em">LG · Rest (label inside)</span>
          <kp-input size="lg" [floatingLabel]="true" label="Email" placeholder="Email"></kp-input>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-start;gap:6px">
          <span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase;letter-spacing:.06em">LG · Focus (label floated)</span>
          <kp-input size="lg" [floatingLabel]="true" label="Email" placeholder="you@example.com" forceState="focus"></kp-input>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-start;gap:6px">
          <span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase;letter-spacing:.06em">XL · Filled (with value)</span>
          <kp-input size="xl" [floatingLabel]="true" label="Name" placeholder="Your name" forceState="active"></kp-input>
        </div>
      </div>`,
  }),
};

export const ClearButton: Story = {
  name: 'Clear Button',
  render: () => ({
    props: {
      v1: 'Hello world',
      v2: 'search term',
      v3: 'Focus me',
      v4: 'Disabled value',
    },
    template: `
      <div style="display:flex;gap:24px;align-items:flex-start;flex-wrap:wrap">
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <kp-input [(ngModel)]="v1" [showClear]="true" placeholder="Type to see clear icon"></kp-input>
          <span style="font-size:11px;color: var(--kp-color-gray-600)">Show Clear</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <kp-input [(ngModel)]="v3" [showClear]="true" placeholder="Focus state" forceState="focus"></kp-input>
          <span style="font-size:11px;color: var(--kp-color-gray-600)">Focus</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <kp-input [(ngModel)]="v4" [showClear]="true" placeholder="Disabled" [disabled]="true"></kp-input>
          <span style="font-size:11px;color: var(--kp-color-gray-600)">Disabled (hidden)</span>
        </div>
      </div>`,
  }),
};
