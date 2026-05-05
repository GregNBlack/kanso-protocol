import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
  inject,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { KpDialogComponent } from '@kanso-protocol/dialog';
import { injectKpStrings } from '@kanso-protocol/i18n';

export type KpCommandPaletteSize = 'sm' | 'md' | 'lg';

/** Modifier-aware shortcut definition. `mod` resolves to ⌘ on macOS, Ctrl elsewhere. */
export interface KpCommandShortcut {
  /** Combo, e.g. `'mod+k'`, `'mod+shift+p'`, `'?'`. Single key without modifier is allowed. */
  combo: string;
}

export interface KpCommandItem {
  id: string;
  label: string;
  /** Optional secondary text rendered after the label. */
  hint?: string;
  /** Per-item shortcut hint (visual only — selecting via the global shortcut is up to the consumer). */
  shortcut?: string;
  disabled?: boolean;
  data?: unknown;
}

export interface KpCommandGroup {
  id: string;
  label?: string;
  items: KpCommandItem[];
}

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform);

/**
 * Kanso Protocol — CommandPalette
 *
 * Modal command launcher (⌘K-style). Composes `<kp-dialog>` (chromeless)
 * with an internal input + grouped result list. Keyboard navigation:
 * `↑` / `↓` highlight, `Enter` select, `Esc` close. The component owns
 * the open state when `[shortcut]` is set — the global keydown listener
 * toggles `open` on the configured combo (default `mod+k`).
 *
 * The consumer supplies `[groups]`. Filtering is the consumer's job —
 * the component re-emits `(filterChange)` on every input keystroke.
 *
 * @example
 * <kp-command-palette
 *   [(open)]="paletteOpen"
 *   [groups]="results"
 *   [shortcut]="{ combo: 'mod+k' }"
 *   (filterChange)="onFilter($event)"
 *   (itemSelect)="run($event)"
 * />
 */
