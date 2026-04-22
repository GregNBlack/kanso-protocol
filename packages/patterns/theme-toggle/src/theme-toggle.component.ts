import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

export type KpThemeToggleVariant = 'icon' | 'segmented' | 'dropdown';
export type KpThemeToggleSize = 'sm' | 'md' | 'lg';
export type KpThemeValue = 'light' | 'dark' | 'system';

const THEMES: KpThemeValue[] = ['light', 'dark', 'system'];

/**
 * Kanso Protocol — ThemeToggle
 *
 * Three presentations for switching between light / dark / system
 * themes:
 * - `icon` — single icon button that cycles
 * - `segmented` — three inline icon segments, one selected
 * - `dropdown` — ghost button showing the current theme label; opens a menu
 *
 * The component emits `themeChange` when the user selects a value;
 * keeping the chosen theme (including `system`) up to the consumer.
 *
 * @example
 * <kp-theme-toggle
 *   variant="segmented"
 *   [showLabel]="true"
 *   [currentTheme]="theme()"
 *   (themeChange)="theme.set($event)"
 * />
 */
@Component({
  selector: 'kp-theme-toggle',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClasses' },
  template: `
    <ng-template #glyph let-t>
      @switch (t) {
        @case ('light') {
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
        }
        @case ('dark') {
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        }
        @default {
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>
        }
      }
    </ng-template>

    @if (variant === 'icon') {
      <button
        type="button"
        class="kp-theme-toggle__icon-btn"
        [attr.aria-label]="'Toggle theme (current: ' + currentTheme + ')'"
        (click)="cycle()"
      >
        <span class="kp-theme-toggle__glyph">
          <ng-container *ngTemplateOutlet="glyph; context: { $implicit: currentTheme }"/>
        </span>
      </button>
    } @else if (variant === 'segmented') {
      @if (showLabel) {
        <span class="kp-theme-toggle__label">Theme</span>
      }
      <div class="kp-theme-toggle__segments" role="tablist" aria-label="Theme">
        @for (t of themes; track t) {
          <button
            type="button"
            role="tab"
            class="kp-theme-toggle__segment"
            [class.kp-theme-toggle__segment--selected]="currentTheme === t"
            [attr.aria-selected]="currentTheme === t"
            [attr.aria-label]="t"
            (click)="select(t)"
          >
            <span class="kp-theme-toggle__glyph">
              <ng-container *ngTemplateOutlet="glyph; context: { $implicit: t }"/>
            </span>
          </button>
        }
      </div>
    } @else {
      @if (showLabel) {
        <span class="kp-theme-toggle__label">Theme</span>
      }
      <button
        type="button"
        class="kp-theme-toggle__dropdown"
        [attr.aria-haspopup]="'listbox'"
        (click)="dropdownClick.emit()"
      >
        <span class="kp-theme-toggle__glyph">
          <ng-container *ngTemplateOutlet="glyph; context: { $implicit: currentTheme }"/>
        </span>
        <span class="kp-theme-toggle__dropdown-label">{{ themeLabel(currentTheme) }}</span>
        <span class="kp-theme-toggle__glyph kp-theme-toggle__glyph--chevron">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
        </span>
      </button>
    }
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
    }

    .kp-theme-toggle__label {
      font-size: 14px;
      color: var(--kp-color-gray-700, #3F3F46);
    }

    .kp-theme-toggle__glyph {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: var(--kp-theme-glyph, 18px);
      height: var(--kp-theme-glyph, 18px);
    }
    .kp-theme-toggle__glyph ::ng-deep svg { width: 100%; height: 100%; }
    .kp-theme-toggle__glyph--chevron { --kp-theme-glyph: 14px; color: var(--kp-color-gray-500, #71717A); }

    /* Icon variant */
    .kp-theme-toggle__icon-btn {
      all: unset;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: var(--kp-theme-btn, 36px);
      height: var(--kp-theme-btn, 36px);
      border-radius: 8px;
      color: var(--kp-color-gray-600, #52525B);
      cursor: pointer;
      transition: background 120ms ease, color 120ms ease;
    }
    .kp-theme-toggle__icon-btn:hover { background: var(--kp-color-gray-100, #F4F4F5); color: var(--kp-color-gray-900, #18181B); }

    /* Segmented variant */
    .kp-theme-toggle__segments {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      padding: 2px;
      border: 1px solid var(--kp-color-gray-200, #E4E4E7);
      border-radius: 8px;
      background: var(--kp-color-gray-50, #FAFAFA);
    }
    .kp-theme-toggle__segment {
      all: unset;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: var(--kp-theme-seg, 28px);
      height: var(--kp-theme-seg, 28px);
      border-radius: 6px;
      color: var(--kp-color-gray-500, #71717A);
      cursor: pointer;
      transition: background 120ms ease, color 120ms ease;
    }
    .kp-theme-toggle__segment:hover { color: var(--kp-color-gray-900, #18181B); }
    .kp-theme-toggle__segment--selected {
      background: var(--kp-color-white, #FFFFFF);
      color: var(--kp-color-gray-900, #18181B);
      box-shadow: 0 1px 2px rgba(0,0,0,0.06);
    }

    /* Dropdown variant */
    .kp-theme-toggle__dropdown {
      all: unset;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 10px;
      border-radius: 8px;
      color: var(--kp-color-gray-700, #3F3F46);
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: background 120ms ease, color 120ms ease;
    }
    .kp-theme-toggle__dropdown:hover { background: var(--kp-color-gray-100, #F4F4F5); color: var(--kp-color-gray-900, #18181B); }
    .kp-theme-toggle__dropdown-label { min-width: 44px; text-align: left; }

    /* Sizes */
    :host(.kp-theme-toggle--sm) {
      --kp-theme-btn: 28px;
      --kp-theme-seg: 24px;
      --kp-theme-glyph: 16px;
    }
    :host(.kp-theme-toggle--md) {
      --kp-theme-btn: 36px;
      --kp-theme-seg: 28px;
      --kp-theme-glyph: 18px;
    }
    :host(.kp-theme-toggle--lg) {
      --kp-theme-btn: 44px;
      --kp-theme-seg: 36px;
      --kp-theme-glyph: 20px;
    }
  `],
})
export class KpThemeToggleComponent {
  @Input() variant: KpThemeToggleVariant = 'icon';
  @Input() size: KpThemeToggleSize = 'md';
  @Input() currentTheme: KpThemeValue = 'light';
  @Input() showLabel = false;

  @Output() themeChange = new EventEmitter<KpThemeValue>();
  @Output() dropdownClick = new EventEmitter<void>();

  readonly themes = THEMES;

  get hostClasses(): string {
    return `kp-theme-toggle kp-theme-toggle--${this.variant} kp-theme-toggle--${this.size}`;
  }

  cycle(): void {
    const idx = THEMES.indexOf(this.currentTheme);
    const next = THEMES[(idx + 1) % THEMES.length];
    this.currentTheme = next;
    this.themeChange.emit(next);
  }

  select(t: KpThemeValue): void {
    if (t === this.currentTheme) return;
    this.currentTheme = t;
    this.themeChange.emit(t);
  }

  themeLabel(t: KpThemeValue): string {
    return t === 'light' ? 'Light' : t === 'dark' ? 'Dark' : 'System';
  }
}
