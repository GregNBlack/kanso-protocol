import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  forwardRef,
  Injectable,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Kanso Protocol — Radio Group
 *
 * Container that coordinates a set of kp-radio elements. Selecting one
 * automatically deselects the others. Integrates with Reactive/Template forms.
 *
 * @example
 * <kp-radio-group [(value)]="selected" name="plan">
 *   <kp-radio value="free">Free</kp-radio>
 *   <kp-radio value="pro">Pro</kp-radio>
 *   <kp-radio value="team">Team</kp-radio>
 * </kp-radio-group>
 */
@Component({
  selector: 'kp-radio-group',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => KpRadioGroupComponent),
      multi: true,
    },
  ],
  host: {
    '[attr.role]': '"radiogroup"',
    '[attr.aria-disabled]': 'disabled || null',
  },
  template: `<ng-content/>`,
  styles: [`
    :host {
      display: inline-flex;
      flex-direction: column;
      gap: 12px;
    }
    :host([orientation="horizontal"]) {
      flex-direction: row;
      gap: 16px;
    }
  `],
})
export class KpRadioGroupComponent implements ControlValueAccessor {
  @Input() value: unknown = null;
  @Input() name = '';
  @Input() disabled = false;
  @Input() orientation: 'vertical' | 'horizontal' = 'vertical';
  @Output() valueChange = new EventEmitter<unknown>();

  private radios = new Set<{ value: unknown; setChecked: (c: boolean) => void }>();

  constructor(private cdr: ChangeDetectorRef) {}

  register(radio: { value: unknown; setChecked: (c: boolean) => void }): void {
    this.radios.add(radio);
    radio.setChecked(radio.value === this.value);
  }

  unregister(radio: { value: unknown; setChecked: (c: boolean) => void }): void {
    this.radios.delete(radio);
  }

  select(value: unknown): void {
    if (this.disabled) return;
    this.value = value;
    for (const r of this.radios) r.setChecked(r.value === value);
    this.cvaChange(value);
    this.valueChange.emit(value);
    this.onTouched();
    this.cdr.markForCheck();
  }

  isChecked(value: unknown): boolean {
    return this.value === value;
  }

  // ControlValueAccessor
  cvaChange: (v: unknown) => void = () => { /* no-op */ };
  onTouched: () => void = () => { /* no-op */ };
  writeValue(v: unknown): void {
    this.value = v;
    for (const r of this.radios) r.setChecked(r.value === v);
    this.cdr.markForCheck();
  }
  registerOnChange(fn: (v: unknown) => void): void { this.cvaChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(d: boolean): void {
    this.disabled = d;
    this.cdr.markForCheck();
  }
}
