import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  forwardRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { KpSize, KpState } from '@kanso-protocol/core';
import { KpButtonComponent } from '@kanso-protocol/button';

/**
 * Kanso Protocol — NumberStepper Component
 *
 * Numeric input with − and + controls integrated into one rounded container.
 * Mirrors Input's size grammar so a NumberStepper sits flush next to an Input
 * of the same size in a form row.
 *
 * @example
 * <kp-number-stepper [(ngModel)]="qty" [min]="0" [max]="10"/>
 * <kp-number-stepper size="lg" [(ngModel)]="weight" suffix="kg"/>
 */
@Component({
  selector: 'kp-number-stepper',
  imports: [KpButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => KpNumberStepperComponent),
      multi: true,
    },
  ],
  host: {
    '[class]': 'hostClasses',
    '[attr.aria-disabled]': 'isDisabled || null',
    '[attr.aria-invalid]': 'forceState === "error" || null',
  },
  template: `
    <kp-button
      [size]="size"
      variant="ghost"
      color="neutral"
      [iconOnly]="true"
      [disabled]="isDisabled || atMin"
      class="kp-number-stepper__btn"
      aria-label="Decrease value"
      (click)="dec()">
      <svg kpButtonIconLeft viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </kp-button>

    <span class="kp-number-stepper__field">
      @if (prefix) {
        <span class="kp-number-stepper__affix">{{ prefix }}</span>
      }
      <input
        #inputEl
        class="kp-number-stepper__input"
        type="text"
        inputmode="numeric"
        [style.width]="inputWidth"
        [value]="displayValue"
        [disabled]="isDisabled"
        [attr.aria-label]="ariaLabel || null"
        (input)="onInputChange($event)"
        (blur)="onBlur()"
      />
      @if (suffix) {
        <span class="kp-number-stepper__affix">{{ suffix }}</span>
      }
    </span>

    <kp-button
      [size]="size"
      variant="ghost"
      color="neutral"
      [iconOnly]="true"
      [disabled]="isDisabled || atMax"
      class="kp-number-stepper__btn"
      aria-label="Increase value"
      (click)="inc()">
      <svg kpButtonIconLeft viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </kp-button>
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: stretch;
      box-sizing: border-box;
      border: 1px solid var(--kp-input-border, var(--kp-color-gray-300));
      border-radius: var(--kp-stepper-radius);
      background: var(--kp-input-bg, var(--kp-color-white));
      height: var(--kp-stepper-height);
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
      overflow: hidden;
      transition: border-color var(--kp-motion-duration-fast, var(--kp-motion-duration-fast)) ease;
    }

    :host(:hover:not(.kp-number-stepper--disabled):not(.kp-number-stepper--error)),
    :host(.kp-number-stepper--hover) {
      border-color: var(--kp-input-border-hover, var(--kp-color-gray-400));
    }
    :host(:focus-within:not(.kp-number-stepper--disabled):not(.kp-number-stepper--error)),
    :host(.kp-number-stepper--focus) {
      border-color: var(--kp-input-border-focus, var(--kp-color-blue-600));
    }
    :host(.kp-number-stepper--disabled) {
      background: var(--kp-input-bg-disabled, var(--kp-color-gray-50));
      border-color: var(--kp-input-border-disabled, var(--kp-color-gray-200));
      cursor: not-allowed;
    }
    :host(.kp-number-stepper--error) {
      border-color: var(--kp-input-border-error, var(--kp-color-red-500));
    }

    /* Buttons fit the host height — neutralise the Button's own border so it sits flush */
    .kp-number-stepper__btn {
      flex-shrink: 0;
      border-radius: 0;
      border: none;
    }
    .kp-number-stepper__btn:focus-visible {
      outline-offset: -2px;
    }

    .kp-number-stepper__field {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 0 var(--kp-stepper-pad-x);
      color: var(--kp-input-fg, var(--kp-color-gray-900));
      font-size: var(--kp-stepper-fs);
      line-height: var(--kp-stepper-lh);
      font-variant-numeric: tabular-nums;
    }

    .kp-number-stepper__affix {
      flex-shrink: 0;
      color: var(--kp-color-stepper-affix-color, var(--kp-color-gray-500));
      font-weight: 400;
      font-variant-numeric: tabular-nums;
    }

    /* Auto-sizing via inline [style.width]=Nch. Using 'ch' units (= width of
       the '0' glyph in the current font) matches tabular-nums perfectly —
       a value of length N takes exactly Nch. Width is bound to
       max(3, displayValue.length) ch. The native size attribute would
       under-estimate width for tabular-nums (it uses avg char width). */
    .kp-number-stepper__input {
      box-sizing: content-box;
      border: none;
      outline: none;
      background: transparent;
      color: inherit;
      font: inherit;
      font-weight: 500;
      font-variant-numeric: tabular-nums;
      text-align: center;
      /* 2px each side absorbs sub-pixel drift between CSS 'ch' and the real
         tabular-nums glyph width — without this, a 10+ digit value slips under
         the right button. Also reduces visible text jitter on width changes. */
      padding: 0 2px;
    }
    .kp-number-stepper__input:disabled {
      color: var(--kp-input-fg-disabled, var(--kp-color-gray-400));
      cursor: not-allowed;
    }

    /* === Sizes — synced with Figma NumberStepper === */
    :host(.kp-number-stepper--xs) {
      --kp-stepper-height: 24px; --kp-stepper-radius: 8px; --kp-stepper-pad-x: 4px;
      --kp-stepper-fs: 12px; --kp-stepper-lh: 16px;
    }
    :host(.kp-number-stepper--sm) {
      --kp-stepper-height: 28px; --kp-stepper-radius: 10px; --kp-stepper-pad-x: 6px;
      --kp-stepper-fs: 13px; --kp-stepper-lh: 18px;
    }
    :host(.kp-number-stepper--md) {
      --kp-stepper-height: 36px; --kp-stepper-radius: 12px; --kp-stepper-pad-x: 8px;
      --kp-stepper-fs: 14px; --kp-stepper-lh: 20px;
    }
    :host(.kp-number-stepper--lg) {
      --kp-stepper-height: 44px; --kp-stepper-radius: 14px; --kp-stepper-pad-x: 10px;
      --kp-stepper-fs: 16px; --kp-stepper-lh: 24px;
    }
    :host(.kp-number-stepper--xl) {
      --kp-stepper-height: 52px; --kp-stepper-radius: 16px; --kp-stepper-pad-x: 12px;
      --kp-stepper-fs: 18px; --kp-stepper-lh: 24px;
    }
  `],
})
export class KpNumberStepperComponent implements ControlValueAccessor {
  @Input() size: KpSize = 'md';
  @Input() min: number | null = null;
  @Input() max: number | null = null;
  @Input() step = 1;
  @Input() prefix = '';
  @Input() suffix = '';
  @Input() disabled = false;
  @Input() ariaLabel = '';
  /** Force visual state — Storybook / docs only */
  @Input() forceState: KpState | null = null;

