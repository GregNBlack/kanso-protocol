import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { KpButtonComponent } from '@kanso-protocol/button';

export type KpSearchBarVariant = 'inline' | 'command-palette';
export type KpSearchBarSize = 'sm' | 'md' | 'lg';

export interface KpSearchResultItem {
  id: string;
  label: string;
  icon?: string;     // Tabler icon name (without 'ti-' prefix)
  shortcut?: string; // e.g. "⌘1"
}

export interface KpSearchResultGroup {
  label: string;     // "RECENT", "ACTIONS", "PAGES"
  items: KpSearchResultItem[];
}

/**
 * Kanso Protocol — SearchBar
 *
 * Two variants:
 * - `inline` — a simple search input with optional ⌘K shortcut hint,
 *   good for header search or page filters.
 * - `command-palette` — a self-contained panel: input + grouped
 *   results with shortcuts + footer helper keys. Typically rendered
 *   inside a Dialog/Overlay.
 *
 * The component is presentational; filtering results, opening the
 * palette via ⌘K, and committing selection are all consumer
 * responsibilities.
 *
 * @example
 * <!-- Inline in Header -->
 * <kp-search-bar variant="inline" size="md" [showShortcutHint]="true" (search)="onSearch($event)"/>
 *
 * <!-- Command Palette (inside a Dialog) -->
 * <kp-search-bar variant="command-palette" [groups]="results" (itemClick)="run($event)"/>
 */
