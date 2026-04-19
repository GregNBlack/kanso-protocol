import {
  Component,
  Input,
  ChangeDetectionStrategy,
  forwardRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { KpState } from '@kanso-protocol/core';

export type KpTextareaSize = 'sm' | 'md' | 'lg';
export type KpTextareaResize = 'both' | 'vertical' | 'horizontal' | 'none';

/**
 * Kanso Protocol — Textarea Component
 *
 * Multi-line text input. Shares Input's size/state grammar; adds a resize handle
 * and optional character counter for length-constrained fields.
 *
 * @example
 * <kp-textarea [(ngModel)]="bio" placeholder="Tell us about yourself"></kp-textarea>
 * <kp-textarea size="lg" [maxLength]="500" [showCounter]="true"></kp-textarea>
 */
@Component({
  selector: 'kp-textarea',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => KpTextareaComponent),
      multi: true,
    },
  ],
  host: {
    '[class]': 'hostClasses',
    '[attr.aria-invalid]': 'forceState === "error" || null',
    '[attr.aria-disabled]': 'disabled || null',
  },
  template: `
    <textarea
      class="kp-textarea__field"
      [rows]="rows"
      [placeholder]="placeholder"
      [disabled]="disabled"
      [attr.maxlength]="maxLength ?? null"
      [value]="value ?? ''"
      (input)="onInputChange($event)"
      (blur)="onTouched()"
    ></textarea>
    @if (showCounter) {
      <span class="kp-textarea__counter">{{ currentLength }}/{{ maxLength }}</span>
    }
    @if (resize !== 'none' && !disabled) {
      <span class="kp-textarea__grip" aria-hidden="true">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M 9 1 L 1 9" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/>
          <path d="M 9 5 L 5 9" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/>
        </svg>
      </span>
    }
  `,
  styles: [`
    :host {
      position: relative;
      display: inline-flex;
      flex-direction: column;
      box-sizing: border-box;
      width: 320px;
      padding: 0;
      border: 1px solid var(--kp-input-border, #D4D4D8);
      border-radius: var(--kp-textarea-radius);
      background: var(--kp-input-bg, #FFFFFF);
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
      transition:
        border-color var(--kp-motion-duration-fast, 100ms) ease,
        background var(--kp-motion-duration-fast, 100ms) ease;
    }

    :host(:hover:not(.kp-textarea--disabled):not(.kp-textarea--error)),
    :host(.kp-textarea--hover) { border-color: var(--kp-input-border-hover, #A1A1AA); }
    :host(:focus-within:not(.kp-textarea--disabled):not(.kp-textarea--error)),
    :host(.kp-textarea--focus) { border-color: var(--kp-input-border-focus, #2563EB); }
    :host(.kp-textarea--active) { border-color: var(--kp-input-border-active, #71717A); }
    :host(.kp-textarea--disabled) {
      background: var(--kp-input-bg-disabled, #FAFAFA);
      border-color: var(--kp-input-border-disabled, #E4E4E7);
      cursor: not-allowed;
    }
    :host(.kp-textarea--error) { border-color: var(--kp-input-border-error, #EF4444); }
    :host(.kp-textarea--filled) { background: #F4F4F5; border-color: transparent; }

    .kp-textarea__field {
      display: block;
      box-sizing: border-box;
      flex: 1 1 auto;
      width: 100%;
      min-height: var(--kp-textarea-min-h);
      border: none;
      outline: none;
      background: transparent;
      color: var(--kp-input-fg, #18181B);
      font: inherit;
      font-size: var(--kp-textarea-fs);
      line-height: var(--kp-textarea-lh);
      padding-top: var(--kp-textarea-pad-y);
      padding-right: var(--kp-textarea-pad-x);
      padding-bottom: 22px; /* reserve space for counter + resize grip — matches Figma */
      padding-left: var(--kp-textarea-pad-x);
      margin: 0;
      resize: both;
      border-radius: inherit;
    }
    :host(.kp-textarea--no-resize) .kp-textarea__field { resize: none; }
    :host(.kp-textarea--resize-vertical) .kp-textarea__field { resize: vertical; }
    :host(.kp-textarea--resize-horizontal) .kp-textarea__field { resize: horizontal; }

    .kp-textarea__field::placeholder { color: var(--kp-input-placeholder, #A1A1AA); }
    .kp-textarea__field:disabled { color: var(--kp-input-fg-disabled, #A1A1AA); cursor: not-allowed; }

    /* Custom thin scrollbar on the textarea itself */
    .kp-textarea__field::-webkit-scrollbar {
      width: 6px;
      background: transparent;
    }
    .kp-textarea__field::-webkit-scrollbar-track { background: transparent; }
    .kp-textarea__field::-webkit-scrollbar-thumb {
      background: #D4D4D8;
      border-radius: 3px;
      border-right: 2px solid transparent;
      background-clip: padding-box;
    }
    .kp-textarea__field::-webkit-scrollbar-thumb:hover { background: #A1A1AA; background-clip: padding-box; }

    /* Hide native resize grip; we draw our own below */
    .kp-textarea__field::-webkit-resizer { background: transparent; }

    .kp-textarea__grip {
      position: absolute;
      right: 4px;
      bottom: 4px;
      width: 10px;
      height: 10px;
      color: #A1A1AA;
      pointer-events: none; /* native resize drag still fires on textarea below */
      z-index: 2;
    }
    .kp-textarea__grip svg { display: block; }
    /* Transparent buttons at top/bottom shorten the scrollbar track, keeping it
       within the straight part of the rounded border and clear of the resize grip */
    .kp-textarea__field::-webkit-scrollbar-button:vertical:decrement,
    .kp-textarea__field::-webkit-scrollbar-button:vertical:increment {
      display: block;
      background: transparent;
      border: none;
    }
    :host(.kp-textarea--sm) .kp-textarea__field::-webkit-scrollbar-button:vertical:decrement,
    :host(.kp-textarea--sm) .kp-textarea__field::-webkit-scrollbar-button:vertical:increment {
      height: 10px;
    }
    :host(.kp-textarea--md) .kp-textarea__field::-webkit-scrollbar-button:vertical:decrement,
    :host(.kp-textarea--md) .kp-textarea__field::-webkit-scrollbar-button:vertical:increment {
      height: 12px;
    }
    :host(.kp-textarea--lg) .kp-textarea__field::-webkit-scrollbar-button:vertical:decrement,
    :host(.kp-textarea--lg) .kp-textarea__field::-webkit-scrollbar-button:vertical:increment {
      height: 14px;
    }

    .kp-textarea__counter {
      position: absolute;
      right: 20px;
      bottom: 4px;
      font-size: 12px;
      line-height: 16px;
      color: #A1A1AA;
      font-variant-numeric: tabular-nums;
      pointer-events: none;
      background: var(--kp-input-bg, #FFFFFF);
      padding-left: 4px;
    }
    :host(.kp-textarea--filled) .kp-textarea__counter { background: #F4F4F5; }
    /* When the custom grip is hidden, align counter to the same inset as the bottom */
    :host(.kp-textarea--no-resize) .kp-textarea__counter { right: 6px; }

    /* Sizes */
    :host(.kp-textarea--sm) {
      --kp-textarea-pad-x: 8px; --kp-textarea-pad-y: 6px;
      --kp-textarea-radius: 10px; --kp-textarea-fs: 12px; --kp-textarea-lh: 16px;
      --kp-textarea-min-h: 60px;
    }
    :host(.kp-textarea--md) {
      --kp-textarea-pad-x: 12px; --kp-textarea-pad-y: 8px;
      --kp-textarea-radius: 12px; --kp-textarea-fs: 14px; --kp-textarea-lh: 20px;
      --kp-textarea-min-h: 72px;
    }
    :host(.kp-textarea--lg) {
      --kp-textarea-pad-x: 14px; --kp-textarea-pad-y: 10px;
      --kp-textarea-radius: 14px; --kp-textarea-fs: 16px; --kp-textarea-lh: 24px;
      --kp-textarea-min-h: 88px;
    }
  `]
})
export class KpTextareaComponent implements ControlValueAccessor {
  @Input() size: KpTextareaSize = 'md';
  @Input() placeholder = '';
  @Input() rows = 3;
  @Input() maxLength: number | null = null;
  @Input() showCounter = false;
  @Input() resize: KpTextareaResize = 'both';
  @Input() filled = false;
  @Input() disabled = false;
  @Input() forceState: KpState | null = null;

  value: string | null = null;

  get currentLength(): number {
    return (this.value ?? '').length;
  }

  get hostClasses(): string {
    const c = ['kp-textarea', `kp-textarea--${this.size}`];
    if (this.filled) c.push('kp-textarea--filled');
    if (this.resize === 'none') c.push('kp-textarea--no-resize');
    else if (this.resize === 'vertical') c.push('kp-textarea--resize-vertical');
    else if (this.resize === 'horizontal') c.push('kp-textarea--resize-horizontal');
    if (this.showCounter) c.push('kp-textarea--has-counter');
    if (this.forceState) {
      c.push(`kp-textarea--${this.forceState}`);
    } else if (this.disabled) {
      c.push('kp-textarea--disabled');
    }
    return c.join(' ');
  }

  onChange: (v: string) => void = () => { /* no-op */ };
  onTouched: () => void = () => { /* no-op */ };

  onInputChange(event: Event): void {
    const t = event.target as HTMLTextAreaElement;
    this.value = t.value;
    this.onChange(t.value);
  }

  writeValue(v: string | null): void { this.value = v; }
  registerOnChange(fn: (v: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(d: boolean): void { this.disabled = d; }
}
