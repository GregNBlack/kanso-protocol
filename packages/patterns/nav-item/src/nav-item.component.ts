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
import { KpTooltipComponent } from '@kanso-protocol/tooltip';

export type KpNavItemSize = 'sm' | 'md' | 'lg';
export type KpNavItemState = 'rest' | 'hover' | 'active' | 'disabled';

/**
 * Kanso Protocol — NavItem
 *
 * Atomic nav row for Sidebar. Supports 3 sizes, 4 states, nested
 * depth (left padding), optional icon / badge / chevron, and an
 * "active" left accent bar.
 *
 * Slots:
 * - `[kpNavItemIcon]` — leading icon
 * - `[kpNavItemBadge]` — trailing badge (e.g. `<kp-badge>`)
 *
 * @example
 * <kp-nav-item size="md" [active]="true" label="Dashboard">
 *   <svg kpNavItemIcon>…</svg>
 * </kp-nav-item>
 */
@Component({
  selector: 'kp-nav-item',
  imports: [KpTooltipComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses',
    '[style.--kp-nav-item-depth]': 'depth',
    '[attr.aria-current]': 'active ? "page" : null',
  },
  template: `
    @if (showActiveIndicator && active) {
      <span class="kp-nav-item__indicator" aria-hidden="true"></span>
    }
    <button
      type="button"
      class="kp-nav-item__content"
      [disabled]="disabled"
      [attr.aria-label]="collapsed ? label : null"
      (click)="handleClick($event)"
      (mouseenter)="onMouseEnter()"
      (mouseleave)="onMouseLeave()"
      (focus)="onMouseEnter()"
      (blur)="onMouseLeave()"
    >
      @if (showIcon) {
        <span class="kp-nav-item__icon" aria-hidden="true">
          <ng-content select="[kpNavItemIcon]"/>
        </span>
      }
      <span class="kp-nav-item__label">{{ label }}</span>
      @if (showBadge) {
        <span class="kp-nav-item__badge">
          <ng-content select="[kpNavItemBadge]"/>
        </span>
      }
      @if (hasChildren) {
        <span class="kp-nav-item__chevron" [class.kp-nav-item__chevron--expanded]="expanded" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </span>
      }
    </button>

    @if (isTooltipOpen()) {
      <kp-tooltip #tooltip class="kp-nav-item__tooltip" size="sm" arrowPosition="left" [label]="label"/>
    }
  `,
  styles: [`
    :host {
      display: block;
      position: relative;
      width: 100%;
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
    }

    .kp-nav-item__indicator {
      position: absolute;
      left: 0;
      top: 20%;
      bottom: 20%;
      width: 3px;
      background: var(--kp-color-nav-item-active-indicator, var(--kp-color-blue-600));
      border-radius: 2px;
    }

    .kp-nav-item__content {
      all: unset;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      gap: var(--kp-nav-item-gap, 12px);
      width: 100%;
      height: var(--kp-nav-item-h, 40px);
      padding-inline-start: calc(var(--kp-nav-item-pad, 12px) + var(--kp-nav-item-depth, 0) * var(--kp-nav-item-indent, 20px));
      padding-inline-end: var(--kp-nav-item-pad, 12px);
      border-radius: var(--kp-nav-item-radius, 8px);
      color: var(--kp-color-nav-item-fg-rest, var(--kp-color-gray-700));
      background: var(--kp-color-nav-item-bg-rest, transparent);
      cursor: pointer;
      transition: background var(--kp-motion-duration-fast) ease, color 120ms ease;
    }
    .kp-nav-item__content:hover:not(:disabled) {
      color: var(--kp-color-nav-item-fg-hover, var(--kp-color-gray-900));
      background: var(--kp-color-nav-item-bg-hover, var(--kp-color-gray-100));
    }
    .kp-nav-item__content:disabled {
      color: var(--kp-color-nav-item-fg-disabled, var(--kp-color-gray-400));
      cursor: not-allowed;
    }

    :host(.kp-nav-item--active) .kp-nav-item__content {
      color: var(--kp-color-nav-item-fg-active, var(--kp-color-blue-700));
      background: var(--kp-color-nav-item-bg-active, var(--kp-color-blue-50));
    }
    :host(.kp-nav-item--active) .kp-nav-item__icon { color: var(--kp-color-nav-item-icon-active, var(--kp-color-blue-600)); }

    .kp-nav-item__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 auto;
      width: var(--kp-nav-item-icon-size, 18px);
      height: var(--kp-nav-item-icon-size, 18px);
      color: var(--kp-color-nav-item-icon-rest, var(--kp-color-gray-500));
    }
    .kp-nav-item__content:hover .kp-nav-item__icon { color: var(--kp-color-nav-item-icon-hover, var(--kp-color-gray-700)); }
    .kp-nav-item__icon ::ng-deep svg { width: 100%; height: 100%; }
    .kp-nav-item__icon ::ng-deep .ti { font-size: var(--kp-nav-item-icon-size, 18px); line-height: 1; }

    .kp-nav-item__label {
      flex: 1 1 auto;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: var(--kp-nav-item-fs, 14px);
      font-weight: 500;
      text-align: start;
    }

    .kp-nav-item__badge {
      display: inline-flex;
      flex: 0 0 auto;
    }

    .kp-nav-item__chevron {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 auto;
      width: var(--kp-nav-item-chev-size, 14px);
      height: var(--kp-nav-item-chev-size, 14px);
      color: var(--kp-color-nav-item-icon-rest, var(--kp-color-gray-500));
      transition: transform var(--kp-motion-duration-fast) ease;
    }
    .kp-nav-item__chevron--expanded { transform: rotate(90deg); }
    .kp-nav-item__chevron svg { width: 100%; height: 100%; }

    /* Sizes */
    :host(.kp-nav-item--sm) {
      --kp-nav-item-h: 32px;
      --kp-nav-item-pad: 8px;
      --kp-nav-item-gap: 8px;
      --kp-nav-item-radius: 6px;
      --kp-nav-item-icon-size: 16px;
      --kp-nav-item-chev-size: 12px;
      --kp-nav-item-indent: 16px;
      --kp-nav-item-fs: 13px;
    }
    :host(.kp-nav-item--md) {
      --kp-nav-item-h: 40px;
      --kp-nav-item-pad: 12px;
      --kp-nav-item-gap: 12px;
      --kp-nav-item-radius: 8px;
      --kp-nav-item-icon-size: 18px;
      --kp-nav-item-chev-size: 14px;
      --kp-nav-item-indent: 20px;
      --kp-nav-item-fs: 14px;
    }
    :host(.kp-nav-item--lg) {
      --kp-nav-item-h: 48px;
      --kp-nav-item-pad: 16px;
      --kp-nav-item-gap: 12px;
      --kp-nav-item-radius: 10px;
      --kp-nav-item-icon-size: 20px;
      --kp-nav-item-chev-size: 16px;
      --kp-nav-item-indent: 24px;
      --kp-nav-item-fs: 15px;
    }

    :host(.kp-nav-item--collapsed) .kp-nav-item__label,
    :host(.kp-nav-item--collapsed) .kp-nav-item__badge,
    :host(.kp-nav-item--collapsed) .kp-nav-item__chevron { display: none; }
    :host(.kp-nav-item--collapsed) .kp-nav-item__content {
      padding-inline-start: 0;
      padding-inline-end: 0;
      justify-content: center;
    }
  `],
})
export class KpNavItemComponent implements AfterViewChecked, OnDestroy {
  @Input() size: KpNavItemSize = 'md';
  @Input() depth: number = 0;
  @Input() label = 'Navigation item';

