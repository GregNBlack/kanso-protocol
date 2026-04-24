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

import { KpState } from '@kanso-protocol/core';
import { KpButtonComponent } from '@kanso-protocol/button';

export type KpTimePickerSize = 'sm' | 'md' | 'lg';
export type KpTimePickerFormat = '12h' | '24h';
/** Canonical string form — always 24-hour `HH:mm` or `HH:mm:ss`. */
export type KpTimePickerValue = string | null;

type Period = 'AM' | 'PM';

const pad2 = (n: number) => String(n).padStart(2, '0');

function parseTime(v: string | null): { h: number; m: number; s: number } | null {
  if (!v) return null;
  const parts = v.split(':').map((x) => Number(x));
  if (parts.some((x) => !Number.isFinite(x))) return null;
  const [h, m, s] = parts;
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return { h, m, s: Number.isFinite(s) ? s : 0 };
}

/**
 * Kanso Protocol — TimePicker
 *
 * Input-triggered picker for hour / minute (optional second). Panel has
 * scrollable columns per unit plus Now / Cancel / Apply footer — picks
 * are staged in a draft until Apply, so accidental clicks don't commit.
 *
 * Value on the wire is always canonical 24-hour `HH:mm` or `HH:mm:ss`;
 * display switches between 12h and 24h via `format`.
 */
