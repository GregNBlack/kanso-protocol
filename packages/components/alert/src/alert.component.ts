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
      outline: 2px solid var(--kp-color-focus-ring, var(--kp-color-blue-400));
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
      --kp-alert-bg: var(--kp-color-alert-primary-subtle-bg, var(--kp-color-blue-50));
      --kp-alert-fg-title: var(--kp-color-alert-primary-subtle-fg-title, var(--kp-color-blue-900));
      --kp-alert-fg-desc: var(--kp-color-alert-primary-subtle-fg-desc, var(--kp-color-blue-800));
      --kp-alert-border: var(--kp-color-alert-primary-subtle-border, var(--kp-color-blue-200));
      --kp-alert-icon: var(--kp-color-alert-primary-subtle-icon, var(--kp-color-blue-600));
      --kp-alert-accent: var(--kp-color-alert-primary-subtle-accent, var(--kp-color-blue-600));
    }
    :host(.kp-alert--primary.kp-alert--solid) {
      --kp-alert-bg: var(--kp-color-alert-primary-solid-bg, var(--kp-color-blue-600));
      --kp-alert-fg-title: var(--kp-color-alert-primary-solid-fg-title, var(--kp-color-white));
      --kp-alert-fg-desc: var(--kp-color-alert-primary-solid-fg-desc, var(--kp-color-blue-50));
      --kp-alert-border: var(--kp-color-alert-primary-solid-border, var(--kp-color-blue-600));
      --kp-alert-icon: var(--kp-color-alert-primary-solid-icon, var(--kp-color-white));
      --kp-alert-accent: var(--kp-color-alert-primary-solid-accent, var(--kp-color-white));
    }
    :host(.kp-alert--primary.kp-alert--outline) {
      --kp-alert-bg: var(--kp-color-alert-primary-outline-bg, var(--kp-color-white));
      --kp-alert-fg-title: var(--kp-color-alert-primary-outline-fg-title, var(--kp-color-blue-900));
      --kp-alert-fg-desc: var(--kp-color-alert-primary-outline-fg-desc, var(--kp-color-gray-700));
      --kp-alert-border: var(--kp-color-alert-primary-outline-border, var(--kp-color-blue-300));
      --kp-alert-icon: var(--kp-color-alert-primary-outline-icon, var(--kp-color-blue-600));
      --kp-alert-accent: var(--kp-color-alert-primary-outline-accent, var(--kp-color-blue-600));
    }
    :host(.kp-alert--primary.kp-alert--left-accent) {
      --kp-alert-bg: var(--kp-color-alert-primary-left-accent-bg, var(--kp-color-white));
      --kp-alert-fg-title: var(--kp-color-alert-primary-left-accent-fg-title, var(--kp-color-gray-900));
      --kp-alert-fg-desc: var(--kp-color-alert-primary-left-accent-fg-desc, var(--kp-color-gray-700));
      --kp-alert-border: var(--kp-color-alert-primary-left-accent-border, var(--kp-color-gray-200));
      --kp-alert-icon: var(--kp-color-alert-primary-left-accent-icon, var(--kp-color-blue-600));
      --kp-alert-accent: var(--kp-color-alert-primary-left-accent-accent, var(--kp-color-blue-600));
    }

    :host(.kp-alert--danger.kp-alert--subtle) {
      --kp-alert-bg: var(--kp-color-alert-danger-subtle-bg, var(--kp-color-red-50));
      --kp-alert-fg-title: var(--kp-color-alert-danger-subtle-fg-title, var(--kp-color-red-900));
      --kp-alert-fg-desc: var(--kp-color-alert-danger-subtle-fg-desc, var(--kp-color-red-800));
      --kp-alert-border: var(--kp-color-alert-danger-subtle-border, var(--kp-color-red-200));
      --kp-alert-icon: var(--kp-color-alert-danger-subtle-icon, var(--kp-color-red-600));
      --kp-alert-accent: var(--kp-color-alert-danger-subtle-accent, var(--kp-color-red-600));
    }
    :host(.kp-alert--danger.kp-alert--solid) {
      --kp-alert-bg: var(--kp-color-alert-danger-solid-bg, var(--kp-color-red-600));
      --kp-alert-fg-title: var(--kp-color-alert-danger-solid-fg-title, var(--kp-color-white));
      --kp-alert-fg-desc: var(--kp-color-alert-danger-solid-fg-desc, var(--kp-color-red-50));
      --kp-alert-border: var(--kp-color-alert-danger-solid-border, var(--kp-color-red-600));
      --kp-alert-icon: var(--kp-color-alert-danger-solid-icon, var(--kp-color-white));
      --kp-alert-accent: var(--kp-color-alert-danger-solid-accent, var(--kp-color-white));
    }
    :host(.kp-alert--danger.kp-alert--outline) {
      --kp-alert-bg: var(--kp-color-alert-danger-outline-bg, var(--kp-color-white));
      --kp-alert-fg-title: var(--kp-color-alert-danger-outline-fg-title, var(--kp-color-red-900));
      --kp-alert-fg-desc: var(--kp-color-alert-danger-outline-fg-desc, var(--kp-color-gray-700));
      --kp-alert-border: var(--kp-color-alert-danger-outline-border, var(--kp-color-red-300));
      --kp-alert-icon: var(--kp-color-alert-danger-outline-icon, var(--kp-color-red-600));
      --kp-alert-accent: var(--kp-color-alert-danger-outline-accent, var(--kp-color-red-600));
    }
    :host(.kp-alert--danger.kp-alert--left-accent) {
      --kp-alert-bg: var(--kp-color-alert-danger-left-accent-bg, var(--kp-color-white));
      --kp-alert-fg-title: var(--kp-color-alert-danger-left-accent-fg-title, var(--kp-color-gray-900));
      --kp-alert-fg-desc: var(--kp-color-alert-danger-left-accent-fg-desc, var(--kp-color-gray-700));
      --kp-alert-border: var(--kp-color-alert-danger-left-accent-border, var(--kp-color-gray-200));
      --kp-alert-icon: var(--kp-color-alert-danger-left-accent-icon, var(--kp-color-red-600));
      --kp-alert-accent: var(--kp-color-alert-danger-left-accent-accent, var(--kp-color-red-600));
    }

    :host(.kp-alert--success.kp-alert--subtle) {
      --kp-alert-bg: var(--kp-color-alert-success-subtle-bg, var(--kp-color-green-50));
      --kp-alert-fg-title: var(--kp-color-alert-success-subtle-fg-title, var(--kp-color-green-900));
      --kp-alert-fg-desc: var(--kp-color-alert-success-subtle-fg-desc, var(--kp-color-green-800));
      --kp-alert-border: var(--kp-color-alert-success-subtle-border, var(--kp-color-green-200));
      --kp-alert-icon: var(--kp-color-alert-success-subtle-icon, var(--kp-color-green-600));
      --kp-alert-accent: var(--kp-color-alert-success-subtle-accent, var(--kp-color-green-600));
    }
    :host(.kp-alert--success.kp-alert--solid) {
      --kp-alert-bg: var(--kp-color-alert-success-solid-bg, var(--kp-color-green-600));
      --kp-alert-fg-title: var(--kp-color-alert-success-solid-fg-title, var(--kp-color-white));
      --kp-alert-fg-desc: var(--kp-color-alert-success-solid-fg-desc, var(--kp-color-green-50));
      --kp-alert-border: var(--kp-color-alert-success-solid-border, var(--kp-color-green-600));
      --kp-alert-icon: var(--kp-color-alert-success-solid-icon, var(--kp-color-white));
      --kp-alert-accent: var(--kp-color-alert-success-solid-accent, var(--kp-color-white));
    }
    :host(.kp-alert--success.kp-alert--outline) {
      --kp-alert-bg: var(--kp-color-alert-success-outline-bg, var(--kp-color-white));
      --kp-alert-fg-title: var(--kp-color-alert-success-outline-fg-title, var(--kp-color-green-900));
      --kp-alert-fg-desc: var(--kp-color-alert-success-outline-fg-desc, var(--kp-color-gray-700));
      --kp-alert-border: var(--kp-color-alert-success-outline-border, var(--kp-color-green-300));
      --kp-alert-icon: var(--kp-color-alert-success-outline-icon, var(--kp-color-green-600));
      --kp-alert-accent: var(--kp-color-alert-success-outline-accent, var(--kp-color-green-600));
    }
    :host(.kp-alert--success.kp-alert--left-accent) {
      --kp-alert-bg: var(--kp-color-alert-success-left-accent-bg, var(--kp-color-white));
      --kp-alert-fg-title: var(--kp-color-alert-success-left-accent-fg-title, var(--kp-color-gray-900));
      --kp-alert-fg-desc: var(--kp-color-alert-success-left-accent-fg-desc, var(--kp-color-gray-700));
      --kp-alert-border: var(--kp-color-alert-success-left-accent-border, var(--kp-color-gray-200));
      --kp-alert-icon: var(--kp-color-alert-success-left-accent-icon, var(--kp-color-green-600));
      --kp-alert-accent: var(--kp-color-alert-success-left-accent-accent, var(--kp-color-green-600));
    }

    :host(.kp-alert--warning.kp-alert--subtle) {
      --kp-alert-bg: var(--kp-color-alert-warning-subtle-bg, var(--kp-color-amber-50));
      --kp-alert-fg-title: var(--kp-color-alert-warning-subtle-fg-title, var(--kp-color-amber-900));
      --kp-alert-fg-desc: var(--kp-color-alert-warning-subtle-fg-desc, var(--kp-color-amber-800));
      --kp-alert-border: var(--kp-color-alert-warning-subtle-border, var(--kp-color-amber-200));
      --kp-alert-icon: var(--kp-color-alert-warning-subtle-icon, var(--kp-color-amber-600));
      --kp-alert-accent: var(--kp-color-alert-warning-subtle-accent, var(--kp-color-amber-500));
    }
    :host(.kp-alert--warning.kp-alert--solid) {
      --kp-alert-bg: var(--kp-color-alert-warning-solid-bg, var(--kp-color-amber-500));
      --kp-alert-fg-title: var(--kp-color-alert-warning-solid-fg-title, var(--kp-color-gray-900));
      --kp-alert-fg-desc: var(--kp-color-alert-warning-solid-fg-desc, var(--kp-color-amber-900));
      --kp-alert-border: var(--kp-color-alert-warning-solid-border, var(--kp-color-amber-500));
      --kp-alert-icon: var(--kp-color-alert-warning-solid-icon, var(--kp-color-gray-900));
      --kp-alert-accent: var(--kp-color-alert-warning-solid-accent, var(--kp-color-gray-900));
    }
    :host(.kp-alert--warning.kp-alert--outline) {
      --kp-alert-bg: var(--kp-color-alert-warning-outline-bg, var(--kp-color-white));
      --kp-alert-fg-title: var(--kp-color-alert-warning-outline-fg-title, var(--kp-color-amber-900));
      --kp-alert-fg-desc: var(--kp-color-alert-warning-outline-fg-desc, var(--kp-color-gray-700));
      --kp-alert-border: var(--kp-color-alert-warning-outline-border, var(--kp-color-amber-300));
      --kp-alert-icon: var(--kp-color-alert-warning-outline-icon, var(--kp-color-amber-600));
      --kp-alert-accent: var(--kp-color-alert-warning-outline-accent, var(--kp-color-amber-500));
    }
    :host(.kp-alert--warning.kp-alert--left-accent) {
      --kp-alert-bg: var(--kp-color-alert-warning-left-accent-bg, var(--kp-color-white));
      --kp-alert-fg-title: var(--kp-color-alert-warning-left-accent-fg-title, var(--kp-color-gray-900));
      --kp-alert-fg-desc: var(--kp-color-alert-warning-left-accent-fg-desc, var(--kp-color-gray-700));
      --kp-alert-border: var(--kp-color-alert-warning-left-accent-border, var(--kp-color-gray-200));
      --kp-alert-icon: var(--kp-color-alert-warning-left-accent-icon, var(--kp-color-amber-600));
      --kp-alert-accent: var(--kp-color-alert-warning-left-accent-accent, var(--kp-color-amber-500));
    }

    :host(.kp-alert--info.kp-alert--subtle) {
      --kp-alert-bg: var(--kp-color-alert-info-subtle-bg, var(--kp-color-cyan-50));
      --kp-alert-fg-title: var(--kp-color-alert-info-subtle-fg-title, var(--kp-color-cyan-900));
      --kp-alert-fg-desc: var(--kp-color-alert-info-subtle-fg-desc, var(--kp-color-cyan-800));
      --kp-alert-border: var(--kp-color-alert-info-subtle-border, var(--kp-color-cyan-200));
      --kp-alert-icon: var(--kp-color-alert-info-subtle-icon, var(--kp-color-cyan-600));
      --kp-alert-accent: var(--kp-color-alert-info-subtle-accent, var(--kp-color-cyan-600));
    }
    :host(.kp-alert--info.kp-alert--solid) {
      --kp-alert-bg: var(--kp-color-alert-info-solid-bg, var(--kp-color-cyan-600));
      --kp-alert-fg-title: var(--kp-color-alert-info-solid-fg-title, var(--kp-color-white));
      --kp-alert-fg-desc: var(--kp-color-alert-info-solid-fg-desc, var(--kp-color-cyan-50));
      --kp-alert-border: var(--kp-color-alert-info-solid-border, var(--kp-color-cyan-600));
      --kp-alert-icon: var(--kp-color-alert-info-solid-icon, var(--kp-color-white));
      --kp-alert-accent: var(--kp-color-alert-info-solid-accent, var(--kp-color-white));
    }
    :host(.kp-alert--info.kp-alert--outline) {
      --kp-alert-bg: var(--kp-color-alert-info-outline-bg, var(--kp-color-white));
      --kp-alert-fg-title: var(--kp-color-alert-info-outline-fg-title, var(--kp-color-cyan-900));
      --kp-alert-fg-desc: var(--kp-color-alert-info-outline-fg-desc, var(--kp-color-gray-700));
      --kp-alert-border: var(--kp-color-alert-info-outline-border, var(--kp-color-cyan-300));
      --kp-alert-icon: var(--kp-color-alert-info-outline-icon, var(--kp-color-cyan-600));
      --kp-alert-accent: var(--kp-color-alert-info-outline-accent, var(--kp-color-cyan-600));
    }
    :host(.kp-alert--info.kp-alert--left-accent) {
      --kp-alert-bg: var(--kp-color-alert-info-left-accent-bg, var(--kp-color-white));
      --kp-alert-fg-title: var(--kp-color-alert-info-left-accent-fg-title, var(--kp-color-gray-900));
      --kp-alert-fg-desc: var(--kp-color-alert-info-left-accent-fg-desc, var(--kp-color-gray-700));
      --kp-alert-border: var(--kp-color-alert-info-left-accent-border, var(--kp-color-gray-200));
      --kp-alert-icon: var(--kp-color-alert-info-left-accent-icon, var(--kp-color-cyan-600));
      --kp-alert-accent: var(--kp-color-alert-info-left-accent-accent, var(--kp-color-cyan-600));
    }

    :host(.kp-alert--neutral.kp-alert--subtle) {
      --kp-alert-bg: var(--kp-color-alert-neutral-subtle-bg, var(--kp-color-gray-50));
      --kp-alert-fg-title: var(--kp-color-alert-neutral-subtle-fg-title, var(--kp-color-gray-900));
      --kp-alert-fg-desc: var(--kp-color-alert-neutral-subtle-fg-desc, var(--kp-color-gray-700));
      --kp-alert-border: var(--kp-color-alert-neutral-subtle-border, var(--kp-color-gray-200));
      --kp-alert-icon: var(--kp-color-alert-neutral-subtle-icon, var(--kp-color-gray-600));
      --kp-alert-accent: var(--kp-color-alert-neutral-subtle-accent, var(--kp-color-gray-600));
    }
    :host(.kp-alert--neutral.kp-alert--solid) {
      --kp-alert-bg: var(--kp-color-alert-neutral-solid-bg, var(--kp-color-gray-900));
      --kp-alert-fg-title: var(--kp-color-alert-neutral-solid-fg-title, var(--kp-color-white));
      --kp-alert-fg-desc: var(--kp-color-alert-neutral-solid-fg-desc, var(--kp-color-gray-300));
      --kp-alert-border: var(--kp-color-alert-neutral-solid-border, var(--kp-color-gray-900));
      --kp-alert-icon: var(--kp-color-alert-neutral-solid-icon, var(--kp-color-white));
      --kp-alert-accent: var(--kp-color-alert-neutral-solid-accent, var(--kp-color-white));
    }
    :host(.kp-alert--neutral.kp-alert--outline) {
      --kp-alert-bg: var(--kp-color-alert-neutral-outline-bg, var(--kp-color-white));
      --kp-alert-fg-title: var(--kp-color-alert-neutral-outline-fg-title, var(--kp-color-gray-900));
      --kp-alert-fg-desc: var(--kp-color-alert-neutral-outline-fg-desc, var(--kp-color-gray-700));
      --kp-alert-border: var(--kp-color-alert-neutral-outline-border, var(--kp-color-gray-300));
      --kp-alert-icon: var(--kp-color-alert-neutral-outline-icon, var(--kp-color-gray-600));
      --kp-alert-accent: var(--kp-color-alert-neutral-outline-accent, var(--kp-color-gray-600));
    }
    :host(.kp-alert--neutral.kp-alert--left-accent) {
      --kp-alert-bg: var(--kp-color-alert-neutral-left-accent-bg, var(--kp-color-white));
      --kp-alert-fg-title: var(--kp-color-alert-neutral-left-accent-fg-title, var(--kp-color-gray-900));
      --kp-alert-fg-desc: var(--kp-color-alert-neutral-left-accent-fg-desc, var(--kp-color-gray-700));
      --kp-alert-border: var(--kp-color-alert-neutral-left-accent-border, var(--kp-color-gray-200));
      --kp-alert-icon: var(--kp-color-alert-neutral-left-accent-icon, var(--kp-color-gray-600));
      --kp-alert-accent: var(--kp-color-alert-neutral-left-accent-accent, var(--kp-color-gray-600));
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
