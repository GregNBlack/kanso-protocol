import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  Input,
  OnDestroy,
  inject,
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { Subscription, merge } from 'rxjs';

import {
  KP_VALIDATION_MESSAGES,
  KpValidationMessages,
  resolveErrorMessage,
} from './validation-messages';

export type KpRequiredMode = 'none' | 'optional' | 'required-asterisk';

/**
 * Kanso Protocol — FormField
 *
 * Wraps any form control with a label, optional/required marker, and a
 * footer that renders either a helper text (rest state) or a validation
 * error message (when the projected control is invalid and was touched
 * or dirty).
 *
 * **Auto-error mode.** Project any Angular form control — `[formControl]`,
 * `[formControlName]`, `ngModel`, or a custom directive that implements
 * `ControlValueAccessor`. FormField finds the `NgControl` via content
 * projection, subscribes to its status/value changes, and surfaces the
 * error from `control.errors` using a lookup against the validation
 * message registry (see `KP_VALIDATION_MESSAGES`). Per-field messages
 * override the registry via the `[errors]` input.
 *
 * **Manual mode.** Pass `[error]="true"` + a custom `[helper]` text if
 * you want full control over the error display (e.g. when the validation
 * state lives outside Angular Forms).
 *
 * @example Auto-error from a reactive FormControl:
 *   <kp-form-field label="Email" required="required-asterisk">
 *     <kp-input [formControl]="email" />
 *   </kp-form-field>
 *
 * @example Per-field custom message:
 *   <kp-form-field label="Age"
 *                  [errors]="{ min: ({ min }) => `Должно быть ≥ ${min}` }">
 *     <kp-input type="number" [formControl]="age" />
 *   </kp-form-field>
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
    @if (showHelper && footerText) {
      <div class="kp-form-field__helper" [attr.aria-live]="isInErrorState ? 'polite' : null">{{ footerText }}</div>
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
export class KpFormFieldComponent implements AfterContentInit, OnDestroy {
  @Input() label = '';
  @Input() helper = '';
  @Input() required: KpRequiredMode = 'none';
  @Input() showHelper = true;

  /**
   * Manual error flag — treated as an override. When `true`, the field
   * renders in error state regardless of the projected control's status.
   * Leave undefined to let the auto-error logic drive the state.
   */
  @Input() error = false;

  @Input() disabled = false;

  /**
   * Per-field validation message overrides. Merged on top of the
   * `KP_VALIDATION_MESSAGES` registry; the key must match the validator
   * name in `AbstractControl.errors`.
   */
  @Input() errors: KpValidationMessages | null = null;

  @ContentChild(NgControl) private ngControl: NgControl | null = null;

  private readonly cdr = inject(ChangeDetectorRef);
  private readonly registry = inject(KP_VALIDATION_MESSAGES);
  private sub: Subscription | null = null;

  /** Internal — whether we should currently show an error from NgControl. */
  private autoErrorShown = false;
  private autoErrorMessage: string | null = null;

  get isInErrorState(): boolean {
    return this.error || this.autoErrorShown;
  }

  /** Text rendered in the footer — error message when in error, helper otherwise. */
  get footerText(): string {
    if (this.isInErrorState) return this.autoErrorMessage ?? this.helper;
    return this.helper;
  }

  get hostClasses(): string {
    const classes = ['kp-form-field'];
    if (this.isInErrorState) classes.push('kp-form-field--error');
    if (this.disabled) classes.push('kp-form-field--disabled');
    return classes.join(' ');
  }

  ngAfterContentInit(): void {
    const c = this.ngControl?.control;
    if (!c) return;

    this.sub = merge(c.statusChanges, c.valueChanges).subscribe(() => {
      this.recomputeAutoError();
      this.cdr.markForCheck();
    });
    this.recomputeAutoError();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private recomputeAutoError(): void {
    const c = this.ngControl?.control;
    if (!c) { this.autoErrorShown = false; this.autoErrorMessage = null; return; }

    const shouldShow = !!(c.invalid && (c.touched || c.dirty));
    if (!shouldShow || !c.errors) {
      this.autoErrorShown = false;
      this.autoErrorMessage = null;
      return;
    }
    this.autoErrorShown = true;
    this.autoErrorMessage = resolveErrorMessage(c.errors, this.errors, this.registry);
  }
}
