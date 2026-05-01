import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { KpTooltipComponent } from '../src/tooltip.component';
import { KpBadgeComponent } from '@kanso-protocol/badge';

const meta: Meta<KpTooltipComponent> = {
  title: 'Components/Tooltip',
  component: KpTooltipComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [KpBadgeComponent] })],
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md'], table: { defaultValue: { summary: 'md' } } },
    arrowPosition: { control: 'select', options: ['none', 'top', 'right', 'bottom', 'left'], table: { defaultValue: { summary: 'none' } } },
  },
};
export default meta;
type Story = StoryObj<KpTooltipComponent>;

export const Default: Story = {
  args: { size: 'md', arrowPosition: 'none', label: 'Tooltip' },
  render: (args) => ({
    props: args,
    template: `<kp-tooltip [size]="size" [arrowPosition]="arrowPosition" [label]="label" [shortcut]="shortcut"/>`,
  }),
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display:flex;align-items:flex-end;gap:40px">
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <kp-tooltip size="sm" label="Tooltip text"/>
          <span style="font-size:11px;color: var(--kp-color-gray-500)">sm</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <kp-tooltip size="md" label="Tooltip text"/>
          <span style="font-size:11px;color: var(--kp-color-gray-500)">md</span>
        </div>
      </div>`,
  }),
};

export const ArrowPositions: Story = {
  name: 'Arrow Positions',
  render: () => ({
    template: `
      <div style="display:flex;align-items:center;gap:60px;padding:24px 12px">
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <kp-tooltip arrowPosition="none"   label="Tooltip"/>
          <span style="font-size:11px;color: var(--kp-color-gray-500)">None</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <kp-tooltip arrowPosition="top"    label="Tooltip"/>
          <span style="font-size:11px;color: var(--kp-color-gray-500)">Top</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <kp-tooltip arrowPosition="bottom" label="Tooltip"/>
          <span style="font-size:11px;color: var(--kp-color-gray-500)">Bottom</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <kp-tooltip arrowPosition="left"   label="Tooltip"/>
          <span style="font-size:11px;color: var(--kp-color-gray-500)">Left</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <kp-tooltip arrowPosition="right"  label="Tooltip"/>
          <span style="font-size:11px;color: var(--kp-color-gray-500)">Right</span>
        </div>
      </div>`,
  }),
};

export const WithShortcut: Story = {
  name: 'With Shortcut',
  render: () => ({
    template: `
      <div style="display:flex;align-items:center;gap:24px;flex-wrap:wrap">
        <kp-tooltip arrowPosition="bottom" label="Search"   shortcut="\u2318K"/>
        <kp-tooltip arrowPosition="bottom" label="Save"     shortcut="\u2318S"/>
        <kp-tooltip arrowPosition="bottom" label="Undo"     shortcut="\u2318Z"/>
        <kp-tooltip arrowPosition="bottom" label="Copy"     shortcut="\u2318C"/>
        <kp-tooltip arrowPosition="bottom" label="New file" shortcut="\u2318N"/>
      </div>`,
  }),
};

export const UseCases: Story = {
  name: 'Use Cases',
  render: () => ({
    template: `
      <div style="display:flex;align-items:flex-start;gap:48px;padding:24px 8px">
        <div style="display:flex;flex-direction:column;align-items:center;gap:4px">
          <kp-tooltip size="sm" arrowPosition="bottom" label="Delete"/>
          <div style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;background: var(--kp-color-gray-100);border-radius:12px">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3F3F46" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/>
            </svg>
          </div>
        </div>

        <div style="display:flex;align-items:center;gap:4px">
          <kp-badge color="warning" appearance="subtle">Beta</kp-badge>
          <kp-tooltip size="sm" arrowPosition="left" label="Experimental feature"/>
        </div>

        <div style="display:flex;flex-direction:column;align-items:center;gap:4px">
          <span style="font-family:Onest,system-ui,sans-serif;font-weight:500;font-size:14px;color:#2563EB;cursor:pointer">Learn more</span>
          <kp-tooltip size="md" arrowPosition="top" label="Opens documentation in new tab"/>
        </div>

        <div style="display:flex;flex-direction:column;align-items:center;gap:4px">
          <kp-tooltip size="md" arrowPosition="bottom" label="Quick search" shortcut="\u2318K"/>
          <div style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;background: var(--kp-color-gray-100);border-radius:12px">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3F3F46" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>
            </svg>
          </div>
        </div>
      </div>`,
  }),
};

export const LongText: Story = {
  name: 'Long Text',
  render: () => ({
    template: `
      <div style="display:flex;align-items:flex-end;gap:40px">
        <kp-tooltip arrowPosition="bottom"
                    label="This is a longer tooltip that wraps to two lines when the content exceeds the maximum width."/>
        <kp-tooltip arrowPosition="bottom"
                    label="Short text stays on one line"/>
      </div>`,
  }),
};
