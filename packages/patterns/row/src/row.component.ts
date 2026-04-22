import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';

export type KpRowGap =
  | 'none'
  | '2xs'
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl';

export type KpRowAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
export type KpRowJustify =
  | 'start'
  | 'center'
  | 'end'
  | 'space-between'
  | 'space-around';

/**
 * Kanso Protocol — Row
 *
 * Horizontal Auto Layout wrapper with a preset gap scale, cross-axis
 * alignment, and main-axis justification. Optional wrap on overflow.
 *
 * @example
 * <kp-row gap="sm" justify="end">
 *   <kp-button appearance="ghost">Cancel</kp-button>
 *   <kp-button>Save</kp-button>
 * </kp-row>
 */
@Component({
  selector: 'kp-row',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClasses' },
  template: `<ng-content/>`,
  styles: [`
    :host {
      display: flex;
      flex-direction: row;
      gap: var(--kp-row-gap, 16px);
    }

    :host(.kp-row--gap-none) { --kp-row-gap: 0; }
    :host(.kp-row--gap-2xs)  { --kp-row-gap: var(--kp-spacing-2xs, 8px); }
    :host(.kp-row--gap-xs)   { --kp-row-gap: var(--kp-spacing-xs, 12px); }
    :host(.kp-row--gap-sm)   { --kp-row-gap: var(--kp-spacing-sm, 16px); }
    :host(.kp-row--gap-md)   { --kp-row-gap: var(--kp-spacing-md, 20px); }
    :host(.kp-row--gap-lg)   { --kp-row-gap: var(--kp-spacing-lg, 24px); }
    :host(.kp-row--gap-xl)   { --kp-row-gap: var(--kp-spacing-xl, 32px); }
    :host(.kp-row--gap-2xl)  { --kp-row-gap: var(--kp-spacing-2xl, 40px); }

    :host(.kp-row--align-start)    { align-items: flex-start; }
    :host(.kp-row--align-center)   { align-items: center; }
    :host(.kp-row--align-end)      { align-items: flex-end; }
    :host(.kp-row--align-stretch)  { align-items: stretch; }
    :host(.kp-row--align-baseline) { align-items: baseline; }

    :host(.kp-row--justify-start)         { justify-content: flex-start; }
    :host(.kp-row--justify-center)        { justify-content: center; }
    :host(.kp-row--justify-end)           { justify-content: flex-end; }
    :host(.kp-row--justify-space-between) { justify-content: space-between; }
    :host(.kp-row--justify-space-around)  { justify-content: space-around; }

    :host(.kp-row--wrap) { flex-wrap: wrap; }
  `],
})
export class KpRowComponent {
  @Input() gap: KpRowGap = 'md';
  @Input() align: KpRowAlign = 'center';
  @Input() justify: KpRowJustify = 'start';
  @Input() wrap = false;

  get hostClasses(): string {
    const c = [
      'kp-row',
      `kp-row--gap-${this.gap}`,
      `kp-row--align-${this.align}`,
      `kp-row--justify-${this.justify}`,
    ];
    if (this.wrap) c.push('kp-row--wrap');
    return c.join(' ');
  }
}
