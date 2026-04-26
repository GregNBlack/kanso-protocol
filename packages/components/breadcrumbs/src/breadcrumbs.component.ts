import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  DestroyRef,
  Input,
  QueryList,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { KpBreadcrumbItemComponent, KpBreadcrumbItemSize } from './breadcrumb-item.component';
import { KpBreadcrumbSeparatorComponent } from './breadcrumb-separator.component';

export type KpBreadcrumbsSize = KpBreadcrumbItemSize;

/**
 * Kanso Protocol — Breadcrumbs (container)
 *
 * Semantic `<nav aria-label="Breadcrumb">` with an ordered list of items
 * and separators. Cascades `size` to every projected `<kp-breadcrumb-item>`
 * and `<kp-breadcrumb-separator>` so callers set it in one place.
 *
 * The component is intentionally composable — callers include items
 * and separators in the order they want them rendered. This keeps it
 * compatible with whatever routing/data source you use and makes the
 * overflow `...` affordance trivial (just drop an `<kp-breadcrumb-item
 * type="ellipsis">` between items).
 *
 * @example
 * <kp-breadcrumbs size="md" ariaLabel="Breadcrumb">
 *   <kp-breadcrumb-item type="link" href="/">
 *     <svg kpBreadcrumbIcon .../>
 *   </kp-breadcrumb-item>
 *   <kp-breadcrumb-separator type="chevron"/>
 *   <kp-breadcrumb-item type="link" label="Projects" href="/projects"/>
 *   <kp-breadcrumb-separator type="chevron"/>
 *   <kp-breadcrumb-item type="current" label="Button"/>
 * </kp-breadcrumbs>
 */
@Component({
  selector: 'kp-breadcrumbs',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses',
  },
  template: `
    <nav [attr.aria-label]="ariaLabel">
      <ol class="kp-breadcrumbs__list">
        <ng-content/>
      </ol>
    </nav>
  `,
  styles: [`
    :host {
      display: block;
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
    }
    nav { display: block; }
    .kp-breadcrumbs__list {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 4px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    :host(.kp-breadcrumbs--md) .kp-breadcrumbs__list { gap: 6px; }
  `],
})
export class KpBreadcrumbsComponent implements AfterContentInit {
  @Input() size: KpBreadcrumbsSize = 'md';
  @Input() ariaLabel = 'Breadcrumb';

  @ContentChildren(KpBreadcrumbItemComponent) items!: QueryList<KpBreadcrumbItemComponent>;
  @ContentChildren(KpBreadcrumbSeparatorComponent) separators!: QueryList<KpBreadcrumbSeparatorComponent>;

  private readonly destroyRef = inject(DestroyRef);

  ngAfterContentInit(): void {
    this.applySize();
    this.items.changes.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.applySize());
    this.separators.changes.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.applySize());
  }

  private applySize(): void {
    this.items?.forEach((i) => (i.size = this.size));
    this.separators?.forEach((s) => (s.size = this.size));
  }

  get hostClasses(): string {
    return `kp-breadcrumbs kp-breadcrumbs--${this.size}`;
  }
}
