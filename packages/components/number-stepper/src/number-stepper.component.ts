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
      <svg kpButtonIconLeft [attr.width]="iconSize" [attr.height]="iconSize" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </kp-button>

    <span class="kp-number-stepper__field">
      @if (prefix) {
        <span class="kp-number-stepper__affix">{{ prefix }}</span>
      }
      <span class="kp-number-stepper__input-wrap" [attr.data-value]="displayValue || ''">
        <input
          #inputEl
          class="kp-number-stepper__input"
          type="text"
          inputmode="numeric"
          [value]="displayValue"
          [disabled]="isDisabled"
          [attr.aria-label]="ariaLabel || null"
          (input)="onInputChange($event)"
          (blur)="onBlur()"
        />
      </span>
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
      <svg kpButtonIconLeft [attr.width]="iconSize" [attr.height]="iconSize" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </kp-button>
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: stretch;
      box-sizing: border-box;
      border: 1px solid var(--kp-input-border, #D4D4D8);
      border-radius: var(--kp-stepper-radius);
      background: var(--kp-input-bg, #FFFFFF);
      height: var(--kp-stepper-height);
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
      overflow: hidden;
      transition: border-color var(--kp-motion-duration-fast, 100ms) ease;
    }

    :host(:hover:not(.kp-number-stepper--disabled):not(.kp-number-stepper--error)),
    :host(.kp-number-stepper--hover) {
      border-color: var(--kp-input-border-hover, #A1A1AA);
    }
    :host(:focus-within:not(.kp-number-stepper--disabled):not(.kp-number-stepper--error)),
    :host(.kp-number-stepper--focus) {
      border-color: var(--kp-input-border-focus, #2563EB);
    }
    :host(.kp-number-stepper--disabled) {
      background: var(--kp-input-bg-disabled, #FAFAFA);
      border-color: var(--kp-input-border-disabled, #E4E4E7);
      cursor: not-allowed;
    }
    :host(.kp-number-stepper--error) {
      border-color: var(--kp-input-border-error, #EF4444);
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
      color: var(--kp-input-fg, #18181B);
      font-size: var(--kp-stepper-fs);
      line-height: var(--kp-stepper-lh);
      font-variant-numeric: tabular-nums;
    }

    .kp-number-stepper__affix {
      flex-shrink: 0;
      color: var(--kp-color-stepper-affix-color, #71717A);
      font-weight: 400;
      font-variant-numeric: tabular-nums;
    }

    /* Auto-sizing input wrap: ::after sizer mirrors the value (invisible) and
       sits in the same grid cell as the input. The cell — and therefore the
       input — hugs to the wider of (min-width, value width). */
    .kp-number-stepper__input-wrap {
      display: inline-grid;
      align-items: center;
      min-width: var(--kp-stepper-input-min-w);
    }
    .kp-number-stepper__input-wrap::after,
    .kp-number-stepper__input {
      grid-area: 1 / 1;
      width: 100%;
      min-width: 0;
      font: inherit;
      font-weight: 500;
      font-variant-numeric: tabular-nums;
      text-align: center;
      padding: 0;
    }
    .kp-number-stepper__input-wrap::after {
      content: attr(data-value);
      visibility: hidden;
      white-space: pre;
      pointer-events: none;
    }
    .kp-number-stepper__input {
      border: none;
      outline: none;
      background: transparent;
      color: inherit;
    }
    .kp-number-stepper__input:disabled {
      color: var(--kp-input-fg-disabled, #A1A1AA);
      cursor: not-allowed;
    }

    /* === Sizes — synced with Figma NumberStepper === */
    :host(.kp-number-stepper--xs) {
      --kp-stepper-height: 24px; --kp-stepper-radius: 8px; --kp-stepper-pad-x: 4px;
      --kp-stepper-fs: 12px; --kp-stepper-lh: 16px;
      --kp-stepper-input-min-w: 24px;
    }
    :host(.kp-number-stepper--sm) {
      --kp-stepper-height: 28px; --kp-stepper-radius: 10px; --kp-stepper-pad-x: 6px;
      --kp-stepper-fs: 13px; --kp-stepper-lh: 18px;
      --kp-stepper-input-min-w: 26px;
    }
    :host(.kp-number-stepper--md) {
      --kp-stepper-height: 36px; --kp-stepper-radius: 12px; --kp-stepper-pad-x: 8px;
      --kp-stepper-fs: 14px; --kp-stepper-lh: 20px;
      --kp-stepper-input-min-w: 28px;
    }
    :host(.kp-number-stepper--lg) {
      --kp-stepper-height: 44px; --kp-stepper-radius: 14px; --kp-stepper-pad-x: 10px;
      --kp-stepper-fs: 16px; --kp-stepper-lh: 24px;
      --kp-stepper-input-min-w: 32px;
    }
    :host(.kp-number-stepper--xl) {
      --kp-stepper-height: 52px; --kp-stepper-radius: 16px; --kp-stepper-pad-x: 12px;
      --kp-stepper-fs: 18px; --kp-stepper-lh: 24px;
      --kp-stepper-input-min-w: 34px;
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

  readonly iconSizeMap: Record<KpSize, number> = {
    xs: 14, sm: 16, md: 18, lg: 22, xl: 24,
  };

  get isDisabled(): boolean {
    return this.disabled || this.cvaDisabled || this.forceState === 'disabled';
  }

  get atMin(): boolean {
    return this.min !== null && this.value !== null && this.value <= this.min;
  }

  get atMax(): boolean {
    return this.max !== null && this.value !== null && this.value >= this.max;
  }

  get iconSize(): number {
    return this.iconSizeMap[this.size];
  }

  get displayValue(): string {
    return this.value === null ? '' : String(this.value);
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
    const raw = (event.target as HTMLInputElement).value.trim();
    if (raw === '') {
      this.value = null;
      this.onChange(null);
      return;
    }
    const parsed = Number(raw);
    if (Number.isNaN(parsed)) return;
    // Do NOT clamp during typing — the container grows to fit, and clamping
    // would make e.g. "10" → "1" → "10" feel like the input is fighting the user.
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
    if (this.min !== null && v < this.min) v = this.min;
    if (this.max !== null && v > this.max) v = this.max;
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
