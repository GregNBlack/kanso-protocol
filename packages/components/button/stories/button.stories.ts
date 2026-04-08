import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { KpButtonComponent } from '../src/button.component';

const meta: Meta<KpButtonComponent> = {
  title: 'Components/Button',
  component: KpButtonComponent,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Component size from the sizing scale',
      table: { defaultValue: { summary: 'md' } },
    },
    variant: {
      control: 'select',
      options: ['default', 'subtle', 'outline', 'ghost'],
      description: 'Visual variant',
      table: { defaultValue: { summary: 'default' } },
    },
    color: {
      control: 'select',
      options: ['primary', 'danger', 'neutral'],
      description: 'Color role',
      table: { defaultValue: { summary: 'primary' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state — action unavailable',
      table: { defaultValue: { summary: 'false' } },
    },
    loading: {
      control: 'boolean',
      description: 'Loading state — action in progress (not disabled)',
      table: { defaultValue: { summary: 'false' } },
    },
  },
};

export default meta;
type Story = StoryObj<KpButtonComponent>;

// === Primary stories ===

export const Default: Story = {
  args: {
    size: 'md',
    variant: 'default',
    color: 'primary',
    disabled: false,
    loading: false,
  },
  render: (args) => ({
    props: args,
    template: `<kp-button [size]="size" [variant]="variant" [color]="color" [disabled]="disabled" [loading]="loading">Button</kp-button>`,
  }),
};

export const AllSizes: Story = {
  render: () => ({
    template: `
      <div style="display: flex; align-items: center; gap: 12px;">
        <kp-button size="xs">XS · 24px</kp-button>
        <kp-button size="sm">SM · 28px</kp-button>
        <kp-button size="md">MD · 36px</kp-button>
        <kp-button size="lg">LG · 44px</kp-button>
        <kp-button size="xl">XL · 52px</kp-button>
      </div>
    `,
  }),
};

export const AllVariants: Story = {
  render: () => ({
    template: `
      <div style="display: flex; align-items: center; gap: 12px;">
        <kp-button variant="default">Default</kp-button>
        <kp-button variant="subtle">Subtle</kp-button>
        <kp-button variant="outline">Outline</kp-button>
        <kp-button variant="ghost">Ghost</kp-button>
      </div>
    `,
  }),
};

export const ColorRoles: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <kp-button color="primary" variant="default">Primary</kp-button>
          <kp-button color="primary" variant="subtle">Subtle</kp-button>
          <kp-button color="primary" variant="outline">Outline</kp-button>
          <kp-button color="primary" variant="ghost">Ghost</kp-button>
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <kp-button color="danger" variant="default">Danger</kp-button>
          <kp-button color="danger" variant="subtle">Subtle</kp-button>
          <kp-button color="danger" variant="outline">Outline</kp-button>
          <kp-button color="danger" variant="ghost">Ghost</kp-button>
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <kp-button color="neutral" variant="default">Neutral</kp-button>
          <kp-button color="neutral" variant="subtle">Subtle</kp-button>
          <kp-button color="neutral" variant="outline">Outline</kp-button>
          <kp-button color="neutral" variant="ghost">Ghost</kp-button>
        </div>
      </div>
    `,
  }),
};

export const States: Story = {
  render: () => ({
    template: `
      <div style="display: flex; align-items: center; gap: 12px;">
        <kp-button>Rest</kp-button>
        <kp-button [disabled]="true">Disabled</kp-button>
        <kp-button [loading]="true">Loading</kp-button>
      </div>
    `,
  }),
};

export const Loading: Story = {
  args: {
    loading: true,
    size: 'lg',
    color: 'primary',
    variant: 'default',
  },
  render: (args) => ({
    props: args,
    template: `<kp-button [size]="size" [variant]="variant" [color]="color" [loading]="loading">Saving...</kp-button>`,
  }),
};
