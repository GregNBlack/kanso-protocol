import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

export type KpPaginationItemSize = 'sm' | 'md' | 'lg';
export type KpPaginationItemType = 'page' | 'nav' | 'ellipsis';
export type KpPaginationNavMode = 'icon' | 'text' | 'icon-text';
export type KpPaginationNavDirection = 'prev' | 'next';

/**
 * Kanso Protocol — PaginationItem (atom)
 *
 * Single cell in a pagination strip. Renders as a page-pill for
 * `type="page"` (rounded-square with size-specific radius), a
 * chevron/text-nav button for `type="nav"`, or a static `…`
 * ellipsis for `type="ellipsis"`.
 *
 * Usually driven by the parent `<kp-pagination>`. You can drop items
 * standalone if you're assembling a bespoke pagination layout, but for
 * the common case let the container compute the range and emit events.
 */
@Component({
  selector: 'kp-pagination-item',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses',
    '[attr.role]': 'type === "ellipsis" ? "presentation" : null',
  },
  template: `
    @if (type === 'ellipsis') {
      <span class="kp-pi__ellipsis" aria-hidden="true">…</span>
    } @else {
      <button
        type="button"
        class="kp-pi__btn"
        [class.kp-pi--icon-only]="isIconOnly"
        [disabled]="disabled"
        [attr.aria-current]="type === 'page' && selected ? 'page' : null"
        [attr.aria-label]="effectiveAriaLabel"
        (click)="handleClick($event)"
      >
        @if (type === 'nav') {
          @if (navMode !== 'text' && navDirection === 'prev') {
            <span class="kp-pi__icon" aria-hidden="true">
              <svg viewBox="0 0 16 16" fill="none">
                <path d="M10 3 L5 8 L10 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
          }
          @if (navMode !== 'icon') {
            <span class="kp-pi__label">{{ effectiveNavLabel }}</span>
          }
          @if (navMode !== 'text' && navDirection === 'next') {
            <span class="kp-pi__icon" aria-hidden="true">
              <svg viewBox="0 0 16 16" fill="none">
                <path d="M6 3 L11 8 L6 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
          }
        } @else {
          <span class="kp-pi__label">{{ page }}</span>
        }
      </button>
    }
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      box-sizing: border-box;
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
    }

    .kp-pi__btn {
      all: unset;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      gap: var(--kp-pi-gap);
      height: var(--kp-pi-h);
      min-width: var(--kp-pi-h);
      padding: 0 var(--kp-pi-pad-x);
      border-radius: var(--kp-pi-radius);
      background: var(--kp-color-pagination-item-bg-rest, transparent);
      color: var(--kp-color-pagination-item-fg-rest, #3F3F46);
      font-size: var(--kp-pi-font-size);
      line-height: var(--kp-pi-line-height);
      font-weight: 500;
      font-variant-numeric: tabular-nums;
      cursor: pointer;
      transition: background 120ms ease, color 120ms ease;
    }
    .kp-pi__btn.kp-pi--icon-only { padding: 0; }
    .kp-pi__btn:hover {
      background: var(--kp-color-pagination-item-bg-hover, #EFF6FF);
      color: var(--kp-color-pagination-item-fg-hover, #1D4ED8);
    }
    .kp-pi__btn:active {
      background: var(--kp-color-pagination-item-bg-active, #DBEAFE);
      color: var(--kp-color-pagination-item-fg-active, #1D4ED8);
    }
    .kp-pi__btn:focus-visible {
      outline: 2px solid var(--kp-color-focus-ring, #60A5FA);
      outline-offset: 2px;
    }

    .kp-pi__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 auto;
      width: var(--kp-pi-icon-size);
      height: var(--kp-pi-icon-size);
      color: var(--kp-color-pagination-item-icon-rest, #52525B);
    }
    .kp-pi__icon svg { width: 100%; height: 100%; }
    .kp-pi__btn:hover .kp-pi__icon {
      color: var(--kp-color-pagination-item-icon-hover, #1D4ED8);
    }

    /* Selected (current page) */
    :host(.kp-pi--selected) .kp-pi__btn,
    :host(.kp-pi--selected) .kp-pi__btn:hover {
      background: var(--kp-color-pagination-item-bg-selected, #2563EB);
      color: var(--kp-color-pagination-item-fg-selected, #FFFFFF);
      cursor: default;
    }
    :host(.kp-pi--selected) .kp-pi__btn .kp-pi__icon {
      color: var(--kp-color-pagination-item-icon-selected, #FFFFFF);
    }

    /* Disabled */
    :host(.kp-pi--disabled) .kp-pi__btn,
    :host(.kp-pi--disabled) .kp-pi__btn:hover {
      background: var(--kp-color-pagination-item-bg-disabled, transparent);
      color: var(--kp-color-pagination-item-fg-disabled, #D4D4D8);
      cursor: not-allowed;
    }
    :host(.kp-pi--disabled) .kp-pi__icon {
      color: var(--kp-color-pagination-item-icon-disabled, #D4D4D8);
    }

    /* Ellipsis — static, no hover */
    .kp-pi__ellipsis {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: var(--kp-pi-h);
      min-width: var(--kp-pi-h);
      padding: 0 8px;
      color: var(--kp-color-pagination-ellipsis, #71717A);
      font-size: var(--kp-pi-font-size);
      line-height: var(--kp-pi-line-height);
      font-weight: 500;
      user-select: none;
    }

    /* Sizes — radius is size-specific, not pill */
    :host(.kp-pi--sm) {
      --kp-pi-h: 28px;
      --kp-pi-pad-x: 8px;
      --kp-pi-gap: 4px;
      --kp-pi-font-size: 12px;
      --kp-pi-line-height: 16px;
      --kp-pi-icon-size: 14px;
      --kp-pi-radius: 10px;
    }
    :host(.kp-pi--md) {
      --kp-pi-h: 36px;
      --kp-pi-pad-x: 10px;
      --kp-pi-gap: 6px;
      --kp-pi-font-size: 14px;
      --kp-pi-line-height: 20px;
      --kp-pi-icon-size: 16px;
      --kp-pi-radius: 14px;
    }
    :host(.kp-pi--lg) {
      --kp-pi-h: 44px;
      --kp-pi-pad-x: 12px;
      --kp-pi-gap: 6px;
      --kp-pi-font-size: 14px;
      --kp-pi-line-height: 20px;
      --kp-pi-icon-size: 18px;
      --kp-pi-radius: 16px;
    }

    /* Nav with text variants get wider padding */
    :host(.kp-pi--nav-text) .kp-pi__btn,
    :host(.kp-pi--nav-icon-text) .kp-pi__btn {
      padding: 0 14px;
      min-width: 0;
    }
    :host(.kp-pi--sm.kp-pi--nav-text) .kp-pi__btn,
    :host(.kp-pi--sm.kp-pi--nav-icon-text) .kp-pi__btn {
      padding: 0 12px;
    }
  `],
})
export class KpPaginationItemComponent {
  @Input() size: KpPaginationItemSize = 'md';
  @Input() type: KpPaginationItemType = 'page';
  @Input() page: number | null = null;
  @Input() selected = false;
  @Input() disabled = false;
  @Input() navMode: KpPaginationNavMode = 'icon';
  @Input() navDirection: KpPaginationNavDirection = 'prev';
  @Input() navLabel: string | null = null;
  @Input() ariaLabel: string | null = null;

  @Output() readonly itemClick = new EventEmitter<MouseEvent>();

  get isIconOnly(): boolean {
    return this.type === 'nav' && this.navMode === 'icon';
  }

  get effectiveNavLabel(): string {
    if (this.navLabel) return this.navLabel;
    return this.navDirection === 'next' ? 'Next' : 'Previous';
  }

  get effectiveAriaLabel(): string | null {
    if (this.ariaLabel) return this.ariaLabel;
    if (this.type === 'page' && this.page != null) {
      return this.selected ? `Page ${this.page}, current page` : `Go to page ${this.page}`;
    }
    if (this.type === 'nav') {
      return this.navDirection === 'prev' ? 'Previous page' : 'Next page';
    }
    return null;
  }

  get hostClasses(): string {
    const c = ['kp-pi', `kp-pi--${this.size}`, `kp-pi--${this.type}`];
    if (this.type === 'nav') c.push(`kp-pi--nav-${this.navMode}`);
    if (this.selected) c.push('kp-pi--selected');
    if (this.disabled) c.push('kp-pi--disabled');
    return c.join(' ');
  }

  handleClick(event: MouseEvent): void {
    if (this.disabled || this.selected) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.itemClick.emit(event);
  }
}
