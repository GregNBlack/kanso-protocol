import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';
import { KpIconComponent } from '@kanso-protocol/ui/icon';

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
 * trend (direction + delta + description), and an optional inline
 * sparkline. Designed to live in a dashboard grid.
 *
 * Sparkline: pass a numeric series to `sparklineData` for a built-in,
 * dependency-free SVG trend line. Its stroke color follows `sparklineTrend`
 * (or, when unset, the trend row's tone) via the accent/success/danger
 * semantic tokens. The sparkline is decorative (`aria-hidden`) — the
 * numeric `value` remains the accessible metric.
 *
 * Slot: `[kpStatCardSparkline]` — or drop in your own chart (e.g. recharts)
 * instead of the built-in line; the placeholder shows a styled rectangle
 * when the slot is empty and no `sparklineData` is given.
 *
 * @example
 * <kp-stat-card label="Total revenue" value="$12,482" trendValue="+12.5%" trendDescription="from last month"/>
 * @example
 * <kp-stat-card label="Sessions" value="3.4k" [showSparkline]="true" [sparklineData]="[4,7,5,9,8,12]" sparklineTrend="auto"/>
 */
@Component({
  selector: 'kp-stat-card',
  imports: [KpIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClasses' },
  template: `
    <div class="kp-stat__header">
      <span class="kp-stat__label">{{ label }}</span>
      @if (showIcon && icon) {
        <span class="kp-stat__icon" aria-hidden="true">
          <kp-icon [name]="icon" />
        </span>
      }
    </div>

    <span class="kp-stat__value">{{ value }}</span>

    @if (showTrend) {
      <div class="kp-stat__trend" [attr.data-tone]="trendTone">
        <kp-icon class="kp-stat__trend-icon" [name]="trendIconName" />
        <span class="kp-stat__trend-value">{{ trendValue }}</span>
        @if (trendDescription) {
          <span class="kp-stat__trend-desc">{{ trendDescription }}</span>
        }
      </div>
    }

    @if (showSparkline) {
      <div class="kp-stat__sparkline">
        <ng-content select="[kpStatCardSparkline]">
          @if (sparklinePath) {
            <svg class="kp-stat__sparkline-svg" [attr.data-tone]="sparklineTone"
                 [attr.viewBox]="'0 0 100 ' + SPARK_H" preserveAspectRatio="none" aria-hidden="true">
              <polyline [attr.points]="sparklinePath" fill="none" stroke="currentColor"
                        stroke-width="1.5" vector-effect="non-scaling-stroke"
                        stroke-linejoin="round" stroke-linecap="round"/>
            </svg>
          } @else {
            <div class="kp-stat__sparkline-placeholder" aria-hidden="true"></div>
          }
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
      background: var(--kp-color-surface-base);
      border: 1px solid var(--kp-color-border-strong);
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
      color: var(--kp-color-text-muted);
      font-weight: 500;
    }
    .kp-stat__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--kp-color-primary-subtle-bg-rest);
      color: var(--kp-color-accent-primary-fg);
    }
    .kp-stat__icon .ti { font-size: 18px; line-height: 1; }

    .kp-stat__value {
      font-size: var(--kp-stat-value-size, 24px);
      font-weight: 600;
      color: var(--kp-color-text-strong);
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
    .kp-stat__trend-desc { font-size: 12px; color: var(--kp-color-text-muted); }
    .kp-stat__trend[data-tone='good']    { color: var(--kp-color-accent-success-fg); }
    .kp-stat__trend[data-tone='bad']     { color: var(--kp-color-accent-danger-fg); }
    .kp-stat__trend[data-tone='neutral'] { color: var(--kp-color-text-muted); }

    .kp-stat__sparkline { margin-top: 4px; }
    .kp-stat__sparkline-placeholder {
      height: 32px;
      background: var(--kp-color-surface-muted);
      border-radius: 4px;
    }
    .kp-stat__sparkline-svg { display: block; width: 100%; height: 32px; color: var(--kp-color-accent-primary-fg); }
    .kp-stat__sparkline-svg[data-tone='good']    { color: var(--kp-color-accent-success-fg); }
    .kp-stat__sparkline-svg[data-tone='bad']     { color: var(--kp-color-accent-danger-fg); }
    .kp-stat__sparkline-svg[data-tone='neutral'] { color: var(--kp-color-accent-primary-fg); }
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
  /** Built-in sparkline: pass a numeric series (≥2 points) to draw an inline
   *  trend line. Ignored if you project your own `[kpStatCardSparkline]`. */
  @Input() sparklineData: number[] | null = null;

  /**
   * Colors the sparkline stroke, decoupled from the trend row:
   * - `null` (default) — inherit the trend row's tone, so existing cards are
   *   visually unchanged.
   * - `'up' | 'down' | 'neutral'` — set the tone explicitly (up = success,
   *   down = danger, neutral = accent). Handy when the trend row is hidden.
   * - `'auto'` — derive the direction from the series itself (last vs first).
   */
  @Input() sparklineTrend: KpStatTrendDirection | 'auto' | null = null;

  /** Sparkline SVG viewBox height (width is a fixed 100, stretched to fit). */
  readonly SPARK_H = 32;

  /** Polyline points normalized to the 100×SPARK_H viewBox, or null if no data. */
  get sparklinePath(): string | null {
    const d = this.sparklineData;
    if (!d || d.length < 2) return null;
    const min = Math.min(...d);
    const max = Math.max(...d);
    const range = max - min || 1;
    const pad = 3; // keep the stroke off the top/bottom edges
    const h = this.SPARK_H - pad * 2;
    const stepX = 100 / (d.length - 1);
    return d
      .map((v, i) => `${(i * stepX).toFixed(2)},${(pad + (1 - (v - min) / range) * h).toFixed(2)}`)
      .join(' ');
  }

  /** Direction inferred from the sparkline series (last vs. first point). */
  get derivedSparklineDirection(): KpStatTrendDirection {
    const d = this.sparklineData;
    if (!d || d.length < 2) return 'neutral';
    const first = d[0];
    const last = d[d.length - 1];
    if (last > first) return 'up';
    if (last < first) return 'down';
    return 'neutral';
  }

  /** Tone that colors the sparkline stroke. Falls back to the trend row's
   *  tone when `sparklineTrend` is unset, keeping existing cards unchanged. */
  get sparklineTone(): 'good' | 'bad' | 'neutral' {
    const t = this.sparklineTrend;
    if (t == null) return this.trendTone;
    const dir = t === 'auto' ? this.derivedSparklineDirection : t;
    if (dir === 'up') return 'good';
    if (dir === 'down') return 'bad';
    return 'neutral';
  }

  get trendIconName(): string {
    if (this.trendDirection === 'up') return 'trending-up';
    if (this.trendDirection === 'down') return 'trending-down';
    return 'minus';
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