@Component({
  selector: 'kp-search-bar',
  imports: [KpButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClasses' },
  template: `
    @if (variant === 'inline') {
      <div class="kp-search-bar__wrap" [class.kp-search-bar__wrap--focused]="focused">
        <i class="ti ti-search kp-search-bar__leading" aria-hidden="true"></i>
        <input
          class="kp-search-bar__input"
          type="search"
          [placeholder]="placeholder"
          [value]="value"
          (input)="handleInput($event)"
          (focus)="focused = true"
          (blur)="focused = false"
          [attr.aria-label]="placeholder"
        />
        @if (value) {
          <kp-button
            size="xs"
            variant="ghost"
            color="neutral"
            [iconOnly]="true"
            aria-label="Clear"
            (click)="clear()"
          >
            <svg kpButtonIconLeft viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </kp-button>
        } @else if (showShortcutHint) {
          <kbd class="kp-search-bar__shortcut">{{ shortcutHint }}</kbd>
        }
      </div>
    } @else {
      <div class="kp-search-bar__palette">
        <div class="kp-search-bar__palette-header">
          <i class="ti ti-search kp-search-bar__leading" aria-hidden="true"></i>
          <input
            class="kp-search-bar__palette-input"
            type="search"
            [placeholder]="placeholder"
            [value]="value"
            (input)="handleInput($event)"
            autofocus
          />
        </div>

        <div class="kp-search-bar__groups" role="listbox">
          @for (group of groups; track group.label) {
            <div class="kp-search-bar__group">
              <div class="kp-search-bar__group-label">{{ group.label }}</div>
              @for (item of group.items; track item.id) {
                <button
                  type="button"
                  role="option"
                  class="kp-search-bar__item"
                  (click)="itemClick.emit(item)"
                >
                  @if (item.icon) {
                    <i [class]="'ti ti-' + item.icon + ' kp-search-bar__item-icon'" aria-hidden="true"></i>
                  }
                  <span class="kp-search-bar__item-label">{{ item.label }}</span>
                  @if (item.shortcut) {
                    <kbd class="kp-search-bar__shortcut">{{ item.shortcut }}</kbd>
                  }
                </button>
              }
            </div>
          }
        </div>

        <div class="kp-search-bar__footer">
          <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
          <span><kbd>↵</kbd> select</span>
          <span><kbd>esc</kbd> close</span>
          <span class="kp-search-bar__footer-brand">Powered by Kanso</span>
        </div>
      </div>
    }
  `,
  styles: [`
    :host {
      display: inline-block;
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
    }
    :host(.kp-search-bar--command-palette) { display: block; width: 640px; max-width: 100%; }

    /* --- inline variant --- */
    .kp-search-bar__wrap {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      width: var(--kp-search-w, 400px);
      height: var(--kp-search-h, 36px);
      padding: 0 10px;
      border: 1px solid var(--kp-color-gray-200, var(--kp-color-gray-200));
      border-radius: 8px;
      background: var(--kp-color-gray-50, var(--kp-color-gray-50));
      transition: background 120ms ease, border-color 120ms ease, box-shadow 120ms ease;
    }
    .kp-search-bar__wrap--focused,
    .kp-search-bar__wrap:focus-within {
      background: var(--kp-color-white, var(--kp-color-white));
      border-color: var(--kp-color-blue-500, var(--kp-color-blue-500));
      box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
    }

    :host(.kp-search-bar--sm) { --kp-search-w: 320px; --kp-search-h: 32px; --kp-search-fs: 13px; }
    :host(.kp-search-bar--md) { --kp-search-w: 400px; --kp-search-h: 36px; --kp-search-fs: 14px; }
    :host(.kp-search-bar--lg) { --kp-search-w: 480px; --kp-search-h: 44px; --kp-search-fs: 15px; }

    .kp-search-bar__leading {
      flex: 0 0 auto;
      font-size: 18px;
      color: var(--kp-color-gray-500, var(--kp-color-gray-500));
    }

    .kp-search-bar__input {
      all: unset;
      flex: 1 1 auto;
      min-width: 0;
      height: 100%;
      font-size: var(--kp-search-fs, 14px);
      color: var(--kp-color-gray-900, var(--kp-color-gray-900));
    }
    .kp-search-bar__input::placeholder { color: var(--kp-color-gray-500, var(--kp-color-gray-500)); }
    .kp-search-bar__input::-webkit-search-cancel-button { display: none; }


    .kp-search-bar__shortcut {
      display: inline-flex;
      align-items: center;
      padding: 2px 6px;
      border: 1px solid var(--kp-color-gray-200, var(--kp-color-gray-200));
      border-radius: 4px;
      background: var(--kp-color-white, var(--kp-color-white));
      color: var(--kp-color-gray-600, var(--kp-color-gray-600));
      font-family: var(--kp-font-family-mono, 'JetBrains Mono', ui-monospace, monospace);
      font-size: 11px;
      font-weight: 500;
    }

    /* --- command palette variant --- */
    .kp-search-bar__palette {
      display: flex;
      flex-direction: column;
      border-radius: 12px;
      border: 1px solid var(--kp-color-search-palette-border, var(--kp-color-gray-200));
      background: var(--kp-color-search-palette-bg, var(--kp-color-white));
      box-shadow: 0 24px 48px -12px rgba(0,0,0,0.15), 0 8px 16px -8px rgba(0,0,0,0.08);
      overflow: hidden;
    }

    .kp-search-bar__palette-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 16px;
      border-bottom: 1px solid var(--kp-color-search-palette-border, var(--kp-color-gray-200));
    }
    .kp-search-bar__palette-header .kp-search-bar__leading { font-size: 20px; }
    .kp-search-bar__palette-input {
      all: unset;
      flex: 1 1 auto;
      font-size: 16px;
      color: var(--kp-color-gray-900, var(--kp-color-gray-900));
    }
    .kp-search-bar__palette-input::placeholder { color: var(--kp-color-gray-500, var(--kp-color-gray-500)); }

    .kp-search-bar__groups {
      padding: 8px;
      max-height: 420px;
      overflow-y: auto;
    }
    .kp-search-bar__group { display: flex; flex-direction: column; }
    .kp-search-bar__group + .kp-search-bar__group { margin-top: 8px; }
    .kp-search-bar__group-label {
      padding: 8px 12px 4px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      color: var(--kp-color-search-palette-group-label, var(--kp-color-gray-500));
    }

    .kp-search-bar__item {
      all: unset;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 13px;
      color: var(--kp-color-gray-700, var(--kp-color-gray-700));
      cursor: pointer;
      transition: background 120ms ease, color 120ms ease;
    }
    .kp-search-bar__item:hover { background: var(--kp-color-gray-100, var(--kp-color-gray-100)); color: var(--kp-color-gray-900, var(--kp-color-gray-900)); }
    .kp-search-bar__item-icon { font-size: 16px; color: var(--kp-color-gray-500, var(--kp-color-gray-500)); }
    .kp-search-bar__item:hover .kp-search-bar__item-icon { color: var(--kp-color-gray-900, var(--kp-color-gray-900)); }
    .kp-search-bar__item-label { flex: 1 1 auto; }

    .kp-search-bar__footer {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 8px 14px;
      border-top: 1px solid var(--kp-color-search-palette-border, var(--kp-color-gray-200));
      background: var(--kp-color-gray-50, var(--kp-color-gray-50));
      font-size: 11px;
      color: var(--kp-color-gray-500, var(--kp-color-gray-500));
    }
    .kp-search-bar__footer kbd {
      display: inline-flex;
      align-items: center;
      padding: 1px 5px;
      margin-right: 2px;
      border: 1px solid var(--kp-color-gray-200, var(--kp-color-gray-200));
      border-radius: 3px;
      background: var(--kp-color-white, var(--kp-color-white));
      color: var(--kp-color-gray-600, var(--kp-color-gray-600));
      font-family: inherit;
      font-size: 10px;
    }
    .kp-search-bar__footer-brand { margin-left: auto; color: var(--kp-color-gray-400, var(--kp-color-gray-400)); }
  `],
})
export class KpSearchBarComponent {
  @Input() variant: KpSearchBarVariant = 'inline';
  @Input() size: KpSearchBarSize = 'md';
  @Input() placeholder = 'Search anything...';
  @Input() value = '';
  @Input() showShortcutHint = true;
  @Input() shortcutHint = '⌘K';
  /** Result groups — only rendered in `command-palette` variant */
  @Input() groups: KpSearchResultGroup[] = [];

  @Output() valueChange = new EventEmitter<string>();
  @Output() search = new EventEmitter<string>();
  @Output() itemClick = new EventEmitter<KpSearchResultItem>();

  focused = false;

  get hostClasses(): string {
    return `kp-search-bar kp-search-bar--${this.variant} kp-search-bar--${this.size}`;
  }

  handleInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.valueChange.emit(this.value);
    this.search.emit(this.value);
  }

  clear(): void {
    this.value = '';
    this.valueChange.emit('');
    this.search.emit('');
  }
}
