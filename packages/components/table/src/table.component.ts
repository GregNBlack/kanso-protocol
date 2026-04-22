import {
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  Directive,
  EventEmitter,
  Input,
  Output,
  QueryList,
  TemplateRef,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

export type KpTableSize = 'sm' | 'md' | 'lg';
export type KpTableSortDirection = 'asc' | 'desc';

export interface KpTableColumn<T = unknown> {
  /** Stable id matched against `<ng-template kpTableCell="id">` projections. */
  id: string;
  /** Header text. */
  label: string;
  /** Cell alignment. */
  align?: 'left' | 'center' | 'right';
  /** Enable sorting for this column. */
  sortable?: boolean;
  /** Flex-basis for the column (CSS length). Defaults to `auto` (content-sized). */
  width?: string;
  /** Fallback accessor when no `kpTableCell` template is provided. */
  accessor?: (row: T) => unknown;
}

export interface KpTableSort {
  columnId: string;
  direction: KpTableSortDirection;
}

/** `<ng-template kpTableCell="columnId" let-row let-i="index">` — custom cell renderer per column. */
@Directive({ selector: 'ng-template[kpTableCell]', standalone: true })
export class KpTableCellDirective {
  @Input('kpTableCell') columnId!: string;
  constructor(public readonly template: TemplateRef<unknown>) {}
}

/** `<ng-template kpTableHeader="columnId">` — custom header renderer per column. */
@Directive({ selector: 'ng-template[kpTableHeader]', standalone: true })
export class KpTableHeaderDirective {
  @Input('kpTableHeader') columnId!: string;
  constructor(public readonly template: TemplateRef<unknown>) {}
}

/**
 * Kanso Protocol — Table
 *
 * Data-driven table with a columns schema, sortable headers, optional
 * row selection, striped / bordered variants, and template-per-column
 * cell rendering via `<ng-template kpTableCell="id">`.
 *
 * @example
 * <kp-table [columns]="cols" [data]="rows" [selectable]="true" [(selected)]="picked">
 *   <ng-template kpTableCell="status" let-row>
 *     <kp-badge [color]="row.active ? 'success' : 'neutral'">
 *       {{ row.active ? 'Active' : 'Inactive' }}
 *     </kp-badge>
 *   </ng-template>
 * </kp-table>
 */
@Component({
  selector: 'kp-table',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClasses' },
  template: `
    <table class="kp-table__el">
      <thead class="kp-table__head">
        <tr class="kp-table__head-row">
          @if (selectable) {
            <th class="kp-table__cell kp-table__cell--checkbox" scope="col">
              <input
                type="checkbox"
                class="kp-table__checkbox"
                aria-label="Select all"
                [checked]="allSelected()"
                [indeterminate]="someSelected() && !allSelected()"
                (change)="toggleAll($event)"
              />
            </th>
          }
          @for (col of columns; track col.id) {
            <th
              class="kp-table__cell kp-table__cell--header"
              [class]="cellAlignClass(col)"
              [style.width]="col.width ?? null"
              scope="col"
            >
              <button
                type="button"
                class="kp-table__header-button"
                [class.kp-table__header-button--sortable]="col.sortable"
                [class.kp-table__header-button--active]="col.sortable && sort?.columnId === col.id"
                [attr.aria-sort]="col.sortable ? (sort?.columnId === col.id ? (sort?.direction === 'asc' ? 'ascending' : 'descending') : 'none') : null"
                [disabled]="!col.sortable"
                (click)="onHeaderClick(col)"
              >
                @if (headerTemplate(col.id); as tpl) {
                  <ng-container *ngTemplateOutlet="tpl"></ng-container>
                } @else {
                  {{ col.label }}
                }
                @if (col.sortable) {
                  <span class="kp-table__sort-icon" aria-hidden="true">
                    @if (sort?.columnId === col.id) {
                      @if (sort!.direction === 'asc') {
                        <svg viewBox="0 0 12 12" fill="none" width="10" height="10"><path d="M3 7l3-3 3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                      } @else {
                        <svg viewBox="0 0 12 12" fill="none" width="10" height="10"><path d="M3 5l3 3 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                      }
                    } @else {
                      <svg viewBox="0 0 12 12" fill="none" width="10" height="10"><path d="M4 4.5l2-2 2 2M4 7.5l2 2 2-2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    }
                  </span>
                }
              </button>
            </th>
          }
        </tr>
      </thead>

      <tbody class="kp-table__body">
        @for (row of data; track trackRow(row, $index); let i = $index) {
          <tr
            class="kp-table__row"
            [class.kp-table__row--selected]="isSelected(row)"
            (click)="onRowClick(row, $event)"
          >
            @if (selectable) {
              <td class="kp-table__cell kp-table__cell--checkbox">
                <input
                  type="checkbox"
                  class="kp-table__checkbox"
                  [attr.aria-label]="'Select row ' + (i + 1)"
                  [checked]="isSelected(row)"
                  (change)="toggleRow(row)"
                  (click)="$event.stopPropagation()"
                />
              </td>
            }
            @for (col of columns; track col.id) {
              <td class="kp-table__cell" [class]="cellAlignClass(col)">
                @if (cellTemplate(col.id); as tpl) {
                  <ng-container *ngTemplateOutlet="tpl; context: { $implicit: row, index: i, column: col }"></ng-container>
                } @else {
                  {{ col.accessor ? col.accessor(row) : '' }}
                }
              </td>
            }
          </tr>
        }

        @if (data.length === 0) {
          <tr class="kp-table__row kp-table__row--empty">
            <td class="kp-table__cell kp-table__cell--empty" [attr.colspan]="columnCount()">
              {{ emptyMessage }}
            </td>
          </tr>
        }
      </tbody>
    </table>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
      --kp-table-row-h: 48px;
      --kp-table-pad-x: 16px;
      --kp-table-fs: 14px;
      --kp-table-lh: 20px;
    }
    :host(.kp-table--sm) { --kp-table-row-h: 40px; --kp-table-pad-x: 12px; --kp-table-fs: 13px; --kp-table-lh: 18px; }
    :host(.kp-table--md) { --kp-table-row-h: 48px; --kp-table-pad-x: 16px; --kp-table-fs: 14px; --kp-table-lh: 20px; }
    :host(.kp-table--lg) { --kp-table-row-h: 56px; --kp-table-pad-x: 20px; --kp-table-fs: 15px; --kp-table-lh: 22px; }

    :host(.kp-table--bordered) .kp-table__el {
      border: 1px solid var(--kp-color-table-border, #E4E4E7);
      border-radius: 12px;
      overflow: hidden;
    }

    .kp-table__el {
      width: 100%;
      border-collapse: collapse;
      font-size: var(--kp-table-fs);
      line-height: var(--kp-table-lh);
      color: var(--kp-color-table-row-fg, #18181B);
    }

    .kp-table__head-row {
      background: var(--kp-color-table-header-bg, #FAFAFA);
      border-bottom: 1px solid var(--kp-color-table-border, #E4E4E7);
    }

    .kp-table__cell {
      padding: 0 var(--kp-table-pad-x);
      height: var(--kp-table-row-h);
      vertical-align: middle;
      text-align: left;
      color: inherit;
    }
    .kp-table__cell--center { text-align: center; }
    .kp-table__cell--right  { text-align: right; }
    .kp-table__cell--checkbox { width: 44px; padding-right: 0; }

    .kp-table__cell--header {
      font-size: 11px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--kp-color-table-header-fg, #3F3F46);
      white-space: nowrap;
    }

    .kp-table__header-button {
      all: unset;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      width: 100%;
      color: inherit;
    }
    .kp-table__header-button--sortable { cursor: pointer; }
    .kp-table__header-button--sortable:hover { color: var(--kp-color-table-row-fg, #18181B); }
    .kp-table__header-button--active { color: var(--kp-color-table-header-sort-active, #2563EB); }
    .kp-table__cell--right .kp-table__header-button { justify-content: flex-end; }
    .kp-table__cell--center .kp-table__header-button { justify-content: center; }

    .kp-table__sort-icon {
      display: inline-flex;
      color: var(--kp-color-table-header-sort-icon, #71717A);
    }
    .kp-table__header-button--active .kp-table__sort-icon {
      color: var(--kp-color-table-header-sort-active, #2563EB);
    }

    .kp-table__row {
      background: var(--kp-color-table-row-bg-rest, #FFFFFF);
      border-bottom: 1px solid var(--kp-color-table-border-soft, #F4F4F5);
      transition: background 80ms ease;
    }
    .kp-table__row:hover:not(.kp-table__row--selected):not(.kp-table__row--empty) {
      background: var(--kp-color-table-row-bg-hover, #FAFAFA);
    }
    :host(.kp-table--striped) .kp-table__row:nth-child(even):not(.kp-table__row--selected) {
      background: var(--kp-color-table-row-bg-hover, #FAFAFA);
    }
    .kp-table__row--selected {
      background: var(--kp-color-table-row-bg-selected, #EFF6FF) !important;
    }
    .kp-table__row:last-child { border-bottom: 0; }
    :host(.kp-table--selectable) .kp-table__row:not(.kp-table__row--empty) { cursor: pointer; }

    .kp-table__cell--empty {
      text-align: center;
      color: var(--kp-color-table-header-fg, #71717A);
      padding: 32px 16px;
      font-size: 13px;
    }

    .kp-table__checkbox {
      width: 16px;
      height: 16px;
      margin: 0;
      cursor: pointer;
      accent-color: var(--kp-color-blue-600, #2563EB);
    }
  `],
})
export class KpTableComponent<T = unknown> {
  @Input() size: KpTableSize = 'md';
  @Input() columns: KpTableColumn<T>[] = [];
  @Input() data: T[] = [];
  @Input() striped = false;
  @Input() bordered = false;
  @Input() selectable = false;
  @Input() selected: T[] = [];
  @Input() sort: KpTableSort | null = null;
  @Input() emptyMessage = 'No data';
  /** Override how rows are tracked in the `@for` loop (default: index). */
  @Input() trackBy: ((row: T, index: number) => unknown) | null = null;

