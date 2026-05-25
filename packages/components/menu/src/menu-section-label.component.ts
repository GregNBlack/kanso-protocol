import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

/**
 * Kanso Protocol — MenuSectionLabel
 *
 * Small uppercase heading used to group items inside a DropdownMenu.
 */
@Component({
  selector: 'kp-menu-section-label',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span>{{ label }}</span>`,
  styles: [`
    :host {
      box-sizing: border-box;
      display: block;
      padding: 8px 10px 4px;
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--kp-color-text-muted);
    }
  `]
})
export class KpMenuSectionLabelComponent {
  @Input() label = '';
}
