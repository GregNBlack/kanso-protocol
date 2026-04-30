import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { KpInputComponent } from '@kanso-protocol/input';
import { KpButtonComponent } from '@kanso-protocol/button';

/**
 * Kanso Protocol — DropdownMenu
 *
 * Floating panel container for menu items. Projects any menu content:
 * MenuItem, MenuDivider, MenuSectionLabel.
 *
 * Optional Search at the top and Footer with 1–2 full-width buttons at the bottom.
 *
 * @example
 * <kp-dropdown-menu
 *   [hasSearch]="true"
 *   [hasFooter]="true"
 *   [showCancel]="true"
 *   primaryLabel="Apply"
 *   cancelLabel="Cancel"
 *   (primary)="apply()"
 *   (cancel)="close()">
 *   <kp-menu-item label="Profile"/>
 * </kp-dropdown-menu>
 */
@Component({
  selector: 'kp-dropdown-menu',
  imports: [KpInputComponent, KpButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The host is a *floating panel* that may contain a search field and footer
  // buttons in addition to menuitems. role="menu" requires only menuitem-* as
  // direct children — so role="menu" lives on the inner body wrapper, not the
  // host. The host stays a generic container (no role).
  template: `
    @if (hasSearch) {
      <div class="kp-dropdown-menu__search">
        <kp-input size="sm" [placeholder]="searchPlaceholder" [value]="searchValue" (input)="onSearchInput($event)"></kp-input>
        <div class="kp-dropdown-menu__divider"></div>
      </div>
    }
    <div class="kp-dropdown-menu__body" role="menu">
      <ng-content/>
    </div>
    @if (hasFooter) {
      <div class="kp-dropdown-menu__footer">
        <div class="kp-dropdown-menu__divider"></div>
        <div class="kp-dropdown-menu__buttons">
          <kp-button size="sm" variant="default" color="primary" style="flex:1" (click)="primary.emit()">{{ primaryLabel }}</kp-button>
          @if (showCancel) {
            <kp-button size="sm" variant="ghost" color="neutral" style="flex:1" (click)="cancel.emit()">{{ cancelLabel }}</kp-button>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    :host {
      display: inline-flex;
      flex-direction: column;
      min-width: 220px;
      max-width: 320px;
      max-height: 480px;
      padding: 4px;
      background: var(--kp-color-white);
      border: 1px solid var(--kp-color-gray-200);
      border-radius: 12px;
      box-shadow: var(--kp-elevation-overlay);
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
      box-sizing: border-box;
    }
    .kp-dropdown-menu__search {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 4px;
    }
    .kp-dropdown-menu__body {
      display: flex;
      flex-direction: column;
      gap: 2px;
      overflow-y: auto;
      flex: 1 1 auto;
    }
    .kp-dropdown-menu__footer {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .kp-dropdown-menu__buttons {
      display: flex;
      gap: 8px;
      padding: 4px;
    }
    .kp-dropdown-menu__divider {
      height: 1px;
      background: var(--kp-color-gray-100);
      margin: 4px 0;
    }
    .kp-dropdown-menu__search kp-input {
      width: 100%;
    }
  `]
})
export class KpDropdownMenuComponent {
  @Input() hasSearch = false;
  @Input() hasFooter = false;
  @Input() showCancel = true;
  @Input() primaryLabel = 'Confirm';
  @Input() cancelLabel = 'Cancel';
  @Input() searchPlaceholder = 'Search...';
  @Input() searchValue = '';
  @Output() searchChange = new EventEmitter<string>();
  @Output() primary = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onSearchInput(event: Event): void {
    const v = (event.target as HTMLInputElement).value;
    this.searchValue = v;
    this.searchChange.emit(v);
  }
}
