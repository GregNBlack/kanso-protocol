import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
  forwardRef,
  inject,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type KpSliderSize = 'sm' | 'md' | 'lg';
export type KpSliderMode = 'single' | 'range';
export type KpSliderValue = number | readonly [number, number];

/**
 * Kanso Protocol — Slider
 *
 * Numeric range input with a draggable thumb on a horizontal track.
 * `mode="single"` exposes one thumb; `mode="range"` exposes two.
 *
 * Pointer drag, arrow-key stepping, track-click targeting, and a full
 * ControlValueAccessor for reactive / template-driven forms. In range
 * mode, `ngModel` is a `[number, number]` tuple; in single mode, a plain
 * `number`.
 */
@Component({
  selector: 'kp-slider',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => KpSliderComponent),
      multi: true,
    },
  ],
  host: { '[class]': 'hostClasses' },
  template: `
    @if (showValueLabel) {
      <div class="kp-sl__values">
        @if (mode === 'single') {
          <span class="kp-sl__value" [style.left.%]="pct(value0)">{{ formatValue(value0) }}</span>
        } @else {
          <span class="kp-sl__value" [style.left.%]="pct(value0)">{{ formatValue(value0) }}</span>
          <span class="kp-sl__value" [style.left.%]="pct(value1)">{{ formatValue(value1) }}</span>
        }
      </div>
    }

    <div #track class="kp-sl__track-wrap" (pointerdown)="onTrackPointerDown($event)">
      <div class="kp-sl__track"></div>
      <div class="kp-sl__track-fill" [style.left.%]="fillLeft" [style.width.%]="fillWidth"></div>

      @if (showTicks) {
        @for (p of tickPercents; track p) {
          <span class="kp-sl__tick" [style.left.%]="p"></span>
        }
      }

      <button
        type="button"
        class="kp-sl__thumb"
        role="slider"
        [attr.aria-valuemin]="min"
        [attr.aria-valuemax]="max"
        [attr.aria-valuenow]="value0"
        [attr.aria-label]="mode === 'range' ? (ariaLabelStart || 'Start') : (ariaLabel || null)"
        [attr.aria-orientation]="'horizontal'"
        [disabled]="disabled"
        [style.left.%]="pct(value0)"
        (pointerdown)="onThumbPointerDown($event, 0)"
        (keydown)="onKeyDown($event, 0)"
        (focus)="focusedThumb = 0"
        (blur)="onBlur()"
      ></button>

      @if (mode === 'range') {
        <button
          type="button"
          class="kp-sl__thumb"
          role="slider"
          [attr.aria-valuemin]="min"
          [attr.aria-valuemax]="max"
          [attr.aria-valuenow]="value1"
          [attr.aria-label]="ariaLabelEnd || 'End'"
          [attr.aria-orientation]="'horizontal'"
          [disabled]="disabled"
          [style.left.%]="pct(value1)"
          (pointerdown)="onThumbPointerDown($event, 1)"
          (keydown)="onKeyDown($event, 1)"
          (focus)="focusedThumb = 1"
          (blur)="onBlur()"
        ></button>
      }
    </div>

    @if (showLabels) {
      <div class="kp-sl__labels">
        <span>{{ minLabel ?? min }}</span>
        <span>{{ maxLabel ?? max }}</span>
      </div>
    }
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      min-width: 160px;
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
      --kp-sl-track-h: 6px;
      --kp-sl-thumb-d: 20px;
    }
    :host(.kp-sl--sm) { --kp-sl-track-h: 4px; --kp-sl-thumb-d: 16px; }
    :host(.kp-sl--md) { --kp-sl-track-h: 6px; --kp-sl-thumb-d: 20px; }
    :host(.kp-sl--lg) { --kp-sl-track-h: 8px; --kp-sl-thumb-d: 24px; }

    .kp-sl__values {
      position: relative;
      height: 20px;
      margin-bottom: 6px;
    }
    .kp-sl__value {
      position: absolute;
      top: 0;
      transform: translateX(-50%);
      font-size: 12px;
      line-height: 16px;
      font-weight: 500;
      color: var(--kp-color-slider-value, #18181B);
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
      pointer-events: none;
    }

    .kp-sl__track-wrap {
      position: relative;
      height: var(--kp-sl-thumb-d);
      display: flex;
      align-items: center;
      touch-action: none;
    }
    .kp-sl__track {
      position: absolute;
      left: 0; right: 0;
      height: var(--kp-sl-track-h);
      background: var(--kp-color-slider-track-empty, #E4E4E7);
      border-radius: calc(var(--kp-sl-track-h) / 2);
    }
    .kp-sl__track-fill {
      position: absolute;
      height: var(--kp-sl-track-h);
      background: var(--kp-color-slider-track-filled, #2563EB);
      border-radius: calc(var(--kp-sl-track-h) / 2);
    }
    .kp-sl__tick {
      position: absolute;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: var(--kp-color-slider-tick, #A1A1AA);
      transform: translateX(-50%);
      pointer-events: none;
    }

    .kp-sl__thumb {
      all: unset;
      position: absolute;
      width: var(--kp-sl-thumb-d);
      height: var(--kp-sl-thumb-d);
      border-radius: 50%;
      background: var(--kp-color-slider-thumb-bg, #FFFFFF);
      border: 2px solid var(--kp-color-slider-thumb-border, #2563EB);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
      cursor: grab;
      transform: translateX(-50%);
      transition: border-color 120ms ease, box-shadow 120ms ease;
      box-sizing: border-box;
      touch-action: none;
    }
    .kp-sl__thumb:active { cursor: grabbing; }
    .kp-sl__thumb:hover { border-color: var(--kp-color-blue-700, #1D4ED8); }
    .kp-sl__thumb:focus-visible {
      box-shadow: 0 0 0 4px var(--kp-color-slider-thumb-ring-focus, #DBEAFE), 0 2px 4px rgba(0, 0, 0, 0.08);
    }
    .kp-sl__thumb[disabled] {
      cursor: not-allowed;
      background: var(--kp-color-gray-100, #F4F4F5);
      border-color: var(--kp-color-gray-400, #A1A1AA);
      box-shadow: none;
    }

    :host(.kp-sl--disabled) .kp-sl__track-fill {
      background: var(--kp-color-gray-400, #A1A1AA);
    }
    :host(.kp-sl--disabled) .kp-sl__track {
      background: var(--kp-color-gray-100, #F4F4F5);
    }

    .kp-sl__labels {
      display: flex;
      justify-content: space-between;
      margin-top: 8px;
      font-size: 12px;
      line-height: 16px;
      color: var(--kp-color-slider-label, #52525B);
      font-variant-numeric: tabular-nums;
    }
  `],
})
export class KpSliderComponent implements ControlValueAccessor, OnDestroy {
  @Input() size: KpSliderSize = 'md';
  @Input() mode: KpSliderMode = 'single';
  @Input() min = 0;
  @Input() max = 100;
  @Input() step = 1;
  @Input() showTicks = false;
  @Input() showValueLabel = false;
  @Input() showLabels = false;
  @Input() minLabel: string | null = null;
  @Input() maxLabel: string | null = null;
  @Input() ariaLabel = '';
  @Input() ariaLabelStart = '';
  @Input() ariaLabelEnd = '';
  @Input() valueFormatter: ((v: number) => string) | null = null;

