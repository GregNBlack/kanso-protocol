import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';

export type KpGridColumns = 2 | 3 | 4 | 6 | 12;
export type KpGridGap = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Kanso Protocol — Grid
 *
 * Responsive `display: grid` wrapper. Equal-width columns, preset
 * gap scale. Independent row-gap via `gapRow` when columns need
 * tighter vertical rhythm than horizontal.
 *
 * @example
 * <kp-grid [columns]="3" gap="md">
 *   <kp-card/><kp-card/><kp-card/>
 * </kp-grid>
 */
@Component({
  selector: 'kp-grid',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClasses' },
  template: `<ng-content/>`,
  styles: [`
    :host {
      display: grid;
      grid-template-columns: repeat(var(--kp-grid-cols, 3), minmax(0, 1fr));
      column-gap: var(--kp-grid-col-gap, 16px);
      row-gap: var(--kp-grid-row-gap, var(--kp-grid-col-gap, 16px));
    }

    :host(.kp-grid--cols-2)  { --kp-grid-cols: 2; }
    :host(.kp-grid--cols-3)  { --kp-grid-cols: 3; }
    :host(.kp-grid--cols-4)  { --kp-grid-cols: 4; }
    :host(.kp-grid--cols-6)  { --kp-grid-cols: 6; }
    :host(.kp-grid--cols-12) { --kp-grid-cols: 12; }

    :host(.kp-grid--gap-xs) { --kp-grid-col-gap: var(--kp-spacing-xs, 12px); }
    :host(.kp-grid--gap-sm) { --kp-grid-col-gap: var(--kp-spacing-sm, 16px); }
    :host(.kp-grid--gap-md) { --kp-grid-col-gap: var(--kp-spacing-md, 20px); }
    :host(.kp-grid--gap-lg) { --kp-grid-col-gap: var(--kp-spacing-lg, 24px); }
    :host(.kp-grid--gap-xl) { --kp-grid-col-gap: var(--kp-spacing-xl, 32px); }

    :host(.kp-grid--rgap-xs) { --kp-grid-row-gap: var(--kp-spacing-xs, 12px); }
    :host(.kp-grid--rgap-sm) { --kp-grid-row-gap: var(--kp-spacing-sm, 16px); }
    :host(.kp-grid--rgap-md) { --kp-grid-row-gap: var(--kp-spacing-md, 20px); }
    :host(.kp-grid--rgap-lg) { --kp-grid-row-gap: var(--kp-spacing-lg, 24px); }
    :host(.kp-grid--rgap-xl) { --kp-grid-row-gap: var(--kp-spacing-xl, 32px); }
  `],
})
export class KpGridComponent {
  @Input() columns: KpGridColumns = 3;
  @Input() gap: KpGridGap = 'md';
  /** Optional independent row gap; if null, matches `gap`. */
  @Input() gapRow: KpGridGap | null = null;

  get hostClasses(): string {
    const c = [
      'kp-grid',
      `kp-grid--cols-${this.columns}`,
      `kp-grid--gap-${this.gap}`,
    ];
    if (this.gapRow) c.push(`kp-grid--rgap-${this.gapRow}`);
    return c.join(' ');
  }
}
