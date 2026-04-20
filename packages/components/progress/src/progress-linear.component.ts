import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';

export type KpProgressLinearSize = 'xs' | 'sm' | 'md' | 'lg';
export type KpProgressLabelPosition = 'top' | 'right';
export type KpProgressColor = 'primary' | 'success' | 'danger' | 'warning' | 'neutral';

/**
 * Kanso Protocol — ProgressLinear
 *
 * Horizontal determinate or indeterminate progress bar, with an optional
 * label/value pair either stacked above or sitting inline to the right.
 *
 * @example
 * <kp-progress-linear [value]="45" color="success" [showLabel]="true" label="Uploading"/>
 * <kp-progress-linear [indeterminate]="true" color="primary"/>
 */
@Component({
  selector: 'kp-progress-linear',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses',
    '[attr.role]': '"progressbar"',
    '[attr.aria-valuemin]': 'indeterminate ? null : 0',
    '[attr.aria-valuemax]': 'indeterminate ? null : 100',
    '[attr.aria-valuenow]': 'indeterminate ? null : clampedValue',
    '[attr.aria-label]': 'label || null',
  },
  template: `
    @if (showLabel && labelPosition === 'top') {
      <div class="kp-progress-linear__header">
        <span class="kp-progress-linear__label">{{ label }}</span>
        @if (!indeterminate) {
          <span class="kp-progress-linear__value">{{ clampedValue }}%</span>
        }
      </div>
    }

    <div class="kp-progress-linear__track">
      @if (indeterminate) {
        <span class="kp-progress-linear__bar kp-progress-linear__bar--indeterminate" aria-hidden="true"></span>
      } @else {
        <span class="kp-progress-linear__bar" [style.width.%]="clampedValue" aria-hidden="true"></span>
      }
    </div>

    @if (showLabel && labelPosition === 'right' && !indeterminate) {
      <span class="kp-progress-linear__value">{{ clampedValue }}%</span>
    }
  `,
  styles: [`
    :host {
      display: inline-flex;
      box-sizing: border-box;
      width: 240px;
      gap: 8px;
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
    }
    :host(.kp-progress-linear--label-top)   { flex-direction: column; }
    :host(.kp-progress-linear--label-right) { flex-direction: row; align-items: center; gap: 12px; }

    .kp-progress-linear__header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 8px;
    }

    .kp-progress-linear__label {
      color: var(--kp-color-progress-label, #3F3F46);
      font-weight: 400;
      font-size: 14px;
      line-height: 20px;
    }
    .kp-progress-linear__value {
      color: var(--kp-color-progress-value, #18181B);
      font-weight: 500;
      font-size: 14px;
      line-height: 20px;
      font-variant-numeric: tabular-nums;
      flex: 0 0 auto;
    }

    .kp-progress-linear__track {
      position: relative;
      flex: 1 1 auto;
      height: var(--kp-progress-h);
      background: var(--kp-color-progress-track, #F4F4F5);
      border-radius: calc(var(--kp-progress-h) / 2);
      overflow: hidden;
    }

    .kp-progress-linear__bar {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      background: var(--kp-progress-fill);
      border-radius: calc(var(--kp-progress-h) / 2);
      transition: width 240ms cubic-bezier(0.32, 0.72, 0, 1);
    }

    .kp-progress-linear__bar--indeterminate {
      width: 30%;
      animation: kp-progress-linear-indet 1.4s cubic-bezier(0.65, 0, 0.35, 1) infinite;
    }

    @keyframes kp-progress-linear-indet {
      0%   { left: -30%; }
      100% { left: 100%; }
    }

    /* Sizes */
    :host(.kp-progress-linear--xs) { --kp-progress-h: 2px; }
    :host(.kp-progress-linear--sm) { --kp-progress-h: 4px; }
    :host(.kp-progress-linear--md) { --kp-progress-h: 6px; }
    :host(.kp-progress-linear--lg) { --kp-progress-h: 8px; }

    /* Color roles */
    :host(.kp-progress-linear--primary) { --kp-progress-fill: var(--kp-color-progress-primary-fill, #2563EB); }
    :host(.kp-progress-linear--success) { --kp-progress-fill: var(--kp-color-progress-success-fill, #16A34A); }
    :host(.kp-progress-linear--danger)  { --kp-progress-fill: var(--kp-color-progress-danger-fill,  #DC2626); }
    :host(.kp-progress-linear--warning) { --kp-progress-fill: var(--kp-color-progress-warning-fill, #F59E0B); }
    :host(.kp-progress-linear--neutral) { --kp-progress-fill: var(--kp-color-progress-neutral-fill, #3F3F46); }
  `],
})
export class KpProgressLinearComponent {
  @Input() size: KpProgressLinearSize = 'md';
  @Input() color: KpProgressColor = 'primary';
  @Input() value = 0;
  @Input() indeterminate = false;
  @Input() showLabel = false;
  @Input() labelPosition: KpProgressLabelPosition = 'top';
  @Input() label = '';

  get clampedValue(): number {
    const n = Number(this.value);
    if (Number.isNaN(n)) return 0;
    return Math.max(0, Math.min(100, n));
  }

  get hostClasses(): string {
    return [
      'kp-progress-linear',
      `kp-progress-linear--${this.size}`,
      `kp-progress-linear--${this.color}`,
      `kp-progress-linear--label-${this.labelPosition}`,
    ].join(' ');
  }
}
