import { FormsModule } from '@angular/forms';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  signal,
} from '@angular/core';

import { KpSelectComponent, KpSelectOption } from '@kanso-protocol/select';

import {
  KpPaginationItemComponent,
  KpPaginationItemSize,
  KpPaginationNavMode,
} from './pagination-item.component';

export type KpPaginationSize = KpPaginationItemSize;

type RangeCell = { kind: 'page'; page: number } | { kind: 'ellipsis'; key: string };

/**
 * Kanso Protocol — Pagination
 *
 * Page-strip with prev/next nav, page pills, and optional "Showing X of Y" +
 * items-per-page selector. Computes the truncation range itself — callers
 * only provide `currentPage`, `totalPages`, and (if wanted) items-per-page
 * state and listen for `(pageChange)` / `(itemsPerPageChange)`.
 *
 * @example
 * <kp-pagination
 *   [currentPage]="page"
 *   [totalPages]="20"
 *   [showItemsInfo]="true"
 *   [itemsPerPage]="pageSize"
 *   [itemsTotal]="total"
 *   [showItemsPerPage]="true"
 *   (pageChange)="page = $event"
 *   (itemsPerPageChange)="pageSize = $event"
 * />
 */
@Component({
  selector: 'kp-pagination',
  imports: [KpPaginationItemComponent, KpSelectComponent, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClasses', role: 'navigation', '[attr.aria-label]': 'ariaLabel' },
  template: `
    <div class="kp-pg__controls">
      @if (showPrevNext) {
        <kp-pagination-item
          type="nav"
          navDirection="prev"
          [navMode]="navMode"
          [size]="size"
          [disabled]="currentPage <= 1"
          (itemClick)="goto(currentPage - 1)"
        />
      }

      @for (cell of range(); track cell.kind === 'page' ? cell.page : cell.key) {
        @if (cell.kind === 'page') {
          <kp-pagination-item
            type="page"
            [size]="size"
            [page]="cell.page"
            [selected]="cell.page === currentPage"
            (itemClick)="goto(cell.page)"
          />
        } @else {
          <kp-pagination-item type="ellipsis" [size]="size"/>
        }
      }

      @if (showPrevNext) {
        <kp-pagination-item
          type="nav"
          navDirection="next"
          [navMode]="navMode"
          [size]="size"
          [disabled]="currentPage >= totalPages"
          (itemClick)="goto(currentPage + 1)"
        />
      }
    </div>

    @if (showItemsPerPage || showItemsInfo) {
      <div class="kp-pg__trailing">
        @if (showItemsPerPage) {
          <div class="kp-pg__per-page">
            <span class="kp-pg__per-page-label">{{ itemsPerPageLabel }}</span>
            <div class="kp-pg__per-page-select-wrap">
              <kp-select
                [size]="size"
                [options]="perPageOptions()"
                [ngModel]="itemsPerPage.toString()"
                [showClear]="false"
                (ngModelChange)="onPerPageChange($event)"
              />
            </div>
          </div>
        }
        @if (showItemsInfo) {
          <span class="kp-pg__info" aria-live="polite">{{ infoText() }}</span>
        }
      </div>
    }
  `,
  styles: [`
    :host {
      display: flex;
      align-items: center;
      gap: var(--kp-pg-gap);
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
    }

    .kp-pg__info {
      color: var(--kp-color-pagination-info, #52525B);
      font-size: var(--kp-pg-font-size);
      line-height: var(--kp-pg-line-height);
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }

    .kp-pg__controls {
      display: inline-flex;
      align-items: center;
      gap: var(--kp-pg-ctrl-gap);
    }

    .kp-pg__trailing {
      display: inline-flex;
      align-items: center;
      gap: var(--kp-pg-gap);
      margin-left: auto;
      flex: 0 0 auto;
    }

    .kp-pg__per-page {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      flex: 0 0 auto;
    }
    .kp-pg__per-page-label {
      color: var(--kp-color-pagination-info, #52525B);
      font-size: var(--kp-pg-font-size);
      line-height: var(--kp-pg-line-height);
      white-space: nowrap;
    }
    .kp-pg__per-page-select-wrap {
      display: inline-flex;
      width: var(--kp-pg-select-w);
      flex: 0 0 auto;
    }
    .kp-pg__per-page-select-wrap > kp-select {
      width: 100%;
      min-width: 0;
      flex: 1 1 auto;
    }

    :host(.kp-pg--sm) { --kp-pg-select-w: 88px; }
    :host(.kp-pg--md) { --kp-pg-select-w: 96px; }
    :host(.kp-pg--lg) { --kp-pg-select-w: 104px; }

    :host(.kp-pg--sm) {
      --kp-pg-gap: 12px;
      --kp-pg-ctrl-gap: 4px;
      --kp-pg-font-size: 12px;
      --kp-pg-line-height: 16px;
    }
    :host(.kp-pg--md),
    :host(.kp-pg--lg) {
      --kp-pg-gap: 16px;
      --kp-pg-ctrl-gap: 6px;
      --kp-pg-font-size: 14px;
      --kp-pg-line-height: 20px;
    }
  `],
})
export class KpPaginationComponent implements OnChanges {
  @Input() size: KpPaginationSize = 'md';
  @Input() navMode: KpPaginationNavMode = 'icon';
  @Input() currentPage = 1;
  @Input() totalPages = 1;

  @Input() showPrevNext = true;
  @Input() showItemsInfo = false;
  @Input() showItemsPerPage = false;

  @Input() itemsPerPage = 50;
  @Input() itemsTotal = 0;
  @Input() itemsPerPageOptions: number[] = [25, 50, 75, 100];
  @Input() itemsPerPageLabel = 'Per page';

  /** Sibling count on each side of the current page (in middle-truncation mode). Default 1. */
  @Input() siblingCount = 1;
  /** Pages pinned at each boundary. Default 1 — first and last always show. */
  @Input() boundaryCount = 1;

  @Input() ariaLabel = 'Pagination';

  @Output() readonly pageChange = new EventEmitter<number>();
  @Output() readonly itemsPerPageChange = new EventEmitter<number>();

  readonly range = signal<RangeCell[]>([]);
  readonly perPageOptions = signal<KpSelectOption[]>([]);

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['currentPage'] || changes['totalPages'] ||
      changes['siblingCount'] || changes['boundaryCount']
    ) {
      this.range.set(this.computeRange());
    }
    if (changes['itemsPerPageOptions']) {
      this.perPageOptions.set(
        this.itemsPerPageOptions.map((n) => ({ value: n.toString(), label: n.toString() })),
      );
    }
    if (this.range().length === 0) this.range.set(this.computeRange());
    if (this.perPageOptions().length === 0) {
      this.perPageOptions.set(
        this.itemsPerPageOptions.map((n) => ({ value: n.toString(), label: n.toString() })),
      );
    }
  }

  get hostClasses(): string {
    return `kp-pg kp-pg--${this.size}`;
  }

  goto(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.pageChange.emit(page);
  }

  onPerPageChange(value: string): void {
    const n = parseInt(value, 10);
    if (Number.isFinite(n)) this.itemsPerPageChange.emit(n);
  }

  infoText(): string {
    const from = (this.currentPage - 1) * this.itemsPerPage + 1;
    const to = Math.min(this.currentPage * this.itemsPerPage, this.itemsTotal);
    return `Showing ${from}–${to} of ${this.itemsTotal}`;
  }

  /**
   * Produce the visible cell sequence. Algorithm mirrors MUI's usePagination:
   * always render `boundaryCount` pages at each edge, plus `siblingCount`
   * around the current, inserting ellipsis gaps where needed. If the full
   * list would fit without any gap (boundaries + siblings + ellipses ≥
   * totalPages) we drop the gaps and show the range contiguously.
   */
  private computeRange(): RangeCell[] {
    const total = Math.max(1, this.totalPages);
    const current = Math.min(Math.max(1, this.currentPage), total);
    const siblings = Math.max(0, this.siblingCount);
    const boundary = Math.max(0, this.boundaryCount);

    const startPages = this.rangeOf(1, Math.min(boundary, total));
    const endPages = this.rangeOf(Math.max(total - boundary + 1, boundary + 1), total);

    const siblingStart = Math.max(
      Math.min(current - siblings, total - boundary - siblings * 2 - 1),
      boundary + 2,
    );
    const siblingEnd = Math.min(
      Math.max(current + siblings, boundary + siblings * 2 + 2),
      endPages.length > 0 ? endPages[0] - 2 : total - 1,
    );

    const items: (number | 'start-ellipsis' | 'end-ellipsis')[] = [
      ...startPages,
      ...(siblingStart > boundary + 2
        ? ['start-ellipsis' as const]
        : boundary + 1 < total - boundary
          ? [boundary + 1]
          : []),
      ...this.rangeOf(siblingStart, siblingEnd),
      ...(siblingEnd < total - boundary - 1
        ? ['end-ellipsis' as const]
        : total - boundary > boundary
          ? [total - boundary]
          : []),
      ...endPages,
    ];

    return items.map((it) =>
      typeof it === 'number'
        ? ({ kind: 'page', page: it } as RangeCell)
        : ({ kind: 'ellipsis', key: it } as RangeCell),
    );
  }

  private rangeOf(start: number, end: number): number[] {
    const length = end - start + 1;
    if (length <= 0) return [];
    return Array.from({ length }, (_, i) => start + i);
  }
}