  value: number | null = 1;
  private cvaDisabled = false;

  get isDisabled(): boolean {
    return this.disabled || this.cvaDisabled || this.forceState === 'disabled';
  }

  get atMin(): boolean {
    return this.min != null && this.value != null && this.value <= this.min;
  }

  get atMax(): boolean {
    return this.max != null && this.value != null && this.value >= this.max;
  }

  get displayValue(): string {
    return this.value === null ? '' : String(this.value);
  }

  /** Inline width in ch units: minimum 3 chars, grows with the value. */
  get inputWidth(): string {
    return `${Math.max(3, this.displayValue.length)}ch`;
  }

  get hostClasses(): string {
    const c = ['kp-number-stepper', `kp-number-stepper--${this.size}`];
    if (this.forceState) {
      c.push(`kp-number-stepper--${this.forceState}`);
    } else if (this.isDisabled) {
      c.push('kp-number-stepper--disabled');
    }
    return c.join(' ');
  }

  inc(): void {
    if (this.isDisabled || this.atMax) return;
    const base = this.value ?? 0;
    this.commit(base + this.step);
  }

  dec(): void {
    if (this.isDisabled || this.atMin) return;
    const base = this.value ?? 0;
    this.commit(base - this.step);
  }

  onInputChange(event: Event): void {
    const el = event.target as HTMLInputElement;
    const raw = el.value;
    // Strip everything except digits and a single leading minus sign.
    // Do this here (not via pattern/type=number) so paste, IME, and every
    // other input path is covered uniformly.
    let cleaned = '';
    for (const ch of raw) {
      if ((ch >= '0' && ch <= '9') || (ch === '-' && cleaned.length === 0)) {
        cleaned += ch;
      }
    }

    // Hard-block any input that would push the value past `max` — match the
    // behavior of the `+` button, which disables at the limit.
    // `min` is NOT enforced here: the user may be mid-typing toward a valid
    // value (e.g. typing "1" on the way to "10" when min=10). Min is clamped
    // on blur.
    if (cleaned !== '' && cleaned !== '-' && this.max != null) {
      const parsed = Number(cleaned);
      if (!Number.isNaN(parsed) && parsed > this.max) {
        // Reject — restore the previous displayValue in the DOM and bail.
        const prev = this.displayValue;
        el.value = prev;
        const caret = Math.min(el.selectionStart ?? prev.length, prev.length);
        el.setSelectionRange(caret, caret);
        return;
      }
    }

    if (cleaned !== raw) {
      const caret = Math.min(el.selectionStart ?? cleaned.length, cleaned.length);
      el.value = cleaned;
      el.setSelectionRange(caret, caret);
    }

    // Resize the input synchronously — BEFORE Angular CD runs.
    // If we relied only on the [style.width] template binding, the browser
    // would paint one frame where the value is new but the width is still
    // the previous value's, triggering its "scroll to show caret" behavior
    // and producing a visible 1-2px left/right text jitter.
    const len = Math.max(3, cleaned.length);
    el.style.width = `${len}ch`;

    if (cleaned === '' || cleaned === '-') {
      this.value = null;
      this.onChange(null);
      return;
    }
    const parsed = Number(cleaned);
    if (Number.isNaN(parsed)) return;
    // Do NOT clamp min during typing — the container grows to fit, and
    // clamping would make e.g. "10" → "1" → "10" feel like the input is
    // fighting the user. Min is applied on blur.
    this.value = parsed;
    this.onChange(parsed);
  }

  onBlur(): void {
    // Clamp on blur so the committed value always respects min/max.
    if (this.value !== null) this.commit(this.value);
    this.onTouched();
  }

  private commit(next: number): void {
    let v = next;
    if (this.min != null && v < this.min) v = this.min;
    if (this.max != null && v > this.max) v = this.max;
    this.value = v;
    this.onChange(v);
  }

  // ControlValueAccessor
  onChange: (v: number | null) => void = () => { /* no-op */ };
  onTouched: () => void = () => { /* no-op */ };

  writeValue(v: number | null): void {
    this.value = typeof v === 'number' ? v : null;
  }
  registerOnChange(fn: (v: number | null) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(d: boolean): void { this.cvaDisabled = d; }

  constructor(private cdr: ChangeDetectorRef) {}
}
