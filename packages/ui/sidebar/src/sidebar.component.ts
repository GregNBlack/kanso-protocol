import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { KpAvatarComponent } from '@kanso-protocol/ui/avatar';
import { KpIconComponent } from '@kanso-protocol/ui/icon';
import { KpNavItemComponent } from '@kanso-protocol/ui/nav-item';

export type KpSidebarWidth = 'expanded' | 'collapsed';
export type KpSidebarAppearance = 'light' | 'dark';

export interface KpSidebarNavItem {
  label: string;
  icon?: string;     // semantic icon key (consumer resolves)
  href?: string;
  active?: boolean;
  badge?: string;
  /** Nested children — rendered with depth=1 when parent is expanded */
  children?: KpSidebarNavItem[];
  expanded?: boolean;
}

export interface KpSidebarSection {
  label?: string;
  items: KpSidebarNavItem[];
}

/**
 * Kanso Protocol — Sidebar
 *
 * App side navigation container. Expanded (240) or collapsed (64).
 * Data-driven sections, each with its own label and NavItems.
 * Optional logo, search slot, user footer with Avatar.
 *
 * Slots:
 * - `[kpSidebarLogo]` — custom logo area
 * - `[kpSidebarSearch]` — search field above sections
 * - each NavItem icon is rendered via `iconTemplateRef` if provided
 *   (otherwise a generic placeholder)
 *
 * @example
 * <kp-sidebar
 *   widthState="expanded"
 *   [sections]="nav"
 *   userName="Greg Black"
 *   userInitials="GB"
 *   userEmail="greg@example.com"
 * />
 */
