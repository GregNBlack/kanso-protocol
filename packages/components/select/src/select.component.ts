import {
  AfterViewChecked,
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ElementRef,
  HostListener,
  OnDestroy,
  ViewChild,
  forwardRef,
  inject,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DOCUMENT } from '@angular/common';

import { KpSize, KpState } from '@kanso-protocol/core';

export interface KpSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/**
 * Kanso Protocol — Select Component
 *
 * Combines an Input-style trigger with a DropdownMenu panel. Supports
 * single and multiple selection, floating label (lg/xl), clear button,
 * and the standard 7-state model shared with Input.
 *
 * @example
 * <kp-select size="md" placeholder="Pick one" [options]="countries" [(ngModel)]="country"/>
 * <kp-select [multiple]="true" [options]="tags" [(ngModel)]="picked"/>
 */
@Component({
  selector: 'kp-select',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => KpSelectComponent),
      multi: true,
    },
  ],
  host: {
    '[class]': 'hostClasses',
    '[attr.aria-invalid]': 'forceState === "error" || null',
    '[attr.aria-disabled]': 'isDisabled || null',
  },
  template: `
    <button
      #trigger
      type="button"
      class="kp-select__trigger"
      [attr.aria-haspopup]="'listbox'"
      [attr.aria-expanded]="isOpen"
      [disabled]="isDisabled"
      (click)="toggle()">

      <span class="kp-select__field-wrap">
        <span class="kp-select__value" [class.kp-select__value--placeholder]="isPlaceholderShown()">
          {{ displayText() }}
        </span>
        @if (showFloatingLabel()) {
          <span class="kp-select__label" [class.kp-select__label--floated]="isLabelFloated()">
            {{ label }}
          </span>
        }
      </span>

      @if (showClear && hasValue() && !isDisabled) {
        <span
          class="kp-select__clear"
          role="button"
          aria-label="Clear selection"
          (click)="clear($event)"
          (mousedown)="$event.preventDefault()">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </span>
      }

      <span class="kp-select__chevron" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
    </button>

    @if (isOpen && !isDisabled) {
      <div #dropdown class="kp-select__dropdown" role="listbox" [attr.aria-multiselectable]="multiple || null">
        @for (opt of options; track opt.value) {
          <div
            class="kp-select__option"
            role="option"
            [class.kp-select__option--selected]="isSelected(opt)"
            [class.kp-select__option--disabled]="opt.disabled"
            [attr.aria-selected]="isSelected(opt)"
            [attr.aria-disabled]="opt.disabled || null"
            (click)="pick(opt, $event)">

            @if (multiple) {
              <span class="kp-select__check" aria-hidden="true">
                @if (isSelected(opt)) {
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12l5 5L20 7" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                }
              </span>
            }

            <span class="kp-select__option-label">{{ opt.label }}</span>

            @if (!multiple && isSelected(opt)) {
              <span class="kp-select__check-single" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12l5 5L20 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
            }
          </div>
        }
        @if (options.length === 0) {
          <div class="kp-select__empty">No options</div>
        }
      </div>
    }
  `,
  styles: [`
    :host {
      display: inline-flex;
      flex-direction: column;
      position: relative;
      width: 280px;
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
    }

    /* --- Trigger matches Input styling --- */
    .kp-select__trigger {
      display: inline-flex;
      align-items: stretch;
      box-sizing: border-box;
      width: 100%;
      border: 1px solid var(--kp-input-border, var(--kp-color-gray-300));
      border-radius: var(--kp-input-radius);
      background: var(--kp-input-bg, var(--kp-color-white));
      height: var(--kp-input-height);
      padding: 0 var(--kp-input-padding-x);
      gap: var(--kp-input-gap);
      font: inherit;
      color: var(--kp-input-fg, var(--kp-color-gray-900));
      text-align: start;
      cursor: pointer;
      transition:
        border-color var(--kp-motion-duration-fast, 100ms) ease,
        background var(--kp-motion-duration-fast, 100ms) ease;
    }

    :host(:not(.kp-select--disabled):not(.kp-select--error)) .kp-select__trigger:hover,
    :host(.kp-select--hover) .kp-select__trigger {
      border-color: var(--kp-input-border-hover, var(--kp-color-gray-400));
    }
    :host(:not(.kp-select--disabled):not(.kp-select--error)) .kp-select__trigger:focus-visible,
    :host(.kp-select--focus) .kp-select__trigger {
      border-color: var(--kp-input-border-focus, var(--kp-color-blue-600));
      outline: none;
    }
    :host(.kp-select--open) .kp-select__trigger,
    :host(.kp-select--active) .kp-select__trigger {
      border-color: var(--kp-input-border-focus, var(--kp-color-blue-600));
    }
    :host(.kp-select--disabled) .kp-select__trigger {
      background: var(--kp-input-bg-disabled, var(--kp-color-gray-50));
      border-color: var(--kp-input-border-disabled, var(--kp-color-gray-200));
      cursor: not-allowed;
    }
    :host(.kp-select--error) .kp-select__trigger {
      border-color: var(--kp-input-border-error, var(--kp-color-red-500));
    }

    .kp-select__field-wrap {
      position: relative;
      flex: 1;
      min-width: 0;
      display: flex;
      align-items: center;
    }

    .kp-select__value {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: var(--kp-input-font-size);
      line-height: var(--kp-input-line-height);
      font-weight: var(--kp-input-font-weight, 400);
    }
    .kp-select__value--placeholder {
      color: var(--kp-input-placeholder, var(--kp-color-gray-400));
    }
    :host(.kp-select--disabled) .kp-select__value {
      color: var(--kp-input-fg-disabled, var(--kp-color-gray-400));
    }

    /* --- Floating Label --- */
    .kp-select__label {
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      color: var(--kp-input-placeholder, var(--kp-color-gray-400));
      font-size: var(--kp-input-font-size);
      line-height: var(--kp-input-line-height);
      font-weight: var(--kp-input-font-weight, 400);
      pointer-events: none;
      transition:
        top var(--kp-motion-duration-fast, 150ms) ease,
        transform var(--kp-motion-duration-fast, 150ms) ease,
        font-size var(--kp-motion-duration-fast, 150ms) ease,
        color var(--kp-motion-duration-fast, 150ms) ease;
    }
    .kp-select__label--floated {
      top: 2px;
      transform: translateY(0);
      font-size: var(--kp-input-label-small-size, 10px);
      font-weight: 500;
      color: var(--kp-floating-label, var(--kp-color-gray-600));
    }
    :host(.kp-select--open) .kp-select__label--floated,
    :host(.kp-select--focus) .kp-select__label--floated {
      color: var(--kp-floating-label-focus, var(--kp-color-blue-600));
    }
    :host(.kp-select--error) .kp-select__label--floated {
      color: var(--kp-floating-label-error, var(--kp-color-red-500));
    }
    :host(.kp-select--floating) .kp-select__field-wrap {
      align-items: flex-end;
      padding-top: 14px;
      padding-bottom: 2px;
    }

    /* --- Clear --- */
    .kp-select__clear {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      align-self: center;
      flex-shrink: 0;
      width: var(--kp-input-clear-size, 20px);
      height: var(--kp-input-clear-size, 20px);
      padding: 2px;
      border-radius: 4px;
      background: transparent;
      color: var(--kp-color-gray-500);
      cursor: pointer;
      transition: background var(--kp-motion-duration-fast, 100ms) ease, color var(--kp-motion-duration-fast, 100ms) ease;
    }
    .kp-select__clear:hover { background: var(--kp-color-gray-100); color: var(--kp-color-gray-700); }
    .kp-select__clear svg { width: var(--kp-input-clear-icon, 14px); height: var(--kp-input-clear-icon, 14px); }
    :host(.kp-select--error) .kp-select__clear { color: var(--kp-color-red-600); }

    /* --- Chevron --- */
    .kp-select__chevron {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      color: var(--kp-select-chevron, var(--kp-color-gray-500));
      transition: transform var(--kp-motion-duration-fast, 150ms) ease, color var(--kp-motion-duration-fast, 150ms) ease;
    }
    :host(.kp-select--open) .kp-select__chevron {
      transform: rotate(180deg);
      color: var(--kp-select-chevron-open, var(--kp-color-blue-600));
    }
    :host(.kp-select--disabled) .kp-select__chevron {
      color: var(--kp-select-chevron-disabled, var(--kp-color-gray-300));
    }
    :host(.kp-select--error) .kp-select__chevron {
      color: var(--kp-select-chevron-error, var(--kp-color-red-500));
    }

    /* --- Dropdown panel (mirrors DropdownMenu) ---
       position:fixed + JS-set top/left/width so the dropdown escapes any
       ancestor overflow:hidden. It also gets physically portaled to <body>
       in ngAfterViewChecked so transformed ancestors don't reroot its
       containing block. */
    .kp-select__dropdown {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      max-height: 280px;
      padding: 4px;
      background: var(--kp-color-white);
      border: 1px solid var(--kp-color-gray-200);
      border-radius: 12px;
      box-shadow:
        0 4px 6px rgba(0, 0, 0, 0.05),
        0 10px 15px rgba(0, 0, 0, 0.10);
      overflow-y: auto;
      box-sizing: border-box;
      gap: 2px;
    }

    .kp-select__option {
      display: flex;
      align-items: center;
      gap: 8px;
      height: 32px;
      padding: 0 10px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      color: var(--kp-color-gray-900);
      cursor: pointer;
      user-select: none;
      transition: background var(--kp-motion-duration-fast, 100ms) ease;
    }
    .kp-select__option:hover:not(.kp-select__option--disabled) {
      background: var(--kp-color-gray-50);
    }
    .kp-select__option--selected {
      background: var(--kp-color-blue-50);
      color: var(--kp-color-blue-700);
    }
    .kp-select__option--selected .kp-select__check-single { color: var(--kp-color-blue-600); }
    .kp-select__option--disabled {
      color: var(--kp-color-gray-400);
      cursor: not-allowed;
    }

    .kp-select__option-label {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .kp-select__check,
    .kp-select__check-single {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      color: var(--kp-color-blue-600);
    }
    .kp-select__check {
      width: 16px;
      height: 16px;
      border: 1.5px solid var(--kp-color-gray-300);
      border-radius: 4px;
      background: var(--kp-color-white);
    }
    .kp-select__option--selected .kp-select__check {
      background: var(--kp-color-blue-600);
      border-color: var(--kp-color-blue-600);
      color: var(--kp-color-white);
    }

    .kp-select__empty {
      padding: 12px;
      font-size: 13px;
      color: var(--kp-color-gray-400);
      text-align: center;
    }

    /* === SIZE TOKENS (synced with Input) === */
    :host(.kp-select--xs) {
      --kp-input-height: 24px; --kp-input-radius: 8px; --kp-input-padding-x: 6px;
      --kp-input-font-size: 12px; --kp-input-line-height: 1.333;
      --kp-input-gap: 4px;
      --kp-input-clear-size: 16px; --kp-input-clear-icon: 12px;
    }
    :host(.kp-select--sm) {
      --kp-input-height: 28px; --kp-input-radius: 10px; --kp-input-padding-x: 8px;
      --kp-input-font-size: 14px; --kp-input-line-height: 1.428;
      --kp-input-gap: 5px;
      --kp-input-clear-size: 16px; --kp-input-clear-icon: 12px;
    }
    :host(.kp-select--md) {
      --kp-input-height: 36px; --kp-input-radius: 12px; --kp-input-padding-x: 12px;
      --kp-input-font-size: 16px; --kp-input-line-height: 1.5;
      --kp-input-gap: 6px;
      --kp-input-clear-size: 20px; --kp-input-clear-icon: 14px;
    }
    :host(.kp-select--lg) {
      --kp-input-height: 44px; --kp-input-radius: 14px; --kp-input-padding-x: 14px;
      --kp-input-font-size: 16px; --kp-input-line-height: 1.5;
      --kp-input-label-small-size: 10px;
      --kp-input-gap: 8px;
      --kp-input-clear-size: 24px; --kp-input-clear-icon: 16px;
    }
    :host(.kp-select--xl) {
      --kp-input-height: 52px; --kp-input-radius: 16px; --kp-input-padding-x: 16px;
      --kp-input-font-size: 20px; --kp-input-line-height: 1.4;
      --kp-input-font-weight: 500;
      --kp-input-label-small-size: 11px;
      --kp-input-gap: 8px;
      --kp-input-clear-size: 24px; --kp-input-clear-icon: 16px;
    }
  `]
})
export class KpSelectComponent implements ControlValueAccessor, AfterViewChecked, OnDestroy {
  @Input() size: KpSize = 'md';
  @Input() placeholder = '';
  @Input() label = '';
  @Input() floatingLabel = false;
  @Input() options: KpSelectOption[] = [];
  @Input() multiple = false;
  @Input() showClear = true;
  @Input() disabled = false;
  /** Force visual state for showcase/documentation purposes */
  @Input() forceState: KpState | null = null;

