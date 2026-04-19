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
    '(click)': 'toggle()',
    '(keydown.space)': 'onSpace($event)',
  },
  template: `
    <span class="kp-checkbox__box">
      @if (indeterminate) {
        <span class="kp-checkbox__minus" aria-hidden="true"></span>
      } @else if (checked) {
        <svg class="kp-checkbox__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M5 12l5 5L20 7" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      }
    </span>
    @if (hasLabel) {
      <span class="kp-checkbox__label"><ng-content/></span>
    }
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      user-select: none;
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
    }
    :host(.kp-checkbox--disabled) { cursor: not-allowed; }

    .kp-checkbox__box {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-sizing: border-box;
      width: var(--kp-checkbox-size);
      height: var(--kp-checkbox-size);
      border-radius: var(--kp-checkbox-radius);
      border: var(--kp-checkbox-border-width) solid var(--kp-checkbox-border, #D4D4D8);
      background: var(--kp-checkbox-bg, #FFFFFF);
      transition:
        background var(--kp-motion-duration-fast, 100ms) ease,
        border-color var(--kp-motion-duration-fast, 100ms) ease;
    }

    .kp-checkbox__icon { width: 75%; height: 75%; color: var(--kp-checkbox-fg, #FFFFFF); }
    .kp-checkbox__minus {
      display: block;
      background: var(--kp-checkbox-fg, #FFFFFF);
      border-radius: 1px;
      width: 50%;
      height: var(--kp-checkbox-minus-h, 2px);
    }

    :host(:hover:not(.kp-checkbox--disabled)),
    :host(.kp-checkbox--hover) {
      --kp-checkbox-border: var(--kp-checkbox-border-hover, #A1A1AA);
    }
    :host(.kp-checkbox--active) {
      --kp-checkbox-border: var(--kp-checkbox-border-active, #71717A);
    }
    :host(:focus-visible),
    :host(.kp-checkbox--focus) {
      outline: 2px solid var(--kp-color-focus-ring, #60A5FA);
      outline-offset: 2px;
    }
    :host(.kp-checkbox--disabled) {
      --kp-checkbox-bg: #FAFAFA;
      --kp-checkbox-border: #E4E4E7;
    }
    :host(.kp-checkbox--error) {
      --kp-checkbox-border: #EF4444;
    }

    /* --- Checked / Indeterminate --- */
    :host(.kp-checkbox--checked),
    :host(.kp-checkbox--indeterminate) {
      --kp-checkbox-bg: var(--kp-checkbox-bg-checked, #2563EB);
      --kp-checkbox-border: var(--kp-checkbox-bg-checked, #2563EB);
    }
    :host(.kp-checkbox--checked:hover:not(.kp-checkbox--disabled)),
    :host(.kp-checkbox--checked.kp-checkbox--hover) {
      --kp-checkbox-bg: #1D4ED8;
      --kp-checkbox-border: #1D4ED8;
    }
    :host(.kp-checkbox--checked.kp-checkbox--active) {
      --kp-checkbox-bg: #1E40AF;
      --kp-checkbox-border: #1E40AF;
    }
    :host(.kp-checkbox--checked.kp-checkbox--disabled) {
      --kp-checkbox-bg: #A1A1AA;
      --kp-checkbox-border: #A1A1AA;
    }
    :host(.kp-checkbox--checked.kp-checkbox--error) {
      --kp-checkbox-bg: #EF4444;
      --kp-checkbox-border: #EF4444;
    }

    /* --- Danger color --- */
    :host(.kp-checkbox--danger.kp-checkbox--checked) {
      --kp-checkbox-bg: #DC2626;
      --kp-checkbox-border: #DC2626;
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
      color: #3F3F46;
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
