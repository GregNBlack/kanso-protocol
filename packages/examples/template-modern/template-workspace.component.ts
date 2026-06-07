/**
 * Kanso Protocol — Workspace Template
 * ─────────────────────────────────────────────────────────────────────
 * Drop-in scaffold for a productivity / admin Angular app.
 *
 * Layout:
 *   ┌─────────────────────────────────────────────────────────────┐
 *   │ Logo │ Breadcrumbs (flex)         │ [actions] 🔔 ☀ 👤      │  ← transparent header
 *   ├──────┬──────────────────────────────────────────────────────┤
 *   │ Side │  ┌────────────────┐ ┌─────────────────────────┐      │  ← 8px outer pad
 *   │ bar  │  │ Main pane       │ │ Side pane (optional)    │      │     8px gap (drag-resize)
 *   │      │  │                 │ │                         │      │
 *   │      │  └────────────────┘ └─────────────────────────┘      │
 *   └──────┴──────────────────────────────────────────────────────┘
 *
 * SLOT-FIRST API
 * ──────────────
 * Most consumer-customised pieces are content-projection slots, not
 * @Inputs — that gives every projected element its own routerLink /
 * (click) / *ngIf / etc. without forcing this template to grow a
 * config-shape per concern. Only fixed-shape data (the small `user`
 * object) and bool feature flags / presentation knobs stay as Inputs.
 *
 * USAGE
 * ─────
 * 1. Install Kanso peer packages once (if not already):
 *      npm i @kanso-protocol/{core,app-shell,sidebar,nav-item,avatar,
 *        user-menu,menu,theme-toggle,popover,notification-center,icon,
 *        button,badge,breadcrumbs}
 *
 * 2. Copy this file into your project (e.g. `src/templates/`).
 *
 * 3. Import + use:
 *      import { KpTemplateWorkspaceComponent } from './templates/template-workspace.component';
 *
 *      <kp-template-workspace
 *        [navSections]="sections"
 *        [user]="user"
 *        [unreadCount]="3"
 *        [(theme)]="theme">
 *
 *        <!-- Breadcrumbs (consumer composes — router or static) -->
 *        <kp-breadcrumbs kpWsHeaderNav size="md">
 *          <kp-breadcrumb-item type="link" href="/">Workspace</kp-breadcrumb-item>
 *          <kp-breadcrumb-separator/>
 *          <kp-breadcrumb-item type="current">Dashboard</kp-breadcrumb-item>
 *        </kp-breadcrumbs>
 *
 *        <!-- Bell popover content -->
 *        <kp-notification-center kpWsNotifications
 *          state="with-items" [notifications]="notifications"/>
 *
 *        <!-- User menu items (each is a real Angular element with own
 *             routerLink / click / *ngIf — no config-array needed) -->
 *        <kp-menu-item kpWsUserMenuItems label="Profile" size="md" routerLink="/profile">
 *          <kp-icon kpMenuItemIcon name="user" size="md"/>
 *        </kp-menu-item>
 *        <kp-menu-item kpWsUserMenuItems label="Settings" size="md" routerLink="/settings">
 *          <kp-icon kpMenuItemIcon name="settings" size="md"/>
 *        </kp-menu-item>
 *
 *        <!-- Main + side pane content -->
 *        <div kpWsMain>...</div>
 *        <div kpWsSide>...</div>
 *      </kp-template-workspace>
 *
 * 4. Customize freely — this file is yours. Re-pull from upstream if
 *    you want bug-fixes or features that land in the canonical version
 *    at `kanso-protocol/packages/examples/template-modern/`.
 */

import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';

import { KpAppShellComponent } from '@kanso-protocol/ui/app-shell';
import { KpSidebarComponent, KpSidebarNavItem, KpSidebarSection } from '@kanso-protocol/ui/sidebar';
import { KpAvatarComponent } from '@kanso-protocol/ui/avatar';
import { KpUserMenuComponent } from '@kanso-protocol/ui/user-menu';
import { KpThemeToggleComponent } from '@kanso-protocol/ui/theme-toggle';
import { KpIconComponent } from '@kanso-protocol/ui/icon';
import { KpIconButtonComponent } from '@kanso-protocol/ui/button';
import { KpBadgeComponent } from '@kanso-protocol/ui/badge';

