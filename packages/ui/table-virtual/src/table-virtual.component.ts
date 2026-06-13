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
import {
  KpVirtualListComponent,
  KpVirtualRowDirective,
} from '@kanso-protocol/ui/virtual-list';
import { KpTableColumn, KpTableSize } from '@kanso-protocol/ui/table';

/** `<ng-template kpVirtualTableCell="columnId" let-row let-i="index">` — custom cell renderer per column. */
@Directive({ selector: 'ng-template[kpVirtualTableCell]', standalone: true })
export class KpTableVirtualCellDirective {
  @Input('kpVirtualTableCell') columnId!: string;
  constructor(public readonly template: TemplateRef<unknown>) {}
}

/**
 * Kanso Protocol — TableVirtual
 *
 * A windowed table for large datasets (>500 rows) — `<kp-table>` + `<kp-virtual-list>`
 * baked together so consumers don't wire virtualization by hand. A sticky header
 * sits above a virtualized body; columns align via a shared CSS grid template, so
 * give each column a `width` (or they share `1fr`). Fixed `[rowHeight]` (no
 * per-row measurement) keeps scrolling cheap.
 *
 * Semantics mirror `<kp-virtual-list>` (a windowed list of rows) — ARIA grid
 * semantics over a windowed set aren't sound, so this is a labelled list, not a
 * `role="grid"`. For small, fully-rendered tables use `<kp-table>`.
 *
 * @example
 * <kp-table-virtual
 *   [columns]="cols"
 *   [data]="rows"
 *   [rowHeight]="44"
 *   [viewportHeight]="480"
 *   ariaLabel="Transactions">
 *   <ng-template kpVirtualTableCell="status" let-row>
 *     <kp-badge size="sm">{{ row.status }}</kp-badge>
 *   </ng-template>
 * </kp-table-virtual>
 */
@Component({
  selector: 'kp-table-virtual',
  imports: [NgTemplateOutlet, KpVirtualListComponent, KpVirtualRowDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClasses' },
  template: `
    <div class="kp-tv__header" [style.gridTemplateColumns]="gridCols">
      @for (col of columns; track col.id) {
        <div class="kp-tv__hcell" [class]="alignClass(col)">{{ col.label }}</div>
      }
    </div>

    <kp-virtual-list
      class="kp-tv__body"
      [items]="data"
      [itemHeight]="rowHeight"
      [viewportHeight]="viewportHeight"
      [overscan]="overscan"
      [trackBy]="trackBy ?? undefined"
      [attr.aria-label]="ariaLabel || null"
    >
      <ng-template kpVirtualRow let-row let-i="index">
        <div
          class="kp-tv__row"
          [class.kp-tv__row--striped]="striped && i % 2 === 1"
          [style.gridTemplateColumns]="gridCols"
          (click)="rowClick.emit(row)"
        >
          @for (col of columns; track col.id) {
            <div class="kp-tv__cell" [class]="alignClass(col)">
              @if (cellTemplate(col.id); as tpl) {
                <ng-container *ngTemplateOutlet="tpl; context: { $implicit: row, index: i, column: col }"></ng-container>
              } @else {
                {{ col.accessor ? col.accessor(row) : '' }}
              }
            </div>
          }
        </div>
      </ng-template>
    </kp-virtual-list>
  `,
  styles: [`
    :host {
      display: block;
      box-sizing: border-box;
      border-radius: 12px;
      overflow: hidden;
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
      --kp-tv-pad-x: 16px;
      --kp-tv-fs: 14px;
    }
    :host(.kp-tv--sm) { --kp-tv-pad-x: 12px; --kp-tv-fs: 13px; }
    :host(.kp-tv--md) { --kp-tv-pad-x: 16px; --kp-tv-fs: 14px; }
    :host(.kp-tv--lg) { --kp-tv-pad-x: 20px; --kp-tv-fs: 15px; }
    :host(.kp-tv--bordered) { border: 1px solid var(--kp-color-table-border); }

    .kp-tv__header {
      display: grid;
      align-items: center;
      background: var(--kp-color-table-header-bg);
      color: var(--kp-color-table-header-fg);
      border-bottom: 1px solid var(--kp-color-table-border);
      font-size: var(--kp-tv-fs);
      font-weight: 600;
    }
    .kp-tv__hcell {
      padding: 10px var(--kp-tv-pad-x);
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .kp-tv__row {
      display: grid;
      align-items: center;
      height: 100%;
      background: var(--kp-color-table-row-bg-rest);
      border-bottom: 1px solid var(--kp-color-table-border-soft);
      font-size: var(--kp-tv-fs);
      color: var(--kp-color-text-default);
      cursor: default;
    }
    .kp-tv__row:hover { background: var(--kp-color-table-row-bg-hover); }
    .kp-tv__row--striped { background: var(--kp-color-table-row-bg-striped); }
    .kp-tv__cell {
      padding: 0 var(--kp-tv-pad-x);
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .kp-tv__hcell--center, .kp-tv__cell--center { text-align: center; justify-self: center; }
    .kp-tv__hcell--right,  .kp-tv__cell--right  { text-align: end;    justify-self: end; }
  `],
})
export class KpTableVirtualComponent<T = unknown> {
  @Input() columns: KpTableColumn<T>[] = [];
  @Input() data: T[] = [];
  @Input() size: KpTableSize = 'md';
  /** Fixed row height in px (no per-row measurement — keeps scrolling cheap). */
  @Input() rowHeight = 48;
  /** Height of the scrolling body viewport in px. */
  @Input() viewportHeight = 480;
  @Input() overscan = 4;
  @Input() striped = false;
  @Input() bordered = false;
  @Input() ariaLabel: string | null = null;
  @Input() trackBy: ((index: number, item: T) => unknown) | null = null;

  @Output() readonly rowClick = new EventEmitter<T>();

  @ContentChildren(KpTableVirtualCellDirective)
  private cellTemplates!: QueryList<KpTableVirtualCellDirective>;

  get hostClasses(): string {
    return `kp-tv kp-tv--${this.size}` + (this.bordered ? ' kp-tv--bordered' : '');
  }

  /** Shared `grid-template-columns` for the header + every row. */
  get gridCols(): string {
    return this.columns.map((c) => c.width ?? 'minmax(0, 1fr)').join(' ');
  }

  alignClass(col: KpTableColumn<T>): string {
    return col.align === 'right'
      ? 'kp-tv__cell--right'
      : col.align === 'center'
        ? 'kp-tv__cell--center'
        : '';
  }

  cellTemplate(columnId: string): TemplateRef<unknown> | null {
    return this.cellTemplates?.find((d) => d.columnId === columnId)?.template ?? null;
  }
}
