import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  Output,
  ViewChild,
  forwardRef,
  inject,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DOCUMENT } from '@angular/common';

import { KpSize, KpState } from '@kanso-protocol/core';

export interface KpComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/**
 * Kanso Protocol — Combobox
 *
 * Select with an embedded text input for filtering. Type to narrow the
 * dropdown list; pick an option with click, `Enter`, or `Tab`. Supports
 * single and multi selection. Matches Input's size ramp so it composes
 * with other form controls.
 *
 * @example
 * <kp-combobox [options]="countries" [(ngModel)]="country"/>
 * <kp-combobox [multiple]="true" [options]="tags" [(ngModel)]="picked"/>
 */
@Component({
  selector: 'kp-combobox',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => KpComboboxComponent),
      multi: true,
    },
  ],
  host: {
    '[class]': 'hostClasses',
    '[attr.aria-invalid]': 'forceState === "error" || null',
    '[attr.aria-disabled]': 'isDisabled || null',
  },
  template: `
    <div class="kp-cb__trigger" (click)="onTriggerClick()">
      @if (multiple && multiValue.length > 0 && !isOpen) {
        <span class="kp-cb__summary">{{ summaryText() }}</span>
      }

      <input
        #input
        class="kp-cb__input"
        type="text"
        role="combobox"
        autocomplete="off"
        spellcheck="false"
        [attr.aria-autocomplete]="'list'"
        [attr.aria-expanded]="isOpen"
        [attr.aria-controls]="listboxId"
        [attr.aria-activedescendant]="activeDescendantId()"
        [attr.aria-label]="ariaLabel || null"
        [placeholder]="placeholderText()"
        [disabled]="isDisabled"
        [value]="inputValue"
        (input)="onInput($event)"
        (focus)="onFocus()"
        (keydown)="onKeyDown($event)"
      />

      @if (showClear && hasAnyValue() && !isDisabled) {
        <span
          class="kp-cb__clear"
          role="button"
          aria-label="Clear selection"
          (mousedown)="$event.preventDefault()"
          (click)="clear($event)"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </span>
      }

      <span class="kp-cb__chevron" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
    </div>

    @if (isOpen && !isDisabled) {
      <div #dropdown class="kp-cb__dropdown" role="listbox" [id]="listboxId" [attr.aria-multiselectable]="multiple || null">
        @for (opt of filteredOptions; track opt.value; let i = $index) {
          <div
            class="kp-cb__option"
            role="option"
            [id]="optionId(i)"
            [class.kp-cb__option--active]="i === activeIndex"
            [class.kp-cb__option--selected]="isSelected(opt)"
            [class.kp-cb__option--disabled]="opt.disabled"
            [attr.aria-selected]="isSelected(opt)"
            [attr.aria-disabled]="opt.disabled || null"
            (mousedown)="$event.preventDefault()"
            (mouseenter)="activeIndex = i"
            (click)="pick(opt)"
          >
            @if (multiple) {
              <span class="kp-cb__check" aria-hidden="true">
                @if (isSelected(opt)) {
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12l5 5L20 7" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                }
              </span>
            }

            <span class="kp-cb__option-label">
              @for (seg of highlight(opt.label); track $index) {
                @if (seg.match) { <mark>{{ seg.text }}</mark> } @else { {{ seg.text }} }
              }
            </span>

            @if (!multiple && isSelected(opt)) {
              <span class="kp-cb__check-single" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12l5 5L20 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
            }
          </div>
        }

        @if (filteredOptions.length === 0) {
          <div class="kp-cb__empty">{{ emptyMessage }}</div>
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

    .kp-cb__trigger {
      display: inline-flex;
      align-items: center;
      box-sizing: border-box;
      width: 100%;
      border: 1px solid var(--kp-input-border, #D4D4D8);
      border-radius: var(--kp-input-radius);
      background: var(--kp-input-bg, #FFFFFF);
      height: var(--kp-input-height);
      padding: 0 var(--kp-input-padding-x);
      gap: var(--kp-input-gap);
      cursor: text;
      transition:
        border-color var(--kp-motion-duration-fast, 100ms) ease,
        background var(--kp-motion-duration-fast, 100ms) ease;
    }
    :host(:not(.kp-cb--disabled):not(.kp-cb--error)) .kp-cb__trigger:hover,
    :host(.kp-cb--hover) .kp-cb__trigger {
      border-color: var(--kp-input-border-hover, #A1A1AA);
    }
    :host(.kp-cb--open) .kp-cb__trigger,
    :host(.kp-cb--active) .kp-cb__trigger,
    :host(.kp-cb--focus) .kp-cb__trigger,
    :host(:not(.kp-cb--disabled):not(.kp-cb--error)) .kp-cb__trigger:focus-within {
      border-color: var(--kp-input-border-focus, #2563EB);
    }
    :host(.kp-cb--disabled) .kp-cb__trigger {
      background: var(--kp-input-bg-disabled, #FAFAFA);
      border-color: var(--kp-input-border-disabled, #E4E4E7);
      cursor: not-allowed;
    }
    :host(.kp-cb--error) .kp-cb__trigger {
      border-color: var(--kp-input-border-error, #EF4444);
    }

    .kp-cb__input {
      flex: 1;
      min-width: 0;
      border: none;
      outline: none;
      background: transparent;
      font: inherit;
      font-size: var(--kp-input-font-size);
      line-height: var(--kp-input-line-height);
      font-weight: var(--kp-input-font-weight, 400);
      color: var(--kp-input-fg, #18181B);
      padding: 0;
    }
    .kp-cb__input::placeholder { color: var(--kp-input-placeholder, #A1A1AA); }
    .kp-cb__input:disabled { color: var(--kp-input-fg-disabled, #A1A1AA); cursor: not-allowed; }

    .kp-cb__summary {
      flex-shrink: 0;
      font-size: var(--kp-input-font-size);
      font-weight: 500;
      color: var(--kp-input-fg, #18181B);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 50%;
    }

    .kp-cb__clear {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: var(--kp-input-clear-size, 20px);
      height: var(--kp-input-clear-size, 20px);
      padding: 2px;
      border-radius: 4px;
      color: #71717A;
      cursor: pointer;
      transition: background var(--kp-motion-duration-fast, 100ms) ease, color var(--kp-motion-duration-fast, 100ms) ease;
    }
    .kp-cb__clear:hover { background: #F4F4F5; color: #3F3F46; }
    .kp-cb__clear svg { width: var(--kp-input-clear-icon, 14px); height: var(--kp-input-clear-icon, 14px); }

    .kp-cb__chevron {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      color: #71717A;
      transition: transform var(--kp-motion-duration-fast, 150ms) ease, color var(--kp-motion-duration-fast, 150ms) ease;
    }
    :host(.kp-cb--open) .kp-cb__chevron {
      transform: rotate(180deg);
      color: var(--kp-input-border-focus, #2563EB);
    }
    :host(.kp-cb--disabled) .kp-cb__chevron { color: #D4D4D8; }
    :host(.kp-cb--error) .kp-cb__chevron { color: #EF4444; }

    .kp-cb__dropdown {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      max-height: 280px;
      padding: 4px;
      background: #FFFFFF;
      border: 1px solid #E4E4E7;
      border-radius: 12px;
      box-shadow:
        0 4px 6px rgba(0, 0, 0, 0.05),
        0 10px 15px rgba(0, 0, 0, 0.10);
      overflow-y: auto;
      box-sizing: border-box;
      gap: 2px;
    }

    .kp-cb__option {
      display: flex;
      align-items: center;
      gap: 8px;
      height: 32px;
      padding: 0 10px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      color: #18181B;
      cursor: pointer;
      user-select: none;
      transition: background var(--kp-motion-duration-fast, 100ms) ease;
    }
    .kp-cb__option--active:not(.kp-cb__option--disabled) {
      background: #FAFAFA;
    }
    .kp-cb__option--selected {
      background: #EFF6FF;
      color: #1D4ED8;
    }
    .kp-cb__option--selected .kp-cb__check-single { color: #2563EB; }
    .kp-cb__option--disabled {
      color: #A1A1AA;
      cursor: not-allowed;
    }
    .kp-cb__option mark {
      background: var(--kp-color-combobox-highlight, #EFF6FF);
      color: inherit;
      border-radius: 2px;
      padding: 0 1px;
    }

    .kp-cb__option-label {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .kp-cb__check,
    .kp-cb__check-single {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      color: #2563EB;
    }
    .kp-cb__check {
      width: 16px;
      height: 16px;
      border: 1.5px solid #D4D4D8;
      border-radius: 4px;
      background: #FFFFFF;
    }
    .kp-cb__option--selected .kp-cb__check {
      background: #2563EB;
      border-color: #2563EB;
      color: #FFFFFF;
    }

    .kp-cb__empty {
      padding: 12px;
      font-size: 13px;
      color: #A1A1AA;
      text-align: center;
    }

    /* Size tokens — identical grammar to Input/Select */
    :host(.kp-cb--xs) {
      --kp-input-height: 24px; --kp-input-radius: 8px; --kp-input-padding-x: 6px;
      --kp-input-font-size: 12px; --kp-input-line-height: 1.333;
      --kp-input-gap: 4px;
      --kp-input-clear-size: 16px; --kp-input-clear-icon: 12px;
    }
    :host(.kp-cb--sm) {
      --kp-input-height: 28px; --kp-input-radius: 10px; --kp-input-padding-x: 8px;
      --kp-input-font-size: 14px; --kp-input-line-height: 1.428;
      --kp-input-gap: 5px;
      --kp-input-clear-size: 16px; --kp-input-clear-icon: 12px;
    }
    :host(.kp-cb--md) {
      --kp-input-height: 36px; --kp-input-radius: 12px; --kp-input-padding-x: 12px;
      --kp-input-font-size: 16px; --kp-input-line-height: 1.5;
      --kp-input-gap: 6px;
      --kp-input-clear-size: 20px; --kp-input-clear-icon: 14px;
    }
    :host(.kp-cb--lg) {
      --kp-input-height: 44px; --kp-input-radius: 14px; --kp-input-padding-x: 14px;
      --kp-input-font-size: 16px; --kp-input-line-height: 1.5;
      --kp-input-gap: 8px;
      --kp-input-clear-size: 24px; --kp-input-clear-icon: 16px;
    }
    :host(.kp-cb--xl) {
      --kp-input-height: 52px; --kp-input-radius: 16px; --kp-input-padding-x: 16px;
      --kp-input-font-size: 20px; --kp-input-line-height: 1.4;
      --kp-input-font-weight: 500;
      --kp-input-gap: 8px;
      --kp-input-clear-size: 24px; --kp-input-clear-icon: 16px;
    }
  `],
})
export class KpComboboxComponent implements ControlValueAccessor, AfterViewChecked, OnDestroy {
  private static idCounter = 0;
  private readonly uid = ++KpComboboxComponent.idCounter;