  @Output() readonly selectedChange = new EventEmitter<T[]>();
  @Output() readonly sortChange = new EventEmitter<KpTableSort | null>();
  @Output() readonly rowClick = new EventEmitter<T>();

  @ContentChildren(KpTableCellDirective) cellTemplates!: QueryList<KpTableCellDirective>;
  @ContentChildren(KpTableHeaderDirective) headerTemplates!: QueryList<KpTableHeaderDirective>;

  get hostClasses(): string {
    const c = ['kp-table', `kp-table--${this.size}`];
    if (this.striped) c.push('kp-table--striped');
    if (this.bordered) c.push('kp-table--bordered');
    if (this.selectable) c.push('kp-table--selectable');
    return c.join(' ');
  }

  cellAlignClass(col: KpTableColumn<T>): string {
    return col.align === 'right' ? 'kp-table__cell--right'
         : col.align === 'center' ? 'kp-table__cell--center'
         : '';
  }

  columnCount(): number {
    return this.columns.length + (this.selectable ? 1 : 0);
  }

  cellTemplate(columnId: string): TemplateRef<unknown> | null {
    return this.cellTemplates?.find((d) => d.columnId === columnId)?.template ?? null;
  }
  headerTemplate(columnId: string): TemplateRef<unknown> | null {
    return this.headerTemplates?.find((d) => d.columnId === columnId)?.template ?? null;
  }

