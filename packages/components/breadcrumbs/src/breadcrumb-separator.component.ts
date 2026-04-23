import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';

import { KpBreadcrumbItemSize } from './breadcrumb-item.component';

export type KpBreadcrumbSeparatorType = 'chevron' | 'slash' | 'dot';

/**
 * Kanso Protocol — BreadcrumbSeparator (atom)
 *
 * Visual glue between `<kp-breadcrumb-item>`s. Inert — not announced by
 * screen readers. Ships with three variants: a gray chevron, a gray
 * slash, and a small accent-colored dot.
 */
@Component({
  selector: 'kp-breadcrumb-separator',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses',
    '[attr.aria-hidden]': '"true"',
    '[attr.role]': '"presentation"',
  },
  template: `
    @switch (type) {
      @case ('slash') { <span class="kp-bc-sep__glyph">/</span> }
      @case ('dot')   { <span class="kp-bc-sep__dot"></span> }
      @default {
        <svg class="kp-bc-sep__chevron" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M6 3 L11 8 L6 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      }
    }
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 auto;
      width: var(--kp-bc-sep-size);
      height: var(--kp-bc-sep-size);
      color: var(--kp-color-breadcrumbs-separator, var(--kp-color-gray-400));
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
      font-size: var(--kp-bc-sep-font-size);
      line-height: 1;
    }

    .kp-bc-sep__chevron { width: 100%; height: 100%; }
    .kp-bc-sep__glyph   { display: inline-block; }
    .kp-bc-sep__dot {
      display: inline-block;
      width: 3px;
      height: 3px;
      border-radius: 50%;
      background: var(--kp-color-breadcrumbs-separator-dot, var(--kp-color-blue-600));
    }

    :host(.kp-bc-sep--sm) {
      --kp-bc-sep-size: 14px;
      --kp-bc-sep-font-size: 12px;
    }
    :host(.kp-bc-sep--md) {
      --kp-bc-sep-size: 16px;
      --kp-bc-sep-font-size: 14px;
    }
  `],
})
export class KpBreadcrumbSeparatorComponent {
  @Input() size: KpBreadcrumbItemSize = 'md';
  @Input() type: KpBreadcrumbSeparatorType = 'chevron';

  get hostClasses(): string {
    return `kp-bc-sep kp-bc-sep--${this.size} kp-bc-sep--${this.type}`;
  }
}
