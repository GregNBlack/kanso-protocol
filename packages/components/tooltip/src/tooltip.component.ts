import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';

export type KpTooltipSize = 'sm' | 'md';
export type KpTooltipArrowPosition = 'none' | 'top' | 'right' | 'bottom' | 'left';
/**
 * Where along the tooltip's edge the arrow attaches.
 * - `center` — arrow at the geometric centre (default; classic tooltip)
 * - `start`  — arrow near the leading edge of the tooltip
 *              (top/bottom: left side; left/right: top side)
 * - `end`    — arrow near the trailing edge
 *              (top/bottom: right side; left/right: bottom side)
 *
 * Use `start` / `end` when the trigger sits near a viewport edge: the
 * tooltip body shifts inward while the arrow stays anchored to the
 * trigger, instead of wrapping the body to two lines or pushing it
 * off-screen.
 */
export type KpTooltipArrowAlign = 'start' | 'center' | 'end';

/**
 * Kanso Protocol — Tooltip
 *
 * Dark, compact hint body with an optional directional arrow. This component
 * renders only the visual chrome — **positioning is the caller's
 * responsibility**. Pair with a directive (hover / focus handling, floating
 * UI placement, z-index, portal) to make it interactive.
 *
 * @example
 * <!-- Bare body (for Storybook / layout playgrounds) -->
 * <kp-tooltip label="Search" shortcut="⌘K" arrowPosition="bottom"/>
 *
 * @example
 * <!-- Edge-of-viewport: trigger near the right edge.
 *      Arrow stays at the trigger; body extends to the LEFT. -->
 * <kp-tooltip label="Save changes" arrowPosition="bottom" arrowAlign="end"/>
 *
 * @example
 * <!-- Wired up in a portal above a trigger (pseudocode) -->
 * <button #btn>Search</button>
 * <kp-tooltip *ngIf="open" [style.top]="y + 'px'" [style.left]="x + 'px'"
 *             label="Search" shortcut="⌘K" arrowPosition="bottom"/>
 */
