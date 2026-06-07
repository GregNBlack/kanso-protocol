import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit,
  OnDestroy,
  Optional,
  SkipSelf,
  forwardRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { KpState } from '@kanso-protocol/ui';
import { KpRadioGroupComponent } from './radio-group.component';

export type KpRadioSize = 'sm' | 'md' | 'lg';
export type KpRadioColor = 'primary' | 'danger';

/**
 * Kanso Protocol — Radio
 *
 * Wraps a real native `<input type="radio">` inside a styled `<label>`.
 * Inside a `<kp-radio-group>`, radios share a `name` and the browser
 * enforces single-selection natively (no manual deselection logic).
 * In a `<form>`, FormData picks up the checked radio's value.
 *
 * @example
 * <kp-radio-group [(value)]="selected" name="plan">
 *   <kp-radio value="free">Free</kp-radio>
 *   <kp-radio value="pro">Pro</kp-radio>
 * </kp-radio-group>
 */
@Component({
  selector: 'kp-radio',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => KpRadioComponent),
      multi: true,
    },
  ],
  host: { '[class]': 'hostClasses' },
  template: `
    <label class="kp-radio__root">
      <input
        type="radio"
        class="kp-radio__input"
        [checked]="checked"
        [disabled]="isDisabled"
        [required]="required"
        [attr.name]="effectiveName"
        [attr.value]="stringValue"
        [attr.aria-label]="effectiveAriaLabel"
        (change)="onNativeChange()"
        (blur)="onTouched()"
      />
      <span class="kp-radio__box" aria-hidden="true">
        <span class="kp-radio__dot"></span>
      </span>
      @if (hasLabel) {
        <span class="kp-radio__label"><ng-content/></span>
      }
    </label>
  `,
  styles: [`
    :host {
      display: inline-flex;
      vertical-align: middle;
      line-height: 1;
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
      --kp-radio-border: var(--kp-color-checkbox-border-rest);
    }

    .kp-radio__root {
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      user-select: none;
    }

    /* sr-only clip — input stays in a11y tree (axe + screen readers see
       it as the radio); label-wrapping forwards click. */
    .kp-radio__input {
      position: absolute;
      width: 1px;
      height: 1px;
      margin: -1px;
      padding: 0;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
      border: 0;
    }

    .kp-radio__box {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-sizing: border-box;
      width: var(--kp-radio-size);
      height: var(--kp-radio-size);
      border-radius: 50%;
      border: var(--kp-radio-border-width) solid var(--kp-radio-border);
      background: var(--kp-radio-bg);
      transition: border-color var(--kp-motion-duration-fast, 100ms) ease;
    }

    .kp-radio__dot {
      width: var(--kp-radio-dot-size);
      height: var(--kp-radio-dot-size);
      border-radius: 50%;
      background: var(--kp-radio-dot-bg);
      opacity: 0;
      transition: opacity var(--kp-motion-duration-fast, 100ms) ease;
    }

    :host(:has(.kp-radio__input:checked)) .kp-radio__dot,
    :host(.kp-radio--checked) .kp-radio__dot { opacity: 1; }

    :host(:has(.kp-radio__input:hover:not(:disabled))),
    :host(.kp-radio--hover) {
      --kp-radio-border: var(--kp-color-input-border-hover);
    }
    :host(.kp-radio--active) { --kp-radio-border: var(--kp-color-text-muted); }
    :host(:has(.kp-radio__input:focus-visible)) .kp-radio__box,
    :host(.kp-radio--focus) .kp-radio__box {
      outline: 2px solid var(--kp-color-focus-ring);
      outline-offset: 2px;
    }
    :host(:has(.kp-radio__input:disabled)),
    :host(.kp-radio--disabled) {
      --kp-radio-bg: var(--kp-color-surface-subtle);
      --kp-radio-border: var(--kp-color-border-default);
    }
    :host(:has(.kp-radio__input:disabled)) .kp-radio__root,
    :host(.kp-radio--disabled) .kp-radio__root { cursor: not-allowed; }
    :host(.kp-radio--error) { --kp-radio-border: var(--kp-color-input-border-error); }

    :host(:has(.kp-radio__input:checked)),
    :host(.kp-radio--checked) {
      --kp-radio-border: var(--kp-color-primary-default-bg-rest);
      --kp-radio-dot-bg: var(--kp-color-primary-default-bg-rest);
    }
    :host(:has(.kp-radio__input:checked:hover:not(:disabled))),
    :host(.kp-radio--checked.kp-radio--hover) {
      --kp-radio-border: var(--kp-color-primary-default-bg-hover);
      --kp-radio-dot-bg: var(--kp-color-primary-default-bg-hover);
    }
    :host(:has(.kp-radio__input:checked:disabled)),
    :host(.kp-radio--checked.kp-radio--disabled) {
      --kp-radio-border: var(--kp-color-input-fg-disabled);
      --kp-radio-dot-bg: var(--kp-color-input-fg-disabled);
    }
    :host(.kp-radio--checked.kp-radio--error) {
      --kp-radio-border: var(--kp-color-input-border-error);
      --kp-radio-dot-bg: var(--kp-color-input-border-error);
    }

    :host(.kp-radio--danger:has(.kp-radio__input:checked)),
    :host(.kp-radio--danger.kp-radio--checked) {
      --kp-radio-border: var(--kp-color-danger-default-bg-rest);
      --kp-radio-dot-bg: var(--kp-color-danger-default-bg-rest);
    }

    :host(.kp-radio--sm) { --kp-radio-size: 16px; --kp-radio-border-width: 1px;   --kp-radio-dot-size: 6px; }
    :host(.kp-radio--md) { --kp-radio-size: 20px; --kp-radio-border-width: 1.5px; --kp-radio-dot-size: 8px; }
    :host(.kp-radio--lg) { --kp-radio-size: 24px; --kp-radio-border-width: 1.5px; --kp-radio-dot-size: 10px; }

    .kp-radio__label { font-size: 14px; color: var(--kp-color-text-default); }
  `],
})
export class KpRadioComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() size: KpRadioSize = 'md';
  @Input() color: KpRadioColor = 'primary';
  @Input() value: unknown = null;
  @Input() checked = false;
  @Input() disabled = false;
  @Input() required = false;
  @Input() name: string | null = null;
  @Input() forceState: KpState | null = null;
  @Input() hasLabel = true;
  @Input() ariaLabel: string | null = null;

  @Output() checkedChange = new EventEmitter<boolean>();

  private registration: { value: unknown; setChecked: (c: boolean) => void } | null = null;

  constructor(
    private cdr: ChangeDetectorRef,
    @Optional() @SkipSelf() public group: KpRadioGroupComponent | null,
  ) {}

  ngOnInit(): void {
    if (this.group) {
      this.registration = {
        value: this.value,
        setChecked: (c: boolean) => {
          if (this.checked !== c) {
            this.checked = c;
            this.cdr.markForCheck();
          }
        },
      };
      this.group.register(this.registration);
    }
  }

  ngOnDestroy(): void {
    if (this.group && this.registration) this.group.unregister(this.registration);
  }

  get isDisabled(): boolean {
    return this.disabled || !!(this.group && this.group.disabled);
  }

  get effectiveName(): string | null {
    return this.group?.name || this.name;
  }

  get stringValue(): string {
    return this.value == null ? '' : String(this.value);
  }

  get effectiveAriaLabel(): string | null {
    if (this.ariaLabel) return this.ariaLabel;
    return this.hasLabel ? null : 'Radio';
  }

  get hostClasses(): string {
    const classes = ['kp-radio', `kp-radio--${this.size}`, `kp-radio--${this.color}`];
    if (this.checked) classes.push('kp-radio--checked');
    if (this.forceState) {
      classes.push(`kp-radio--${this.forceState}`);
    } else if (this.isDisabled) {
      classes.push('kp-radio--disabled');
    }
    return classes.join(' ');
  }

  onNativeChange(): void {
    if (this.isDisabled) return;
    if (this.group) {
      this.group.select(this.value);
    } else {
      if (this.checked) return;
      this.checked = true;
      this.onChange(true);
      this.checkedChange.emit(true);
      this.onTouched();
    }
  }

  onChange: (v: boolean) => void = () => { /* no-op */ };
  onTouched: () => void = () => { /* no-op */ };
  writeValue(v: boolean): void { this.checked = !!v; this.cdr.markForCheck(); }
  registerOnChange(fn: (v: boolean) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(d: boolean): void { this.disabled = d; this.cdr.markForCheck(); }
}
