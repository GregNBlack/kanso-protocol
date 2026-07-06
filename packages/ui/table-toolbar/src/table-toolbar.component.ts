import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { KpButtonComponent } from '@kanso-protocol/ui/button';
import { KpBadgeComponent } from '@kanso-protocol/ui/badge';
import { KpIconComponent } from '@kanso-protocol/ui/icon';
import { KpSearchBarComponent } from '@kanso-protocol/ui/search-bar';

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
  imports: [KpButtonComponent, KpBadgeComponent, KpIconComponent, KpSearchBarComponent],
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
          <button kpButton variant="outline" size="sm" (click)="filterClick.emit()">
            <kp-icon kpButtonIconLeft name="filter" />
            Filters
            @if (activeFilterCount > 0) {
              <kp-badge kpButtonIconRight size="xs" color="primary" appearance="subtle">{{ activeFilterCount }}</kp-badge>
            }
          </button>
        }

        @if (showSort) {
          <button kpButton variant="outline" size="sm" (click)="sortClick.emit()">
            <kp-icon kpButtonIconLeft name="arrows-up-down" />
            <span>Sort</span>
          </button>
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
              <kp-icon name="layout-list" />
            </button>
            <button
              type="button"
              class="kp-tt__density-btn"
              [class.kp-tt__density-btn--active]="density === 'comfortable'"
              (click)="densityChange.emit('comfortable')"
              aria-label="Comfortable">
              <kp-icon name="layout-rows" />
            </button>
            <button
              type="button"
              class="kp-tt__density-btn"
              [class.kp-tt__density-btn--active]="density === 'spacious'"
              (click)="densityChange.emit('spacious')"
              aria-label="Spacious">
              <kp-icon name="layout-grid" />
            </button>
          </div>
        }

        @if (showColumnPicker) {
          <button kpButton variant="outline" size="sm" [iconOnly]="true" aria-label="Columns" (click)="columnsClick.emit()">
            <kp-icon kpButtonIconLeft name="layout-columns" />
          </button>
        }

        @if (showExport) {
          <button kpButton variant="ghost" size="sm" (click)="exportClick.emit()">
            <kp-icon kpButtonIconLeft name="download" />
            <span>Export</span>
          </button>
        }

        @if (hasRightActions && showCreate) {
          <span class="kp-tt__divider" aria-hidden="true"></span>
        }

        @if (showCreate) {
          <button kpButton variant="default" color="primary" size="sm" (click)="createClick.emit()">
            <kp-icon kpButtonIconLeft name="plus" />
            <span>{{ createLabel }}</span>
          </button>
        }
      </div>
    } @else {
      <div class="kp-tt__left">
        <span class="kp-tt__selected">
          <strong>{{ selectedCount }}</strong> {{ selectedCount === 1 ? 'item' : 'items' }} selected
        </span>
        <button kpButton variant="ghost" size="sm" (click)="clearSelection.emit()">
          <kp-icon kpButtonIconLeft name="x" />
          <span>Clear selection</span>
        </button>
      </div>

      <div class="kp-tt__right">
        <button kpButton variant="outline" size="sm" (click)="bulkExport.emit()">
          <kp-icon kpButtonIconLeft name="download" />
          <span>Export selected</span>
        </button>
        <button kpButton variant="outline" size="sm" (click)="bulkTag.emit()">
          <kp-icon kpButtonIconLeft name="tag" />
          <span>Tag</span>
        </button>
        <button kpButton variant="outline" size="sm" (click)="bulkMove.emit()">
          <kp-icon kpButtonIconLeft name="folder" />
          <span>Move to…</span>
        </button>
        <span class="kp-tt__divider" aria-hidden="true"></span>
        <button kpButton variant="outline" color="danger" size="sm" (click)="bulkDelete.emit()">
          <kp-icon kpButtonIconLeft name="trash" />
          <span>Delete</span>
        </button>
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
      background: var(--kp-color-surface-base);
      border-bottom: 1px solid var(--kp-color-border-default);
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
      margin-inline-start: auto;
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
      background: var(--kp-color-surface-strong);
      margin: 0 4px;
    }

    .kp-tt__selected {
      font-size: 13px;
      color: var(--kp-color-text-default);
    }
    .kp-tt__selected strong {
      color: var(--kp-color-text-strong);
      font-weight: 600;
    }

    /* Density toggle — compact segmented look */
    .kp-tt__density {
      display: inline-flex;
      padding: 2px;
      border: 1px solid var(--kp-color-border-default);
      border-radius: 6px;
      background: var(--kp-color-surface-subtle);
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
      color: var(--kp-color-text-muted);
      cursor: pointer;
      font: inherit;
    }
    .kp-tt__density-btn:hover { color: var(--kp-color-text-strong); }
    .kp-tt__density-btn--active {
      background: var(--kp-color-surface-base);
      color: var(--kp-color-text-strong);
      box-shadow: var(--kp-elevation-raised);
    }
    .kp-tt__density-btn .ti { font-size: 14px; line-height: 1; }

    /* Inline icons inside buttons */
    :host .ti { font-size: 14px; line-height: 1; }

    /* Windows High Contrast: the active density segment reads as active only
       via background + box-shadow, both flattened in forced-colors — pin it to
       a system accent so the current density stays distinguishable. */
    @media (forced-colors: active) {
      .kp-tt__density-btn--active {
        forced-color-adjust: none;
        background: Highlight;
        color: HighlightText;
      }
    }
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
