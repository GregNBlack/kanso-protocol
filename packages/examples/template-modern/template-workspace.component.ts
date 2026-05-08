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
 *        [navSections]="navSections"
 *        [user]="user"
 *        [breadcrumbs]="crumbs"
 *        [(theme)]="theme"
 *        (signOut)="logout()"
 *      >
 *        <div kpWsMain>...your main content...</div>
 *        <div kpWsSide>...optional side pane...</div>
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

import { KpAppShellComponent } from '@kanso-protocol/app-shell';
import { KpSidebarComponent, KpSidebarNavItem, KpSidebarSection } from '@kanso-protocol/sidebar';
import { KpAvatarComponent } from '@kanso-protocol/avatar';
import { KpUserMenuComponent } from '@kanso-protocol/user-menu';
import { KpMenuItemComponent } from '@kanso-protocol/menu';
import { KpThemeToggleComponent } from '@kanso-protocol/theme-toggle';
import {
  KpNotificationCenterComponent,
  KpNotification,
} from '@kanso-protocol/notification-center';
import { KpIconComponent } from '@kanso-protocol/icon';
import { KpIconButtonComponent } from '@kanso-protocol/button';
import { KpBadgeComponent } from '@kanso-protocol/badge';
import {
  KpBreadcrumbsComponent,
  KpBreadcrumbItemComponent,
  KpBreadcrumbSeparatorComponent,
} from '@kanso-protocol/breadcrumbs';

// ============================================================================
// Public types
// ============================================================================

export interface KpWsBreadcrumb {
  label: string;
  /** Omit for the last (current) item — renders as plain text. */
  href?: string;
}

export interface KpWsUser {
  name: string;
  email?: string;
  initials: string;
  planName?: string;
  showPlanBadge?: boolean;
}

export interface KpWsUserMenuItem {
  label: string;
  /** Tabler icon name (must be present in the consumer's icon registry). */
  icon: string;
  danger?: boolean;
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
    KpMenuItemComponent,
    KpThemeToggleComponent,
    KpNotificationCenterComponent,
    KpIconComponent,
    KpIconButtonComponent,
    KpBadgeComponent,
    KpBreadcrumbsComponent,
    KpBreadcrumbItemComponent,
    KpBreadcrumbSeparatorComponent,
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

        <!-- Breadcrumbs (stretches when present, spacer otherwise) -->
        @if (breadcrumbs.length) {
          <kp-breadcrumbs class="kp-tpl__breadcrumbs" size="md">
            @for (bc of breadcrumbs; track bc.label; let last = $last) {
              @if (last || !bc.href) {
                <kp-breadcrumb-item type="current">{{ bc.label }}</kp-breadcrumb-item>
              } @else {
                <kp-breadcrumb-item type="link" [href]="bc.href!">{{ bc.label }}</kp-breadcrumb-item>
                <kp-breadcrumb-separator/>
              }
            }
          </kp-breadcrumbs>
        } @else {
          <span class="kp-tpl__breadcrumbs-spacer"></span>
        }

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
                  <kp-notification-center
                    state="with-items"
                    [notifications]="notifications"
                    (close)="notifOpen = false"/>
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
                    <div kpUserMenuItems style="display:flex;flex-direction:column">
                      @for (it of userMenuItems; track it.label) {
                        <kp-menu-item
                          [label]="it.label"
                          size="md"
                          [danger]="!!it.danger"
                          (click)="onUserMenuItem(it)">
                          <kp-icon kpMenuItemIcon [name]="it.icon" size="md"/>
                        </kp-menu-item>
                      }
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
    .kp-tpl__breadcrumbs {
      flex: 1 1 0;
      min-width: 0;
      overflow: hidden;
    }
    .kp-tpl__breadcrumbs ::ng-deep kp-breadcrumb-item { min-width: 0; }
    .kp-tpl__breadcrumbs ::ng-deep .kp-bc-item__label {
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .kp-tpl__breadcrumbs-spacer { flex: 1 1 auto; }
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

    /* ===== Content area ===== */
    .kp-tpl__content {
      display: flex;
      gap: 0;
      padding: var(--kp-ws-pane-pad, 8px);
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
      .kp-tpl__content { flex-direction: column; }
      .kp-tpl__pane--side { flex: 1 1 auto; }
      .kp-tpl__resize-handle { display: none; }
    }
    @media (max-width: 899px) {
      .kp-tpl__action-btn { display: none; }
    }
    @media (max-width: 767px) {
      .kp-tpl__header { gap: 12px; padding: 10px 12px; }
      .kp-tpl__logo-text { display: none; }
      .kp-tpl__breadcrumbs ::ng-deep kp-breadcrumb-item:not(:last-of-type),
      .kp-tpl__breadcrumbs ::ng-deep kp-breadcrumb-separator { display: none; }
    }
    @media (max-width: 639px) {
      .kp-tpl__header-right { gap: 4px; }
      .kp-tpl__content { padding: 4px; }
      .kp-tpl__pane { padding: 16px; border-radius: 12px; }
    }
  `],
})
export class KpTemplateWorkspaceComponent implements OnInit, OnDestroy {

  // ===== Inputs (data) ==================================================
  @Input() brandMark: string | null = '簡素';
  @Input() brandText: string | null = 'Kanso Protocol';
  @Input() breadcrumbs: KpWsBreadcrumb[] = [];
  @Input() navSections: KpSidebarSection[] = [];
  @Input() notifications: KpNotification[] = [];
  /** When `null` the bell badge is hidden. */
  @Input() unreadCount: number | null = null;
  @Input() user: KpWsUser | null = null;
  @Input() userMenuItems: KpWsUserMenuItem[] = [];

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
  @Output() userMenuItemClick = new EventEmitter<KpWsUserMenuItem>();
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
    this.applyResolvedTheme(e.matches ? 'dark' : 'light', 'system');
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
    this.applyResolvedTheme(resolved, t);
    this.themeChange.emit(t);
  }

  /** Apply the resolved palette to the document. Storybook globals are
   *  synced ONLY for explicit light/dark — for "system" we keep the
   *  toolbar untouched (Storybook's enum has no representation for
   *  "system", and emitting the resolved value would lose the user's
   *  intent on the next render when the mirror decorator re-applies).
   *
   *  The globals emit is deferred ~260ms (just past the segmented
   *  toggle's pill transition) — synchronously emitting forces the
   *  addon-themes decorator to re-render the story mid-click, which
   *  destroys the toggle component and aborts the pill slide animation.
   *  Letting the visual transition complete first keeps the slide
   *  smooth, then the toolbar catches up a frame later. */
  private applyResolvedTheme(resolved: 'light' | 'dark', original: KpWsTheme): void {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute('data-theme', resolved);
    document.body.setAttribute('data-theme', resolved);
    if (original === 'system') return;
    const ch = (globalThis as { __STORYBOOK_ADDONS_CHANNEL__?: { emit?: (e: string, p: unknown) => void } })
      .__STORYBOOK_ADDONS_CHANNEL__;
    if (ch?.emit) {
      setTimeout(() => ch.emit?.('updateGlobals', { globals: { theme: resolved } }), 260);
    }
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

  onUserMenuItem(it: KpWsUserMenuItem): void {
    this.userMenuItemClick.emit(it);
    this.userMenuOpen = false;
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
