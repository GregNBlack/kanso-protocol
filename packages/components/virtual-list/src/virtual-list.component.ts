import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
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

export interface KpVirtualRange {
  start: number;
  end: number;
}

/**
 * Marker directive — pairs the row template with `<kp-virtual-list>`.
 *
 * @example
 * <kp-virtual-list ...>
 *   <ng-template kpVirtualRow let-item let-i="index">
 *     <div>row {{ i }}: {{ item.name }}</div>
 *   </ng-template>
 * </kp-virtual-list>
 */
@Directive({
  selector: '[kpVirtualRow]',
  standalone: true,
})
export class KpVirtualRowDirective<T = unknown> {
  readonly template = inject(TemplateRef<{ $implicit: T; index: number }>);
}

/**
 * Kanso Protocol — VirtualList
 *
 * Window-mode virtual scroller for **fixed-height rows**. Renders only the
 * rows currently visible in the viewport (plus a configurable `[overscan]`
 * buffer). Lets the consumer hand any item shape via a projected
 * `<ng-template kpVirtualRow let-item let-i="index">`.
 *
 * Why fixed-height: keeps the math O(1) per scroll event (`scrollTop /
 * itemHeight`), no measurement pass, no layout thrash. Variable-height
 * support is on the roadmap (`KpVariableVirtualListComponent`); for now,
 * size each row to a uniform height.
 *
 * Use this for tables / message lists / log views with thousands of rows.
 * Below ~100 rows just render them — virtualization adds complexity for
 * negligible gain.
 *
 * @example
 * <kp-virtual-list
 *   [items]="rows"
 *   [itemHeight]="40"
 *   [viewportHeight]="480"
 *   [overscan]="6"
 *   (rangeChange)="onRange($event)"
 * >
 *   <ng-template kpVirtualRow let-row let-i="index">
 *     <div class="row" [class.row--alt]="i % 2">{{ row.name }}</div>
 *   </ng-template>
 * </kp-virtual-list>
 */
@Component({
  selector: 'kp-virtual-list',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'list',
    '[attr.aria-rowcount]': 'items.length',
  },
  template: `
    <div
      #viewport
      class="kp-virtual-list__viewport"
      [style.height.px]="viewportHeight"
      (scroll)="onScroll()"
    >
      <div class="kp-virtual-list__spacer" [style.height.px]="totalHeight">
        <div
          class="kp-virtual-list__window"
          [style.transform]="windowTransform"
        >
          @for (item of visibleItems; track trackByOrIndex($index, item); let i = $index) {
            <div
              class="kp-virtual-list__row"
              role="listitem"
              [attr.aria-rowindex]="visibleStart + i + 1"
              [style.height.px]="itemHeight"
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
    .kp-virtual-list__viewport {
      width: 100%;
      overflow-y: auto;
      overflow-x: hidden;
      position: relative;
      contain: strict;
    }
    .kp-virtual-list__spacer {
      position: relative;
      width: 100%;
    }
    .kp-virtual-list__window {
      position: absolute;
      inset-block-start: 0;
      inset-inline: 0;
      will-change: transform;
    }
    .kp-virtual-list__row {
      box-sizing: border-box;
      width: 100%;
    }
  `],
})
export class KpVirtualListComponent<T = unknown> implements OnChanges, OnDestroy {
  /** The full list. The component never iterates the whole thing — only the visible window. */
  @Input() items: readonly T[] = [];

  /** Pixel height of one row. Required; must be uniform across rows. */
  @Input() itemHeight = 40;

  /** Pixel height of the scroll viewport. */
  @Input() viewportHeight = 400;

  /** Extra rows rendered above + below the visible window to soften scroll-flicker. */
  @Input() overscan = 4;

  /** Optional trackBy for the projected rows. Defaults to index — fine for stable lists. */
  @Input() trackBy: ((index: number, item: T) => unknown) | null = null;

  @Output() readonly rangeChange = new EventEmitter<KpVirtualRange>();

  @ViewChild('viewport', { static: true }) private viewportRef!: ElementRef<HTMLDivElement>;
  @ContentChild(KpVirtualRowDirective) rowTemplate?: KpVirtualRowDirective<T>;

  visibleStart = 0;
  visibleEnd = 0;

  private readonly cdr = inject(ChangeDetectorRef);
  private readonly zone = inject(NgZone);

  ngOnChanges(changes: SimpleChanges): void {
    if ('items' in changes || 'itemHeight' in changes || 'viewportHeight' in changes || 'overscan' in changes) {
      // Synchronous recompute: ngOnChanges fires BEFORE template eval in the
      // same CD pass, so visibleStart/End read by the template are already
      // up-to-date — no ExpressionChangedAfterItHasBeenChecked.
      this.recompute(/* fromInputChange */ true);
    }
  }

  ngOnDestroy(): void {
    /* HostListener auto-unbinds */
  }

  get totalHeight(): number {
    return this.items.length * this.itemHeight;
  }

  get visibleItems(): readonly T[] {
    return this.items.slice(this.visibleStart, this.visibleEnd);
  }

  get windowTransform(): string {
    return `translate3d(0, ${this.visibleStart * this.itemHeight}px, 0)`;
  }

  trackByOrIndex(index: number, item: T): unknown {
    if (this.trackBy) return this.trackBy(this.visibleStart + index, item);
    return this.visibleStart + index;
  }

  /** Imperatively scroll to a specific row index. */
  scrollToIndex(index: number, position: 'start' | 'center' | 'end' = 'start'): void {
    const el = this.viewportRef?.nativeElement;
    if (!el) return;
    const top =
      position === 'start'
        ? index * this.itemHeight
        : position === 'end'
          ? index * this.itemHeight - this.viewportHeight + this.itemHeight
          : index * this.itemHeight - this.viewportHeight / 2 + this.itemHeight / 2;
    el.scrollTop = Math.max(0, Math.min(top, this.totalHeight - this.viewportHeight));
  }

  onScroll(): void {
    this.recompute(/* fromInputChange */ false);
  }

  private recompute(fromInputChange: boolean): void {
    const el = this.viewportRef?.nativeElement;
    const scrollTop = el?.scrollTop ?? 0;
    const total = this.items.length;

    let start = 0;
    let end = 0;
    if (total > 0 && this.itemHeight > 0) {
      const visibleCount = Math.ceil(this.viewportHeight / this.itemHeight);
      const firstVisible = Math.floor(scrollTop / this.itemHeight);
      start = Math.max(0, firstVisible - this.overscan);
      end = Math.min(total, firstVisible + visibleCount + this.overscan);
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
    // From scroll: lets consumers mutate state without re-entering the
    // current event loop synchronously.
    queueMicrotask(() => this.rangeChange.emit({ start, end }));
  }
}
