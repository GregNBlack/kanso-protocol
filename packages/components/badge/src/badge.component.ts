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
        <svg [attr.width]="closeSize" [attr.height]="closeSize" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
      transition: opacity 120ms ease, background 120ms ease;
    }
    .kp-badge__close:hover { opacity: 1; background: rgba(0, 0, 0, 0.08); }
    .kp-badge__close:focus-visible {
      outline: 2px solid var(--kp-color-focus-ring, #60A5FA);
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

    :host(.kp-badge--pill.kp-badge--xs) { --kp-badge-radius: 9px; }
    :host(.kp-badge--pill.kp-badge--sm) { --kp-badge-radius: 11px; }
    :host(.kp-badge--pill.kp-badge--md) { --kp-badge-radius: 13px; }

    /* Counter pill behaviour: min-width = height AND horizontal padding
       drops to 2px so 1–2 chars stay visually circular. The badge grows
       into a pill only once content is wide enough to push past the
       height (3+ chars, or words like "Design"). When closable (filter
       chips) we keep the normal pad-x — chips need real horizontal
       breathing room around the label and close button. */
    :host(.kp-badge--pill) {
      min-width: var(--kp-badge-h);
      justify-content: center;
    }
    :host(.kp-badge--pill:not(.kp-badge--closable)) {
      padding-inline: 2px;
    }

    /* Color × Appearance tokens — generated from tokens/semantic/color.json */
    :host(.kp-badge--primary.kp-badge--filled) {
      --kp-badge-bg: var(--kp-color-badge-primary-filled-bg, #2563EB);
      --kp-badge-fg: var(--kp-color-badge-primary-filled-fg, #FFFFFF);
      --kp-badge-border: var(--kp-color-badge-primary-filled-border, #2563EB);
      --kp-badge-dot: var(--kp-color-badge-primary-filled-dot, #FFFFFF);
    }
    :host(.kp-badge--primary.kp-badge--subtle) {
      --kp-badge-bg: var(--kp-color-badge-primary-subtle-bg, #EFF6FF);
      --kp-badge-fg: var(--kp-color-badge-primary-subtle-fg, #1D4ED8);
      --kp-badge-border: transparent;
      --kp-badge-dot: var(--kp-color-badge-primary-subtle-dot, #2563EB);
    }
    :host(.kp-badge--primary.kp-badge--outline) {
      --kp-badge-bg: transparent;
      --kp-badge-fg: var(--kp-color-badge-primary-outline-fg, #1D4ED8);
      --kp-badge-border: var(--kp-color-badge-primary-outline-border, #93C5FD);
      --kp-badge-dot: var(--kp-color-badge-primary-outline-dot, #2563EB);
    }
    :host(.kp-badge--primary.kp-badge--dot) {
      --kp-badge-bg: transparent;
      --kp-badge-fg: var(--kp-color-badge-primary-dot-fg, #3F3F46);
      --kp-badge-border: transparent;
      --kp-badge-dot: var(--kp-color-badge-primary-dot-dot, #2563EB);
    }

    :host(.kp-badge--danger.kp-badge--filled) {
      --kp-badge-bg: var(--kp-color-badge-danger-filled-bg, #DC2626);
      --kp-badge-fg: var(--kp-color-badge-danger-filled-fg, #FFFFFF);
      --kp-badge-border: var(--kp-color-badge-danger-filled-border, #DC2626);
      --kp-badge-dot: var(--kp-color-badge-danger-filled-dot, #FFFFFF);
    }
    :host(.kp-badge--danger.kp-badge--subtle) {
      --kp-badge-bg: var(--kp-color-badge-danger-subtle-bg, #FEF2F2);
      --kp-badge-fg: var(--kp-color-badge-danger-subtle-fg, #B91C1C);
      --kp-badge-border: transparent;
      --kp-badge-dot: var(--kp-color-badge-danger-subtle-dot, #DC2626);
    }
    :host(.kp-badge--danger.kp-badge--outline) {
      --kp-badge-bg: transparent;
      --kp-badge-fg: var(--kp-color-badge-danger-outline-fg, #B91C1C);
      --kp-badge-border: var(--kp-color-badge-danger-outline-border, #FCA5A5);
      --kp-badge-dot: var(--kp-color-badge-danger-outline-dot, #DC2626);
    }
    :host(.kp-badge--danger.kp-badge--dot) {
      --kp-badge-bg: transparent;
      --kp-badge-fg: var(--kp-color-badge-danger-dot-fg, #3F3F46);
      --kp-badge-border: transparent;
      --kp-badge-dot: var(--kp-color-badge-danger-dot-dot, #DC2626);
    }

    :host(.kp-badge--success.kp-badge--filled) {
      --kp-badge-bg: var(--kp-color-badge-success-filled-bg, #16A34A);
      --kp-badge-fg: var(--kp-color-badge-success-filled-fg, #FFFFFF);
      --kp-badge-border: var(--kp-color-badge-success-filled-border, #16A34A);
      --kp-badge-dot: var(--kp-color-badge-success-filled-dot, #FFFFFF);
    }
    :host(.kp-badge--success.kp-badge--subtle) {
      --kp-badge-bg: var(--kp-color-badge-success-subtle-bg, #F0FDF4);
      --kp-badge-fg: var(--kp-color-badge-success-subtle-fg, #15803D);
      --kp-badge-border: transparent;
      --kp-badge-dot: var(--kp-color-badge-success-subtle-dot, #16A34A);
    }
    :host(.kp-badge--success.kp-badge--outline) {
      --kp-badge-bg: transparent;
      --kp-badge-fg: var(--kp-color-badge-success-outline-fg, #15803D);
      --kp-badge-border: var(--kp-color-badge-success-outline-border, #86EFAC);
      --kp-badge-dot: var(--kp-color-badge-success-outline-dot, #16A34A);
    }
    :host(.kp-badge--success.kp-badge--dot) {
      --kp-badge-bg: transparent;
      --kp-badge-fg: var(--kp-color-badge-success-dot-fg, #3F3F46);
      --kp-badge-border: transparent;
      --kp-badge-dot: var(--kp-color-badge-success-dot-dot, #16A34A);
    }

    :host(.kp-badge--warning.kp-badge--filled) {
      --kp-badge-bg: var(--kp-color-badge-warning-filled-bg, #F59E0B);
      --kp-badge-fg: var(--kp-color-badge-warning-filled-fg, #18181B);
      --kp-badge-border: var(--kp-color-badge-warning-filled-border, #F59E0B);
      --kp-badge-dot: var(--kp-color-badge-warning-filled-dot, #18181B);
    }
    :host(.kp-badge--warning.kp-badge--subtle) {
      --kp-badge-bg: var(--kp-color-badge-warning-subtle-bg, #FFFBEB);
      --kp-badge-fg: var(--kp-color-badge-warning-subtle-fg, #B45309);
      --kp-badge-border: transparent;
      --kp-badge-dot: var(--kp-color-badge-warning-subtle-dot, #F59E0B);
    }
    :host(.kp-badge--warning.kp-badge--outline) {
      --kp-badge-bg: transparent;
      --kp-badge-fg: var(--kp-color-badge-warning-outline-fg, #B45309);
      --kp-badge-border: var(--kp-color-badge-warning-outline-border, #FCD34D);
      --kp-badge-dot: var(--kp-color-badge-warning-outline-dot, #F59E0B);
    }
    :host(.kp-badge--warning.kp-badge--dot) {
      --kp-badge-bg: transparent;
      --kp-badge-fg: var(--kp-color-badge-warning-dot-fg, #3F3F46);
      --kp-badge-border: transparent;
      --kp-badge-dot: var(--kp-color-badge-warning-dot-dot, #F59E0B);
    }

    :host(.kp-badge--info.kp-badge--filled) {
      --kp-badge-bg: var(--kp-color-badge-info-filled-bg, #0891B2);
      --kp-badge-fg: var(--kp-color-badge-info-filled-fg, #FFFFFF);
      --kp-badge-border: var(--kp-color-badge-info-filled-border, #0891B2);
      --kp-badge-dot: var(--kp-color-badge-info-filled-dot, #FFFFFF);
    }
    :host(.kp-badge--info.kp-badge--subtle) {
      --kp-badge-bg: var(--kp-color-badge-info-subtle-bg, #ECFEFF);
      --kp-badge-fg: var(--kp-color-badge-info-subtle-fg, #0E7490);
      --kp-badge-border: transparent;
      --kp-badge-dot: var(--kp-color-badge-info-subtle-dot, #0891B2);
    }
    :host(.kp-badge--info.kp-badge--outline) {
      --kp-badge-bg: transparent;
      --kp-badge-fg: var(--kp-color-badge-info-outline-fg, #0E7490);
      --kp-badge-border: var(--kp-color-badge-info-outline-border, #67E8F9);
      --kp-badge-dot: var(--kp-color-badge-info-outline-dot, #0891B2);
    }
    :host(.kp-badge--info.kp-badge--dot) {
      --kp-badge-bg: transparent;
      --kp-badge-fg: var(--kp-color-badge-info-dot-fg, #3F3F46);
      --kp-badge-border: transparent;
      --kp-badge-dot: var(--kp-color-badge-info-dot-dot, #0891B2);
    }

    :host(.kp-badge--neutral.kp-badge--filled) {
      --kp-badge-bg: var(--kp-color-badge-neutral-filled-bg, #18181B);
      --kp-badge-fg: var(--kp-color-badge-neutral-filled-fg, #FFFFFF);
      --kp-badge-border: var(--kp-color-badge-neutral-filled-border, #18181B);
      --kp-badge-dot: var(--kp-color-badge-neutral-filled-dot, #FFFFFF);
    }
    :host(.kp-badge--neutral.kp-badge--subtle) {
      --kp-badge-bg: var(--kp-color-badge-neutral-subtle-bg, #F4F4F5);
      --kp-badge-fg: var(--kp-color-badge-neutral-subtle-fg, #3F3F46);
      --kp-badge-border: transparent;
      --kp-badge-dot: var(--kp-color-badge-neutral-subtle-dot, #71717A);
    }
    :host(.kp-badge--neutral.kp-badge--outline) {
      --kp-badge-bg: transparent;
      --kp-badge-fg: var(--kp-color-badge-neutral-outline-fg, #3F3F46);
      --kp-badge-border: var(--kp-color-badge-neutral-outline-border, #D4D4D8);
      --kp-badge-dot: var(--kp-color-badge-neutral-outline-dot, #71717A);
    }
    :host(.kp-badge--neutral.kp-badge--dot) {
      --kp-badge-bg: transparent;
      --kp-badge-fg: var(--kp-color-badge-neutral-dot-fg, #3F3F46);
      --kp-badge-border: transparent;
      --kp-badge-dot: var(--kp-color-badge-neutral-dot-dot, #71717A);
    }
  `],
})
export class KpBadgeComponent {
  @Input() size: KpBadgeSize = 'md';
  @Input() appearance: KpBadgeAppearance = 'filled';
  @Input() color: KpBadgeColor = 'primary';
  @Input() pill = false;
  /** Render a small colored dot before the label (independent of `appearance='dot'`; auto-shown for that appearance) */
  @Input() showLeadingDot = false;
  /** Render a ✕ affordance after the label and emit `close` when clicked */
  @Input() closable = false;

  @Output() close = new EventEmitter<MouseEvent>();

  get showDot(): boolean {
    return this.showLeadingDot || this.appearance === 'dot';
  }

  get closeSize(): number {
    return this.size === 'md' ? 14 : this.size === 'sm' ? 12 : 10;
  }

  get hostClasses(): string {
    const c = [
      'kp-badge',
      `kp-badge--${this.size}`,
      `kp-badge--${this.color}`,
      `kp-badge--${this.appearance}`,
    ];
    if (this.pill) c.push('kp-badge--pill');
    if (this.closable) c.push('kp-badge--closable');
    return c.join(' ');
  }

  handleClose(event: MouseEvent): void {
    event.stopPropagation();
    this.close.emit(event);
  }
}
