import {
  Component,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';

import { KpSize, KpVariant, KpColorRole, KpState } from '@kanso-protocol/core';

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
        '[attr.role]': '"button"',
        '[attr.tabindex]': 'disabled ? -1 : 0',
        '[attr.aria-busy]': 'loading || null',
        '[attr.aria-disabled]': 'disabled || null',
        '(click)': 'handleClick($event)',
        '(keydown)': 'handleKey($event)',
    },
    template: `
    <span class="kp-button__content">
      @if (loading || forceState === 'loading') {
        <span class="kp-button__spinner" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity="0.25"/>
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
          </svg>
        </span>
      }

      @if (!loading && forceState !== 'loading') {
        <span class="kp-button__icon" aria-hidden="true">
          <ng-content select="[kpButtonIconLeft]"/>
        </span>
      }

      @if (!iconOnly) {
        <span class="kp-button__label" [class.kp-button__label--hidden]="loading || forceState === 'loading'">
          <ng-content/>
        </span>
      }

      @if (!loading && forceState !== 'loading') {
        <span class="kp-button__icon" aria-hidden="true">
          <ng-content select="[kpButtonIconRight]"/>
        </span>
      }
    </span>
    `,
    styles: [`
    :host {
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
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
      font-weight: var(--kp-button-font-weight, 400);
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

    /* --- Interactive states --- */
    :host(:hover:not(.kp-button--disabled):not(.kp-button--loading)),
    :host(.kp-button--hover) {
      background: var(--kp-button-bg-hover);
      border-color: var(--kp-button-border-hover);
      color: var(--kp-button-fg-hover);
    }

    :host(:active:not(.kp-button--disabled):not(.kp-button--loading)),
    :host(.kp-button--active) {
      background: var(--kp-button-bg-active);
      border-color: var(--kp-button-border-active);
      color: var(--kp-button-fg-active);
    }

    :host(:focus-visible),
    :host(.kp-button--focus) {
      outline: 2px solid var(--kp-color-focus-ring, var(--kp-color-blue-400));
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

    /* --- Content --- */
    .kp-button__content {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--kp-button-gap);
    }

    .kp-button__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    /* Sized via the per-variant --kp-button-icon-size token below; covers
       both the loading spinner SVG and any consumer-provided projected icon. */
    .kp-button__icon ::ng-deep svg,
    .kp-button__spinner svg {
      width: var(--kp-button-icon-size);
      height: var(--kp-button-icon-size);
    }

    .kp-button__icon:empty { display: none; }

    .kp-button__label {
      display: inline-flex;
      align-items: center;
    }

    .kp-button__label--hidden { display: none; }

    .kp-button__spinner {
      display: inline-flex;
      align-items: center;
      justify-content: center;
            animation: kp-spin var(--kp-motion-duration-spin) linear infinite;
    }

    @keyframes kp-spin { to { transform: rotate(360deg); } }

    /* Reduce-motion: slow the loading spinner to avoid triggering vestibular
       issues, but keep it rotating so the "busy" state stays visible. */
    @media (prefers-reduced-motion: reduce) {
      .kp-button__spinner { animation-duration: 3s; }
    }

    /* === SIZE TOKENS === synced from Figma Button master component */
    :host(.kp-button--xs) {
      --kp-button-height: 24px; --kp-button-radius: 8px; --kp-button-padding: 6px;
      --kp-button-font-size: 12px; --kp-button-line-height: 1.333;
      --kp-button-font-weight: 400; --kp-button-gap: 4px;
      --kp-button-icon-size: 14px;
    }
    :host(.kp-button--sm) {
      --kp-button-height: 28px; --kp-button-radius: 10px; --kp-button-padding: 8px;
      --kp-button-font-size: 14px; --kp-button-line-height: 1.428;
      --kp-button-font-weight: 400; --kp-button-gap: 5px;
      --kp-button-icon-size: 16px;
    }
    :host(.kp-button--md) {
      --kp-button-height: 36px; --kp-button-radius: 12px; --kp-button-padding: 12px;
      --kp-button-font-size: 16px; --kp-button-line-height: 1.5;
      --kp-button-font-weight: 400; --kp-button-gap: 6px;
      --kp-button-icon-size: 18px;
    }
    :host(.kp-button--lg) {
      --kp-button-height: 44px; --kp-button-radius: 14px; --kp-button-padding: 14px;
      --kp-button-font-size: 16px; --kp-button-line-height: 1.5;
      --kp-button-font-weight: 400; --kp-button-gap: 8px;
      --kp-button-icon-size: 22px;
    }
    :host(.kp-button--xl) {
      --kp-button-height: 52px; --kp-button-radius: 16px; --kp-button-padding: 16px;
      --kp-button-font-size: 20px; --kp-button-line-height: 1.4;
      --kp-button-font-weight: 500; --kp-button-gap: 8px;
      --kp-button-icon-size: 24px;
    }

    /* Icon-only: square hit-area, symmetric padding, no label */
    :host(.kp-button--icon-only) {
      width: var(--kp-button-height);
      min-width: var(--kp-button-height);
      padding: 0;
    }

    /* === PRIMARY DEFAULT === */
    :host(.kp-button--primary.kp-button--default) {
      --kp-button-bg: var(--kp-color-primary-default-bg-rest, var(--kp-color-blue-600));
      --kp-button-bg-hover: var(--kp-color-primary-default-bg-hover, var(--kp-color-blue-700));
      --kp-button-bg-active: var(--kp-color-primary-default-bg-active, var(--kp-color-blue-800));
      --kp-button-fg: var(--kp-color-primary-default-fg-rest, #FFF);
      --kp-button-fg-hover: var(--kp-color-primary-default-fg-hover, #FFF);
      --kp-button-fg-active: var(--kp-color-primary-default-fg-active, #FFF);
      --kp-button-border: var(--kp-color-primary-default-border-rest, var(--kp-color-blue-600));
      --kp-button-border-hover: var(--kp-color-primary-default-border-hover, var(--kp-color-blue-700));
      --kp-button-border-active: var(--kp-color-primary-default-border-active, var(--kp-color-blue-800));
    }
    :host(.kp-button--primary.kp-button--default.kp-button--disabled) {
      --kp-button-bg: var(--kp-color-gray-200); --kp-button-fg: var(--kp-color-gray-400); --kp-button-border: var(--kp-color-gray-200);
    }
    :host(.kp-button--primary.kp-button--default.kp-button--loading) {
      --kp-button-bg: var(--kp-color-blue-500); --kp-button-fg: var(--kp-color-white); --kp-button-border: var(--kp-color-blue-500);
    }

    /* === PRIMARY SUBTLE === */
    :host(.kp-button--primary.kp-button--subtle) {
      --kp-button-bg: var(--kp-color-blue-50); --kp-button-bg-hover: var(--kp-color-blue-100); --kp-button-bg-active: var(--kp-color-blue-200);
      --kp-button-fg: var(--kp-color-blue-700); --kp-button-fg-hover: var(--kp-color-blue-800); --kp-button-fg-active: var(--kp-color-blue-900);
      --kp-button-border: transparent; --kp-button-border-hover: transparent; --kp-button-border-active: transparent;
    }
    :host(.kp-button--primary.kp-button--subtle.kp-button--disabled) {
      --kp-button-bg: var(--kp-color-gray-100); --kp-button-fg: var(--kp-color-gray-400); --kp-button-border: transparent;
    }

    /* === PRIMARY OUTLINE === */
    :host(.kp-button--primary.kp-button--outline) {
      --kp-button-bg: transparent; --kp-button-bg-hover: var(--kp-color-blue-50); --kp-button-bg-active: var(--kp-color-blue-100);
      --kp-button-fg: var(--kp-color-blue-600); --kp-button-fg-hover: var(--kp-color-blue-700); --kp-button-fg-active: var(--kp-color-blue-800);
      --kp-button-border: var(--kp-color-blue-300); --kp-button-border-hover: var(--kp-color-blue-400); --kp-button-border-active: var(--kp-color-blue-500);
    }
    :host(.kp-button--primary.kp-button--outline.kp-button--disabled) {
      --kp-button-bg: transparent; --kp-button-fg: var(--kp-color-gray-400); --kp-button-border: var(--kp-color-gray-200);
    }

    /* === PRIMARY GHOST === */
    :host(.kp-button--primary.kp-button--ghost) {
      --kp-button-bg: transparent; --kp-button-bg-hover: var(--kp-color-blue-50); --kp-button-bg-active: var(--kp-color-blue-100);
      --kp-button-fg: var(--kp-color-blue-600); --kp-button-fg-hover: var(--kp-color-blue-700); --kp-button-fg-active: var(--kp-color-blue-800);
      --kp-button-border: transparent; --kp-button-border-hover: transparent; --kp-button-border-active: transparent;
    }
    :host(.kp-button--primary.kp-button--ghost.kp-button--disabled) {
      --kp-button-bg: transparent; --kp-button-fg: var(--kp-color-gray-400); --kp-button-border: transparent;
    }

    /* === DANGER DEFAULT === */
    :host(.kp-button--danger.kp-button--default) {
      --kp-button-bg: var(--kp-color-red-600); --kp-button-bg-hover: var(--kp-color-red-700); --kp-button-bg-active: var(--kp-color-red-800);
      --kp-button-fg: var(--kp-color-white); --kp-button-fg-hover: var(--kp-color-white); --kp-button-fg-active: var(--kp-color-white);
      --kp-button-border: var(--kp-color-red-600); --kp-button-border-hover: var(--kp-color-red-700); --kp-button-border-active: var(--kp-color-red-800);
    }
    :host(.kp-button--danger.kp-button--default.kp-button--disabled) {
      --kp-button-bg: var(--kp-color-gray-200); --kp-button-fg: var(--kp-color-gray-400); --kp-button-border: var(--kp-color-gray-200);
    }
    :host(.kp-button--danger.kp-button--default.kp-button--loading) {
      --kp-button-bg: var(--kp-color-red-500); --kp-button-fg: var(--kp-color-white); --kp-button-border: var(--kp-color-red-500);
    }

    /* === DANGER SUBTLE === */
    :host(.kp-button--danger.kp-button--subtle) {
      --kp-button-bg: var(--kp-color-red-50); --kp-button-bg-hover: var(--kp-color-red-100); --kp-button-bg-active: var(--kp-color-red-200);
      --kp-button-fg: var(--kp-color-red-700); --kp-button-fg-hover: var(--kp-color-red-800); --kp-button-fg-active: var(--kp-color-red-900);
      --kp-button-border: transparent; --kp-button-border-hover: transparent; --kp-button-border-active: transparent;
    }

    /* === DANGER OUTLINE === */
    :host(.kp-button--danger.kp-button--outline) {
      --kp-button-bg: transparent; --kp-button-bg-hover: var(--kp-color-red-50); --kp-button-bg-active: var(--kp-color-red-100);
      --kp-button-fg: var(--kp-color-red-600); --kp-button-fg-hover: var(--kp-color-red-700); --kp-button-fg-active: var(--kp-color-red-800);
      --kp-button-border: var(--kp-color-red-300); --kp-button-border-hover: var(--kp-color-red-400); --kp-button-border-active: var(--kp-color-red-500);
    }

    /* === DANGER GHOST === */
    :host(.kp-button--danger.kp-button--ghost) {
      --kp-button-bg: transparent; --kp-button-bg-hover: var(--kp-color-red-50); --kp-button-bg-active: var(--kp-color-red-100);
      --kp-button-fg: var(--kp-color-red-600); --kp-button-fg-hover: var(--kp-color-red-700); --kp-button-fg-active: var(--kp-color-red-800);
      --kp-button-border: transparent; --kp-button-border-hover: transparent; --kp-button-border-active: transparent;
    }

    /* === NEUTRAL DEFAULT === */
    :host(.kp-button--neutral.kp-button--default) {
      --kp-button-bg: var(--kp-color-gray-900); --kp-button-bg-hover: var(--kp-color-gray-800); --kp-button-bg-active: var(--kp-color-gray-700);
      --kp-button-fg: var(--kp-color-white); --kp-button-fg-hover: var(--kp-color-white); --kp-button-fg-active: var(--kp-color-white);
      --kp-button-border: var(--kp-color-gray-900); --kp-button-border-hover: var(--kp-color-gray-800); --kp-button-border-active: var(--kp-color-gray-700);
    }
    :host(.kp-button--neutral.kp-button--default.kp-button--disabled) {
      --kp-button-bg: var(--kp-color-gray-200); --kp-button-fg: var(--kp-color-gray-400); --kp-button-border: var(--kp-color-gray-200);
    }
    :host(.kp-button--neutral.kp-button--default.kp-button--loading) {
      --kp-button-bg: var(--kp-color-gray-700); --kp-button-fg: var(--kp-color-white); --kp-button-border: var(--kp-color-gray-700);
    }

    /* === NEUTRAL SUBTLE === */
    :host(.kp-button--neutral.kp-button--subtle) {
      --kp-button-bg: var(--kp-color-gray-100); --kp-button-bg-hover: var(--kp-color-gray-200); --kp-button-bg-active: var(--kp-color-gray-300);
      --kp-button-fg: var(--kp-color-gray-700); --kp-button-fg-hover: var(--kp-color-gray-800); --kp-button-fg-active: var(--kp-color-gray-900);
      --kp-button-border: transparent; --kp-button-border-hover: transparent; --kp-button-border-active: transparent;
    }

    /* === NEUTRAL OUTLINE === */
    :host(.kp-button--neutral.kp-button--outline) {
      --kp-button-bg: transparent; --kp-button-bg-hover: var(--kp-color-gray-50); --kp-button-bg-active: var(--kp-color-gray-100);
      --kp-button-fg: var(--kp-color-gray-700); --kp-button-fg-hover: var(--kp-color-gray-800); --kp-button-fg-active: var(--kp-color-gray-900);
      --kp-button-border: var(--kp-color-gray-300); --kp-button-border-hover: var(--kp-color-gray-400); --kp-button-border-active: var(--kp-color-gray-500);
    }

    /* === NEUTRAL GHOST === */
    :host(.kp-button--neutral.kp-button--ghost) {
      --kp-button-bg: transparent; --kp-button-bg-hover: var(--kp-color-gray-100); --kp-button-bg-active: var(--kp-color-gray-200);
      --kp-button-fg: var(--kp-color-gray-700); --kp-button-fg-hover: var(--kp-color-gray-800); --kp-button-fg-active: var(--kp-color-gray-900);
      --kp-button-border: transparent; --kp-button-border-hover: transparent; --kp-button-border-active: transparent;
    }

    /* === Generic disabled fallbacks ===
       Placed AFTER all color × variant rules so they win on cascade for any
       combo without an explicit .{color}.{variant}.disabled rule (e.g.
       neutral.ghost, used by NumberStepper for its + / − buttons).
       Higher-specificity 3-class rules above continue to win where defined.
       fg is repeated on every 2-class rule so it beats the rest-color
       rest-state rules (which are also 2-class and would otherwise win). */
    :host(.kp-button--disabled.kp-button--default) {
      --kp-button-bg: var(--kp-color-gray-200);
      --kp-button-bg-hover: var(--kp-color-gray-200);
      --kp-button-bg-active: var(--kp-color-gray-200);
      --kp-button-border: var(--kp-color-gray-200);
      --kp-button-border-hover: var(--kp-color-gray-200);
      --kp-button-border-active: var(--kp-color-gray-200);
      --kp-button-fg: var(--kp-color-gray-400);
      --kp-button-fg-hover: var(--kp-color-gray-400);
      --kp-button-fg-active: var(--kp-color-gray-400);
    }
    :host(.kp-button--disabled.kp-button--subtle) {
      --kp-button-bg: var(--kp-color-gray-100);
      --kp-button-bg-hover: var(--kp-color-gray-100);
      --kp-button-bg-active: var(--kp-color-gray-100);
      --kp-button-fg: var(--kp-color-gray-400);
      --kp-button-fg-hover: var(--kp-color-gray-400);
      --kp-button-fg-active: var(--kp-color-gray-400);
    }
    :host(.kp-button--disabled.kp-button--outline) {
      --kp-button-bg: transparent;
      --kp-button-bg-hover: transparent;
      --kp-button-bg-active: transparent;
      --kp-button-border: var(--kp-color-gray-200);
      --kp-button-border-hover: var(--kp-color-gray-200);
      --kp-button-border-active: var(--kp-color-gray-200);
      --kp-button-fg: var(--kp-color-gray-400);
      --kp-button-fg-hover: var(--kp-color-gray-400);
      --kp-button-fg-active: var(--kp-color-gray-400);
    }
    :host(.kp-button--disabled.kp-button--ghost) {
      --kp-button-bg: transparent;
      --kp-button-bg-hover: transparent;
      --kp-button-bg-active: transparent;
      --kp-button-fg: var(--kp-color-gray-400);
      --kp-button-fg-hover: var(--kp-color-gray-400);
      --kp-button-fg-active: var(--kp-color-gray-400);
    }
  `]
})
export class KpButtonComponent {
  @Input() size: KpSize = 'md';
  @Input() variant: KpVariant = 'default';
  @Input() color: KpColorRole = 'primary';
  @Input() disabled = false;
  @Input() loading = false;
  /** Hides the label and makes the button square (height × height) — pair with an icon and `aria-label` */
  @Input() iconOnly = false;
  /** Force a visual state for showcase/documentation purposes */
  @Input() forceState: KpState | null = null;

  get hostClasses(): string {
    const classes = [
      'kp-button',
      `kp-button--${this.size}`,
      `kp-button--${this.variant}`,
      `kp-button--${this.color}`,
    ];
    if (this.iconOnly) classes.push('kp-button--icon-only');
    if (this.forceState) {
      classes.push(`kp-button--${this.forceState}`);
    } else {
      if (this.disabled) classes.push('kp-button--disabled');
      if (this.loading) classes.push('kp-button--loading');
    }
    return classes.join(' ');
  }

  handleClick(event: MouseEvent): void {
    if (this.disabled || this.loading) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  handleKey(event: KeyboardEvent): void {
    // role="button" needs explicit Enter/Space handling — native buttons get
    // this for free, but we're a custom element. Translate to a click so the
    // (click) handler / consumer (click) bindings fire identically.
    if (event.key !== 'Enter' && event.key !== ' ') return;
    if (this.disabled || this.loading) return;
    event.preventDefault();
    (event.target as HTMLElement).click();
  }
}
