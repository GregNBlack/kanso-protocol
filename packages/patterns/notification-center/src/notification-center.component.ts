import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { KpButtonComponent } from '@kanso-protocol/button';
import {
  KpNotificationAppearance,
  KpNotificationItemComponent,
} from './notification-item.component';

export type KpNotificationCenterState = 'with-items' | 'empty' | 'loading';

export interface KpNotification {
  id: string;
  title: string;
  message?: string;
  time?: string;
  read?: boolean;
  icon?: string;
  appearance?: KpNotificationAppearance;
  avatarInitials?: string;
  avatarSrc?: string;
}

/**
 * Kanso Protocol — NotificationCenter
 *
 * Panel with header + optional filters + list of notifications +
 * optional footer ("View all"). Three states: with-items / empty /
 * loading. Typically anchored to the bell icon in Header via
 * DropdownMenu / Popover positioning.
 *
 * @example
 * <kp-notification-center
 *   state="with-items"
 *   [notifications]="items"
 *   [showFilters]="true"
 *   unreadCount="3"
 * />
 */
@Component({
  selector: 'kp-notification-center',
  imports: [KpButtonComponent, KpNotificationItemComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClasses', role: 'region', 'aria-label': 'Notifications' },
  template: `
    <div class="kp-notif-center__header">
      <span class="kp-notif-center__title">Notifications</span>
      <div class="kp-notif-center__header-actions">
        <kp-button size="sm" variant="ghost" color="neutral" (click)="markAllRead.emit()">Mark all as read</kp-button>
        <kp-button size="sm" variant="ghost" color="neutral" [iconOnly]="true" aria-label="Settings" (click)="settingsClick.emit()">
          <i kpButtonIconLeft class="ti ti-settings" aria-hidden="true"></i>
        </kp-button>
      </div>
    </div>

    @if (showFilters) {
      <div class="kp-notif-center__filters">
        @for (f of filters; track f.id) {
          <button
            type="button"
            class="kp-notif-center__filter"
            [class.kp-notif-center__filter--active]="activeFilter === f.id"
            (click)="filterChange.emit(f.id)"
          >
            {{ f.label }}
            @if (f.count != null) { <span class="kp-notif-center__count">{{ f.count }}</span> }
          </button>
        }
      </div>
    }

    <div class="kp-notif-center__body">
      @switch (state) {
        @case ('with-items') {
          <div class="kp-notif-center__list" role="list">
            @for (n of notifications; track n.id) {
              <kp-notification-item
                [title]="n.title"
                [message]="n.message ?? null"
                [time]="n.time ?? null"
                [read]="!!n.read"
                [icon]="n.avatarInitials || n.avatarSrc ? null : (n.icon ?? 'bell')"
                [appearance]="n.appearance || 'neutral'"
                [avatarInitials]="n.avatarInitials ?? null"
                [avatarSrc]="n.avatarSrc ?? null"
                (click$)="itemClick.emit(n)"
              />
            }
          </div>
        }
        @case ('empty') {
          <div class="kp-notif-center__empty">
            <span class="kp-notif-center__empty-icon" aria-hidden="true"><i class="ti ti-bell-off"></i></span>
            <span class="kp-notif-center__empty-title">You're all caught up</span>
            <span class="kp-notif-center__empty-desc">No new notifications. We'll let you know when something arrives.</span>
          </div>
        }
        @case ('loading') {
          <div class="kp-notif-center__list">
            @for (_ of [0,1,2,3]; track $index) {
              <div class="kp-notif-center__skeleton">
                <span class="kp-notif-center__skel-avatar"></span>
                <span class="kp-notif-center__skel-lines">
                  <span class="kp-notif-center__skel-line" style="width:60%"></span>
                  <span class="kp-notif-center__skel-line" style="width:90%"></span>
                  <span class="kp-notif-center__skel-line" style="width:30%"></span>
                </span>
              </div>
            }
          </div>
        }
      }
    </div>

    @if (showFooter) {
      <div class="kp-notif-center__footer">
        <kp-button size="sm" variant="ghost" color="neutral" (click)="viewAll.emit()">View all notifications</kp-button>
      </div>
    }
  `,
  styles: [`
    :host {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      width: 400px;
      max-height: 600px;
      border-radius: 12px;
      background: var(--kp-color-white, #FFFFFF);
      border: 1px solid var(--kp-color-gray-200, #E4E4E7);
      box-shadow: 0 12px 32px -8px rgba(0,0,0,0.12), 0 4px 8px -4px rgba(0,0,0,0.06);
      overflow: hidden;
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
    }

    .kp-notif-center__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-bottom: 1px solid var(--kp-color-gray-200, #E4E4E7);
    }
    .kp-notif-center__title {
      font-size: 15px;
      font-weight: 600;
      color: var(--kp-color-gray-900, #18181B);
    }
    .kp-notif-center__header-actions {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .kp-notif-center__filters {
      display: flex;
      gap: 4px;
      padding: 8px;
      border-bottom: 1px solid var(--kp-color-gray-200, #E4E4E7);
    }
    .kp-notif-center__filter {
      all: unset;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      color: var(--kp-color-gray-600, #52525B);
      cursor: pointer;
      transition: background 120ms ease, color 120ms ease;
    }
    .kp-notif-center__filter:hover { background: var(--kp-color-gray-100, #F4F4F5); color: var(--kp-color-gray-900, #18181B); }
    .kp-notif-center__filter--active { background: var(--kp-color-blue-50, #EFF6FF); color: var(--kp-color-blue-700, #1D4ED8); }
    .kp-notif-center__count {
      display: inline-flex;
      align-items: center;
      padding: 1px 6px;
      border-radius: 999px;
      background: var(--kp-color-gray-200, #E4E4E7);
      color: var(--kp-color-gray-700, #3F3F46);
      font-size: 11px;
      font-weight: 500;
    }
    .kp-notif-center__filter--active .kp-notif-center__count {
      background: var(--kp-color-blue-600, #2563EB);
      color: #FFFFFF;
    }

    .kp-notif-center__body {
      flex: 1 1 auto;
      min-height: 0;
      overflow-y: auto;
    }
    .kp-notif-center__list { display: flex; flex-direction: column; }

    .kp-notif-center__empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 48px 24px;
      text-align: center;
    }
    .kp-notif-center__empty-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--kp-color-gray-100, #F4F4F5);
      color: var(--kp-color-gray-500, #71717A);
      margin-bottom: 8px;
    }
    .kp-notif-center__empty-icon .ti { font-size: 24px; }
    .kp-notif-center__empty-title {
      font-size: 14px;
      font-weight: 500;
      color: var(--kp-color-gray-900, #18181B);
    }
    .kp-notif-center__empty-desc {
      font-size: 13px;
      color: var(--kp-color-gray-500, #71717A);
      max-width: 260px;
      line-height: 1.4;
    }

    .kp-notif-center__skeleton {
      display: flex;
      gap: 12px;
      padding: 12px 16px;
      border-bottom: 1px solid var(--kp-color-gray-100, #F4F4F5);
    }
    .kp-notif-center__skel-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--kp-color-gray-100, #F4F4F5);
      flex: 0 0 auto;
    }
    .kp-notif-center__skel-lines {
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex: 1 1 auto;
      padding-top: 4px;
    }
    .kp-notif-center__skel-line {
      height: 10px;
      border-radius: 4px;
      background: var(--kp-color-gray-100, #F4F4F5);
    }

    .kp-notif-center__footer {
      display: flex;
      justify-content: center;
      padding: 8px 16px;
      border-top: 1px solid var(--kp-color-gray-200, #E4E4E7);
    }
  `],
})
export class KpNotificationCenterComponent {
  @Input() state: KpNotificationCenterState = 'with-items';
  @Input() notifications: KpNotification[] = [];

  @Input() showFilters = false;
  @Input() activeFilter = 'all';
  @Input() filters: { id: string; label: string; count?: number }[] = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread' },
    { id: 'mentions', label: 'Mentions' },
  ];

  @Input() showFooter = true;

  @Output() markAllRead = new EventEmitter<void>();
  @Output() settingsClick = new EventEmitter<void>();
  @Output() itemClick = new EventEmitter<KpNotification>();
  @Output() filterChange = new EventEmitter<string>();
  @Output() viewAll = new EventEmitter<void>();

  get hostClasses(): string {
    return 'kp-notif-center';
  }
}
