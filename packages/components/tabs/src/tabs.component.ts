import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  ElementRef,
  Input,
  OnDestroy,
  QueryList,
  inject,
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

import { KpTabComponent, KpTabSize } from './tab.component';

/**
 * Kanso Protocol — Tabs (container)
 *
 * Horizontal strip of `<kp-tab>` children with a shared bottom border.
 * Cascades `size` and `fullWidth` down to every projected `<kp-tab>`
 * automatically, so callers only set those two inputs in one place.
 *
 * A `[kpTabsMore]` slot projects an optional "More ▾" affordance to the
 * right of the strip — useful when tabs overflow and you want a dropdown
 * to hold the rest.
 *
 * @example
 * <kp-tabs size="md" [fullWidth]="false">
 *   <kp-tab label="Overview" [selected]="tab === 'overview'" (selectedChange)="tab = 'overview'"/>
 *   <kp-tab label="Activity" [selected]="tab === 'activity'" (selectedChange)="tab = 'activity'"/>
 *   <kp-tab label="Settings" [selected]="tab === 'settings'" (selectedChange)="tab = 'settings'"/>
 *
 *   <button kpTabsMore>More ▾</button>
 * </kp-tabs>
 */
@Component({
  selector: 'kp-tabs',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses',
    '[attr.role]': '"tablist"',
    '(keydown)': 'onKeyDown($event)',
  },
  template: `
    <div class="kp-tabs__row"><ng-content/></div>
    <div class="kp-tabs__more"><ng-content select="[kpTabsMore]"/></div>
  `,
  styles: [`
    :host {
      position: relative;
      display: flex;
      align-items: stretch;
      border-bottom: 1px solid var(--kp-color-tabs-track-border, var(--kp-color-gray-200));
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
    }

    .kp-tabs__row {
      display: flex;
      flex: 1 1 auto;
      /* The Tab atoms already carry their own border-bottom; no extra row chrome needed. */
    }
    :host(.kp-tabs--full-width) .kp-tabs__row > * { flex: 1 1 0; }

    .kp-tabs__more { display: inline-flex; flex: 0 0 auto; }
    .kp-tabs__more:empty { display: none; }
  `],
})
export class KpTabsComponent implements AfterContentInit, OnDestroy {
  @Input() size: KpTabSize = 'md';
  @Input() fullWidth = false;

  @ContentChildren(KpTabComponent) tabs!: QueryList<KpTabComponent>;

  private readonly host = inject(ElementRef) as ElementRef<HTMLElement>;
  private readonly destroyed$ = new Subject<void>();

  ngAfterContentInit(): void {
    this.applyToTabs();
    this.tabs.changes.pipe(takeUntil(this.destroyed$)).subscribe(() => this.applyToTabs());
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  private applyToTabs(): void {
    this.tabs?.forEach((t) => {
      t.size = this.size;
      t.fullWidth = this.fullWidth;
    });
  }

  /**
   * WAI-ARIA tablist keyboard pattern:
   *   ArrowLeft / ArrowRight — move to previous / next enabled tab (wraps around)
   *   Home / End             — jump to first / last enabled tab
   *   Enter / Space          — select the focused tab (native button handles this too)
   * Disabled tabs are skipped. Selection activates on focus change (automatic
   * activation) since our tab bodies are lightweight to render.
   */
  onKeyDown(event: KeyboardEvent): void {
    const all = this.tabs?.toArray() ?? [];
    const enabled = all.filter((t) => !t.disabled);
    if (!enabled.length) return;

    const active = this.activeTabIndex(enabled);
    let next: number | null = null;
    switch (event.key) {
      case 'ArrowRight': next = (active + 1) % enabled.length; break;
      case 'ArrowLeft':  next = (active - 1 + enabled.length) % enabled.length; break;
      case 'Home':       next = 0; break;
      case 'End':        next = enabled.length - 1; break;
      default: return;
    }
    event.preventDefault();
    const target = enabled[next];
    // "Consumer owns state" — same pattern as click. Emit (selectedChange)
    // on the target tab and let the parent's [selected] binding propagate.
    if (!target.selected) target.selectedChange.emit(true);
    this.focusTab(target);
  }

  private activeTabIndex(enabled: KpTabComponent[]): number {
    const doc = this.host.nativeElement.ownerDocument;
    const focused = doc?.activeElement ?? null;
    const byFocus = enabled.findIndex((t) => t.elementRef.nativeElement.contains(focused));
    if (byFocus >= 0) return byFocus;
    const bySelection = enabled.findIndex((t) => t.selected);
    return bySelection >= 0 ? bySelection : 0;
  }

  private focusTab(tab: KpTabComponent): void {
    const btn = tab.elementRef.nativeElement.querySelector<HTMLButtonElement>('button.kp-tab__btn');
    btn?.focus();
  }

  get hostClasses(): string {
    const c = ['kp-tabs'];
    if (this.fullWidth) c.push('kp-tabs--full-width');
    return c.join(' ');
  }
}
