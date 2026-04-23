import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { KpButtonComponent } from '@kanso-protocol/button';

export type KpBannerSize = 'sm' | 'md';
export type KpBannerColor =
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

/**
 * Kanso Protocol — Banner
 *
 * Global top strip under the app Header. Used for system messages:
 * trial status, maintenance, payment alerts, feature launches.
 * Reuses alert semantic tokens (subtle appearance) so color roles
 * match Alert / Toast.
 *
 * Slot: `[kpBannerAction]` for a trailing CTA (typically `<kp-button size="sm">`).
 *
 * @example
 * <kp-banner color="warning" title="Your trial ends in 3 days">
 *   <kp-button kpBannerAction size="sm">Upgrade</kp-button>
 * </kp-banner>
 */
@Component({
  selector: 'kp-banner',
  imports: [KpButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClasses', role: 'status' },
  template: `
    <div class="kp-banner__content">
      @if (showIcon) {
        <i class="ti kp-banner__icon" [class]="'ti kp-banner__icon ' + iconClass" aria-hidden="true"></i>
      }
      <span class="kp-banner__title">{{ title }}</span>
      @if (description) {
        <span class="kp-banner__desc">{{ description }}</span>
      }
    </div>
    <div class="kp-banner__right">
      <ng-content select="[kpBannerAction]"/>
      @if (showClose) {
        <kp-button
          size="xs"
          variant="ghost"
          color="neutral"
          [iconOnly]="true"
          aria-label="Dismiss"
          (click)="close.emit()"
        >
          <svg kpButtonIconLeft viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </kp-button>
      }
    </div>
  `,
  styles: [`
    :host {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      gap: 16px;
      width: 100%;
      padding: var(--kp-banner-pad, 12px 32px);
      background: var(--kp-banner-bg);
      border-bottom: 1px solid var(--kp-banner-border);
      color: var(--kp-banner-fg);
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
      font-size: var(--kp-banner-fs, 14px);
    }

    :host(.kp-banner--sm) {
      --kp-banner-pad: 8px 24px;
      --kp-banner-fs: 13px;
    }
    :host(.kp-banner--md) {
      --kp-banner-pad: 12px 32px;
      --kp-banner-fs: 14px;
    }

    .kp-banner__content {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1 1 auto;
      min-width: 0;
    }
    .kp-banner__icon {
      flex: 0 0 auto;
      font-size: var(--kp-banner-icon, 18px);
      line-height: 1;
      color: var(--kp-banner-icon-color);
    }
    :host(.kp-banner--sm) { --kp-banner-icon: 16px; }
    :host(.kp-banner--md) { --kp-banner-icon: 18px; }

    .kp-banner__title {
      font-weight: 500;
      color: var(--kp-banner-fg);
    }
    .kp-banner__desc {
      color: var(--kp-banner-fg-desc);
    }

    .kp-banner__right {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 0 0 auto;
    }

    /* Colors — reuse alert-*-subtle tokens */
    :host(.kp-banner--primary) {
      --kp-banner-bg: var(--kp-color-alert-primary-subtle-bg, #EFF6FF);
      --kp-banner-border: var(--kp-color-alert-primary-subtle-border, #BFDBFE);
      --kp-banner-fg: var(--kp-color-alert-primary-subtle-fg-title, #1E3A8A);
      --kp-banner-fg-desc: var(--kp-color-alert-primary-subtle-fg-desc, #1E40AF);
      --kp-banner-icon-color: var(--kp-color-alert-primary-subtle-icon, #2563EB);
    }
    :host(.kp-banner--success) {
      --kp-banner-bg: var(--kp-color-alert-success-subtle-bg, #F0FDF4);
      --kp-banner-border: var(--kp-color-alert-success-subtle-border, #BBF7D0);
      --kp-banner-fg: var(--kp-color-alert-success-subtle-fg-title, #14532D);
      --kp-banner-fg-desc: var(--kp-color-alert-success-subtle-fg-desc, #166534);
      --kp-banner-icon-color: var(--kp-color-alert-success-subtle-icon, #16A34A);
    }
    :host(.kp-banner--warning) {
      --kp-banner-bg: var(--kp-color-alert-warning-subtle-bg, #FFFBEB);
      --kp-banner-border: var(--kp-color-alert-warning-subtle-border, #FCD34D);
      --kp-banner-fg: var(--kp-color-alert-warning-subtle-fg-title, #78350F);
      --kp-banner-fg-desc: var(--kp-color-alert-warning-subtle-fg-desc, #92400E);
      --kp-banner-icon-color: var(--kp-color-alert-warning-subtle-icon, #D97706);
    }
    :host(.kp-banner--danger) {
      --kp-banner-bg: var(--kp-color-alert-danger-subtle-bg, #FEF2F2);
      --kp-banner-border: var(--kp-color-alert-danger-subtle-border, #FECACA);
      --kp-banner-fg: var(--kp-color-alert-danger-subtle-fg-title, #7F1D1D);
      --kp-banner-fg-desc: var(--kp-color-alert-danger-subtle-fg-desc, #991B1B);
      --kp-banner-icon-color: var(--kp-color-alert-danger-subtle-icon, #DC2626);
    }
    :host(.kp-banner--info) {
      --kp-banner-bg: var(--kp-color-alert-info-subtle-bg, #ECFEFF);
      --kp-banner-border: var(--kp-color-alert-info-subtle-border, #A5F3FC);
      --kp-banner-fg: var(--kp-color-alert-info-subtle-fg-title, #164E63);
      --kp-banner-fg-desc: var(--kp-color-alert-info-subtle-fg-desc, #155E75);
      --kp-banner-icon-color: var(--kp-color-alert-info-subtle-icon, #0891B2);
    }
    :host(.kp-banner--neutral) {
      --kp-banner-bg: var(--kp-color-alert-neutral-subtle-bg, #FAFAFA);
      --kp-banner-border: var(--kp-color-alert-neutral-subtle-border, #E4E4E7);
      --kp-banner-fg: var(--kp-color-alert-neutral-subtle-fg-title, #18181B);
      --kp-banner-fg-desc: var(--kp-color-alert-neutral-subtle-fg-desc, #3F3F46);
      --kp-banner-icon-color: var(--kp-color-alert-neutral-subtle-icon, #52525B);
    }
  `],
})
export class KpBannerComponent {
  @Input() color: KpBannerColor = 'primary';
  @Input() size: KpBannerSize = 'md';
  @Input() title = 'Global notification message';
  @Input() description: string | null = null;
  @Input() showIcon = true;
  @Input() showClose = true;

  @Output() close = new EventEmitter<void>();

  get iconClass(): string {
    const map: Record<KpBannerColor, string> = {
      primary: 'ti-info-circle',
      success: 'ti-circle-check',
      warning: 'ti-alert-triangle',
      danger: 'ti-alert-circle',
      info: 'ti-info-circle',
      neutral: 'ti-info-circle',
    };
    return map[this.color];
  }

  get hostClasses(): string {
    return `kp-banner kp-banner--${this.color} kp-banner--${this.size}`;
  }
}
