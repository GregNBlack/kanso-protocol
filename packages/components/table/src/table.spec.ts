import { TestBed } from '@angular/core/testing';
import { KpTableColumn, KpTableComponent } from './table.component';

interface Row {
  id: string;
  name: string;
  age: number;
}

const COLUMNS: KpTableColumn<Row>[] = [
  { id: 'name', label: 'Name', sortable: true, accessor: (r) => r.name },
  { id: 'age',  label: 'Age',  sortable: true, align: 'right', accessor: (r) => r.age },
  { id: 'note', label: 'Note', accessor: () => '—' },
];

const ROWS: Row[] = [
  { id: 'a', name: 'Alice', age: 30 },
  { id: 'b', name: 'Bob',   age: 25 },
  { id: 'c', name: 'Carol', age: 41 },
];

describe('KpTableComponent', () => {
  function setup(extra: Record<string, unknown> = {}) {
    TestBed.configureTestingModule({ imports: [KpTableComponent] });
    const fix = TestBed.createComponent(KpTableComponent<Row>);
    fix.componentRef.setInput('columns', COLUMNS);
    fix.componentRef.setInput('data', ROWS);
    for (const [k, v] of Object.entries(extra)) fix.componentRef.setInput(k, v);
    fix.detectChanges();
    return { fix, host: fix.nativeElement as HTMLElement, cmp: fix.componentInstance };
  }

  const headerCells = (host: HTMLElement) =>
    Array.from(host.querySelectorAll('.kp-table__cell--header'));
  const rows = (host: HTMLElement) =>
    Array.from(host.querySelectorAll('tbody .kp-table__row'));

  it('renders one header cell per column and one row per data item', () => {
    const { host } = setup();
    expect(headerCells(host).length).toBe(3);
    expect(rows(host).length).toBe(3);
  });

  it('uses the column accessor when no kpTableCell template is provided', () => {
    const { host } = setup();
    const firstNameCell = host.querySelectorAll('tbody .kp-table__row')[0]
      .querySelectorAll('.kp-table__cell')[0];
    expect(firstNameCell.textContent?.trim()).toBe('Alice');
  });

  it('renders the empty-message row when data is empty', () => {
    const { host } = setup({ data: [] });
    const empty = host.querySelector('.kp-table__row--empty .kp-table__cell--empty');
    expect(empty).not.toBeNull();
    expect(empty!.textContent?.trim()).toBe('No data');
  });

  it('emptyMessage row spans every visible column (incl. checkbox)', () => {
    const { fix, host, cmp } = setup({ data: [], selectable: true });
    fix.detectChanges();
    const empty = host.querySelector('.kp-table__cell--empty');
    expect(empty?.getAttribute('colspan')).toBe(String(cmp.columnCount()));
  });

  it('aria-sort=none on sortable columns when no sort is active', () => {
    const { host } = setup();
    const nameBtn = headerCells(host)[0].querySelector('button')!;
    expect(nameBtn.getAttribute('aria-sort')).toBe('none');
  });

  it('clicking a sortable header cycles asc → desc → null and emits sortChange', () => {
    const { fix, host, cmp } = setup();
    const sortChange = vi.fn();
    cmp.sortChange.subscribe(sortChange);
    const nameBtn = headerCells(host)[0].querySelector('button')!;
    nameBtn.click();
    expect(sortChange).toHaveBeenLastCalledWith({ columnId: 'name', direction: 'asc' });
    fix.detectChanges();
    nameBtn.click();
    expect(sortChange).toHaveBeenLastCalledWith({ columnId: 'name', direction: 'desc' });
    nameBtn.click();
    expect(sortChange).toHaveBeenLastCalledWith(null);
  });

  it('clicking a non-sortable header is a no-op', () => {
    const { host, cmp } = setup();
    const sortChange = vi.fn();
    cmp.sortChange.subscribe(sortChange);
    const noteBtn = headerCells(host)[2].querySelector('button')!;
    noteBtn.click();
    expect(sortChange).not.toHaveBeenCalled();
  });

  it('selectable mode renders a select-all checkbox column', () => {
    const { host } = setup({ selectable: true });
    expect(host.querySelector('thead .kp-table__cell--checkbox')).not.toBeNull();
    expect(host.querySelectorAll('tbody .kp-table__cell--checkbox').length).toBe(3);
  });

  it('toggleRow adds / removes a row from selection and emits selectedChange', () => {
    const { cmp } = setup({ selectable: true });
    const spy = vi.fn();
    cmp.selectedChange.subscribe(spy);
    cmp.toggleRow(ROWS[0]);
    expect(spy).toHaveBeenLastCalledWith([ROWS[0]]);
    cmp.toggleRow(ROWS[0]);
    expect(spy).toHaveBeenLastCalledWith([]);
  });

  it('toggleAll(true) selects every row; toggleAll(false) clears', () => {
    const { cmp } = setup({ selectable: true });
    cmp.toggleAll(true);
    expect(cmp.allSelected()).toBe(true);
    cmp.toggleAll(false);
    expect(cmp.someSelected()).toBe(false);
  });

  it('row click emits rowClick and toggles selection in selectable mode', () => {
    const { host, cmp } = setup({ selectable: true });
    const click = vi.fn();
    cmp.rowClick.subscribe(click);
    (rows(host)[0] as HTMLElement).click();
    expect(click).toHaveBeenCalledWith(ROWS[0]);
    expect(cmp.isSelected(ROWS[0])).toBe(true);
  });

  it('hostClasses include size, striped, bordered, selectable when set', () => {
    const { host } = setup({ size: 'lg', striped: true, bordered: true, selectable: true });
    expect(host.classList.contains('kp-table--lg')).toBe(true);
    expect(host.classList.contains('kp-table--striped')).toBe(true);
    expect(host.classList.contains('kp-table--bordered')).toBe(true);
    expect(host.classList.contains('kp-table--selectable')).toBe(true);
  });

  it('cellAlignClass maps column alignment to the right BEM modifier', () => {
    const { cmp } = setup();
    expect(cmp.cellAlignClass({ id: 'x', label: 'X', align: 'right' })).toBe('kp-table__cell--right');
    expect(cmp.cellAlignClass({ id: 'x', label: 'X', align: 'center' })).toBe('kp-table__cell--center');
    expect(cmp.cellAlignClass({ id: 'x', label: 'X' })).toBe('');
  });

  it('trackRow uses custom trackBy when provided, else falls back to index', () => {
    const { cmp } = setup();
    expect(cmp.trackRow(ROWS[0], 7)).toBe(7);
    cmp.trackBy = (r) => r.id;
    expect(cmp.trackRow(ROWS[0], 0)).toBe('a');
  });
});