@Component({
  selector: 'kp-command-palette',
  imports: [KpDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <kp-dialog
      [open]="open"
      [size]="dialogSize"
      [showFooter]="false"
      [closeOnBackdrop]="true"
      [closeOnEsc]="true"
      [ariaLabel]="ariaLabel ?? defaultAriaLabel"
      (openChange)="onDialogOpenChange($event)"
    >
      <div kpDialogBody class="kp-cmdk">
        <div class="kp-cmdk__input-row">
          <span class="kp-cmdk__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="7"/>
              <path d="m20 20-3.5-3.5"/>
            </svg>
          </span>
          <input
            #input
            type="text"
            class="kp-cmdk__input"
            role="combobox"
            aria-autocomplete="list"
            [attr.aria-expanded]="open"
            [attr.aria-controls]="listId"
            [attr.aria-activedescendant]="activeId"
            [placeholder]="placeholder ?? strings.commandPalettePlaceholder"
            [value]="filter"
            (input)="onInput($event)"
            (keydown)="onKeydown($event)"
          />
          @if (filter) {
            <button
              type="button"
              class="kp-cmdk__clear"
              aria-label="Clear search"
              (click)="clear()"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          }
        </div>

        <div class="kp-cmdk__list" role="listbox" [id]="listId">
          @if (totalItems === 0) {
            <div class="kp-cmdk__empty">{{ emptyMessage ?? strings.noResults }}</div>
          }
          @for (group of groups; track group.id) {
            @if (group.items.length > 0) {
              @if (group.label) {
                <div class="kp-cmdk__group-label">{{ group.label }}</div>
              }
              @for (item of group.items; track item.id) {
                <button
                  type="button"
                  role="option"
                  class="kp-cmdk__item"
                  [id]="optionId(item)"
                  [class.kp-cmdk__item--active]="item.id === activeItemId"
                  [attr.aria-selected]="item.id === activeItemId"
                  [attr.aria-disabled]="item.disabled || null"
                  [disabled]="item.disabled"
                  (mouseenter)="setActive(item)"
                  (click)="select(item)"
                >
                  <span class="kp-cmdk__item-label">{{ item.label }}</span>
                  @if (item.hint) {
                    <span class="kp-cmdk__item-hint">{{ item.hint }}</span>
                  }
                  @if (item.shortcut) {
                    <kbd class="kp-cmdk__item-shortcut">{{ item.shortcut }}</kbd>
                  }
                </button>
              }
            }
          }
        </div>

        <div class="kp-cmdk__footer">
          <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
          <span><kbd>↵</kbd> select</span>
          <span><kbd>esc</kbd> close</span>
          @if (shortcut) {
            <span class="kp-cmdk__footer-spacer"></span>
            <span><kbd>{{ formattedShortcut }}</kbd> open</span>
          }
        </div>
      </div>
    </kp-dialog>
  `,
  styles: [`
    .kp-cmdk {
      display: flex;
      flex-direction: column;
      gap: 0;
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
      width: 100%;
      max-height: 60vh;
    }

    .kp-cmdk__input-row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      border-block-end: 1px solid var(--kp-color-border-default);
    }
    .kp-cmdk__icon {
      display: inline-flex;
      width: 18px;
      height: 18px;
      color: var(--kp-color-text-muted);
    }
    .kp-cmdk__icon svg { width: 100%; height: 100%; }

    .kp-cmdk__input {
      all: unset;
      flex: 1 1 auto;
      font-size: 15px;
      color: var(--kp-color-text-strong);
    }
    .kp-cmdk__input::placeholder { color: var(--kp-color-text-muted); }

    .kp-cmdk__clear {
      all: unset;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      border-radius: 6px;
      color: var(--kp-color-text-muted);
      cursor: pointer;
      transition: background var(--kp-motion-duration-fast) ease;
    }
    .kp-cmdk__clear:hover { background: var(--kp-color-surface-muted); color: var(--kp-color-text-default); }
    .kp-cmdk__clear svg { width: 14px; height: 14px; }

    .kp-cmdk__list {
      flex: 1 1 auto;
      overflow-y: auto;
      padding: 6px;
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .kp-cmdk__empty {
      padding: 24px 16px;
      text-align: center;
      color: var(--kp-color-text-muted);
      font-size: 13px;
    }

    .kp-cmdk__group-label {
      padding: 8px 10px 4px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--kp-color-text-muted);
    }

    .kp-cmdk__item {
      all: unset;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 10px;
      border-radius: 6px;
      font-size: 13px;
      color: var(--kp-color-text-strong);
      cursor: pointer;
      transition: background var(--kp-motion-duration-fast) ease;
    }
    .kp-cmdk__item:focus-visible {
      outline: 2px solid var(--kp-color-accent-primary-fg);
      outline-offset: -2px;
    }
    .kp-cmdk__item--active {
      background: var(--kp-color-surface-muted);
    }
    .kp-cmdk__item[disabled] {
      opacity: 0.45;
      cursor: not-allowed;
    }
    .kp-cmdk__item-label { flex: 1 1 auto; }
    .kp-cmdk__item-hint { font-size: 12px; color: var(--kp-color-text-muted); }
    .kp-cmdk__item-shortcut {
      font-family: var(--kp-font-family-mono, ui-monospace, SFMono-Regular, monospace);
      font-size: 11px;
      padding: 2px 6px;
      border-radius: 4px;
      background: var(--kp-color-surface-muted);
      color: var(--kp-color-text-default);
      border: 1px solid var(--kp-color-border-default);
    }
    .kp-cmdk__item--active .kp-cmdk__item-shortcut {
      background: var(--kp-color-surface-base);
    }

    .kp-cmdk__footer {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 10px 16px;
      border-block-start: 1px solid var(--kp-color-border-default);
      font-size: 11px;
      color: var(--kp-color-text-muted);
    }
    .kp-cmdk__footer-spacer { flex: 1 1 auto; }
    .kp-cmdk__footer kbd {
      font-family: var(--kp-font-family-mono, ui-monospace, SFMono-Regular, monospace);
      font-size: 10px;
      padding: 2px 5px;
      border-radius: 3px;
      background: var(--kp-color-surface-muted);
      color: var(--kp-color-text-default);
      border: 1px solid var(--kp-color-border-default);
      margin-inline-end: 2px;
    }

    @media (prefers-reduced-motion: reduce) {
      .kp-cmdk__clear,
      .kp-cmdk__item { transition: none; }
    }
  `],
})
export class KpCommandPaletteComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() size: KpCommandPaletteSize = 'md';
  @Input() open = false;
  @Input() groups: KpCommandGroup[] = [];
  @Input() filter = '';
  @Input() placeholder: string | null = null;
  @Input() emptyMessage: string | null = null;
  @Input() ariaLabel: string | null = null;
  /** Global shortcut to toggle `open`. `null` disables the listener. */
  @Input() shortcut: KpCommandShortcut | null = { combo: 'mod+k' };

  @Output() readonly openChange = new EventEmitter<boolean>();
  @Output() readonly filterChange = new EventEmitter<string>();
  @Output() readonly itemSelect = new EventEmitter<KpCommandItem>();

  @ViewChild('input') private inputRef?: ElementRef<HTMLInputElement>;

  activeItemId: string | null = null;

  readonly listId = `kp-cmdk-list-${++uid}`;
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly doc = inject(DOCUMENT);
  readonly strings = injectKpStrings();
  /** Localized fallback used when consumers don't pass `[ariaLabel]`. */
  readonly defaultAriaLabel = 'Command palette';

  get dialogSize(): 'sm' | 'md' | 'lg' {
    return this.size === 'sm' ? 'sm' : this.size === 'lg' ? 'lg' : 'md';
  }

  get totalItems(): number {
    return this.groups.reduce((s, g) => s + g.items.length, 0);
  }

  get activeId(): string | null {
    if (!this.activeItemId) return null;
    const item = this.flatItems.find((i) => i.id === this.activeItemId);
    return item ? this.optionId(item) : null;
  }

  get formattedShortcut(): string {
    if (!this.shortcut) return '';
    return formatShortcut(this.shortcut.combo);
  }

  private get flatItems(): KpCommandItem[] {
    return this.groups.flatMap((g) => g.items.filter((i) => !i.disabled));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('open' in changes && this.open) {
      // Reset active to first available item whenever palette opens.
      this.activeItemId = this.flatItems[0]?.id ?? null;
      // Defer focus until the dialog has actually rendered.
      queueMicrotask(() => this.inputRef?.nativeElement.focus());
    }
    if ('groups' in changes && this.open) {
      // Keep an active item when groups change (e.g. after filter).
      const stillThere = this.flatItems.some((i) => i.id === this.activeItemId);
      if (!stillThere) this.activeItemId = this.flatItems[0]?.id ?? null;
    }
  }

  ngAfterViewInit(): void {
    if (this.open) this.inputRef?.nativeElement.focus();
  }

  ngOnDestroy(): void {
    /* HostListener auto-unbinds */
  }

  optionId(item: KpCommandItem): string {
    return `${this.listId}-opt-${item.id}`;
  }

  setActive(item: KpCommandItem): void {
    if (item.disabled) return;
    this.activeItemId = item.id;
    this.cdr.markForCheck();
  }

  select(item: KpCommandItem): void {
    if (item.disabled) return;
    this.itemSelect.emit(item);
    this.setOpen(false);
  }

  clear(): void {
    this.filter = '';
    this.filterChange.emit('');
    this.activeItemId = this.flatItems[0]?.id ?? null;
    this.inputRef?.nativeElement.focus();
    this.cdr.markForCheck();
  }

  onInput(event: Event): void {
    const v = (event.target as HTMLInputElement).value;
    this.filter = v;
    this.filterChange.emit(v);
    // The consumer typically replies with a fresh `[groups]` — when it lands,
    // ngOnChanges('groups') re-anchors `activeItemId`.
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.move(1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.move(-1);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const it = this.flatItems.find((i) => i.id === this.activeItemId);
      if (it) this.select(it);
    } else if (event.key === 'Home') {
      event.preventDefault();
      this.activeItemId = this.flatItems[0]?.id ?? null;
      this.cdr.markForCheck();
    } else if (event.key === 'End') {
      event.preventDefault();
      const last = this.flatItems[this.flatItems.length - 1];
      this.activeItemId = last?.id ?? null;
      this.cdr.markForCheck();
    }
  }

  onDialogOpenChange(open: boolean): void {
    this.setOpen(open);
  }

  @HostListener('window:keydown', ['$event'])
  onWindowKeydown(event: KeyboardEvent): void {
    if (!this.shortcut) return;
    if (matchesCombo(this.shortcut.combo, event)) {
      event.preventDefault();
      this.setOpen(!this.open);
    }
  }

  private move(delta: 1 | -1): void {
    const items = this.flatItems;
    if (items.length === 0) return;
    const idx = items.findIndex((i) => i.id === this.activeItemId);
    const next = idx === -1 ? 0 : (idx + delta + items.length) % items.length;
    this.activeItemId = items[next].id;
    this.cdr.markForCheck();
    queueMicrotask(() => {
      const el = this.doc.getElementById(this.optionId(items[next]));
      el?.scrollIntoView?.({ block: 'nearest' });
    });
  }

  private setOpen(open: boolean): void {
    if (this.open === open) return;
    this.open = open;
    this.openChange.emit(open);
    this.cdr.markForCheck();
  }
}

let uid = 0;

function formatShortcut(combo: string): string {
  return combo
    .split('+')
    .map((part) => {
      const k = part.toLowerCase();
      if (k === 'mod') return isMac ? '⌘' : 'Ctrl';
      if (k === 'cmd' || k === 'meta') return '⌘';
      if (k === 'ctrl') return 'Ctrl';
      if (k === 'alt' || k === 'opt' || k === 'option') return isMac ? '⌥' : 'Alt';
      if (k === 'shift') return '⇧';
      return part.length === 1 ? part.toUpperCase() : part;
    })
    .join(isMac ? '' : '+');
}

function matchesCombo(combo: string, event: KeyboardEvent): boolean {
  const parts = combo.toLowerCase().split('+');
  const wantMod = parts.includes('mod');
  const wantCmd = parts.includes('cmd') || parts.includes('meta');
  const wantCtrl = parts.includes('ctrl');
  const wantAlt = parts.includes('alt') || parts.includes('opt') || parts.includes('option');
  const wantShift = parts.includes('shift');
  const key = parts.find(
    (p) => !['mod', 'cmd', 'meta', 'ctrl', 'alt', 'opt', 'option', 'shift'].includes(p)
  );
  if (!key) return false;

  const modOk = wantMod ? (isMac ? event.metaKey : event.ctrlKey) : true;
  const cmdOk = wantCmd ? event.metaKey : true;
  const ctrlOk = wantCtrl ? event.ctrlKey : true;
  const altOk = wantAlt ? event.altKey : true;
  const shiftOk = wantShift ? event.shiftKey : true;

  // When the user did NOT request a modifier, that modifier MUST be off
  // — keeps `'k'` from matching `Cmd+K`.
  const modCleanly =
    (wantMod || wantCmd || wantCtrl ? true : !event.metaKey && !event.ctrlKey) &&
    (wantAlt ? true : !event.altKey) &&
    (wantShift ? true : !event.shiftKey);

  return (
    event.key.toLowerCase() === key &&
    modOk &&
    cmdOk &&
    ctrlOk &&
    altOk &&
    shiftOk &&
    modCleanly
  );
}