  @Input() size: KpSize = 'md';
  @Input() placeholder = 'Search or select…';
  @Input() emptyMessage = 'No results found';
  @Input() options: KpComboboxOption[] = [];
  @Input() multiple = false;
  @Input() showClear = true;
  @Input() disabled = false;
  @Input() ariaLabel = '';
  /** Force visual state for showcase/documentation purposes */
  @Input() forceState: KpState | null = null;

  @Output() readonly openChange = new EventEmitter<boolean>();
  @Output() readonly queryChange = new EventEmitter<string>();

  @ViewChild('input') inputEl?: ElementRef<HTMLInputElement>;
  @ViewChild('dropdown') dropdownEl?: ElementRef<HTMLElement>;

  /** @internal */ isOpen = false;
  /** @internal */ query = '';
  /** @internal */ activeIndex = 0;
  /** @internal */ multiValue: string[] = [];

  readonly listboxId = `kp-cb-listbox-${this.uid}`;

  private singleValue: string | null = null;
  private cvaDisabled = false;
  private readonly host = inject(ElementRef) as ElementRef<HTMLElement>;
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly doc = inject(DOCUMENT);

  get isDisabled(): boolean {
    return this.disabled || this.cvaDisabled || this.forceState === 'disabled';
  }

  get hostClasses(): string {
    const c = ['kp-cb', `kp-cb--${this.size}`];
    if (this.isOpen) c.push('kp-cb--open');
    if (this.forceState) c.push(`kp-cb--${this.forceState}`);
    else if (this.isDisabled) c.push('kp-cb--disabled');
    return c.join(' ');
  }

