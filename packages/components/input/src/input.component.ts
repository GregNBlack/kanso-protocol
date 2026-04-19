import {
  Component,
  Input,
  ChangeDetectionStrategy,
  forwardRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { KpSize, KpState } from '@kanso-protocol/core';

/**
 * Kanso Protocol — Input Component
 *
 * Anatomy: Container → Content → Elements (icon-left, input, icon-right)
 * Supports: 5 sizes × 7 states (rest/hover/active/focus/disabled/loading/error)
 * Floating Label: available for lg and xl sizes
 *
 * @example
 * <kp-input size="md" placeholder="Enter text"></kp-input>
 * <kp-input size="lg" label="Email" [floatingLabel]="true"></kp-input>
 */
@Component({
    selector: 'kp-input',
    imports: [],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
      {
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => KpInputComponent),
        multi: true,
      },
    ],
    host: {
        '[class]': 'hostClasses',
        '[attr.aria-invalid]': 'forceState === "error" || null',
        '[attr.aria-disabled]': 'disabled || null',
    },
    template: `
    <span class="kp-input__icon kp-input__icon--left" aria-hidden="true">
      <ng-content select="[kpInputIconLeft]"/>
    </span>

    <span class="kp-input__field-wrap">
      <input
        #inputEl
        class="kp-input__field"
        [type]="type"
        [placeholder]="resolvedPlaceholder"
        [disabled]="disabled"
        [value]="value ?? ''"
        (focus)="isFocused = true"
        (blur)="isFocused = false; onTouched()"
        (input)="onInputChange($event)"
      />
      @if (showFloatingLabel()) {
        <span class="kp-input__label" [class.kp-input__label--floated]="isLabelFloated()">
          {{ label }}
        </span>
      }
    </span>

    <span class="kp-input__icon kp-input__icon--right" aria-hidden="true">
      <ng-content select="[kpInputIconRight]"/>
    </span>
    `,
    styles: [`
    :host {
      display: inline-flex;
      align-items: stretch;
      box-sizing: border-box;
      width: 280px;
      border: 1px solid var(--kp-input-border, #D4D4D8);
      border-radius: var(--kp-input-radius);
      background: var(--kp-input-bg, #FFFFFF);
      height: var(--kp-input-height);
      padding: 0 var(--kp-input-padding-x);
      gap: var(--kp-input-gap);
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
      transition:
        border-color var(--kp-motion-duration-fast, 100ms) ease,
        background var(--kp-motion-duration-fast, 100ms) ease;
    }

    /* --- Interactive states --- */
    :host(:hover:not(.kp-input--disabled):not(.kp-input--error)),
    :host(.kp-input--hover) {
      border-color: var(--kp-input-border-hover, #A1A1AA);
    }

    :host(:focus-within:not(.kp-input--disabled):not(.kp-input--error)),
    :host(.kp-input--focus) {
      border-color: var(--kp-input-border-focus, #2563EB);
      outline: none;
    }

    :host(.kp-input--active) {
      border-color: var(--kp-input-border-active, #71717A);
    }

    :host(.kp-input--disabled) {
      background: var(--kp-input-bg-disabled, #FAFAFA);
      border-color: var(--kp-input-border-disabled, #E4E4E7);
      cursor: not-allowed;
    }

    :host(.kp-input--error) {
      border-color: var(--kp-input-border-error, #EF4444);
    }

    /* --- Field wrap with overlay label --- */
    .kp-input__field-wrap {
      position: relative;
      flex: 1;
      min-width: 0;
      display: flex;
      align-items: center;
    }

    /* --- The real input --- */
    .kp-input__field {
      flex: 1;
      min-width: 0;
      border: none;
      outline: none;
      background: transparent;
      color: var(--kp-input-fg, #18181B);
      font: inherit;
      font-size: var(--kp-input-font-size);
      line-height: var(--kp-input-line-height);
      font-weight: var(--kp-input-font-weight, 400);
      padding: 0;
      width: 100%;
    }

    .kp-input__field::placeholder {
      color: var(--kp-input-placeholder, #A1A1AA);
    }

    .kp-input__field:disabled {
      color: var(--kp-input-fg-disabled, #A1A1AA);
      cursor: not-allowed;
    }

    /* --- Icons --- */
    .kp-input__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      color: var(--kp-input-placeholder, #A1A1AA);
    }
    .kp-input__icon:empty { display: none; }

    /* --- Floating Label --- */
    /* Resting state: label is positioned inside the field, same size as placeholder */
    .kp-input__label {
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      color: var(--kp-input-placeholder, #A1A1AA);
      font-size: var(--kp-input-font-size);
      line-height: var(--kp-input-line-height);
      font-weight: var(--kp-input-font-weight, 400);
      pointer-events: none;
      transition:
        top var(--kp-motion-duration-fast, 150ms) ease,
        transform var(--kp-motion-duration-fast, 150ms) ease,
        font-size var(--kp-motion-duration-fast, 150ms) ease,
        color var(--kp-motion-duration-fast, 150ms) ease;
    }

    /* Floated state: label moves to top, shrinks */
    .kp-input__label--floated {
      top: 2px;
      transform: translateY(0);
      font-size: var(--kp-input-label-small-size, 10px);
      font-weight: 500;
      color: var(--kp-floating-label, #52525B);
    }

    :host(.kp-input--focus) .kp-input__label--floated,
    :host(:focus-within) .kp-input__label--floated {
      color: var(--kp-floating-label-focus, #2563EB);
    }

    :host(.kp-input--error) .kp-input__label--floated {
      color: var(--kp-floating-label-error, #EF4444);
    }

    /* When floating label is floated (at top), input text needs to leave room */
    :host(.kp-input--floating) .kp-input__field-wrap {
      align-items: flex-end;
      padding-top: 14px;
      padding-bottom: 2px;
    }

    /* === SIZE TOKENS === synced from Figma Input master component */
    :host(.kp-input--xs) {
      --kp-input-height: 24px; --kp-input-radius: 8px; --kp-input-padding-x: 6px;
      --kp-input-font-size: 12px; --kp-input-line-height: 1.333;
      --kp-input-gap: 4px;
    }
    :host(.kp-input--sm) {
      --kp-input-height: 28px; --kp-input-radius: 10px; --kp-input-padding-x: 8px;
      --kp-input-font-size: 14px; --kp-input-line-height: 1.428;
      --kp-input-gap: 5px;
    }
    :host(.kp-input--md) {
      --kp-input-height: 36px; --kp-input-radius: 12px; --kp-input-padding-x: 12px;
      --kp-input-font-size: 16px; --kp-input-line-height: 1.5;
      --kp-input-gap: 6px;
    }
    :host(.kp-input--lg) {
      --kp-input-height: 44px; --kp-input-radius: 14px; --kp-input-padding-x: 14px;
      --kp-input-font-size: 16px; --kp-input-line-height: 1.5;
      --kp-input-label-small-size: 10px;
      --kp-input-gap: 8px;
    }
    :host(.kp-input--xl) {
      --kp-input-height: 52px; --kp-input-radius: 16px; --kp-input-padding-x: 16px;
      --kp-input-font-size: 20px; --kp-input-line-height: 1.4;
      --kp-input-font-weight: 500;
      --kp-input-label-small-size: 11px;
      --kp-input-gap: 8px;
    }
  `]
})
export class KpInputComponent implements ControlValueAccessor {
  @Input() size: KpSize = 'md';
  @Input() type: string = 'text';
  @Input() placeholder = '';
  @Input() label = '';
  @Input() floatingLabel = false;
  @Input() disabled = false;
  /** Force a visual state for showcase/documentation purposes */
  @Input() forceState: KpState | null = null;

