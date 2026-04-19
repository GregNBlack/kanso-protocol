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

export type KpToggleSize = 'sm' | 'md' | 'lg';
export type KpToggleColor = 'primary' | 'danger';

/**
 * Kanso Protocol — Toggle (Switch) Component
 *
 * @example
 * <kp-toggle [(on)]="isOn" size="md">Notifications</kp-toggle>
 */
@Component({
  selector: 'kp-toggle',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => KpToggleComponent),
      multi: true,
    },
  ],
  host: {
    '[class]': 'hostClasses',
    '[attr.role]': '"switch"',
    '[attr.aria-checked]': 'on',
    '[attr.aria-disabled]': 'disabled || null',
    '[attr.tabindex]': 'disabled ? -1 : 0',
    '(click)': 'toggle()',
    '(keydown.space)': 'onSpace($event)',
  },
  template: `
    <span class="kp-toggle__track">
      <span class="kp-toggle__thumb" aria-hidden="true"></span>
    </span>
    @if (hasLabel) {
      <span class="kp-toggle__label"><ng-content/></span>
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
    :host(.kp-toggle--disabled) { cursor: not-allowed; }

    .kp-toggle__track {
      position: relative;
      display: inline-block;
      flex-shrink: 0;
      box-sizing: border-box;
      width: var(--kp-toggle-track-w);
      height: var(--kp-toggle-track-h);
      border-radius: var(--kp-toggle-track-h);
      background: var(--kp-toggle-track-bg, #D4D4D8);
      transition: background var(--kp-motion-duration-fast, 150ms) ease;
    }

    .kp-toggle__thumb {
      position: absolute;
      top: var(--kp-toggle-offset);
      left: var(--kp-toggle-offset);
      width: var(--kp-toggle-thumb);
      height: var(--kp-toggle-thumb);
      border-radius: 50%;
      background: #FFFFFF;
      box-shadow: 0 1px 2px rgba(0,0,0,0.1);
      transition: left var(--kp-motion-duration-fast, 150ms) ease;
    }

    :host(.kp-toggle--on) .kp-toggle__thumb {
      left: calc(100% - var(--kp-toggle-thumb) - var(--kp-toggle-offset));
    }

    :host(.kp-toggle--on) {
      --kp-toggle-track-bg: #2563EB;
    }
    :host(.kp-toggle--on:hover:not(.kp-toggle--disabled)),
    :host(.kp-toggle--on.kp-toggle--hover) {
      --kp-toggle-track-bg: #1D4ED8;
    }
    :host(.kp-toggle--on.kp-toggle--active) { --kp-toggle-track-bg: #1E40AF; }
    :host(.kp-toggle--on.kp-toggle--disabled) { --kp-toggle-track-bg: #A1A1AA; }
    :host(.kp-toggle--on.kp-toggle--error) { --kp-toggle-track-bg: #EF4444; }

    :host(:hover:not(.kp-toggle--disabled):not(.kp-toggle--on)),
    :host(.kp-toggle--hover:not(.kp-toggle--on)) {
      --kp-toggle-track-bg: #A1A1AA;
    }
    :host(:focus-visible),
    :host(.kp-toggle--focus) {
      outline: 2px solid var(--kp-color-focus-ring, #60A5FA);
      outline-offset: 2px;
      border-radius: var(--kp-toggle-track-h);
    }
    :host(.kp-toggle--disabled:not(.kp-toggle--on)) {
      --kp-toggle-track-bg: #E4E4E7;
    }
    :host(.kp-toggle--error:not(.kp-toggle--on)) {
      --kp-toggle-track-bg: #EF4444;
    }

    :host(.kp-toggle--danger.kp-toggle--on) {
      --kp-toggle-track-bg: #DC2626;
    }

    /* Sizes */
    :host(.kp-toggle--sm) {
      --kp-toggle-track-w: 28px; --kp-toggle-track-h: 16px;
      --kp-toggle-thumb: 12px; --kp-toggle-offset: 2px;
    }
    :host(.kp-toggle--md) {
      --kp-toggle-track-w: 36px; --kp-toggle-track-h: 20px;
      --kp-toggle-thumb: 16px; --kp-toggle-offset: 2px;
    }
    :host(.kp-toggle--lg) {
      --kp-toggle-track-w: 44px; --kp-toggle-track-h: 24px;
      --kp-toggle-thumb: 20px; --kp-toggle-offset: 2px;
    }

    .kp-toggle__label {
      font-size: 14px;
      color: #3F3F46;
    }
  `]
})
export class KpToggleComponent implements ControlValueAccessor {
  @Input() size: KpToggleSize = 'md';
  @Input() color: KpToggleColor = 'primary';
  @Input() on = false;
  @Input() disabled = false;
  @Input() forceState: KpState | null = null;
  @Input() hasLabel = true;
  @Output() onChangeEvent = new EventEmitter<boolean>();

  get hostClasses(): string {
    const classes = ['kp-toggle', `kp-toggle--${this.size}`, `kp-toggle--${this.color}`];
    if (this.on) classes.push('kp-toggle--on');
    if (this.forceState) {
      classes.push(`kp-toggle--${this.forceState}`);
    } else if (this.disabled) {
      classes.push('kp-toggle--disabled');
    }
    return classes.join(' ');
  }

  toggle(): void {
    if (this.disabled) return;
    this.on = !this.on;
    this.cvaChange(this.on);
    this.onChangeEvent.emit(this.on);
    this.onTouched();
  }

  onSpace(event: Event): void {
    event.preventDefault();
    this.toggle();
  }

  cvaChange: (v: boolean) => void = () => { /* no-op */ };
  onTouched: () => void = () => { /* no-op */ };
  writeValue(v: boolean): void { this.on = !!v; }
  registerOnChange(fn: (v: boolean) => void): void { this.cvaChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(d: boolean): void { this.disabled = d; }
}
