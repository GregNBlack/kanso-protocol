import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type KpSkeletonShape = 'line' | 'circle' | 'rectangle' | 'avatar' | 'button' | 'card';
export type KpSkeletonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Kanso Protocol — Skeleton
 *
 * Static placeholder shown while real content is loading. Six shape
 * presets cover the common patterns (line, circle, rectangle, avatar,
 * button, card) with a size ramp. `animated` toggles the shimmer
 * gradient — on by default.
 *
 * Composition: project children for complex placeholders. For simple
 * skeletons, just drop `<kp-skeleton shape="line" size="md"/>` and
 * optionally override `[width]` to fit the real content width.
 */
@Component({
  selector: 'kp-skeleton',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses',
    '[attr.aria-hidden]': '"true"',
    '[style.width]': 'width',
    '[style.height]': 'height',
  },
  template: `
    @if (shape === 'avatar') {
      <span class="kp-sk__avatar-circle"></span>
      <span class="kp-sk__avatar-text">
        <span class="kp-sk__line-80"></span>
        <span class="kp-sk__line-120"></span>
      </span>
    } @else if (shape === 'card') {
      <span class="kp-sk__card-img"></span>
      <span class="kp-sk__card-title"></span>
      <span class="kp-sk__card-line"></span>
      <span class="kp-sk__card-line kp-sk__card-line-2"></span>
    }
  `,
  styles: [`
    @keyframes kp-sk-shimmer {
      0%   { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }

    /* Reduce-motion: stop the shimmer entirely. A static gray placeholder
       still conveys "loading" without moving elements on the page. */
    @media (prefers-reduced-motion: reduce) {
      :host(.kp-sk--animated),
      :host(.kp-sk--avatar.kp-sk--animated),
      :host(.kp-sk--card.kp-sk--animated) { animation: none !important; }
    }

    :host {
      display: inline-block;
      background: var(--kp-color-skeleton-bg-base, var(--kp-color-gray-100));
      border-radius: 4px;
      vertical-align: middle;
    }
    :host(.kp-sk--animated) {
      background-image: linear-gradient(
        90deg,
        var(--kp-color-skeleton-bg-base, var(--kp-color-gray-100)) 0%,
        var(--kp-color-skeleton-bg-highlight, var(--kp-color-gray-200)) 50%,
        var(--kp-color-skeleton-bg-base, var(--kp-color-gray-100)) 100%
      );
      background-size: 200% 100%;
            animation: kp-sk-shimmer var(--kp-motion-duration-shimmer) ease-in-out infinite;
    }

    /* Shapes */
    :host(.kp-sk--line) { border-radius: 4px; }
    :host(.kp-sk--circle) { border-radius: 50%; }
    :host(.kp-sk--rectangle) { border-radius: 8px; }
    :host(.kp-sk--button) { border-radius: var(--kp-sk-btn-radius, 12px); }

    /* Size ramp — used by line + circle + rectangle + button */
    :host(.kp-sk--line.kp-sk--xs) { height: 8px;  }
    :host(.kp-sk--line.kp-sk--sm) { height: 12px; }
    :host(.kp-sk--line.kp-sk--md) { height: 16px; }
    :host(.kp-sk--line.kp-sk--lg) { height: 20px; }
    :host(.kp-sk--line.kp-sk--xl) { height: 24px; }

    :host(.kp-sk--circle.kp-sk--xs) { width: 24px; height: 24px; }
    :host(.kp-sk--circle.kp-sk--sm) { width: 32px; height: 32px; }
    :host(.kp-sk--circle.kp-sk--md) { width: 40px; height: 40px; }
    :host(.kp-sk--circle.kp-sk--lg) { width: 56px; height: 56px; }
    :host(.kp-sk--circle.kp-sk--xl) { width: 72px; height: 72px; }

    :host(.kp-sk--rectangle.kp-sk--xs) { width: 120px; height: 80px; }
    :host(.kp-sk--rectangle.kp-sk--sm) { width: 200px; height: 120px; }
    :host(.kp-sk--rectangle.kp-sk--md) { width: 320px; height: 200px; }
    :host(.kp-sk--rectangle.kp-sk--lg) { width: 480px; height: 300px; }
    :host(.kp-sk--rectangle.kp-sk--xl) { width: 640px; height: 400px; }

    :host(.kp-sk--button.kp-sk--xs) { width: 80px;  height: 24px; --kp-sk-btn-radius: 8px;  }
    :host(.kp-sk--button.kp-sk--sm) { width: 96px;  height: 28px; --kp-sk-btn-radius: 10px; }
    :host(.kp-sk--button.kp-sk--md) { width: 112px; height: 36px; --kp-sk-btn-radius: 12px; }
    :host(.kp-sk--button.kp-sk--lg) { width: 120px; height: 44px; --kp-sk-btn-radius: 14px; }
    :host(.kp-sk--button.kp-sk--xl) { width: 128px; height: 52px; --kp-sk-btn-radius: 16px; }

    /* Avatar composite */
    :host(.kp-sk--avatar) {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      background: transparent;
      animation: none;
    }
    .kp-sk__avatar-circle {
      display: block;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--kp-color-skeleton-bg-base, var(--kp-color-gray-100));
    }
    .kp-sk__avatar-text { display: inline-flex; flex-direction: column; gap: 6px; }
    .kp-sk__line-80, .kp-sk__line-120 {
      display: block;
      height: 12px;
      border-radius: 4px;
      background: var(--kp-color-skeleton-bg-base, var(--kp-color-gray-100));
    }
    .kp-sk__line-80  { width: 80px;  }
    .kp-sk__line-120 { width: 120px; height: 14px; }

    :host(.kp-sk--avatar.kp-sk--animated) .kp-sk__avatar-circle,
    :host(.kp-sk--avatar.kp-sk--animated) .kp-sk__line-80,
    :host(.kp-sk--avatar.kp-sk--animated) .kp-sk__line-120 {
      background-image: linear-gradient(
        90deg,
        var(--kp-color-skeleton-bg-base, var(--kp-color-gray-100)) 0%,
        var(--kp-color-skeleton-bg-highlight, var(--kp-color-gray-200)) 50%,
        var(--kp-color-skeleton-bg-base, var(--kp-color-gray-100)) 100%
      );
      background-size: 200% 100%;
            animation: kp-sk-shimmer var(--kp-motion-duration-shimmer) ease-in-out infinite;
    }

    /* Card composite */
    :host(.kp-sk--card) {
      display: inline-flex;
      flex-direction: column;
      gap: 12px;
      width: 320px;
      background: transparent;
      animation: none;
    }
    .kp-sk__card-img {
      display: block; width: 100%; height: 180px; border-radius: 8px;
      background: var(--kp-color-skeleton-bg-base, var(--kp-color-gray-100));
    }
    .kp-sk__card-title {
      display: block; width: 70%; height: 16px; border-radius: 4px;
      background: var(--kp-color-skeleton-bg-base, var(--kp-color-gray-100));
    }
    .kp-sk__card-line {
      display: block; width: 100%; height: 12px; border-radius: 4px;
      background: var(--kp-color-skeleton-bg-base, var(--kp-color-gray-100));
    }
    .kp-sk__card-line-2 { width: 85%; }

    :host(.kp-sk--card.kp-sk--animated) .kp-sk__card-img,
    :host(.kp-sk--card.kp-sk--animated) .kp-sk__card-title,
    :host(.kp-sk--card.kp-sk--animated) .kp-sk__card-line {
      background-image: linear-gradient(
        90deg,
        var(--kp-color-skeleton-bg-base, var(--kp-color-gray-100)) 0%,
        var(--kp-color-skeleton-bg-highlight, var(--kp-color-gray-200)) 50%,
        var(--kp-color-skeleton-bg-base, var(--kp-color-gray-100)) 100%
      );
      background-size: 200% 100%;
            animation: kp-sk-shimmer var(--kp-motion-duration-shimmer) ease-in-out infinite;
    }
  `],
})
export class KpSkeletonComponent {
  @Input() shape: KpSkeletonShape = 'line';
  @Input() size: KpSkeletonSize = 'md';
  @Input() animated = true;
  /** Override width — useful for line skeletons (e.g. '80%' or '240px'). */
  @Input() width: string | null = null;
  /** Override height when defaults don't fit. */
  @Input() height: string | null = null;

  get hostClasses(): string {
    const c = ['kp-sk', `kp-sk--${this.shape}`, `kp-sk--${this.size}`];
    if (this.animated) c.push('kp-sk--animated');
    return c.join(' ');
  }
}
