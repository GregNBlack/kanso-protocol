import { Component, ChangeDetectionStrategy } from '@angular/core';

/**
 * Kanso Protocol — DropdownMenu
 *
 * Floating panel container for menu items. Projects any menu content:
 * MenuItem, MenuDivider, MenuSectionLabel.
 *
 * @example
 * <kp-dropdown-menu>
 *   <kp-menu-section-label label="Actions"/>
 *   <kp-menu-item label="Edit" shortcut="⌘E"/>
 *   <kp-menu-divider/>
 *   <kp-menu-item label="Delete" [danger]="true"/>
 * </kp-dropdown-menu>
 */
@Component({
  selector: 'kp-dropdown-menu',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.role]': '"menu"' },
  template: `<ng-content/>`,
  styles: [`
    :host {
      display: inline-flex;
      flex-direction: column;
      gap: 2px;
      min-width: 220px;
      max-width: 320px;
      max-height: 320px;
      padding: 4px;
      background: #FFFFFF;
      border: 1px solid #E4E4E7;
      border-radius: 12px;
      box-shadow:
        0 4px 6px rgba(0, 0, 0, 0.05),
        0 10px 15px rgba(0, 0, 0, 0.10);
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
      box-sizing: border-box;
      overflow-y: auto;
    }
  `]
})
export class KpDropdownMenuComponent {}
