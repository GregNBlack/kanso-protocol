import {
  AfterViewInit,
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ElementRef,
  OnDestroy,
  forwardRef,
  ViewChildren,
  QueryList,
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { KpSize } from '@kanso-protocol/core';

export interface KpSegmentOption {
  value: string;
  label?: string;
  /** SVG `d` attribute — Tabler-style stroked path (paired with stroke="currentColor") */
  icon?: string;
  disabled?: boolean;
}

export type KpSegmentedDisplay = 'text' | 'icon' | 'icon-text';

let nextGroupId = 0;

/**
 * Kanso Protocol — SegmentedControl
 *
 * Pill-style switcher backed by real native `<input type="radio">` group.
 * Browser handles mutual-exclusion + arrow-key navigation; in a `<form>`
 * the checked radio's value goes into FormData. The visual "pill" is a
 * separate absolutely-positioned element that animates to the selected
 * segment.
 *
 * @example
 * <kp-segmented-control
 *   [options]="[{value:'day',label:'Day'},{value:'week',label:'Week'}]"
 *   [(ngModel)]="period">
 * </kp-segmented-control>
 */
@Component({
  selector: 'kp-segmented-control',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => KpSegmentedControlComponent),
      multi: true,
    },
  ],
  host: {
    '[class]': 'hostClasses',
    '[attr.role]': '"radiogroup"',
    '[attr.aria-disabled]': 'isDisabled || null',
  },
  template: `
    <span #pill class="kp-segmented-control__pill" aria-hidden="true"></span>

    @for (opt of options; track opt.value; let i = $index) {
      <label
        #seg
        class="kp-segmented-control__segment"
        [class.kp-segmented-control__segment--selected]="opt.value === value"
        [class.kp-segmented-control__segment--disabled]="opt.disabled">
        <input
          type="radio"
          class="kp-segmented-control__input"
          [name]="groupName"
          [value]="opt.value"
          [checked]="opt.value === value"
          [disabled]="isDisabled || !!opt.disabled"
          [attr.aria-label]="showLabel && opt.label ? null : (opt.label || opt.value)"
          (change)="select(opt)"
          (focus)="onTouched()"
        />
        @if (showIcon && opt.icon) {
          <svg
            class="kp-segmented-control__icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true">
            <path [attr.d]="opt.icon"/>
          </svg>
        }
        @if (showLabel && opt.label) {
          <span class="kp-segmented-control__label">{{ opt.label }}</span>
        }
      </label>
    }
  `,
  styles: [`
    :host {
      position: relative;
      display: inline-flex;
      align-items: stretch;
      box-sizing: border-box;
      gap: 2px;
      padding: 2px;
      border-radius: var(--kp-segmented-radius);
      background: var(--kp-color-segmented-track-bg);
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
    }
    :host(.kp-segmented-control--disabled) { opacity: 0.6; }

    .kp-segmented-control__pill {
      position: absolute;
      top: 2px;
      left: 0;
      width: var(--kp-pill-w, 0);
      height: calc(100% - 4px);
      border-radius: var(--kp-segmented-segment-radius);
      background: var(--kp-color-segmented-segment-bg-selected);
      box-shadow: var(--kp-elevation-raised);
      transform: translateX(var(--kp-pill-x, 0));
      opacity: var(--kp-pill-opacity, 0);
      pointer-events: none;
      z-index: 0;
    }
    :host(.kp-segmented-control--ready) .kp-segmented-control__pill {
      transition:
        transform 240ms cubic-bezier(0.32, 0.72, 0, 1),
        width     240ms cubic-bezier(0.32, 0.72, 0, 1),
        opacity   160ms ease;
    }

    .kp-segmented-control__segment {
      position: relative;
      z-index: 1;
      flex: 0 0 auto;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--kp-segmented-gap);
      height: var(--kp-segmented-segment-h);
      padding: 0 var(--kp-segmented-pad-x);
      border-radius: var(--kp-segmented-segment-radius);
      color: var(--kp-color-segmented-segment-fg-unselected-rest);
      font-size: var(--kp-segmented-fs);
      font-weight: 500;
      line-height: var(--kp-segmented-lh);
      cursor: pointer;
      user-select: none;
      white-space: nowrap;
      transition: color var(--kp-motion-duration-normal) cubic-bezier(0.32, 0.72, 0, 1);
    }
    .kp-segmented-control__segment:hover:not(.kp-segmented-control__segment--selected):not(.kp-segmented-control__segment--disabled) {
      color: var(--kp-color-segmented-segment-fg-unselected-hover);
    }
    .kp-segmented-control__segment--selected {
      color: var(--kp-color-segmented-segment-fg-selected);
    }
    .kp-segmented-control__segment--disabled {
      color: var(--kp-color-segmented-segment-fg-disabled);
      cursor: not-allowed;
    }

    /* sr-only clip — input stays in a11y tree so axe sees the
       radiogroup's required children; label-wrapping forwards click. */
    .kp-segmented-control__input {
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
    .kp-segmented-control__input:focus-visible + .kp-segmented-control__icon,
    .kp-segmented-control__segment:has(.kp-segmented-control__input:focus-visible) {
      outline: 2px solid var(--kp-color-focus-ring);
      outline-offset: 1px;
    }

    .kp-segmented-control__icon { flex-shrink: 0; display: block; }
    .kp-segmented-control__label { display: inline-block; }

    .kp-segmented-control__icon {
      width: var(--kp-segmented-icon-size);
      height: var(--kp-segmented-icon-size);
      flex-shrink: 0;
    }

    /* === Sizes === */
    :host(.kp-segmented-control--xs) {
      --kp-segmented-radius: 8px;
      --kp-segmented-segment-h: 20px; --kp-segmented-segment-radius: 6px;
      --kp-segmented-pad-x: 8px; --kp-segmented-gap: 6px;
      --kp-segmented-fs: 12px; --kp-segmented-lh: 16px;
      --kp-segmented-icon-size: 14px;
    }
    :host(.kp-segmented-control--sm) {
      --kp-segmented-radius: 10px;
      --kp-segmented-segment-h: 24px; --kp-segmented-segment-radius: 8px;
      --kp-segmented-pad-x: 10px; --kp-segmented-gap: 6px;
      --kp-segmented-fs: 14px; --kp-segmented-lh: 20px;
      --kp-segmented-icon-size: 16px;
    }
    :host(.kp-segmented-control--md) {
      --kp-segmented-radius: 12px;
      --kp-segmented-segment-h: 32px; --kp-segmented-segment-radius: 10px;
      --kp-segmented-pad-x: 12px; --kp-segmented-gap: 8px;
      --kp-segmented-fs: 14px; --kp-segmented-lh: 20px;
      --kp-segmented-icon-size: 18px;
    }
    :host(.kp-segmented-control--lg) {
      --kp-segmented-radius: 14px;
      --kp-segmented-segment-h: 40px; --kp-segmented-segment-radius: 12px;
      --kp-segmented-pad-x: 14px; --kp-segmented-gap: 8px;
      --kp-segmented-fs: 16px; --kp-segmented-lh: 24px;
      --kp-segmented-icon-size: 22px;
    }
    :host(.kp-segmented-control--xl) {
      --kp-segmented-radius: 16px;
      --kp-segmented-segment-h: 48px; --kp-segmented-segment-radius: 14px;
      --kp-segmented-pad-x: 16px; --kp-segmented-gap: 8px;
      --kp-segmented-fs: 20px; --kp-segmented-lh: 28px;
      --kp-segmented-icon-size: 24px;
    }
  `],
})
export class KpSegmentedControlComponent
  implements ControlValueAccessor, AfterViewInit, OnDestroy {
  @Input() size: KpSize = 'md';
  @Input() options: KpSegmentOption[] = [];
  @Input() display: KpSegmentedDisplay = 'text';
  @Input() disabled = false;
  /** Native radio-group name. Required for FormData when in a `<form>`. Auto-generated if omitted. */
  @Input() name: string | null = null;

  @Output() valueChange = new EventEmitter<string>();

  value: string | null = null;
  private cvaDisabled = false;
  private ready = false;
  private ro: ResizeObserver | null = null;
  private readonly autoName = `kp-segmented-${++nextGroupId}`;

  @ViewChildren('seg') private segEls!: QueryList<ElementRef<HTMLElement>>;

  private readonly destroyed$ = new Subject<void>();

  constructor(
    private host: ElementRef<HTMLElement>,
    private cdr: ChangeDetectorRef,
  ) {}

  get isDisabled(): boolean { return this.disabled || this.cvaDisabled; }
  get showIcon(): boolean { return this.display === 'icon' || this.display === 'icon-text'; }
  get showLabel(): boolean { return this.display === 'text' || this.display === 'icon-text'; }
  get groupName(): string { return this.name || this.autoName; }

  get hostClasses(): string {
    const c = ['kp-segmented-control', `kp-segmented-control--${this.size}`];
    if (this.isDisabled) c.push('kp-segmented-control--disabled');
    if (this.ready) c.push('kp-segmented-control--ready');
    return c.join(' ');
  }

  ngAfterViewInit(): void {
    this.updatePill();
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        this.ready = true;
        this.cdr.markForCheck();
      }),
    );
    this.ro = new ResizeObserver(() => this.updatePill());
    this.ro.observe(this.host.nativeElement);
    this.segEls.changes
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => queueMicrotask(() => this.updatePill()));
  }

  ngOnDestroy(): void {
    this.ro?.disconnect();
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  select(opt: KpSegmentOption): void {
    if (this.isDisabled || opt.disabled || opt.value === this.value) return;
    this.value = opt.value;
    this.onChange(opt.value);
    this.valueChange.emit(opt.value);
    this.onTouched();
    this.cdr.markForCheck();
    queueMicrotask(() => this.updatePill());
  }

  private updatePill(): void {
    if (!this.segEls) return;
    const host = this.host.nativeElement;
    const idx = this.options.findIndex(o => o.value === this.value);
    if (idx < 0) {
      host.style.setProperty('--kp-pill-opacity', '0');
      return;
    }
    const seg = this.segEls.get(idx)?.nativeElement;
    if (!seg) {
      host.style.setProperty('--kp-pill-opacity', '0');
      return;
    }
    host.style.setProperty('--kp-pill-x', `${seg.offsetLeft}px`);
    host.style.setProperty('--kp-pill-w', `${seg.offsetWidth}px`);
    host.style.setProperty('--kp-pill-opacity', '1');
  }

  onChange: (v: string | null) => void = () => { /* no-op */ };
  onTouched: () => void = () => { /* no-op */ };

  writeValue(v: string | null): void {
    this.value = typeof v === 'string' ? v : null;
    this.cdr.markForCheck();
    queueMicrotask(() => this.updatePill());
  }
  registerOnChange(fn: (v: string | null) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(d: boolean): void { this.cvaDisabled = d; this.cdr.markForCheck(); }
}