// ============================================================================
// Public types
// ============================================================================

export interface KpWsUser {
  name: string;
  email?: string;
  initials: string;
  planName?: string;
  showPlanBadge?: boolean;
}

export type KpWsTheme = 'light' | 'dark' | 'system';
export type KpWsSidebarState = 'expanded' | 'collapsed';

// ============================================================================
// Component
// ============================================================================

@Component({
  selector: 'kp-template-workspace',
  standalone: true,
  /* Intentionally NOT OnPush — this template manages live state
     (sidebar collapse, popovers, drag-resize, OS theme media-query
     events fired outside Angular's zone) where the small extra CD
     work is well worth not having to sprinkle markForCheck calls. */
  imports: [
    KpAppShellComponent,
    KpSidebarComponent,
    KpAvatarComponent,
    KpUserMenuComponent,
    KpThemeToggleComponent,
    KpIconComponent,
    KpIconButtonComponent,
    KpBadgeComponent,
  ],
  template: `
    <kp-app-shell layout="sidebar-left" class="kp-tpl-workspace"
      [style.--kp-ws-pane-radius.px]="paneRadius"
      [style.--kp-ws-pane-pad.px]="outerPadding"
      [style.--kp-ws-pane-gap.px]="panesGap">

      <!-- ===== Header (transparent) ===== -->
      <div kpAppShellHeader class="kp-tpl__header">

        <!-- Brand: project [kpWsLogo] for a custom logo, OR set
             brandMark/brandText, OR null both to hide. -->
        <div class="kp-tpl__logo" aria-label="Logo">
          <ng-content select="[kpWsLogo]"/>
          @if (brandMark) { <span class="kp-tpl__logo-mark">{{ brandMark }}</span> }
          @if (brandText) { <span class="kp-tpl__logo-text">{{ brandText }}</span> }
        </div>

        <!-- Header-nav slot — always rendered as flex-grow spacer.
             Project anything: breadcrumbs, an OU/app selector, tabs,
             a search input, etc. Empty content just means the right
             cluster gets pushed flush right. -->
        <div class="kp-tpl__header-nav-slot">
          <ng-content select="[kpWsHeaderNav]"/>
        </div>

        <!-- Right cluster -->
        <div class="kp-tpl__header-right">

          <!-- Extra header actions (consumer-provided) -->
          <ng-content select="[kpWsHeaderActions]"/>

          @if (showInviteAction) {
            <button class="kp-tpl__action-btn" type="button" (click)="inviteClick.emit()">
              <kp-icon [name]="inviteIcon" size="sm"/>
              <span>{{ inviteLabel }}</span>
            </button>
          }

          @if (showLayoutToggle) {
            <kp-icon-button
              size="md"
              [ariaLabel]="twoPanes ? 'Switch to single pane' : 'Switch to split view'"
              (buttonClick)="toggleTwoPanes()">
              <kp-icon [name]="twoPanes ? 'layout-list' : 'layout-columns'" size="md"/>
            </kp-icon-button>
          }

          @if (showNotifications) {
            <div class="kp-tpl__popover-anchor kp-tpl__popover-anchor--notif">
              <kp-icon-button
                size="md"
                ariaLabel="Notifications"
                (buttonClick)="notifOpen = !notifOpen">
                <kp-icon name="bell" size="md"/>
              </kp-icon-button>
              @if (unreadCount && unreadCount > 0) {
                <kp-badge class="kp-tpl__notif-badge"
                  size="xs" color="danger" appearance="filled" [count]="true">{{ unreadCount }}</kp-badge>
              }
              @if (notifOpen) {
                <div class="kp-tpl__popover kp-tpl__popover--notif">
                  <ng-content select="[kpWsNotifications]"/>
                </div>
              }
            </div>
          }

          @if (showThemeToggle) {
            <kp-theme-toggle
              variant="segmented"
              size="sm"
              [currentTheme]="theme"
              (themeChange)="onThemeChange($event)"/>
          }

          @if (showUserMenu && user) {
            <div class="kp-tpl__popover-anchor kp-tpl__popover-anchor--user">
              <button
                type="button"
                class="kp-tpl__avatar-trigger"
                aria-label="Open user menu"
                (click)="userMenuOpen = !userMenuOpen">
                <kp-avatar size="md" [initials]="user.initials" [showStatus]="true" status="online"/>
              </button>
              @if (userMenuOpen) {
                <div class="kp-tpl__popover kp-tpl__popover--user">
                  <kp-user-menu
                    size="md"
                    [userName]="user.name"
                    [userEmail]="user.email || null"
                    [userInitials]="user.initials"
                    [showPlanBadge]="!!user.showPlanBadge"
                    [planName]="user.planName || ''"
                    [showHelpLink]="false"
                    (signOut)="onSignOut()">
                    <!-- Re-project consumer-supplied [kpWsUserMenuItems]
                         into kp-user-menu's own [kpUserMenuItems] slot. -->
                    <div kpUserMenuItems style="display:flex;flex-direction:column">
                      <ng-content select="[kpWsUserMenuItems]"/>
                    </div>
                  </kp-user-menu>
                </div>
              }
            </div>
          }
        </div>
      </div>

      <!-- ===== Sidebar ===== -->
      <kp-sidebar
        kpAppShellSidebar
        appearance="light"
        [showLogo]="false"
        [showUserFooter]="false"
        [widthState]="sidebarState"
        [sections]="navSections"
        (toggle)="onSidebarToggle($event)"
        (itemClick)="onNavItemClick($event)"/>

      <!-- ===== Content ===== -->
      <div kpAppShellBody class="kp-tpl__content">
        <section class="kp-tpl__pane kp-tpl__pane--main">
          <ng-content select="[kpWsMain]"/>
        </section>
        @if (twoPanes) {
          <div
            class="kp-tpl__resize-handle"
            [class.is-dragging]="isResizing"
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize panes (drag horizontally)"
            [attr.aria-valuenow]="sidePaneWidth"
            [attr.aria-valuemin]="sidePaneMinWidth"
            [attr.aria-valuemax]="sidePaneMaxWidth"
            tabindex="0"
            (pointerdown)="onResizeStart($event)"
            (pointermove)="onResizeMove($event)"
            (pointerup)="onResizeEnd($event)"
            (pointercancel)="onResizeEnd($event)"
            (keydown)="onResizeKey($event)"></div>
          <section
            class="kp-tpl__pane kp-tpl__pane--side"
            [style.--kp-tpl-side-w.px]="sidePaneWidth">
            <ng-content select="[kpWsSide]"/>
          </section>
        }
      </div>
    </kp-app-shell>
  `,
  styles: [`
    :host { display: contents; }

    /* Page background = subtle (one step below the section bg). */
    .kp-tpl-workspace { background: var(--kp-color-surface-subtle); }

    /* ===== Header — transparent, no border, no bg ===== */
    .kp-tpl__header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      width: 100%;
      max-width: 100%;
      min-width: 0;
      box-sizing: border-box;
      background: transparent;
      border: none;
      position: relative;
      z-index: 100;
      color: var(--kp-color-text-default);
    }
    .kp-tpl__logo {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      flex: 0 0 auto;
      color: var(--kp-color-text-strong);
    }
    .kp-tpl__logo:empty { display: none; }
    .kp-tpl__logo-mark {
      font-size: 20px;
      line-height: 1;
      font-weight: 600;
    }
    .kp-tpl__logo-text {
      font-size: 14px;
      font-weight: 500;
      white-space: nowrap;
    }
    .kp-tpl__header-nav-slot {
      flex: 1 1 0;
      min-width: 0;
      overflow: hidden;
      display: flex;
      align-items: center;
    }
    .kp-tpl__header-nav-slot ::ng-deep kp-breadcrumb-item { min-width: 0; }
    .kp-tpl__header-nav-slot ::ng-deep .kp-bc-item__label {
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .kp-tpl__header-right {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      flex: 0 0 auto;
    }
    .kp-tpl__action-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      height: 32px;
      padding: 0 12px;
      border-radius: 8px;
      border: 1px solid var(--kp-color-border-default);
      background: transparent;
      color: var(--kp-color-text-default);
      font: inherit;
      font-size: 13px;
      cursor: pointer;
      transition: background var(--kp-motion-duration-fast) ease;
    }
    .kp-tpl__action-btn:hover { background: var(--kp-color-surface-muted); }

    /* ===== Popover anchors ===== */
    .kp-tpl__popover-anchor { position: relative; }
    .kp-tpl__popover {
      position: absolute;
      top: calc(100% + 6px);
      right: 0;
      z-index: 1000;
    }
    .kp-tpl__popover--notif { width: 360px; }
    .kp-tpl__popover--user  { width: 280px; }
    .kp-tpl__notif-badge {
      position: absolute;
      top: 2px;
      right: 2px;
      transform: translate(40%, -40%);
      pointer-events: none;
    }
    .kp-tpl__avatar-trigger {
      all: unset;
      cursor: pointer;
      border-radius: 999px;
      display: inline-flex;
    }
    .kp-tpl__avatar-trigger:focus-visible {
      outline: 2px solid var(--kp-color-focus-ring);
      outline-offset: 2px;
    }

    /* ===== Content area =====
       Left padding is 0 on purpose: <kp-sidebar>'s nav area already has
       8px internal padding-right, so a left-pad here would double up to
       16px and break the 8px rhythm of the rest of the page (outer
       page edges + gap between panes). Assumes sidebar-left layout
       (canonical case); fork if you flip to layout="no-sidebar". */
    .kp-tpl__content {
      display: flex;
      gap: 0;
      padding:
        var(--kp-ws-pane-pad, 8px)
        var(--kp-ws-pane-pad, 8px)
        var(--kp-ws-pane-pad, 8px)
        0;
      box-sizing: border-box;
      height: 100%;
      min-height: 0;
    }
    .kp-tpl__pane {
      box-sizing: border-box;
      background: var(--kp-color-surface-base);
      border-radius: var(--kp-ws-pane-radius, 16px);
      padding: 24px;
      overflow: auto;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .kp-tpl__pane--main { flex: 1 1 auto; }
    .kp-tpl__pane--side { flex: 0 0 var(--kp-tpl-side-w, 360px); }

    /* Drag-resize divider — handle width equals the configured panesGap
       so the "gap" between sections IS the drag handle. */
    .kp-tpl__resize-handle {
      flex: 0 0 var(--kp-ws-pane-gap, 8px);
      cursor: col-resize;
      background: transparent;
      position: relative;
      user-select: none;
      touch-action: none;
      align-self: stretch;
    }
    .kp-tpl__resize-handle::before {
      content: '';
      position: absolute;
      inset: 8px 3px;
      background: transparent;
      border-radius: 2px;
      transition: background var(--kp-motion-duration-fast) ease;
    }
    .kp-tpl__resize-handle:hover::before,
    .kp-tpl__resize-handle.is-dragging::before {
      background: var(--kp-color-border-default);
    }
    .kp-tpl__resize-handle:focus-visible {
      outline: 2px solid var(--kp-color-focus-ring);
      outline-offset: 0;
      border-radius: 4px;
    }

    /* Sidebar transparent: override pattern bg + border at local scope. */
    :host ::ng-deep kp-sidebar {
      --kp-color-sidebar-bg: transparent;
      --kp-color-sidebar-border: transparent;
    }

    /* ===== Responsive ===== */
    @media (max-width: 1279px) {
      .kp-tpl__action-btn span { display: none; }
      .kp-tpl__action-btn { padding: 0; width: 32px; justify-content: center; }
    }
    @media (max-width: 1023px) {
      /* Stacked vertically — drag handle is hidden, so gap doesn't get
         doubled. Reuse the same panesGap so the vertical breathing
         space matches the horizontal one in two-pane mode. */
      .kp-tpl__content { flex-direction: column; gap: var(--kp-ws-pane-gap, 8px); }
      .kp-tpl__pane--side { flex: 1 1 auto; }
      .kp-tpl__resize-handle { display: none; }
    }
    @media (max-width: 899px) {
      .kp-tpl__action-btn { display: none; }
    }
    @media (max-width: 767px) {
      .kp-tpl__header { gap: 12px; padding: 10px 12px; }
      .kp-tpl__logo-text { display: none; }
      .kp-tpl__header-nav-slot ::ng-deep kp-breadcrumb-item:not(:last-of-type),
      .kp-tpl__header-nav-slot ::ng-deep kp-breadcrumb-separator { display: none; }
    }
    @media (max-width: 639px) {
      .kp-tpl__header-right { gap: 4px; }
      .kp-tpl__content { padding: 4px; }
      .kp-tpl__pane { padding: 16px; border-radius: 12px; }
    }
  `],
})
export class KpTemplateWorkspaceComponent implements OnInit, OnDestroy {

