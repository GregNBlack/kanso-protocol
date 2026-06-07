import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import {
  ActivatedRouteSnapshot,
  NavigationEnd,
  Router,
} from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { KpBreadcrumbsSize, KpBreadcrumbsComponent } from './breadcrumbs.component';
import { KpBreadcrumbItemComponent } from './breadcrumb-item.component';
import {
  KpBreadcrumbSeparatorComponent,
  KpBreadcrumbSeparatorType,
} from './breadcrumb-separator.component';

/**
 * Per-route breadcrumb metadata. Attach under `data.breadcrumb` in the
 * route config. A string is used verbatim; a function receives the
 * matched `ActivatedRouteSnapshot` and should return the label (useful
 * for routes with params — e.g. `(route) => route.paramMap.get('id')`).
 *
 * Routes without `data.breadcrumb` are skipped entirely, which is how
 * you mark pure structural/layout routes that shouldn't appear in the
 * trail.
 */
export type KpBreadcrumbLabel = string | ((route: ActivatedRouteSnapshot) => string);

interface BreadcrumbEntry {
  label: string;
  url: string;
}

/**
 * Kanso Protocol — BreadcrumbsAuto
 *
 * Drop-in replacement for the composable `<kp-breadcrumbs>` API that
 * builds its trail from the Angular router state. Walks the current
 * `ActivatedRouteSnapshot` tree from root to leaf, picks every route
 * that defines `data.breadcrumb`, and renders the full path
 * automatically — updating on every `NavigationEnd`.
 *
 * The last collected entry becomes `type="current"`; everything before
 * it is `type="link"` with an `href` built from the accumulated URL
 * segments. If you need richer content (icons, ellipsis collapsing),
 * fall back to the manual `<kp-breadcrumbs>` composition.
 *
 * @example
 * // route config
 * const routes = [
 *   { path: '', data: { breadcrumb: 'Home' } },
 *   { path: 'projects', data: { breadcrumb: 'Projects' }, children: [
 *     { path: ':id', data: { breadcrumb: (r) => r.paramMap.get('id') ?? 'Detail' } }
 *   ]}
 * ];
 *
 * // template — anywhere inside a routed component
 * <kp-breadcrumbs-auto size="md" separator="chevron"/>
 */
@Component({
  selector: 'kp-breadcrumbs-auto',
  imports: [
    KpBreadcrumbsComponent,
    KpBreadcrumbItemComponent,
    KpBreadcrumbSeparatorComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <kp-breadcrumbs [size]="size" [ariaLabel]="ariaLabel">
      @for (item of items(); track item.url; let last = $last) {
        @if (last) {
          <kp-breadcrumb-item type="current" [label]="item.label"/>
        } @else {
          <kp-breadcrumb-item type="link" [label]="item.label" [href]="item.url"/>
          <kp-breadcrumb-separator [type]="separator"/>
        }
      }
    </kp-breadcrumbs>
  `,
})
export class KpBreadcrumbsAutoComponent implements OnInit, OnDestroy {
  @Input() size: KpBreadcrumbsSize = 'md';
  @Input() separator: KpBreadcrumbSeparatorType = 'chevron';
  @Input() ariaLabel = 'Breadcrumb';

  readonly items = signal<BreadcrumbEntry[]>([]);

  private readonly router = inject(Router);
  private sub?: Subscription;

  ngOnInit(): void {
    this.rebuild();
    this.sub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => this.rebuild());
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private rebuild(): void {
    const trail: BreadcrumbEntry[] = [];
    const segments: string[] = [];
    let current: ActivatedRouteSnapshot | null = this.router.routerState.snapshot.root;

    while (current) {
      for (const seg of current.url) {
        segments.push(seg.path);
      }

      const raw = current.data['breadcrumb'] as KpBreadcrumbLabel | undefined;
      if (raw != null) {
        const label = typeof raw === 'function' ? raw(current) : raw;
        if (label) {
          trail.push({
            label,
            url: segments.length === 0 ? '/' : '/' + segments.join('/'),
          });
        }
      }

      current = current.firstChild;
    }

    this.items.set(trail);
  }
}
