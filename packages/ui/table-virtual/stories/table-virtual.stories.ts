import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { KpTableVirtualComponent, KpTableVirtualCellDirective } from '../src/public-api';
import { KpBadgeComponent } from '@kanso-protocol/ui/badge';
import type { KpTableColumn } from '@kanso-protocol/ui/table';

interface Row { id: number; name: string; email: string; role: string; status: string; }

const STATUSES = ['Active', 'Pending', 'Suspended'];
const ROLES = ['Admin', 'Editor', 'Viewer'];
const DATA: Row[] = Array.from({ length: 5000 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: ROLES[i % 3],
  status: STATUSES[i % 3],
}));

const COLUMNS: KpTableColumn<Row>[] = [
  { id: 'id', label: '#', width: '64px', align: 'right', accessor: (r) => r.id },
  { id: 'name', label: 'Name', accessor: (r) => r.name },
  { id: 'email', label: 'Email', accessor: (r) => r.email },
  { id: 'role', label: 'Role', width: '120px', accessor: (r) => r.role },
  { id: 'status', label: 'Status', width: '140px' },
];

const meta: Meta<KpTableVirtualComponent<Row>> = {
  title: 'Components/TableVirtual',
  component: KpTableVirtualComponent,
  decorators: [moduleMetadata({ imports: [KpTableVirtualCellDirective, KpBadgeComponent] })],
};
export default meta;
type Story = StoryObj<KpTableVirtualComponent<Row>>;

export const TenThousandRows: Story = {
  name: '5,000 rows',
  render: () => ({
    props: { columns: COLUMNS, data: DATA, tone: (s: string) =>
      s === 'Active' ? 'success' : s === 'Pending' ? 'warning' : 'danger' },
    template: `
      <div style="width:840px">
        <kp-table-virtual
          [columns]="columns" [data]="data" [rowHeight]="44" [viewportHeight]="480"
          [striped]="true" [bordered]="true" ariaLabel="Users">
          <ng-template kpVirtualTableCell="status" let-row>
            <kp-badge size="sm" appearance="subtle" [color]="tone(row.status)">{{ row.status }}</kp-badge>
          </ng-template>
        </kp-table-virtual>
      </div>
    `,
  }),
};
