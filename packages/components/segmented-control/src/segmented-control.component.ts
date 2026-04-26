import {
  AfterViewInit,
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  DestroyRef,
  ElementRef,
  OnDestroy,
  forwardRef,
  inject,
  ViewChild,
  ViewChildren,
  QueryList,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
 * Pill-style switcher. One white "pill" lives behind the segments and slides
 * horizontally to the selected segment's position. Segments have transparent
 * background; they only change text color when selected.
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
    <span #pill class="kp-segmented-control__pill" aria-hidden="true"></span>

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
      position: relative;
      display: inline-flex;
      align-items: stretch;
      box-sizing: border-box;
      gap: 2px;
      padding: 2px;
      border-radius: var(--kp-segmented-radius);
      background: var(--kp-color-segmented-track-bg, var(--kp-color-gray-100));
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
    }
    :host(.kp-segmented-control--disabled) {
      opacity: 0.6;
      pointer-events: none;
    }

    /* The one-and-only pill. Starts hidden; positions via --kp-pill-x/w
       set imperatively so the transition smoothly animates when they change. */
    .kp-segmented-control__pill {
      position: absolute;
      top: 2px;
      left: 0;
      width: var(--kp-pill-w, 0);
      height: calc(100% - 4px);
      border-radius: var(--kp-segmented-segment-radius);
      background: var(--kp-color-segmented-segment-bg-selected, var(--kp-color-white));
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
      border: none;
      border-radius: var(--kp-segmented-segment-radius);
      background: transparent;
      color: var(--kp-color-segmented-segment-fg-unselected-rest, var(--kp-color-gray-600));
      font: inherit;
      font-size: var(--kp-segmented-fs);
      font-weight: 500;
      line-height: var(--kp-segmented-lh);
      cursor: pointer;
      user-select: none;
      white-space: nowrap;
      transition: color var(--kp-motion-duration-normal) cubic-bezier(0.32, 0.72, 0, 1);
    }

    .kp-segmented-control__segment:hover:not(.kp-segmented-control__segment--selected):not(:disabled) {
      color: var(--kp-color-segmented-segment-fg-unselected-hover, var(--kp-color-gray-900));
    }
    .kp-segmented-control__segment:focus-visible {
      outline: 2px solid var(--kp-color-focus-ring, var(--kp-color-blue-400));
      outline-offset: 1px;
    }
    .kp-segmented-control__segment:disabled {
      color: var(--kp-color-segmented-segment-fg-disabled, var(--kp-color-gray-400));
      cursor: not-allowed;
    }
    .kp-segmented-control__segment--selected {
      color: var(--kp-color-segmented-segment-fg-selected, var(--kp-color-gray-900));
    }

    .kp-segmented-control__icon { flex-shrink: 0; display: block; }
    .kp-segmented-control__label { display: inline-block; }

    /* === Sizes === */
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
export class KpSegmentedControlComponent
  implements ControlValueAccessor, AfterViewInit, OnDestroy {
  @Input() size: KpSize = 'md';
  @Input() options: KpSegmentOption[] = [];
  @Input() display: KpSegmentedDisplay = 'text';
  @Input() disabled = false;

  @Output() valueChange = new EventEmitter<string>();

  value: string | null = null;
  private cvaDisabled = false;
  private ready = false;
  private ro: ResizeObserver | null = null;

  @ViewChildren('seg') private segEls!: QueryList<ElementRef<HTMLButtonElement>>;

  readonly iconSizeMap: Record<KpSize, number> = { xs: 14, sm: 16, md: 18, lg: 22, xl: 24 };

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private host: ElementRef<HTMLElement>,
    private cdr: ChangeDetectorRef,
  ) {}

  get isDisabled(): boolean { return this.disabled || this.cvaDisabled; }
  get showIcon(): boolean { return this.display === 'icon' || this.display === 'icon-text'; }
  get showLabel(): boolean { return this.display === 'text' || this.display === 'icon-text'; }
  get iconSize(): number { return this.iconSizeMap[this.size]; }

  get hostClasses(): string {
    const c = ['kp-segmented-control', `kp-segmented-control--${this.size}`];
    if (this.isDisabled) c.push('kp-segmented-control--disabled');
    if (this.ready) c.push('kp-segmented-control--ready');
    return c.join(' ');
  }

  ngAfterViewInit(): void {
    // Place the pill at the currently-selected segment BEFORE enabling
    // transitions, so the initial render doesn't animate a slide from 0,0.
    this.updatePill();
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        this.ready = true;
        this.cdr.markForCheck();
      }),
    );
    // Re-measure if anything resizes (window, font load, responsive label change)
    this.ro = new ResizeObserver(() => this.updatePill());
    this.ro.observe(this.host.nativeElement);
    // Also recompute when options change after init
    this.segEls.changes
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => queueMicrotask(() => this.updatePill()));
  }

  ngOnDestroy(): void {
    this.ro?.disconnect();
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
    queueMicrotask(() => this.segEls.get(i)?.nativeElement.focus());
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

  // ControlValueAccessor
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
