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
import { KpState } from '@kanso-protocol/core';
import { KpRadioGroupComponent } from './radio-group.component';

export type KpRadioSize = 'sm' | 'md' | 'lg';
export type KpRadioColor = 'primary' | 'danger';

/**
 * Kanso Protocol — Radio Component
 *
 * When placed inside <kp-radio-group>, clicking a radio updates the group's
 * value and deselects siblings. Outside a group, it behaves as a standalone
 * two-state control with its own CVA.
 *
 * Outer circle stays white when checked; only the border and inner dot become colored.
 *
 * @example
 * <kp-radio-group [(value)]="selected">
 *   <kp-radio value="a">Option A</kp-radio>
 *   <kp-radio value="b">Option B</kp-radio>
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
  host: {
    '[class]': 'hostClasses',
    '[attr.role]': '"radio"',
    '[attr.aria-checked]': 'checked',
    '[attr.aria-disabled]': 'isDisabled || null',
    '[attr.tabindex]': 'isDisabled ? -1 : 0',
    '(click)': 'select()',
    '(keydown.space)': 'onSpace($event)',
  },
  template: `
    <span class="kp-radio__box">
      <span class="kp-radio__dot" aria-hidden="true"></span>
    </span>
    @if (hasLabel) {
      <span class="kp-radio__label"><ng-content/></span>
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
    :host(.kp-radio--disabled) { cursor: not-allowed; }

    .kp-radio__box {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-sizing: border-box;
      width: var(--kp-radio-size);
      height: var(--kp-radio-size);
      border-radius: 50%;
      border: var(--kp-radio-border-width) solid var(--kp-radio-border, var(--kp-color-gray-300));
      background: var(--kp-radio-bg, var(--kp-color-white));
      transition: border-color var(--kp-motion-duration-fast, 100ms) ease;
    }

    .kp-radio__dot {
      width: var(--kp-radio-dot-size);
      height: var(--kp-radio-dot-size);
      border-radius: 50%;
      background: var(--kp-radio-dot-bg, var(--kp-color-blue-600));
      opacity: 0;
      transition: opacity var(--kp-motion-duration-fast, 100ms) ease;
    }
    :host(.kp-radio--checked) .kp-radio__dot { opacity: 1; }

    :host(:hover:not(.kp-radio--disabled)),
    :host(.kp-radio--hover) {
      --kp-radio-border: var(--kp-color-gray-400);
    }
    :host(.kp-radio--active) { --kp-radio-border: var(--kp-color-gray-500); }
    :host(:focus-visible),
    :host(.kp-radio--focus) {
      outline: 2px solid var(--kp-color-focus-ring, var(--kp-color-blue-400));
      outline-offset: 2px;
    }
    :host(.kp-radio--disabled) {
      --kp-radio-bg: var(--kp-color-gray-50);
      --kp-radio-border: var(--kp-color-gray-200);
    }
    :host(.kp-radio--error) { --kp-radio-border: var(--kp-color-red-500); }

    :host(.kp-radio--checked) {
      --kp-radio-border: var(--kp-color-blue-600);
      --kp-radio-dot-bg: var(--kp-color-blue-600);
    }
    :host(.kp-radio--checked:hover:not(.kp-radio--disabled)),
    :host(.kp-radio--checked.kp-radio--hover) {
      --kp-radio-border: var(--kp-color-blue-700);
      --kp-radio-dot-bg: var(--kp-color-blue-700);
    }
    :host(.kp-radio--checked.kp-radio--disabled) {
      --kp-radio-border: var(--kp-color-gray-400);
      --kp-radio-dot-bg: var(--kp-color-gray-400);
    }
    :host(.kp-radio--checked.kp-radio--error) {
      --kp-radio-border: var(--kp-color-red-500);
      --kp-radio-dot-bg: var(--kp-color-red-500);
    }

    :host(.kp-radio--danger.kp-radio--checked) {
      --kp-radio-border: var(--kp-color-red-600);
      --kp-radio-dot-bg: var(--kp-color-red-600);
    }

    :host(.kp-radio--sm) { --kp-radio-size: 16px; --kp-radio-border-width: 1px;   --kp-radio-dot-size: 6px; }
    :host(.kp-radio--md) { --kp-radio-size: 20px; --kp-radio-border-width: 1.5px; --kp-radio-dot-size: 8px; }
    :host(.kp-radio--lg) { --kp-radio-size: 24px; --kp-radio-border-width: 1.5px; --kp-radio-dot-size: 10px; }

    .kp-radio__label { font-size: 14px; color: var(--kp-color-gray-700); }
  `]
})
export class KpRadioComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() size: KpRadioSize = 'md';
  @Input() color: KpRadioColor = 'primary';
  @Input() value: unknown = null;
  @Input() checked = false;
  @Input() disabled = false;
  @Input() forceState: KpState | null = null;
  @Input() hasLabel = true;
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
    if (this.group && this.registration) {
      this.group.unregister(this.registration);
    }
  }

  get isDisabled(): boolean {
    return this.disabled || !!(this.group && this.group.disabled);
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

  select(): void {
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

  onSpace(event: Event): void {
    event.preventDefault();
    this.select();
  }

  onChange: (v: boolean) => void = () => { /* no-op */ };
  onTouched: () => void = () => { /* no-op */ };
  writeValue(v: boolean): void { this.checked = !!v; }
  registerOnChange(fn: (v: boolean) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(d: boolean): void { this.disabled = d; }
}
