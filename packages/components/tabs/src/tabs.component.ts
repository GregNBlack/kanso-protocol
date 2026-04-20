import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  Input,
  QueryList,
} from '@angular/core';

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
      border-bottom: 1px solid var(--kp-color-tabs-track-border, #E4E4E7);
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
export class KpTabsComponent implements AfterContentInit {
  @Input() size: KpTabSize = 'md';
  @Input() fullWidth = false;

  @ContentChildren(KpTabComponent) tabs!: QueryList<KpTabComponent>;

  ngAfterContentInit(): void {
    this.applyToTabs();
    this.tabs.changes.subscribe(() => this.applyToTabs());
  }

  private applyToTabs(): void {
    this.tabs?.forEach((t) => {
      t.size = this.size;
      t.fullWidth = this.fullWidth;
    });
  }

  get hostClasses(): string {
    const c = ['kp-tabs'];
    if (this.fullWidth) c.push('kp-tabs--full-width');
    return c.join(' ');
  }
}