  // ===== Inputs (data — small fixed shapes) =============================
  @Input() brandMark: string | null = '簡素';
  @Input() brandText: string | null = 'Kanso Protocol';
  @Input() navSections: KpSidebarSection[] = [];
  /** When `null` the bell badge is hidden. */
  @Input() unreadCount: number | null = null;
  @Input() user: KpWsUser | null = null;

  // ===== Inputs (UI knobs / feature flags) ==============================
  @Input() showInviteAction = false;
  @Input() inviteLabel = 'Invite';
  @Input() inviteIcon = 'plus';
  @Input() showLayoutToggle = true;
  @Input() showThemeToggle = true;
  @Input() showNotifications = true;
  @Input() showUserMenu = true;

  // ===== Inputs (presentation knobs) ====================================
  @Input() paneRadius = 16;
  @Input() outerPadding = 8;
  @Input() panesGap = 8;
  @Input() sidePaneMinWidth = 240;
  @Input() sidePaneMaxWidth = 800;

  // ===== Inputs + Outputs (two-way binding state) =======================
  @Input() twoPanes = true;
  @Output() twoPanesChange = new EventEmitter<boolean>();

  @Input() sidebarState: KpWsSidebarState = 'expanded';
  @Output() sidebarStateChange = new EventEmitter<KpWsSidebarState>();

