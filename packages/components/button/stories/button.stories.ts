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
    iconOnly: { control: 'boolean', description: 'Hide label and make button square (height × height)', table: { defaultValue: { summary: 'false' } } },
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

const ICON_SIZE: Record<string, number> = { xs: 14, sm: 16, md: 18, lg: 22, xl: 24 };

export const Default: Story = {
  argTypes: {
    icon: {
      control: { type: 'inline-radio' },
      options: ['none', 'left', 'right', 'only'],
      description: 'Icon placement (Storybook demo only — real API uses [kpButtonIconLeft] / [kpButtonIconRight] projection slots)',
      table: { defaultValue: { summary: 'none' } },
    },
    iconOnly: { table: { disable: true } },
  } as any,
  args: {
    size: 'md',
    variant: 'default',
    color: 'primary',
    disabled: false,
    loading: false,
    forceState: null,
    icon: 'none',
  } as any,
  render: (args: any) => {
    const s = ICON_SIZE[args.size] ?? 18;
    const plus = `<svg kpButtonIconLeft width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
    const arrow = `<svg kpButtonIconRight width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const inner =
      args.icon === 'only' ? plus :
      args.icon === 'left' ? `${plus}Button` :
      args.icon === 'right' ? `Button${arrow}` :
      'Button';
    const ariaLabel = args.icon === 'only' ? ' aria-label="Action"' : '';
    return {
      props: args,
      template: `<kp-button [size]="size" [variant]="variant" [color]="color" [disabled]="disabled" [loading]="loading" [forceState]="forceState" [iconOnly]="icon === 'only'"${ariaLabel}>${inner}</kp-button>`,
    };
  },
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
          <div style="font-size:12px;font-weight:600;color: var(--kp-color-gray-600);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:12px">Primary · Default</div>
          <div style="display:flex;align-items:center;gap:12px">
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Rest</span>
              <kp-button forceState="rest">Button</kp-button>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Hover</span>
              <kp-button forceState="hover">Button</kp-button>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Active</span>
              <kp-button forceState="active">Button</kp-button>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Focus</span>
              <kp-button forceState="focus">Button</kp-button>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Disabled</span>
              <kp-button forceState="disabled">Button</kp-button>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Loading</span>
              <kp-button forceState="loading">Button</kp-button>
            </div>
          </div>
        </div>

        <div>
          <div style="font-size:12px;font-weight:600;color: var(--kp-color-gray-600);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:12px">Primary · Subtle</div>
          <div style="display:flex;align-items:center;gap:12px">
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Rest</span>
              <kp-button variant="subtle" forceState="rest">Button</kp-button>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Hover</span>
              <kp-button variant="subtle" forceState="hover">Button</kp-button>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Active</span>
              <kp-button variant="subtle" forceState="active">Button</kp-button>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Focus</span>
              <kp-button variant="subtle" forceState="focus">Button</kp-button>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Disabled</span>
              <kp-button variant="subtle" forceState="disabled">Button</kp-button>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Loading</span>
              <kp-button variant="subtle" forceState="loading">Button</kp-button>
            </div>
          </div>
        </div>

        <div>
          <div style="font-size:12px;font-weight:600;color: var(--kp-color-gray-600);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:12px">Primary · Outline</div>
          <div style="display:flex;align-items:center;gap:12px">
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Rest</span>
              <kp-button variant="outline" forceState="rest">Button</kp-button>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Hover</span>
              <kp-button variant="outline" forceState="hover">Button</kp-button>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Active</span>
              <kp-button variant="outline" forceState="active">Button</kp-button>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Focus</span>
              <kp-button variant="outline" forceState="focus">Button</kp-button>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Disabled</span>
              <kp-button variant="outline" forceState="disabled">Button</kp-button>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Loading</span>
              <kp-button variant="outline" forceState="loading">Button</kp-button>
            </div>
          </div>
        </div>

        <div>
          <div style="font-size:12px;font-weight:600;color: var(--kp-color-gray-600);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:12px">Primary · Ghost</div>
          <div style="display:flex;align-items:center;gap:12px">
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Rest</span>
              <kp-button variant="ghost" forceState="rest">Button</kp-button>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Hover</span>
              <kp-button variant="ghost" forceState="hover">Button</kp-button>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Active</span>
              <kp-button variant="ghost" forceState="active">Button</kp-button>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Focus</span>
              <kp-button variant="ghost" forceState="focus">Button</kp-button>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Disabled</span>
              <kp-button variant="ghost" forceState="disabled">Button</kp-button>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Loading</span>
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
          <div style="font-size:12px;font-weight:600;color: var(--kp-color-gray-600);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:12px">Danger · Default</div>
          <div style="display:flex;align-items:center;gap:12px">
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Rest</span><kp-button color="danger" forceState="rest">Button</kp-button></div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Hover</span><kp-button color="danger" forceState="hover">Button</kp-button></div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Active</span><kp-button color="danger" forceState="active">Button</kp-button></div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Focus</span><kp-button color="danger" forceState="focus">Button</kp-button></div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Disabled</span><kp-button color="danger" forceState="disabled">Button</kp-button></div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Loading</span><kp-button color="danger" forceState="loading">Button</kp-button></div>
          </div>
        </div>
        <div>
          <div style="font-size:12px;font-weight:600;color: var(--kp-color-gray-600);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:12px">Danger · Outline</div>
          <div style="display:flex;align-items:center;gap:12px">
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Rest</span><kp-button color="danger" variant="outline" forceState="rest">Button</kp-button></div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Hover</span><kp-button color="danger" variant="outline" forceState="hover">Button</kp-button></div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Active</span><kp-button color="danger" variant="outline" forceState="active">Button</kp-button></div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Focus</span><kp-button color="danger" variant="outline" forceState="focus">Button</kp-button></div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Disabled</span><kp-button color="danger" variant="outline" forceState="disabled">Button</kp-button></div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Loading</span><kp-button color="danger" variant="outline" forceState="loading">Button</kp-button></div>
          </div>
        </div>
      </div>`,
  }),
};

export const WithIcon: Story = {
  name: 'With Icon',
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:16px;align-items:flex-start">
        <div style="display:flex;align-items:center;gap:12px">
          <kp-button size="xs">
            <svg kpButtonIconLeft width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            Add item
          </kp-button>
          <kp-button size="sm">
            <svg kpButtonIconLeft width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            Add item
          </kp-button>
          <kp-button size="md">
            <svg kpButtonIconLeft width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            Add item
          </kp-button>
          <kp-button size="lg">
            <svg kpButtonIconLeft width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            Add item
          </kp-button>
          <kp-button size="xl">
            <svg kpButtonIconLeft width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            Add item
          </kp-button>
        </div>

        <div style="display:flex;align-items:center;gap:12px">
          <kp-button variant="outline" color="neutral">
            Continue
            <svg kpButtonIconRight width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </kp-button>
          <kp-button variant="ghost" color="neutral">
            <svg kpButtonIconLeft width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Back
          </kp-button>
          <kp-button color="danger">
            <svg kpButtonIconLeft width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Delete
          </kp-button>
          <kp-button>
            <svg kpButtonIconLeft width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12l5 5L20 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Save
            <svg kpButtonIconRight width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </kp-button>
        </div>
      </div>`,
  }),
};

