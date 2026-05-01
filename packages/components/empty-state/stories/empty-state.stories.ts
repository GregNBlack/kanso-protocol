import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { KpEmptyStateComponent } from '../src/empty-state.component';

const meta: Meta<KpEmptyStateComponent> = {
  title: 'Components/EmptyState',
  component: KpEmptyStateComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [KpEmptyStateComponent] })],
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
};
export default meta;
type Story = StoryObj<KpEmptyStateComponent>;

const inboxIcon = `<svg kpEmptyStateIcon viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M4 13 L4 5 H20 V13"/><path d="M4 13 L8 13 L9 16 H15 L16 13 L20 13 V19 H4 Z"/>
</svg>`;
const searchIcon = `<svg kpEmptyStateIcon viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="11" cy="11" r="7"/><path d="M21 21 L16 16"/>
</svg>`;
const folderIcon = `<svg kpEmptyStateIcon viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M3 7 V19 H21 V9 H12 L10 7 Z"/><path d="M12 13 V17 M10 15 H14"/>
</svg>`;
const alertIcon = `<svg kpEmptyStateIcon viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 3 L22 20 L2 20 Z"/><path d="M12 10 V14"/><circle cx="12" cy="17" r="0.5"/>
</svg>`;

const cap = `font-size:11px;color: var(--kp-color-gray-600);margin-top:8px;display:block`;
const btn = (label: string, primary = true) =>
  `<button style="all:unset;padding:8px 16px;border-radius:8px;font-family:Onest,system-ui;font-size:14px;font-weight:500;cursor:pointer;${primary ? 'background:#2563EB;color:#fff' : 'color: var(--kp-color-gray-700)'}">${label}</button>`;

export const Default: Story = {
  args: { size: 'md', title: 'No items yet', description: 'Get started by creating your first item.' },
  render: (args) => ({
    props: { ...args, inboxIcon },
    template: `
      <kp-empty-state [size]="size" [title]="title" [description]="description">
        <span [innerHTML]="inboxIcon"></span>
        <div kpEmptyStateActions>${btn('Create item')}</div>
      </kp-empty-state>`,
  }),
};

export const Sizes: Story = {
  render: () => ({
    props: { inboxIcon },
    template: `
      <div style="display:flex;flex-direction:column;gap:24px">
        <kp-empty-state size="sm" title="Small" description="Compact for narrow areas.">
          <span [innerHTML]="inboxIcon"></span>
        </kp-empty-state>
        <span style="${cap}">Small</span>

        <kp-empty-state size="md" title="Medium" description="Default — page-level.">
          <span [innerHTML]="inboxIcon"></span>
        </kp-empty-state>
        <span style="${cap}">Medium (default)</span>

        <kp-empty-state size="lg" title="Large" description="For full-page heroes.">
          <span [innerHTML]="inboxIcon"></span>
        </kp-empty-state>
        <span style="${cap}">Large</span>
      </div>`,
  }),
};

export const UseCases: Story = {
  name: 'Use Cases',
  render: () => ({
    props: { inboxIcon, searchIcon, folderIcon, alertIcon },
    template: `
      <div style="display:flex;flex-direction:column;gap:48px">
        <div style="border: 1px solid var(--kp-color-gray-200);border-radius:12px;padding:24px;background: var(--kp-color-gray-50)">
          <kp-empty-state title="Inbox zero 🎉" description="No new messages. We'll notify you when something arrives.">
            <span [innerHTML]="inboxIcon"></span>
            <div kpEmptyStateActions>${btn('Refresh')}</div>
          </kp-empty-state>
          <span style="${cap}">Empty inbox</span>
        </div>

        <div style="border: 1px solid var(--kp-color-gray-200);border-radius:12px;padding:24px;background: var(--kp-color-gray-50)">
          <kp-empty-state title="No results found" description="Try adjusting your search or browse all items.">
            <span [innerHTML]="searchIcon"></span>
            <div kpEmptyStateActions>${btn('Clear filters')}${btn('Browse all', false)}</div>
          </kp-empty-state>
          <span style="${cap}">No search results</span>
        </div>

        <div style="border: 1px solid var(--kp-color-gray-200);border-radius:12px;padding:24px;background: var(--kp-color-gray-50)">
          <kp-empty-state title="No files yet" description="Drag and drop files here or click to browse.">
            <span [innerHTML]="folderIcon"></span>
            <div kpEmptyStateActions>${btn('Upload files')}${btn('Import from URL', false)}</div>
          </kp-empty-state>
          <span style="${cap}">Empty project</span>
        </div>

        <div style="border: 1px solid var(--kp-color-gray-200);border-radius:12px;padding:24px;background: var(--kp-color-gray-50)">
          <kp-empty-state title="Something went wrong" description="We couldn't load this page. Try again or contact support.">
            <span style="color:#DC2626" [innerHTML]="alertIcon"></span>
            <div kpEmptyStateActions>${btn('Retry')}${btn('Contact support', false)}</div>
          </kp-empty-state>
          <span style="${cap}">Error state — alert icon override to red</span>
        </div>
      </div>`,
  }),
};
