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
 * Anatomy: Container → Content → Elements (icon-left, label/value, icon-right)
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
    @if (floatingLabel && supportsFloatingLabel && (hasValue() || forceState === 'focus' || forceState === 'active' || forceState === 'error')) {
      <span class="kp-input__label-small">{{ label }}</span>
    }

    <span class="kp-input__icon kp-input__icon--left" aria-hidden="true">
      <ng-content select="[kpInputIconLeft]"/>
    </span>

    @if (floatingLabel && supportsFloatingLabel && !hasValue() && forceState !== 'focus' && forceState !== 'active') {
      <span class="kp-input__label-large">{{ label }}</span>
    } @else {
      <input
        class="kp-input__field"
        [type]="type"
        [placeholder]="placeholder"
        [disabled]="disabled"
        [value]="value ?? ''"
        (input)="onInputChange($event)"
        (blur)="onTouched()"
      />
    }

    <span class="kp-input__icon kp-input__icon--right" aria-hidden="true">
      <ng-content select="[kpInputIconRight]"/>
    </span>
    `,
    styles: [`
    :host {
      display: inline-flex;
      align-items: center;
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
        border-color var(--kp-motion-duration-fast, 100ms) var(--kp-motion-ease-in-out, cubic-bezier(0.4, 0, 0.2, 1)),
        background var(--kp-motion-duration-fast, 100ms) var(--kp-motion-ease-in-out, cubic-bezier(0.4, 0, 0.2, 1));
      position: relative;
    }

    :host(:hover:not(.kp-input--disabled)),
    :host(.kp-input--hover) {
      border-color: var(--kp-input-border-hover, #A1A1AA);
    }

    :host(:focus-within:not(.kp-input--disabled)),
    :host(.kp-input--focus) {
      border-color: var(--kp-input-border-focus, #2563EB);
      outline: none;
    }

    :host(.kp-input--disabled) {
      background: var(--kp-input-bg-disabled, #FAFAFA);
      border-color: var(--kp-input-border-disabled, #E4E4E7);
      cursor: not-allowed;
    }

    :host(.kp-input--error) {
      border-color: var(--kp-input-border-error, #EF4444);
    }

    /* --- Field (real <input>) --- */
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
    .kp-input__label-large {
      flex: 1;
      color: var(--kp-input-placeholder, #A1A1AA);
      font-size: var(--kp-input-font-size);
      line-height: var(--kp-input-line-height);
      font-weight: var(--kp-input-label-weight, 400);
    }

    .kp-input__label-small {
      position: absolute;
      top: 2px;
      left: var(--kp-input-padding-x);
      font-size: var(--kp-input-label-small-size, 10px);
      font-weight: 500;
      color: var(--kp-input-floating-label, #52525B);
      pointer-events: none;
    }

    :host(.kp-input--focus) .kp-input__label-small {
      color: var(--kp-input-floating-label-focus, #2563EB);
    }

    :host(.kp-input--error) .kp-input__label-small {
      color: var(--kp-input-floating-label-error, #EF4444);
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
      --kp-input-font-weight: 500; --kp-input-label-weight: 500;
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

  get supportsFloatingLabel(): boolean {
    return this.size === 'lg' || this.size === 'xl';
  }

  hasValue(): boolean {
    return this.value !== null && this.value !== '';
  }

  get hostClasses(): string {
    const classes = ['kp-input', `kp-input--${this.size}`];
    if (this.floatingLabel && this.supportsFloatingLabel) classes.push('kp-input--floating');
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