@Component({
  selector: 'kp-sidebar',
  imports: [KpAvatarComponent, KpIconComponent, KpNavItemComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClasses', role: 'navigation' },
  template: `
    <div class="kp-sidebar__top">
      <div class="kp-sidebar__top-row">
        @if (showLogo) {
          <div class="kp-sidebar__logo">
            <ng-content select="[kpSidebarLogo]">
              <span class="kp-sidebar__logo-mark" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 7l9-4 9 4v10l-9 4-9-4V7zM3 7l9 4 9-4M12 11v10"/>
                </svg>
              </span>
              <span
                class="kp-sidebar__logo-text"
                [class.kp-sidebar__logo-text--hidden]="widthState === 'collapsed'"
                [attr.aria-hidden]="widthState === 'collapsed' || null">{{ logoText }}</span>
            </ng-content>
          </div>
        }
        <button
          type="button"
          class="kp-sidebar__toggle"
          [attr.aria-label]="widthState === 'collapsed' ? 'Expand sidebar' : 'Collapse sidebar'"
          (click)="onToggle()"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M9 5v14"/></svg>
        </button>
      </div>
      @if (showSearch && widthState !== 'collapsed') {
        <ng-content select="[kpSidebarSearch]"/>
      }
    </div>

    <nav class="kp-sidebar__nav">
      @for (section of sections; track $index) {
        <div class="kp-sidebar__section">
          @if (showSectionLabels && section.label) {
            <div
              class="kp-sidebar__section-label"
              [class.kp-sidebar__section-label--hidden]="widthState === 'collapsed'"
              [attr.aria-hidden]="widthState === 'collapsed' || null">{{ section.label }}</div>
          }
          @for (item of section.items; track item.label) {
            <kp-nav-item
              size="md"
              [label]="item.label"
              [active]="!!item.active"
              [showBadge]="!!item.badge"
              [hasChildren]="!!item.children?.length"
              [expanded]="!!item.expanded"
              [collapsed]="widthState === 'collapsed'"
              (click$)="onItemClick(item)"
            >
              <span kpNavItemIcon>
                <kp-icon [name]="item.icon || 'circle'" />
              </span>
              @if (item.badge) {
                <span kpNavItemBadge class="kp-sidebar__badge">{{ item.badge }}</span>
              }
            </kp-nav-item>

            @if (item.children?.length && item.expanded && widthState !== 'collapsed') {
              @for (child of item.children; track child.label) {
                <kp-nav-item
                  size="md"
                  [depth]="1"
                  [label]="child.label"
                  [active]="!!child.active"
                  [showIcon]="false"
                  style="--kp-nav-item-indent: 30px"
                  (click$)="onItemClick(child)"
                />
              }
            }
          }
        </div>
      }
    </nav>

    @if (showUserFooter && (userName || userInitials)) {
      <div class="kp-sidebar__footer" [class.kp-sidebar__footer--collapsed]="widthState === 'collapsed'">
        <kp-avatar size="md" [initials]="userInitials || null" [showStatus]="true" status="online"/>
        <div class="kp-sidebar__footer-text" [attr.aria-hidden]="widthState === 'collapsed' || null">
          @if (userName) { <span class="kp-sidebar__footer-name">{{ userName }}</span> }
          @if (userEmail) { <span class="kp-sidebar__footer-email">{{ userEmail }}</span> }
        </div>
        <button
          type="button"
          class="kp-sidebar__footer-menu"
          aria-label="User options"
          [attr.aria-hidden]="widthState === 'collapsed' || null"
          [tabindex]="widthState === 'collapsed' ? -1 : 0"
          (click)="userMenuClick.emit()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
        </button>
      </div>
    }
  `,
  styles: [`
    :host {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      width: var(--kp-sidebar-w, 240px);
      height: 100%;
      min-height: 100vh;
      background: var(--kp-color-sidebar-bg);
      border-inline-end: 1px solid var(--kp-color-sidebar-border);
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
      /* Width animates with the same cubic-bezier + duration that
         drives every inner element's collapse (labels fade + max-width
         to 0 in nav-item, logo text / footer chrome below). All pieces
         move in lockstep — no twitch. */
      transition: width var(--kp-motion-duration-normal) cubic-bezier(0.4, 0, 0.2, 1);
    }
    :host(.kp-sidebar--expanded)  { --kp-sidebar-w: 240px; }
    :host(.kp-sidebar--collapsed) { --kp-sidebar-w: 64px; }

    :host(.kp-sidebar--dark) {
      background: var(--kp-color-sidebar-bg-dark);
      color: var(--kp-color-fg-on-dark-strong);
      border-right-color: var(--kp-color-border-on-dark-default);
    }
    /* In a dark-appearance sidebar, repoint nav-item fg tokens to the
       on-dark family so labels read against the dark sidebar bg. Without
       this nav-item-fg-rest stays at gray.700 light, which on the dark
       sidebar surface only hits ~1.7:1 — fails AA. */
    :host(.kp-sidebar--dark) kp-nav-item {
      --kp-color-nav-item-fg-rest:  var(--kp-color-fg-on-dark-default);
      --kp-color-nav-item-fg-hover: var(--kp-color-fg-on-dark-strong);
      --kp-color-nav-item-fg-active: var(--kp-color-foreground-on-dark-accent-primary);
      --kp-color-nav-item-bg-hover: var(--kp-color-surface-on-dark-muted);
      /* bg-active also flips to the on-dark muted surface so the
         active fg reads against a dark bg (~7:1) instead of ~3:1
         against the default light blue.50 active bg. */
      --kp-color-nav-item-bg-active: var(--kp-color-surface-on-dark-muted);
      --kp-color-nav-item-icon-rest:  var(--kp-color-fg-on-dark-muted);
      --kp-color-nav-item-icon-hover: var(--kp-color-fg-on-dark-strong);
      --kp-color-nav-item-icon-active: var(--kp-color-foreground-on-dark-accent-primary);
    }
    :host(.kp-sidebar--dark) .kp-sidebar__footer-email {
      color: var(--kp-color-fg-on-dark-subtle);
    }
    :host(.kp-sidebar--dark) .kp-sidebar__section-label {
      color: var(--kp-color-fg-on-dark-muted);
    }

    .kp-sidebar__top {
      display: flex;
      flex-direction: column;
      gap: 16px;
      /* Bottom padding tightened (16 → 8) to reduce the vertical gap
         between the collapse toggle and the first nav section — the
         original 16+nav-pad+label-pad stack felt too airy. */
      padding: 16px 16px 8px;
    }
    .kp-sidebar__top-row {
      display: flex;
      align-items: center;
      gap: 12px;
      min-height: 40px;
    }
    /* When the sidebar has no logo (showLogo=false), the toggle is the
       only child of top-row. Push it to the right edge so it sits flush
       with the menu boundary instead of floating at the start. The
       collapsed-state rule below still wins (higher specificity via
       :host) and keeps the toggle centred when the sidebar narrows. */
    .kp-sidebar__top-row:not(:has(.kp-sidebar__logo)) {
      justify-content: flex-end;
    }
    :host(.kp-sidebar--collapsed) .kp-sidebar__top-row {
      position: relative;
      justify-content: center;
    }
    :host(.kp-sidebar--collapsed) .kp-sidebar__logo,
    :host(.kp-sidebar--collapsed) .kp-sidebar__toggle {
      transition: opacity var(--kp-motion-duration-fast) ease;
    }
    /* When collapsed AND logo is present, logo shows by default; toggle reveals on hover */
    :host(.kp-sidebar--collapsed) .kp-sidebar__top-row:has(.kp-sidebar__logo) .kp-sidebar__toggle {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      opacity: 0;
      pointer-events: none;
    }
    :host(.kp-sidebar--collapsed) .kp-sidebar__top-row:has(.kp-sidebar__logo):hover .kp-sidebar__logo { opacity: 0; }
    :host(.kp-sidebar--collapsed) .kp-sidebar__top-row:has(.kp-sidebar__logo):hover .kp-sidebar__toggle {
      opacity: 1;
      pointer-events: auto;
    }
    .kp-sidebar__logo {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1 1 auto;
      min-width: 0;
    }
    .kp-sidebar__logo-mark {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: var(--kp-color-primary-default-bg-rest);
      color: var(--kp-color-foreground-on-saturated);
      flex: 0 0 auto;
    }
    .kp-sidebar__logo-mark svg { width: 60%; height: 60%; }
    .kp-sidebar__logo-text {
      font-size: 16px;
      font-weight: 600;
      flex: 1 1 auto;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      opacity: 1;
      max-width: 200px;
      transition:
        opacity var(--kp-motion-duration-normal) cubic-bezier(0.4, 0, 0.2, 1),
        max-width var(--kp-motion-duration-normal) cubic-bezier(0.4, 0, 0.2, 1);
    }
    .kp-sidebar__logo-text--hidden {
      opacity: 0;
      max-width: 0;
      pointer-events: none;
    }
    .kp-sidebar__toggle {
      all: unset;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 6px;
      color: var(--kp-color-text-muted);
      cursor: pointer;
      transition: background var(--kp-motion-duration-fast) ease, color 120ms ease;
    }
    .kp-sidebar__toggle:hover {
      background: var(--kp-color-surface-muted);
      color: var(--kp-color-text-strong);
    }
    .kp-sidebar__toggle svg { width: 16px; height: 16px; }
        :host(.kp-sidebar--dark) .kp-sidebar__toggle { color: var(--kp-color-fg-on-dark-muted); }
    :host(.kp-sidebar--dark) .kp-sidebar__toggle:hover {
      background: var(--kp-color-surface-on-dark-muted);
      color: var(--kp-color-foreground-on-saturated);
    }

    :host(.kp-sidebar--collapsed) .kp-sidebar__logo { justify-content: center; }

    .kp-sidebar__nav {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 8px;
      flex: 1 1 auto;
      overflow-y: auto;
    }
    .kp-sidebar__section {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    /* The icon slot inside each nav-item ends up wrapped in a <span>
       (the directive carrier for [kpNavItemIcon]). Span defaults to
       inline display, which adds a baseline gap that visually shifts
       the icon down by ~1-2px relative to the label. Force inline-flex
       on the wrapper so the icon centers exactly with the row text. */
    .kp-sidebar__nav ::ng-deep [kpNavItemIcon] {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      line-height: 0;
    }
    /* In collapsed mode the label text fades out but the box still
       reserves vertical space, so nav-items stay at the same Y offset
       as in the expanded layout (no jumping when toggling). Opacity
       transitioned together with the host width animation. */
    .kp-sidebar__section-label {
      transition: opacity var(--kp-motion-duration-normal) cubic-bezier(0.4, 0, 0.2, 1);
    }
    .kp-sidebar__section-label--hidden {
      opacity: 0;
      pointer-events: none;
      /* visibility:hidden so axe-core skips color-contrast on the
         collapsed-state section labels. */
      visibility: hidden;
    }
    .kp-sidebar__section-label {
      padding: 8px 12px 4px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      color: var(--kp-color-sidebar-section-label);
    }

    .kp-sidebar__badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 1px 8px;
      height: 20px;
      border-radius: 999px;
      background: var(--kp-color-surface-muted);
      color: var(--kp-color-text-default);
      font-size: 11px;
      font-weight: 500;
    }

    .kp-sidebar__footer {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      border-top: 1px solid var(--kp-color-sidebar-border);
    }
    :host(.kp-sidebar--dark) .kp-sidebar__footer { border-top-color: var(--kp-color-border-on-dark-default); }
    .kp-sidebar__footer-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex: 1 1 auto;
      min-width: 0;
      opacity: 1;
      max-width: 200px;
      transition:
        opacity var(--kp-motion-duration-normal) cubic-bezier(0.4, 0, 0.2, 1),
        max-width var(--kp-motion-duration-normal) cubic-bezier(0.4, 0, 0.2, 1);
    }
    :host(.kp-sidebar--collapsed) .kp-sidebar__footer-text {
      opacity: 0;
      max-width: 0;
      pointer-events: none;
    }
    .kp-sidebar__footer-name {
      font-size: 13px;
      font-weight: 500;
      color: var(--kp-color-text-strong);
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
    :host(.kp-sidebar--dark) .kp-sidebar__footer-name { color: var(--kp-color-fg-on-dark-strong); }
    .kp-sidebar__footer-email {
      font-size: 11px;
      color: var(--kp-color-text-muted);
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
    .kp-sidebar__footer-menu {
      all: unset;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 4px;
      color: var(--kp-color-text-muted);
      cursor: pointer;
      opacity: 1;
      max-width: 28px;
      transition:
        opacity var(--kp-motion-duration-normal) cubic-bezier(0.4, 0, 0.2, 1),
        max-width var(--kp-motion-duration-normal) cubic-bezier(0.4, 0, 0.2, 1),
        background var(--kp-motion-duration-fast) ease,
        color var(--kp-motion-duration-fast) ease;
    }
    .kp-sidebar__footer-menu:hover { color: var(--kp-color-text-strong); background: var(--kp-color-surface-muted); }
    .kp-sidebar__footer-menu svg { width: 18px; height: 18px; }
    :host(.kp-sidebar--collapsed) .kp-sidebar__footer-menu {
      opacity: 0;
      max-width: 0;
      pointer-events: none;
    }

    .kp-sidebar__footer {
      transition: padding var(--kp-motion-duration-normal) cubic-bezier(0.4, 0, 0.2, 1);
    }
    :host(.kp-sidebar--collapsed) .kp-sidebar__footer { justify-content: center; padding-inline: 0; }

    /* The toggle and footer-menu buttons reset all UA styling (all: unset),
       so keyboard focus has no visible ring once colors are forced. Add a
       real outline in forced-colors mode. */
    @media (forced-colors: active) {
      .kp-sidebar__toggle:focus-visible,
      .kp-sidebar__footer-menu:focus-visible {
        outline: var(--kp-focus-ring-width) solid Highlight;
        outline-offset: var(--kp-focus-ring-offset);
      }
    }

    /* Respect the OS reduced-motion setting: collapse transitions and
       decorative animation to effectively instant. */
    @media (prefers-reduced-motion: reduce) {
      :host,
      :host * {
        transition-duration: 0.01ms !important;
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        scroll-behavior: auto !important;
      }
    }
  `],
})
export class KpSidebarComponent implements OnInit {
  @Input() widthState: KpSidebarWidth = 'expanded';
  @Input() appearance: KpSidebarAppearance = 'light';
  /**
   * When set, the expanded/collapsed state is persisted to `localStorage`
   * under this key and restored on init — so the choice survives reloads.
   * Leave null for session-scoped (in-memory) collapse. SSR-safe.
   */
  @Input() persistKey: string | null = null;

  @Input() showLogo = true;
  @Input() logoText = 'Kanso Protocol';
  @Input() showSearch = false;
  @Input() showSectionLabels = true;
  @Input() showUserFooter = true;

  @Input() sections: KpSidebarSection[] = [];

  @Input() userName: string | null = null;
  @Input() userEmail: string | null = null;
  @Input() userInitials: string | null = null;

  @Output() toggle = new EventEmitter<KpSidebarWidth>();

  ngOnInit(): void {
    const saved = this.readPersisted();
    if (saved) this.widthState = saved;
  }

  onToggle(): void {
    this.widthState = this.widthState === 'expanded' ? 'collapsed' : 'expanded';
    this.persist();
    this.toggle.emit(this.widthState);
  }

  /** SSR-safe read of the persisted state (null if no key / unavailable / invalid). */
  private readPersisted(): KpSidebarWidth | null {
    if (!this.persistKey) return null;
    try {
      const v = globalThis.localStorage?.getItem(this.persistKey);
      return v === 'collapsed' || v === 'expanded' ? v : null;
    } catch {
      return null;
    }
  }

  private persist(): void {
    if (!this.persistKey) return;
    try {
      globalThis.localStorage?.setItem(this.persistKey, this.widthState);
    } catch {
      /* storage disabled / SSR — ignore */
    }
  }

  onItemClick(item: KpSidebarNavItem): void {
    if (item.children?.length) {
      item.expanded = !item.expanded;
    }
    this.itemClick.emit(item);
  }
  @Output() itemClick = new EventEmitter<KpSidebarNavItem>();
  @Output() userMenuClick = new EventEmitter<void>();

  get hostClasses(): string {
    return `kp-sidebar kp-sidebar--${this.widthState} kp-sidebar--${this.appearance}`;
  }
}