  /** The text currently shown inside the `<input>`. */
  get inputValue(): string {
    if (this.isOpen) return this.query;
    if (this.multiple) return '';
    if (this.singleValue === null) return '';
    return this.options.find((o) => o.value === this.singleValue)?.label ?? this.singleValue;
  }

  placeholderText(): string {
    if (!this.multiple && this.singleValue && !this.isOpen) return '';
    if (this.multiple && this.multiValue.length > 0 && !this.isOpen) return '';
    return this.placeholder;
  }

  summaryText(): string {
    if (this.multiValue.length === 1) {
      return this.options.find((o) => o.value === this.multiValue[0])?.label ?? this.multiValue[0];
    }
    return `${this.multiValue.length} selected`;
  }

  hasAnyValue(): boolean {
    return this.multiple ? this.multiValue.length > 0 : this.singleValue !== null && this.singleValue !== '';
  }

  isSelected(opt: KpComboboxOption): boolean {
    return this.multiple
      ? this.multiValue.includes(opt.value)
      : this.singleValue === opt.value;
  }

  get filteredOptions(): KpComboboxOption[] {
    const q = this.query.trim().toLowerCase();
    if (!q) return this.options;
    return this.options.filter((o) => o.label.toLowerCase().includes(q));
  }

  /** Splits a label into matched / unmatched segments for highlight rendering. */
  highlight(label: string): { text: string; match: boolean }[] {
    const q = this.query.trim();
    if (!q) return [{ text: label, match: false }];
    const segs: { text: string; match: boolean }[] = [];
    const lower = label.toLowerCase();
    const lowerQ = q.toLowerCase();
    let i = 0;
    while (i < label.length) {
      const hit = lower.indexOf(lowerQ, i);
      if (hit < 0) { segs.push({ text: label.slice(i), match: false }); break; }
      if (hit > i) segs.push({ text: label.slice(i, hit), match: false });
      segs.push({ text: label.slice(hit, hit + q.length), match: true });
      i = hit + q.length;
    }
    return segs;
  }

