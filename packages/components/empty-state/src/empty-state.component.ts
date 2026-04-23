import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type KpEmptyStateSize = 'sm' | 'md' | 'lg';

/**
 * Kanso Protocol — EmptyState
 *
 * Centered placeholder for empty lists, missing data, or zero-result
 * screens. Composes a circular illustration container, title,
 * description, and an actions row. Project the illustration via
 * `[kpEmptyStateIcon]` and footer buttons via `[kpEmptyStateActions]`.
 */
@Component({
  selector: 'kp-empty-state',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClasses' },
  template: `
    @if (showIllustration) {
      <div class="kp-es__illustration">
        <ng-content select="[kpEmptyStateIcon]"/>
      </div>
    }

    <div class="kp-es__text">
      <h3 class="kp-es__title">{{ title }}</h3>
      @if (showDescription) {
        <p class="kp-es__desc">{{ description }}</p>
      }
    </div>

    <div class="kp-es__actions">
      <ng-content select="[kpEmptyStateActions]"/>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--kp-es-gap-it);
      box-sizing: border-box;
      padding: var(--kp-es-pad-v) 24px;
      width: 100%;
      min-width: 320px;
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
    }

    .kp-es__illustration {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 auto;
      width: var(--kp-es-ill-size);
      height: var(--kp-es-ill-size);
      border-radius: 50%;
      background: var(--kp-color-empty-state-illustration-bg, var(--kp-color-gray-100));
      color: var(--kp-color-empty-state-illustration-icon, var(--kp-color-gray-500));
    }
    .kp-es__illustration ::ng-deep svg {
      width: var(--kp-es-ill-icon);
      height: var(--kp-es-ill-icon);
    }

    .kp-es__text {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--kp-es-gap-td);
      max-width: 400px;
      text-align: center;
    }
    .kp-es__title {
      margin: 0;
      font-size: var(--kp-es-title-size);
      line-height: var(--kp-es-title-lh);
      font-weight: 500;
      color: var(--kp-color-empty-state-fg-title, var(--kp-color-gray-900));
    }
    .kp-es__desc {
      margin: 0;
      font-size: var(--kp-es-desc-size);
      line-height: var(--kp-es-desc-lh);
      color: var(--kp-color-empty-state-fg-description, var(--kp-color-gray-600));
    }

    .kp-es__actions {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-top: calc(var(--kp-es-gap-ta) - var(--kp-es-gap-it));
    }
    .kp-es__actions:empty { display: none; }

    /* Sizes */
    :host(.kp-es--sm) {
      --kp-es-ill-size: 48px;
      --kp-es-ill-icon: 24px;
      --kp-es-gap-it: 16px;
      --kp-es-gap-td: 4px;
      --kp-es-gap-ta: 16px;
      --kp-es-pad-v: 32px;
      --kp-es-title-size: 16px;
      --kp-es-title-lh: 24px;
      --kp-es-desc-size: 14px;
      --kp-es-desc-lh: 20px;
    }
    :host(.kp-es--md) {
      --kp-es-ill-size: 64px;
      --kp-es-ill-icon: 32px;
      --kp-es-gap-it: 20px;
      --kp-es-gap-td: 6px;
      --kp-es-gap-ta: 20px;
      --kp-es-pad-v: 48px;
      --kp-es-title-size: 18px;
      --kp-es-title-lh: 28px;
      --kp-es-desc-size: 16px;
      --kp-es-desc-lh: 24px;
    }
    :host(.kp-es--lg) {
      --kp-es-ill-size: 80px;
      --kp-es-ill-icon: 40px;
      --kp-es-gap-it: 24px;
      --kp-es-gap-td: 8px;
      --kp-es-gap-ta: 24px;
      --kp-es-pad-v: 64px;
      --kp-es-title-size: 20px;
      --kp-es-title-lh: 28px;
      --kp-es-desc-size: 16px;
      --kp-es-desc-lh: 24px;
    }
  `],
})
export class KpEmptyStateComponent {
  @Input() size: KpEmptyStateSize = 'md';
  @Input() title = '';
  @Input() description = '';
  @Input() showIllustration = true;
  @Input() showDescription = true;

  get hostClasses(): string {
    return `kp-es kp-es--${this.size}`;
  }
}
