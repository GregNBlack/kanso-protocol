import { Meta, StoryObj } from '@storybook/angular';
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
    disabled: { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
    loading: { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
    forceState: {
      control: 'select',
      options: [null, 'rest', 'hover', 'active', 'focus', 'disabled', 'loading'],
      description: 'Force visual state for documentation',
      table: { defaultValue: { summary: 'null' } },
    },
  },
};

export default meta;
type Story = StoryObj<KpButtonComponent>;

export const Default: Story = {
  args: { size: 'md', variant: 'default', color: 'primary', disabled: false, loading: false },
  render: (args) => ({
    props: args,
    template: `<kp-button [size]="size" [variant]="variant" [color]="color" [disabled]="disabled" [loading]="loading">Button</kp-button>`,
  }),
};

export const AllSizes: Story = {
  render: () => ({
    template: `
      <div style="display:flex;align-items:center;gap:12px">
        <kp-button size="xs">XS · 24px</kp-button>
        <kp-button size="sm">SM · 28px</kp-button>
        <kp-button size="md">MD · 36px</kp-button>
        <kp-button size="lg">LG · 44px</kp-button>
        <kp-button size="xl">XL · 52px</kp-button>
      </div>`,
  }),
};

export const AllVariants: Story = {
  render: () => ({
    template: `
      <div style="display:flex;align-items:center;gap:12px">
        <kp-button variant="default">Default</kp-button>
        <kp-button variant="subtle">Subtle</kp-button>
        <kp-button variant="outline">Outline</kp-button>
        <kp-button variant="ghost">Ghost</kp-button>
      </div>`,
  }),
};

export const ColorRoles: Story = {
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:16px">
        <div style="display:flex;align-items:center;gap:12px">
          <kp-button color="primary" variant="default">Primary</kp-button>
          <kp-button color="primary" variant="subtle">Subtle</kp-button>
          <kp-button color="primary" variant="outline">Outline</kp-button>
          <kp-button color="primary" variant="ghost">Ghost</kp-button>
        </div>
        <div style="display:flex;align-items:center;gap:12px">
          <kp-button color="danger" variant="default">Danger</kp-button>
          <kp-button color="danger" variant="subtle">Subtle</kp-button>
          <kp-button color="danger" variant="outline">Outline</kp-button>
          <kp-button color="danger" variant="ghost">Ghost</kp-button>
        </div>
        <div style="display:flex;align-items:center;gap:12px">
          <kp-button color="neutral" variant="default">Neutral</kp-button>
          <kp-button color="neutral" variant="subtle">Subtle</kp-button>
          <kp-button color="neutral" variant="outline">Outline</kp-button>
          <kp-button color="neutral" variant="ghost">Ghost</kp-button>
        </div>
      </div>`,
  }),
};

export const AllStates: Story = {
  name: 'All States',
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:24px">
        <div>
          <div style="font-size:12px;font-weight:600;color:#71717A;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:12px">Primary · Default</div>
          <div style="display:flex;align-items:center;gap:12px">
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color:#A1A1AA;text-transform:uppercase">Rest</span>
              <kp-button forceState="rest">Button</kp-button>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color:#A1A1AA;text-transform:uppercase">Hover</span>
              <kp-button forceState="hover">Button</kp-button>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color:#A1A1AA;text-transform:uppercase">Active</span>
              <kp-button forceState="active">Button</kp-button>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color:#A1A1AA;text-transform:uppercase">Focus</span>
              <kp-button forceState="focus">Button</kp-button>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color:#A1A1AA;text-transform:uppercase">Disabled</span>
              <kp-button forceState="disabled">Button</kp-button>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color:#A1A1AA;text-transform:uppercase">Loading</span>
              <kp-button forceState="loading">Button</kp-button>
            </div>
          </div>
        </div>

        <div>
          <div style="font-size:12px;font-weight:600;color:#71717A;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:12px">Primary · Subtle</div>
          <div style="display:flex;align-items:center;gap:12px">
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color:#A1A1AA;text-transform:uppercase">Rest</span>
              <kp-button variant="subtle" forceState="rest">Button</kp-button>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color:#A1A1AA;text-transform:uppercase">Hover</span>
              <kp-button variant="subtle" forceState="hover">Button</kp-button>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color:#A1A1AA;text-transform:uppercase">Active</span>
              <kp-button variant="subtle" forceState="active">Button</kp-button>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color:#A1A1AA;text-transform:uppercase">Focus</span>
              <kp-button variant="subtle" forceState="focus">Button</kp-button>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color:#A1A1AA;text-transform:uppercase">Disabled</span>
              <kp-button variant="subtle" forceState="disabled">Button</kp-button>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color:#A1A1AA;text-transform:uppercase">Loading</span>
              <kp-button variant="subtle" forceState="loading">Button</kp-button>
            </div>
          </div>
        </div>

        <div>
          <div style="font-size:12px;font-weight:600;color:#71717A;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:12px">Primary · Outline</div>
          <div style="display:flex;align-items:center;gap:12px">
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color:#A1A1AA;text-transform:uppercase">Rest</span>
              <kp-button variant="outline" forceState="rest">Button</kp-button>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color:#A1A1AA;text-transform:uppercase">Hover</span>
              <kp-button variant="outline" forceState="hover">Button</kp-button>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color:#A1A1AA;text-transform:uppercase">Active</span>
              <kp-button variant="outline" forceState="active">Button</kp-button>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color:#A1A1AA;text-transform:uppercase">Focus</span>
              <kp-button variant="outline" forceState="focus">Button</kp-button>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color:#A1A1AA;text-transform:uppercase">Disabled</span>
              <kp-button variant="outline" forceState="disabled">Button</kp-button>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color:#A1A1AA;text-transform:uppercase">Loading</span>
              <kp-button variant="outline" forceState="loading">Button</kp-button>
            </div>
          </div>
        </div>

        <div>
          <div style="font-size:12px;font-weight:600;color:#71717A;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:12px">Primary · Ghost</div>
          <div style="display:flex;align-items:center;gap:12px">
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color:#A1A1AA;text-transform:uppercase">Rest</span>
              <kp-button variant="ghost" forceState="rest">Button</kp-button>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color:#A1A1AA;text-transform:uppercase">Hover</span>
              <kp-button variant="ghost" forceState="hover">Button</kp-button>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color:#A1A1AA;text-transform:uppercase">Active</span>
              <kp-button variant="ghost" forceState="active">Button</kp-button>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color:#A1A1AA;text-transform:uppercase">Focus</span>
              <kp-button variant="ghost" forceState="focus">Button</kp-button>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color:#A1A1AA;text-transform:uppercase">Disabled</span>
              <kp-button variant="ghost" forceState="disabled">Button</kp-button>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color:#A1A1AA;text-transform:uppercase">Loading</span>
              <kp-button variant="ghost" forceState="loading">Button</kp-button>
            </div>
          </div>
        </div>
      </div>`,
  }),
};

