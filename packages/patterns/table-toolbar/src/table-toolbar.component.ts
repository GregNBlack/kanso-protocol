import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { KpButtonComponent } from '@kanso-protocol/button';
import { KpBadgeComponent } from '@kanso-protocol/badge';
import { KpSearchBarComponent } from '@kanso-protocol/search-bar';

export type KpTableToolbarMode = 'default' | 'bulk-select';
export type KpTableToolbarDensity = 'compact' | 'comfortable' | 'spacious';

/**
 * Kanso Protocol — TableToolbar
 *
 * Panel that sits above a data table. Two modes:
 * - `default` — search + filter/sort + right-side actions (density, columns,
 *   export, create).
 * - `bulk-select` — swaps to a selection summary with bulk actions
 *   (export / tag / move / delete).
 *
 * Composes SearchBar, Button, Badge. Action slots are boolean toggles so
 * you can dial the toolbar from minimal ("search + create") up to a full
 * admin bar without touching templates.
 *
 * @example
 * <kp-table-toolbar
 *   [showFilter]="true"
 *   [activeFilterCount]="2"
 *   (createClick)="openCreate()">
 * </kp-table-toolbar>
 */
@Component({
  selector: 'kp-table-toolbar',
  imports: [KpButtonComponent, KpBadgeComponent, KpSearchBarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClasses' },
  template: `
    @if (mode === 'default') {
      <div class="kp-tt__left">
        @if (showSearch) {
          <kp-search-bar
            variant="inline"
            size="sm"
            [placeholder]="searchPlaceholder"
            [value]="searchValue"
            (valueChange)="searchChange.emit($event)"
          />
        }

        @if (showFilter) {
          <kp-button variant="outline" size="sm" (click)="filterClick.emit()">
            <i kpButtonIconLeft class="ti ti-filter" aria-hidden="true"></i>
            <span>Filters</span>
            @if (activeFilterCount > 0) {
              <kp-badge size="xs" color="primary" appearance="subtle">{{ activeFilterCount }}</kp-badge>
            }
          </kp-button>
        }

        @if (showSort) {
          <kp-button variant="outline" size="sm" (click)="sortClick.emit()">
            <i kpButtonIconLeft class="ti ti-arrows-up-down" aria-hidden="true"></i>
            <span>Sort</span>
          </kp-button>
        }
      </div>

      <div class="kp-tt__right">
        @if (showDensity) {
          <div class="kp-tt__density" role="group" aria-label="Row density">
            <button
              type="button"
              class="kp-tt__density-btn"
              [class.kp-tt__density-btn--active]="density === 'compact'"
              (click)="densityChange.emit('compact')"
              aria-label="Compact">
              <i class="ti ti-layout-list" aria-hidden="true"></i>
            </button>
            <button
              type="button"
              class="kp-tt__density-btn"
              [class.kp-tt__density-btn--active]="density === 'comfortable'"
              (click)="densityChange.emit('comfortable')"
              aria-label="Comfortable">
              <i class="ti ti-layout-rows" aria-hidden="true"></i>
            </button>
            <button
              type="button"
              class="kp-tt__density-btn"
              [class.kp-tt__density-btn--active]="density === 'spacious'"
              (click)="densityChange.emit('spacious')"
              aria-label="Spacious">
              <i class="ti ti-layout-grid" aria-hidden="true"></i>
            </button>
          </div>
        }

        @if (showColumnPicker) {
          <kp-button variant="outline" size="sm" [iconOnly]="true" aria-label="Columns" (click)="columnsClick.emit()">
            <i kpButtonIconLeft class="ti ti-layout-columns" aria-hidden="true"></i>
          </kp-button>
        }

        @if (showExport) {
          <kp-button variant="ghost" size="sm" (click)="exportClick.emit()">
            <i kpButtonIconLeft class="ti ti-download" aria-hidden="true"></i>
            <span>Export</span>
          </kp-button>
        }

        @if (hasRightActions && showCreate) {
          <span class="kp-tt__divider" aria-hidden="true"></span>
        }

        @if (showCreate) {
          <kp-button variant="default" color="primary" size="sm" (click)="createClick.emit()">
            <i kpButtonIconLeft class="ti ti-plus" aria-hidden="true"></i>
            <span>{{ createLabel }}</span>
          </kp-button>
        }
      </div>
    } @else {
      <div class="kp-tt__left">
        <span class="kp-tt__selected">
          <strong>{{ selectedCount }}</strong> {{ selectedCount === 1 ? 'item' : 'items' }} selected
        </span>
        <kp-button variant="ghost" size="sm" (click)="clearSelection.emit()">
          <i kpButtonIconLeft class="ti ti-x" aria-hidden="true"></i>
          <span>Clear selection</span>
        </kp-button>
      </div>

      <div class="kp-tt__right">
        <kp-button variant="outline" size="sm" (click)="bulkExport.emit()">
          <i kpButtonIconLeft class="ti ti-download" aria-hidden="true"></i>
          <span>Export selected</span>
        </kp-button>
        <kp-button variant="outline" size="sm" (click)="bulkTag.emit()">
          <i kpButtonIconLeft class="ti ti-tag" aria-hidden="true"></i>
          <span>Tag</span>
        </kp-button>
        <kp-button variant="outline" size="sm" (click)="bulkMove.emit()">
          <i kpButtonIconLeft class="ti ti-folder" aria-hidden="true"></i>
          <span>Move to…</span>
        </kp-button>
        <span class="kp-tt__divider" aria-hidden="true"></span>
        <kp-button variant="outline" color="danger" size="sm" (click)="bulkDelete.emit()">
          <i kpButtonIconLeft class="ti ti-trash" aria-hidden="true"></i>
          <span>Delete</span>
        </kp-button>
      </div>
    }
  `,
  styles: [`
    :host {
      box-sizing: border-box;
      display: flex;
      width: 100%;
      max-width: 100%;
      min-width: 0;
      overflow: hidden;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      row-gap: 8px;
      padding: 12px 16px;
      background: var(--kp-color-white, var(--kp-color-white));
      border-bottom: 1px solid var(--kp-color-gray-200, var(--kp-color-gray-200));
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
    }

    .kp-tt__left {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      row-gap: 8px;
      flex: 1 1 auto;
      min-width: 0;
    }

    .kp-tt__right {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
      row-gap: 8px;
      flex: 0 1 auto;
      justify-content: flex-end;
      margin-left: auto;
    }

    /* Let SearchBar shrink inside the toolbar when the viewport is narrow.
       Need !important — SearchBar's own :host { display: inline-block }
       wins on specificity otherwise. */
    :host kp-search-bar {
      display: flex !important;
      flex: 1 1 240px;
      min-width: 0;
      max-width: 320px;
    }
    :host kp-search-bar ::ng-deep .kp-search-bar__wrap {
      width: 100% !important;
      min-width: 0;
    }

    .kp-tt__divider {
      width: 1px;
      height: 24px;
      background: var(--kp-color-gray-200, var(--kp-color-gray-200));
      margin: 0 4px;
    }

    .kp-tt__selected {
      font-size: 13px;
      color: var(--kp-color-gray-700, var(--kp-color-gray-700));
    }
    .kp-tt__selected strong {
      color: var(--kp-color-gray-900, var(--kp-color-gray-900));
      font-weight: 600;
    }

    /* Density toggle — compact segmented look */
    .kp-tt__density {
      display: inline-flex;
      padding: 2px;
      border: 1px solid var(--kp-color-gray-200, var(--kp-color-gray-200));
      border-radius: 6px;
      background: var(--kp-color-gray-50, var(--kp-color-gray-50));
    }
    .kp-tt__density-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 24px;
      padding: 0;
      border: none;
      background: transparent;
      border-radius: 4px;
      color: var(--kp-color-gray-600, var(--kp-color-gray-600));
      cursor: pointer;
      font: inherit;
    }
    .kp-tt__density-btn:hover { color: var(--kp-color-gray-900, var(--kp-color-gray-900)); }
    .kp-tt__density-btn--active {
      background: var(--kp-color-white, var(--kp-color-white));
      color: var(--kp-color-gray-900, var(--kp-color-gray-900));
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }
    .kp-tt__density-btn .ti { font-size: 14px; line-height: 1; }

    /* Inline icons inside buttons */
    :host .ti { font-size: 14px; line-height: 1; }
  `],
})
export class KpTableToolbarComponent {
  @Input() mode: KpTableToolbarMode = 'default';

  @Input() showSearch = true;
  @Input() searchPlaceholder = 'Search…';
  @Input() searchValue = '';

  @Input() showFilter = true;
  @Input() activeFilterCount = 0;

  @Input() showSort = false;
  @Input() showDensity = false;
  @Input() density: KpTableToolbarDensity = 'comfortable';

  @Input() showColumnPicker = false;
  @Input() showExport = false;
  @Input() showCreate = true;
  @Input() createLabel = 'Create new';

  @Input() selectedCount = 0;

  @Output() searchChange = new EventEmitter<string>();
  @Output() filterClick = new EventEmitter<void>();
  @Output() sortClick = new EventEmitter<void>();
  @Output() densityChange = new EventEmitter<KpTableToolbarDensity>();
  @Output() columnsClick = new EventEmitter<void>();
  @Output() exportClick = new EventEmitter<void>();
  @Output() createClick = new EventEmitter<void>();

  @Output() clearSelection = new EventEmitter<void>();
  @Output() bulkExport = new EventEmitter<void>();
  @Output() bulkTag = new EventEmitter<void>();
  @Output() bulkMove = new EventEmitter<void>();
  @Output() bulkDelete = new EventEmitter<void>();

  get hasRightActions(): boolean {
    return this.showDensity || this.showColumnPicker || this.showExport;
  }

  get hostClasses(): string {
    return `kp-tt kp-tt--${this.mode}`;
  }
}
