import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ElementRef,
  forwardRef,
  ViewChildren,
  QueryList,
} from '@angular/core';
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

/**
 * Kanso Protocol — SegmentedControl
 *
 * Pill-style switcher: a gray track holding 2–5 segments, where the selected
 * segment is a white "pill" lifted above the track with a soft drop-shadow.
 * Options-driven so form integration works through a single string value.
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
    '[attr.role]': '"tablist"',
    '[attr.aria-disabled]': 'isDisabled || null',
  },
  template: `
    @for (opt of options; track opt.value; let i = $index) {
      <button
        #seg
        type="button"
        class="kp-segmented-control__segment"
        [class.kp-segmented-control__segment--selected]="opt.value === value"
        [class.kp-segmented-control__segment--disabled]="opt.disabled"
        [disabled]="isDisabled || opt.disabled"
        role="tab"
        [attr.aria-selected]="opt.value === value"
        [attr.tabindex]="opt.value === value && !isDisabled && !opt.disabled ? 0 : -1"
        (click)="select(opt)"
        (keydown)="onKey($event, i)">

        @if (showIcon && opt.icon) {
          <svg
            class="kp-segmented-control__icon"
            [attr.width]="iconSize"
            [attr.height]="iconSize"
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
      </button>
    }
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: stretch;
      box-sizing: border-box;
      gap: 2px;
      padding: 2px;
      border-radius: var(--kp-segmented-radius);
      background: var(--kp-color-segmented-track-bg, #F4F4F5);
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
    }
    :host(.kp-segmented-control--disabled) {
      opacity: 0.6;
      pointer-events: none;
    }

    .kp-segmented-control__segment {
      flex: 0 0 auto;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--kp-segmented-gap);
      height: var(--kp-segmented-segment-h);
      padding: 0 var(--kp-segmented-pad-x);
      border: none;
      border-radius: var(--kp-segmented-segment-radius);
      background: transparent;
      color: var(--kp-color-segmented-segment-fg-unselected-rest, #52525B);
      font: inherit;
      font-size: var(--kp-segmented-fs);
      font-weight: 500;
      line-height: var(--kp-segmented-lh);
      cursor: pointer;
      user-select: none;
      white-space: nowrap;
      transition:
        background var(--kp-motion-duration-fast, 120ms) ease,
        color var(--kp-motion-duration-fast, 120ms) ease,
        box-shadow var(--kp-motion-duration-fast, 120ms) ease;
    }

    .kp-segmented-control__segment:hover:not(.kp-segmented-control__segment--selected):not(:disabled) {
      background: var(--kp-color-segmented-segment-bg-unselected-hover, #E4E4E7);
      color: var(--kp-color-segmented-segment-fg-unselected-hover, #18181B);
    }
    .kp-segmented-control__segment:focus-visible {
      outline: 2px solid var(--kp-color-focus-ring, #60A5FA);
      outline-offset: 1px;
    }
    .kp-segmented-control__segment:disabled {
      color: var(--kp-color-segmented-segment-fg-disabled, #A1A1AA);
      cursor: not-allowed;
    }

    .kp-segmented-control__segment--selected {
      background: var(--kp-color-segmented-segment-bg-selected, #FFFFFF);
      color: var(--kp-color-segmented-segment-fg-selected, #18181B);
      box-shadow:
        0 1px 2px rgba(0, 0, 0, 0.06),
        0 1px 3px rgba(0, 0, 0, 0.08);
    }

    .kp-segmented-control__icon {
      flex-shrink: 0;
      display: block;
    }
    .kp-segmented-control__label {
      display: inline-block;
    }

    /* === Sizes — segment height + track padding = Input size === */
    :host(.kp-segmented-control--xs) {
      --kp-segmented-radius: 8px;
      --kp-segmented-segment-h: 20px; --kp-segmented-segment-radius: 6px;
      --kp-segmented-pad-x: 8px; --kp-segmented-gap: 6px;
      --kp-segmented-fs: 12px; --kp-segmented-lh: 16px;
    }
    :host(.kp-segmented-control--sm) {
      --kp-segmented-radius: 10px;
      --kp-segmented-segment-h: 24px; --kp-segmented-segment-radius: 8px;
      --kp-segmented-pad-x: 10px; --kp-segmented-gap: 6px;
      --kp-segmented-fs: 14px; --kp-segmented-lh: 20px;
    }
    :host(.kp-segmented-control--md) {
      --kp-segmented-radius: 12px;
      --kp-segmented-segment-h: 32px; --kp-segmented-segment-radius: 10px;
      --kp-segmented-pad-x: 12px; --kp-segmented-gap: 8px;
      --kp-segmented-fs: 14px; --kp-segmented-lh: 20px;
    }
    :host(.kp-segmented-control--lg) {
      --kp-segmented-radius: 14px;
      --kp-segmented-segment-h: 40px; --kp-segmented-segment-radius: 12px;
      --kp-segmented-pad-x: 14px; --kp-segmented-gap: 8px;
      --kp-segmented-fs: 16px; --kp-segmented-lh: 24px;
    }
    :host(.kp-segmented-control--xl) {
      --kp-segmented-radius: 16px;
      --kp-segmented-segment-h: 48px; --kp-segmented-segment-radius: 14px;
      --kp-segmented-pad-x: 16px; --kp-segmented-gap: 8px;
      --kp-segmented-fs: 20px; --kp-segmented-lh: 28px;
    }
  `],
})
export class KpSegmentedControlComponent implements ControlValueAccessor {
  @Input() size: KpSize = 'md';
  @Input() options: KpSegmentOption[] = [];
  /** What to render inside each segment: text only, icon only, or both */
  @Input() display: KpSegmentedDisplay = 'text';
  @Input() disabled = false;

  @Output() valueChange = new EventEmitter<string>();

  value: string | null = null;
  private cvaDisabled = false;

  @ViewChildren('seg') private segEls!: QueryList<ElementRef<HTMLButtonElement>>;

  readonly iconSizeMap: Record<KpSize, number> = { xs: 14, sm: 16, md: 18, lg: 22, xl: 24 };

  constructor(private cdr: ChangeDetectorRef) {}

  get isDisabled(): boolean {
    return this.disabled || this.cvaDisabled;
  }

  get showIcon(): boolean {
    return this.display === 'icon' || this.display === 'icon-text';
  }

  get showLabel(): boolean {
    return this.display === 'text' || this.display === 'icon-text';
  }

  get iconSize(): number {
    return this.iconSizeMap[this.size];
  }

  get hostClasses(): string {
    const c = ['kp-segmented-control', `kp-segmented-control--${this.size}`];
    if (this.isDisabled) c.push('kp-segmented-control--disabled');
    return c.join(' ');
  }

  select(opt: KpSegmentOption): void {
    if (this.isDisabled || opt.disabled || opt.value === this.value) return;
    this.value = opt.value;
    this.onChange(opt.value);
    this.valueChange.emit(opt.value);
    this.onTouched();
  }

  onKey(event: KeyboardEvent, index: number): void {
    const enabled = this.options
      .map((o, i) => ({ o, i }))
      .filter(({ o }) => !o.disabled);
    const pos = enabled.findIndex(({ i }) => i === index);
    if (pos < 0) return;

    let nextPos = pos;
    switch (event.key) {
      case 'ArrowRight': nextPos = (pos + 1) % enabled.length; break;
      case 'ArrowLeft':  nextPos = (pos - 1 + enabled.length) % enabled.length; break;
      case 'Home':       nextPos = 0; break;
      case 'End':        nextPos = enabled.length - 1; break;
      default: return;
    }
    event.preventDefault();
    const { o, i } = enabled[nextPos];
    this.select(o);
    // Move focus to the newly-selected segment
    queueMicrotask(() => {
      const el = this.segEls.get(i)?.nativeElement;
      el?.focus();
    });
  }

  // ControlValueAccessor
  onChange: (v: string | null) => void = () => { /* no-op */ };
  onTouched: () => void = () => { /* no-op */ };

  writeValue(v: string | null): void {
    this.value = typeof v === 'string' ? v : null;
    this.cdr.markForCheck();
  }
  registerOnChange(fn: (v: string | null) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(d: boolean): void { this.cvaDisabled = d; this.cdr.markForCheck(); }
}
