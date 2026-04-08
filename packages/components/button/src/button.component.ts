import {
  Component,
  Input,
  ChangeDetectionStrategy,
  HostBinding,
  ElementRef,
  inject,
} from '@angular/core';

import { KpSize, KpVariant, KpColorRole } from '@kanso-protocol/core';

/**
 * Kanso Protocol — Button Component
 *
 * Anatomy: Container → Content → Elements (icon-left, label, icon-right)
 * Supports: 5 sizes × 4 variants × 3+ color roles × 6 states
 *
 * @example
 * <kp-button size="md" variant="default" color="primary">Click me</kp-button>
 * <kp-button size="lg" variant="outline" color="danger" [loading]="true">Delete</kp-button>
 */
@Component({
    selector: 'kp-button',
    imports: [],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '[class]': 'hostClasses',
        '[attr.aria-busy]': 'loading || null',
        '[attr.aria-disabled]': 'disabled || null',
        '(click)': 'handleClick($event)',
    },
    template: `
    <!-- Container → Content → Elements -->
    <span class="kp-button__content">
      <!-- Loading spinner replaces icon-left -->
      @if (loading) {
        <span class="kp-button__spinner" aria-hidden="true">
          <svg
            [attr.width]="iconSizeMap[size]"
            [attr.height]="iconSizeMap[size]"
            viewBox="0 0 24 24"
            fill="none"
            >
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity="0.25"/>
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
          </svg>
        </span>
      }
    
      <!-- Icon left (hidden during loading) -->
      @if (!loading) {
        <span class="kp-button__icon" aria-hidden="true">
          <ng-content select="[kpButtonIconLeft]"/>
        </span>
      }
    
      <!-- Label -->
      <span class="kp-button__label" [class.kp-button__label--hidden]="loading">
        <ng-content/>
      </span>
    
      <!-- Icon right (hidden during loading) -->
      @if (!loading) {
        <span class="kp-button__icon" aria-hidden="true">
          <ng-content select="[kpButtonIconRight]"/>
        </span>
      }
    </span>
    `,
    styles: [`
    :host {
      /* === Container === */
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      border: 1px solid var(--kp-button-border);
      border-radius: var(--kp-button-radius);
      background: var(--kp-button-bg);
      color: var(--kp-button-fg);
      height: var(--kp-button-height);
      min-width: var(--kp-button-height);
      padding: 0 var(--kp-button-padding);
      font-family: var(--kp-font-family-base, 'Onest', system-ui, sans-serif);
      font-weight: 500;
      font-size: var(--kp-button-font-size);
      line-height: var(--kp-button-line-height);
      cursor: pointer;
      user-select: none;
      white-space: nowrap;
      transition:
        background var(--kp-motion-duration-fast, 100ms) var(--kp-motion-ease-in-out, cubic-bezier(0.4, 0, 0.2, 1)),
        border-color var(--kp-motion-duration-fast, 100ms) var(--kp-motion-ease-in-out, cubic-bezier(0.4, 0, 0.2, 1)),
        color var(--kp-motion-duration-fast, 100ms) var(--kp-motion-ease-in-out, cubic-bezier(0.4, 0, 0.2, 1));
    }

    /* --- States --- */
    :host(:hover:not(.kp-button--disabled):not(.kp-button--loading)) {
      background: var(--kp-button-bg-hover);
      border-color: var(--kp-button-border-hover);
      color: var(--kp-button-fg-hover);
    }

    :host(:active:not(.kp-button--disabled):not(.kp-button--loading)) {
      background: var(--kp-button-bg-active);
      border-color: var(--kp-button-border-active);
      color: var(--kp-button-fg-active);
    }

    :host(:focus-visible) {
      outline: 2px solid var(--kp-color-focus-ring, #60A5FA);
      outline-offset: 2px;
    }

    :host(.kp-button--disabled) {
      cursor: not-allowed;
      pointer-events: none;
    }

    :host(.kp-button--loading) {
      cursor: default;
      pointer-events: none;
    }

    /* --- Content (gap manager) --- */
    .kp-button__content {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--kp-button-gap);
    }

    /* --- Elements --- */
    .kp-button__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .kp-button__icon:empty {
      display: none;
    }

    .kp-button__label {
      display: inline-flex;
      align-items: center;
    }

    .kp-button__label--hidden {
      display: none;
    }

    .kp-button__spinner {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      animation: kp-spin 0.8s linear infinite;
    }

    @keyframes kp-spin {
      to { transform: rotate(360deg); }
    }

    /* === SIZE TOKENS === */
    :host(.kp-button--xs) {
      --kp-button-height: 24px;
      --kp-button-radius: 8px;
      --kp-button-padding: 6px;
      --kp-button-font-size: 12px;
      --kp-button-line-height: 1.334;
      --kp-button-gap: 4px;
    }

    :host(.kp-button--sm) {
      --kp-button-height: 28px;
      --kp-button-radius: 10px;
      --kp-button-padding: 8px;
      --kp-button-font-size: 13px;
      --kp-button-line-height: 1.384;
      --kp-button-gap: 5px;
    }

    :host(.kp-button--md) {
      --kp-button-height: 36px;
      --kp-button-radius: 12px;
      --kp-button-padding: 12px;
      --kp-button-font-size: 14px;
      --kp-button-line-height: 1.428;
      --kp-button-gap: 6px;
    }

    :host(.kp-button--lg) {
      --kp-button-height: 44px;
      --kp-button-radius: 14px;
      --kp-button-padding: 14px;
      --kp-button-font-size: 16px;
      --kp-button-line-height: 1.5;
      --kp-button-gap: 8px;
    }

    :host(.kp-button--xl) {
      --kp-button-height: 52px;
      --kp-button-radius: 16px;
      --kp-button-padding: 16px;
      --kp-button-font-size: 18px;
      --kp-button-line-height: 1.334;
      --kp-button-gap: 8px;
    }

    /* === COLOR × VARIANT TOKENS — PRIMARY === */
    :host(.kp-button--primary.kp-button--default) {
      --kp-button-bg: var(--kp-color-primary-default-bg-rest, #2563EB);
      --kp-button-bg-hover: var(--kp-color-primary-default-bg-hover, #1D4ED8);
      --kp-button-bg-active: var(--kp-color-primary-default-bg-active, #1E40AF);
      --kp-button-fg: var(--kp-color-primary-default-fg-rest, #FFFFFF);
      --kp-button-fg-hover: var(--kp-color-primary-default-fg-hover, #FFFFFF);
      --kp-button-fg-active: var(--kp-color-primary-default-fg-active, #FFFFFF);
      --kp-button-border: var(--kp-color-primary-default-border-rest, #2563EB);
      --kp-button-border-hover: var(--kp-color-primary-default-border-hover, #1D4ED8);
      --kp-button-border-active: var(--kp-color-primary-default-border-active, #1E40AF);
    }
    :host(.kp-button--primary.kp-button--default.kp-button--disabled) {
      --kp-button-bg: var(--kp-color-primary-default-bg-disabled, #E4E4E7);
      --kp-button-fg: var(--kp-color-primary-default-fg-disabled, #A1A1AA);
      --kp-button-border: var(--kp-color-primary-default-border-disabled, #E4E4E7);
    }
    :host(.kp-button--primary.kp-button--default.kp-button--loading) {
      --kp-button-bg: var(--kp-color-primary-default-bg-loading, #3B82F6);
      --kp-button-fg: var(--kp-color-primary-default-fg-loading, #FFFFFF);
      --kp-button-border: var(--kp-color-primary-default-border-loading, #3B82F6);
    }

    :host(.kp-button--primary.kp-button--subtle) {
      --kp-button-bg: var(--kp-color-primary-subtle-bg-rest, #EFF6FF);
      --kp-button-bg-hover: var(--kp-color-primary-subtle-bg-hover, #DBEAFE);
      --kp-button-bg-active: var(--kp-color-primary-subtle-bg-active, #BFDBFE);
      --kp-button-fg: var(--kp-color-primary-subtle-fg-rest, #1D4ED8);
      --kp-button-fg-hover: var(--kp-color-primary-subtle-fg-hover, #1E40AF);
      --kp-button-fg-active: var(--kp-color-primary-subtle-fg-active, #1E3A8A);
      --kp-button-border: transparent;
      --kp-button-border-hover: transparent;
      --kp-button-border-active: transparent;
    }
    :host(.kp-button--primary.kp-button--subtle.kp-button--disabled) {
      --kp-button-bg: var(--kp-color-primary-subtle-bg-disabled, #F4F4F5);
      --kp-button-fg: var(--kp-color-primary-subtle-fg-disabled, #A1A1AA);
      --kp-button-border: transparent;
    }

    :host(.kp-button--primary.kp-button--outline) {
      --kp-button-bg: transparent;
      --kp-button-bg-hover: var(--kp-color-primary-outline-bg-hover, #EFF6FF);
      --kp-button-bg-active: var(--kp-color-primary-outline-bg-active, #DBEAFE);
      --kp-button-fg: var(--kp-color-primary-outline-fg-rest, #2563EB);
      --kp-button-fg-hover: var(--kp-color-primary-outline-fg-hover, #1D4ED8);
      --kp-button-fg-active: var(--kp-color-primary-outline-fg-active, #1E40AF);
      --kp-button-border: var(--kp-color-primary-outline-border-rest, #93C5FD);
      --kp-button-border-hover: var(--kp-color-primary-outline-border-hover, #60A5FA);
      --kp-button-border-active: var(--kp-color-primary-outline-border-active, #3B82F6);
    }
    :host(.kp-button--primary.kp-button--outline.kp-button--disabled) {
      --kp-button-bg: transparent;
      --kp-button-fg: var(--kp-color-primary-outline-fg-disabled, #A1A1AA);
      --kp-button-border: var(--kp-color-primary-outline-border-disabled, #E4E4E7);
    }

    :host(.kp-button--primary.kp-button--ghost) {
      --kp-button-bg: transparent;
      --kp-button-bg-hover: var(--kp-color-primary-ghost-bg-hover, #EFF6FF);
      --kp-button-bg-active: var(--kp-color-primary-ghost-bg-active, #DBEAFE);
      --kp-button-fg: var(--kp-color-primary-ghost-fg-rest, #2563EB);
      --kp-button-fg-hover: var(--kp-color-primary-ghost-fg-hover, #1D4ED8);
      --kp-button-fg-active: var(--kp-color-primary-ghost-fg-active, #1E40AF);
      --kp-button-border: transparent;
      --kp-button-border-hover: transparent;
      --kp-button-border-active: transparent;
    }
    :host(.kp-button--primary.kp-button--ghost.kp-button--disabled) {
      --kp-button-bg: transparent;
      --kp-button-fg: var(--kp-color-primary-ghost-fg-disabled, #A1A1AA);
      --kp-button-border: transparent;
    }

    /* === DANGER === */
    :host(.kp-button--danger.kp-button--default) {
      --kp-button-bg: var(--kp-color-danger-default-bg-rest, #DC2626);
      --kp-button-bg-hover: var(--kp-color-danger-default-bg-hover, #B91C1C);
      --kp-button-bg-active: var(--kp-color-danger-default-bg-active, #991B1B);
      --kp-button-fg: #FFFFFF;
      --kp-button-fg-hover: #FFFFFF;
      --kp-button-fg-active: #FFFFFF;
      --kp-button-border: var(--kp-color-danger-default-border-rest, #DC2626);
      --kp-button-border-hover: var(--kp-color-danger-default-border-hover, #B91C1C);
      --kp-button-border-active: var(--kp-color-danger-default-border-active, #991B1B);
    }
    :host(.kp-button--danger.kp-button--default.kp-button--disabled) {
      --kp-button-bg: #E4E4E7; --kp-button-fg: #A1A1AA; --kp-button-border: #E4E4E7;
    }
    :host(.kp-button--danger.kp-button--default.kp-button--loading) {
      --kp-button-bg: #EF4444; --kp-button-fg: #FFFFFF; --kp-button-border: #EF4444;
    }

    :host(.kp-button--danger.kp-button--subtle) {
      --kp-button-bg: #FEF2F2; --kp-button-bg-hover: #FEE2E2; --kp-button-bg-active: #FECACA;
      --kp-button-fg: #B91C1C; --kp-button-fg-hover: #991B1B; --kp-button-fg-active: #7F1D1D;
      --kp-button-border: transparent; --kp-button-border-hover: transparent; --kp-button-border-active: transparent;
    }

    :host(.kp-button--danger.kp-button--outline) {
      --kp-button-bg: transparent; --kp-button-bg-hover: #FEF2F2; --kp-button-bg-active: #FEE2E2;
      --kp-button-fg: #DC2626; --kp-button-fg-hover: #B91C1C; --kp-button-fg-active: #991B1B;
      --kp-button-border: #FCA5A5; --kp-button-border-hover: #F87171; --kp-button-border-active: #EF4444;
    }

    :host(.kp-button--danger.kp-button--ghost) {
      --kp-button-bg: transparent; --kp-button-bg-hover: #FEF2F2; --kp-button-bg-active: #FEE2E2;
      --kp-button-fg: #DC2626; --kp-button-fg-hover: #B91C1C; --kp-button-fg-active: #991B1B;
      --kp-button-border: transparent; --kp-button-border-hover: transparent; --kp-button-border-active: transparent;
    }

    /* === NEUTRAL === */
    :host(.kp-button--neutral.kp-button--default) {
      --kp-button-bg: #18181B; --kp-button-bg-hover: #27272A; --kp-button-bg-active: #3F3F46;
      --kp-button-fg: #FFFFFF; --kp-button-fg-hover: #FFFFFF; --kp-button-fg-active: #FFFFFF;
      --kp-button-border: #18181B; --kp-button-border-hover: #27272A; --kp-button-border-active: #3F3F46;
    }
    :host(.kp-button--neutral.kp-button--default.kp-button--disabled) {
      --kp-button-bg: #E4E4E7; --kp-button-fg: #A1A1AA; --kp-button-border: #E4E4E7;
    }
    :host(.kp-button--neutral.kp-button--default.kp-button--loading) {
      --kp-button-bg: #3F3F46; --kp-button-fg: #FFFFFF; --kp-button-border: #3F3F46;
    }

    :host(.kp-button--neutral.kp-button--subtle) {
      --kp-button-bg: #F4F4F5; --kp-button-bg-hover: #E4E4E7; --kp-button-bg-active: #D4D4D8;
      --kp-button-fg: #3F3F46; --kp-button-fg-hover: #27272A; --kp-button-fg-active: #18181B;
      --kp-button-border: transparent; --kp-button-border-hover: transparent; --kp-button-border-active: transparent;
    }

    :host(.kp-button--neutral.kp-button--outline) {
      --kp-button-bg: transparent; --kp-button-bg-hover: #FAFAFA; --kp-button-bg-active: #F4F4F5;
      --kp-button-fg: #3F3F46; --kp-button-fg-hover: #27272A; --kp-button-fg-active: #18181B;
      --kp-button-border: #D4D4D8; --kp-button-border-hover: #A1A1AA; --kp-button-border-active: #71717A;
    }

    :host(.kp-button--neutral.kp-button--ghost) {
      --kp-button-bg: transparent; --kp-button-bg-hover: #F4F4F5; --kp-button-bg-active: #E4E4E7;
      --kp-button-fg: #3F3F46; --kp-button-fg-hover: #27272A; --kp-button-fg-active: #18181B;
      --kp-button-border: transparent; --kp-button-border-hover: transparent; --kp-button-border-active: transparent;
    }
  `]
})
export class KpButtonComponent {
  @Input() size: KpSize = 'md';
  @Input() variant: KpVariant = 'default';
  @Input() color: KpColorRole = 'primary';
  @Input() disabled = false;
  @Input() loading = false;

  readonly iconSizeMap: Record<KpSize, number> = {
    xs: 14, sm: 16, md: 18, lg: 22, xl: 24,
  };

  get hostClasses(): string {
    const classes = [
      'kp-button',
      `kp-button--${this.size}`,
      `kp-button--${this.variant}`,
      `kp-button--${this.color}`,
    ];
    if (this.disabled) classes.push('kp-button--disabled');
    if (this.loading) classes.push('kp-button--loading');
    return classes.join(' ');
  }

  handleClick(event: MouseEvent): void {
    if (this.disabled || this.loading) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
}