export const IconOnly: Story = {
  name: 'Icon Only',
  render: () => ({
    template: `
      <div style="display:flex;align-items:center;gap:12px">
        <kp-button size="xs" [iconOnly]="true" aria-label="Add">
          <svg kpButtonIconLeft width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </kp-button>
        <kp-button size="sm" [iconOnly]="true" aria-label="Add">
          <svg kpButtonIconLeft width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </kp-button>
        <kp-button size="md" [iconOnly]="true" aria-label="Add">
          <svg kpButtonIconLeft width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </kp-button>
        <kp-button size="lg" [iconOnly]="true" aria-label="Add">
          <svg kpButtonIconLeft width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </kp-button>
        <kp-button size="xl" [iconOnly]="true" aria-label="Add">
          <svg kpButtonIconLeft width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </kp-button>
        <kp-button size="md" variant="outline" color="neutral" [iconOnly]="true" aria-label="Add">
          <svg kpButtonIconLeft width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </kp-button>
        <kp-button size="md" variant="ghost" color="neutral" [iconOnly]="true" aria-label="Add">
          <svg kpButtonIconLeft width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </kp-button>
      </div>`,
  }),
};

export const NeutralStates: Story = {
  name: 'Neutral States',
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:24px">
        <div>
          <div style="font-size:12px;font-weight:600;color: var(--kp-color-gray-600);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:12px">Neutral · Default</div>
          <div style="display:flex;align-items:center;gap:12px">
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Rest</span><kp-button color="neutral" forceState="rest">Button</kp-button></div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Hover</span><kp-button color="neutral" forceState="hover">Button</kp-button></div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Active</span><kp-button color="neutral" forceState="active">Button</kp-button></div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Focus</span><kp-button color="neutral" forceState="focus">Button</kp-button></div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Disabled</span><kp-button color="neutral" forceState="disabled">Button</kp-button></div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Loading</span><kp-button color="neutral" forceState="loading">Button</kp-button></div>
          </div>
        </div>
        <div>
          <div style="font-size:12px;font-weight:600;color: var(--kp-color-gray-600);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:12px">Neutral · Outline</div>
          <div style="display:flex;align-items:center;gap:12px">
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Rest</span><kp-button color="neutral" variant="outline" forceState="rest">Button</kp-button></div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Hover</span><kp-button color="neutral" variant="outline" forceState="hover">Button</kp-button></div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Active</span><kp-button color="neutral" variant="outline" forceState="active">Button</kp-button></div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Focus</span><kp-button color="neutral" variant="outline" forceState="focus">Button</kp-button></div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Disabled</span><kp-button color="neutral" variant="outline" forceState="disabled">Button</kp-button></div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Loading</span><kp-button color="neutral" variant="outline" forceState="loading">Button</kp-button></div>
          </div>
        </div>
      </div>`,
  }),
};
