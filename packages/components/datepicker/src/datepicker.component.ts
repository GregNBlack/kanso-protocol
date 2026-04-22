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

export type KpDatePickerMode = 'single' | 'range';
export type KpDateRange = [Date | null, Date | null];
export type KpDatePickerValue = Date | KpDateRange | null;

export interface KpDatePickerPreset {
  label: string;
  /** Returns a single Date (for single mode) or a [start, end] tuple (for range mode). */
  value: () => Date | [Date, Date];
}

type View = 'day' | 'month' | 'year';

const MONTH_NAMES_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];
const WEEKDAY_LABELS_MON = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const WEEKDAY_LABELS_SUN = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function startOfDay(d: Date): Date { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function isBefore(a: Date, b: Date): boolean { return startOfDay(a).getTime() < startOfDay(b).getTime(); }
function isAfter(a: Date, b: Date): boolean  { return startOfDay(a).getTime() > startOfDay(b).getTime(); }
function addDays(d: Date, n: number): Date   { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function addMonths(d: Date, n: number): Date { const x = new Date(d); x.setMonth(x.getMonth() + n); return x; }
function startOfMonth(d: Date): Date { const x = new Date(d); x.setDate(1); x.setHours(0,0,0,0); return x; }
function endOfMonth(d: Date): Date   { const x = new Date(d); x.setMonth(x.getMonth()+1); x.setDate(0); x.setHours(23,59,59,999); return x; }

const DEFAULT_PRESETS: KpDatePickerPreset[] = [
  { label: 'Today',         value: () => new Date() },
  { label: 'Yesterday',     value: () => addDays(new Date(), -1) },
  { label: 'Last 7 days',   value: () => [addDays(new Date(), -6), new Date()] },
  { label: 'Last 30 days',  value: () => [addDays(new Date(), -29), new Date()] },
  { label: 'This month',    value: () => [startOfMonth(new Date()), new Date()] },
  { label: 'Last month',    value: () => [startOfMonth(addMonths(new Date(), -1)), endOfMonth(addMonths(new Date(), -1))] },
];

interface DayCell {
  date: Date;
  label: string;
  outside: boolean;
  today: boolean;
  selected: boolean;
  inRange: boolean;
  rangeStart: boolean;
  rangeEnd: boolean;
  disabled: boolean;
}

/**
 * Kanso Protocol — DatePicker
 *
 * Input-triggered calendar popup. `mode="single"` picks one date, `mode="range"`
 * picks a pair `[start, end]`. Panel portals to `<body>` so it escapes any
 * overflow / transform on ancestors.
 *
 * Shares Input's size ramp and visual state vocabulary.
 */
@Component({
  selector: 'kp-date-picker',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => KpDatePickerComponent),
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
      class="kp-dp__trigger"
      [attr.aria-haspopup]="'dialog'"
      [attr.aria-expanded]="isOpen"
      [disabled]="isDisabled"
      (click)="toggle()"
    >
      <span class="kp-dp__value" [class.kp-dp__value--placeholder]="!hasValue()">
        {{ triggerText() }}
      </span>

      @if (showClear && hasValue() && !isDisabled) {
        <span
          class="kp-dp__clear"
          role="button"
          aria-label="Clear date"
          (click)="clear($event)"
          (mousedown)="$event.preventDefault()"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </span>
      }

      <span class="kp-dp__icon" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" stroke-width="2"/>
          <path d="M8 3v4M16 3v4M3 10h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </span>
    </button>

    @if (isOpen && !isDisabled) {
      <div #panel class="kp-dp__panel" role="dialog" aria-label="Choose date">
        @if (showPresets) {
          <div class="kp-dp__presets">
            @for (p of resolvedPresets; track p.label) {
              <button type="button" class="kp-dp__preset" (click)="applyPreset(p)">{{ p.label }}</button>
            }
          </div>
        }

        <div class="kp-dp__calendar">
          <div class="kp-dp__header">
            <button type="button" class="kp-dp__nav" aria-label="Previous" (click)="navigate(-1)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>

            <button type="button" class="kp-dp__title" (click)="cycleView()">
              {{ headerLabel() }}
            </button>

            <button type="button" class="kp-dp__nav" aria-label="Next" (click)="navigate(1)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>

          @if (view === 'day') {
            <div class="kp-dp__weekdays">
              @for (w of weekdayLabels; track w) {
                <span class="kp-dp__weekday">{{ w }}</span>
              }
            </div>

            <div class="kp-dp__days" (mouseleave)="rangeHover = null">
              @for (cell of dayCells; track cell.date.getTime()) {
                <button
                  type="button"
                  class="kp-dp__day"
                  [class.kp-dp__day--outside]="cell.outside"
                  [class.kp-dp__day--today]="cell.today"
                  [class.kp-dp__day--selected]="cell.selected"
                  [class.kp-dp__day--in-range]="cell.inRange"
                  [class.kp-dp__day--range-start]="cell.rangeStart"
                  [class.kp-dp__day--range-end]="cell.rangeEnd"
                  [disabled]="cell.disabled"
                  (click)="pickDay(cell.date)"
                  (mouseenter)="onDayHover(cell.date)"
                >{{ cell.label }}</button>
              }
            </div>
          } @else if (view === 'month') {
            <div class="kp-dp__months">
              @for (m of monthNamesShort; track m; let idx = $index) {
                <button
                  type="button"
                  class="kp-dp__month"
                  [class.kp-dp__month--selected]="idx === viewDate.getMonth()"
                  (click)="pickMonth(idx)"
                >{{ m }}</button>
              }
            </div>
          } @else {
            <div class="kp-dp__years">
              @for (y of yearCells; track y) {
                <button
                  type="button"
                  class="kp-dp__year"
                  [class.kp-dp__year--selected]="y === viewDate.getFullYear()"
                  (click)="pickYear(y)"
                >{{ y }}</button>
              }
            </div>
          }
        </div>
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

    .kp-dp__trigger {
      all: unset;
      display: inline-flex;
      align-items: center;
      box-sizing: border-box;
      width: 100%;
      height: var(--kp-input-height);
      padding: 0 var(--kp-input-padding-x);
      gap: var(--kp-input-gap);
      border: 1px solid var(--kp-input-border, #D4D4D8);
      border-radius: var(--kp-input-radius);
      background: var(--kp-input-bg, #FFFFFF);
      color: var(--kp-input-fg, #18181B);
      cursor: pointer;
      transition: border-color 120ms ease, background 120ms ease;
    }
    :host(:not(.kp-dp--disabled):not(.kp-dp--error)) .kp-dp__trigger:hover,
    :host(.kp-dp--hover) .kp-dp__trigger {
      border-color: var(--kp-input-border-hover, #A1A1AA);
    }
    :host(.kp-dp--open) .kp-dp__trigger,
    :host(.kp-dp--focus) .kp-dp__trigger,
    :host(:not(.kp-dp--disabled):not(.kp-dp--error)) .kp-dp__trigger:focus-visible {
      border-color: var(--kp-input-border-focus, #2563EB);
    }
    :host(.kp-dp--disabled) .kp-dp__trigger {
      background: var(--kp-input-bg-disabled, #FAFAFA);
      border-color: var(--kp-input-border-disabled, #E4E4E7);
      cursor: not-allowed;
    }
    :host(.kp-dp--error) .kp-dp__trigger {
      border-color: var(--kp-input-border-error, #EF4444);
    }

    .kp-dp__value {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: var(--kp-input-font-size);
      line-height: var(--kp-input-line-height);
      text-align: left;
    }
    .kp-dp__value--placeholder { color: var(--kp-input-placeholder, #A1A1AA); }

    .kp-dp__clear {
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
      transition: background 120ms ease, color 120ms ease;
    }
    .kp-dp__clear:hover { background: #F4F4F5; color: #3F3F46; }
    .kp-dp__clear svg { width: var(--kp-input-clear-icon, 14px); height: var(--kp-input-clear-icon, 14px); }

    .kp-dp__icon { display: inline-flex; color: #71717A; flex-shrink: 0; }

    .kp-dp__panel {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 1000;
      display: flex;
      background: var(--kp-color-datepicker-panel-bg, #FFFFFF);
      border: 1px solid var(--kp-color-datepicker-panel-border, #E4E4E7);
      border-radius: 12px;
      box-shadow:
        0 4px 6px rgba(0, 0, 0, 0.05),
        0 10px 15px rgba(0, 0, 0, 0.10);
      overflow: hidden;
    }

    .kp-dp__presets {
      display: flex;
      flex-direction: column;
      gap: 2px;
      width: 160px;
      padding: 12px 8px;
      border-right: 1px solid var(--kp-color-datepicker-panel-border, #E4E4E7);
      background: #FAFAFA;
    }
    .kp-dp__preset {
      all: unset;
      display: block;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 13px;
      color: #3F3F46;
      cursor: pointer;
      transition: background 120ms ease;
    }
    .kp-dp__preset:hover { background: #F4F4F5; }

    .kp-dp__calendar {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 16px;
      width: 288px;
      box-sizing: border-box;
    }

    .kp-dp__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .kp-dp__nav {
      all: unset;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 6px;
      color: var(--kp-color-datepicker-header-nav-fg, #52525B);
      cursor: pointer;
      transition: background 120ms ease;
    }
    .kp-dp__nav:hover { background: #F4F4F5; }
    .kp-dp__title {
      all: unset;
      flex: 1;
      text-align: center;
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 15px;
      font-weight: 500;
      color: var(--kp-color-datepicker-header-fg, #18181B);
      cursor: pointer;
      transition: background 120ms ease;
    }
    .kp-dp__title:hover { background: #F4F4F5; }

    .kp-dp__weekdays {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 4px;
    }
    .kp-dp__weekday {
      text-align: center;
      font-size: 11px;
      font-weight: 500;
      color: var(--kp-color-datepicker-weekday, #71717A);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      padding-bottom: 4px;
    }

    .kp-dp__days {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 4px;
    }
    .kp-dp__day {
      all: unset;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      font-size: 13px;
      font-variant-numeric: tabular-nums;
      color: var(--kp-color-datepicker-day-fg-rest, #18181B);
      cursor: pointer;
      box-sizing: border-box;
      transition: background 100ms ease, color 100ms ease;
    }
    .kp-dp__day:hover:not([disabled]):not(.kp-dp__day--selected):not(.kp-dp__day--range-start):not(.kp-dp__day--range-end) {
      background: var(--kp-color-datepicker-day-bg-hover, #F4F4F5);
      color: var(--kp-color-datepicker-day-fg-hover, #18181B);
    }
    .kp-dp__day--outside {
      color: var(--kp-color-datepicker-day-fg-outside, #A1A1AA);
    }
    .kp-dp__day--today {
      box-shadow: inset 0 0 0 1.5px var(--kp-color-datepicker-day-today-ring, #2563EB);
      color: var(--kp-color-datepicker-day-fg-today, #2563EB);
      font-weight: 600;
    }
    .kp-dp__day--in-range {
      background: var(--kp-color-datepicker-day-bg-in-range, #EFF6FF);
      color: var(--kp-color-datepicker-day-fg-in-range, #1D4ED8);
      border-radius: 0;
    }
    .kp-dp__day--selected,
    .kp-dp__day--range-start,
    .kp-dp__day--range-end {
      background: var(--kp-color-datepicker-day-bg-selected, #2563EB);
      color: var(--kp-color-datepicker-day-fg-selected, #FFFFFF);
      font-weight: 500;
      box-shadow: none;
    }
    .kp-dp__day--range-start { border-radius: 8px 0 0 8px; }
    .kp-dp__day--range-end   { border-radius: 0 8px 8px 0; }
    .kp-dp__day--range-start.kp-dp__day--range-end { border-radius: 8px; }
    .kp-dp__day[disabled] {
      color: var(--kp-color-datepicker-day-fg-disabled, #D4D4D8);
      cursor: not-allowed;
    }

    .kp-dp__months,
    .kp-dp__years {
      display: grid;
      gap: 6px;
      padding: 4px 0;
    }
    .kp-dp__months { grid-template-columns: repeat(3, 1fr); }
    .kp-dp__years  { grid-template-columns: repeat(4, 1fr); }
    .kp-dp__month,
    .kp-dp__year {
      all: unset;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 40px;
      border-radius: 8px;
      font-size: 13px;
      color: #3F3F46;
      cursor: pointer;
      transition: background 100ms ease, color 100ms ease;
    }
    .kp-dp__month:hover,
    .kp-dp__year:hover {
      background: var(--kp-color-datepicker-day-bg-hover, #F4F4F5);
    }
    .kp-dp__month--selected,
    .kp-dp__year--selected {
      background: var(--kp-color-datepicker-day-bg-selected, #2563EB);
      color: var(--kp-color-datepicker-day-fg-selected, #FFFFFF);
      font-weight: 500;
    }

    /* Size tokens — shared Input grammar */
    :host(.kp-dp--xs) { --kp-input-height: 24px; --kp-input-radius: 8px;  --kp-input-padding-x: 6px;  --kp-input-font-size: 12px; --kp-input-line-height: 1.333; --kp-input-gap: 4px; --kp-input-clear-size: 16px; --kp-input-clear-icon: 12px; }
    :host(.kp-dp--sm) { --kp-input-height: 28px; --kp-input-radius: 10px; --kp-input-padding-x: 8px;  --kp-input-font-size: 14px; --kp-input-line-height: 1.428; --kp-input-gap: 5px; --kp-input-clear-size: 16px; --kp-input-clear-icon: 12px; }
    :host(.kp-dp--md) { --kp-input-height: 36px; --kp-input-radius: 12px; --kp-input-padding-x: 12px; --kp-input-font-size: 16px; --kp-input-line-height: 1.5;   --kp-input-gap: 6px; --kp-input-clear-size: 20px; --kp-input-clear-icon: 14px; }
    :host(.kp-dp--lg) { --kp-input-height: 44px; --kp-input-radius: 14px; --kp-input-padding-x: 14px; --kp-input-font-size: 16px; --kp-input-line-height: 1.5;   --kp-input-gap: 8px; --kp-input-clear-size: 24px; --kp-input-clear-icon: 16px; }
    :host(.kp-dp--xl) { --kp-input-height: 52px; --kp-input-radius: 16px; --kp-input-padding-x: 16px; --kp-input-font-size: 20px; --kp-input-line-height: 1.4;   --kp-input-gap: 8px; --kp-input-clear-size: 24px; --kp-input-clear-icon: 16px; }
  `],
})
export class KpDatePickerComponent implements ControlValueAccessor, AfterViewChecked, OnDestroy {
  @Input() size: KpSize = 'md';
  @Input() mode: KpDatePickerMode = 'single';
  @Input() placeholder = 'Select date';
  @Input() min: Date | null = null;
  @Input() max: Date | null = null;
  @Input() showClear = true;
  @Input() showPresets = false;
  @Input() presets: KpDatePickerPreset[] | null = null;
  /** 0 = Sunday first, 1 = Monday first. Defaults to Monday. */
  @Input() firstDayOfWeek: 0 | 1 = 1;
  /** Custom formatter for the trigger's displayed text. */
  @Input() dateFormatter: ((d: Date) => string) | null = null;
  @Input() rangeSeparator = ' – ';
  @Input() disabled = false;
  @Input() forceState: KpState | null = null;

  @Output() readonly valueChange = new EventEmitter<KpDatePickerValue>();
  @Output() readonly openChange = new EventEmitter<boolean>();

  @ViewChild('trigger') triggerEl?: ElementRef<HTMLElement>;
  @ViewChild('panel')   panelEl?: ElementRef<HTMLElement>;

  /** @internal */ isOpen = false;
  /** @internal */ view: View = 'day';
  /** @internal */ viewDate: Date = startOfMonth(new Date());
  /** @internal */ rangeHover: Date | null = null;

  private singleValue: Date | null = null;
  private rangeStart: Date | null = null;
  private rangeEnd: Date | null = null;
  private cvaDisabled = false;

  readonly monthNamesShort = MONTH_NAMES_SHORT;

  private readonly host = inject(ElementRef) as ElementRef<HTMLElement>;
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly doc = inject(DOCUMENT);

  get isDisabled(): boolean {
    return this.disabled || this.cvaDisabled || this.forceState === 'disabled';
  }

  get hostClasses(): string {
    const c = ['kp-dp', `kp-dp--${this.size}`];
    if (this.isOpen) c.push('kp-dp--open');
    if (this.forceState) c.push(`kp-dp--${this.forceState}`);
    else if (this.isDisabled) c.push('kp-dp--disabled');
    return c.join(' ');
  }

  get weekdayLabels(): string[] {
    return this.firstDayOfWeek === 1 ? WEEKDAY_LABELS_MON : WEEKDAY_LABELS_SUN;
  }

  get resolvedPresets(): KpDatePickerPreset[] {
    return this.presets ?? DEFAULT_PRESETS;
  }

  hasValue(): boolean {
    return this.mode === 'single' ? this.singleValue !== null : this.rangeStart !== null;
  }

  triggerText(): string {
    if (!this.hasValue()) return this.placeholder;
    if (this.mode === 'single') return this.formatDate(this.singleValue!);
    const a = this.rangeStart ? this.formatDate(this.rangeStart) : '';
    const b = this.rangeEnd ? this.formatDate(this.rangeEnd) : '';
    return b ? `${a}${this.rangeSeparator}${b}` : a;
  }

  formatDate(d: Date): string {
    if (this.dateFormatter) return this.dateFormatter(d);
    return `${MONTH_NAMES_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  }

  headerLabel(): string {
    if (this.view === 'day')   return `${MONTH_NAMES_LONG[this.viewDate.getMonth()]} ${this.viewDate.getFullYear()}`;
    if (this.view === 'month') return `${this.viewDate.getFullYear()}`;
    const base = Math.floor(this.viewDate.getFullYear() / 12) * 12;
    return `${base} – ${base + 11}`;
  }

  get yearCells(): number[] {
    const base = Math.floor(this.viewDate.getFullYear() / 12) * 12;
    const out: number[] = [];
    for (let i = 0; i < 12; i++) out.push(base + i);
    return out;
  }

  get dayCells(): DayCell[] {
    const cells: DayCell[] = [];
    const today = startOfDay(new Date());
    const first = startOfMonth(this.viewDate);
    // Offset so the grid starts on the configured first day of week.
    const weekday = first.getDay(); // 0..6 Sun..Sat
    const offset = ((weekday - this.firstDayOfWeek) + 7) % 7;
    const gridStart = addDays(first, -offset);
    const rangeStart = this.rangeStart ? startOfDay(this.rangeStart) : null;
    const liveEnd = this.rangeEnd ?? (this.mode === 'range' && this.rangeHover ? startOfDay(this.rangeHover) : null);
    const [lo, hi] = rangeStart && liveEnd
      ? (isBefore(rangeStart, liveEnd) ? [rangeStart, liveEnd] : [liveEnd, rangeStart])
      : [rangeStart, null];

    for (let i = 0; i < 42; i++) {
      const d = addDays(gridStart, i);
      const dayStart = startOfDay(d);
      const outside = d.getMonth() !== this.viewDate.getMonth();
      const isToday = sameDay(d, today);
      const selected = this.mode === 'single' && this.singleValue != null && sameDay(d, this.singleValue);
      const rs = this.mode === 'range' && rangeStart != null && lo != null && sameDay(dayStart, lo);
      const re = this.mode === 'range' && liveEnd != null && hi != null && sameDay(dayStart, hi);
      const inRange = this.mode === 'range' && lo != null && hi != null && !rs && !re
        && !isBefore(dayStart, lo) && !isAfter(dayStart, hi);
      const disabled = (this.min != null && isBefore(dayStart, startOfDay(this.min)))
        || (this.max != null && isAfter(dayStart, startOfDay(this.max)));

      cells.push({
        date: dayStart,
        label: String(d.getDate()),
        outside,
        today: isToday,
        selected,
        inRange,
        rangeStart: rs,
        rangeEnd: re,
        disabled,
      });
    }
    return cells;
  }

  toggle(): void {
    if (this.isDisabled) return;
    this.setOpen(!this.isOpen);
  }

  private setOpen(open: boolean): void {
    if (this.isOpen === open) return;
    this.isOpen = open;
    if (open) {
      // Anchor the calendar view on the current value (or today) each time we open.
      const anchor = this.mode === 'single' ? this.singleValue : this.rangeStart;
      this.viewDate = startOfMonth(anchor ?? new Date());
      this.view = 'day';
      this.rangeHover = null;
      window.addEventListener('scroll', this.reposition, true);
      window.addEventListener('resize', this.reposition);
    } else {
      this.rangeHover = null;
      window.removeEventListener('scroll', this.reposition, true);
      window.removeEventListener('resize', this.reposition);
    }
    this.openChange.emit(open);
    this.cdr.markForCheck();
  }

  navigate(dir: -1 | 1): void {
    if (this.view === 'day')   this.viewDate = startOfMonth(addMonths(this.viewDate, dir));
    else if (this.view === 'month') this.viewDate = new Date(this.viewDate.getFullYear() + dir, this.viewDate.getMonth(), 1);
    else this.viewDate = new Date(this.viewDate.getFullYear() + dir * 12, this.viewDate.getMonth(), 1);
    this.cdr.markForCheck();
  }

  cycleView(): void {
    this.view = this.view === 'day' ? 'month' : this.view === 'month' ? 'year' : 'day';
    this.cdr.markForCheck();
  }

  pickMonth(idx: number): void {
    this.viewDate = new Date(this.viewDate.getFullYear(), idx, 1);
    this.view = 'day';
    this.cdr.markForCheck();
  }

  pickYear(y: number): void {
    this.viewDate = new Date(y, this.viewDate.getMonth(), 1);
    this.view = 'month';
    this.cdr.markForCheck();
  }

  pickDay(d: Date): void {
    if (this.isDateDisabled(d)) return;
    if (this.mode === 'single') {
      this.singleValue = d;
      this.emitValue();
      this.setOpen(false);
      this.onTouched();
      return;
    }
    // Range mode — two-click pattern.
    if (this.rangeStart == null || (this.rangeStart != null && this.rangeEnd != null)) {
      // Start a new range.
      this.rangeStart = d;
      this.rangeEnd = null;
    } else {
      // Commit the end (reorder if user picked earlier).
      if (isBefore(d, this.rangeStart)) {
        this.rangeEnd = this.rangeStart;
        this.rangeStart = d;
      } else {
        this.rangeEnd = d;
      }
      this.rangeHover = null;
      this.emitValue();
      this.setOpen(false);
      this.onTouched();
      return;
    }
    this.emitValue();
    this.cdr.markForCheck();
  }

  onDayHover(d: Date): void {
    if (this.mode !== 'range' || this.rangeStart == null || this.rangeEnd != null) return;
    this.rangeHover = d;
    this.cdr.markForCheck();
  }

  applyPreset(preset: KpDatePickerPreset): void {
    const v = preset.value();
    if (Array.isArray(v)) {
      this.mode = 'range'; // presets that return tuples force range semantics
      const [a, b] = v;
      this.rangeStart = isBefore(a, b) ? a : b;
      this.rangeEnd   = isBefore(a, b) ? b : a;
      this.viewDate = startOfMonth(this.rangeStart);
    } else {
      this.singleValue = v;
      this.viewDate = startOfMonth(v);
    }
    this.emitValue();
    this.setOpen(false);
    this.onTouched();
  }

  clear(event: Event): void {
    event.stopPropagation();
    if (this.isDisabled) return;
    this.singleValue = null;
    this.rangeStart = null;
    this.rangeEnd = null;
    this.rangeHover = null;
    this.emitValue();
    this.cdr.markForCheck();
  }

  private isDateDisabled(d: Date): boolean {
    if (this.min != null && isBefore(d, startOfDay(this.min))) return true;
    if (this.max != null && isAfter(d, startOfDay(this.max))) return true;
    return false;
  }

  private emitValue(): void {
    const v: KpDatePickerValue = this.mode === 'single'
      ? this.singleValue
      : [this.rangeStart, this.rangeEnd];
    this.valueChange.emit(v);
    this.onChange(v);
  }

  @HostListener('document:click', ['$event'])
  onDocClick(event: MouseEvent): void {
    if (!this.isOpen) return;
    const target = event.target as Node;
    const inHost = this.host.nativeElement.contains(target);
    const inPanel = this.panelEl?.nativeElement.contains(target) ?? false;
    if (!inHost && !inPanel) this.setOpen(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void { if (this.isOpen) this.setOpen(false); }

  ngAfterViewChecked(): void {
    if (!this.isOpen) return;
    const pan = this.panelEl?.nativeElement;
    if (pan && this.doc?.body && pan.parentElement !== this.doc.body) {
      this.doc.body.appendChild(pan);
    }
    this.positionPanel();
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.reposition, true);
    window.removeEventListener('resize', this.reposition);
    const pan = this.panelEl?.nativeElement;
    if (pan && pan.parentElement === this.doc?.body) pan.remove();
  }

  private readonly reposition = () => this.positionPanel();

  private positionPanel(): void {
    const pan = this.panelEl?.nativeElement;
    const trigger = this.triggerEl?.nativeElement;
    if (!pan || !trigger) return;
    const rect = trigger.getBoundingClientRect();
    const panelRect = pan.getBoundingClientRect();
    const viewportH = window.innerHeight;
    const viewportW = window.innerWidth;
    const gap = 4;
    const edge = 8;

    // Vertical: prefer below the trigger; flip above if the panel doesn't
    // fit. If neither side fits fully, pin to whichever has more room.
    const spaceBelow = viewportH - rect.bottom;
    const spaceAbove = rect.top;
    let top: number;
    if (spaceBelow >= panelRect.height + gap) {
      top = rect.bottom + gap;
    } else if (spaceAbove >= panelRect.height + gap) {
      top = rect.top - panelRect.height - gap;
    } else {
      top = spaceAbove > spaceBelow
        ? Math.max(edge, rect.top - panelRect.height - gap)
        : Math.min(rect.bottom + gap, viewportH - panelRect.height - edge);
    }

    // Horizontal: align with the trigger's left, but clamp so the panel
    // stays inside the viewport on both sides.
    let left = rect.left;
    if (left + panelRect.width > viewportW - edge) left = viewportW - panelRect.width - edge;
    if (left < edge) left = edge;

    pan.style.top = `${top}px`;
    pan.style.left = `${left}px`;
  }

  // ControlValueAccessor
  private onChange: (v: KpDatePickerValue) => void = () => { /* no-op */ };
  private onTouched: () => void = () => { /* no-op */ };

  writeValue(v: KpDatePickerValue): void {
    if (v == null) {
      this.singleValue = null;
      this.rangeStart = null;
      this.rangeEnd = null;
    } else if (Array.isArray(v)) {
      const [a, b] = v;
      this.rangeStart = a ? startOfDay(a) : null;
      this.rangeEnd   = b ? startOfDay(b) : null;
    } else if (v instanceof Date) {
      this.singleValue = startOfDay(v);
    }
    this.cdr.markForCheck();
  }
  registerOnChange(fn: (v: KpDatePickerValue) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(d: boolean): void { this.cvaDisabled = d; this.cdr.markForCheck(); }
}
