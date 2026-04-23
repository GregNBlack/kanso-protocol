import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';

export type KpStatCardSize = 'sm' | 'md' | 'lg';
export type KpStatTrendDirection = 'up' | 'down' | 'neutral';
/**
 * `positive` — up = good (green), down = bad (red).
 * `negative` — up = bad (red), down = good (green) — for inverse metrics like error rate.
 */
export type KpStatTrendAppearance = 'positive' | 'negative';

/**
 * Kanso Protocol — StatCard
 *
 * Single-metric tile with label, big value, optional icon, optional
 * trend (direction + delta + description), optional sparkline placeholder.
 * Designed to live in a dashboard grid.
 *
 * Slot: `[kpStatCardSparkline]` — drop in your real chart (e.g. recharts);
 * the placeholder shows a styled rectangle when empty.
 *
 * @example
 * <kp-stat-card label="Total revenue" value="$12,482" trendValue="+12.5%" trendDescription="from last month"/>
 */
@Component({
  selector: 'kp-stat-card',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClasses' },
  template: `
    <div class="kp-stat__header">
      <span class="kp-stat__label">{{ label }}</span>
      @if (showIcon && icon) {
        <span class="kp-stat__icon" aria-hidden="true">
          <i [class]="'ti ti-' + icon"></i>
        </span>
      }
    </div>

    <span class="kp-stat__value">{{ value }}</span>

    @if (showTrend) {
      <div class="kp-stat__trend" [attr.data-tone]="trendTone">
        <i class="ti kp-stat__trend-icon" [class]="'ti ' + trendIconClass" aria-hidden="true"></i>
        <span class="kp-stat__trend-value">{{ trendValue }}</span>
        @if (trendDescription) {
          <span class="kp-stat__trend-desc">{{ trendDescription }}</span>
        }
      </div>
    }

    @if (showSparkline) {
      <div class="kp-stat__sparkline">
        <ng-content select="[kpStatCardSparkline]">
          <div class="kp-stat__sparkline-placeholder" aria-hidden="true"></div>
        </ng-content>
      </div>
    }
  `,
  styles: [`
    :host {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: var(--kp-stat-gap, 12px);
      padding: var(--kp-stat-pad, 20px);
      background: var(--kp-color-white, #FFFFFF);
      border: 1px solid var(--kp-color-gray-200, #E4E4E7);
      border-radius: 12px;
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
    }

    :host(.kp-stat--sm) { --kp-stat-pad: 16px; --kp-stat-gap: 8px; --kp-stat-value-size: 18px; --kp-stat-label-size: 12px; }
    :host(.kp-stat--md) { --kp-stat-pad: 20px; --kp-stat-gap: 12px; --kp-stat-value-size: 24px; --kp-stat-label-size: 13px; }
    :host(.kp-stat--lg) { --kp-stat-pad: 24px; --kp-stat-gap: 16px; --kp-stat-value-size: 32px; --kp-stat-label-size: 14px; }

    .kp-stat__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .kp-stat__label {
      font-size: var(--kp-stat-label-size, 13px);
      color: var(--kp-color-gray-600, #52525B);
      font-weight: 500;
    }
    .kp-stat__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--kp-color-blue-50, #EFF6FF);
      color: var(--kp-color-blue-600, #2563EB);
    }
    .kp-stat__icon .ti { font-size: 18px; line-height: 1; }

    .kp-stat__value {
      font-size: var(--kp-stat-value-size, 24px);
      font-weight: 600;
      color: var(--kp-color-gray-900, #18181B);
      font-variant-numeric: tabular-nums;
      line-height: 1.1;
    }

    .kp-stat__trend {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .kp-stat__trend-icon { font-size: 14px; line-height: 1; }
    .kp-stat__trend-value { font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums; }
    .kp-stat__trend-desc { font-size: 12px; color: var(--kp-color-gray-500, #71717A); }
    .kp-stat__trend[data-tone='good']    { color: var(--kp-color-green-600, #16A34A); }
    .kp-stat__trend[data-tone='bad']     { color: var(--kp-color-red-600, #DC2626); }
    .kp-stat__trend[data-tone='neutral'] { color: var(--kp-color-gray-500, #71717A); }

    .kp-stat__sparkline { margin-top: 4px; }
    .kp-stat__sparkline-placeholder {
      height: 32px;
      background: var(--kp-color-gray-100, #F4F4F5);
      border-radius: 4px;
    }
  `],
})
export class KpStatCardComponent {
  @Input() size: KpStatCardSize = 'md';
  @Input() label = 'Total revenue';
  @Input() value: string | number = '$12,482';

  @Input() showIcon = false;
  @Input() icon: string | null = 'trending-up';

  @Input() showTrend = true;
  @Input() trendDirection: KpStatTrendDirection = 'up';
  @Input() trendAppearance: KpStatTrendAppearance = 'positive';
  @Input() trendValue: string | null = '+12.5%';
  @Input() trendDescription: string | null = 'from last month';

  @Input() showSparkline = false;

  get trendIconClass(): string {
    if (this.trendDirection === 'up') return 'ti-trending-up';
    if (this.trendDirection === 'down') return 'ti-trending-down';
    return 'ti-minus';
  }

  get trendTone(): 'good' | 'bad' | 'neutral' {
    if (this.trendDirection === 'neutral') return 'neutral';
    const goodWhenUp = this.trendAppearance === 'positive';
    const isUp = this.trendDirection === 'up';
    return (isUp === goodWhenUp) ? 'good' : 'bad';
  }

  get hostClasses(): string {
    return `kp-stat kp-stat--${this.size}`;
  }
}
