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
    arrowAlign: { control: 'inline-radio', options: ['start', 'center', 'end'], table: { defaultValue: { summary: 'center' } } },
  },
};
export default meta;
type Story = StoryObj<KpTooltipComponent>;

export const Default: Story = {
  args: { size: 'md', arrowPosition: 'none', arrowAlign: 'center', label: 'Tooltip' },
  render: (args) => ({
    props: args,
    template: `<kp-tooltip [size]="size" [arrowPosition]="arrowPosition" [arrowAlign]="arrowAlign" [label]="label" [shortcut]="shortcut"/>`,
  }),
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display:flex;align-items:flex-end;gap:40px">
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <kp-tooltip size="sm" label="Tooltip text"/>
          <span style="font-size:11px;color: var(--kp-color-gray-600)">sm</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <kp-tooltip size="md" label="Tooltip text"/>
          <span style="font-size:11px;color: var(--kp-color-gray-600)">md</span>
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
          <span style="font-size:11px;color: var(--kp-color-gray-600)">None</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <kp-tooltip arrowPosition="top"    label="Tooltip"/>
          <span style="font-size:11px;color: var(--kp-color-gray-600)">Top</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <kp-tooltip arrowPosition="bottom" label="Tooltip"/>
          <span style="font-size:11px;color: var(--kp-color-gray-600)">Bottom</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <kp-tooltip arrowPosition="left"   label="Tooltip"/>
          <span style="font-size:11px;color: var(--kp-color-gray-600)">Left</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <kp-tooltip arrowPosition="right"  label="Tooltip"/>
          <span style="font-size:11px;color: var(--kp-color-gray-600)">Right</span>
        </div>
      </div>`,
  }),
};

export const ArrowAlignment: Story = {
  name: 'Arrow Alignment (edge-of-viewport)',
  parameters: {
    docs: {
      description: {
        story:
          'When the trigger sits near a viewport edge, use `arrowAlign="start"` or `"end"` ' +
          'so the body shifts inward while the arrow stays anchored to the trigger. ' +
          'Each column simulates a trigger position on the screen.',
      },
    },
  },
  render: () => ({
    template: `
      <style>
        .kp-tooltip-grid {
          display:grid;
          grid-template-columns:repeat(3, minmax(0, 1fr));
          gap:48px 56px;
          padding:32px 24px;
          align-items:start;
        }
        .kp-tooltip-cell {
          display:flex;
          flex-direction:column;
          align-items:center;
          gap:10px;
        }
        .kp-tooltip-cell--start { align-items:flex-start; }
        .kp-tooltip-cell--end   { align-items:flex-end; }
        .kp-tooltip-row-label {
          grid-column:1 / -1;
          font-size:13px;
          font-weight:600;
          color:var(--kp-color-text-strong);
          margin-top:8px;
        }
        .kp-tooltip-row-label:first-of-type { margin-top:0; }
        .kp-tooltip-caption {
          font-size:11px;
          color:var(--kp-color-text-muted);
        }
      </style>

      <div class="kp-tooltip-grid">
        <!-- ==================== TOP arrow (tooltip below trigger) ==================== -->
        <div class="kp-tooltip-row-label">arrowPosition="top" — tooltip sits BELOW trigger</div>

        <div class="kp-tooltip-cell kp-tooltip-cell--start">
          <kp-tooltip arrowPosition="top" arrowAlign="start" label="Edit profile and switch workspace"/>
          <span class="kp-tooltip-caption">align=start · trigger near LEFT edge</span>
        </div>
        <div class="kp-tooltip-cell">
          <kp-tooltip arrowPosition="top" arrowAlign="center" label="Edit profile and switch workspace"/>
          <span class="kp-tooltip-caption">align=center · default</span>
        </div>
        <div class="kp-tooltip-cell kp-tooltip-cell--end">
          <kp-tooltip arrowPosition="top" arrowAlign="end" label="Edit profile and switch workspace"/>
          <span class="kp-tooltip-caption">align=end · trigger near RIGHT edge</span>
        </div>

        <!-- ==================== BOTTOM arrow (tooltip above trigger) ==================== -->
        <div class="kp-tooltip-row-label">arrowPosition="bottom" — tooltip sits ABOVE trigger</div>

        <div class="kp-tooltip-cell kp-tooltip-cell--start">
          <kp-tooltip arrowPosition="bottom" arrowAlign="start" label="Edit profile and switch workspace"/>
          <span class="kp-tooltip-caption">align=start · trigger near LEFT edge</span>
        </div>
        <div class="kp-tooltip-cell">
          <kp-tooltip arrowPosition="bottom" arrowAlign="center" label="Edit profile and switch workspace"/>
          <span class="kp-tooltip-caption">align=center · default</span>
        </div>
        <div class="kp-tooltip-cell kp-tooltip-cell--end">
          <kp-tooltip arrowPosition="bottom" arrowAlign="end" label="Edit profile and switch workspace"/>
          <span class="kp-tooltip-caption">align=end · trigger near RIGHT edge</span>
        </div>

        <!-- ==================== RIGHT arrow (tooltip LEFT of trigger) ==================== -->
        <!-- Two-line label so the vertical align=start/center/end shift is visible —
             a single-line body has no height to slide arrow within. -->
        <div class="kp-tooltip-row-label">arrowPosition="right" — tooltip sits LEFT of trigger</div>

        <div class="kp-tooltip-cell">
          <kp-tooltip arrowPosition="right" arrowAlign="start" label="Edit profile and switch workspace"/>
          <span class="kp-tooltip-caption">align=start · trigger near TOP edge</span>
        </div>
        <div class="kp-tooltip-cell">
          <kp-tooltip arrowPosition="right" arrowAlign="center" label="Edit profile and switch workspace"/>
          <span class="kp-tooltip-caption">align=center · default</span>
        </div>
        <div class="kp-tooltip-cell">
          <kp-tooltip arrowPosition="right" arrowAlign="end" label="Edit profile and switch workspace"/>
          <span class="kp-tooltip-caption">align=end · trigger near BOTTOM edge</span>
        </div>

        <!-- ==================== LEFT arrow (tooltip RIGHT of trigger) ==================== -->
        <div class="kp-tooltip-row-label">arrowPosition="left" — tooltip sits RIGHT of trigger</div>

        <div class="kp-tooltip-cell">
          <kp-tooltip arrowPosition="left" arrowAlign="start" label="Edit profile and switch workspace"/>
          <span class="kp-tooltip-caption">align=start · trigger near TOP edge</span>
        </div>
        <div class="kp-tooltip-cell">
          <kp-tooltip arrowPosition="left" arrowAlign="center" label="Edit profile and switch workspace"/>
          <span class="kp-tooltip-caption">align=center · default</span>
        </div>
        <div class="kp-tooltip-cell">
          <kp-tooltip arrowPosition="left" arrowAlign="end" label="Edit profile and switch workspace"/>
          <span class="kp-tooltip-caption">align=end · trigger near BOTTOM edge</span>
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