  trackRow(row: T, index: number): unknown {
    return this.trackBy ? this.trackBy(row, index) : index;
  }

  isSelected(row: T): boolean { return this.selected.includes(row); }
  allSelected(): boolean { return this.data.length > 0 && this.selected.length === this.data.length; }
  someSelected(): boolean { return this.selected.length > 0; }

  toggleRow(row: T): void {
    const next = this.isSelected(row)
      ? this.selected.filter((r) => r !== row)
      : [...this.selected, row];
    this.selected = next;
    this.selectedChange.emit(next);
  }

  toggleAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const next = checked ? [...this.data] : [];
    this.selected = next;
    this.selectedChange.emit(next);
  }

  onRowClick(row: T, _event: MouseEvent): void {
    this.rowClick.emit(row);
    if (this.selectable) this.toggleRow(row);
  }

  onHeaderClick(col: KpTableColumn<T>): void {
    if (!col.sortable) return;
    let next: KpTableSort | null;
    if (!this.sort || this.sort.columnId !== col.id) {
      next = { columnId: col.id, direction: 'asc' };
    } else if (this.sort.direction === 'asc') {
      next = { columnId: col.id, direction: 'desc' };
    } else {
      next = null; // clear sort on third click
    }
    this.sort = next;
    this.sortChange.emit(next);
  }
}
