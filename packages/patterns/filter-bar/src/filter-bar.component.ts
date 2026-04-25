import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { KpButtonComponent } from '@kanso-protocol/button';
import { KpBadgeComponent, KpBadgeColor } from '@kanso-protocol/badge';
import { KpIconComponent } from '@kanso-protocol/icon';

export type KpFilterChipColor = KpBadgeColor;

export interface KpFilterChip {
  id: string;
  /** `Status: Active` or `Category: 3 selected` — include both key and value */
  label: string;
  /** Visual emphasis — `primary` for a "feature" filter, `neutral` for secondary */
  color?: KpFilterChipColor;
}

/**
 * Kanso Protocol — FilterBar
 *
 * Horizontal strip of active filter chips (closable Badges in pill
 * style) with an "Add filter" affordance on the left and optional
 * "Save filter" / "Clear all" actions on the right. Sits under a
 * TableToolbar or any filterable view.
 *
 * Chips come from `[filters]`. Emit `removeFilter(id)` / `addFilter`
 * / `saveFilter` / `clearAll` — state management lives outside.
 *
 * @example
 * <kp-filter-bar
 *   [filters]="[{ id:'s', label:'Status: Active', color:'primary' }]"
 *   (removeFilter)="drop($event)"
 *   (addFilter)="openPicker()"
 *   (clearAll)="reset()">
 * </kp-filter-bar>
 */
@Component({
  selector: 'kp-filter-bar',
  imports: [KpButtonComponent, KpBadgeComponent, KpIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClasses' },
  template: `
    <div class="kp-fb__chips">
      @for (chip of filters; track chip.id) {
        <kp-badge
          [pill]="true"
          size="sm"
          appearance="subtle"
          [color]="chip.color || 'neutral'"
          [closable]="true"
          (close)="removeFilter.emit(chip.id)"
        >
          {{ chip.label }}
        </kp-badge>
      }

      @if (showAddFilter) {
        <kp-button variant="ghost" size="sm" (click)="addFilter.emit()">
          <kp-icon name="plus" />
          <span>Add filter</span>
        </kp-button>
      }
    </div>

    <div class="kp-fb__actions">
      @if (showSaveFilter) {
        <kp-button variant="ghost" size="sm" (click)="saveFilter.emit()">
          <kp-icon name="bookmark" />
          <span>Save filter</span>
        </kp-button>
      }

      @if (showClearAll && filters.length > 0) {
        <kp-button variant="ghost" size="sm" (click)="clearAll.emit()">
          <span>Clear all</span>
        </kp-button>
      }
    </div>
  `,
  styles: [`
    :host {
      box-sizing: border-box;
      display: flex;
      width: 100%;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      row-gap: 8px;
      padding: 8px 16px;
      background: var(--kp-color-white, var(--kp-color-white));
      border-bottom: 1px solid var(--kp-color-gray-100, var(--kp-color-gray-100));
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
    }

    .kp-fb__chips {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 6px;
      row-gap: 6px;
      flex: 1 1 auto;
      min-width: 0;
    }

    .kp-fb__actions {
      display: flex;
      align-items: center;
      gap: 4px;
      flex: 0 0 auto;
      margin-inline-start: auto;
    }

    :host .ti { font-size: 14px; line-height: 1; }
  `],
})
export class KpFilterBarComponent {
  @Input() filters: KpFilterChip[] = [];
  @Input() showAddFilter = true;
  @Input() showSaveFilter = false;
  @Input() showClearAll = true;

  @Output() removeFilter = new EventEmitter<string>();
  @Output() addFilter = new EventEmitter<void>();
  @Output() saveFilter = new EventEmitter<void>();
  @Output() clearAll = new EventEmitter<void>();

  get hostClasses(): string {
    return 'kp-fb';
  }
}
