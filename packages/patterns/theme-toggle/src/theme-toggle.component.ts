import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  Output,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

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
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClasses' },
  template: `
    @if (variant === 'icon') {
      <button
        type="button"
        class="kp-theme-toggle__icon-btn"
        [attr.aria-label]="'Toggle theme (current: ' + currentTheme + ')'"
        (click)="cycle()"
      >
        <i [class]="'ti ti-' + iconName(currentTheme)" aria-hidden="true"></i>
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
            <i [class]="'ti ti-' + iconName(t)" aria-hidden="true"></i>
          </button>
        }
      </div>
    } @else {
      @if (showLabel) {
        <span class="kp-theme-toggle__label">Theme</span>
      }
      <div class="kp-theme-toggle__dropdown-wrap">
        <button
          type="button"
          class="kp-theme-toggle__dropdown"
          [class.kp-theme-toggle__dropdown--open]="isOpen()"
          [attr.aria-haspopup]="'listbox'"
          [attr.aria-expanded]="isOpen()"
          (click)="toggleOpen()"
        >
          <i [class]="'ti ti-' + iconName(currentTheme)" aria-hidden="true"></i>
          <span class="kp-theme-toggle__dropdown-label">{{ themeLabel(currentTheme) }}</span>
          <i class="ti ti-chevron-down kp-theme-toggle__chevron" aria-hidden="true"></i>
        </button>
        @if (isOpen()) {
          <div #menu class="kp-theme-toggle__menu" role="listbox" aria-label="Theme">
            @for (t of themes; track t) {
              <button
                type="button"
                role="option"
                class="kp-theme-toggle__option"
                [class.kp-theme-toggle__option--selected]="currentTheme === t"
                [attr.aria-selected]="currentTheme === t"
                (click)="selectFromMenu(t)"
              >
                <i [class]="'ti ti-' + iconName(t)" aria-hidden="true"></i>
                <span>{{ themeLabel(t) }}</span>
                @if (currentTheme === t) {
                  <i class="ti ti-check kp-theme-toggle__option-check" aria-hidden="true"></i>
                }
              </button>
            }
          </div>
        }
      </div>
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

    :host .ti {
      font-size: var(--kp-theme-glyph, 18px);
      line-height: 1;
    }
    :host .ti.kp-theme-toggle__chevron {
      font-size: 14px;
      color: var(--kp-color-gray-500, #71717A);
    }

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
    .kp-theme-toggle__dropdown:hover,
    .kp-theme-toggle__dropdown--open {
      background: var(--kp-color-gray-100, #F4F4F5);
      color: var(--kp-color-gray-900, #18181B);
    }
    .kp-theme-toggle__dropdown-label { min-width: 44px; text-align: left; }

    .kp-theme-toggle__dropdown-wrap {
      position: relative;
      display: inline-block;
    }
    .kp-theme-toggle__menu {
      position: fixed;
      width: max-content;
      padding: 4px;
      border-radius: 10px;
      background: var(--kp-color-white, #FFFFFF);
      border: 1px solid var(--kp-color-gray-200, #E4E4E7);
      box-shadow: 0 8px 24px -4px rgba(0,0,0,0.08), 0 4px 8px -4px rgba(0,0,0,0.04);
      z-index: 1000;
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
    }
    .kp-theme-toggle__option {
      all: unset;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 7px 10px;
      border-radius: 6px;
      font-size: 13px;
      color: var(--kp-color-gray-700, #3F3F46);
      cursor: pointer;
      transition: background 120ms ease, color 120ms ease;
    }
    .kp-theme-toggle__option:hover {
      background: var(--kp-color-gray-100, #F4F4F5);
      color: var(--kp-color-gray-900, #18181B);
    }
    .kp-theme-toggle__option--selected {
      color: var(--kp-color-gray-900, #18181B);
      font-weight: 500;
    }
    .kp-theme-toggle__option-check {
      margin-left: auto;
      color: var(--kp-color-blue-600, #2563EB);
      font-size: 14px;
    }
    :host .ti.kp-theme-toggle__option-check { font-size: 14px; }

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
export class KpThemeToggleComponent implements AfterViewChecked, OnDestroy {
  @Input() variant: KpThemeToggleVariant = 'icon';
  @Input() size: KpThemeToggleSize = 'md';
  @Input() currentTheme: KpThemeValue = 'light';
  @Input() showLabel = false;

  @Output() themeChange = new EventEmitter<KpThemeValue>();
  @Output() dropdownClick = new EventEmitter<void>();

  readonly themes = THEMES;
  readonly isOpen = signal(false);

  @ViewChild('menu') menuEl?: ElementRef<HTMLElement>;

  private readonly hostRef = inject(ElementRef<HTMLElement>);
  private readonly doc = inject(DOCUMENT);
  private portaledMenu: HTMLElement | null = null;

  ngAfterViewChecked(): void {
    if (!this.isOpen()) return;
    const menu = this.menuEl?.nativeElement;
    // Portal menu to <body> so transformed/clipped ancestors can't clip it.
    if (menu && this.doc?.body && menu.parentElement !== this.doc.body) {
      this.doc.body.appendChild(menu);
      this.portaledMenu = menu;
      window.addEventListener('scroll', this.reposition, true);
      window.addEventListener('resize', this.reposition);
    }
    this.positionMenu();
  }

  ngOnDestroy(): void {
    this.cleanupMenu();
  }

  private cleanupMenu(): void {
    window.removeEventListener('scroll', this.reposition, true);
    window.removeEventListener('resize', this.reposition);
    if (this.portaledMenu && this.portaledMenu.parentElement === this.doc?.body) {
      this.portaledMenu.remove();
    }
    this.portaledMenu = null;
  }

  private closeMenu(): void {
    if (!this.isOpen()) return;
    this.cleanupMenu();
    this.isOpen.set(false);
  }

  private readonly reposition = () => this.positionMenu();

  private positionMenu(): void {
    const menu = this.menuEl?.nativeElement;
    const trigger = this.hostRef.nativeElement.querySelector('.kp-theme-toggle__dropdown') as HTMLElement | null;
    if (!menu || !trigger) return;
    const rect = trigger.getBoundingClientRect();
    menu.style.top = `${rect.bottom + 6}px`;
    menu.style.left = `${rect.left}px`;
    menu.style.right = 'auto';
  }

  @HostListener('document:click', ['$event'])
  onDocClick(event: MouseEvent): void {
    if (!this.isOpen()) return;
    const target = event.target as Node;
    const host = this.hostRef.nativeElement;
    const portaled = this.portaledMenu;
    const insideHost = host && host.contains(target);
    const insideMenu = portaled && portaled.contains(target);
    if (!insideHost && !insideMenu) this.closeMenu();
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    this.closeMenu();
  }

  toggleOpen(): void {
    if (this.isOpen()) {
      this.closeMenu();
    } else {
      this.isOpen.set(true);
      this.dropdownClick.emit();
    }
  }

  selectFromMenu(t: KpThemeValue): void {
    this.select(t);
    this.closeMenu();
  }

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

  iconName(t: KpThemeValue): string {
    return t === 'light' ? 'sun-high' : t === 'dark' ? 'moon' : 'device-desktop';
  }
}
