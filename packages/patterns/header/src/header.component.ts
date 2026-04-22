import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { KpAvatarComponent } from '@kanso-protocol/avatar';

export type KpHeaderSize = 'sm' | 'md' | 'lg';
export type KpHeaderAppearance = 'light' | 'dark';

export interface KpHeaderNavItem {
  label: string;
  href?: string;
  active?: boolean;
}

/**
 * Kanso Protocol — Header (Topbar)
 *
 * App topbar pattern. Three-section layout (left / center / right)
 * with optional logo, inline nav, search slot, notifications,
 * theme toggle, CTA, and user menu. Data-driven; projection slots
 * for logo, search, and extra actions.
 *
 * Slots:
 * - `[kpHeaderLogo]` — replace the default logo mark + title
 * - `[kpHeaderSearch]` — render custom search UI in the center slot
 *   (takes precedence over `[showSearch]` placeholder)
 * - `[kpHeaderActions]` — extra action buttons before the user menu
 *
 * @example
 * <kp-header
 *   size="md"
 *   [navItems]="nav"
 *   [userName]="me.name"
 *   [userInitials]="me.initials"
 *   userRole="Admin"
 *   [showSearch]="true"
 *   [showNotifications]="true"
 *   notificationsCount="3"
 * />
 */
@Component({
  selector: 'kp-header',
  imports: [NgTemplateOutlet, KpAvatarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClasses', role: 'banner' },
  template: `
    <div class="kp-header__left">
      @if (showLogo) {
        <div class="kp-header__logo">
          <ng-content select="[kpHeaderLogo]">
            <span class="kp-header__logo-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 7l9-4 9 4v10l-9 4-9-4V7zM3 7l9 4 9-4M12 11v10"/>
              </svg>
            </span>
            <span class="kp-header__logo-text">{{ logoText }}</span>
          </ng-content>
        </div>
      }
      @if (showMainNav && navItems?.length) {
        <nav class="kp-header__nav" aria-label="Primary">
          @for (item of navItems; track item.label) {
            <a class="kp-header__nav-item"
               [class.kp-header__nav-item--active]="item.active"
               [attr.href]="item.href || null"
               [attr.aria-current]="item.active ? 'page' : null">
              {{ item.label }}
            </a>
          }
        </nav>
      }
    </div>

    <div class="kp-header__center">
      <ng-content select="[kpHeaderSearch]">
        @if (showSearch) {
          <div class="kp-header__search-placeholder" role="search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7"/><path d="m20 20-3-3"/>
            </svg>
            <span>{{ searchPlaceholder }}</span>
            <kbd>⌘K</kbd>
          </div>
        }
      </ng-content>
    </div>

    <div class="kp-header__right">
      <ng-content select="[kpHeaderActions]"/>

      @if (showThemeToggle) {
        <button type="button" class="kp-header__icon-btn" aria-label="Toggle theme" (click)="themeToggle.emit()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
        </button>
      }

      @if (showNotifications) {
        <button type="button" class="kp-header__icon-btn kp-header__icon-btn--notif" aria-label="Notifications" (click)="notificationsClick.emit()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21a2 2 0 0 0 4 0"/></svg>
          @if (notificationsCount) {
            <span class="kp-header__notif-badge" aria-live="polite">{{ notificationsCount }}</span>
          }
        </button>
      }

      @if (showCta) {
        <button type="button" class="kp-header__cta" (click)="ctaClick.emit()">{{ ctaLabel }}</button>
      }

      @if (showUserMenu) {
        <div class="kp-header__divider" aria-hidden="true"></div>
        <button type="button" class="kp-header__user" (click)="userMenuClick.emit()" [attr.aria-label]="userName || 'User menu'">
          <kp-avatar size="sm" [initials]="userInitials || null" [showStatus]="showUserStatus"/>
          @if (size !== 'sm' && (userName || userRole)) {
            <span class="kp-header__user-text">
              @if (userName) { <span class="kp-header__user-name">{{ userName }}</span> }
              @if (userRole) { <span class="kp-header__user-role">{{ userRole }}</span> }
            </span>
          }
          <svg class="kp-header__user-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
        </button>
      }
    </div>
  `,
  styles: [`
    :host {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      gap: var(--kp-header-gap, 24px);
      width: 100%;
      height: var(--kp-header-h, 64px);
      padding-inline: var(--kp-header-pad, 24px);
      background: var(--kp-header-bg, var(--kp-color-header-bg, #FFFFFF));
      color: var(--kp-header-fg, var(--kp-color-header-fg, #18181B));
      border-bottom: 1px solid var(--kp-color-header-border, #E4E4E7);
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
    }

    :host(.kp-header--sm) { --kp-header-h: 48px; --kp-header-pad: 16px; --kp-header-gap: 16px; --kp-header-logo: 24px; }
    :host(.kp-header--md) { --kp-header-h: 64px; --kp-header-pad: 24px; --kp-header-gap: 24px; --kp-header-logo: 32px; }
    :host(.kp-header--lg) { --kp-header-h: 80px; --kp-header-pad: 32px; --kp-header-gap: 32px; --kp-header-logo: 40px; }

    :host(.kp-header--dark) {
      --kp-header-bg: var(--kp-color-header-bg-dark, #18181B);
      --kp-header-fg: var(--kp-color-header-fg-dark, #FFFFFF);
      color: var(--kp-header-fg);
      border-bottom-color: #27272A;
    }

    .kp-header__left,
    .kp-header__right {
      display: flex;
      align-items: center;
      gap: var(--kp-header-gap);
      flex: 0 0 auto;
    }
    .kp-header__right { gap: 8px; }
    :host(.kp-header--md) .kp-header__right,
    :host(.kp-header--lg) .kp-header__right { gap: 12px; }

    .kp-header__center {
      flex: 1 1 auto;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 0;
    }

    .kp-header__logo {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      font-size: 16px;
      color: var(--kp-header-fg);
    }
    .kp-header__logo-mark {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: var(--kp-header-logo, 32px);
      height: var(--kp-header-logo, 32px);
      border-radius: 8px;
      background: var(--kp-color-blue-600, #2563EB);
      color: #fff;
    }
    .kp-header__logo-mark svg { width: 60%; height: 60%; }

    .kp-header__nav {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin-left: 16px;
    }
    :host(.kp-header--md) .kp-header__nav,
    :host(.kp-header--lg) .kp-header__nav { gap: 8px; }

    .kp-header__nav-item {
      display: inline-flex;
      align-items: center;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      color: var(--kp-color-header-nav-item-fg-rest, #3F3F46);
      text-decoration: none;
      transition: background 120ms ease, color 120ms ease;
    }
    .kp-header__nav-item:hover {
      color: var(--kp-color-header-nav-item-fg-hover, #18181B);
      background: var(--kp-color-header-nav-item-bg-hover, #FAFAFA);
    }
    .kp-header__nav-item--active {
      color: var(--kp-color-header-nav-item-fg-active, #2563EB);
    }
    :host(.kp-header--dark) .kp-header__nav-item { color: rgba(255,255,255,0.8); }
    :host(.kp-header--dark) .kp-header__nav-item:hover { background: #27272A; color: #fff; }
    :host(.kp-header--dark) .kp-header__nav-item--active { color: #60A5FA; }

    .kp-header__search-placeholder {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      width: min(100%, 420px);
      padding: 8px 12px;
      border: 1px solid var(--kp-color-gray-200, #E4E4E7);
      border-radius: 8px;
      font-size: 13px;
      color: var(--kp-color-gray-500, #71717A);
      background: var(--kp-color-gray-50, #FAFAFA);
    }
    .kp-header__search-placeholder svg { width: 16px; height: 16px; flex: 0 0 auto; }
    .kp-header__search-placeholder span { flex: 1 1 auto; text-align: left; }
    .kp-header__search-placeholder kbd {
      font-family: inherit;
      font-size: 11px;
      padding: 2px 6px;
      background: #fff;
      border: 1px solid var(--kp-color-gray-200, #E4E4E7);
      border-radius: 4px;
      color: var(--kp-color-gray-600, #52525B);
    }

    .kp-header__icon-btn {
      all: unset;
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      color: var(--kp-color-gray-600, #52525B);
      cursor: pointer;
      transition: background 120ms ease;
    }
    .kp-header__icon-btn svg { width: 20px; height: 20px; }
    .kp-header__icon-btn:hover { background: var(--kp-color-gray-100, #F4F4F5); color: var(--kp-color-gray-900, #18181B); }
    :host(.kp-header--dark) .kp-header__icon-btn { color: rgba(255,255,255,0.8); }
    :host(.kp-header--dark) .kp-header__icon-btn:hover { background: #27272A; color: #fff; }

    .kp-header__notif-badge {
      position: absolute;
      top: 2px;
      right: 2px;
      min-width: 16px;
      height: 16px;
      padding: 0 4px;
      border-radius: 999px;
      background: var(--kp-color-red-500, #EF4444);
      color: #fff;
      font-size: 10px;
      font-weight: 600;
      line-height: 16px;
      text-align: center;
    }

    .kp-header__cta {
      all: unset;
      display: inline-flex;
      align-items: center;
      padding: 8px 16px;
      background: var(--kp-color-blue-600, #2563EB);
      color: #fff;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background 120ms ease;
    }
    .kp-header__cta:hover { background: var(--kp-color-blue-700, #1D4ED8); }

    .kp-header__divider {
      width: 1px;
      height: 24px;
      margin-inline: 4px;
      background: var(--kp-color-header-divider, #E4E4E7);
    }
    :host(.kp-header--dark) .kp-header__divider { background: #3F3F46; }

    .kp-header__user {
      all: unset;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 4px;
      border-radius: 8px;
      cursor: pointer;
      transition: background 120ms ease;
    }
    .kp-header__user:hover { background: var(--kp-color-gray-100, #F4F4F5); }
    :host(.kp-header--dark) .kp-header__user:hover { background: #27272A; }

    .kp-header__user-text {
      display: inline-flex;
      flex-direction: column;
      line-height: 1.2;
    }
    .kp-header__user-name { font-size: 13px; font-weight: 500; color: var(--kp-header-fg); }
    .kp-header__user-role { font-size: 11px; color: var(--kp-color-gray-500, #71717A); }
    :host(.kp-header--dark) .kp-header__user-role { color: rgba(255,255,255,0.6); }

    .kp-header__user-chevron { width: 14px; height: 14px; color: var(--kp-color-gray-500, #71717A); }
    :host(.kp-header--dark) .kp-header__user-chevron { color: rgba(255,255,255,0.6); }
  `],
})
export class KpHeaderComponent {
  @Input() size: KpHeaderSize = 'md';
  @Input() appearance: KpHeaderAppearance = 'light';

  @Input() showLogo = true;
  @Input() logoText = 'Kanso Protocol';

  @Input() showMainNav = true;
  @Input() navItems: KpHeaderNavItem[] = [];

  @Input() showSearch = false;
  @Input() searchPlaceholder = 'Search anything...';

  @Input() showThemeToggle = false;

  @Input() showNotifications = true;
  @Input() notificationsCount: string | number | null = null;

  @Input() showCta = false;
  @Input() ctaLabel = 'Get started';

  @Input() showUserMenu = true;
  @Input() userName: string | null = null;
  @Input() userRole: string | null = null;
  @Input() userInitials: string | null = null;
  @Input() showUserStatus = false;

  @Output() themeToggle = new EventEmitter<void>();
  @Output() notificationsClick = new EventEmitter<void>();
  @Output() ctaClick = new EventEmitter<void>();
  @Output() userMenuClick = new EventEmitter<void>();

  get hostClasses(): string {
    return `kp-header kp-header--${this.size} kp-header--${this.appearance}`;
  }
}
