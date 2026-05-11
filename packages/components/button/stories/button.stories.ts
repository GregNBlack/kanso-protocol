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
      template: `<button kpButton [size]="size" [variant]="variant" [color]="color" [disabled]="disabled" [loading]="loading" [forceState]="forceState" [iconOnly]="icon === 'only'"${ariaLabel}>${inner}</button>`,
    };
  },
};

export const AllSizes: Story = {
  render: () => ({
    template: `
      <div style="display:flex;align-items:center;gap:12px">
        <button kpButton size="xs">XS · 24px</button>
        <button kpButton size="sm">SM · 28px</button>
        <button kpButton size="md">MD · 36px</button>
        <button kpButton size="lg">LG · 44px</button>
        <button kpButton size="xl">XL · 52px</button>
      </div>`,
  }),
};

export const AllVariants: Story = {
  render: () => ({
    template: `
      <div style="display:flex;align-items:center;gap:12px">
        <button kpButton variant="default">Default</button>
        <button kpButton variant="subtle">Subtle</button>
        <button kpButton variant="outline">Outline</button>
        <button kpButton variant="ghost">Ghost</button>
      </div>`,
  }),
};

export const ColorRoles: Story = {
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:16px">
        <div style="display:flex;align-items:center;gap:12px">
          <button kpButton color="primary" variant="default">Primary</button>
          <button kpButton color="primary" variant="subtle">Subtle</button>
          <button kpButton color="primary" variant="outline">Outline</button>
          <button kpButton color="primary" variant="ghost">Ghost</button>
        </div>
        <div style="display:flex;align-items:center;gap:12px">
          <button kpButton color="danger" variant="default">Danger</button>
          <button kpButton color="danger" variant="subtle">Subtle</button>
          <button kpButton color="danger" variant="outline">Outline</button>
          <button kpButton color="danger" variant="ghost">Ghost</button>
        </div>
        <div style="display:flex;align-items:center;gap:12px">
          <button kpButton color="neutral" variant="default">Neutral</button>
          <button kpButton color="neutral" variant="subtle">Subtle</button>
          <button kpButton color="neutral" variant="outline">Outline</button>
          <button kpButton color="neutral" variant="ghost">Ghost</button>
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
              <button kpButton forceState="rest">Button</button>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Hover</span>
              <button kpButton forceState="hover">Button</button>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Active</span>
              <button kpButton forceState="active">Button</button>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Focus</span>
              <button kpButton forceState="focus">Button</button>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Disabled</span>
              <button kpButton forceState="disabled">Button</button>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Loading</span>
              <button kpButton forceState="loading">Button</button>
            </div>
          </div>
        </div>

        <div>
          <div style="font-size:12px;font-weight:600;color: var(--kp-color-gray-600);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:12px">Primary · Subtle</div>
          <div style="display:flex;align-items:center;gap:12px">
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Rest</span>
              <button kpButton variant="subtle" forceState="rest">Button</button>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Hover</span>
              <button kpButton variant="subtle" forceState="hover">Button</button>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Active</span>
              <button kpButton variant="subtle" forceState="active">Button</button>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Focus</span>
              <button kpButton variant="subtle" forceState="focus">Button</button>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Disabled</span>
              <button kpButton variant="subtle" forceState="disabled">Button</button>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Loading</span>
              <button kpButton variant="subtle" forceState="loading">Button</button>
            </div>
          </div>
        </div>

        <div>
          <div style="font-size:12px;font-weight:600;color: var(--kp-color-gray-600);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:12px">Primary · Outline</div>
          <div style="display:flex;align-items:center;gap:12px">
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Rest</span>
              <button kpButton variant="outline" forceState="rest">Button</button>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Hover</span>
              <button kpButton variant="outline" forceState="hover">Button</button>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Active</span>
              <button kpButton variant="outline" forceState="active">Button</button>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Focus</span>
              <button kpButton variant="outline" forceState="focus">Button</button>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Disabled</span>
              <button kpButton variant="outline" forceState="disabled">Button</button>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Loading</span>
              <button kpButton variant="outline" forceState="loading">Button</button>
            </div>
          </div>
        </div>

        <div>
          <div style="font-size:12px;font-weight:600;color: var(--kp-color-gray-600);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:12px">Primary · Ghost</div>
          <div style="display:flex;align-items:center;gap:12px">
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Rest</span>
              <button kpButton variant="ghost" forceState="rest">Button</button>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Hover</span>
              <button kpButton variant="ghost" forceState="hover">Button</button>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Active</span>
              <button kpButton variant="ghost" forceState="active">Button</button>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Focus</span>
              <button kpButton variant="ghost" forceState="focus">Button</button>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Disabled</span>
              <button kpButton variant="ghost" forceState="disabled">Button</button>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Loading</span>
              <button kpButton variant="ghost" forceState="loading">Button</button>
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
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Rest</span><button kpButton color="danger" forceState="rest">Button</button></div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Hover</span><button kpButton color="danger" forceState="hover">Button</button></div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Active</span><button kpButton color="danger" forceState="active">Button</button></div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Focus</span><button kpButton color="danger" forceState="focus">Button</button></div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Disabled</span><button kpButton color="danger" forceState="disabled">Button</button></div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Loading</span><button kpButton color="danger" forceState="loading">Button</button></div>
          </div>
        </div>
        <div>
          <div style="font-size:12px;font-weight:600;color: var(--kp-color-gray-600);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:12px">Danger · Outline</div>
          <div style="display:flex;align-items:center;gap:12px">
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Rest</span><button kpButton color="danger" variant="outline" forceState="rest">Button</button></div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Hover</span><button kpButton color="danger" variant="outline" forceState="hover">Button</button></div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Active</span><button kpButton color="danger" variant="outline" forceState="active">Button</button></div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Focus</span><button kpButton color="danger" variant="outline" forceState="focus">Button</button></div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Disabled</span><button kpButton color="danger" variant="outline" forceState="disabled">Button</button></div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Loading</span><button kpButton color="danger" variant="outline" forceState="loading">Button</button></div>
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
          <button kpButton size="xs">
            <svg kpButtonIconLeft width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            Add item
          </button>
          <button kpButton size="sm">
            <svg kpButtonIconLeft width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            Add item
          </button>
          <button kpButton size="md">
            <svg kpButtonIconLeft width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            Add item
          </button>
          <button kpButton size="lg">
            <svg kpButtonIconLeft width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            Add item
          </button>
          <button kpButton size="xl">
            <svg kpButtonIconLeft width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            Add item
          </button>
        </div>

        <div style="display:flex;align-items:center;gap:12px">
          <button kpButton variant="outline" color="neutral">
            Continue
            <svg kpButtonIconRight width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <button kpButton variant="ghost" color="neutral">
            <svg kpButtonIconLeft width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Back
          </button>
          <button kpButton color="danger">
            <svg kpButtonIconLeft width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Delete
          </button>
          <button kpButton>
            <svg kpButtonIconLeft width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12l5 5L20 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Save
            <svg kpButtonIconRight width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
      </div>`,
  }),
};

export const IconOnly: Story = {
  name: 'Icon Only',
  render: () => ({
    template: `
      <div style="display:flex;align-items:center;gap:12px">
        <button kpButton size="xs" [iconOnly]="true" aria-label="Add">
          <svg kpButtonIconLeft width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
        <button kpButton size="sm" [iconOnly]="true" aria-label="Add">
          <svg kpButtonIconLeft width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
        <button kpButton size="md" [iconOnly]="true" aria-label="Add">
          <svg kpButtonIconLeft width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
        <button kpButton size="lg" [iconOnly]="true" aria-label="Add">
          <svg kpButtonIconLeft width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
        <button kpButton size="xl" [iconOnly]="true" aria-label="Add">
          <svg kpButtonIconLeft width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
        <button kpButton size="md" variant="outline" color="neutral" [iconOnly]="true" aria-label="Add">
          <svg kpButtonIconLeft width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
        <button kpButton size="md" variant="ghost" color="neutral" [iconOnly]="true" aria-label="Add">
          <svg kpButtonIconLeft width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
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
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Rest</span><button kpButton color="neutral" forceState="rest">Button</button></div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Hover</span><button kpButton color="neutral" forceState="hover">Button</button></div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Active</span><button kpButton color="neutral" forceState="active">Button</button></div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Focus</span><button kpButton color="neutral" forceState="focus">Button</button></div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Disabled</span><button kpButton color="neutral" forceState="disabled">Button</button></div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Loading</span><button kpButton color="neutral" forceState="loading">Button</button></div>
          </div>
        </div>
        <div>
          <div style="font-size:12px;font-weight:600;color: var(--kp-color-gray-600);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:12px">Neutral · Outline</div>
          <div style="display:flex;align-items:center;gap:12px">
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Rest</span><button kpButton color="neutral" variant="outline" forceState="rest">Button</button></div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Hover</span><button kpButton color="neutral" variant="outline" forceState="hover">Button</button></div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Active</span><button kpButton color="neutral" variant="outline" forceState="active">Button</button></div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Focus</span><button kpButton color="neutral" variant="outline" forceState="focus">Button</button></div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Disabled</span><button kpButton color="neutral" variant="outline" forceState="disabled">Button</button></div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:10px;color: var(--kp-color-gray-600);text-transform:uppercase">Loading</span><button kpButton color="neutral" variant="outline" forceState="loading">Button</button></div>
          </div>
        </div>
      </div>`,
  }),
};
