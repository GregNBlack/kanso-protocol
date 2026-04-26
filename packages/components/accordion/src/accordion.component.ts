import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  Input,
  OnDestroy,
  QueryList,
} from '@angular/core';
import { map, merge, startWith, Subject, switchMap, takeUntil } from 'rxjs';

import { KpAccordionItemComponent, KpAccordionItemSize } from './accordion-item.component';

export type KpAccordionMode = 'single' | 'multi';

/**
 * Kanso Protocol — Accordion
 *
 * Container for `<kp-accordion-item>` children. Coordinates the
 * expand/collapse behavior via `[mode]`:
 *   - `single` — only one item can be open; expanding a new one collapses the previous.
 *   - `multi`  — any number of items can be open simultaneously.
 *
 * Cascades `size` to every projected item so callers set it once on
 * the container. Set `[showOuterBorder]="true"` to wrap the group in
 * a 1px border with rounded corners (for standalone accordions on
 * flat surfaces). Otherwise only the per-item bottom borders show.
 */
@Component({
  selector: 'kp-accordion',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClasses' },
  template: `<ng-content/>`,
  styles: [`
    :host {
      display: block;
      width: 100%;
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
    }
    :host(.kp-accordion--outer) {
      background: var(--kp-color-accordion-bg, var(--kp-color-white));
      border: 1px solid var(--kp-color-accordion-border, var(--kp-color-gray-200));
      border-radius: 12px;
      overflow: hidden;
    }
  `],
})
export class KpAccordionComponent implements AfterContentInit, OnDestroy {
  @Input() size: KpAccordionItemSize = 'md';
  @Input() mode: KpAccordionMode = 'single';
  @Input() showOuterBorder = false;

  @ContentChildren(KpAccordionItemComponent) items!: QueryList<KpAccordionItemComponent>;

  private readonly destroyed$ = new Subject<void>();

  ngAfterContentInit(): void {
    this.items.changes
      .pipe(startWith(null), takeUntil(this.destroyed$))
      .subscribe(() => this.sync());

    // Re-merge per-item streams whenever the projected set changes, so newly
    // added items get wired up and removed items don't keep stale subscriptions.
    // switchMap drops the previous merged stream — no manual unsubscribe needed.
    this.items.changes
      .pipe(
        startWith(null),
        switchMap(() => merge(
          ...this.items.toArray().map((item) => item.expandedChange.pipe(map(() => item))),
        )),
        takeUntil(this.destroyed$),
      )
      .subscribe((toggled) => this.onItemToggle(toggled as KpAccordionItemComponent));
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  private sync(): void {
    const all = this.items?.toArray() ?? [];
    all.forEach((it, idx) => {
      it.size = this.size;
      it.lastInGroup = idx === all.length - 1;
    });
  }

  private onItemToggle(changed: KpAccordionItemComponent): void {
    if (this.mode === 'multi' || !changed.expanded) return;
    this.items.forEach((it) => {
      if (it !== changed && it.expanded) it.setExpanded(false);
    });
  }

  get hostClasses(): string {
    const c = ['kp-accordion', `kp-accordion--${this.mode}`];
    if (this.showOuterBorder) c.push('kp-accordion--outer');
    return c.join(' ');
  }
}
