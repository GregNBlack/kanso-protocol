import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { KpTableComponent, KpTableCellDirective, KpTableColumn } from '../src';
import { KpBadgeComponent } from '@kanso-protocol/badge';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Viewer';
  active: boolean;
}

const users: User[] = [
  { id: 1, name: 'Alice Johnson',   email: 'alice@example.com',   role: 'Admin',  active: true  },
  { id: 2, name: 'Bob Chen',        email: 'bob@example.com',     role: 'Editor', active: true  },
  { id: 3, name: 'Carla Rodriguez', email: 'carla@example.com',   role: 'Viewer', active: false },
  { id: 4, name: 'Dmitry Sokolov',  email: 'dmitry@example.com',  role: 'Editor', active: true  },
  { id: 5, name: 'Elena Fischer',   email: 'elena@example.com',   role: 'Admin',  active: false },
];

const userColumns: KpTableColumn<User>[] = [
  { id: 'name',  label: 'Name',   sortable: true,  accessor: (r) => r.name },
  { id: 'email', label: 'Email',  sortable: true,  accessor: (r) => r.email },
  { id: 'role',  label: 'Role',   sortable: true },
  { id: 'status', label: 'Status', align: 'center' },
];

const meta: Meta<KpTableComponent<User>> = {
  title: 'Components/Table',
  component: KpTableComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [KpTableComponent, KpTableCellDirective, KpBadgeComponent] })],
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
};
export default meta;
type Story = StoryObj<KpTableComponent<User>>;

export const Default: Story = {
  args: { size: 'md', columns: userColumns, data: users, selectable: false, striped: false, bordered: true },
  render: (args) => ({
    props: args,
    template: `
      <kp-table [size]="size" [columns]="columns" [data]="data" [bordered]="bordered" [striped]="striped">
        <ng-template kpTableCell="role" let-row>
          <kp-badge [color]="row.role === 'Admin' ? 'primary' : 'neutral'" size="sm">{{ row.role }}</kp-badge>
        </ng-template>
        <ng-template kpTableCell="status" let-row>
          <kp-badge [color]="row.active ? 'success' : 'neutral'" size="sm">
            {{ row.active ? 'Active' : 'Inactive' }}
          </kp-badge>
        </ng-template>
      </kp-table>`,
  }),
};

export const Selectable: Story = {
  render: () => ({
    props: { columns: userColumns, data: users, selected: [users[0], users[2]] },
    template: `
      <kp-table [columns]="columns" [data]="data" [bordered]="true" [selectable]="true" [(selected)]="selected">
        <ng-template kpTableCell="role" let-row><kp-badge size="sm">{{ row.role }}</kp-badge></ng-template>
        <ng-template kpTableCell="status" let-row>
          <kp-badge [color]="row.active ? 'success' : 'neutral'" size="sm">{{ row.active ? 'Active' : 'Inactive' }}</kp-badge>
        </ng-template>
      </kp-table>
      <div style="margin-top:16px;font-size:12px;color: var(--kp-color-gray-500)">
        Selected {{ selected.length }} of {{ data.length }} — click a row or the header checkbox.
      </div>`,
  }),
};

export const Sortable: Story = {
  render: () => ({
    props: {
      columns: userColumns,
      data: [...users],
      sort: null as any,
      onSortChange(next: any) {
        this.sort = next;
        const sorted = [...users];
        if (next) {
          const field = next.columnId === 'role' ? (r: User) => r.role : userColumns.find((c) => c.id === next.columnId)?.accessor;
          if (field) sorted.sort((a, b) => (String(field(a)) > String(field(b)) ? 1 : -1) * (next.direction === 'asc' ? 1 : -1));
        }
        this.data = sorted;
      },
    },
    template: `
      <kp-table [columns]="columns" [data]="data" [bordered]="true" [sort]="sort" (sortChange)="onSortChange($event)">
        <ng-template kpTableCell="role" let-row><kp-badge size="sm">{{ row.role }}</kp-badge></ng-template>
        <ng-template kpTableCell="status" let-row>
          <kp-badge [color]="row.active ? 'success' : 'neutral'" size="sm">{{ row.active ? 'Active' : 'Inactive' }}</kp-badge>
        </ng-template>
      </kp-table>`,
  }),
};

export const Striped: Story = {
  render: () => ({
    props: { columns: userColumns, data: [...users, ...users.map((u) => ({ ...u, id: u.id + 10 }))] },
    template: `
      <kp-table [columns]="columns" [data]="data" [bordered]="true" [striped]="true">
        <ng-template kpTableCell="role" let-row><kp-badge size="sm">{{ row.role }}</kp-badge></ng-template>
        <ng-template kpTableCell="status" let-row>
          <kp-badge [color]="row.active ? 'success' : 'neutral'" size="sm">{{ row.active ? 'Active' : 'Inactive' }}</kp-badge>
        </ng-template>
      </kp-table>`,
  }),
};

export const Empty: Story = {
  render: () => ({
    props: { columns: userColumns, data: [] as User[] },
    template: `<kp-table [columns]="columns" [data]="data" [bordered]="true" emptyMessage="No users yet — add one to get started."/>`,
  }),
};

export const Compact: Story = {
  name: 'Compact (sm)',
  render: () => ({
    props: {
      columns: [
        { id: 'metric', label: 'Metric' },
        { id: 'value',  label: 'Value',  align: 'right' },
        { id: 'change', label: 'Change', align: 'right' },
      ] as KpTableColumn[],
      data: [
        { metric: 'Daily active users', value: '12,437', change: '+4.2%' },
        { metric: 'New signups',        value: '824',    change: '+12%' },
        { metric: 'Retention',          value: '67%',    change: '-0.8%' },
        { metric: 'Avg session',        value: '6m 22s', change: '+1.1%' },
        { metric: 'Revenue',            value: '$38,120', change: '+3.7%' },
      ],
    },
    template: `
      <kp-table size="sm" [bordered]="true" [columns]="columns" [data]="data">
        <ng-template kpTableCell="metric" let-row>{{ row.metric }}</ng-template>
        <ng-template kpTableCell="value" let-row><span style="font-variant-numeric:tabular-nums">{{ row.value }}</span></ng-template>
        <ng-template kpTableCell="change" let-row>
          <span [style.color]="row.change.startsWith('+') ? '#059669' : '#DC2626'" style="font-variant-numeric:tabular-nums">
            {{ row.change }}
          </span>
        </ng-template>
      </kp-table>`,
  }),
};