@Component({
  selector: 'kp-tooltip',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses',
    '[attr.role]': '"tooltip"',
  },
  template: `
    @if (arrowPosition !== 'none') {
      <svg class="kp-tooltip__arrow" [attr.width]="arrowW" [attr.height]="arrowH"
           [attr.viewBox]="arrowViewBox" aria-hidden="true">
        <path [attr.d]="arrowPath"/>
      </svg>
    }

    <span class="kp-tooltip__label">{{ label }}</span>

    @if (shortcut) {
      <kbd class="kp-tooltip__shortcut">{{ shortcut }}</kbd>
    }
  `,
  styles: [`
    :host {
      position: relative;
      display: inline-flex;
      align-items: center;
      box-sizing: border-box;
      padding: var(--kp-tooltip-pad-y) var(--kp-tooltip-pad-x);
      gap: var(--kp-tooltip-gap);
      border: 1px solid var(--kp-color-tooltip-border);
      border-radius: var(--kp-tooltip-radius);
      background: var(--kp-color-tooltip-bg);
      color: var(--kp-color-tooltip-fg);
      max-width: 240px;
      box-shadow: var(--kp-elevation-overlay);
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
      font-weight: 500;
      font-size: var(--kp-tooltip-font-size);
      line-height: var(--kp-tooltip-line-height);
      word-break: break-word;
    }

    .kp-tooltip__label { display: inline; }

    .kp-tooltip__shortcut {
      display: inline-flex;
      align-items: center;
      color: var(--kp-color-tooltip-shortcut);
      font-family: inherit;
      font-size: var(--kp-tooltip-shortcut-size);
      font-weight: 500;
      font-variant-numeric: tabular-nums;
    }

    /* Arrow */
    .kp-tooltip__arrow {
      position: absolute;
      display: block;
      color: var(--kp-color-tooltip-bg);
    }
    .kp-tooltip__arrow path { fill: currentColor; }

    /* Arrow placement. The cross-axis offset is driven by --kp-tooltip-arrow-offset:
       align=center → 50%, align=start → kp-tooltip-arrow-inset (e.g. 12px),
       align=end    → calc(100% - arrow-inset).
       Inset is computed against the corresponding tooltip edge so the
       arrow sits just inside the rounded corner. */
    :host(.kp-tooltip--arrow-top) .kp-tooltip__arrow {
      left: var(--kp-tooltip-arrow-offset, 50%); top: 0;
      transform: translate(-50%, -100%);
    }
    :host(.kp-tooltip--arrow-bottom) .kp-tooltip__arrow {
      left: var(--kp-tooltip-arrow-offset, 50%); bottom: 0;
      transform: translate(-50%, 100%);
    }
    :host(.kp-tooltip--arrow-left) .kp-tooltip__arrow {
      top: var(--kp-tooltip-arrow-offset, 50%); left: 0;
      transform: translate(-100%, -50%);
    }
    :host(.kp-tooltip--arrow-right) .kp-tooltip__arrow {
      top: var(--kp-tooltip-arrow-offset, 50%); right: 0;
      transform: translate(100%, -50%);
    }
    /* Align modifiers — set the offset based on the tooltip's own edge.
       arrow-inset is the distance from corner to arrow centre — picked to
       sit just inside the rounded corner without colliding with padding. */
    :host(.kp-tooltip--align-center) { --kp-tooltip-arrow-offset: 50%; }
    :host(.kp-tooltip--align-start)  { --kp-tooltip-arrow-offset: var(--kp-tooltip-arrow-inset); }
    :host(.kp-tooltip--align-end)    { --kp-tooltip-arrow-offset: calc(100% - var(--kp-tooltip-arrow-inset)); }

    /* Sizes */
    :host(.kp-tooltip--sm) {
      --kp-tooltip-pad-x: 10px;
      --kp-tooltip-pad-y: 6px;
      --kp-tooltip-gap: 8px;
      --kp-tooltip-radius: 6px;
      --kp-tooltip-font-size: 12px;
      --kp-tooltip-line-height: 16px;
      --kp-tooltip-shortcut-size: 11px;
      --kp-tooltip-arrow-inset: 10px;
    }
    :host(.kp-tooltip--md) {
      --kp-tooltip-pad-x: 12px;
      --kp-tooltip-pad-y: 8px;
      --kp-tooltip-gap: 10px;
      --kp-tooltip-radius: 8px;
      --kp-tooltip-font-size: 14px;
      --kp-tooltip-line-height: 18px;
      --kp-tooltip-shortcut-size: 12px;
      --kp-tooltip-arrow-inset: 12px;
    }
  `],
})
export class KpTooltipComponent {
  @Input() size: KpTooltipSize = 'md';
  @Input() arrowPosition: KpTooltipArrowPosition = 'none';
  /** Where along the tooltip edge the arrow attaches. See `KpTooltipArrowAlign`. */
  @Input() arrowAlign: KpTooltipArrowAlign = 'center';
  @Input() label = '';
  @Input() shortcut: string | null = null;

  private get arrowBase(): number { return this.size === 'md' ? 10 : 8; }
  private get arrowHeight(): number { return this.size === 'md' ? 7 : 6; }

  get arrowW(): number {
    return this.arrowPosition === 'left' || this.arrowPosition === 'right' ? this.arrowHeight : this.arrowBase;
  }
  get arrowH(): number {
    return this.arrowPosition === 'left' || this.arrowPosition === 'right' ? this.arrowBase : this.arrowHeight;
  }
  get arrowViewBox(): string {
    return `0 0 ${this.arrowW} ${this.arrowH}`;
  }
  get arrowPath(): string {
    const b = this.arrowBase, h = this.arrowHeight;
    switch (this.arrowPosition) {
      case 'top':    return `M 0 ${h} L ${b / 2} 0 L ${b} ${h} Z`;
      case 'bottom': return `M 0 0 L ${b} 0 L ${b / 2} ${h} Z`;
      case 'left':   return `M ${h} 0 L 0 ${b / 2} L ${h} ${b} Z`;
      case 'right':  return `M 0 0 L ${h} ${b / 2} L 0 ${b} Z`;
      default:       return '';
    }
  }

  get hostClasses(): string {
    return [
      'kp-tooltip',
      `kp-tooltip--${this.size}`,
      `kp-tooltip--arrow-${this.arrowPosition}`,
      `kp-tooltip--align-${this.arrowAlign}`,
    ].join(' ');
  }
}
