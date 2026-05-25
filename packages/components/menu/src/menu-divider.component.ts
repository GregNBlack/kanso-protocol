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
      box-sizing: border-box;
      display: flex;
      align-items: center;
      width: 100%;
      padding: 4px 0;
    }
    .kp-menu-divider__line {
      display: block;
      flex: 1;
      height: 1px;
      background: var(--kp-color-surface-muted);
    }
  `]
})
export class KpMenuDividerComponent {}
