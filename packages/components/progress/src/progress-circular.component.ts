import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';

export type KpProgressCircularSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type KpProgressColor = 'primary' | 'success' | 'danger' | 'warning' | 'neutral';

const SIZE_CFG: Record<KpProgressCircularSize, { d: number; s: number; valueFontPx: number | null }> = {
  xs: { d: 16, s: 2,   valueFontPx: null },
  sm: { d: 24, s: 2.5, valueFontPx: null },
  md: { d: 32, s: 3,   valueFontPx: 12 },
  lg: { d: 48, s: 4,   valueFontPx: 14 },
  xl: { d: 64, s: 5,   valueFontPx: 20 },
};

/**
 * Kanso Protocol — ProgressCircular
 *
 * Circular determinate or indeterminate progress, drawn as two SVG
 * circles — a full track ring and a stroked arc that sweeps clockwise
 * from 12 o'clock.
 *
 * @example
 * <kp-progress-circular [value]="65" color="primary" [showValue]="true"/>
 * <kp-progress-circular [indeterminate]="true" size="md"/>
 */
@Component({
  selector: 'kp-progress-circular',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses',
    '[attr.role]': '"progressbar"',
    '[attr.aria-valuemin]': 'indeterminate ? null : 0',
    '[attr.aria-valuemax]': 'indeterminate ? null : 100',
    '[attr.aria-valuenow]': 'indeterminate ? null : clampedValue',
  },
  template: `
    <svg
      [attr.width]="cfg.d" [attr.height]="cfg.d"
      [attr.viewBox]="'0 0 ' + cfg.d + ' ' + cfg.d"
      [class.kp-progress-circular__svg--indeterminate]="indeterminate"
      aria-hidden="true">
      <circle
        class="kp-progress-circular__track"
        [attr.cx]="cfg.d / 2" [attr.cy]="cfg.d / 2" [attr.r]="radius"
        [attr.stroke-width]="cfg.s"
        fill="none"/>
      <circle
        class="kp-progress-circular__arc"
        [attr.cx]="cfg.d / 2" [attr.cy]="cfg.d / 2" [attr.r]="radius"
        [attr.stroke-width]="cfg.s"
        [attr.stroke-dasharray]="dashArray"
        [attr.stroke-dashoffset]="dashOffset"
        stroke-linecap="round"
        fill="none"/>
    </svg>

    @if (showValue && cfg.valueFontPx && !indeterminate) {
      <span class="kp-progress-circular__value" [style.font-size.px]="cfg.valueFontPx">
        {{ clampedValue }}%
      </span>
    }
  `,
  styles: [`
    :host {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
    }

    svg {
      display: block;
      /* Rotate so 0 dashoffset starts at 12 o'clock going clockwise */
      transform: rotate(-90deg);
    }

    .kp-progress-circular__track {
      stroke: var(--kp-color-progress-track, #F4F4F5);
    }
    .kp-progress-circular__arc {
      stroke: var(--kp-progress-fill);
      transition: stroke-dashoffset 240ms cubic-bezier(0.32, 0.72, 0, 1);
    }

    .kp-progress-circular__svg--indeterminate {
      animation: kp-progress-circular-spin 1s linear infinite;
    }
    @keyframes kp-progress-circular-spin {
      to { transform: rotate(270deg); }
    }

    .kp-progress-circular__value {
      position: absolute;
      inset: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--kp-color-progress-value, #18181B);
      font-weight: 600;
      font-variant-numeric: tabular-nums;
      line-height: 1;
    }

    /* Color roles */
    :host(.kp-progress-circular--primary) { --kp-progress-fill: var(--kp-color-progress-primary-fill, #2563EB); }
    :host(.kp-progress-circular--success) { --kp-progress-fill: var(--kp-color-progress-success-fill, #16A34A); }
    :host(.kp-progress-circular--danger)  { --kp-progress-fill: var(--kp-color-progress-danger-fill,  #DC2626); }
    :host(.kp-progress-circular--warning) { --kp-progress-fill: var(--kp-color-progress-warning-fill, #F59E0B); }
    :host(.kp-progress-circular--neutral) { --kp-progress-fill: var(--kp-color-progress-neutral-fill, #3F3F46); }
  `],
})
export class KpProgressCircularComponent {
  @Input() size: KpProgressCircularSize = 'md';
  @Input() color: KpProgressColor = 'primary';
  @Input() value = 0;
  @Input() indeterminate = false;
  @Input() showValue = false;

  get cfg() { return SIZE_CFG[this.size]; }

  get radius(): number { return (this.cfg.d - this.cfg.s) / 2; }

  get circumference(): number { return 2 * Math.PI * this.radius; }

  get clampedValue(): number {
    const n = Number(this.value);
    if (Number.isNaN(n)) return 0;
    return Math.max(0, Math.min(100, n));
  }

  get dashArray(): string {
    const c = this.circumference;
    if (this.indeterminate) {
      // A 25% arc chunk that spins thanks to the CSS animation
      return `${c * 0.25} ${c * 0.75}`;
    }
    return `${c} ${c}`;
  }

  get dashOffset(): number {
    if (this.indeterminate) return 0;
    return this.circumference * (1 - this.clampedValue / 100);
  }

  get hostClasses(): string {
    return [
      'kp-progress-circular',
      `kp-progress-circular--${this.size}`,
      `kp-progress-circular--${this.color}`,
    ].join(' ');
  }
}
