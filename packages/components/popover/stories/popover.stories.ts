import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { KpPopoverComponent } from '../src/popover.component';
import { KpButtonComponent } from '@kanso-protocol/button';

const meta: Meta<KpPopoverComponent> = {
  parameters: {
    a11y: { config: { rules: [{ id: 'landmark-unique', enabled: false }, { id: 'landmark-no-duplicate-contentinfo', enabled: false }] } },
  },
  title: 'Components/Popover',
  component: KpPopoverComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [KpButtonComponent] })],
  argTypes: {
    size:          { control: 'inline-radio', options: ['sm', 'md', 'lg'], table: { defaultValue: { summary: 'md' } } },
    arrowPosition: {
      control: 'select',
      options: [
        'none',
        'top-start', 'top-center', 'top-end',
        'right-start', 'right-center', 'right-end',
        'bottom-start', 'bottom-center', 'bottom-end',
        'left-start', 'left-center', 'left-end',
      ],
      table: { defaultValue: { summary: 'none' } },
    },
    showHeader:        { control: 'boolean', table: { defaultValue: { summary: 'true' } } },
    showHeaderDivider: { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
    showFooter:        { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
    showFooterDivider: { control: 'boolean', table: { defaultValue: { summary: 'true' } } },
    closable:          { control: 'boolean', table: { defaultValue: { summary: 'true' } } },
  },
};
export default meta;
type Story = StoryObj<KpPopoverComponent>;

export const Default: Story = {
  args: {
    size: 'md', arrowPosition: 'none',
    title: 'Popover title', description: 'Optional description text',
    showHeader: true, showFooter: false, closable: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <kp-popover [size]="size" [arrowPosition]="arrowPosition"
                  [title]="title" [description]="description"
                  [showHeader]="showHeader" [showHeaderDivider]="showHeaderDivider"
                  [showFooter]="showFooter" [showFooterDivider]="showFooterDivider"
                  [closable]="closable">
        Popover content goes here. Replace this slot with any component or layout.
      </kp-popover>`,
  }),
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display:flex;align-items:flex-start;gap:32px;flex-wrap:wrap;padding:40px">
        <kp-popover size="sm" title="Small popover" description="Compact variant" [closable]="false">
          Popover content goes here. Replace this slot with any component or layout.
        </kp-popover>
        <kp-popover size="md" title="Medium popover (default)" description="Typical variant" [closable]="false">
          Popover content goes here. Replace this slot with any component or layout.
        </kp-popover>
        <kp-popover size="lg" title="Large popover" description="Spacious variant" [closable]="false">
          Popover content goes here. Replace this slot with any component or layout.
        </kp-popover>
      </div>`,
  }),
};

export const ArrowPositions: Story = {
  name: 'Arrow Positions',
  render: () => {
    const positions: Array<Array<string>> = [
      ['top-start',    'top-center',    'top-end'],
      ['right-start',  'right-center',  'right-end'],
      ['bottom-start', 'bottom-center', 'bottom-end'],
      ['left-start',   'left-center',   'left-end'],
    ];
    const rows = positions.map(row =>
      `<div style="display:flex;align-items:flex-start;gap:80px">
        ${row.map(p => `
          <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
            <kp-popover size="sm" arrowPosition="${p}" title="Popover" [closable]="true">
              Body content.
            </kp-popover>
            <span style="font-size:11px;color: var(--kp-color-gray-500)">${p}</span>
          </div>`).join('')}
      </div>`
    ).join('');
    return {
      template: `<div style="display:flex;flex-direction:column;gap:80px;padding:40px">${rows}</div>`,
    };
  },
};

export const Composition: Story = {
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:24px;padding:40px;align-items:flex-start">
        <kp-popover title="Header only" [closable]="false">
          Popover content goes here. Replace this slot with any component or layout.
        </kp-popover>

        <kp-popover title="Header with description" description="Short description" [closable]="false">
          Popover content goes here. Replace this slot with any component or layout.
        </kp-popover>

        <kp-popover [showHeader]="false" [showFooter]="true">
          Only body and footer. No header. Useful for confirmation dialogs.
          <kp-button kpPopoverFooter size="sm" variant="ghost" color="neutral">Cancel</kp-button>
          <kp-button kpPopoverFooter size="sm">Confirm</kp-button>
        </kp-popover>

        <kp-popover title="Full composition" description="Header, body and footer with dividers."
                    [closable]="true" [showHeaderDivider]="true" [showFooter]="true" [showFooterDivider]="true">
          Body content with dividers above and below.
          <kp-button kpPopoverFooter size="sm" variant="ghost" color="neutral">Cancel</kp-button>
          <kp-button kpPopoverFooter size="sm">Confirm</kp-button>
        </kp-popover>
      </div>`,
  }),
};

export const UseCases: Story = {
  name: 'Use Cases',
  render: () => ({
    props: { onCancel: () => undefined, onDelete: () => undefined, onShare: () => undefined },
    template: `
      <div style="display:flex;flex-direction:column;gap:64px;padding:40px;align-items:flex-start">
        <kp-popover size="sm" arrowPosition="top-center"
                    title="Delete this item?" description="This action cannot be undone."
                    [closable]="false" [showFooter]="true">
          <kp-button kpPopoverFooter size="sm" variant="ghost" color="neutral" (click)="onCancel()">Cancel</kp-button>
          <kp-button kpPopoverFooter size="sm" color="danger" (click)="onDelete()">Delete</kp-button>
        </kp-popover>

        <kp-popover size="md" arrowPosition="right-start"
                    title="How credits work" [closable]="false">
          Credits are consumed for each API request. 1 credit = 1 token in the response.
          Unused credits roll over monthly.
        </kp-popover>

        <kp-popover size="md" arrowPosition="bottom-end"
                    title="Share" [closable]="true">
          <div style="display:flex;flex-direction:column;gap:8px">
            <span>Copy link</span>
            <span>Email</span>
            <span>Embed</span>
          </div>
        </kp-popover>
      </div>`,
  }),
};