  @Input() sidePaneWidth = 360;
  @Output() sidePaneWidthChange = new EventEmitter<number>();

  @Input() theme: KpWsTheme = 'light';
  @Output() themeChange = new EventEmitter<KpWsTheme>();

  // ===== Outputs (events) ===============================================
  @Output() navItemClick = new EventEmitter<KpSidebarNavItem>();
  @Output() inviteClick = new EventEmitter<void>();
  @Output() signOut = new EventEmitter<void>();

  // ===== Internal state =================================================
  notifOpen = false;
  userMenuOpen = false;
  isResizing = false;

  private dragStartX = 0;
  private dragStartW = 360;
  private prefersDark?: MediaQueryList;
  private readonly onSystemChange = (e: MediaQueryListEvent | MediaQueryList): void => {
    if (this.theme !== 'system') return;
    this.applyResolvedTheme(e.matches ? 'dark' : 'light');
  };

  // ===== Lifecycle ======================================================
  ngOnInit(): void {
    if (typeof document !== 'undefined') {
      const attr = document.documentElement.getAttribute('data-theme')
        ?? document.body.getAttribute('data-theme');
      if (attr === 'dark' || attr === 'light') this.theme = attr;
    }
    if (typeof window !== 'undefined' && window.matchMedia) {
      this.prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
      this.prefersDark.addEventListener('change', this.onSystemChange);
    }
  }

