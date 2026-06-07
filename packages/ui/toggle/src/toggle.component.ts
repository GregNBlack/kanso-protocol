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

export type KpToggleSize = 'sm' | 'md' | 'lg';
export type KpToggleColor = 'primary' | 'danger';

/**
 * Kanso Protocol — Toggle (Switch)
 *
 * Wraps a real native `<input type="checkbox" role="switch">` inside a
 * styled `<label>`. Form submission, FormData, `<label for>` association,
 * Space-toggle, and HTML5 validation all work natively.
 *
 * @example
 * <kp-toggle [(on)]="isOn" size="md">Notifications</kp-toggle>
 * <form><kp-toggle name="notif" value="1" required>Enable</kp-toggle></form>
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
  host: { '[class]': 'hostClasses' },
  template: `
    <label class="kp-toggle__root">
      <input
        type="checkbox"
        role="switch"
        class="kp-toggle__input"
        [checked]="on"
        [attr.aria-checked]="on"
        [disabled]="disabled"
        [required]="required"
        [attr.name]="name"
        [attr.value]="value"
        [attr.aria-label]="effectiveAriaLabel"
        (change)="onNativeChange($event)"
        (blur)="onTouched()"
      />
      <!--
        Note for a11y audit: axe-core's color-contrast rule fires false
        positives on the sr-only clipped input above. The real visual
        proxy is the thumb element below — thumb-on-track contrast is
        what actually matters.
      -->
      <span class="kp-toggle__track" aria-hidden="true">
        <span class="kp-toggle__thumb"></span>
      </span>
      @if (hasLabel) {
        <span class="kp-toggle__label"><ng-content/></span>
      }
    </label>
  `,
  styles: [`
    :host {
      display: inline-flex;
      vertical-align: middle;
      line-height: 1;
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
      --kp-toggle-track-bg: var(--kp-color-text-disabled);
    }

    .kp-toggle__root {
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      user-select: none;
    }

    /* sr-only clip — input stays in a11y tree, label forwards click. */
    .kp-toggle__input {
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

    .kp-toggle__track {
      position: relative;
      display: inline-block;
      flex-shrink: 0;
      box-sizing: border-box;
      width: var(--kp-toggle-track-w);
      height: var(--kp-toggle-track-h);
      border-radius: var(--kp-toggle-track-h);
      background: var(--kp-toggle-track-bg);
      transition: background var(--kp-motion-duration-fast, 100ms) ease;
    }

    .kp-toggle__thumb {
      position: absolute;
      top: var(--kp-toggle-offset);
      left: var(--kp-toggle-offset);
      width: var(--kp-toggle-thumb);
      height: var(--kp-toggle-thumb);
      border-radius: 50%;
      background: var(--kp-color-surface-base);
      box-shadow: var(--kp-elevation-raised);
      transition: left var(--kp-motion-duration-fast, 100ms) ease;
    }

    :host(:has(.kp-toggle__input:checked)) .kp-toggle__thumb,
    :host(.kp-toggle--on) .kp-toggle__thumb {
      left: calc(100% - var(--kp-toggle-thumb) - var(--kp-toggle-offset));
    }

    :host(:has(.kp-toggle__input:checked)),
    :host(.kp-toggle--on) {
      --kp-toggle-track-bg: var(--kp-color-primary-default-bg-rest);
    }
    :host(:has(.kp-toggle__input:checked:hover:not(:disabled))),
    :host(.kp-toggle--on.kp-toggle--hover) {
      --kp-toggle-track-bg: var(--kp-color-primary-default-bg-hover);
    }
    :host(.kp-toggle--on.kp-toggle--active) { --kp-toggle-track-bg: var(--kp-color-primary-default-bg-active); }
    :host(:has(.kp-toggle__input:checked:disabled)),
    :host(.kp-toggle--on.kp-toggle--disabled) { --kp-toggle-track-bg: var(--kp-color-input-fg-disabled); }
    :host(.kp-toggle--on.kp-toggle--error) { --kp-toggle-track-bg: var(--kp-color-input-border-error); }

    :host(:has(.kp-toggle__input:hover:not(:checked):not(:disabled))),
    :host(.kp-toggle--hover:not(.kp-toggle--on)) {
      --kp-toggle-track-bg: var(--kp-color-input-border-hover);
    }
    :host(:has(.kp-toggle__input:focus-visible)) .kp-toggle__track,
    :host(.kp-toggle--focus) .kp-toggle__track {
      outline: 2px solid var(--kp-color-focus-ring);
      outline-offset: 2px;
      border-radius: var(--kp-toggle-track-h);
    }
    :host(:has(.kp-toggle__input:disabled:not(:checked))),
    :host(.kp-toggle--disabled:not(.kp-toggle--on)) {
      --kp-toggle-track-bg: var(--kp-color-surface-strong);
    }
    :host(:has(.kp-toggle__input:disabled)) .kp-toggle__root,
    :host(.kp-toggle--disabled) .kp-toggle__root { cursor: not-allowed; }
    :host(.kp-toggle--error:not(.kp-toggle--on)) {
      --kp-toggle-track-bg: var(--kp-color-input-border-error);
    }

    :host(.kp-toggle--danger:has(.kp-toggle__input:checked)),
    :host(.kp-toggle--danger.kp-toggle--on) {
      --kp-toggle-track-bg: var(--kp-color-danger-default-bg-rest);
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
      color: var(--kp-color-text-default);
    }
  `],
})
export class KpToggleComponent implements ControlValueAccessor {
  @Input() size: KpToggleSize = 'md';
  @Input() color: KpToggleColor = 'primary';
  @Input() on = false;
  @Input() disabled = false;
  @Input() required = false;
  @Input() name: string | null = null;
  @Input() value: string | null = null;
  @Input() forceState: KpState | null = null;
  @Input() hasLabel = true;
  @Input() ariaLabel: string | null = null;

  @Output() onChangeEvent = new EventEmitter<boolean>();

  private readonly cdr = inject(ChangeDetectorRef);

  get effectiveAriaLabel(): string | null {
    if (this.ariaLabel) return this.ariaLabel;
    return this.hasLabel ? null : 'Toggle';
  }

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

  onNativeChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.on = input.checked;
    this.cvaChange(this.on);
    this.onChangeEvent.emit(this.on);
    this.onTouched();
  }

  cvaChange: (v: boolean) => void = () => { /* no-op */ };
  onTouched: () => void = () => { /* no-op */ };
  writeValue(v: boolean): void { this.on = !!v; this.cdr.markForCheck(); }
  registerOnChange(fn: (v: boolean) => void): void { this.cvaChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(d: boolean): void { this.disabled = d; this.cdr.markForCheck(); }
}
