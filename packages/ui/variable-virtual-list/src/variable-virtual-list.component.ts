import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  inject,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

export interface KpVariableVirtualRange {
  start: number;
  end: number;
}

/**
 * Per-item height resolver. Given the absolute row index and the item, return
 * the pixel height that row will render at. Must be pure and stable for a given
 * `[items]` array — the component builds a cumulative-offset index from it and
 * only rebuilds when `[items]` or this function reference changes.
 */
export type KpItemHeightFn<T = unknown> = (index: number, item: T) => number;

/**
 * Marker directive — pairs the row template with `<kp-variable-virtual-list>`.
 *
 * @example
 * <kp-variable-virtual-list ...>
 *   <ng-template kpVariableVirtualRow let-item let-i="index">
 *     <div>row {{ i }}: {{ item.name }}</div>
 *   </ng-template>
 * </kp-variable-virtual-list>
 */
@Directive({
  selector: '[kpVariableVirtualRow]',
  standalone: true,
})
export class KpVariableVirtualRowDirective<T = unknown> {
  readonly template = inject(TemplateRef<{ $implicit: T; index: number }>);
}

/**
 * Kanso Protocol — VariableVirtualList
 *
 * Window-mode virtual scroller for **variable-height rows** — the sibling to
 * `<kp-virtual-list>`, which stays deliberately simple for the fixed-height
 * fast path. Renders only the rows currently visible in the viewport (plus a
 * configurable `[overscan]` buffer), sizing each row to the height returned by
 * `[itemHeight]`.
 *
 * How it works: on every `[items]` (or `[itemHeight]`) change it builds a
 * cumulative-offset prefix-sum array (`offsets[i]` = summed height of rows
 * 0..i-1, `offsets[n]` = total height). Mapping `scrollTop` to the first
 * visible row is then a binary search over that array — O(log n) per scroll,
 * not the O(1) of the fixed variant, but no per-scroll measurement pass and no
 * layout thrash. The spacer takes `offsets[n]` so the scrollbar is honest.
 *
 * When every row is the same height, the offsets are `i * h` and the visible
 * window / transform math reduces exactly to the fixed-height behaviour — so a
 * uniform `[itemHeight]` is byte-for-byte equivalent to `<kp-virtual-list>`.
 *
 * @example
 * <kp-variable-virtual-list
 *   [items]="rows"
 *   [itemHeight]="heightFor"
 *   [viewportHeight]="480"
 *   [overscan]="6"
 *   (rangeChange)="onRange($event)"
 * >
 *   <ng-template kpVariableVirtualRow let-row let-i="index">
 *     <div class="row">{{ row.body }}</div>
 *   </ng-template>
 * </kp-variable-virtual-list>
 *
 * // heightFor = (_i, row) => 32 + row.lines * 18;
 */
@Component({
  selector: 'kp-variable-virtual-list',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {},
  template: `
    <div
      #viewport
      class="kp-variable-virtual-list__viewport"
      [style.height.px]="viewportHeight"
      tabindex="0"
      (scroll)="onScroll()"
    >
      <div class="kp-variable-virtual-list__spacer" [style.height.px]="totalHeight">
        <!-- role="list" sits on the immediate parent of the listitems so
             aria-required-children resolves against direct children (the
             viewport/spacer wrappers between the host and the items
             confused axe's parent-child walk). aria-setsize/posinset are
             per-item, which is what the ARIA spec actually permits — they
             aren't valid on role="list" itself. -->
        <div
          class="kp-variable-virtual-list__window"
          role="list"
          [style.transform]="windowTransform"
        >
          @for (item of visibleItems; track trackByOrIndex($index, item); let i = $index) {
            <div
              class="kp-variable-virtual-list__row"
              role="listitem"
              [attr.aria-setsize]="items.length"
              [attr.aria-posinset]="visibleStart + i + 1"
              [style.height.px]="rowHeightAt(visibleStart + i)"
            >
              @if (rowTemplate) {
                <ng-container
                  *ngTemplateOutlet="rowTemplate.template; context: { $implicit: item, index: visibleStart + i }"
                />
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
    }
    .kp-variable-virtual-list__viewport {
      width: 100%;
      overflow-y: auto;
      overflow-x: hidden;
      position: relative;
      contain: strict;
      /* Explicit bg so axe-core's color-contrast walk-up resolves to a
         known surface for the row content. With contain:strict and an
         implicit transparent bg the walk-up gets confused and reports the
         row text against an indeterminate parent bg. The bg here is
         invisible in practice because every row template paints its own
         surface on top. */
      background: var(--kp-color-surface-base);
    }
    .kp-variable-virtual-list__spacer {
      position: relative;
      width: 100%;
    }
    .kp-variable-virtual-list__window {
      position: absolute;
      inset-block-start: 0;
      inset-inline: 0;
      will-change: transform;
    }
    .kp-variable-virtual-list__row {
      box-sizing: border-box;
      width: 100%;
    }
  `],
})
export class KpVariableVirtualListComponent<T = unknown> implements OnChanges, OnDestroy {
  /** The full list. The component never iterates the whole thing on scroll — only the visible window. */
  @Input() items: readonly T[] = [];

  /**
   * Per-item pixel height. Receives the absolute row index and item, returns a
   * finite positive height. A non-finite or non-positive return falls back to
   * `[estimatedItemHeight]`. Defaults to a uniform 40px — which makes the
   * component behave exactly like the fixed-height `<kp-virtual-list>`.
   */
  @Input() itemHeight: KpItemHeightFn<T> = () => 40;

  /** Fallback height used when `[itemHeight]` returns a non-finite/non-positive value. */
  @Input() estimatedItemHeight = 40;

