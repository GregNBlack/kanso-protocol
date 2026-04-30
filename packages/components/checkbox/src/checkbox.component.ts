import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  forwardRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { KpState } from '@kanso-protocol/core';

export type KpCheckboxSize = 'sm' | 'md' | 'lg';
export type KpCheckboxColor = 'primary' | 'danger';

/**
 * Kanso Protocol — Checkbox Component
 *
 * @example
 * <kp-checkbox [(checked)]="isChecked" size="md">Remember me</kp-checkbox>
 * <kp-checkbox [indeterminate]="true">Select all</kp-checkbox>
 */
@Component({
  selector: 'kp-checkbox',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => KpCheckboxComponent),
      multi: true,
    },
  ],
  host: {
    '[class]': 'hostClasses',
    '[attr.role]': '"checkbox"',
    '[attr.aria-checked]': 'indeterminate ? "mixed" : checked',
    '[attr.aria-disabled]': 'disabled || null',
    '[attr.tabindex]': 'disabled ? -1 : 0',
    '[attr.aria-label]': 'effectiveAriaLabel',
    '(click)': 'toggle()',
    '(keydown.space)': 'onSpace($event)',
  },
  template: `
    <span class="kp-checkbox__box">
      <svg class="kp-checkbox__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 12l5 5L20 7" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span class="kp-checkbox__minus" aria-hidden="true"></span>
    </span>
    @if (hasLabel) {
      <span class="kp-checkbox__label"><ng-content/></span>
    }
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      vertical-align: middle;
      line-height: 1;
      gap: 8px;
      cursor: pointer;
      user-select: none;
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
    }
    :host(.kp-checkbox--disabled) { cursor: not-allowed; }

    .kp-checkbox__box {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-sizing: border-box;
      width: var(--kp-checkbox-size);
      height: var(--kp-checkbox-size);
      border-radius: var(--kp-checkbox-radius);
      border: var(--kp-checkbox-border-width) solid var(--kp-checkbox-border, var(--kp-color-gray-300));
      background: var(--kp-checkbox-bg, var(--kp-color-white));
      transition:
        background var(--kp-motion-duration-fast, 100ms) ease,
        border-color var(--kp-motion-duration-fast, 100ms) ease;
    }

    .kp-checkbox__icon {
      position: absolute;
      width: 75%; height: 75%;
      color: var(--kp-checkbox-fg, var(--kp-color-white));
      opacity: 0;
      transition: opacity var(--kp-motion-duration-fast, var(--kp-motion-duration-fast)) ease;
    }
    .kp-checkbox__minus {
      position: absolute;
      background: var(--kp-checkbox-fg, var(--kp-color-white));
      border-radius: 1px;
      width: 50%;
      height: var(--kp-checkbox-minus-h, 2px);
      opacity: 0;
      transition: opacity var(--kp-motion-duration-fast, var(--kp-motion-duration-fast)) ease;
    }
    :host(.kp-checkbox--checked) .kp-checkbox__icon { opacity: 1; }
    :host(.kp-checkbox--indeterminate) .kp-checkbox__minus { opacity: 1; }

    :host(:hover:not(.kp-checkbox--disabled)),
    :host(.kp-checkbox--hover) {
      --kp-checkbox-border: var(--kp-checkbox-border-hover, var(--kp-color-gray-400));
    }
    :host(.kp-checkbox--active) {
      --kp-checkbox-border: var(--kp-checkbox-border-active, var(--kp-color-gray-500));
    }
    :host(:focus-visible),
    :host(.kp-checkbox--focus) {
      outline: 2px solid var(--kp-color-focus-ring, var(--kp-color-blue-400));
      outline-offset: 2px;
    }
    :host(.kp-checkbox--disabled) {
      --kp-checkbox-bg: var(--kp-color-gray-50);
      --kp-checkbox-border: var(--kp-color-gray-200);
    }
    :host(.kp-checkbox--error) {
      --kp-checkbox-border: var(--kp-color-red-500);
    }

    /* --- Checked / Indeterminate --- */
    :host(.kp-checkbox--checked),
    :host(.kp-checkbox--indeterminate) {
      --kp-checkbox-bg: var(--kp-checkbox-bg-checked, var(--kp-color-blue-600));
      --kp-checkbox-border: var(--kp-checkbox-bg-checked, var(--kp-color-blue-600));
    }
    :host(.kp-checkbox--checked:hover:not(.kp-checkbox--disabled)),
    :host(.kp-checkbox--checked.kp-checkbox--hover) {
      --kp-checkbox-bg: var(--kp-color-blue-700);
      --kp-checkbox-border: var(--kp-color-blue-700);
    }
    :host(.kp-checkbox--checked.kp-checkbox--active) {
      --kp-checkbox-bg: var(--kp-color-blue-800);
      --kp-checkbox-border: var(--kp-color-blue-800);
    }
    :host(.kp-checkbox--checked.kp-checkbox--disabled) {
      --kp-checkbox-bg: var(--kp-color-gray-400);
      --kp-checkbox-border: var(--kp-color-gray-400);
    }
    :host(.kp-checkbox--checked.kp-checkbox--error) {
      --kp-checkbox-bg: var(--kp-color-red-500);
      --kp-checkbox-border: var(--kp-color-red-500);
    }

    /* --- Danger color --- */
    :host(.kp-checkbox--danger.kp-checkbox--checked) {
      --kp-checkbox-bg: var(--kp-color-red-600);
      --kp-checkbox-border: var(--kp-color-red-600);
    }

    /* --- Sizes --- */
    :host(.kp-checkbox--sm) {
      --kp-checkbox-size: 16px;
      --kp-checkbox-radius: 4px;
      --kp-checkbox-border-width: 1px;
      --kp-checkbox-minus-h: 1.5px;
    }
    :host(.kp-checkbox--md) {
      --kp-checkbox-size: 20px;
      --kp-checkbox-radius: 6px;
      --kp-checkbox-border-width: 1.5px;
      --kp-checkbox-minus-h: 2px;
    }
    :host(.kp-checkbox--lg) {
      --kp-checkbox-size: 24px;
      --kp-checkbox-radius: 6px;
      --kp-checkbox-border-width: 1.5px;
      --kp-checkbox-minus-h: 2px;
    }

    .kp-checkbox__label {
      font-size: 14px;
      color: var(--kp-color-gray-700);
    }
  `]
})
export class KpCheckboxComponent implements ControlValueAccessor {
  @Input() size: KpCheckboxSize = 'md';
  @Input() color: KpCheckboxColor = 'primary';
  @Input() checked = false;
  @Input() indeterminate = false;
  @Input() disabled = false;
  @Input() forceState: KpState | null = null;
  @Input() hasLabel = true;
  /** Accessible name for screen readers when no visible label is projected. Falls through to projected text content otherwise. */
  @Input() ariaLabel: string | null = null;