  @Output() openChange = new EventEmitter<boolean>();

  isOpen = false;
  private cvaDisabled = false;
  private singleValue: string | null = null;
  private multiValue: string[] = [];

  @ViewChild('dropdown') dropdownEl?: ElementRef<HTMLElement>;

  private readonly doc = inject(DOCUMENT);

  constructor(private host: ElementRef<HTMLElement>, private cdr: ChangeDetectorRef) {}

  ngAfterViewChecked(): void {
    if (!this.isOpen) return;
    const dd = this.dropdownEl?.nativeElement;
    // Portal to <body> so transformed / clipped ancestors can't catch the
    // dropdown. Fixed-positioning alone isn't enough — an ancestor with
    // `transform` re-roots the containing block for fixed descendants.
    if (dd && this.doc?.body && dd.parentElement !== this.doc.body) {
      this.doc.body.appendChild(dd);
    }
    this.positionDropdown();
  }

  ngOnDestroy(): void {
    // Guarded for SSR teardown — bare-metal platform-server has no `window`.
    if (typeof window !== 'undefined') {
      window.removeEventListener('scroll', this.reposition, true);
      window.removeEventListener('resize', this.reposition);
    }
    const dd = this.dropdownEl?.nativeElement;
    if (dd && dd.parentElement === this.doc?.body) dd.remove();
  }

