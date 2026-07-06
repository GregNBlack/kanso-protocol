import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  forwardRef,
  inject,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { KpState } from '@kanso-protocol/ui';

export type KpCheckboxSize = 'sm' | 'md' | 'lg';
export type KpCheckboxColor = 'primary' | 'danger';

/**
 * Kanso Protocol — Checkbox
 *
 * Wraps a real native `<input type="checkbox">` inside a styled `<label>`.
 * Form submission, FormData, `<label for>` association, password manager
 * autofill, native indeterminate, Space-toggle, and HTML5 validation
 * (`required`) all work without polyfills.
 *
 * @example
 * <kp-checkbox [(checked)]="isChecked" size="md">Remember me</kp-checkbox>
 * <kp-checkbox [indeterminate]="true">Select all</kp-checkbox>
 * <form><kp-checkbox name="agree" value="yes" required>I agree</kp-checkbox></form>
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
  host: { '[class]': 'hostClasses' },
  template: `
    <label class="kp-checkbox__root">
      <input
        type="checkbox"
        class="kp-checkbox__input"
        [checked]="checked"
        [indeterminate]="indeterminate"
        [disabled]="disabled"
        [required]="required"
        [attr.name]="name"
        [attr.value]="value"
        [attr.aria-label]="effectiveAriaLabel"
        [attr.aria-describedby]="ariaDescribedby"
        (change)="onNativeChange($event)"
        (blur)="onTouched()"
      />
      <span class="kp-checkbox__box" aria-hidden="true">
        <svg class="kp-checkbox__icon" viewBox="0 0 24 24" fill="none">
          <path d="M5 12l5 5L20 7" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="kp-checkbox__minus"></span>
      </span>
      @if (hasLabel) {
        <span class="kp-checkbox__label"><ng-content/></span>
      }
    </label>
  `,
  styles: [`
    :host {
      display: inline-flex;
      vertical-align: middle;
      line-height: 1;
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
      --kp-checkbox-border: var(--kp-color-checkbox-border-rest);
    }

    .kp-checkbox__root {
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      user-select: none;
    }

    /* Native input — clipped off-screen but still in the a11y tree and
       focusable. opacity:0 was hiding it from axe (which treated it as
       missing children of the radiogroup); clip-path keeps it visible
       to the platform / screen readers. Label-wrapping means click on
       the visual box still triggers the input natively. */
    .kp-checkbox__input {
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
      border: var(--kp-checkbox-border-width) solid var(--kp-checkbox-border);
      background: var(--kp-checkbox-bg);
      transition:
        background var(--kp-motion-duration-fast, 100ms) ease,
        border-color var(--kp-motion-duration-fast, 100ms) ease;
    }

    .kp-checkbox__icon {
      position: absolute;
      width: 75%; height: 75%;
      color: var(--kp-color-foreground-on-saturated);
      opacity: 0;
      transition: opacity var(--kp-motion-duration-fast, 100ms) ease;
    }
    .kp-checkbox__minus {
      position: absolute;
      background: var(--kp-color-foreground-on-saturated);
      border-radius: 1px;
      width: 50%;
      height: var(--kp-checkbox-minus-h, 2px);
      opacity: 0;
      transition: opacity var(--kp-motion-duration-fast, 100ms) ease;
    }

    /* State styling reacts directly to native input state via :has() —
       no JS-mirrored classes needed for hover/focus/checked. */
    :host(:has(.kp-checkbox__input:checked)) .kp-checkbox__icon { opacity: 1; }
    :host(:has(.kp-checkbox__input:indeterminate)) .kp-checkbox__minus { opacity: 1; }

    :host(:has(.kp-checkbox__input:hover:not(:disabled))),
    :host(.kp-checkbox--hover) {
      --kp-checkbox-border: var(--kp-color-checkbox-border-hover);
    }
    :host(.kp-checkbox--active) {
      --kp-checkbox-border: var(--kp-color-checkbox-border-hover);
    }
    :host(:has(.kp-checkbox__input:focus-visible)),
    :host(.kp-checkbox--focus) .kp-checkbox__box {
      outline: var(--kp-focus-ring-width) solid var(--kp-color-focus-ring);
      outline-offset: var(--kp-focus-ring-offset);
    }
    :host(:has(.kp-checkbox__input:disabled)),
    :host(.kp-checkbox--disabled) {
      --kp-checkbox-bg: var(--kp-color-surface-subtle);
      --kp-checkbox-border: var(--kp-color-border-default);
    }
    :host(:has(.kp-checkbox__input:disabled)) .kp-checkbox__root,
    :host(.kp-checkbox--disabled) .kp-checkbox__root { cursor: not-allowed; }
    :host(.kp-checkbox--error) {
      --kp-checkbox-border: var(--kp-color-input-border-error);
    }

    /* Checked / Indeterminate */
    :host(:has(.kp-checkbox__input:checked)),
    :host(:has(.kp-checkbox__input:indeterminate)),
    :host(.kp-checkbox--checked),
    :host(.kp-checkbox--indeterminate) {
      --kp-checkbox-bg: var(--kp-color-primary-default-bg-rest);
      --kp-checkbox-border: var(--kp-color-primary-default-bg-rest);
    }
    :host(:has(.kp-checkbox__input:checked:hover:not(:disabled))),
    :host(.kp-checkbox--checked.kp-checkbox--hover) {
      --kp-checkbox-bg: var(--kp-color-primary-default-bg-hover);
      --kp-checkbox-border: var(--kp-color-primary-default-bg-hover);
    }
    :host(.kp-checkbox--checked.kp-checkbox--active) {
      --kp-checkbox-bg: var(--kp-color-primary-default-bg-active);
      --kp-checkbox-border: var(--kp-color-primary-default-bg-active);
    }
    :host(:has(.kp-checkbox__input:checked:disabled)),
    :host(.kp-checkbox--checked.kp-checkbox--disabled) {
      --kp-checkbox-bg: var(--kp-color-input-fg-disabled);
      --kp-checkbox-border: var(--kp-color-input-fg-disabled);
    }
    :host(.kp-checkbox--checked.kp-checkbox--error) {
      --kp-checkbox-bg: var(--kp-color-input-border-error);
      --kp-checkbox-border: var(--kp-color-input-border-error);
    }

    /* Danger color */
    :host(.kp-checkbox--danger:has(.kp-checkbox__input:checked)),
    :host(.kp-checkbox--danger.kp-checkbox--checked) {
      --kp-checkbox-bg: var(--kp-color-danger-default-bg-rest);
      --kp-checkbox-border: var(--kp-color-danger-default-bg-rest);
    }

    /* Sizes */
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
      color: var(--kp-color-text-default);
    }

    /* Respect the OS reduced-motion setting: collapse transitions and
       decorative animation to effectively instant. */
    @media (prefers-reduced-motion: reduce) {
      :host,
      :host * {
        transition-duration: 0.01ms !important;
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        scroll-behavior: auto !important;
      }
    }

    /* Windows High Contrast — background-color is flattened, so the checked
       and indeterminate accent fill would vanish. Opt the box back in and
       repaint the fill + mark with system colors so state stays visible. */
    @media (forced-colors: active) {
      :host(:has(.kp-checkbox__input:focus-visible)) .kp-checkbox__box,
      :host(.kp-checkbox--focus) .kp-checkbox__box {
        outline: var(--kp-focus-ring-width) solid Highlight;
        outline-offset: var(--kp-focus-ring-offset);
      }
      :host(:has(.kp-checkbox__input:checked)) .kp-checkbox__box,
      :host(:has(.kp-checkbox__input:indeterminate)) .kp-checkbox__box,
      :host(.kp-checkbox--checked) .kp-checkbox__box,
      :host(.kp-checkbox--indeterminate) .kp-checkbox__box {
        forced-color-adjust: none;
        background: Highlight;
        border-color: Highlight;
      }
      :host(:has(.kp-checkbox__input:checked)) .kp-checkbox__icon,
      :host(.kp-checkbox--checked) .kp-checkbox__icon {
        color: HighlightText;
      }
      :host(:has(.kp-checkbox__input:indeterminate)) .kp-checkbox__minus,
      :host(.kp-checkbox--indeterminate) .kp-checkbox__minus {
        background: HighlightText;
      }
    }
  `],
})
export class KpCheckboxComponent implements ControlValueAccessor {
  @Input() size: KpCheckboxSize = 'md';
  @Input() color: KpCheckboxColor = 'primary';
  @Input() checked = false;
  @Input() indeterminate = false;
  @Input() disabled = false;
  @Input() required = false;
  @Input() name: string | null = null;
  @Input() value: string | null = null;
  @Input() forceState: KpState | null = null;
  @Input() hasLabel = true;
  @Input() ariaLabel: string | null = null;
  @Input() ariaDescribedby: string | null = null;

  @Output() checkedChange = new EventEmitter<boolean>();

  private readonly cdr = inject(ChangeDetectorRef);

  get effectiveAriaLabel(): string | null {
    if (this.ariaLabel) return this.ariaLabel;
    return this.hasLabel ? null : 'Checkbox';
  }

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

  onNativeChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.indeterminate = false;
    this.checked = input.checked;
    this.onChange(this.checked);
    this.checkedChange.emit(this.checked);
    this.onTouched();
  }

  onChange: (v: boolean) => void = () => { /* no-op */ };
  onTouched: () => void = () => { /* no-op */ };
  writeValue(v: boolean): void { this.checked = !!v; this.cdr.markForCheck(); }
  registerOnChange(fn: (v: boolean) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(d: boolean): void { this.disabled = d; this.cdr.markForCheck(); }
}