  @Input()
  set disabled(v: boolean) { this._disabled = v; }
  get disabled(): boolean { return this._disabled || this.cvaDisabled; }
  private _disabled = false;
  private cvaDisabled = false;

  @Input()
  set value(v: KpSliderValue | null | undefined) {
    if (v == null) return;
    this.writeInternal(v);
  }
  get value(): KpSliderValue {
    return this.mode === 'range' ? [this.value0, this.value1] : this.value0;
  }

  @Output() readonly valueChange = new EventEmitter<KpSliderValue>();

  @ViewChild('track') trackEl?: ElementRef<HTMLElement>;

  /** @internal */ value0 = 0;
  /** @internal */ value1 = 100;
  /** @internal */ focusedThumb: 0 | 1 = 0;

  private readonly cdr = inject(ChangeDetectorRef);
  private dragIndex: 0 | 1 | null = null;
  private pointerId: number | null = null;
  private onMoveBound = (e: PointerEvent) => this.onPointerMove(e);
  private onUpBound = (e: PointerEvent) => this.onPointerUp(e);

  ngOnDestroy(): void { this.endDrag(); }

  get hostClasses(): string {
    const c = ['kp-sl', `kp-sl--${this.size}`, `kp-sl--${this.mode}`];
    if (this.disabled) c.push('kp-sl--disabled');
    return c.join(' ');
  }

  get fillLeft(): number {
    return this.mode === 'single' ? 0 : this.pct(this.value0);
  }
  get fillWidth(): number {
    return this.mode === 'single'
      ? this.pct(this.value0)
      : this.pct(this.value1) - this.pct(this.value0);
  }

  /** Five evenly-distributed positions across the track. */
  readonly tickPercents = [0, 25, 50, 75, 100];

  pct(v: number): number {
    const span = this.max - this.min;
    if (span <= 0) return 0;
    return Math.max(0, Math.min(100, ((v - this.min) / span) * 100));
  }

  formatValue(v: number): string {
    return this.valueFormatter ? this.valueFormatter(v) : String(v);
  }

  onTrackPointerDown(event: PointerEvent): void {
    if (this.disabled) return;
    const target = event.target as HTMLElement;
    // Thumbs handle their own pointerdown; track click only targets bare track.
    if (target.classList.contains('kp-sl__thumb')) return;
    const v = this.valueFromEvent(event);
    const idx = this.nearestThumbIndex(v);
    this.setThumbValue(idx, v, true);
    this.startDrag(idx, event);
  }