  /** Use ariaLabel only when there's no visible label — otherwise the projected
   *  text becomes the accessible name automatically and a duplicate aria-label
   *  would shadow it. */
  get effectiveAriaLabel(): string | null {
    if (this.ariaLabel) return this.ariaLabel;
    return this.hasLabel ? null : 'Checkbox';
  }
  @Output() checkedChange = new EventEmitter<boolean>();

  get hostClasses(): string {
    const classes = [
      'kp-checkbox',
      `kp-checkbox--${this.size}`,
      `kp-checkbox--${this.color}`,
    ];
    if (this.indeterminate) classes.push('kp-checkbox--indeterminate');
    else if (this.checked) classes.push('kp-checkbox--checked');
    if (this.forceState) {
      classes.push(`kp-checkbox--${this.forceState}`);
    } else if (this.disabled) {
      classes.push('kp-checkbox--disabled');
    }
    return classes.join(' ');
  }

  toggle(): void {
    if (this.disabled) return;
    if (this.indeterminate) {
      this.indeterminate = false;
      this.checked = true;
    } else {
      this.checked = !this.checked;
    }
    this.onChange(this.checked);
    this.checkedChange.emit(this.checked);
    this.onTouched();
  }

  onSpace(event: Event): void {
    event.preventDefault();
    this.toggle();
  }

  onChange: (v: boolean) => void = () => { /* no-op */ };
  onTouched: () => void = () => { /* no-op */ };
  writeValue(v: boolean): void { this.checked = !!v; }
  registerOnChange(fn: (v: boolean) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(d: boolean): void { this.disabled = d; }
}
