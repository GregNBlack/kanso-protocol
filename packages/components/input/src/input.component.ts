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
        '[attr.aria-disabled]': 'isDisabled || null',
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
        [disabled]="isDisabled"
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

    @if (showClear && hasValue() && !isDisabled) {
      <button
        type="button"
        class="kp-input__clear"
        aria-label="Clear input"
        (click)="clear()"
        (mousedown)="$event.preventDefault()">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    }

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
      border: 1px solid var(--kp-input-border, var(--kp-color-gray-300));
      border-radius: var(--kp-input-radius);
      background: var(--kp-input-bg, var(--kp-color-white));
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
      border-color: var(--kp-input-border-hover, var(--kp-color-gray-400));
    }

    :host(:focus-within:not(.kp-input--disabled):not(.kp-input--error)),
    :host(.kp-input--focus) {
      border-color: var(--kp-input-border-focus, var(--kp-color-blue-600));
      outline: none;
    }

    :host(.kp-input--active) {
      border-color: var(--kp-input-border-active, var(--kp-color-gray-500));
    }

    :host(.kp-input--disabled) {
      background: var(--kp-input-bg-disabled, var(--kp-color-gray-50));
      border-color: var(--kp-input-border-disabled, var(--kp-color-gray-200));
      cursor: not-allowed;
    }

    :host(.kp-input--error) {
      border-color: var(--kp-input-border-error, var(--kp-color-red-500));
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
      color: var(--kp-input-fg, var(--kp-color-gray-900));
      font: inherit;
      font-size: var(--kp-input-font-size);
      line-height: var(--kp-input-line-height);
      font-weight: var(--kp-input-font-weight, 400);
      padding: 0;
      width: 100%;
    }

    .kp-input__field::placeholder {
      color: var(--kp-input-placeholder, var(--kp-color-gray-400));
    }

    .kp-input__field:disabled {
      color: var(--kp-input-fg-disabled, var(--kp-color-gray-400));
      cursor: not-allowed;
    }

    /* --- Clear button --- */
    .kp-input__clear {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      align-self: center;
      flex-shrink: 0;
      width: var(--kp-input-clear-size, 20px);
      height: var(--kp-input-clear-size, 20px);
      padding: 2px;
      border: none;
      border-radius: 4px;
      background: transparent;
      color: var(--kp-color-gray-500);
      cursor: pointer;
      transition:
        background var(--kp-motion-duration-fast, 100ms) ease,
        color var(--kp-motion-duration-fast, 100ms) ease;
    }
    .kp-input__clear:hover {
      background: var(--kp-color-gray-100);
      color: var(--kp-color-gray-700);
    }
    .kp-input__clear:active {
      background: var(--kp-color-gray-200);
      color: var(--kp-color-gray-900);
    }
    .kp-input__clear svg {
      width: var(--kp-input-clear-icon, 14px);
      height: var(--kp-input-clear-icon, 14px);
    }
    :host(.kp-input--error) .kp-input__clear { color: var(--kp-color-red-600); }

    /* --- Icons --- */
    .kp-input__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      color: var(--kp-input-placeholder, var(--kp-color-gray-400));
    }
    .kp-input__icon:empty { display: none; }

    /* --- Floating Label --- */
    /* Resting state: label is positioned inside the field, same size as placeholder */
    .kp-input__label {
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      color: var(--kp-input-placeholder, var(--kp-color-gray-400));
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
      color: var(--kp-floating-label, var(--kp-color-gray-600));
    }

    :host(.kp-input--focus) .kp-input__label--floated,
    :host(:focus-within) .kp-input__label--floated {
      color: var(--kp-floating-label-focus, var(--kp-color-blue-600));
    }

    :host(.kp-input--error) .kp-input__label--floated {
      color: var(--kp-floating-label-error, var(--kp-color-red-500));
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
      --kp-input-clear-size: 16px; --kp-input-clear-icon: 12px;
    }
    :host(.kp-input--sm) {
      --kp-input-height: 28px; --kp-input-radius: 10px; --kp-input-padding-x: 8px;
      --kp-input-font-size: 14px; --kp-input-line-height: 1.428;
      --kp-input-gap: 5px;
      --kp-input-clear-size: 16px; --kp-input-clear-icon: 12px;
    }
    :host(.kp-input--md) {
      --kp-input-height: 36px; --kp-input-radius: 12px; --kp-input-padding-x: 12px;
      --kp-input-font-size: 16px; --kp-input-line-height: 1.5;
      --kp-input-gap: 6px;
      --kp-input-clear-size: 20px; --kp-input-clear-icon: 14px;
    }
    :host(.kp-input--lg) {
      --kp-input-height: 44px; --kp-input-radius: 14px; --kp-input-padding-x: 14px;
      --kp-input-font-size: 16px; --kp-input-line-height: 1.5;
      --kp-input-label-small-size: 10px;
      --kp-input-gap: 8px;
      --kp-input-clear-size: 24px; --kp-input-clear-icon: 16px;
    }
    :host(.kp-input--xl) {
      --kp-input-height: 52px; --kp-input-radius: 16px; --kp-input-padding-x: 16px;
      --kp-input-font-size: 20px; --kp-input-line-height: 1.4;
      --kp-input-font-weight: 500;
      --kp-input-label-small-size: 11px;
      --kp-input-gap: 8px;
      --kp-input-clear-size: 24px; --kp-input-clear-icon: 16px;
    }
  `]
})
export class KpInputComponent implements ControlValueAccessor {
  @Input() size: KpSize = 'md';
  @Input() type: string = 'text';
  @Input() placeholder = '';
  @Input() label = '';
  @Input() floatingLabel = false;
  @Input() showClear = true;
  @Input() disabled = false;
  /** Force a visual state for showcase/documentation purposes */
  @Input() forceState: KpState | null = null;
  @Input() value: string | null = null;
  isFocused = false;
  /** Set independently by Angular forms via setDisabledState (FormControl.disable()) */
  private cvaDisabled = false;

  get isDisabled(): boolean {
    return this.disabled || this.cvaDisabled || this.forceState === 'disabled';
  }

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
    } else if (this.isDisabled) {
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

  clear(): void {
    if (this.isDisabled) return;
    this.value = '';
    this.onChange('');
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
    this.cvaDisabled = isDisabled;
  }
}
