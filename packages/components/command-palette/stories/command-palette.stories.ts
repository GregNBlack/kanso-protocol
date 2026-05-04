import { Meta, StoryObj } from '@storybook/angular';
import {
  KpCommandPaletteComponent,
  KpCommandGroup,
} from '../src/command-palette.component';

const meta: Meta<KpCommandPaletteComponent> = {
  title: 'Components/CommandPalette',
  component: KpCommandPaletteComponent,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'], table: { defaultValue: { summary: 'md' } } },
    open: { control: 'boolean' },
    placeholder: { control: 'text' },
    emptyMessage: { control: 'text' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Modal command launcher (⌘K-style). Composes `<kp-dialog>` with internal input + grouped result list. Keyboard: ↑/↓ navigate, Enter select, Esc close. Global shortcut (default `mod+k`) toggles open.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<KpCommandPaletteComponent>;

const sampleGroups: KpCommandGroup[] = [
  {
    id: 'pages',
    label: 'Go to',
    items: [
      { id: 'inbox', label: 'Inbox', hint: '12 unread', shortcut: 'g i' },
      { id: 'projects', label: 'Projects', shortcut: 'g p' },
      { id: 'team', label: 'Team', shortcut: 'g t' },
      { id: 'settings', label: 'Settings', shortcut: 'g s' },
    ],
  },
  {
    id: 'actions',
    label: 'Actions',
    items: [
      { id: 'new', label: 'Create new project…', shortcut: 'C' },
      { id: 'invite', label: 'Invite teammate…' },
      { id: 'import', label: 'Import data…' },
      { id: 'logout', label: 'Log out', disabled: true },
    ],
  },
  {
    id: 'help',
    label: 'Help',
    items: [
      { id: 'docs', label: 'Open documentation' },
      { id: 'shortcuts', label: 'Show keyboard shortcuts', shortcut: '?' },
      { id: 'feedback', label: 'Send feedback' },
    ],
  },
];

export const Playground: Story = {
  args: {
    open: true,
    groups: sampleGroups,
    placeholder: 'Type a command or search…',
  },
};

export const Triggered: Story = {
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:12px;align-items:flex-start">
        <p style="font-size:13px;color:#6b7280;margin:0">
          Press <kbd style="padding:2px 6px;background:#f4f4f5;border-radius:4px;border:1px solid #e4e4e7">⌘K</kbd>
          (or <kbd style="padding:2px 6px;background:#f4f4f5;border-radius:4px;border:1px solid #e4e4e7">Ctrl+K</kbd> on Windows / Linux)
          to open the palette.
        </p>
        <kp-command-palette
          [(open)]="paletteOpen"
          [groups]="filteredGroups()"
          [filter]="filter"
          (filterChange)="onFilter($event)"
          (itemSelect)="lastSelected = $event.label"
        />
        <p style="font-size:12px;color:#a1a1aa;margin:0">
          Last selected: <strong>{{ lastSelected || '(nothing yet)' }}</strong>
        </p>
      </div>
    `,
    props: {
      paletteOpen: false,
      filter: '',
      lastSelected: '',
      _groups: sampleGroups,
      onFilter(this: any, v: string) { this.filter = v; },
      filteredGroups(this: any): KpCommandGroup[] {
        const q = (this.filter || '').toLowerCase().trim();
        if (!q) return this._groups;
        return this._groups
          .map((g: KpCommandGroup) => ({
            ...g,
            items: g.items.filter((i) => i.label.toLowerCase().includes(q)),
          }))
          .filter((g: KpCommandGroup) => g.items.length > 0);
      },
    },
  }),
};

export const EmptyState: Story = {
  args: {
    open: true,
    groups: [],
    emptyMessage: 'No commands match — try another search.',
  },
};

export const SmallSize: Story = {
  args: { open: true, size: 'sm', groups: sampleGroups },
};
