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
 *   <button kpButton kpAlertAction size="sm" variant="subtle">Review</button>
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
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
      color: var(--kp-alert-fg-title);
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
      transition: opacity var(--kp-motion-duration-fast) ease, background 120ms ease;
    }
    .kp-alert__close:hover { opacity: 1; background: var(--kp-color-overlay-hover-light); }
    .kp-alert__close:focus-visible {
      outline: var(--kp-focus-ring-width) solid var(--kp-color-focus-ring);
      outline-offset: 1px;
      opacity: 1;
    }
    .kp-alert__close svg {
      width: var(--kp-alert-close-icon-size);
      height: var(--kp-alert-close-icon-size);
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
      --kp-alert-close-icon-size: 14px;
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
      --kp-alert-close-icon-size: 16px;
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
      --kp-alert-close-icon-size: 18px;
      --kp-alert-close-radius: 6px;
      --kp-alert-accent-width: 4px;
      --kp-alert-title-size: 20px; --kp-alert-title-lh: 28px;
      --kp-alert-desc-size: 16px;  --kp-alert-desc-lh: 24px;
    }

    /* --- Color × Appearance (24 combos from tokens) --- */
    :host(.kp-alert--primary.kp-alert--subtle) {
      --kp-alert-bg: var(--kp-color-alert-primary-subtle-bg);
      --kp-alert-fg-title: var(--kp-color-alert-primary-subtle-fg-title);
      --kp-alert-fg-desc: var(--kp-color-alert-primary-subtle-fg-desc);
      --kp-alert-border: var(--kp-color-alert-primary-subtle-border);
      --kp-alert-accent: var(--kp-color-alert-primary-subtle-accent);
    }
    :host(.kp-alert--primary.kp-alert--solid) {
      --kp-alert-bg: var(--kp-color-alert-primary-solid-bg);
      --kp-alert-fg-title: var(--kp-color-alert-primary-solid-fg-title);
      --kp-alert-fg-desc: var(--kp-color-alert-primary-solid-fg-desc);
      --kp-alert-border: var(--kp-color-alert-primary-solid-border);
      --kp-alert-accent: var(--kp-color-alert-primary-solid-accent);
    }
    :host(.kp-alert--primary.kp-alert--outline) {
      --kp-alert-bg: var(--kp-color-alert-primary-outline-bg);
      --kp-alert-fg-title: var(--kp-color-alert-primary-outline-fg-title);
      --kp-alert-fg-desc: var(--kp-color-alert-primary-outline-fg-desc);
      --kp-alert-border: var(--kp-color-alert-primary-outline-border);
      --kp-alert-accent: var(--kp-color-alert-primary-outline-accent);
    }
    :host(.kp-alert--primary.kp-alert--left-accent) {
      --kp-alert-bg: var(--kp-color-alert-primary-left-accent-bg);
      --kp-alert-fg-title: var(--kp-color-alert-primary-left-accent-fg-title);
      --kp-alert-fg-desc: var(--kp-color-alert-primary-left-accent-fg-desc);
      --kp-alert-border: var(--kp-color-alert-primary-left-accent-border);
      --kp-alert-accent: var(--kp-color-alert-primary-left-accent-accent);
    }

    :host(.kp-alert--danger.kp-alert--subtle) {
      --kp-alert-bg: var(--kp-color-alert-danger-subtle-bg);
      --kp-alert-fg-title: var(--kp-color-alert-danger-subtle-fg-title);
      --kp-alert-fg-desc: var(--kp-color-alert-danger-subtle-fg-desc);
      --kp-alert-border: var(--kp-color-alert-danger-subtle-border);
      --kp-alert-accent: var(--kp-color-alert-danger-subtle-accent);
    }
    :host(.kp-alert--danger.kp-alert--solid) {
      --kp-alert-bg: var(--kp-color-alert-danger-solid-bg);
      --kp-alert-fg-title: var(--kp-color-alert-danger-solid-fg-title);
      --kp-alert-fg-desc: var(--kp-color-alert-danger-solid-fg-desc);
      --kp-alert-border: var(--kp-color-alert-danger-solid-border);
      --kp-alert-accent: var(--kp-color-alert-danger-solid-accent);
    }
    :host(.kp-alert--danger.kp-alert--outline) {
      --kp-alert-bg: var(--kp-color-alert-danger-outline-bg);
      --kp-alert-fg-title: var(--kp-color-alert-danger-outline-fg-title);
      --kp-alert-fg-desc: var(--kp-color-alert-danger-outline-fg-desc);
      --kp-alert-border: var(--kp-color-alert-danger-outline-border);
      --kp-alert-accent: var(--kp-color-alert-danger-outline-accent);
    }
    :host(.kp-alert--danger.kp-alert--left-accent) {
      --kp-alert-bg: var(--kp-color-alert-danger-left-accent-bg);
      --kp-alert-fg-title: var(--kp-color-alert-danger-left-accent-fg-title);
      --kp-alert-fg-desc: var(--kp-color-alert-danger-left-accent-fg-desc);
      --kp-alert-border: var(--kp-color-alert-danger-left-accent-border);
      --kp-alert-accent: var(--kp-color-alert-danger-left-accent-accent);
    }

    :host(.kp-alert--success.kp-alert--subtle) {
      --kp-alert-bg: var(--kp-color-alert-success-subtle-bg);
      --kp-alert-fg-title: var(--kp-color-alert-success-subtle-fg-title);
      --kp-alert-fg-desc: var(--kp-color-alert-success-subtle-fg-desc);
      --kp-alert-border: var(--kp-color-alert-success-subtle-border);
      --kp-alert-accent: var(--kp-color-alert-success-subtle-accent);
    }
    :host(.kp-alert--success.kp-alert--solid) {
      --kp-alert-bg: var(--kp-color-alert-success-solid-bg);
      --kp-alert-fg-title: var(--kp-color-alert-success-solid-fg-title);
      --kp-alert-fg-desc: var(--kp-color-alert-success-solid-fg-desc);
      --kp-alert-border: var(--kp-color-alert-success-solid-border);
      --kp-alert-accent: var(--kp-color-alert-success-solid-accent);
    }
    :host(.kp-alert--success.kp-alert--outline) {
      --kp-alert-bg: var(--kp-color-alert-success-outline-bg);
      --kp-alert-fg-title: var(--kp-color-alert-success-outline-fg-title);
      --kp-alert-fg-desc: var(--kp-color-alert-success-outline-fg-desc);
      --kp-alert-border: var(--kp-color-alert-success-outline-border);
      --kp-alert-accent: var(--kp-color-alert-success-outline-accent);
    }
    :host(.kp-alert--success.kp-alert--left-accent) {
      --kp-alert-bg: var(--kp-color-alert-success-left-accent-bg);
      --kp-alert-fg-title: var(--kp-color-alert-success-left-accent-fg-title);
      --kp-alert-fg-desc: var(--kp-color-alert-success-left-accent-fg-desc);
      --kp-alert-border: var(--kp-color-alert-success-left-accent-border);
      --kp-alert-accent: var(--kp-color-alert-success-left-accent-accent);
    }

    :host(.kp-alert--warning.kp-alert--subtle) {
      --kp-alert-bg: var(--kp-color-alert-warning-subtle-bg);
      --kp-alert-fg-title: var(--kp-color-alert-warning-subtle-fg-title);
      --kp-alert-fg-desc: var(--kp-color-alert-warning-subtle-fg-desc);
      --kp-alert-border: var(--kp-color-alert-warning-subtle-border);
      --kp-alert-accent: var(--kp-color-alert-warning-subtle-accent);
    }
    :host(.kp-alert--warning.kp-alert--solid) {
      --kp-alert-bg: var(--kp-color-alert-warning-solid-bg);
      --kp-alert-fg-title: var(--kp-color-alert-warning-solid-fg-title);
      --kp-alert-fg-desc: var(--kp-color-alert-warning-solid-fg-desc);
      --kp-alert-border: var(--kp-color-alert-warning-solid-border);
      --kp-alert-accent: var(--kp-color-alert-warning-solid-accent);
    }
    :host(.kp-alert--warning.kp-alert--outline) {
      --kp-alert-bg: var(--kp-color-alert-warning-outline-bg);
      --kp-alert-fg-title: var(--kp-color-alert-warning-outline-fg-title);
      --kp-alert-fg-desc: var(--kp-color-alert-warning-outline-fg-desc);
      --kp-alert-border: var(--kp-color-alert-warning-outline-border);
      --kp-alert-accent: var(--kp-color-alert-warning-outline-accent);
    }
    :host(.kp-alert--warning.kp-alert--left-accent) {
      --kp-alert-bg: var(--kp-color-alert-warning-left-accent-bg);
      --kp-alert-fg-title: var(--kp-color-alert-warning-left-accent-fg-title);
      --kp-alert-fg-desc: var(--kp-color-alert-warning-left-accent-fg-desc);
      --kp-alert-border: var(--kp-color-alert-warning-left-accent-border);
      --kp-alert-accent: var(--kp-color-alert-warning-left-accent-accent);
    }

    :host(.kp-alert--info.kp-alert--subtle) {
      --kp-alert-bg: var(--kp-color-alert-info-subtle-bg);
      --kp-alert-fg-title: var(--kp-color-alert-info-subtle-fg-title);
      --kp-alert-fg-desc: var(--kp-color-alert-info-subtle-fg-desc);
      --kp-alert-border: var(--kp-color-alert-info-subtle-border);
      --kp-alert-accent: var(--kp-color-alert-info-subtle-accent);
    }
    :host(.kp-alert--info.kp-alert--solid) {
      --kp-alert-bg: var(--kp-color-alert-info-solid-bg);
      --kp-alert-fg-title: var(--kp-color-alert-info-solid-fg-title);
      --kp-alert-fg-desc: var(--kp-color-alert-info-solid-fg-desc);
      --kp-alert-border: var(--kp-color-alert-info-solid-border);
      --kp-alert-accent: var(--kp-color-alert-info-solid-accent);
    }
    :host(.kp-alert--info.kp-alert--outline) {
      --kp-alert-bg: var(--kp-color-alert-info-outline-bg);
      --kp-alert-fg-title: var(--kp-color-alert-info-outline-fg-title);
      --kp-alert-fg-desc: var(--kp-color-alert-info-outline-fg-desc);
      --kp-alert-border: var(--kp-color-alert-info-outline-border);
      --kp-alert-accent: var(--kp-color-alert-info-outline-accent);
    }
    :host(.kp-alert--info.kp-alert--left-accent) {
      --kp-alert-bg: var(--kp-color-alert-info-left-accent-bg);
      --kp-alert-fg-title: var(--kp-color-alert-info-left-accent-fg-title);
      --kp-alert-fg-desc: var(--kp-color-alert-info-left-accent-fg-desc);
      --kp-alert-border: var(--kp-color-alert-info-left-accent-border);
      --kp-alert-accent: var(--kp-color-alert-info-left-accent-accent);
    }

    :host(.kp-alert--neutral.kp-alert--subtle) {
      --kp-alert-bg: var(--kp-color-alert-neutral-subtle-bg);
      --kp-alert-fg-title: var(--kp-color-alert-neutral-subtle-fg-title);
      --kp-alert-fg-desc: var(--kp-color-alert-neutral-subtle-fg-desc);
      --kp-alert-border: var(--kp-color-alert-neutral-subtle-border);
      --kp-alert-accent: var(--kp-color-alert-neutral-subtle-accent);
    }
    :host(.kp-alert--neutral.kp-alert--solid) {
      --kp-alert-bg: var(--kp-color-alert-neutral-solid-bg);
      --kp-alert-fg-title: var(--kp-color-alert-neutral-solid-fg-title);
      --kp-alert-fg-desc: var(--kp-color-alert-neutral-solid-fg-desc);
      --kp-alert-border: var(--kp-color-alert-neutral-solid-border);
      --kp-alert-accent: var(--kp-color-alert-neutral-solid-accent);
    }
    :host(.kp-alert--neutral.kp-alert--outline) {
      --kp-alert-bg: var(--kp-color-alert-neutral-outline-bg);
      --kp-alert-fg-title: var(--kp-color-alert-neutral-outline-fg-title);
      --kp-alert-fg-desc: var(--kp-color-alert-neutral-outline-fg-desc);
      --kp-alert-border: var(--kp-color-alert-neutral-outline-border);
      --kp-alert-accent: var(--kp-color-alert-neutral-outline-accent);
    }
    :host(.kp-alert--neutral.kp-alert--left-accent) {
      --kp-alert-bg: var(--kp-color-alert-neutral-left-accent-bg);
      --kp-alert-fg-title: var(--kp-color-alert-neutral-left-accent-fg-title);
      --kp-alert-fg-desc: var(--kp-color-alert-neutral-left-accent-fg-desc);
      --kp-alert-border: var(--kp-color-alert-neutral-left-accent-border);
      --kp-alert-accent: var(--kp-color-alert-neutral-left-accent-accent);
    }

    /* Respect the OS reduced-motion setting: collapse transitions and
       decorative animation to effectively instant. */
    @media (prefers-reduced-motion: reduce) {
      :host,
      :host * {
        transition-duration: 0.01ms !important;
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        scroll-behavior: auto !important;
      }
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