  @Input() active = false;
  @Input() disabled = false;

  @Input() hasChildren = false;
  @Input() expanded = false;

  @Input() showIcon = true;
  @Input() showBadge = false;
  @Input() showActiveIndicator = true;

  /** When true, hide label/badge/chevron and center the icon — used by collapsed Sidebar */
  @Input() collapsed = false;

  @Output() click$ = new EventEmitter<MouseEvent>();

  readonly isTooltipOpen = signal(false);

  @ViewChild('tooltip', { read: ElementRef }) tooltipEl?: ElementRef<HTMLElement>;

  private readonly hostRef = inject(ElementRef<HTMLElement>);
  private readonly doc = inject(DOCUMENT);
  private portaledTooltip: HTMLElement | null = null;

  onMouseEnter(): void {
    if (this.collapsed && this.label && !this.disabled) this.isTooltipOpen.set(true);
  }

  onMouseLeave(): void {
    if (!this.isTooltipOpen()) return;
    this.cleanupTooltip();
    this.isTooltipOpen.set(false);
  }

  ngAfterViewChecked(): void {
    if (!this.isTooltipOpen()) return;
    const tt = this.tooltipEl?.nativeElement;
    if (tt && this.doc?.body && tt.parentElement !== this.doc.body) {
      this.doc.body.appendChild(tt);
      this.portaledTooltip = tt;
    }
    this.positionTooltip();
  }

  ngOnDestroy(): void {
    this.cleanupTooltip();
  }

  private cleanupTooltip(): void {
    if (this.portaledTooltip && this.portaledTooltip.parentElement === this.doc?.body) {
      this.portaledTooltip.remove();
    }
    this.portaledTooltip = null;
  }

  private positionTooltip(): void {
    const tt = this.portaledTooltip;
    if (!tt) return;
    const rect = this.hostRef.nativeElement.getBoundingClientRect();
    tt.style.position = 'fixed';
    tt.style.top = `${rect.top + rect.height / 2}px`;
    tt.style.left = `${rect.right + 10}px`;
    tt.style.transform = 'translateY(-50%)';
    tt.style.zIndex = '1000';
    tt.style.pointerEvents = 'none';
  }

  get hostClasses(): string {
    const c = [
      'kp-nav-item',
      `kp-nav-item--${this.size}`,
    ];
    if (this.active) c.push('kp-nav-item--active');
    if (this.disabled) c.push('kp-nav-item--disabled');
    if (this.collapsed) c.push('kp-nav-item--collapsed');
    return c.join(' ');
  }

  handleClick(event: MouseEvent): void {
    if (this.disabled) return;
    this.click$.emit(event);
  }
}
