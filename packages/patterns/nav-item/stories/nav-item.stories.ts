import { Meta, StoryObj } from '@storybook/angular';
import { KpNavItemComponent } from '../src/nav-item.component';

const meta: Meta<KpNavItemComponent> = {
  title: 'Patterns/NavItem',
  component: KpNavItemComponent,
  tags: ['autodocs'],
  argTypes: {
    size:  { control: 'inline-radio', options: ['sm','md','lg'], table: { defaultValue: { summary: 'md' } } },
    depth: { control: { type: 'number', min: 0, max: 3 }, table: { defaultValue: { summary: '0' } } },
  },
};
export default meta;
type Story = StoryObj<KpNavItemComponent>;

const ICON = `<svg kpNavItemIcon viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12l8-8 8 8M6 10v10h12V10"/></svg>`;

export const Playground: Story = {
  args: { size: 'md', label: 'Dashboard', active: true },
  render: (args) => ({
    props: args,
    template: `<div style="width:240px;padding:8px;background: var(--kp-color-white);border: 1px solid var(--kp-color-gray-200);border-radius:8px;font-family:Onest,system-ui,sans-serif"><kp-nav-item [size]="size" [depth]="depth" [label]="label" [active]="active" [disabled]="disabled" [hasChildren]="hasChildren" [expanded]="expanded" [showIcon]="showIcon">${ICON}</kp-nav-item></div>`,
  }),
};

export const States: Story = {
  render: () => ({
    template: `
      <div style="width:240px;padding:8px;background: var(--kp-color-white);border: 1px solid var(--kp-color-gray-200);border-radius:8px;font-family:Onest,system-ui,sans-serif;display:flex;flex-direction:column;gap:2px">
        <kp-nav-item size="md" label="Rest">${ICON}</kp-nav-item>
        <kp-nav-item size="md" label="Active" [active]="true">${ICON}</kp-nav-item>
        <kp-nav-item size="md" label="Disabled" [disabled]="true">${ICON}</kp-nav-item>
        <kp-nav-item size="md" label="With chevron" [hasChildren]="true">${ICON}</kp-nav-item>
        <kp-nav-item size="md" label="Expanded" [hasChildren]="true" [expanded]="true">${ICON}</kp-nav-item>
        <kp-nav-item size="md" label="Nested" [depth]="1" [showIcon]="false"/>
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="width:240px;padding:8px;background: var(--kp-color-white);border: 1px solid var(--kp-color-gray-200);border-radius:8px;font-family:Onest,system-ui,sans-serif;display:flex;flex-direction:column;gap:2px">
        <kp-nav-item size="sm" label="Small">${ICON}</kp-nav-item>
        <kp-nav-item size="md" label="Medium">${ICON}</kp-nav-item>
        <kp-nav-item size="lg" label="Large">${ICON}</kp-nav-item>
      </div>
    `,
  }),
};
