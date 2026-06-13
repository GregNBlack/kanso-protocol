import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KpTableVirtualComponent, KpTableVirtualCellDirective } from './public-api';
import type { KpTableColumn } from '@kanso-protocol/ui/table';

interface Row { id: number; name: string; status: string; }

const COLUMNS: KpTableColumn<Row>[] = [
  { id: 'id', label: '#', width: '64px', align: 'right', accessor: (r) => r.id },
  { id: 'name', label: 'Name', accessor: (r) => r.name },
  { id: 'status', label: 'Status', width: '120px' },
];

@Component({
  imports: [KpTableVirtualComponent, KpTableVirtualCellDirective],
  template: `
    <kp-table-virtual
      [columns]="columns" [data]="data"
      [rowHeight]="40" [viewportHeight]="200"
      (rowClick)="onRowClick($event)">
      <ng-template kpVirtualTableCell="status" let-row>
        <span class="custom-status">[{{ row.status }}]</span>
      </ng-template>
    </kp-table-virtual>
  `,
})
class HostComponent {
  columns = COLUMNS;
  data: Row[] = Array.from({ length: 1000 }, (_, i) => ({
    id: i + 1, name: `User ${i + 1}`, status: i % 2 ? 'Active' : 'Pending',
  }));
  clicked: Row | null = null;
  onRowClick(r: Row) { this.clicked = r; }
}

describe('KpTableVirtualComponent', () => {
  let fix: ComponentFixture<HostComponent>;
  let host: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fix = TestBed.createComponent(HostComponent);
    host = fix.nativeElement as HTMLElement;
    fix.detectChanges();
  });

  it('renders one header cell per column with the labels', () => {
    const heads = Array.from(host.querySelectorAll('.kp-tv__hcell')).map((e) => e.textContent?.trim());
    expect(heads).toEqual(['#', 'Name', 'Status']);
  });

  it('windows the body — far fewer rows rendered than the dataset', () => {
    const rows = host.querySelectorAll('.kp-tv__row');
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.length).toBeLessThan(50); // 1000 rows, ~5 visible + overscan
  });

  it('renders accessor cells as text and custom-template cells', () => {
    const firstRow = host.querySelector('.kp-tv__row')!;
    const cells = firstRow.querySelectorAll('.kp-tv__cell');
    expect(cells[0].textContent?.trim()).toBe('1');          // id accessor
    expect(cells[1].textContent?.trim()).toBe('User 1');     // name accessor
    expect(firstRow.querySelector('.custom-status')?.textContent?.trim()).toBe('[Pending]'); // template
  });

  it('shares one grid-template-columns between header and rows', () => {
    const cmp = fix.debugElement.children[0].componentInstance as KpTableVirtualComponent<Row>;
    expect(cmp.gridCols).toBe('64px minmax(0, 1fr) 120px');
  });

  it('emits (rowClick) with the row on click', () => {
    (host.querySelector('.kp-tv__row') as HTMLElement).click();
    expect(fix.componentInstance.clicked?.id).toBe(1);
  });
});
