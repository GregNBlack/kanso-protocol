import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { KpButtonComponent } from '@kanso-protocol/ui/button';
import { KpIconComponent } from '@kanso-protocol/ui/icon';
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
  imports: [KpButtonComponent, KpNotificationItemComponent, KpIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClasses', role: 'region', 'aria-label': 'Notifications' },
  template: `
    <div class="kp-notif-center__header">
      <span class="kp-notif-center__title">Notifications</span>
      <div class="kp-notif-center__header-actions">
        <button kpButton size="sm" variant="ghost" color="neutral" (click)="markAllRead.emit()">Mark all as read</button>
        <button kpButton size="sm" variant="ghost" color="neutral" [iconOnly]="true" aria-label="Settings" (click)="settingsClick.emit()">
          <kp-icon kpButtonIconLeft name="settings" />
        </button>
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
            @for (n of visibleNotifications; track n.id) {
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
            @if (hasMore) {
              <button
                class="kp-notif-center__more"
                kpButton
                size="sm"
                variant="ghost"
                color="primary"
                [attr.aria-label]="'Show ' + remainingCount + ' more notifications'"
                (click)="showMore()"
              >
                Show {{ remainingCount }} more
              </button>
            }
          </div>
        }
        @case ('empty') {
          <div class="kp-notif-center__empty">
            <span class="kp-notif-center__empty-icon" aria-hidden="true"><kp-icon name="bell-off" /></span>
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
        <button kpButton size="sm" variant="ghost" color="neutral" (click)="viewAll.emit()">View all notifications</button>
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
      background: var(--kp-color-popover-bg);
      border: 1px solid var(--kp-color-popover-border);
      box-shadow: var(--kp-elevation-floating);
      overflow: hidden;
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
    }

    .kp-notif-center__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-bottom: 1px solid var(--kp-color-border-default);
    }
    .kp-notif-center__title {
      font-size: 15px;
      font-weight: 600;
      color: var(--kp-color-text-strong);
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
      border-bottom: 1px solid var(--kp-color-border-default);
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
      color: var(--kp-color-text-muted);
      cursor: pointer;
      transition: background var(--kp-motion-duration-fast) ease, color var(--kp-motion-duration-fast) ease;
    }
    .kp-notif-center__filter:hover { background: var(--kp-color-surface-muted); color: var(--kp-color-text-strong); }
    .kp-notif-center__filter--active { background: var(--kp-color-primary-subtle-bg-rest); color: var(--kp-color-accent-primary-fg); }
    .kp-notif-center__count {
      display: inline-flex;
      align-items: center;
      padding: 1px 6px;
      border-radius: 999px;
      background: var(--kp-color-surface-strong);
      color: var(--kp-color-text-default);
      font-size: 11px;
      font-weight: 500;
    }
    .kp-notif-center__filter--active .kp-notif-center__count {
      background: var(--kp-color-primary-default-bg-rest);
      color: var(--kp-color-foreground-on-saturated);
    }

    .kp-notif-center__body {
      flex: 1 1 auto;
      min-height: 0;
      overflow-y: auto;
    }
    .kp-notif-center__list { display: flex; flex-direction: column; }
    .kp-notif-center__more { width: 100%; margin: 4px 0; }

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
      background: var(--kp-color-surface-muted);
      color: var(--kp-color-text-muted);
      margin-bottom: 8px;
    }
    .kp-notif-center__empty-icon .ti { font-size: 24px; }
    .kp-notif-center__empty-title {
      font-size: 14px;
      font-weight: 500;
      color: var(--kp-color-text-strong);
    }
    .kp-notif-center__empty-desc {
      font-size: 13px;
      color: var(--kp-color-text-muted);
      max-width: 260px;
      line-height: 1.4;
    }

    .kp-notif-center__skeleton {
      display: flex;
      gap: 12px;
      padding: 12px 16px;
      border-bottom: 1px solid var(--kp-color-border-subtle);
    }
    .kp-notif-center__skel-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--kp-color-surface-muted);
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
      background: var(--kp-color-surface-muted);
    }

    .kp-notif-center__footer {
      display: flex;
      justify-content: center;
      padding: 8px 16px;
      border-top: 1px solid var(--kp-color-border-default);
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

    /* Forced-colors: the active filter is conveyed only via background +
       accent text, both of which flatten. Pin it to system selection colors
       so the active tab stays distinguishable. */
    @media (forced-colors: active) {
      .kp-notif-center__filter--active {
        forced-color-adjust: none;
        background: Highlight;
        color: HighlightText;
      }
      .kp-notif-center__filter--active .kp-notif-center__count {
        forced-color-adjust: none;
        background: HighlightText;
        color: Highlight;
      }
    }
  `],
})
export class KpNotificationCenterComponent {
  @Input() state: KpNotificationCenterState = 'with-items';

  private _notifications: KpNotification[] = [];
  /**
   * Notifications rendered in the `with-items` state. Replacing the array
   * identity (e.g. a filter swap) collapses the incremental reveal back to the
   * first page so a fresh list never starts scrolled open.
   */
  @Input()
  get notifications(): KpNotification[] {
    return this._notifications;
  }
  set notifications(value: KpNotification[]) {
    this._notifications = value ?? [];
    this.resetVisible();
  }

  private _pageSize: number | null = null;
  /**
   * Page size for long lists. When set, only the first `pageSize` items show;
   * a "Show more" button reveals the next page (client-side) and emits
   * `(loadMore)` so server-driven lists can append. Null = show all (default).
   */
  @Input()
  get pageSize(): number | null {
    return this._pageSize;
  }
  set pageSize(value: number | null) {
    this._pageSize = value;
    this.resetVisible();
  }

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
  /**
   * Emitted when "Show more" is clicked, after the window grows — carries how
   * many items are now visible and the total available, so a consumer can
   * lazy-fetch the next page when `visible` approaches `total`.
   */
  @Output() loadMore = new EventEmitter<{ visible: number; total: number }>();

  /** How many items are currently revealed (grows by pageSize on "Show more"). */
  visibleCount = Infinity;

  get visibleNotifications(): KpNotification[] {
    return this._pageSize == null ? this._notifications : this._notifications.slice(0, this.visibleCount);
  }

  get hasMore(): boolean {
    return this._pageSize != null && this.visibleCount < this._notifications.length;
  }

  /** Items still hidden beyond the current window — drives the "Show N more" hint. */
  get remainingCount(): number {
    return Math.max(0, this._notifications.length - this.visibleCount);
  }

  showMore(): void {
    const next = this.visibleCount + (this._pageSize ?? 0);
    this.visibleCount = Math.min(next, this._notifications.length);
    this.loadMore.emit({ visible: this.visibleCount, total: this._notifications.length });
  }

  /** Collapse the reveal window to the first page (or all when unpaged). */
  private resetVisible(): void {
    this.visibleCount = this._pageSize ?? Infinity;
  }

  get hostClasses(): string {
    return 'kp-notif-center';
  }
}