  value: string | null = null;
  isFocused = false;

  get supportsFloatingLabel(): boolean {
    return this.size === 'lg' || this.size === 'xl';
  }

  showFloatingLabel(): boolean {
    return this.floatingLabel && this.supportsFloatingLabel && !!this.label;
  }

  hasValue(): boolean {
    return this.value !== null && this.value !== '';
  }

  /** Label floats when focused, filled, or in a showcase active/error state */
  isLabelFloated(): boolean {
    return this.hasValue()
      || this.isFocused
      || this.forceState === 'focus'
      || this.forceState === 'active'
      || this.forceState === 'error';
  }

  /** Hide placeholder while floating label is resting inside the field */
  get resolvedPlaceholder(): string {
    if (this.showFloatingLabel() && !this.isLabelFloated()) {
      return '';
    }
    return this.placeholder;
  }

  get hostClasses(): string {
    const classes = ['kp-input', `kp-input--${this.size}`];
    if (this.showFloatingLabel()) classes.push('kp-input--floating');
    if (this.forceState) {
      classes.push(`kp-input--${this.forceState}`);
    } else if (this.disabled) {
      classes.push('kp-input--disabled');
    }
    return classes.join(' ');
  }

  // ControlValueAccessor
  onChange: (value: string) => void = () => { /* no-op */ };
  onTouched: () => void = () => { /* no-op */ };

  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(target.value);
  }

  writeValue(value: string | null): void {
    this.value = value;
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