  private readonly reposition = () => this.positionDropdown();

  private positionDropdown(): void {
    const dd = this.dropdownEl?.nativeElement;
    const trigger = this.host.nativeElement.querySelector('.kp-select__trigger') as HTMLElement | null;
    if (!dd || !trigger) return;
    const rect = trigger.getBoundingClientRect();
    dd.style.top = `${rect.bottom + 4}px`;
    dd.style.left = `${rect.left}px`;
    dd.style.width = `${rect.width}px`;
  }

  get isDisabled(): boolean {
    return this.disabled || this.cvaDisabled || this.forceState === 'disabled';
  }

  get supportsFloatingLabel(): boolean {
    return this.size === 'lg' || this.size === 'xl';
  }

  showFloatingLabel(): boolean {
    return this.floatingLabel && this.supportsFloatingLabel && !!this.label;
  }

  hasValue(): boolean {
    return this.multiple ? this.multiValue.length > 0 : this.singleValue !== null && this.singleValue !== '';
  }

  isPlaceholderShown(): boolean {
    if (this.showFloatingLabel() && !this.isLabelFloated()) return true;
    return !this.hasValue();
  }

  isLabelFloated(): boolean {
    return this.hasValue()
      || this.isOpen
      || this.forceState === 'focus'
      || this.forceState === 'active'
      || this.forceState === 'error';
  }

