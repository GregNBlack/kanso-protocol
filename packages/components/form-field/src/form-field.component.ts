import {
  Component,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';

export type KpRequiredMode = 'none' | 'optional' | 'required-asterisk';

/**
 * Kanso Protocol — FormField
 *
 * Wrapper around any form control that adds a label with optional/required
 * marker and a helper/error text below. Project any control via <ng-content>.
 *
 * @example
 * <kp-form-field label="Email" helper="We'll never share it">
 *   <kp-input placeholder="you@example.com"></kp-input>
 * </kp-form-field>
 *
 * <kp-form-field label="Password" required="required-asterisk" [error]="true" helper="Required field">
 *   <kp-input type="password"></kp-input>
 * </kp-form-field>
 */
@Component({
  selector: 'kp-form-field',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses',
  },
  template: `
    @if (label) {
      <div class="kp-form-field__label-row">
        <span class="kp-form-field__label">{{ label }}</span>
        @if (required === 'optional') {
          <span class="kp-form-field__optional">(optional)</span>
        } @else if (required === 'required-asterisk') {
          <span class="kp-form-field__required" aria-hidden="true">*</span>
        }
      </div>
    }
    <div class="kp-form-field__control"><ng-content/></div>
    @if (showHelper && (helper || error)) {
      <div class="kp-form-field__helper">{{ helper }}</div>
    }
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 100%;
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
    }

    .kp-form-field__label-row {
      display: flex;
      align-items: baseline;
      gap: 4px;
    }
    .kp-form-field__label {
      font-size: 14px;
      line-height: 20px;
      font-weight: 500;
      color: var(--kp-form-label, var(--kp-color-gray-700));
    }
    .kp-form-field__optional {
      font-size: 13px;
      font-weight: 400;
      color: var(--kp-form-optional, var(--kp-color-gray-500));
    }
    .kp-form-field__required {
      font-size: 14px;
      font-weight: 500;
      color: var(--kp-form-required, var(--kp-color-red-600));
    }

    .kp-form-field__control { display: block; }

    .kp-form-field__helper {
      font-size: 12px;
      line-height: 16px;
      font-weight: 400;
      color: var(--kp-form-helper, var(--kp-color-gray-500));
    }

    /* Error state */
    :host(.kp-form-field--error) .kp-form-field__label {
      --kp-form-label: var(--kp-color-red-600);
    }
    :host(.kp-form-field--error) .kp-form-field__helper {
      --kp-form-helper: var(--kp-color-red-500);
    }

    /* Disabled state */
    :host(.kp-form-field--disabled) .kp-form-field__label {
      --kp-form-label: var(--kp-color-gray-400);
    }
    :host(.kp-form-field--disabled) .kp-form-field__helper {
      --kp-form-helper: var(--kp-color-gray-400);
    }
  `]
})
export class KpFormFieldComponent {
  @Input() label = '';
  @Input() helper = '';
  @Input() required: KpRequiredMode = 'none';
  @Input() showHelper = true;
  @Input() error = false;
  @Input() disabled = false;

  get hostClasses(): string {
    const classes = ['kp-form-field'];
    if (this.error) classes.push('kp-form-field--error');
    if (this.disabled) classes.push('kp-form-field--disabled');
    return classes.join(' ');
  }
}