@Component({
  selector: 'kp-time-picker',
  imports: [KpButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => KpTimePickerComponent),
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
      class="kp-tp__trigger"
      [attr.aria-haspopup]="'dialog'"
      [attr.aria-expanded]="isOpen"
      [disabled]="isDisabled"
      (click)="toggle()"
    >
      <span class="kp-tp__value" [class.kp-tp__value--placeholder]="!hasValue()">
        {{ triggerText() }}
      </span>

      @if (showClear && hasValue() && !isDisabled) {
        <span
          class="kp-tp__clear"
          role="button"
          aria-label="Clear time"
          (click)="clear($event)"
          (mousedown)="$event.preventDefault()"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </span>
      }

      <span class="kp-tp__icon" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
          <path d="M12 7v5l3 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
    </button>

    @if (isOpen && !isDisabled) {
      <div #panel class="kp-tp__panel" role="dialog" aria-label="Choose time">
        <div class="kp-tp__columns">
          <div class="kp-tp__col">
            <div class="kp-tp__col-label">Hour</div>
            <div #hourCol class="kp-tp__col-list">
              @for (h of hourItems; track h) {
                <button
                  type="button"
                  class="kp-tp__item"
                  [class.kp-tp__item--selected]="h === draftHourDisplay"
                  (click)="pickHour(h)"
                >{{ pad(h) }}</button>
              }
            </div>
          </div>

          <span class="kp-tp__sep">:</span>

          <div class="kp-tp__col">
            <div class="kp-tp__col-label">Min</div>
            <div #minCol class="kp-tp__col-list">
              @for (m of minuteItems; track m) {
                <button
                  type="button"
                  class="kp-tp__item"
                  [class.kp-tp__item--selected]="m === draftMinute"
                  (click)="pickMinute(m)"
                >{{ pad(m) }}</button>
              }
            </div>
          </div>

          @if (showSeconds) {
            <span class="kp-tp__sep">:</span>
            <div class="kp-tp__col">
              <div class="kp-tp__col-label">Sec</div>
              <div #secCol class="kp-tp__col-list">
                @for (s of secondItems; track s) {
                  <button
                    type="button"
                    class="kp-tp__item"
                    [class.kp-tp__item--selected]="s === draftSecond"
                    (click)="pickSecond(s)"
                  >{{ pad(s) }}</button>
                }
              </div>
            </div>
          }

          @if (format === '12h') {
            <div class="kp-tp__col kp-tp__col--period">
              <div class="kp-tp__col-label">AM/PM</div>
              <div class="kp-tp__col-list kp-tp__col-list--period">
                <button type="button" class="kp-tp__item" [class.kp-tp__item--selected]="draftPeriod === 'AM'" (click)="pickPeriod('AM')">AM</button>
                <button type="button" class="kp-tp__item" [class.kp-tp__item--selected]="draftPeriod === 'PM'" (click)="pickPeriod('PM')">PM</button>
              </div>
            </div>
          }
        </div>

        <div class="kp-tp__footer">
          <kp-button variant="ghost" size="sm" color="neutral" (click)="setNow()">Now</kp-button>
          <div class="kp-tp__footer-right">
            <kp-button variant="ghost" size="sm" color="neutral" (click)="cancel()">Cancel</kp-button>
            <kp-button size="sm" (click)="apply()">Apply</kp-button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host {
      display: inline-flex;
      flex-direction: column;
      position: relative;
      width: 200px;
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
    }

    .kp-tp__trigger {
      all: unset;
      display: inline-flex;
      align-items: center;
      box-sizing: border-box;
      width: 100%;
      height: var(--kp-input-height);
      padding: 0 var(--kp-input-padding-x);
      gap: var(--kp-input-gap);
      border: 1px solid var(--kp-input-border, var(--kp-color-gray-300));
      border-radius: var(--kp-input-radius);
      background: var(--kp-input-bg, var(--kp-color-white));
      color: var(--kp-input-fg, var(--kp-color-gray-900));
      cursor: pointer;
      transition: border-color 120ms ease, background 120ms ease;
    }
    :host(:not(.kp-tp--disabled):not(.kp-tp--error)) .kp-tp__trigger:hover,
    :host(.kp-tp--hover) .kp-tp__trigger {
      border-color: var(--kp-input-border-hover, var(--kp-color-gray-400));
    }
    :host(.kp-tp--open) .kp-tp__trigger,
    :host(.kp-tp--focus) .kp-tp__trigger,
    :host(:not(.kp-tp--disabled):not(.kp-tp--error)) .kp-tp__trigger:focus-visible {
      border-color: var(--kp-input-border-focus, var(--kp-color-blue-600));
    }
    :host(.kp-tp--disabled) .kp-tp__trigger {
      background: var(--kp-input-bg-disabled, var(--kp-color-gray-50));
      border-color: var(--kp-input-border-disabled, var(--kp-color-gray-200));
      cursor: not-allowed;
    }
    :host(.kp-tp--error) .kp-tp__trigger {
      border-color: var(--kp-input-border-error, var(--kp-color-red-500));
    }

    .kp-tp__value {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: var(--kp-input-font-size);
      line-height: var(--kp-input-line-height);
      font-variant-numeric: tabular-nums;
      text-align: left;
    }
    .kp-tp__value--placeholder { color: var(--kp-input-placeholder, var(--kp-color-gray-400)); }

    .kp-tp__clear {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: var(--kp-input-clear-size, 20px);
      height: var(--kp-input-clear-size, 20px);
      padding: 2px;
      border-radius: 4px;
      color: var(--kp-color-gray-500);
      cursor: pointer;
      transition: background 120ms ease, color 120ms ease;
    }
    .kp-tp__clear:hover { background: var(--kp-color-gray-100); color: var(--kp-color-gray-700); }
    .kp-tp__clear svg { width: var(--kp-input-clear-icon, 14px); height: var(--kp-input-clear-icon, 14px); }

    .kp-tp__icon { display: inline-flex; color: var(--kp-color-gray-500); flex-shrink: 0; }

    .kp-tp__panel {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 16px;
      background: var(--kp-color-datepicker-panel-bg, var(--kp-color-white));
      border: 1px solid var(--kp-color-datepicker-panel-border, var(--kp-color-gray-200));
      border-radius: 12px;
      box-shadow:
        0 4px 6px rgba(0, 0, 0, 0.05),
        0 10px 15px rgba(0, 0, 0, 0.10);
      box-sizing: border-box;
    }

    .kp-tp__columns {
      display: flex;
      align-items: stretch;
      gap: 8px;
    }
    .kp-tp__col {
      display: flex;
      flex-direction: column;
      gap: 6px;
      align-items: stretch;
    }
    .kp-tp__col-label {
      font-size: 10px;
      font-weight: 500;
      color: var(--kp-color-datepicker-weekday, var(--kp-color-gray-500));
      text-transform: uppercase;
      letter-spacing: 0.06em;
      text-align: center;
    }
    .kp-tp__col-list {
      display: flex;
      flex-direction: column;
      gap: 2px;
      height: 160px;
      width: 56px;
      padding: 4px;
      border: 1px solid var(--kp-color-datepicker-panel-border, var(--kp-color-gray-200));
      border-radius: 8px;
      overflow-y: auto;
      scroll-behavior: smooth;
      box-sizing: border-box;
    }
    .kp-tp__col-list--period {
      height: auto;
      justify-content: center;
    }
    .kp-tp__col-list::-webkit-scrollbar { width: 4px; }
    .kp-tp__col-list::-webkit-scrollbar-thumb { background: var(--kp-color-gray-300); border-radius: 2px; }

    .kp-tp__sep {
      display: inline-flex;
      align-items: center;
      padding-top: 22px;
      font-size: 18px;
      font-weight: 600;
      color: var(--kp-color-gray-400);
    }

    .kp-tp__item {
      all: unset;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 28px;
      border-radius: 6px;
      font-size: 14px;
      font-variant-numeric: tabular-nums;
      color: var(--kp-color-datepicker-day-fg-rest, var(--kp-color-gray-900));
      cursor: pointer;
      transition: background 100ms ease, color 100ms ease;
      flex-shrink: 0;
    }
    .kp-tp__item:hover:not(.kp-tp__item--selected) {
      background: var(--kp-color-datepicker-day-bg-hover, var(--kp-color-gray-100));
    }
    .kp-tp__item--selected {
      background: var(--kp-color-datepicker-day-bg-selected, var(--kp-color-blue-600));
      color: var(--kp-color-datepicker-day-fg-selected, var(--kp-color-white));
      font-weight: 500;
    }

    .kp-tp__footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding-top: 8px;
      border-top: 1px solid var(--kp-color-datepicker-panel-border, var(--kp-color-gray-200));
    }
    .kp-tp__footer-right { display: flex; gap: 6px; }

    /* Size tokens — shared Input grammar (sm / md / lg only per spec) */
    :host(.kp-tp--sm) { --kp-input-height: 28px; --kp-input-radius: 10px; --kp-input-padding-x: 8px;  --kp-input-font-size: 14px; --kp-input-line-height: 1.428; --kp-input-gap: 5px; --kp-input-clear-size: 16px; --kp-input-clear-icon: 12px; }
    :host(.kp-tp--md) { --kp-input-height: 36px; --kp-input-radius: 12px; --kp-input-padding-x: 12px; --kp-input-font-size: 16px; --kp-input-line-height: 1.5;   --kp-input-gap: 6px; --kp-input-clear-size: 20px; --kp-input-clear-icon: 14px; }
    :host(.kp-tp--lg) { --kp-input-height: 44px; --kp-input-radius: 14px; --kp-input-padding-x: 14px; --kp-input-font-size: 16px; --kp-input-line-height: 1.5;   --kp-input-gap: 8px; --kp-input-clear-size: 24px; --kp-input-clear-icon: 16px; }
  `],
})
export class KpTimePickerComponent implements ControlValueAccessor, AfterViewChecked, OnDestroy {
  @Input() size: KpTimePickerSize = 'md';
  @Input() format: KpTimePickerFormat = '24h';
  @Input() showSeconds = false;
  /** Step for the minute column. Use 5 / 15 / 30 for rounded pickers. */
  @Input() minuteStep = 1;
  /** Step for the seconds column. Only used when `showSeconds` is true. */
  @Input() secondStep = 1;
  @Input() placeholder = 'Select time';
  @Input() showClear = true;
  @Input() disabled = false;
  @Input() forceState: KpState | null = null;

  @Output() readonly valueChange = new EventEmitter<KpTimePickerValue>();
  @Output() readonly openChange = new EventEmitter<boolean>();

  @ViewChild('trigger') triggerEl?: ElementRef<HTMLElement>;
  @ViewChild('panel')   panelEl?: ElementRef<HTMLElement>;
  @ViewChild('hourCol') hourCol?: ElementRef<HTMLElement>;
  @ViewChild('minCol')  minCol?: ElementRef<HTMLElement>;
  @ViewChild('secCol')  secCol?: ElementRef<HTMLElement>;

  /** @internal */ isOpen = false;
  /** @internal — draft state while the panel is open, committed on Apply. */
  draftHour = 0;
  /** @internal */ draftMinute = 0;
  /** @internal */ draftSecond = 0;
  /** @internal */ draftPeriod: Period = 'AM';
  private lastScrolledInto = '';

  private committed: { h: number; m: number; s: number } | null = null;
  private cvaDisabled = false;

  private readonly host = inject(ElementRef) as ElementRef<HTMLElement>;
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly doc = inject(DOCUMENT);

  pad(n: number): string { return pad2(n); }

  get isDisabled(): boolean {
    return this.disabled || this.cvaDisabled || this.forceState === 'disabled';
  }

  get hostClasses(): string {
    const c = ['kp-tp', `kp-tp--${this.size}`];
    if (this.isOpen) c.push('kp-tp--open');
    if (this.forceState) c.push(`kp-tp--${this.forceState}`);
    else if (this.isDisabled) c.push('kp-tp--disabled');
    return c.join(' ');
  }

  get hourItems(): number[] {
    if (this.format === '12h') {
      // 12h: 12, 1, 2, ... 11 (conventional clock order)
      return [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    }
    const out: number[] = [];
    for (let h = 0; h < 24; h++) out.push(h);
    return out;
  }
  get minuteItems(): number[] {
    const out: number[] = [];
    for (let m = 0; m < 60; m += this.minuteStep) out.push(m);
    return out;
  }
  get secondItems(): number[] {
    const out: number[] = [];
    for (let s = 0; s < 60; s += this.secondStep) out.push(s);
    return out;
  }

  /** In 12h display the hour value that should show "selected" ranges 1–12. */
  get draftHourDisplay(): number {
    if (this.format === '24h') return this.draftHour;
    const h = this.draftHour % 12;
    return h === 0 ? 12 : h;
  }

  hasValue(): boolean { return this.committed != null; }

  triggerText(): string {
    if (!this.committed) return this.placeholder;
    const { h, m, s } = this.committed;
    if (this.format === '24h') {
      return this.showSeconds ? `${pad2(h)}:${pad2(m)}:${pad2(s)}` : `${pad2(h)}:${pad2(m)}`;
    }
    const period: Period = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return this.showSeconds
      ? `${pad2(h12)}:${pad2(m)}:${pad2(s)} ${period}`
      : `${pad2(h12)}:${pad2(m)} ${period}`;
  }

  toggle(): void {
    if (this.isDisabled) return;
    this.setOpen(!this.isOpen);
  }

  private setOpen(open: boolean): void {
    if (this.isOpen === open) return;
    this.isOpen = open;
    if (open) {
      // Seed draft from committed (or 00:00 if none).
      const src = this.committed ?? { h: 0, m: 0, s: 0 };
      this.draftHour = src.h;
      this.draftMinute = src.m;
      this.draftSecond = src.s;
      this.draftPeriod = src.h >= 12 ? 'PM' : 'AM';
      this.lastScrolledInto = '';
      window.addEventListener('scroll', this.reposition, true);
      window.addEventListener('resize', this.reposition);
    } else {
      window.removeEventListener('scroll', this.reposition, true);
      window.removeEventListener('resize', this.reposition);
    }
    this.openChange.emit(open);
    this.cdr.markForCheck();
  }

  pickHour(h: number): void {
    if (this.format === '24h') {
      this.draftHour = h;
    } else {
      // h is 1..12; convert to 24h using current period.
      const base = h === 12 ? 0 : h;
      this.draftHour = this.draftPeriod === 'AM' ? base : base + 12;
    }
    this.cdr.markForCheck();
  }
  pickMinute(m: number): void { this.draftMinute = m; this.cdr.markForCheck(); }
  pickSecond(s: number): void { this.draftSecond = s; this.cdr.markForCheck(); }
  pickPeriod(p: Period): void {
    if (this.draftPeriod === p) return;
    this.draftPeriod = p;
    // Flip the 24h hour by 12 to match the new period.
    this.draftHour = p === 'AM' ? this.draftHour % 12 : (this.draftHour % 12) + 12;
    this.cdr.markForCheck();
  }

  setNow(): void {
    const d = new Date();
    this.draftHour = d.getHours();
    this.draftMinute = this.clampStep(d.getMinutes(), this.minuteStep);
    this.draftSecond = this.clampStep(d.getSeconds(), this.secondStep);
    this.draftPeriod = this.draftHour >= 12 ? 'PM' : 'AM';
    this.cdr.markForCheck();
  }

  apply(): void {
    this.committed = { h: this.draftHour, m: this.draftMinute, s: this.draftSecond };
    const out = this.serialize(this.committed);
    this.valueChange.emit(out);
    this.onChange(out);
    this.onTouched();
    this.setOpen(false);
  }

  cancel(): void { this.setOpen(false); }

  clear(event: Event): void {
    event.stopPropagation();
    if (this.isDisabled) return;
    this.committed = null;
    this.valueChange.emit(null);
    this.onChange(null);
    this.cdr.markForCheck();
  }

  private clampStep(v: number, step: number): number {
    return Math.round(v / step) * step;
  }

  private serialize(t: { h: number; m: number; s: number }): string {
    return this.showSeconds
      ? `${pad2(t.h)}:${pad2(t.m)}:${pad2(t.s)}`
      : `${pad2(t.h)}:${pad2(t.m)}`;
  }

  @HostListener('document:click', ['$event'])
  onDocClick(event: Event): void {
    if (!this.isOpen) return;
    const target = event.target as Node;
    const inHost = this.host.nativeElement.contains(target);
    const inPanel = this.panelEl?.nativeElement.contains(target) ?? false;
    if (!inHost && !inPanel) this.cancel();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void { if (this.isOpen) this.cancel(); }

  ngAfterViewChecked(): void {
    if (!this.isOpen) return;
    const pan = this.panelEl?.nativeElement;
    if (pan && this.doc?.body && pan.parentElement !== this.doc.body) {
      this.doc.body.appendChild(pan);
    }
    this.positionPanel();
    // Scroll each column to its selected value once per open.
    const key = `${this.draftHour}|${this.draftMinute}|${this.draftSecond}|${this.format}|${this.showSeconds}`;
    if (this.lastScrolledInto !== key) {
      this.scrollSelectedIntoView();
      this.lastScrolledInto = key;
    }
  }

  ngOnDestroy(): void {
    // Guarded for SSR teardown — bare-metal platform-server has no `window`.
    if (typeof window !== 'undefined') {
      window.removeEventListener('scroll', this.reposition, true);
      window.removeEventListener('resize', this.reposition);
    }
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

    const spaceBelow = viewportH - rect.bottom;
    const spaceAbove = rect.top;
    let top: number;
    if (spaceBelow >= panelRect.height + gap) top = rect.bottom + gap;
    else if (spaceAbove >= panelRect.height + gap) top = rect.top - panelRect.height - gap;
    else top = spaceAbove > spaceBelow
      ? Math.max(edge, rect.top - panelRect.height - gap)
      : Math.min(rect.bottom + gap, viewportH - panelRect.height - edge);

    let left = rect.left;
    if (left + panelRect.width > viewportW - edge) left = viewportW - panelRect.width - edge;
    if (left < edge) left = edge;

    pan.style.top = `${top}px`;
    pan.style.left = `${left}px`;
  }

  private scrollSelectedIntoView(): void {
    const scrollCol = (el: HTMLElement | undefined, items: number[], target: number) => {
      if (!el) return;
      const idx = items.indexOf(target);
      if (idx < 0) return;
      // Center the selected row in the 160px list by adjusting scrollTop.
      const rowHeight = 30; // 28 height + 2 gap
      const center = idx * rowHeight - (el.clientHeight / 2) + (rowHeight / 2);
      el.scrollTop = Math.max(0, center);
    };
    scrollCol(this.hourCol?.nativeElement, this.hourItems, this.draftHourDisplay);
    scrollCol(this.minCol?.nativeElement, this.minuteItems, this.draftMinute);
    if (this.showSeconds) scrollCol(this.secCol?.nativeElement, this.secondItems, this.draftSecond);
  }

  // ControlValueAccessor
  private onChange: (v: KpTimePickerValue) => void = () => { /* no-op */ };
  private onTouched: () => void = () => { /* no-op */ };

  writeValue(v: KpTimePickerValue): void {
    this.committed = parseTime(v ?? null);
    this.cdr.markForCheck();
  }
  registerOnChange(fn: (v: KpTimePickerValue) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(d: boolean): void { this.cvaDisabled = d; this.cdr.markForCheck(); }
}
