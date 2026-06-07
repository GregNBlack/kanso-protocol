import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';

export type KpContainerWidth = 'narrow' | 'medium' | 'wide' | 'full';
export type KpContainerPadding = 'none' | 'sm' | 'md' | 'lg';

/**
 * Kanso Protocol — Container
 *
 * Responsive content wrapper. Caps child width at one of four
 * preset breakpoints and applies horizontal padding. Pure layout
 * primitive — no colors, borders, or spacing on its own axis.
 *
 * @example
 * <kp-container width="medium" padding="md">
 *   <h1>Settings</h1>
 *   <kp-card>…</kp-card>
 * </kp-container>
 */
@Component({
  selector: 'kp-container',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClasses' },
  template: `<ng-content/>`,
  styles: [`
    :host {
      box-sizing: border-box;
      display: block;
      width: 100%;
      max-width: var(--kp-container-max, 1280px);
      margin-inline: auto;
      padding-inline: var(--kp-container-pad, 24px);
    }

    :host(.kp-container--narrow) { --kp-container-max: var(--kp-layout-container-max-width-narrow, 640px); }
    :host(.kp-container--medium) { --kp-container-max: var(--kp-layout-container-max-width-medium, 960px); }
    :host(.kp-container--wide)   { --kp-container-max: var(--kp-layout-container-max-width-wide,   1280px); }
    :host(.kp-container--full)   { --kp-container-max: 100%; }

    :host(.kp-container--pad-none) { --kp-container-pad: 0; }
    :host(.kp-container--pad-sm)   { --kp-container-pad: var(--kp-layout-container-padding-sm, 16px); }
    :host(.kp-container--pad-md)   { --kp-container-pad: var(--kp-layout-container-padding-md, 24px); }
    :host(.kp-container--pad-lg)   { --kp-container-pad: var(--kp-layout-container-padding-lg, 32px); }
  `],
})
export class KpContainerComponent {
  @Input() width: KpContainerWidth = 'wide';
  @Input() padding: KpContainerPadding = 'md';

  get hostClasses(): string {
    return `kp-container kp-container--${this.width} kp-container--pad-${this.padding}`;
  }
}
