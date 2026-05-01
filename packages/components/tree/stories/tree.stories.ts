import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { KpTreeComponent, KpTreeNode } from '../src';

const fileSystem: KpTreeNode[] = [
  {
    id: 'docs',
    label: 'Documents',
    children: [
      {
        id: 'projects',
        label: 'Projects',
        children: [
          {
            id: 'kp',
            label: 'Kanso Protocol',
            children: [
              { id: 'kp-src', label: 'src/', children: [{ id: 'kp-components', label: 'components/' }] },
              { id: 'kp-docs', label: 'docs/' },
              { id: 'kp-readme', label: 'README.md' },
            ],
          },
          { id: 'other', label: 'Other project', children: [{ id: 'other-dummy', label: 'main.ts' }] },
        ],
      },
      { id: 'personal', label: 'Personal', children: [{ id: 'taxes', label: 'Taxes.pdf' }] },
    ],
  },
  { id: 'downloads', label: 'Downloads', children: [{ id: 'dl-file', label: 'installer.dmg' }] },
];

const org: KpTreeNode[] = [
  {
    id: 'co',
    label: 'Company',
    children: [
      {
        id: 'eng',
        label: 'Engineering',
        badge: 24,
        children: [
          {
            id: 'fe',
            label: 'Frontend',
            badge: 8,
            children: [
              { id: 'alpha', label: 'Team Alpha' },
              { id: 'beta',  label: 'Team Beta' },
            ],
          },
          { id: 'be',  label: 'Backend', badge: 12 },
          { id: 'do',  label: 'DevOps',  badge: 4 },
        ],
      },
      { id: 'des', label: 'Design', badge: 6 },
      { id: 'ops', label: 'Operations', badge: 3, disabled: true },
    ],
  },
];

const permissions: KpTreeNode[] = [
  {
    id: 'root',
    label: 'All permissions',
    children: [
      { id: 'users', label: 'Users', children: [
        { id: 'users-view',   label: 'View users' },
        { id: 'users-edit',   label: 'Edit users' },
        { id: 'users-delete', label: 'Delete users' },
      ]},
      { id: 'projects', label: 'Projects', children: [
        { id: 'projects-view',   label: 'View projects' },
        { id: 'projects-edit',   label: 'Edit projects' },
      ]},
    ],
  },
];

const meta: Meta<KpTreeComponent> = {
  title: 'Components/Tree',
  component: KpTreeComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [KpTreeComponent] })],
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md'] },
  },
};
export default meta;
type Story = StoryObj<KpTreeComponent>;

export const Default: Story = {
  args: { size: 'md', data: fileSystem },
  render: (args) => ({
    props: { ...args, expanded: ['docs', 'projects', 'kp'], selected: 'kp-readme' as string | null },
    template: `
      <div style="width:420px">
        <kp-tree
          [size]="size"
          [data]="data"
          [(expanded)]="expanded"
          [(selected)]="selected"
        />
        <div style="margin-top:12px;font-size:12px;color: var(--kp-color-gray-500)">
          Selected: {{ selected ?? '—' }}
        </div>
      </div>`,
  }),
};

export const Small: Story = {
  render: () => ({
    props: { data: fileSystem, expanded: ['docs', 'projects'] as string[] },
    template: `<div style="width:360px"><kp-tree size="sm" [data]="data" [(expanded)]="expanded"/></div>`,
  }),
};

export const WithBadges: Story = {
  render: () => ({
    props: { data: org, expanded: ['co', 'eng', 'fe'] as string[] },
    template: `<div style="width:360px"><kp-tree [data]="data" [(expanded)]="expanded"/></div>`,
  }),
};

export const WithCheckboxes: Story = {
  name: 'With checkboxes',
  render: () => ({
    props: {
      data: permissions,
      expanded: ['root', 'users', 'projects'] as string[],
      checked: ['users-view', 'users-edit', 'projects-view', 'projects-edit'] as string[],
    },
    template: `
      <div style="width:420px">
        <kp-tree [data]="data" [showCheckboxes]="true" [(expanded)]="expanded" [(checked)]="checked"/>
        <div style="margin-top:12px;font-size:12px;color: var(--kp-color-gray-500)">
          Checked leaves: {{ checked.length }}
        </div>
      </div>`,
  }),
};

export const NoIcons: Story = {
  name: 'No icons',
  render: () => ({
    props: { data: fileSystem, expanded: ['docs'] as string[] },
    template: `<div style="width:360px"><kp-tree [data]="data" [showIcons]="false" [(expanded)]="expanded"/></div>`,
  }),
};
