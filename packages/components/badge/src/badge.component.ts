import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

export type KpBadgeSize = 'xs' | 'sm' | 'md';
export type KpBadgeAppearance = 'filled' | 'subtle' | 'outline' | 'dot';
export type KpBadgeColor =
  | 'primary'
  | 'danger'
  | 'success'
  | 'warning'
  | 'info'
  | 'neutral';

/**
 * Kanso Protocol — Badge
 *
 * Compact label for statuses, tags, and counters. 3 sizes × 4 appearances
 * × 6 color roles. A leading dot and a leading icon are independent
 * optional slots; the dot appearance drops the background and border so
 * the dot becomes the only colour cue.
 *
 * @example
 * <kp-badge color="success">Active</kp-badge>
 * <kp-badge appearance="dot" color="warning" [showLeadingDot]="true">Away</kp-badge>
 * <kp-badge pill [closable]="true" color="neutral" appearance="subtle" (close)="remove()">Design</kp-badge>
 * <kp-badge size="xs" color="danger" [count]="true">12</kp-badge>
 */
@Component({
  selector: 'kp-badge',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses',
  },
  template: `
    @if (showDot) {
      <span class="kp-badge__dot" aria-hidden="true"></span>
    }

    <span class="kp-badge__icon" aria-hidden="true">
      <ng-content select="[kpBadgeIcon]"/>
    </span>

    <span class="kp-badge__label"><ng-content/></span>

    @if (closable) {
      <button
        type="button"
        class="kp-badge__close"
        aria-label="Remove"
        (click)="handleClose($event)">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    }
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      box-sizing: border-box;
      height: var(--kp-badge-h);
      padding: 0 var(--kp-badge-pad-x);
      gap: var(--kp-badge-gap);
      border: 1px solid var(--kp-badge-border);
      border-radius: var(--kp-badge-radius);
      background: var(--kp-badge-bg);
      color: var(--kp-badge-fg);
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
      font-weight: 500;
      font-size: var(--kp-badge-font-size);
      line-height: 1;
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
      user-select: none;
    }

    .kp-badge__dot {
      flex: 0 0 auto;
      width: var(--kp-badge-dot-size);
      height: var(--kp-badge-dot-size);
      border-radius: 50%;
      background: var(--kp-badge-dot);
    }

    .kp-badge__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 auto;
    }
    .kp-badge__icon:empty { display: none; }
    .kp-badge__icon ::ng-deep svg {
      width: var(--kp-badge-icon-size);
      height: var(--kp-badge-icon-size);
    }

    .kp-badge__label {
      display: inline-flex;
      align-items: center;
    }

    .kp-badge__close {
      all: unset;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      padding: 1px;
      border-radius: var(--kp-badge-close-radius);
      color: currentColor;
      opacity: 0.75;
      transition: opacity var(--kp-motion-duration-fast) ease, background 120ms ease;
    }
    .kp-badge__close svg {
      width: var(--kp-badge-close-size);
      height: var(--kp-badge-close-size);
    }
    .kp-badge__close:hover { opacity: 1; background: var(--kp-color-overlay-hover-medium); }
    .kp-badge__close:focus-visible {
      outline: 2px solid var(--kp-color-focus-ring, var(--kp-color-blue-400));
      outline-offset: 1px;
      opacity: 1;
    }

    /* Sizes */
    :host(.kp-badge--xs) {
      --kp-badge-h: 18px;
      --kp-badge-pad-x: 6px;
      --kp-badge-gap: 4px;
      --kp-badge-font-size: 11px;
      --kp-badge-icon-size: 12px;
      --kp-badge-dot-size: 6px;
      --kp-badge-close-size: 10px;
      --kp-badge-close-radius: 2px;
      --kp-badge-radius: 4px;
    }
    :host(.kp-badge--sm) {
      --kp-badge-h: 22px;
      --kp-badge-pad-x: 8px;
      --kp-badge-gap: 4px;
      --kp-badge-font-size: 12px;
      --kp-badge-icon-size: 14px;
      --kp-badge-dot-size: 6px;
      --kp-badge-close-size: 12px;
      --kp-badge-close-radius: 2px;
      --kp-badge-radius: 6px;
    }
    :host(.kp-badge--md) {
      --kp-badge-h: 26px;
      --kp-badge-pad-x: 10px;
      --kp-badge-gap: 6px;
      --kp-badge-font-size: 13px;
      --kp-badge-icon-size: 16px;
      --kp-badge-dot-size: 8px;
      --kp-badge-close-size: 14px;
      --kp-badge-close-radius: 4px;
      --kp-badge-radius: 8px;
    }

    :host(.kp-badge--pill) { --kp-badge-radius: var(--kp-radius-full, 9999px); }

    /* Counter shape: a notification-style circle for 1–2 short numeric chars.
       Forces full radius, min-width = height, tight horizontal padding, and
       center-aligned content so "1", "12", "99+" all look visually circular
       at the same baseline. Use [pill] for word-bearing chips/tags instead. */
    :host(.kp-badge--count) {
      --kp-badge-radius: var(--kp-radius-full, 9999px);
      min-width: var(--kp-badge-h);
      padding-inline: 2px;
      justify-content: center;
    }

    /* Color × Appearance tokens — generated from tokens/semantic/color.json */
    :host(.kp-badge--primary.kp-badge--filled) {
      --kp-badge-bg: var(--kp-color-badge-primary-filled-bg, var(--kp-color-blue-600));
      --kp-badge-fg: var(--kp-color-badge-primary-filled-fg, var(--kp-color-white));
      --kp-badge-border: var(--kp-color-badge-primary-filled-border, var(--kp-color-blue-600));
      --kp-badge-dot: var(--kp-color-badge-primary-filled-dot, var(--kp-color-white));
    }
    :host(.kp-badge--primary.kp-badge--subtle) {
      --kp-badge-bg: var(--kp-color-badge-primary-subtle-bg, var(--kp-color-blue-50));
      --kp-badge-fg: var(--kp-color-badge-primary-subtle-fg, var(--kp-color-blue-700));
      --kp-badge-border: transparent;
      --kp-badge-dot: var(--kp-color-badge-primary-subtle-dot, var(--kp-color-blue-600));
    }
    :host(.kp-badge--primary.kp-badge--outline) {
      --kp-badge-bg: transparent;
      --kp-badge-fg: var(--kp-color-badge-primary-outline-fg, var(--kp-color-blue-700));
      --kp-badge-border: var(--kp-color-badge-primary-outline-border, var(--kp-color-blue-300));
      --kp-badge-dot: var(--kp-color-badge-primary-outline-dot, var(--kp-color-blue-600));
    }
    :host(.kp-badge--primary.kp-badge--dot) {
      --kp-badge-bg: transparent;
      --kp-badge-fg: var(--kp-color-badge-primary-dot-fg, var(--kp-color-gray-700));
      --kp-badge-border: transparent;
      --kp-badge-dot: var(--kp-color-badge-primary-dot-dot, var(--kp-color-blue-600));
    }

    :host(.kp-badge--danger.kp-badge--filled) {
      --kp-badge-bg: var(--kp-color-badge-danger-filled-bg, var(--kp-color-red-600));
      --kp-badge-fg: var(--kp-color-badge-danger-filled-fg, var(--kp-color-white));
      --kp-badge-border: var(--kp-color-badge-danger-filled-border, var(--kp-color-red-600));
      --kp-badge-dot: var(--kp-color-badge-danger-filled-dot, var(--kp-color-white));
    }
    :host(.kp-badge--danger.kp-badge--subtle) {
      --kp-badge-bg: var(--kp-color-badge-danger-subtle-bg, var(--kp-color-red-50));
      --kp-badge-fg: var(--kp-color-badge-danger-subtle-fg, var(--kp-color-red-700));
      --kp-badge-border: transparent;
      --kp-badge-dot: var(--kp-color-badge-danger-subtle-dot, var(--kp-color-red-600));
    }
    :host(.kp-badge--danger.kp-badge--outline) {
      --kp-badge-bg: transparent;
      --kp-badge-fg: var(--kp-color-badge-danger-outline-fg, var(--kp-color-red-700));
      --kp-badge-border: var(--kp-color-badge-danger-outline-border, var(--kp-color-red-300));
      --kp-badge-dot: var(--kp-color-badge-danger-outline-dot, var(--kp-color-red-600));
    }
    :host(.kp-badge--danger.kp-badge--dot) {
      --kp-badge-bg: transparent;
      --kp-badge-fg: var(--kp-color-badge-danger-dot-fg, var(--kp-color-gray-700));
      --kp-badge-border: transparent;
      --kp-badge-dot: var(--kp-color-badge-danger-dot-dot, var(--kp-color-red-600));
    }

    :host(.kp-badge--success.kp-badge--filled) {
      --kp-badge-bg: var(--kp-color-badge-success-filled-bg, var(--kp-color-green-600));
      --kp-badge-fg: var(--kp-color-badge-success-filled-fg, var(--kp-color-white));
      --kp-badge-border: var(--kp-color-badge-success-filled-border, var(--kp-color-green-600));
      --kp-badge-dot: var(--kp-color-badge-success-filled-dot, var(--kp-color-white));
    }
    :host(.kp-badge--success.kp-badge--subtle) {
      --kp-badge-bg: var(--kp-color-badge-success-subtle-bg, var(--kp-color-green-50));
      --kp-badge-fg: var(--kp-color-badge-success-subtle-fg, var(--kp-color-green-700));
      --kp-badge-border: transparent;
      --kp-badge-dot: var(--kp-color-badge-success-subtle-dot, var(--kp-color-green-600));
    }
    :host(.kp-badge--success.kp-badge--outline) {
      --kp-badge-bg: transparent;
      --kp-badge-fg: var(--kp-color-badge-success-outline-fg, var(--kp-color-green-700));
      --kp-badge-border: var(--kp-color-badge-success-outline-border, var(--kp-color-green-300));
      --kp-badge-dot: var(--kp-color-badge-success-outline-dot, var(--kp-color-green-600));
    }
    :host(.kp-badge--success.kp-badge--dot) {
      --kp-badge-bg: transparent;
      --kp-badge-fg: var(--kp-color-badge-success-dot-fg, var(--kp-color-gray-700));
      --kp-badge-border: transparent;
      --kp-badge-dot: var(--kp-color-badge-success-dot-dot, var(--kp-color-green-600));
    }

    :host(.kp-badge--warning.kp-badge--filled) {
      --kp-badge-bg: var(--kp-color-badge-warning-filled-bg, var(--kp-color-amber-500));
      --kp-badge-fg: var(--kp-color-badge-warning-filled-fg, var(--kp-color-gray-900));
      --kp-badge-border: var(--kp-color-badge-warning-filled-border, var(--kp-color-amber-500));
      --kp-badge-dot: var(--kp-color-badge-warning-filled-dot, var(--kp-color-gray-900));
    }
    :host(.kp-badge--warning.kp-badge--subtle) {
      --kp-badge-bg: var(--kp-color-badge-warning-subtle-bg, var(--kp-color-amber-50));
      --kp-badge-fg: var(--kp-color-badge-warning-subtle-fg, var(--kp-color-amber-700));
      --kp-badge-border: transparent;
      --kp-badge-dot: var(--kp-color-badge-warning-subtle-dot, var(--kp-color-amber-500));
    }
    :host(.kp-badge--warning.kp-badge--outline) {
      --kp-badge-bg: transparent;
      --kp-badge-fg: var(--kp-color-badge-warning-outline-fg, var(--kp-color-amber-700));
      --kp-badge-border: var(--kp-color-badge-warning-outline-border, var(--kp-color-amber-300));
      --kp-badge-dot: var(--kp-color-badge-warning-outline-dot, var(--kp-color-amber-500));
    }
    :host(.kp-badge--warning.kp-badge--dot) {
      --kp-badge-bg: transparent;
      --kp-badge-fg: var(--kp-color-badge-warning-dot-fg, var(--kp-color-gray-700));
      --kp-badge-border: transparent;
      --kp-badge-dot: var(--kp-color-badge-warning-dot-dot, var(--kp-color-amber-500));
    }

    :host(.kp-badge--info.kp-badge--filled) {
      --kp-badge-bg: var(--kp-color-badge-info-filled-bg, var(--kp-color-cyan-600));
      --kp-badge-fg: var(--kp-color-badge-info-filled-fg, var(--kp-color-white));
      --kp-badge-border: var(--kp-color-badge-info-filled-border, var(--kp-color-cyan-600));
      --kp-badge-dot: var(--kp-color-badge-info-filled-dot, var(--kp-color-white));
    }
    :host(.kp-badge--info.kp-badge--subtle) {
      --kp-badge-bg: var(--kp-color-badge-info-subtle-bg, var(--kp-color-cyan-50));
      --kp-badge-fg: var(--kp-color-badge-info-subtle-fg, var(--kp-color-cyan-700));
      --kp-badge-border: transparent;
      --kp-badge-dot: var(--kp-color-badge-info-subtle-dot, var(--kp-color-cyan-600));
    }
    :host(.kp-badge--info.kp-badge--outline) {
      --kp-badge-bg: transparent;
      --kp-badge-fg: var(--kp-color-badge-info-outline-fg, var(--kp-color-cyan-700));
      --kp-badge-border: var(--kp-color-badge-info-outline-border, var(--kp-color-cyan-300));
      --kp-badge-dot: var(--kp-color-badge-info-outline-dot, var(--kp-color-cyan-600));
    }
    :host(.kp-badge--info.kp-badge--dot) {
      --kp-badge-bg: transparent;
      --kp-badge-fg: var(--kp-color-badge-info-dot-fg, var(--kp-color-gray-700));
      --kp-badge-border: transparent;
      --kp-badge-dot: var(--kp-color-badge-info-dot-dot, var(--kp-color-cyan-600));
    }

    :host(.kp-badge--neutral.kp-badge--filled) {
      --kp-badge-bg: var(--kp-color-badge-neutral-filled-bg, var(--kp-color-gray-900));
      --kp-badge-fg: var(--kp-color-badge-neutral-filled-fg, var(--kp-color-white));
      --kp-badge-border: var(--kp-color-badge-neutral-filled-border, var(--kp-color-gray-900));
      --kp-badge-dot: var(--kp-color-badge-neutral-filled-dot, var(--kp-color-white));
    }
    :host(.kp-badge--neutral.kp-badge--subtle) {
      --kp-badge-bg: var(--kp-color-badge-neutral-subtle-bg, var(--kp-color-gray-100));
      --kp-badge-fg: var(--kp-color-badge-neutral-subtle-fg, var(--kp-color-gray-700));
      --kp-badge-border: transparent;
      --kp-badge-dot: var(--kp-color-badge-neutral-subtle-dot, var(--kp-color-gray-500));
    }
    :host(.kp-badge--neutral.kp-badge--outline) {
      --kp-badge-bg: transparent;
      --kp-badge-fg: var(--kp-color-badge-neutral-outline-fg, var(--kp-color-gray-700));
      --kp-badge-border: var(--kp-color-badge-neutral-outline-border, var(--kp-color-gray-300));
      --kp-badge-dot: var(--kp-color-badge-neutral-outline-dot, var(--kp-color-gray-500));
    }
    :host(.kp-badge--neutral.kp-badge--dot) {
      --kp-badge-bg: transparent;
      --kp-badge-fg: var(--kp-color-badge-neutral-dot-fg, var(--kp-color-gray-700));
      --kp-badge-border: transparent;
      --kp-badge-dot: var(--kp-color-badge-neutral-dot-dot, var(--kp-color-gray-500));
    }
  `],
})
export class KpBadgeComponent {
  @Input() size: KpBadgeSize = 'md';
  @Input() appearance: KpBadgeAppearance = 'filled';
  @Input() color: KpBadgeColor = 'primary';
  @Input() pill = false;
  /** Counter shape: a tight circle for short numeric content (notification badges, "1", "12", "99+"). Use `pill` for word-bearing chips. */
  @Input() count = false;
  /** Render a small colored dot before the label (independent of `appearance='dot'`; auto-shown for that appearance) */
  @Input() showLeadingDot = false;
  /** Render a ✕ affordance after the label and emit `close` when clicked */
  @Input() closable = false;

  @Output() close = new EventEmitter<MouseEvent>();

  get showDot(): boolean {
    return this.showLeadingDot || this.appearance === 'dot';
  }

  get hostClasses(): string {
    const c = [
      'kp-badge',
      `kp-badge--${this.size}`,
      `kp-badge--${this.color}`,
      `kp-badge--${this.appearance}`,
    ];
    if (this.pill) c.push('kp-badge--pill');
    if (this.count) c.push('kp-badge--count');
    if (this.closable) c.push('kp-badge--closable');
    return c.join(' ');
  }

  handleClose(event: MouseEvent): void {
    event.stopPropagation();
    this.close.emit(event);
  }
}