  ngOnDestroy(): void {
    this.prefersDark?.removeEventListener('change', this.onSystemChange);
  }

  // ===== Theme handling =================================================
  onThemeChange(t: KpWsTheme): void {
    this.theme = t;
    const resolved: 'light' | 'dark' =
      t === 'system'
        ? (this.prefersDark?.matches ? 'dark' : 'light')
        : t;
    this.applyResolvedTheme(resolved);
    this.themeChange.emit(t);
  }

  /** Apply the resolved palette to the document. Storybook globals are
   *  intentionally NOT synced — addon-themes responds to global changes
   *  by re-rendering the entire story, which destroys the live toggle
   *  component mid-click and breaks the pill slide animation. The
   *  Storybook toolbar can show stale state; in a real consumer app
   *  there's no toolbar, so the page-correct, smooth animation wins. */
  private applyResolvedTheme(resolved: 'light' | 'dark'): void {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute('data-theme', resolved);
    document.body.setAttribute('data-theme', resolved);
  }

  // ===== Layout toggle / sidebar / popover handlers =====================
  toggleTwoPanes(): void {
    this.twoPanes = !this.twoPanes;
    this.twoPanesChange.emit(this.twoPanes);
  }

  onSidebarToggle(state: KpWsSidebarState): void {
    this.sidebarState = state;
    this.sidebarStateChange.emit(state);
  }