  displayText(): string {
    if (this.showFloatingLabel() && !this.isLabelFloated()) {
      return '';
    }
    if (this.multiple) {
      if (this.multiValue.length === 0) return this.placeholder;
      if (this.multiValue.length === 1) {
        return this.options.find(o => o.value === this.multiValue[0])?.label ?? this.multiValue[0];
      }
      return `Selected ${this.multiValue.length} out of ${this.options.length}`;
    }
    if (this.singleValue === null || this.singleValue === '') return this.placeholder;
    return this.options.find(o => o.value === this.singleValue)?.label ?? this.singleValue;
  }

  isSelected(opt: KpSelectOption): boolean {
    return this.multiple
      ? this.multiValue.includes(opt.value)
      : this.singleValue === opt.value;
  }

  toggle(): void {
    if (this.isDisabled) return;
    this.setOpen(!this.isOpen);
  }

  private setOpen(open: boolean): void {
    if (this.isOpen === open) return;
    this.isOpen = open;
    if (open) {
      window.addEventListener('scroll', this.reposition, true);
      window.addEventListener('resize', this.reposition);
    } else {
      window.removeEventListener('scroll', this.reposition, true);
      window.removeEventListener('resize', this.reposition);
    }
    this.openChange.emit(open);
    this.cdr.markForCheck();
  }

  pick(opt: KpSelectOption, event: Event): void {
    event.stopPropagation();
    if (opt.disabled) return;
    if (this.multiple) {
      const i = this.multiValue.indexOf(opt.value);
      this.multiValue = i >= 0
        ? this.multiValue.filter(v => v !== opt.value)
        : [...this.multiValue, opt.value];
      this.onChange(this.multiValue);
    } else {
      this.singleValue = opt.value;
      this.onChange(opt.value);
      this.setOpen(false);
    }
    this.onTouched();
  }

  clear(event: Event): void {
    event.stopPropagation();
    if (this.isDisabled) return;
    if (this.multiple) {
      this.multiValue = [];
      this.onChange(this.multiValue);
    } else {
      this.singleValue = null;
      this.onChange(null);
    }
  }

  get hostClasses(): string {
    const classes = ['kp-select', `kp-select--${this.size}`];
    if (this.showFloatingLabel()) classes.push('kp-select--floating');
    if (this.isOpen) classes.push('kp-select--open');
    if (this.forceState) {
      classes.push(`kp-select--${this.forceState}`);
    } else if (this.isDisabled) {
      classes.push('kp-select--disabled');
    }
    return classes.join(' ');
  }

  @HostListener('document:click', ['$event'])
  onDocClick(event: Event): void {
    if (!this.isOpen) return;
    const target = event.target as Node;
    const inHost = this.host.nativeElement.contains(target);
    const dd = this.dropdownEl?.nativeElement;
    const inDropdown = dd ? dd.contains(target) : false;
    if (!inHost && !inDropdown) this.setOpen(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen) this.setOpen(false);
  }

  // ControlValueAccessor
  onChange: (value: string | string[] | null) => void = () => { /* no-op */ };
  onTouched: () => void = () => { /* no-op */ };

  writeValue(value: string | string[] | null): void {
    if (this.multiple) {
      this.multiValue = Array.isArray(value) ? [...value] : [];
    } else {
      this.singleValue = typeof value === 'string' ? value : null;
    }
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: string | string[] | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled = isDisabled;
  }
}
