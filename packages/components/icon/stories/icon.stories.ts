import { Meta, StoryObj } from '@storybook/angular';
import { KpIconComponent } from '../src/icon.component';
import {
  KP_ICON_REGISTRY,
  TABLER_OUTLINED_NAMES,
  TABLER_FILLED_NAMES,
} from '../src/index';

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

const meta: Meta<KpIconComponent> = {
  title: 'Components/Icon',
  component: KpIconComponent,
  tags: ['autodocs'],
  argTypes: {
    name: { control: 'text' },
    size: {
      control: 'inline-radio',
      options: SIZES,
      table: { defaultValue: { summary: 'md' } },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Inline SVG icon driven by the bundled Tabler Icons set. Five sizes — `xs` 14px → `xl` 24px — with stroke-width auto-tuned per size for optical balance. Filled variants use the `-filled` suffix (`star-filled`). Extend at runtime via `KP_ICON_REGISTRY.register(name, svg)`.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<KpIconComponent>;

export const Playground: Story = {
  args: { name: 'search', size: 'md' },
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display:flex;gap:24px;align-items:end">
        <kp-icon name="search" size="xs"/>
        <kp-icon name="search" size="sm"/>
        <kp-icon name="search" size="md"/>
        <kp-icon name="search" size="lg"/>
        <kp-icon name="search" size="xl"/>
      </div>
    `,
  }),
};

export const OutlineVsFilled: Story = {
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:18px;font-family:Onest,system-ui,sans-serif">
        <div style="display:flex;gap:24px;align-items:center">
          <span style="width:64px;font-size:12px;color: var(--kp-color-gray-500)">Outline</span>
          <kp-icon name="star" size="lg"/>
          <kp-icon name="bell" size="lg"/>
          <kp-icon name="bookmark" size="lg"/>
          <kp-icon name="folder" size="lg"/>
          <kp-icon name="check" size="lg"/>
        </div>
        <div style="display:flex;gap:24px;align-items:center">
          <span style="width:64px;font-size:12px;color: var(--kp-color-gray-500)">Filled</span>
          <kp-icon name="star-filled" size="lg"/>
          <kp-icon name="bell-filled" size="lg"/>
          <kp-icon name="bookmark-filled" size="lg"/>
          <kp-icon name="folder-filled" size="lg"/>
          <kp-icon name="check-filled" size="lg"/>
        </div>
      </div>
    `,
  }),
};

export const Color: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Icons render with `currentColor`, so set `color` on the parent (or via a token like `--kp-color-text-primary`) to recolor without touching the SVG.',
      },
    },
  },
  render: () => ({
    template: `
      <div style="display:flex;gap:28px;align-items:center;font-family:Onest,system-ui,sans-serif">
        <span style="color: var(--kp-color-gray-700);display:inline-flex;gap:6px;align-items:center"><kp-icon name="info-circle" size="md"/> Default</span>
        <span style="color:#2563EB;display:inline-flex;gap:6px;align-items:center"><kp-icon name="info-circle" size="md"/> Primary</span>
        <span style="color:#16A34A;display:inline-flex;gap:6px;align-items:center"><kp-icon name="circle-check" size="md"/> Success</span>
        <span style="color:#D97706;display:inline-flex;gap:6px;align-items:center"><kp-icon name="alert-triangle" size="md"/> Warning</span>
        <span style="color:#DC2626;display:inline-flex;gap:6px;align-items:center"><kp-icon name="alert-circle" size="md"/> Danger</span>
      </div>
    `,
  }),
};

export const CustomRegistration: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Need an icon outside the bundled set? Call `KP_ICON_REGISTRY.register(name, svg)` once at startup and use it like any built-in.',
      },
    },
  },
  render: () => {
    KP_ICON_REGISTRY.register(
      'kp-mark',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20 L12 4 L20 20 Z"/><path d="M8 14 H16"/></svg>',
    );
    return {
      template: `
        <div style="display:flex;gap:18px;align-items:center;font-family:Onest,system-ui,sans-serif">
          <kp-icon name="kp-mark" size="md"/>
          <kp-icon name="kp-mark" size="lg"/>
          <kp-icon name="kp-mark" size="xl"/>
          <code style="font-size:12px;color: var(--kp-color-gray-500)">KP_ICON_REGISTRY.register('kp-mark', svg)</code>
        </div>
      `,
    };
  },
};

export const Outlined: Story = {
  parameters: {
    docs: {
      description: {
        story: `All ${TABLER_OUTLINED_NAMES.length} bundled outline icons. Names match Tabler 1:1 (kebab-case).`,
      },
    },
  },
  render: () => ({
    props: { names: TABLER_OUTLINED_NAMES },
    template: `
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:12px;font-family:Onest,system-ui,sans-serif">
        @for (n of names; track n) {
          <div style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 8px;border:1px solid rgba(0,0,0,.06);border-radius:8px">
            <kp-icon [name]="n" size="md"/>
            <span style="font-size:11px;color: var(--kp-color-gray-500);text-align:center;word-break:break-word">{{n}}</span>
          </div>
        }
      </div>
    `,
  }),
};

export const Filled: Story = {
  parameters: {
    docs: {
      description: {
        story: `All ${TABLER_FILLED_NAMES.length} bundled filled icons. Use the \`-filled\` suffix.`,
      },
    },
  },
  render: () => ({
    props: { names: TABLER_FILLED_NAMES },
    template: `
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:12px;font-family:Onest,system-ui,sans-serif">
        @for (n of names; track n) {
          <div style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 8px;border:1px solid rgba(0,0,0,.06);border-radius:8px">
            <kp-icon [name]="n" size="md"/>
            <span style="font-size:11px;color: var(--kp-color-gray-500);text-align:center;word-break:break-word">{{n}}</span>
          </div>
        }
      </div>
    `,
  }),
};
