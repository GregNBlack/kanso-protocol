import { Meta, StoryObj } from '@storybook/angular';
import { KpSearchBarComponent, KpSearchResultGroup } from '../src/search-bar.component';

const GROUPS: KpSearchResultGroup[] = [
  {
    label: 'Recent',
    items: [
      { id: 'r1', label: 'Design tokens', icon: 'file-text', shortcut: '⌘1' },
      { id: 'r2', label: 'Onboarding flow', icon: 'file-text', shortcut: '⌘2' },
      { id: 'r3', label: 'Q4 roadmap', icon: 'file-text', shortcut: '⌘3' },
    ],
  },
  {
    label: 'Actions',
    items: [
      { id: 'a1', label: 'Create new project', icon: 'plus' },
      { id: 'a2', label: 'Invite member', icon: 'user-plus' },
      { id: 'a3', label: 'Go to settings', icon: 'settings' },
    ],
  },
  {
    label: 'Pages',
    items: [
      { id: 'p1', label: 'Dashboard', icon: 'layout-dashboard' },
      { id: 'p2', label: 'Team', icon: 'users' },
    ],
  },
];

const meta: Meta<KpSearchBarComponent> = {
  title: 'Patterns/SearchBar',
  component: KpSearchBarComponent,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'inline-radio', options: ['inline','command-palette'], table: { defaultValue: { summary: 'inline' } } },
    size:    { control: 'inline-radio', options: ['sm','md','lg'], table: { defaultValue: { summary: 'md' } } },
    showShortcutHint: { control: 'boolean', table: { defaultValue: { summary: 'true' } } },
  },
};
export default meta;
type Story = StoryObj<KpSearchBarComponent>;

export const Playground: Story = {
  args: { variant: 'inline', size: 'md', showShortcutHint: true, placeholder: 'Search anything...' },
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:16px">
        <kp-search-bar variant="inline" size="sm"/>
        <kp-search-bar variant="inline" size="md"/>
        <kp-search-bar variant="inline" size="lg"/>
      </div>
    `,
  }),
};

export const States: Story = {
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:16px">
        <kp-search-bar variant="inline" size="md"/>
        <kp-search-bar variant="inline" size="md" value="design tokens"/>
        <kp-search-bar variant="inline" size="md" [showShortcutHint]="false"/>
      </div>
    `,
  }),
};

export const CommandPalette: Story = {
  args: { variant: 'command-palette', placeholder: 'Type a command or search...', value: 'design' },
  render: (args) => ({
    props: { ...args, groups: GROUPS },
    template: `
      <div style="padding:40px;background:rgba(0,0,0,0.06);border-radius:16px;display:flex;justify-content:center">
        <kp-search-bar variant="command-palette" [placeholder]="placeholder" [value]="value" [groups]="groups"/>
      </div>
    `,
  }),
};
