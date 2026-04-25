import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { KpButtonComponent } from '@kanso-protocol/button';
import { KpIconComponent } from '@kanso-protocol/icon';

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
  imports: [KpButtonComponent, KpIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClasses', role: 'status' },
  template: `
    <div class="kp-banner__content">
      @if (showIcon) {
        <kp-icon class="kp-banner__icon" [name]="iconName" />
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
      --kp-banner-bg: var(--kp-color-alert-primary-subtle-bg, var(--kp-color-blue-50));
      --kp-banner-border: var(--kp-color-alert-primary-subtle-border, var(--kp-color-blue-200));
      --kp-banner-fg: var(--kp-color-alert-primary-subtle-fg-title, var(--kp-color-blue-900));
      --kp-banner-fg-desc: var(--kp-color-alert-primary-subtle-fg-desc, var(--kp-color-blue-800));
      --kp-banner-icon-color: var(--kp-color-alert-primary-subtle-icon, var(--kp-color-blue-600));
    }
    :host(.kp-banner--success) {
      --kp-banner-bg: var(--kp-color-alert-success-subtle-bg, var(--kp-color-green-50));
      --kp-banner-border: var(--kp-color-alert-success-subtle-border, var(--kp-color-green-200));
      --kp-banner-fg: var(--kp-color-alert-success-subtle-fg-title, var(--kp-color-green-900));
      --kp-banner-fg-desc: var(--kp-color-alert-success-subtle-fg-desc, var(--kp-color-green-800));
      --kp-banner-icon-color: var(--kp-color-alert-success-subtle-icon, var(--kp-color-green-600));
    }
    :host(.kp-banner--warning) {
      --kp-banner-bg: var(--kp-color-alert-warning-subtle-bg, var(--kp-color-amber-50));
      --kp-banner-border: var(--kp-color-alert-warning-subtle-border, var(--kp-color-amber-300));
      --kp-banner-fg: var(--kp-color-alert-warning-subtle-fg-title, var(--kp-color-amber-900));
      --kp-banner-fg-desc: var(--kp-color-alert-warning-subtle-fg-desc, var(--kp-color-amber-800));
      --kp-banner-icon-color: var(--kp-color-alert-warning-subtle-icon, var(--kp-color-amber-600));
    }
    :host(.kp-banner--danger) {
      --kp-banner-bg: var(--kp-color-alert-danger-subtle-bg, var(--kp-color-red-50));
      --kp-banner-border: var(--kp-color-alert-danger-subtle-border, var(--kp-color-red-200));
      --kp-banner-fg: var(--kp-color-alert-danger-subtle-fg-title, var(--kp-color-red-900));
      --kp-banner-fg-desc: var(--kp-color-alert-danger-subtle-fg-desc, var(--kp-color-red-800));
      --kp-banner-icon-color: var(--kp-color-alert-danger-subtle-icon, var(--kp-color-red-600));
    }
    :host(.kp-banner--info) {
      --kp-banner-bg: var(--kp-color-alert-info-subtle-bg, var(--kp-color-cyan-50));
      --kp-banner-border: var(--kp-color-alert-info-subtle-border, var(--kp-color-cyan-200));
      --kp-banner-fg: var(--kp-color-alert-info-subtle-fg-title, var(--kp-color-cyan-900));
      --kp-banner-fg-desc: var(--kp-color-alert-info-subtle-fg-desc, var(--kp-color-cyan-800));
      --kp-banner-icon-color: var(--kp-color-alert-info-subtle-icon, var(--kp-color-cyan-600));
    }
    :host(.kp-banner--neutral) {
      --kp-banner-bg: var(--kp-color-alert-neutral-subtle-bg, var(--kp-color-gray-50));
      --kp-banner-border: var(--kp-color-alert-neutral-subtle-border, var(--kp-color-gray-200));
      --kp-banner-fg: var(--kp-color-alert-neutral-subtle-fg-title, var(--kp-color-gray-900));
      --kp-banner-fg-desc: var(--kp-color-alert-neutral-subtle-fg-desc, var(--kp-color-gray-700));
      --kp-banner-icon-color: var(--kp-color-alert-neutral-subtle-icon, var(--kp-color-gray-600));
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

  get iconName(): string {
    const map: Record<KpBannerColor, string> = {
      primary: 'info-circle',
      success: 'circle-check',
      warning: 'alert-triangle',
      danger: 'alert-circle',
      info: 'info-circle',
      neutral: 'info-circle',
    };
    return map[this.color];
  }

  get hostClasses(): string {
    return `kp-banner kp-banner--${this.color} kp-banner--${this.size}`;
  }
}