  onThumbPointerDown(event: PointerEvent, idx: 0 | 1): void {
    if (this.disabled) return;
    this.focusedThumb = idx;
    this.startDrag(idx, event);
  }

  private startDrag(idx: 0 | 1, event: PointerEvent): void {
    this.dragIndex = idx;
    this.pointerId = event.pointerId;
    const target = event.target as HTMLElement;
    // Capture so dragging past the track bounds still fires moves here.
    if (target.setPointerCapture) {
      try { target.setPointerCapture(event.pointerId); } catch { /* ignore */ }
    }
    window.addEventListener('pointermove', this.onMoveBound);
    window.addEventListener('pointerup', this.onUpBound);
    window.addEventListener('pointercancel', this.onUpBound);
    event.preventDefault();
  }

  private onPointerMove(event: PointerEvent): void {
    if (this.dragIndex == null) return;
    if (this.pointerId != null && event.pointerId !== this.pointerId) return;
    const v = this.valueFromEvent(event);
    this.setThumbValue(this.dragIndex, v, true);
  }

  private onPointerUp(event: PointerEvent): void {
    if (this.pointerId != null && event.pointerId !== this.pointerId) return;
    this.endDrag();
    this.onTouched();
  }

  private endDrag(): void {
    this.dragIndex = null;
    this.pointerId = null;
    window.removeEventListener('pointermove', this.onMoveBound);
    window.removeEventListener('pointerup', this.onUpBound);
    window.removeEventListener('pointercancel', this.onUpBound);
  }

  onKeyDown(event: KeyboardEvent, idx: 0 | 1): void {
    if (this.disabled) return;
    const big = event.shiftKey ? 10 : 1;
    let next: number | null = null;
    const current = idx === 0 ? this.value0 : this.value1;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        next = current + this.step * big; break;
      case 'ArrowLeft':
      case 'ArrowDown':
        next = current - this.step * big; break;
      case 'Home': next = this.min; break;
      case 'End':  next = this.max; break;
      case 'PageUp':   next = current + this.step * 10; break;
      case 'PageDown': next = current - this.step * 10; break;
      default: return;
    }
    event.preventDefault();
    this.setThumbValue(idx, next, true);
  }

  onBlur(): void { this.onTouched(); }

  private valueFromEvent(event: PointerEvent): number {
    const el = this.trackEl?.nativeElement;
    if (!el) return this.min;
    const rect = el.getBoundingClientRect();
    const ratio = rect.width > 0 ? (event.clientX - rect.left) / rect.width : 0;
    const raw = this.min + ratio * (this.max - this.min);
    return this.snap(raw);
  }

  private snap(v: number): number {
    let snapped = Math.round((v - this.min) / this.step) * this.step + this.min;
    // Guard against float drift.
    snapped = Math.round(snapped * 1e6) / 1e6;
    return Math.max(this.min, Math.min(this.max, snapped));
  }

  private nearestThumbIndex(v: number): 0 | 1 {
    if (this.mode === 'single') return 0;
    return Math.abs(v - this.value0) <= Math.abs(v - this.value1) ? 0 : 1;
  }

  private setThumbValue(idx: 0 | 1, next: number, emit: boolean): void {
    let changed = false;
    const snapped = this.snap(next);
    if (idx === 0) {
      const clamped = this.mode === 'range' ? Math.min(snapped, this.value1) : snapped;
      if (clamped !== this.value0) { this.value0 = clamped; changed = true; }
    } else {
      const clamped = Math.max(snapped, this.value0);
      if (clamped !== this.value1) { this.value1 = clamped; changed = true; }
    }
    if (!changed) return;
    this.cdr.markForCheck();
    if (emit) {
      const v = this.value;
      this.valueChange.emit(v);
      this.onChange(v);
    }
  }

  /** Accepts a plain number (single) or a [start, end] tuple (range). */
  private writeInternal(v: KpSliderValue): void {
    if (Array.isArray(v)) {
      const [a, b] = v;
      this.value0 = this.snap(Math.min(a, b));
      this.value1 = this.snap(Math.max(a, b));
    } else if (typeof v === 'number') {
      this.value0 = this.snap(v);
    }
    this.cdr.markForCheck();
  }

  // ControlValueAccessor
  private onChange: (v: KpSliderValue) => void = () => { /* no-op */ };
  private onTouched: () => void = () => { /* no-op */ };

  writeValue(v: KpSliderValue | null | undefined): void {
    if (v == null) return;
    this.writeInternal(v);
  }
  registerOnChange(fn: (v: KpSliderValue) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(d: boolean): void { this.cvaDisabled = d; this.cdr.markForCheck(); }
}