  /**
   * Default click-to-activate behavior for nav-items: clicking any item
   * marks it active and clears every other item across all sections.
   *
   * Override by binding `(navItemClick)` and managing your own
   * `navSections` data — common when wiring to Angular Router (the
   * router's `routerLinkActive` becomes the source of truth instead).
   */
  onNavItemClick(item: KpSidebarNavItem): void {
    this.navSections = this.navSections.map((s) => ({
      ...s,
      items: s.items.map((it) => ({ ...it, active: it.label === item.label })),
    }));
    this.navItemClick.emit(item);
  }

  onSignOut(): void {
    this.signOut.emit();
    this.userMenuOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target) return;
    if (this.notifOpen && !target.closest('.kp-tpl__popover-anchor--notif')) {
      this.notifOpen = false;
    }
    if (this.userMenuOpen && !target.closest('.kp-tpl__popover-anchor--user')) {
      this.userMenuOpen = false;
    }
  }

  // ===== Drag-resize ====================================================
  onResizeStart(event: PointerEvent): void {
    this.isResizing = true;
    this.dragStartX = event.clientX;
    this.dragStartW = this.sidePaneWidth;
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  onResizeMove(event: PointerEvent): void {
    if (!this.isResizing) return;
    const delta = this.dragStartX - event.clientX;
    const next = Math.max(this.sidePaneMinWidth, Math.min(this.sidePaneMaxWidth, this.dragStartW + delta));
    if (next !== this.sidePaneWidth) {
      this.sidePaneWidth = next;
      this.sidePaneWidthChange.emit(next);
    }
  }

  onResizeEnd(event: PointerEvent): void {
    if (!this.isResizing) return;
    this.isResizing = false;
    try { (event.target as HTMLElement).releasePointerCapture(event.pointerId); } catch {}
  }

  /** Keyboard a11y on the resize handle: arrows nudge by 16px. */
  onResizeKey(event: KeyboardEvent): void {
    const STEP = 16;
    if (event.key === 'ArrowLeft') {
      const next = Math.min(this.sidePaneMaxWidth, this.sidePaneWidth + STEP);
      this.sidePaneWidth = next;
      this.sidePaneWidthChange.emit(next);
      event.preventDefault();
    }
    if (event.key === 'ArrowRight') {
      const next = Math.max(this.sidePaneMinWidth, this.sidePaneWidth - STEP);
      this.sidePaneWidth = next;
      this.sidePaneWidthChange.emit(next);
      event.preventDefault();
    }
  }
}
