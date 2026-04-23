import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

export type KpPageHeaderSize = 'sm' | 'md' | 'lg';

/**
 * Kanso Protocol — PageHeader
 *
 * Content-area header. Three sizes, optional breadcrumbs, back button,
 * description, actions slot, tabs slot, and bottom divider.
 *
 * Slots (all optional):
 * - `[kpPageHeaderBreadcrumbs]` — Breadcrumbs instance
 * - `[kpPageHeaderTitle]` — custom title (e.g. title + inline Badge)
 * - `[kpPageHeaderActions]` — action buttons on the right
 * - `[kpPageHeaderTabs]` — Tabs instance under the header
 *
 * @example
 * <kp-page-header
 *   size="md"
 *   title="All projects"
 *   description="12 active projects"
 *   [showActions]="true"
 * >
 *   <kp-breadcrumbs kpPageHeaderBreadcrumbs [items]="crumbs"/>
 *   <div kpPageHeaderActions>
 *     <kp-button appearance="ghost">Import</kp-button>
 *     <kp-button>Create</kp-button>
 *   </div>
 * </kp-page-header>
 */
@Component({
  selector: 'kp-page-header',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClasses' },
  template: `
    @if (showBreadcrumbs) {
      <div class="kp-page-header__crumbs">
        <ng-content select="[kpPageHeaderBreadcrumbs]"/>
      </div>
    }

    <div class="kp-page-header__row">
      <div class="kp-page-header__left">
        @if (showBackButton) {
          <button type="button" class="kp-page-header__back" aria-label="Back" (click)="backClick.emit()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M5 12l6-6M5 12l6 6"/></svg>
          </button>
        }
        <div class="kp-page-header__text">
          <ng-content select="[kpPageHeaderTitle]">
            <h1 class="kp-page-header__title">{{ title }}</h1>
          </ng-content>
          @if (showDescription && description) {
            <p class="kp-page-header__desc">{{ description }}</p>
          }
        </div>
      </div>
      @if (showActions) {
        <div class="kp-page-header__actions">
          <ng-content select="[kpPageHeaderActions]"/>
        </div>
      }
    </div>

    @if (showTabs) {
      <div class="kp-page-header__tabs">
        <ng-content select="[kpPageHeaderTabs]"/>
      </div>
    }

    @if (showBottomDivider) {
      <div class="kp-page-header__divider" aria-hidden="true"></div>
    }
  `,
  styles: [`
    :host {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      width: 100%;
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
    }

    .kp-page-header__crumbs {
      margin-bottom: var(--kp-ph-gap-crumbs, 16px);
    }

    .kp-page-header__row {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      justify-content: space-between;
    }

    .kp-page-header__left {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      flex: 1 1 auto;
      min-width: 0;
    }

    .kp-page-header__back {
      all: unset;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      margin-top: 2px;
      border-radius: 8px;
      color: var(--kp-color-gray-600, var(--kp-color-gray-600));
      cursor: pointer;
      transition: background 120ms ease;
    }
    .kp-page-header__back:hover { background: var(--kp-color-gray-100, var(--kp-color-gray-100)); color: var(--kp-color-gray-900, var(--kp-color-gray-900)); }
    .kp-page-header__back svg { width: 20px; height: 20px; }

    .kp-page-header__text {
      display: flex;
      flex-direction: column;
      gap: var(--kp-ph-gap-text, 6px);
      min-width: 0;
      flex: 1 1 auto;
    }

    .kp-page-header__title {
      margin: 0;
      font-size: var(--kp-ph-title-fs, 24px);
      font-weight: var(--kp-ph-title-weight, 500);
      color: var(--kp-color-gray-900, var(--kp-color-gray-900));
      line-height: 1.2;
    }

    .kp-page-header__desc {
      margin: 0;
      font-size: var(--kp-ph-desc-fs, 14px);
      color: var(--kp-color-gray-600, var(--kp-color-gray-600));
      line-height: 1.5;
    }

    .kp-page-header__actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 0 0 auto;
    }

    .kp-page-header__tabs {
      margin-top: var(--kp-ph-gap-tabs, 24px);
    }

    .kp-page-header__divider {
      margin-top: var(--kp-ph-pad-bottom, 24px);
      height: 1px;
      background: var(--kp-color-gray-200, var(--kp-color-gray-200));
    }

    :host(.kp-page-header--sm) {
      --kp-ph-title-fs: 18px;
      --kp-ph-title-weight: 500;
      --kp-ph-desc-fs: 13px;
      --kp-ph-gap-text: 4px;
      --kp-ph-gap-crumbs: 12px;
      --kp-ph-gap-tabs: 16px;
      --kp-ph-pad-bottom: 16px;
    }
    :host(.kp-page-header--md) {
      --kp-ph-title-fs: 24px;
      --kp-ph-title-weight: 500;
      --kp-ph-desc-fs: 14px;
      --kp-ph-gap-text: 6px;
      --kp-ph-gap-crumbs: 16px;
      --kp-ph-gap-tabs: 24px;
      --kp-ph-pad-bottom: 24px;
    }
    :host(.kp-page-header--lg) {
      --kp-ph-title-fs: 30px;
      --kp-ph-title-weight: 600;
      --kp-ph-desc-fs: 16px;
      --kp-ph-gap-text: 8px;
      --kp-ph-gap-crumbs: 16px;
      --kp-ph-gap-tabs: 32px;
      --kp-ph-pad-bottom: 32px;
    }
  `],
})
export class KpPageHeaderComponent {
  @Input() size: KpPageHeaderSize = 'md';

  @Input() title = 'Page title';
  @Input() description: string | null = null;

  @Input() showBreadcrumbs = false;
  @Input() showBackButton = false;
  @Input() showDescription = false;
  @Input() showActions = false;
  @Input() showTabs = false;
  @Input() showBottomDivider = true;

  @Output() backClick = new EventEmitter<void>();

  get hostClasses(): string {
    return `kp-page-header kp-page-header--${this.size}`;
  }
}
