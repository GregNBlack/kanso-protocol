import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { KpButtonComponent } from '@kanso-protocol/ui/button';
import { KpBadgeComponent, KpBadgeColor } from '@kanso-protocol/ui/badge';
import { KpIconComponent } from '@kanso-protocol/ui/icon';

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
        <button kpButton variant="ghost" size="sm" (click)="addFilter.emit()">
          <kp-icon name="plus" />
          <span>Add filter</span>
        </button>
      }
    </div>

    <div class="kp-fb__actions">
      @if (showSaveFilter) {
        <button kpButton variant="ghost" size="sm" (click)="saveFilter.emit()">
          <kp-icon name="bookmark" />
          <span>Save filter</span>
        </button>
      }

      @if (showClearAll && filters.length > 0) {
        <button kpButton variant="ghost" size="sm" (click)="clearAll.emit()">
          <span>Clear all</span>
        </button>
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
      background: var(--kp-color-surface-base);
      border-bottom: 1px solid var(--kp-color-border-subtle);
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

    /* In a control strip the chips sit next to sm buttons (Add filter / Clear
       all). A sm badge is 22px but a sm control is 28px, so the chips looked
       short. Raise the chip height to the shared SM control token so chips and
       buttons line up. Higher specificity than the badge's own
       :host(.kp-badge--sm) rule, so this wins; the sm font/padding stay. */
    .kp-fb__chips kp-badge {
      --kp-badge-h: var(--kp-size-sm);
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