  /** Pixel height of the scroll viewport. */
  @Input() viewportHeight = 400;

  /** Extra rows rendered above + below the visible window to soften scroll-flicker. */
  @Input() overscan = 4;

  /** Optional trackBy for the projected rows. Defaults to absolute index — fine for stable lists. */
  @Input() trackBy: ((index: number, item: T) => unknown) | null = null;

  @Output() readonly rangeChange = new EventEmitter<KpVariableVirtualRange>();

  @ViewChild('viewport', { static: true }) private viewportRef!: ElementRef<HTMLDivElement>;
  @ContentChild(KpVariableVirtualRowDirective) rowTemplate?: KpVariableVirtualRowDirective<T>;

  visibleStart = 0;
  visibleEnd = 0;

  /**
   * Cumulative-offset prefix sums. `offsets[i]` is the top edge of row `i`
   * (sum of the heights of rows 0..i-1); `offsets[items.length]` is the total
   * height. Length is always `items.length + 1`. Rebuilt only when the
   * geometry inputs change — not on scroll.
   */
  private offsets: number[] = [0];

  private readonly cdr = inject(ChangeDetectorRef);
  private readonly zone = inject(NgZone);

  ngOnChanges(changes: SimpleChanges): void {
    if ('items' in changes || 'itemHeight' in changes || 'estimatedItemHeight' in changes) {
      this.buildOffsets();
    }
    if (
      'items' in changes ||
      'itemHeight' in changes ||
      'estimatedItemHeight' in changes ||
      'viewportHeight' in changes ||
      'overscan' in changes
    ) {
      // Synchronous recompute: ngOnChanges fires BEFORE template eval in the
      // same CD pass, so visibleStart/End read by the template are already
      // up-to-date — no ExpressionChangedAfterItHasBeenChecked.
      this.recompute(/* fromInputChange */ true);
    }
  }

  ngOnDestroy(): void {
    /* nothing to unbind — (scroll) is a template listener */
  }

  get totalHeight(): number {
    return this.offsets[this.offsets.length - 1] ?? 0;
  }

  get visibleItems(): readonly T[] {
    return this.items.slice(this.visibleStart, this.visibleEnd);
  }

  get windowTransform(): string {
    return `translate3d(0, ${this.offsets[this.visibleStart] ?? 0}px, 0)`;
  }

  /** Rendered pixel height of the row at an absolute index (from the offset cache). */
  rowHeightAt(index: number): number {
    return (this.offsets[index + 1] ?? 0) - (this.offsets[index] ?? 0);
  }

  trackByOrIndex(index: number, item: T): unknown {
    if (this.trackBy) return this.trackBy(this.visibleStart + index, item);
    return this.visibleStart + index;
  }

  /** Imperatively scroll a specific row index into view. */
  scrollToIndex(index: number, position: 'start' | 'center' | 'end' = 'start'): void {
    const el = this.viewportRef?.nativeElement;
    if (!el) return;
    const clamped = Math.max(0, Math.min(index, this.items.length - 1));
    const top = this.offsets[clamped] ?? 0;
    const rowH = this.rowHeightAt(clamped);
    const target =
      position === 'start'
        ? top
        : position === 'end'
          ? top - this.viewportHeight + rowH
          : top - this.viewportHeight / 2 + rowH / 2;
    el.scrollTop = Math.max(0, Math.min(target, this.totalHeight - this.viewportHeight));
  }

  onScroll(): void {
    this.recompute(/* fromInputChange */ false);
  }

  /** Rebuild the cumulative-offset index from `[items]` + `[itemHeight]`. */
  private buildOffsets(): void {
    const n = this.items.length;
    const offsets = new Array<number>(n + 1);
    offsets[0] = 0;
    for (let i = 0; i < n; i++) {
      offsets[i + 1] = offsets[i] + this.measure(i, this.items[i]);
    }
    this.offsets = offsets;
  }

  private measure(index: number, item: T): number {
    const h = this.itemHeight(index, item);
    return Number.isFinite(h) && h > 0 ? h : this.estimatedItemHeight;
  }

  /** Largest index `i` in `[0, n)` whose top edge `offsets[i]` is <= scrollTop. */
  private firstVisibleIndex(scrollTop: number): number {
    let lo = 0;
    let hi = this.items.length - 1;
    let ans = 0;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (this.offsets[mid] <= scrollTop) {
        ans = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    return ans;
  }

  private recompute(fromInputChange: boolean): void {
    const el = this.viewportRef?.nativeElement;
    const scrollTop = el?.scrollTop ?? 0;
    const total = this.items.length;

    let start = 0;
    let end = 0;
    if (total > 0) {
      const first = this.firstVisibleIndex(scrollTop);
      const bottom = scrollTop + this.viewportHeight;
      // Advance to the first row whose TOP edge sits at/below the viewport
      // bottom — that index is the exclusive end of the visible span.
      let last = first;
      while (last < total && this.offsets[last] < bottom) last++;
      start = Math.max(0, first - this.overscan);
      end = Math.min(total, last + this.overscan);
    }

    if (this.visibleStart === start && this.visibleEnd === end) return;

    this.visibleStart = start;
    this.visibleEnd = end;

    if (!fromInputChange) {
      // Scroll-driven recompute happens outside CD; mark so the visible
      // window re-renders.
      this.cdr.markForCheck();
    }
    // Always defer the emit. From input changes: avoids reentrancy during CD.
    // From scroll: lets consumers mutate state without re-entering the current
    // event loop synchronously.
    queueMicrotask(() => this.rangeChange.emit({ start, end }));
  }
}
