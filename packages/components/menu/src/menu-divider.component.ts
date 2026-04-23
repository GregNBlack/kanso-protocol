import { Component, ChangeDetectionStrategy } from '@angular/core';

/**
 * Kanso Protocol — MenuDivider
 *
 * Thin horizontal separator between groups of menu items.
 */
@Component({
  selector: 'kp-menu-divider',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.role]': '"separator"' },
  template: `<span class="kp-menu-divider__line"></span>`,
  styles: [`
    :host {
      display: flex;
      align-items: center;
      width: 100%;
      padding: 4px 0;
    }
    .kp-menu-divider__line {
      display: block;
      flex: 1;
      height: 1px;
      background: var(--kp-color-gray-100);
    }
  `]
})
export class KpMenuDividerComponent {}
