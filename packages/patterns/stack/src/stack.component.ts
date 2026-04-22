import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';

export type KpStackGap =
  | 'none'
  | '2xs'
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl';

export type KpStackAlign = 'start' | 'center' | 'end' | 'stretch';

/**
 * Kanso Protocol — Stack
 *
 * Vertical Auto Layout wrapper with a preset gap scale and cross-axis
 * alignment. Semantic counterpart to `<div style="display:flex;flex-direction:column">`.
 *
 * @example
 * <kp-stack gap="md">
 *   <kp-input/>
 *   <kp-input/>
 *   <kp-button>Save</kp-button>
 * </kp-stack>
 */
@Component({
  selector: 'kp-stack',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClasses' },
  template: `<ng-content/>`,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--kp-stack-gap, 16px);
    }

    :host(.kp-stack--gap-none) { --kp-stack-gap: 0; }
    :host(.kp-stack--gap-2xs)  { --kp-stack-gap: var(--kp-spacing-2xs, 8px); }
    :host(.kp-stack--gap-xs)   { --kp-stack-gap: var(--kp-spacing-xs, 12px); }
    :host(.kp-stack--gap-sm)   { --kp-stack-gap: var(--kp-spacing-sm, 16px); }
    :host(.kp-stack--gap-md)   { --kp-stack-gap: var(--kp-spacing-md, 20px); }
    :host(.kp-stack--gap-lg)   { --kp-stack-gap: var(--kp-spacing-lg, 24px); }
    :host(.kp-stack--gap-xl)   { --kp-stack-gap: var(--kp-spacing-xl, 32px); }
    :host(.kp-stack--gap-2xl)  { --kp-stack-gap: var(--kp-spacing-2xl, 40px); }

    :host(.kp-stack--align-start)   { align-items: flex-start; }
    :host(.kp-stack--align-center)  { align-items: center; }
    :host(.kp-stack--align-end)     { align-items: flex-end; }
    :host(.kp-stack--align-stretch) { align-items: stretch; }
  `],
})
export class KpStackComponent {
  @Input() gap: KpStackGap = 'md';
  @Input() align: KpStackAlign = 'stretch';

  get hostClasses(): string {
    return `kp-stack kp-stack--gap-${this.gap} kp-stack--align-${this.align}`;
  }
}
