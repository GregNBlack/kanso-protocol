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

    @if (showCounter) {
      <span class="kp-badge__counter">{{ counter }}</span>
    }

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

    /* Numeric counter — a small rounded chip after the label, the same idea as
       the count chip in Tabs. Independent of the label / icon / dot / shape:
       it only shows when [counter] is set and never changes the rest. The
       background is a translucent tint of the current text color, so it adapts
       to any badge color — a light chip on filled (dark) badges, a dark chip
       on subtle / outline (light) ones — without per-color tokens. */
    .kp-badge__counter {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      flex: 0 0 auto;
      min-width: var(--kp-badge-counter-h);
      height: var(--kp-badge-counter-h);
      padding-inline: var(--kp-badge-counter-pad-x);
      border-radius: var(--kp-radius-full, 9999px);
      background: color-mix(in srgb, currentColor 16%, transparent);
      font-size: var(--kp-badge-counter-fs);
      font-weight: 600;
      line-height: 1;
      font-variant-numeric: tabular-nums;
    }

    /* With a trailing counter chip, tighten the badge's right padding to the
       same inset the chip already has top/bottom — (badge-h - counter-h)/2 —
       so the chip sits equidistant from the top, bottom, and right edges. */
    :host(.kp-badge--has-counter) { padding-inline-end: var(--kp-badge-counter-inset); }

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
      outline: var(--kp-focus-ring-width) solid var(--kp-color-focus-ring);
      outline-offset: 1px;
      opacity: 1;
    }

    /* Sizes */
    :host(.kp-badge--xs) {
      --kp-badge-h: 18px;
      --kp-badge-pad-x: 6px;
      --kp-badge-count-pad-x: 4px;
      --kp-badge-counter-h: 14px;
      --kp-badge-counter-pad-x: 4px;
      --kp-badge-counter-fs: 10px;
      --kp-badge-counter-inset: 1px;
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
      --kp-badge-count-pad-x: 5px;
      --kp-badge-counter-h: 16px;
      --kp-badge-counter-pad-x: 5px;
      --kp-badge-counter-fs: 11px;
      --kp-badge-counter-inset: 2px;
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
      --kp-badge-count-pad-x: 6px;
      --kp-badge-counter-h: 18px;
      --kp-badge-counter-pad-x: 6px;
      --kp-badge-counter-fs: 11px;
      --kp-badge-counter-inset: 3px;
      --kp-badge-gap: 6px;
      --kp-badge-font-size: 13px;
      --kp-badge-icon-size: 16px;
      --kp-badge-dot-size: 8px;
      --kp-badge-close-size: 14px;
      --kp-badge-close-radius: 4px;
      --kp-badge-radius: 8px;
    }

    :host(.kp-badge--pill) { --kp-badge-radius: var(--kp-radius-full, 9999px); }

    /* Counter shape: a notification-style circle for short numeric content.
       Forces full radius, min-width = height, and center-aligned content so a
       single digit ("1", "5") renders as a perfect circle. The per-size
       horizontal padding is small enough that one digit still hits min-width
       (stays circular) but large enough that "12" / "99+" don't crowd the
       edges — the old flat 2px looked like the padding had vanished. Use
       [pill] for word-bearing chips/tags instead. */
    :host(.kp-badge--count) {
      --kp-badge-radius: var(--kp-radius-full, 9999px);
      min-width: var(--kp-badge-h);
      padding-inline: var(--kp-badge-count-pad-x);
      justify-content: center;
    }

    /* Color × Appearance tokens — generated from tokens/semantic/color.json */
    :host(.kp-badge--primary.kp-badge--filled) {
      --kp-badge-bg: var(--kp-color-badge-primary-filled-bg);
      --kp-badge-fg: var(--kp-color-badge-primary-filled-fg);
      --kp-badge-border: var(--kp-color-badge-primary-filled-border);
      --kp-badge-dot: var(--kp-color-badge-primary-filled-dot);
    }
    :host(.kp-badge--primary.kp-badge--subtle) {
      --kp-badge-bg: var(--kp-color-badge-primary-subtle-bg);
      --kp-badge-fg: var(--kp-color-badge-primary-subtle-fg);
      --kp-badge-border: transparent;
      --kp-badge-dot: var(--kp-color-badge-primary-subtle-dot);
    }
    :host(.kp-badge--primary.kp-badge--outline) {
      --kp-badge-bg: transparent;
      --kp-badge-fg: var(--kp-color-badge-primary-outline-fg);
      --kp-badge-border: var(--kp-color-badge-primary-outline-border);
      --kp-badge-dot: var(--kp-color-badge-primary-outline-dot);
    }
    :host(.kp-badge--primary.kp-badge--dot) {
      --kp-badge-bg: transparent;
      --kp-badge-fg: var(--kp-color-badge-primary-dot-fg);
      --kp-badge-border: transparent;
      --kp-badge-dot: var(--kp-color-badge-primary-dot-dot);
    }

    :host(.kp-badge--danger.kp-badge--filled) {
      --kp-badge-bg: var(--kp-color-badge-danger-filled-bg);
      --kp-badge-fg: var(--kp-color-badge-danger-filled-fg);
      --kp-badge-border: var(--kp-color-badge-danger-filled-border);
      --kp-badge-dot: var(--kp-color-badge-danger-filled-dot);
    }
    :host(.kp-badge--danger.kp-badge--subtle) {
      --kp-badge-bg: var(--kp-color-badge-danger-subtle-bg);
      --kp-badge-fg: var(--kp-color-badge-danger-subtle-fg);
      --kp-badge-border: transparent;
      --kp-badge-dot: var(--kp-color-badge-danger-subtle-dot);
    }
    :host(.kp-badge--danger.kp-badge--outline) {
      --kp-badge-bg: transparent;
      --kp-badge-fg: var(--kp-color-badge-danger-outline-fg);
      --kp-badge-border: var(--kp-color-badge-danger-outline-border);
      --kp-badge-dot: var(--kp-color-badge-danger-outline-dot);
    }
    :host(.kp-badge--danger.kp-badge--dot) {
      --kp-badge-bg: transparent;
      --kp-badge-fg: var(--kp-color-badge-danger-dot-fg);
      --kp-badge-border: transparent;
      --kp-badge-dot: var(--kp-color-badge-danger-dot-dot);
    }

    :host(.kp-badge--success.kp-badge--filled) {
      --kp-badge-bg: var(--kp-color-badge-success-filled-bg);
      --kp-badge-fg: var(--kp-color-badge-success-filled-fg);
      --kp-badge-border: var(--kp-color-badge-success-filled-border);
      --kp-badge-dot: var(--kp-color-badge-success-filled-dot);
    }
    :host(.kp-badge--success.kp-badge--subtle) {
      --kp-badge-bg: var(--kp-color-badge-success-subtle-bg);
      --kp-badge-fg: var(--kp-color-badge-success-subtle-fg);
      --kp-badge-border: transparent;
      --kp-badge-dot: var(--kp-color-badge-success-subtle-dot);
    }
    :host(.kp-badge--success.kp-badge--outline) {
      --kp-badge-bg: transparent;
      --kp-badge-fg: var(--kp-color-badge-success-outline-fg);
      --kp-badge-border: var(--kp-color-badge-success-outline-border);
      --kp-badge-dot: var(--kp-color-badge-success-outline-dot);
    }
    :host(.kp-badge--success.kp-badge--dot) {
      --kp-badge-bg: transparent;
      --kp-badge-fg: var(--kp-color-badge-success-dot-fg);
      --kp-badge-border: transparent;
      --kp-badge-dot: var(--kp-color-badge-success-dot-dot);
    }

    :host(.kp-badge--warning.kp-badge--filled) {
      --kp-badge-bg: var(--kp-color-badge-warning-filled-bg);
      --kp-badge-fg: var(--kp-color-badge-warning-filled-fg);
      --kp-badge-border: var(--kp-color-badge-warning-filled-border);
      --kp-badge-dot: var(--kp-color-badge-warning-filled-dot);
    }
    :host(.kp-badge--warning.kp-badge--subtle) {
      --kp-badge-bg: var(--kp-color-badge-warning-subtle-bg);
      --kp-badge-fg: var(--kp-color-badge-warning-subtle-fg);
      --kp-badge-border: transparent;
      --kp-badge-dot: var(--kp-color-badge-warning-subtle-dot);
    }
    :host(.kp-badge--warning.kp-badge--outline) {
      --kp-badge-bg: transparent;
      --kp-badge-fg: var(--kp-color-badge-warning-outline-fg);
      --kp-badge-border: var(--kp-color-badge-warning-outline-border);
      --kp-badge-dot: var(--kp-color-badge-warning-outline-dot);
    }
    :host(.kp-badge--warning.kp-badge--dot) {
      --kp-badge-bg: transparent;
      --kp-badge-fg: var(--kp-color-badge-warning-dot-fg);
      --kp-badge-border: transparent;
      --kp-badge-dot: var(--kp-color-badge-warning-dot-dot);
    }

    :host(.kp-badge--info.kp-badge--filled) {
      --kp-badge-bg: var(--kp-color-badge-info-filled-bg);
      --kp-badge-fg: var(--kp-color-badge-info-filled-fg);
      --kp-badge-border: var(--kp-color-badge-info-filled-border);
      --kp-badge-dot: var(--kp-color-badge-info-filled-dot);
    }
    :host(.kp-badge--info.kp-badge--subtle) {
      --kp-badge-bg: var(--kp-color-badge-info-subtle-bg);
      --kp-badge-fg: var(--kp-color-badge-info-subtle-fg);
      --kp-badge-border: transparent;
      --kp-badge-dot: var(--kp-color-badge-info-subtle-dot);
    }
    :host(.kp-badge--info.kp-badge--outline) {
      --kp-badge-bg: transparent;
      --kp-badge-fg: var(--kp-color-badge-info-outline-fg);
      --kp-badge-border: var(--kp-color-badge-info-outline-border);
      --kp-badge-dot: var(--kp-color-badge-info-outline-dot);
    }
    :host(.kp-badge--info.kp-badge--dot) {
      --kp-badge-bg: transparent;
      --kp-badge-fg: var(--kp-color-badge-info-dot-fg);
      --kp-badge-border: transparent;
      --kp-badge-dot: var(--kp-color-badge-info-dot-dot);
    }

    :host(.kp-badge--neutral.kp-badge--filled) {
      --kp-badge-bg: var(--kp-color-badge-neutral-filled-bg);
      --kp-badge-fg: var(--kp-color-badge-neutral-filled-fg);
      --kp-badge-border: var(--kp-color-badge-neutral-filled-border);
      --kp-badge-dot: var(--kp-color-badge-neutral-filled-dot);
    }
    :host(.kp-badge--neutral.kp-badge--subtle) {
      --kp-badge-bg: var(--kp-color-badge-neutral-subtle-bg);
      --kp-badge-fg: var(--kp-color-badge-neutral-subtle-fg);
      --kp-badge-border: transparent;
      --kp-badge-dot: var(--kp-color-badge-neutral-subtle-dot);
    }
    :host(.kp-badge--neutral.kp-badge--outline) {
      --kp-badge-bg: transparent;
      --kp-badge-fg: var(--kp-color-badge-neutral-outline-fg);
      --kp-badge-border: var(--kp-color-badge-neutral-outline-border);
      --kp-badge-dot: var(--kp-color-badge-neutral-outline-dot);
    }
    :host(.kp-badge--neutral.kp-badge--dot) {
      --kp-badge-bg: transparent;
      --kp-badge-fg: var(--kp-color-badge-neutral-dot-fg);
      --kp-badge-border: transparent;
      --kp-badge-dot: var(--kp-color-badge-neutral-dot-dot);
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
export class KpBadgeComponent {
  @Input() size: KpBadgeSize = 'md';
  @Input() appearance: KpBadgeAppearance = 'filled';
  @Input() color: KpBadgeColor = 'primary';
  @Input() pill = false;
  /** Counter shape: a tight circle for short numeric content (notification badges, "1", "12", "99+"). Use `pill` for word-bearing chips. */
  @Input() count = false;
  /**
   * Numeric counter rendered as a small chip after the label (same idea as the
   * count chip in Tabs). Fully additive: it shows only when set and never
   * changes the label, icon, dot, or shape. Set a number (or "99+") to show it;
   * leave null/'' to hide. This is the "just a number" counter — distinct from
   * `count`, which reshapes the whole badge into a circle.
   */
  @Input() counter: number | string | null = null;
  /** Render a small colored dot before the label (independent of `appearance='dot'`; auto-shown for that appearance) */
  @Input() showLeadingDot = false;
  /** Render a ✕ affordance after the label and emit `close` when clicked */
  @Input() closable = false;

  @Output() close = new EventEmitter<MouseEvent>();

  get showDot(): boolean {
    return this.showLeadingDot || this.appearance === 'dot';
  }

  get showCounter(): boolean {
    const v = this.counter;
    if (v === null || v === undefined) return false;
    // A number control sends NaN when emptied; bound null/'' should hide too.
    if (typeof v === 'number') return !Number.isNaN(v);
    return `${v}`.trim() !== '';
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
    if (this.showCounter) c.push('kp-badge--has-counter');
    return c.join(' ');
  }

  handleClose(event: MouseEvent): void {
    event.stopPropagation();
    this.close.emit(event);
  }
}
