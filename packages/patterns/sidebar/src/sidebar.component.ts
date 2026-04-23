import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { KpAvatarComponent } from '@kanso-protocol/avatar';
import { KpNavItemComponent } from '@kanso-protocol/nav-item';

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
  imports: [KpAvatarComponent, KpNavItemComponent],
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
              @if (widthState !== 'collapsed') {
                <span class="kp-sidebar__logo-text">{{ logoText }}</span>
              }
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
          @if (showSectionLabels && section.label && widthState !== 'collapsed') {
            <div class="kp-sidebar__section-label">{{ section.label }}</div>
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
              (click$)="itemClick.emit(item)"
            >
              <span kpNavItemIcon>
                <i [class]="'ti ti-' + (item.icon || 'circle')" aria-hidden="true"></i>
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
                  (click$)="itemClick.emit(child)"
                />
              }
            }
          }
        </div>
      }
    </nav>

    @if (showUserFooter && (userName || userInitials)) {
      <div class="kp-sidebar__footer">
        <kp-avatar size="md" [initials]="userInitials || null" [showStatus]="true" status="online"/>
        @if (widthState !== 'collapsed') {
          <div class="kp-sidebar__footer-text">
            @if (userName) { <span class="kp-sidebar__footer-name">{{ userName }}</span> }
            @if (userEmail) { <span class="kp-sidebar__footer-email">{{ userEmail }}</span> }
          </div>
          <button type="button" class="kp-sidebar__footer-menu" aria-label="User options" (click)="userMenuClick.emit()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
          </button>
        }
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
      background: var(--kp-color-sidebar-bg, #FFFFFF);
      border-right: 1px solid var(--kp-color-sidebar-border, #E4E4E7);
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
      transition: width 160ms ease;
    }
    :host(.kp-sidebar--expanded)  { --kp-sidebar-w: 240px; }
    :host(.kp-sidebar--collapsed) { --kp-sidebar-w: 64px; }

    :host(.kp-sidebar--dark) {
      background: var(--kp-color-sidebar-bg-dark, #18181B);
      color: rgba(255,255,255,0.92);
      border-right-color: #27272A;
    }

    .kp-sidebar__top {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px;
    }
    .kp-sidebar__top-row {
      display: flex;
      align-items: center;
      gap: 12px;
      min-height: 40px;
    }
    :host(.kp-sidebar--collapsed) .kp-sidebar__top-row {
      position: relative;
      justify-content: center;
    }
    :host(.kp-sidebar--collapsed) .kp-sidebar__logo,
    :host(.kp-sidebar--collapsed) .kp-sidebar__toggle {
      transition: opacity 120ms ease;
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
      background: var(--kp-color-blue-600, #2563EB);
      color: #fff;
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
    }
    .kp-sidebar__toggle {
      all: unset;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 6px;
      color: var(--kp-color-gray-500, #71717A);
      cursor: pointer;
      transition: background 120ms ease, color 120ms ease;
    }
    .kp-sidebar__toggle:hover {
      background: var(--kp-color-gray-100, #F4F4F5);
      color: var(--kp-color-gray-900, #18181B);
    }
    .kp-sidebar__toggle svg { width: 16px; height: 16px; }
    :host(.kp-sidebar--dark) .kp-sidebar__toggle { color: rgba(255,255,255,0.7); }
    :host(.kp-sidebar--dark) .kp-sidebar__toggle:hover {
      background: #27272A;
      color: #FFFFFF;
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
    .kp-sidebar__section-label {
      padding: 8px 12px 4px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      color: var(--kp-color-sidebar-section-label, #71717A);
    }

    .kp-sidebar__badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 1px 8px;
      height: 20px;
      border-radius: 999px;
      background: var(--kp-color-gray-100, #F4F4F5);
      color: var(--kp-color-gray-700, #3F3F46);
      font-size: 11px;
      font-weight: 500;
    }

    .kp-sidebar__footer {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      border-top: 1px solid var(--kp-color-sidebar-border, #E4E4E7);
    }
    :host(.kp-sidebar--dark) .kp-sidebar__footer { border-top-color: #27272A; }
    .kp-sidebar__footer-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex: 1 1 auto;
      min-width: 0;
    }
    .kp-sidebar__footer-name {
      font-size: 13px;
      font-weight: 500;
      color: var(--kp-color-gray-900, #18181B);
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
    :host(.kp-sidebar--dark) .kp-sidebar__footer-name { color: #fff; }
    .kp-sidebar__footer-email {
      font-size: 11px;
      color: var(--kp-color-gray-500, #71717A);
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
      color: var(--kp-color-gray-500, #71717A);
      cursor: pointer;
    }
    .kp-sidebar__footer-menu:hover { color: var(--kp-color-gray-900, #18181B); background: var(--kp-color-gray-100, #F4F4F5); }
    .kp-sidebar__footer-menu svg { width: 18px; height: 18px; }

    :host(.kp-sidebar--collapsed) .kp-sidebar__footer { justify-content: center; padding-inline: 0; }
  `],
})
export class KpSidebarComponent {
  @Input() widthState: KpSidebarWidth = 'expanded';
  @Input() appearance: KpSidebarAppearance = 'light';

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

  onToggle(): void {
    this.widthState = this.widthState === 'expanded' ? 'collapsed' : 'expanded';
    this.toggle.emit(this.widthState);
  }
  @Output() itemClick = new EventEmitter<KpSidebarNavItem>();
  @Output() userMenuClick = new EventEmitter<void>();

  get hostClasses(): string {
    return `kp-sidebar kp-sidebar--${this.widthState} kp-sidebar--${this.appearance}`;
  }
}