  optionId(i: number): string { return `kp-cb-opt-${this.uid}-${i}`; }
  activeDescendantId(): string | null {
    if (!this.isOpen || this.filteredOptions.length === 0) return null;
    return this.optionId(this.activeIndex);
  }

  onTriggerClick(): void {
    if (this.isDisabled) return;
    this.setOpen(true);
    this.inputEl?.nativeElement.focus();
  }

  onFocus(): void {
    if (this.isDisabled) return;
    if (!this.isOpen) this.setOpen(true);
  }

  onInput(event: Event): void {
    const el = event.target as HTMLInputElement;
    this.query = el.value;
    this.activeIndex = 0;
    if (!this.isOpen) this.setOpen(true);
    this.queryChange.emit(this.query);
    this.cdr.markForCheck();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (this.isDisabled) return;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!this.isOpen) { this.setOpen(true); return; }
        this.moveActive(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!this.isOpen) { this.setOpen(true); return; }
        this.moveActive(-1);
        break;
      case 'Home':
        if (this.isOpen) { event.preventDefault(); this.activeIndex = 0; this.cdr.markForCheck(); }
        break;
      case 'End':
        if (this.isOpen) {
          event.preventDefault();
          this.activeIndex = Math.max(0, this.filteredOptions.length - 1);
          this.cdr.markForCheck();
        }
        break;
      case 'Enter': {
        if (!this.isOpen) return;
        event.preventDefault();
        const opt = this.filteredOptions[this.activeIndex];
        if (opt && !opt.disabled) this.pick(opt);
        break;
      }
      case 'Escape':
        if (this.isOpen) { event.preventDefault(); this.setOpen(false); this.query = ''; this.cdr.markForCheck(); }
        break;
      case 'Backspace':
        // In multi mode, let backspace on an empty query pop the last selection.
        if (this.multiple && this.query === '' && this.multiValue.length > 0) {
          event.preventDefault();
          this.multiValue = this.multiValue.slice(0, -1);
          this.onChange(this.multiValue);
          this.cdr.markForCheck();
        }
        break;
    }
  }

  private moveActive(delta: number): void {
    const len = this.filteredOptions.length;
    if (len === 0) return;
    let next = this.activeIndex + delta;
    // Skip disabled options.
    for (let i = 0; i < len; i++) {
      const idx = ((next % len) + len) % len;
      if (!this.filteredOptions[idx].disabled) { this.activeIndex = idx; break; }
      next += delta;
    }
    this.cdr.markForCheck();
  }

  pick(opt: KpComboboxOption): void {
    if (opt.disabled) return;
    if (this.multiple) {
      const i = this.multiValue.indexOf(opt.value);
      this.multiValue = i >= 0
        ? this.multiValue.filter((v) => v !== opt.value)
        : [...this.multiValue, opt.value];
      this.onChange(this.multiValue);
      this.query = '';
      this.queryChange.emit('');
      this.inputEl?.nativeElement.focus();
    } else {
      this.singleValue = opt.value;
      this.onChange(opt.value);
      this.query = '';
      this.setOpen(false);
    }
    this.onTouched();
    this.cdr.markForCheck();
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
    this.query = '';
    this.cdr.markForCheck();
  }

  private setOpen(open: boolean): void {
    if (this.isOpen === open) return;
    this.isOpen = open;
    if (!open) this.query = '';
    else this.activeIndex = Math.max(0, this.findFirstEnabledIndex());
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

  ngAfterViewChecked(): void {
    if (!this.isOpen) return;
    const dd = this.dropdownEl?.nativeElement;
    // Portal the dropdown to <body> so it escapes any transformed / clipped
    // ancestor (Storybook docs containers, modal panels, etc.). Fixed
    // positioning alone isn't enough — an ancestor with `transform` reroots
    // the containing block for fixed-positioned descendants.
    if (dd && this.doc?.body && dd.parentElement !== this.doc.body) {
      this.doc.body.appendChild(dd);
    }
    this.positionDropdown();
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.reposition, true);
    window.removeEventListener('resize', this.reposition);
    const dd = this.dropdownEl?.nativeElement;
    if (dd && dd.parentElement === this.doc?.body) dd.remove();
  }

  private readonly reposition = () => this.positionDropdown();

  private positionDropdown(): void {
    const dd = this.dropdownEl?.nativeElement;
    const trigger = this.host.nativeElement.querySelector('.kp-cb__trigger') as HTMLElement | null;
    if (!dd || !trigger) return;
    const rect = trigger.getBoundingClientRect();
    dd.style.top = `${rect.bottom + 4}px`;
    dd.style.left = `${rect.left}px`;
    dd.style.width = `${rect.width}px`;
  }

  private findFirstEnabledIndex(): number {
    return this.filteredOptions.findIndex((o) => !o.disabled);
  }

  @HostListener('document:click', ['$event'])
  onDocClick(event: MouseEvent): void {
    if (!this.isOpen) return;
    const target = event.target as Node;
    const inHost = this.host.nativeElement.contains(target);
    const dd = this.dropdownEl?.nativeElement;
    const inDropdown = dd ? dd.contains(target) : false;
    if (!inHost && !inDropdown) this.setOpen(false);
  }

  // ControlValueAccessor
  private onChange: (v: string | string[] | null) => void = () => { /* no-op */ };
  private onTouched: () => void = () => { /* no-op */ };

  writeValue(value: string | string[] | null): void {
    if (this.multiple) {
      this.multiValue = Array.isArray(value) ? [...value] : [];
    } else {
      this.singleValue = typeof value === 'string' ? value : null;
    }
    this.cdr.markForCheck();
  }
  registerOnChange(fn: (v: string | string[] | null) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(d: boolean): void { this.cvaDisabled = d; this.cdr.markForCheck(); }
}
