import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

export type KpAlertSize = 'sm' | 'md' | 'lg';
export type KpAlertAppearance = 'subtle' | 'solid' | 'outline' | 'left-accent';
export type KpAlertColor =
  | 'primary'
  | 'danger'
  | 'success'
  | 'warning'
  | 'info'
  | 'neutral';
export type KpAlertActionPlacement = 'inline' | 'stacked';

/**
 * Kanso Protocol — Alert
 *
 * In-page banner for statuses, errors, warnings, and short messages. 3 sizes ×
 * 4 appearances (subtle / solid / outline / left-accent) × 6 color roles, plus
 * an optional leading icon, an action slot (inline right or stacked below),
 * and a close button.
 *
 * @example
 * <kp-alert color="success" title="Changes saved" description="Profile updated.">
 *   <svg kpAlertIcon .../>
 * </kp-alert>
 *
 * <kp-alert color="warning" appearance="left-accent" title="Review required"
 *           description="3 items need your approval.">
 *   <kp-button kpAlertAction size="sm" variant="subtle">Review</kp-button>
 * </kp-alert>
 */
@Component({
  selector: 'kp-alert',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses',
    '[attr.role]': '"alert"',
  },
  template: `
    @if (appearance === 'left-accent') {
      <span class="kp-alert__accent" aria-hidden="true"></span>
    }

    <span class="kp-alert__content">
      <span class="kp-alert__icon" aria-hidden="true">
        <ng-content select="[kpAlertIcon]"/>
      </span>

      <span class="kp-alert__text">
        <span class="kp-alert__title">{{ title }}</span>
        @if (description) {
          <span class="kp-alert__description">{{ description }}</span>
        }
        @if (actionPlacement === 'stacked') {
          <span class="kp-alert__action kp-alert__action--stacked">
            <ng-content select="[kpAlertAction]"/>
          </span>
        }
      </span>

      @if (actionPlacement === 'inline') {
        <span class="kp-alert__action kp-alert__action--inline">
          <ng-content select="[kpAlertAction]"/>
        </span>
      }

      @if (closable) {
        <button
          type="button"
          class="kp-alert__close"
          aria-label="Close"
          (click)="handleClose($event)">
          <svg [attr.width]="closeIconSize" [attr.height]="closeIconSize" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      }
    </span>
  `,
  styles: [`
    :host {
      display: inline-flex;
      box-sizing: border-box;
      border: 1px solid var(--kp-alert-border);
      border-radius: var(--kp-alert-radius);
      background: var(--kp-alert-bg);
      overflow: hidden;
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
      width: 480px;
      max-width: 100%;
    }

    .kp-alert__accent {
      flex: 0 0 auto;
      width: var(--kp-alert-accent-width);
      background: var(--kp-alert-accent);
    }

    .kp-alert__content {
      flex: 1 1 auto;
      display: flex;
      align-items: flex-start;
      gap: var(--kp-alert-gap);
      padding: var(--kp-alert-pad);
      min-width: 0;
    }

    .kp-alert__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 auto;
      color: var(--kp-alert-icon);
    }
    .kp-alert__icon:empty { display: none; }
    .kp-alert__icon ::ng-deep svg {
      width: var(--kp-alert-icon-size);
      height: var(--kp-alert-icon-size);
    }

    .kp-alert__text {
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      gap: var(--kp-alert-title-desc-gap);
      min-width: 0;
    }

    .kp-alert__title {
      color: var(--kp-alert-fg-title);
      font-weight: 500;
      font-size: var(--kp-alert-title-size);
      line-height: var(--kp-alert-title-lh);
    }

    .kp-alert__description {
      color: var(--kp-alert-fg-desc);
      font-weight: 400;
      font-size: var(--kp-alert-desc-size);
      line-height: var(--kp-alert-desc-lh);
    }

    .kp-alert__action--stacked {
      display: inline-flex;
      align-self: flex-start;
      margin-top: var(--kp-alert-action-gap);
    }

    .kp-alert__action--inline {
      display: inline-flex;
      align-self: flex-start;
      flex: 0 0 auto;
    }
    .kp-alert__action--inline:empty,
    .kp-alert__action--stacked:empty { display: none; }

    .kp-alert__close {
      all: unset;
      flex: 0 0 auto;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: var(--kp-alert-close-size);
      height: var(--kp-alert-close-size);
      border-radius: var(--kp-alert-close-radius);
      color: var(--kp-alert-fg-title);
      cursor: pointer;
      opacity: 0.75;
      transition: opacity 120ms ease, background 120ms ease;
    }
    .kp-alert__close:hover { opacity: 1; background: rgba(0, 0, 0, 0.06); }
    .kp-alert__close:focus-visible {
      outline: 2px solid var(--kp-color-focus-ring, #60A5FA);
      outline-offset: 1px;
      opacity: 1;
    }

    /* --- Sizes --- */
    :host(.kp-alert--sm) {
      --kp-alert-pad: 12px;
      --kp-alert-gap: 10px;
      --kp-alert-title-desc-gap: 2px;
      --kp-alert-action-gap: 8px;
      --kp-alert-radius: 10px;
      --kp-alert-icon-size: 16px;
      --kp-alert-close-size: 20px;
      --kp-alert-close-radius: 4px;
      --kp-alert-accent-width: 3px;
      --kp-alert-title-size: 14px; --kp-alert-title-lh: 20px;
      --kp-alert-desc-size: 12px;  --kp-alert-desc-lh: 16px;
    }
    :host(.kp-alert--md) {
      --kp-alert-pad: 16px;
      --kp-alert-gap: 12px;
      --kp-alert-title-desc-gap: 4px;
      --kp-alert-action-gap: 12px;
      --kp-alert-radius: 12px;
      --kp-alert-icon-size: 18px;
      --kp-alert-close-size: 24px;
      --kp-alert-close-radius: 6px;
      --kp-alert-accent-width: 4px;
      --kp-alert-title-size: 16px; --kp-alert-title-lh: 24px;
      --kp-alert-desc-size: 14px;  --kp-alert-desc-lh: 20px;
    }
    :host(.kp-alert--lg) {
      --kp-alert-pad: 20px;
      --kp-alert-gap: 16px;
      --kp-alert-title-desc-gap: 4px;
      --kp-alert-action-gap: 12px;
      --kp-alert-radius: 14px;
      --kp-alert-icon-size: 22px;
      --kp-alert-close-size: 28px;
      --kp-alert-close-radius: 6px;
      --kp-alert-accent-width: 4px;
      --kp-alert-title-size: 20px; --kp-alert-title-lh: 28px;
      --kp-alert-desc-size: 16px;  --kp-alert-desc-lh: 24px;
    }

    /* --- Color × Appearance (24 combos from tokens) --- */
    :host(.kp-alert--primary.kp-alert--subtle) {
      --kp-alert-bg: var(--kp-color-alert-primary-subtle-bg, #EFF6FF);
      --kp-alert-fg-title: var(--kp-color-alert-primary-subtle-fg-title, #1E3A8A);
      --kp-alert-fg-desc: var(--kp-color-alert-primary-subtle-fg-desc, #1E40AF);
      --kp-alert-border: var(--kp-color-alert-primary-subtle-border, #BFDBFE);
      --kp-alert-icon: var(--kp-color-alert-primary-subtle-icon, #2563EB);
      --kp-alert-accent: var(--kp-color-alert-primary-subtle-accent, #2563EB);
    }
    :host(.kp-alert--primary.kp-alert--solid) {
      --kp-alert-bg: var(--kp-color-alert-primary-solid-bg, #2563EB);
      --kp-alert-fg-title: var(--kp-color-alert-primary-solid-fg-title, #FFFFFF);
      --kp-alert-fg-desc: var(--kp-color-alert-primary-solid-fg-desc, #EFF6FF);
      --kp-alert-border: var(--kp-color-alert-primary-solid-border, #2563EB);
      --kp-alert-icon: var(--kp-color-alert-primary-solid-icon, #FFFFFF);
      --kp-alert-accent: var(--kp-color-alert-primary-solid-accent, #FFFFFF);
    }
    :host(.kp-alert--primary.kp-alert--outline) {
      --kp-alert-bg: var(--kp-color-alert-primary-outline-bg, #FFFFFF);
      --kp-alert-fg-title: var(--kp-color-alert-primary-outline-fg-title, #1E3A8A);
      --kp-alert-fg-desc: var(--kp-color-alert-primary-outline-fg-desc, #3F3F46);
      --kp-alert-border: var(--kp-color-alert-primary-outline-border, #93C5FD);
      --kp-alert-icon: var(--kp-color-alert-primary-outline-icon, #2563EB);
      --kp-alert-accent: var(--kp-color-alert-primary-outline-accent, #2563EB);
    }
    :host(.kp-alert--primary.kp-alert--left-accent) {
      --kp-alert-bg: var(--kp-color-alert-primary-left-accent-bg, #FFFFFF);
      --kp-alert-fg-title: var(--kp-color-alert-primary-left-accent-fg-title, #18181B);
      --kp-alert-fg-desc: var(--kp-color-alert-primary-left-accent-fg-desc, #3F3F46);
      --kp-alert-border: var(--kp-color-alert-primary-left-accent-border, #E4E4E7);
      --kp-alert-icon: var(--kp-color-alert-primary-left-accent-icon, #2563EB);
      --kp-alert-accent: var(--kp-color-alert-primary-left-accent-accent, #2563EB);
    }

    :host(.kp-alert--danger.kp-alert--subtle) {
      --kp-alert-bg: var(--kp-color-alert-danger-subtle-bg, #FEF2F2);
      --kp-alert-fg-title: var(--kp-color-alert-danger-subtle-fg-title, #7F1D1D);
      --kp-alert-fg-desc: var(--kp-color-alert-danger-subtle-fg-desc, #991B1B);
      --kp-alert-border: var(--kp-color-alert-danger-subtle-border, #FECACA);
      --kp-alert-icon: var(--kp-color-alert-danger-subtle-icon, #DC2626);
      --kp-alert-accent: var(--kp-color-alert-danger-subtle-accent, #DC2626);
    }
    :host(.kp-alert--danger.kp-alert--solid) {
      --kp-alert-bg: var(--kp-color-alert-danger-solid-bg, #DC2626);
      --kp-alert-fg-title: var(--kp-color-alert-danger-solid-fg-title, #FFFFFF);
      --kp-alert-fg-desc: var(--kp-color-alert-danger-solid-fg-desc, #FEF2F2);
      --kp-alert-border: var(--kp-color-alert-danger-solid-border, #DC2626);
      --kp-alert-icon: var(--kp-color-alert-danger-solid-icon, #FFFFFF);
      --kp-alert-accent: var(--kp-color-alert-danger-solid-accent, #FFFFFF);
    }
    :host(.kp-alert--danger.kp-alert--outline) {
      --kp-alert-bg: var(--kp-color-alert-danger-outline-bg, #FFFFFF);
      --kp-alert-fg-title: var(--kp-color-alert-danger-outline-fg-title, #7F1D1D);
      --kp-alert-fg-desc: var(--kp-color-alert-danger-outline-fg-desc, #3F3F46);
      --kp-alert-border: var(--kp-color-alert-danger-outline-border, #FCA5A5);
      --kp-alert-icon: var(--kp-color-alert-danger-outline-icon, #DC2626);
      --kp-alert-accent: var(--kp-color-alert-danger-outline-accent, #DC2626);
    }
    :host(.kp-alert--danger.kp-alert--left-accent) {
      --kp-alert-bg: var(--kp-color-alert-danger-left-accent-bg, #FFFFFF);
      --kp-alert-fg-title: var(--kp-color-alert-danger-left-accent-fg-title, #18181B);
      --kp-alert-fg-desc: var(--kp-color-alert-danger-left-accent-fg-desc, #3F3F46);
      --kp-alert-border: var(--kp-color-alert-danger-left-accent-border, #E4E4E7);
      --kp-alert-icon: var(--kp-color-alert-danger-left-accent-icon, #DC2626);
      --kp-alert-accent: var(--kp-color-alert-danger-left-accent-accent, #DC2626);
    }

    :host(.kp-alert--success.kp-alert--subtle) {
      --kp-alert-bg: var(--kp-color-alert-success-subtle-bg, #F0FDF4);
      --kp-alert-fg-title: var(--kp-color-alert-success-subtle-fg-title, #14532D);
      --kp-alert-fg-desc: var(--kp-color-alert-success-subtle-fg-desc, #166534);
      --kp-alert-border: var(--kp-color-alert-success-subtle-border, #BBF7D0);
      --kp-alert-icon: var(--kp-color-alert-success-subtle-icon, #16A34A);
      --kp-alert-accent: var(--kp-color-alert-success-subtle-accent, #16A34A);
    }
    :host(.kp-alert--success.kp-alert--solid) {
      --kp-alert-bg: var(--kp-color-alert-success-solid-bg, #16A34A);
      --kp-alert-fg-title: var(--kp-color-alert-success-solid-fg-title, #FFFFFF);
      --kp-alert-fg-desc: var(--kp-color-alert-success-solid-fg-desc, #F0FDF4);
      --kp-alert-border: var(--kp-color-alert-success-solid-border, #16A34A);
      --kp-alert-icon: var(--kp-color-alert-success-solid-icon, #FFFFFF);
      --kp-alert-accent: var(--kp-color-alert-success-solid-accent, #FFFFFF);
    }
    :host(.kp-alert--success.kp-alert--outline) {
      --kp-alert-bg: var(--kp-color-alert-success-outline-bg, #FFFFFF);
      --kp-alert-fg-title: var(--kp-color-alert-success-outline-fg-title, #14532D);
      --kp-alert-fg-desc: var(--kp-color-alert-success-outline-fg-desc, #3F3F46);
      --kp-alert-border: var(--kp-color-alert-success-outline-border, #86EFAC);
      --kp-alert-icon: var(--kp-color-alert-success-outline-icon, #16A34A);
      --kp-alert-accent: var(--kp-color-alert-success-outline-accent, #16A34A);
    }
    :host(.kp-alert--success.kp-alert--left-accent) {
      --kp-alert-bg: var(--kp-color-alert-success-left-accent-bg, #FFFFFF);
      --kp-alert-fg-title: var(--kp-color-alert-success-left-accent-fg-title, #18181B);
      --kp-alert-fg-desc: var(--kp-color-alert-success-left-accent-fg-desc, #3F3F46);
      --kp-alert-border: var(--kp-color-alert-success-left-accent-border, #E4E4E7);
      --kp-alert-icon: var(--kp-color-alert-success-left-accent-icon, #16A34A);
      --kp-alert-accent: var(--kp-color-alert-success-left-accent-accent, #16A34A);
    }

    :host(.kp-alert--warning.kp-alert--subtle) {
      --kp-alert-bg: var(--kp-color-alert-warning-subtle-bg, #FFFBEB);
      --kp-alert-fg-title: var(--kp-color-alert-warning-subtle-fg-title, #78350F);
      --kp-alert-fg-desc: var(--kp-color-alert-warning-subtle-fg-desc, #92400E);
      --kp-alert-border: var(--kp-color-alert-warning-subtle-border, #FDE68A);
      --kp-alert-icon: var(--kp-color-alert-warning-subtle-icon, #D97706);
      --kp-alert-accent: var(--kp-color-alert-warning-subtle-accent, #F59E0B);
    }
    :host(.kp-alert--warning.kp-alert--solid) {
      --kp-alert-bg: var(--kp-color-alert-warning-solid-bg, #F59E0B);
      --kp-alert-fg-title: var(--kp-color-alert-warning-solid-fg-title, #18181B);
      --kp-alert-fg-desc: var(--kp-color-alert-warning-solid-fg-desc, #78350F);
      --kp-alert-border: var(--kp-color-alert-warning-solid-border, #F59E0B);
      --kp-alert-icon: var(--kp-color-alert-warning-solid-icon, #18181B);
      --kp-alert-accent: var(--kp-color-alert-warning-solid-accent, #18181B);
    }
    :host(.kp-alert--warning.kp-alert--outline) {
      --kp-alert-bg: var(--kp-color-alert-warning-outline-bg, #FFFFFF);
      --kp-alert-fg-title: var(--kp-color-alert-warning-outline-fg-title, #78350F);
      --kp-alert-fg-desc: var(--kp-color-alert-warning-outline-fg-desc, #3F3F46);
      --kp-alert-border: var(--kp-color-alert-warning-outline-border, #FCD34D);
      --kp-alert-icon: var(--kp-color-alert-warning-outline-icon, #D97706);
      --kp-alert-accent: var(--kp-color-alert-warning-outline-accent, #F59E0B);
    }
    :host(.kp-alert--warning.kp-alert--left-accent) {
      --kp-alert-bg: var(--kp-color-alert-warning-left-accent-bg, #FFFFFF);
      --kp-alert-fg-title: var(--kp-color-alert-warning-left-accent-fg-title, #18181B);
      --kp-alert-fg-desc: var(--kp-color-alert-warning-left-accent-fg-desc, #3F3F46);
      --kp-alert-border: var(--kp-color-alert-warning-left-accent-border, #E4E4E7);
      --kp-alert-icon: var(--kp-color-alert-warning-left-accent-icon, #D97706);
      --kp-alert-accent: var(--kp-color-alert-warning-left-accent-accent, #F59E0B);
    }

    :host(.kp-alert--info.kp-alert--subtle) {
      --kp-alert-bg: var(--kp-color-alert-info-subtle-bg, #ECFEFF);
      --kp-alert-fg-title: var(--kp-color-alert-info-subtle-fg-title, #164E63);
      --kp-alert-fg-desc: var(--kp-color-alert-info-subtle-fg-desc, #155E75);
      --kp-alert-border: var(--kp-color-alert-info-subtle-border, #A5F3FC);
      --kp-alert-icon: var(--kp-color-alert-info-subtle-icon, #0891B2);
      --kp-alert-accent: var(--kp-color-alert-info-subtle-accent, #0891B2);
    }
    :host(.kp-alert--info.kp-alert--solid) {
      --kp-alert-bg: var(--kp-color-alert-info-solid-bg, #0891B2);
      --kp-alert-fg-title: var(--kp-color-alert-info-solid-fg-title, #FFFFFF);
      --kp-alert-fg-desc: var(--kp-color-alert-info-solid-fg-desc, #ECFEFF);
      --kp-alert-border: var(--kp-color-alert-info-solid-border, #0891B2);
      --kp-alert-icon: var(--kp-color-alert-info-solid-icon, #FFFFFF);
      --kp-alert-accent: var(--kp-color-alert-info-solid-accent, #FFFFFF);
    }
    :host(.kp-alert--info.kp-alert--outline) {
      --kp-alert-bg: var(--kp-color-alert-info-outline-bg, #FFFFFF);
      --kp-alert-fg-title: var(--kp-color-alert-info-outline-fg-title, #164E63);
      --kp-alert-fg-desc: var(--kp-color-alert-info-outline-fg-desc, #3F3F46);
      --kp-alert-border: var(--kp-color-alert-info-outline-border, #67E8F9);
      --kp-alert-icon: var(--kp-color-alert-info-outline-icon, #0891B2);
      --kp-alert-accent: var(--kp-color-alert-info-outline-accent, #0891B2);
    }
    :host(.kp-alert--info.kp-alert--left-accent) {
      --kp-alert-bg: var(--kp-color-alert-info-left-accent-bg, #FFFFFF);
      --kp-alert-fg-title: var(--kp-color-alert-info-left-accent-fg-title, #18181B);
      --kp-alert-fg-desc: var(--kp-color-alert-info-left-accent-fg-desc, #3F3F46);
      --kp-alert-border: var(--kp-color-alert-info-left-accent-border, #E4E4E7);
      --kp-alert-icon: var(--kp-color-alert-info-left-accent-icon, #0891B2);
      --kp-alert-accent: var(--kp-color-alert-info-left-accent-accent, #0891B2);
    }

    :host(.kp-alert--neutral.kp-alert--subtle) {
      --kp-alert-bg: var(--kp-color-alert-neutral-subtle-bg, #FAFAFA);
      --kp-alert-fg-title: var(--kp-color-alert-neutral-subtle-fg-title, #18181B);
      --kp-alert-fg-desc: var(--kp-color-alert-neutral-subtle-fg-desc, #3F3F46);
      --kp-alert-border: var(--kp-color-alert-neutral-subtle-border, #E4E4E7);
      --kp-alert-icon: var(--kp-color-alert-neutral-subtle-icon, #52525B);
      --kp-alert-accent: var(--kp-color-alert-neutral-subtle-accent, #52525B);
    }
    :host(.kp-alert--neutral.kp-alert--solid) {
      --kp-alert-bg: var(--kp-color-alert-neutral-solid-bg, #18181B);
      --kp-alert-fg-title: var(--kp-color-alert-neutral-solid-fg-title, #FFFFFF);
      --kp-alert-fg-desc: var(--kp-color-alert-neutral-solid-fg-desc, #D4D4D8);
      --kp-alert-border: var(--kp-color-alert-neutral-solid-border, #18181B);
      --kp-alert-icon: var(--kp-color-alert-neutral-solid-icon, #FFFFFF);
      --kp-alert-accent: var(--kp-color-alert-neutral-solid-accent, #FFFFFF);
    }
    :host(.kp-alert--neutral.kp-alert--outline) {
      --kp-alert-bg: var(--kp-color-alert-neutral-outline-bg, #FFFFFF);
      --kp-alert-fg-title: var(--kp-color-alert-neutral-outline-fg-title, #18181B);
      --kp-alert-fg-desc: var(--kp-color-alert-neutral-outline-fg-desc, #3F3F46);
      --kp-alert-border: var(--kp-color-alert-neutral-outline-border, #D4D4D8);
      --kp-alert-icon: var(--kp-color-alert-neutral-outline-icon, #52525B);
      --kp-alert-accent: var(--kp-color-alert-neutral-outline-accent, #52525B);
    }
    :host(.kp-alert--neutral.kp-alert--left-accent) {
      --kp-alert-bg: var(--kp-color-alert-neutral-left-accent-bg, #FFFFFF);
      --kp-alert-fg-title: var(--kp-color-alert-neutral-left-accent-fg-title, #18181B);
      --kp-alert-fg-desc: var(--kp-color-alert-neutral-left-accent-fg-desc, #3F3F46);
      --kp-alert-border: var(--kp-color-alert-neutral-left-accent-border, #E4E4E7);
      --kp-alert-icon: var(--kp-color-alert-neutral-left-accent-icon, #52525B);
      --kp-alert-accent: var(--kp-color-alert-neutral-left-accent-accent, #52525B);
    }
  `],
})
export class KpAlertComponent {
  @Input() size: KpAlertSize = 'md';
  @Input() appearance: KpAlertAppearance = 'subtle';
  @Input() color: KpAlertColor = 'primary';
  @Input() title = '';
  @Input() description = '';
  @Input() actionPlacement: KpAlertActionPlacement = 'inline';
  @Input() closable = false;

  @Output() close = new EventEmitter<MouseEvent>();

  get closeIconSize(): number {
    return this.size === 'lg' ? 18 : this.size === 'md' ? 16 : 14;
  }

  get hostClasses(): string {
    return [
      'kp-alert',
      `kp-alert--${this.size}`,
      `kp-alert--${this.appearance}`,
      `kp-alert--${this.color}`,
    ].join(' ');
  }

  handleClose(event: MouseEvent): void {
    event.stopPropagation();
    this.close.emit(event);
  }
}
