import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { KpAvatarComponent, KpAvatarStatus } from '@kanso-protocol/ui/avatar';
import { KpMenuItemComponent } from '@kanso-protocol/ui/menu';

export type KpUserMenuSize = 'sm' | 'md';

export interface KpUserMenuItem {
  id: string;
  label: string;
  danger?: boolean;
}

/**
 * Kanso Protocol — UserMenu
 *
 * Preset dropdown shown from the user Avatar in Header. User block
 * at top, main menu, optional theme toggle + help links, Sign out.
 *
 * Slots:
 * - `[kpUserMenuItems]` — main menu items (Profile / Settings / Billing / Team)
 * - `[kpUserMenuHelp]` — help links
 * - `[kpUserMenuTheme]` — theme toggle row (e.g. a SegmentedControl)
 *
 * @example
 * <kp-user-menu
 *   userName="Greg Black"
 *   userInitials="GB"
 *   userEmail="greg@example.com"
 *   [showPlanBadge]="true"
 *   planName="Pro"
 * >
 *   <div kpUserMenuItems>
 *     <kp-menu-item icon="user" label="Profile" (click$)="goto('profile')"/>
 *     ...
 *   </div>
 * </kp-user-menu>
 */
@Component({
  selector: 'kp-user-menu',
  imports: [KpAvatarComponent, KpMenuItemComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Host is a floating panel containing menuitems alongside non-menu chrome
  // (user info card, theme toggle, divider). role="menu" is scoped to each
  // menuitem-bearing group below; the host itself stays a generic container.
  host: { '[class]': 'hostClasses' },
  template: `
    <div class="kp-user-menu__info">
      <kp-avatar [size]="avatarSize" [initials]="userInitials || null" [showStatus]="presence !== null" [status]="presence ?? 'offline'"/>
      <div class="kp-user-menu__text">
        <span class="kp-user-menu__name-row">
          <span class="kp-user-menu__name">{{ userName }}</span>
          @if (showPlanBadge) {
            <span class="kp-user-menu__plan">{{ planName }}</span>
          }
        </span>
        @if (showEmail && userEmail) {
          <span class="kp-user-menu__email">{{ userEmail }}</span>
        }
      </div>
    </div>

    <div class="kp-user-menu__divider" aria-hidden="true"></div>

    <div class="kp-user-menu__group" role="menu">
      <ng-content select="[kpUserMenuItems]"/>
    </div>

    <div class="kp-user-menu__divider" aria-hidden="true"></div>

    @if (showThemeToggle) {
      <div class="kp-user-menu__theme">
        <span class="kp-user-menu__theme-label">Theme</span>
        <ng-content select="[kpUserMenuTheme]"/>
      </div>
      <div class="kp-user-menu__divider" aria-hidden="true"></div>
    }

    @if (showHelpLink) {
      <div class="kp-user-menu__group" role="menu">
        <ng-content select="[kpUserMenuHelp]"/>
      </div>
      <div class="kp-user-menu__divider" aria-hidden="true"></div>
    }

    <div class="kp-user-menu__group" role="menu">
      <kp-menu-item label="Sign out" [danger]="true" (click)="signOut.emit()">
        <svg kpMenuItemIcon viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12h12l-3-3m0 6 3-3M15 17v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1"/></svg>
      </kp-menu-item>
    </div>
  `,
  styles: [`
    :host {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      width: var(--kp-user-menu-w, 280px);
      padding: 4px 0;
      border-radius: 12px;
      background: var(--kp-color-popover-bg);
      border: 1px solid var(--kp-color-popover-border);
      box-shadow: var(--kp-elevation-overlay);
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
    }
    :host(.kp-user-menu--sm) { --kp-user-menu-w: 240px; --kp-user-menu-pad: 8px; }
    :host(.kp-user-menu--md) { --kp-user-menu-w: 280px; --kp-user-menu-pad: 12px; }

    .kp-user-menu__info {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: var(--kp-user-menu-pad, 12px) calc(var(--kp-user-menu-pad, 12px) + 4px);
    }
    .kp-user-menu__text { display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1 1 auto; }
    .kp-user-menu__name-row { display: inline-flex; align-items: center; gap: 6px; }
    .kp-user-menu__name { font-size: 14px; font-weight: 500; color: var(--kp-color-text-strong); }
    .kp-user-menu__plan {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      border-radius: 999px;
      background: var(--kp-color-primary-default-bg-rest);
      color: var(--kp-color-foreground-on-saturated);
      font-size: 11px;
      font-weight: 600;
      line-height: 1;
    }
    .kp-user-menu__email { font-size: 12px; color: var(--kp-color-text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    .kp-user-menu__divider { height: 1px; background: var(--kp-color-surface-strong); }

    .kp-user-menu__group { padding: 4px; display: flex; flex-direction: column; gap: 0; }

    .kp-user-menu__theme {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: var(--kp-user-menu-pad, 12px) calc(var(--kp-user-menu-pad, 12px) + 4px);
    }
    .kp-user-menu__theme-label { flex: 1 1 auto; font-size: 14px; color: var(--kp-color-text-default); }

    .kp-user-menu__row {
      all: unset;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 8px;
      border-radius: 6px;
      font-size: 13px;
      color: var(--kp-color-text-default);
      cursor: pointer;
      transition: background var(--kp-motion-duration-fast) ease;
    }
    /* Match DropdownMenu menu-item hover exactly: bg → surface-subtle,
       fg unchanged. The user-menu-row was previously using
       surface-muted (one step darker) which read differently from
       regular menu items. Architectural follow-up: replace
       .kp-user-menu__row with <kp-menu-item>. */
    .kp-user-menu__row:hover { background: var(--kp-color-surface-muted); }
    .kp-user-menu__row-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      color: var(--kp-color-text-muted);
    }
    .kp-user-menu__row-icon svg { width: 100%; height: 100%; }

    .kp-user-menu__row--danger {
      color: var(--kp-color-menu-item-fg-danger-rest);
    }
    .kp-user-menu__row--danger .kp-user-menu__row-icon { color: var(--kp-color-menu-item-fg-danger-rest); }
    .kp-user-menu__row--danger:hover { background: var(--kp-color-danger-subtle-bg-rest); color: var(--kp-color-menu-item-fg-danger-hover); }
  `],
})
export class KpUserMenuComponent {
  @Input() size: KpUserMenuSize = 'md';

  @Input() userName: string | null = 'Greg Black';
  @Input() userEmail: string | null = 'greg@example.com';
  @Input() userInitials: string | null = 'GB';
  /** Presence dot on the avatar: `online` / `away` / `busy` / `offline`, or `null` to hide it. */
  @Input() presence: KpAvatarStatus | null = 'online';

  @Input() showEmail = true;
  @Input() showPlanBadge = false;
  @Input() planName = 'Pro';
  @Input() showThemeToggle = false;
  @Input() showHelpLink = true;

  @Output() signOut = new EventEmitter<void>();

  get avatarSize(): 'md' | 'lg' {
    return this.size === 'md' ? 'lg' : 'md';
  }

  get hostClasses(): string {
    return `kp-user-menu kp-user-menu--${this.size}`;
  }
}