export const DangerStates: Story = {
  name: 'Danger States',
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:24px">
        <div>
          <div style="font-size:12px;font-weight:600;color:#71717A;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:12px">Danger · Default</div>
          <div style="display:flex;align-items:center;gap:12px">
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color:#A1A1AA;text-transform:uppercase">Rest</span><kp-button color="danger" forceState="rest">Button</kp-button></div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color:#A1A1AA;text-transform:uppercase">Hover</span><kp-button color="danger" forceState="hover">Button</kp-button></div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color:#A1A1AA;text-transform:uppercase">Active</span><kp-button color="danger" forceState="active">Button</kp-button></div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color:#A1A1AA;text-transform:uppercase">Focus</span><kp-button color="danger" forceState="focus">Button</kp-button></div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color:#A1A1AA;text-transform:uppercase">Disabled</span><kp-button color="danger" forceState="disabled">Button</kp-button></div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color:#A1A1AA;text-transform:uppercase">Loading</span><kp-button color="danger" forceState="loading">Button</kp-button></div>
          </div>
        </div>
        <div>
          <div style="font-size:12px;font-weight:600;color:#71717A;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:12px">Danger · Outline</div>
          <div style="display:flex;align-items:center;gap:12px">
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color:#A1A1AA;text-transform:uppercase">Rest</span><kp-button color="danger" variant="outline" forceState="rest">Button</kp-button></div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color:#A1A1AA;text-transform:uppercase">Hover</span><kp-button color="danger" variant="outline" forceState="hover">Button</kp-button></div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color:#A1A1AA;text-transform:uppercase">Active</span><kp-button color="danger" variant="outline" forceState="active">Button</kp-button></div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color:#A1A1AA;text-transform:uppercase">Focus</span><kp-button color="danger" variant="outline" forceState="focus">Button</kp-button></div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color:#A1A1AA;text-transform:uppercase">Disabled</span><kp-button color="danger" variant="outline" forceState="disabled">Button</kp-button></div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color:#A1A1AA;text-transform:uppercase">Loading</span><kp-button color="danger" variant="outline" forceState="loading">Button</kp-button></div>
          </div>
        </div>
      </div>`,
  }),
};

export const NeutralStates: Story = {
  name: 'Neutral States',
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:24px">
        <div>
          <div style="font-size:12px;font-weight:600;color:#71717A;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:12px">Neutral · Default</div>
          <div style="display:flex;align-items:center;gap:12px">
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color:#A1A1AA;text-transform:uppercase">Rest</span><kp-button color="neutral" forceState="rest">Button</kp-button></div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color:#A1A1AA;text-transform:uppercase">Hover</span><kp-button color="neutral" forceState="hover">Button</kp-button></div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color:#A1A1AA;text-transform:uppercase">Active</span><kp-button color="neutral" forceState="active">Button</kp-button></div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color:#A1A1AA;text-transform:uppercase">Focus</span><kp-button color="neutral" forceState="focus">Button</kp-button></div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color:#A1A1AA;text-transform:uppercase">Disabled</span><kp-button color="neutral" forceState="disabled">Button</kp-button></div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color:#A1A1AA;text-transform:uppercase">Loading</span><kp-button color="neutral" forceState="loading">Button</kp-button></div>
          </div>
        </div>
        <div>
          <div style="font-size:12px;font-weight:600;color:#71717A;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:12px">Neutral · Outline</div>
          <div style="display:flex;align-items:center;gap:12px">
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color:#A1A1AA;text-transform:uppercase">Rest</span><kp-button color="neutral" variant="outline" forceState="rest">Button</kp-button></div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color:#A1A1AA;text-transform:uppercase">Hover</span><kp-button color="neutral" variant="outline" forceState="hover">Button</kp-button></div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color:#A1A1AA;text-transform:uppercase">Active</span><kp-button color="neutral" variant="outline" forceState="active">Button</kp-button></div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color:#A1A1AA;text-transform:uppercase">Focus</span><kp-button color="neutral" variant="outline" forceState="focus">Button</kp-button></div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color:#A1A1AA;text-transform:uppercase">Disabled</span><kp-button color="neutral" variant="outline" forceState="disabled">Button</kp-button></div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color:#A1A1AA;text-transform:uppercase">Loading</span><kp-button color="neutral" variant="outline" forceState="loading">Button</kp-button></div>
          </div>
        </div>
      </div>`,
  }),
};
