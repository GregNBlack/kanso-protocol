import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { KpTooltipDirective } from '../src/tooltip.directive';
import { KpClipboardCopyDirective } from '../src/clipboard-copy.directive';
import { KpButtonComponent } from '@kanso-protocol/ui/button';
import { KpBadgeComponent } from '@kanso-protocol/ui/badge';

const meta: Meta = {
  title: 'Components/Tooltip',
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [KpTooltipDirective, KpClipboardCopyDirective, KpButtonComponent, KpBadgeComponent] })],
  parameters: {
    docs: {
      description: {
        component:
          'Directive-based tooltip. Attach to any focusable element with `[kpTooltip]`. ' +
          'Auto-shows on hover and focus, hides on leave / blur / Escape. Positions itself ' +
          'against the trigger with viewport-edge flipping; renders into the nearest open ' +
          '`<dialog>` (so it sits above modals) or `document.body`.',
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => ({
    template: `
      <div style="display:flex;gap:24px;padding:80px 24px">
        <button kpButton variant="default" color="primary" [kpTooltip]="'Save changes to the document'">Save</button>
        <button kpButton variant="outline" color="primary" [kpTooltip]="'Discard unsaved edits'">Cancel</button>
      </div>`,
  }),
};

export const Positions: Story = {
  render: () => ({
    template: `
      <div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:48px;padding:80px 24px;justify-items:center">
        <button kpButton variant="default" [kpTooltip]="'Tooltip on top'" kpTooltipPosition="top">Top</button>
        <button kpButton variant="default" [kpTooltip]="'Tooltip on right'" kpTooltipPosition="right">Right</button>
        <button kpButton variant="default" [kpTooltip]="'Tooltip on bottom'" kpTooltipPosition="bottom">Bottom</button>
        <button kpButton variant="default" [kpTooltip]="'Tooltip on left'" kpTooltipPosition="left">Left</button>
      </div>`,
  }),
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display:flex;gap:24px;padding:80px 24px">
        <button kpButton variant="default" [kpTooltip]="'Small tooltip'" kpTooltipSize="sm">Small</button>
        <button kpButton variant="default" [kpTooltip]="'Medium tooltip (default)'" kpTooltipSize="md">Medium</button>
      </div>`,
  }),
};

export const WithShortcut: Story = {
  name: 'With Shortcut',
  render: () => ({
    template: `
      <div style="display:flex;gap:16px;padding:80px 24px">
        <button kpButton variant="outline" [kpTooltip]="'Search anywhere'" kpTooltipShortcut="⌘K">Search</button>
        <button kpButton variant="outline" [kpTooltip]="'Save current document'" kpTooltipShortcut="⌘S">Save</button>
        <button kpButton variant="outline" [kpTooltip]="'Undo last change'" kpTooltipShortcut="⌘Z">Undo</button>
      </div>`,
  }),
};

export const ConditionallyDisabled: Story = {
  name: 'Conditional / Disabled',
  parameters: {
    docs: {
      description: {
        story:
          'Pass `null` or an empty string as the tooltip text to suppress the tooltip — useful when ' +
          'the label is only meaningful in certain states (e.g. collapsed sidebar nav items).',
      },
    },
  },
  render: () => ({
    template: `
      <div style="display:flex;gap:16px;padding:80px 24px;align-items:center">
        <button kpButton [kpTooltip]="null">No tooltip (null)</button>
        <button kpButton [kpTooltip]="''">No tooltip (empty)</button>
        <button kpButton [kpTooltip]="'I have a tooltip'" [kpTooltipDisabled]="true">Tooltip force-disabled</button>
        <button kpButton variant="default" color="primary" [kpTooltip]="'I work normally'">I work</button>
      </div>`,
  }),
};

export const IconButtonHints: Story = {
  name: 'Icon button hints',
  render: () => ({
    template: `
      <div style="display:flex;gap:12px;padding:80px 24px">
        <button kpButton iconOnly variant="ghost" [kpTooltip]="'Delete item'" kpTooltipPosition="bottom" aria-label="Delete">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/>
          </svg>
        </button>
        <button kpButton iconOnly variant="ghost" [kpTooltip]="'Edit'" kpTooltipPosition="bottom" aria-label="Edit">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"/>
          </svg>
        </button>
        <button kpButton iconOnly variant="ghost" [kpTooltip]="'Share'" kpTooltipPosition="bottom" aria-label="Share">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>
          </svg>
        </button>
      </div>`,
  }),
};

export const NextToBadge: Story = {
  name: 'Next to a badge',
  render: () => ({
    template: `
      <div style="display:flex;align-items:center;gap:8px;padding:80px 24px">
        <span style="font-size:14px;color:var(--kp-color-text-default)">Status:</span>
        <kp-badge color="warning" appearance="subtle">Beta</kp-badge>
        <span tabindex="0" [kpTooltip]="'Experimental — API may change before stable'" kpTooltipPosition="right"
              style="display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:50%;background:var(--kp-color-surface-muted);color:var(--kp-color-text-muted);font-size:12px;cursor:help">?</span>
      </div>`,
  }),
};

export const TemplateContent: Story = {
  name: 'Custom content (TemplateRef)',
  parameters: {
    docs: {
      description: {
        story:
          'Pass a `TemplateRef` to `[kpTooltip]` instead of a string to project ' +
          'rich content — icons, formatted text, multiple lines.',
      },
    },
  },
  render: () => ({
    template: `
      <div style="display:flex;gap:24px;padding:80px 24px">
        <button kpButton variant="outline" [kpTooltip]="rich">Rich tooltip</button>
      </div>
      <ng-template #rich>
        <div style="display:flex;align-items:center;gap:8px">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
          </svg>
          <span><strong>Pro tip:</strong> press ⌘K to search</span>
        </div>
      </ng-template>`,
  }),
};

export const ClipboardCopy: Story = {
  name: 'Clipboard copy directive',
  parameters: {
    docs: {
      description: {
        story:
          'The `[kpClipboardCopy]` directive copies text to the clipboard on click ' +
          'and shows a brief confirmation hint (reuses the tooltip chrome).',
      },
    },
  },
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:16px;padding:40px 24px;align-items:flex-start">
        <button kpButton variant="outline" [kpClipboardCopy]="'npm i @kanso-protocol/ui'">
          Copy install command
        </button>

        <code [kpClipboardCopy]="'sk_live_abc123'" kpClipboardHint="Token copied!"
              style="cursor:pointer;padding:6px 10px;border-radius:6px;background:var(--kp-color-surface-muted);font-family:monospace;font-size:13px">
          sk_live_abc123
        </code>
      </div>`,
  }),
};
