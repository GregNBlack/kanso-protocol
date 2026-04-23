import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type KpDividerOrientation = 'horizontal' | 'vertical';
export type KpDividerLabelPosition = 'center' | 'start' | 'end';

/**
 * Kanso Protocol — Divider
 *
 * Thin line separator. Horizontal by default; set `orientation="vertical"`
 * for an inline vertical rule. Horizontal dividers can carry an optional
 * label via `[label]` (or projected default content) with configurable
 * position — center / start / end.
 *
 * Vertical dividers are label-less by design (visually awkward).
 */
@Component({
  selector: 'kp-divider',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses',
    '[attr.role]': '"separator"',
    '[attr.aria-orientation]': 'orientation',
  },
  template: `
    @if (orientation === 'horizontal' && (label || hasProjected)) {
      @if (labelPosition !== 'start') { <span class="kp-divider__line"></span> }
      <span class="kp-divider__label">
        @if (label) { {{ label }} } @else { <ng-content/> }
      </span>
      @if (labelPosition !== 'end') { <span class="kp-divider__line"></span> }
    } @else {
      <span class="kp-divider__line"></span>
    }
  `,
  styles: [`
    :host {
      display: flex;
      align-items: center;
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
    }
    :host(.kp-divider--horizontal) { width: 100%; gap: 16px; }
    :host(.kp-divider--vertical) { display: inline-flex; align-self: stretch; }

    .kp-divider__line {
      display: block;
      background: var(--kp-color-divider-line, var(--kp-color-gray-200));
      flex: 1 1 auto;
    }
    :host(.kp-divider--horizontal) .kp-divider__line { height: 1px; }
    :host(.kp-divider--vertical) .kp-divider__line {
      width: 1px;
      height: 100%;
      min-height: 16px;
      align-self: stretch;
    }

    .kp-divider__label {
      flex: 0 0 auto;
      color: var(--kp-color-divider-label, var(--kp-color-gray-500));
      font-size: 12px;
      line-height: 16px;
      font-weight: 500;
      white-space: nowrap;
    }
  `],
})
export class KpDividerComponent {
  @Input() orientation: KpDividerOrientation = 'horizontal';
  @Input() label = '';
  @Input() labelPosition: KpDividerLabelPosition = 'center';

  /** Set this to `true` when projecting custom label content instead of using `[label]`. */
  @Input() hasProjected = false;

  get hostClasses(): string {
    return `kp-divider kp-divider--${this.orientation}`;
  }
}
