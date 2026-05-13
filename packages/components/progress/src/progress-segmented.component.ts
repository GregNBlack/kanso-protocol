import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';

export type KpProgressSegmentedSize = 'xs' | 'sm' | 'md' | 'lg';
type KpProgressColor = 'primary' | 'success' | 'danger' | 'warning' | 'neutral';

/**
 * Kanso Protocol — ProgressSegmented
 *
 * Stepper-style progress: a row of pill-shaped segments, each filled when
 * its step is complete. Use for multi-step flows (Details → Review →
 * Confirm → Done) where the user can see both total and current step at a
 * glance.
 *
 * @example
 * <kp-progress-segmented [total]="4" [current]="2"
 *   [showLabels]="true" [labels]="['Details','Payment','Review','Done']"
 *   [showStepCounter]="true"/>
 */
@Component({
  selector: 'kp-progress-segmented',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses',
    '[attr.role]': '"progressbar"',
    '[attr.aria-valuemin]': '1',
    '[attr.aria-valuemax]': 'total',
    '[attr.aria-valuenow]': 'clampedCurrent',
    '[attr.aria-label]': 'ariaLabel',
  },
  template: `
    @if (showStepCounter) {
      <div class="kp-progress-segmented__counter">{{ counterText }}</div>
    }

    <div class="kp-progress-segmented__row" aria-hidden="true">
      @for (s of segments; track s) {
        <span class="kp-progress-segmented__segment"
              [class.kp-progress-segmented__segment--complete]="s <= clampedCurrent"></span>
      }
    </div>

    @if (showLabels) {
      <div class="kp-progress-segmented__labels">
        @for (s of segments; track s) {
          <span class="kp-progress-segmented__label"
                [class.kp-progress-segmented__label--complete]="s < clampedCurrent"
                [class.kp-progress-segmented__label--current]="s === clampedCurrent">
            {{ labels[s - 1] || 'Step ' + s }}
          </span>
        }
      </div>
    }
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      gap: 8px;
      box-sizing: border-box;
      width: 240px;
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
    }

    .kp-progress-segmented__counter {
      color: var(--kp-color-progress-label);
      font-weight: 400;
      font-size: 14px;
      line-height: 20px;
    }

    .kp-progress-segmented__row {
      display: flex;
      gap: 4px;
    }

    .kp-progress-segmented__segment {
      flex: 1 1 0;
      height: var(--kp-progress-h);
      background: var(--kp-color-progress-track);
      border-radius: calc(var(--kp-progress-h) / 2);
      transition: background var(--kp-motion-duration-normal) ease;
    }
    .kp-progress-segmented__segment--complete {
      background: var(--kp-progress-fill);
    }

    .kp-progress-segmented__labels {
      display: flex;
      gap: 4px;
    }
    .kp-progress-segmented__label {
      flex: 1 1 0;
      text-align: center;
      color: var(--kp-color-progress-label);
      font-weight: 400;
      font-size: 12px;
      line-height: 16px;
    }
    .kp-progress-segmented__label--complete {
      color: var(--kp-color-progress-value);
      font-weight: 500;
    }
    .kp-progress-segmented__label--current {
      color: var(--kp-progress-fg-current, var(--kp-progress-fill));
      font-weight: 600;
    }
    /* Theme-aware accent fg for the current-step label. Progress.fill
       doubles as filled-segment bg (white on brand.700 passes) AND
       label color on page bg — but brand.700 fails AA on dark page bg.
       accent.*.fg has dark overrides so reads in both themes. */
    :host(.kp-progress-segmented--primary) { --kp-progress-fg-current: var(--kp-color-accent-primary-fg); }
    :host(.kp-progress-segmented--success) { --kp-progress-fg-current: var(--kp-color-accent-success-fg); }
    :host(.kp-progress-segmented--danger)  { --kp-progress-fg-current: var(--kp-color-accent-danger-fg); }

    /* Sizes */
    :host(.kp-progress-segmented--xs) { --kp-progress-h: 2px; }
    :host(.kp-progress-segmented--sm) { --kp-progress-h: 4px; }
    :host(.kp-progress-segmented--md) { --kp-progress-h: 6px; }
    :host(.kp-progress-segmented--lg) { --kp-progress-h: 8px; }

    /* Color roles */
    :host(.kp-progress-segmented--primary) { --kp-progress-fill: var(--kp-color-progress-primary-fill); }
    :host(.kp-progress-segmented--success) { --kp-progress-fill: var(--kp-color-progress-success-fill); }
    :host(.kp-progress-segmented--danger)  { --kp-progress-fill: var(--kp-color-progress-danger-fill); }
    :host(.kp-progress-segmented--warning) { --kp-progress-fill: var(--kp-color-progress-warning-fill); }
    :host(.kp-progress-segmented--neutral) { --kp-progress-fill: var(--kp-color-progress-neutral-fill); }
  `],
})
export class KpProgressSegmentedComponent {
  @Input() size: KpProgressSegmentedSize = 'md';
  @Input() color: KpProgressColor = 'primary';
  @Input() total = 5;
  @Input() current = 1;
  @Input() showLabels = false;
  @Input() showStepCounter = false;
  @Input() labels: string[] = [];
  /** Overrides the auto-generated "Step X of Y" text */
  @Input() stepCounterText: string | null = null;
  /** Accessible name for screen readers. */
  @Input() ariaLabel = 'Progress';

  get clampedTotal(): number { return Math.max(2, Math.min(12, this.total)); }
  get clampedCurrent(): number { return Math.max(0, Math.min(this.clampedTotal, this.current)); }

  get segments(): number[] {
    return Array.from({ length: this.clampedTotal }, (_, i) => i + 1);
  }

  get counterText(): string {
    if (this.stepCounterText) return this.stepCounterText;
    return `Step ${this.clampedCurrent} of ${this.clampedTotal}`;
  }

  get hostClasses(): string {
    return [
      'kp-progress-segmented',
      `kp-progress-segmented--${this.size}`,
      `kp-progress-segmented--${this.color}`,
    ].join(' ');
  }
}
