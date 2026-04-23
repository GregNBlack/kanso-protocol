import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import {
  KpAvatarAppearance,
  KpAvatarComponent,
  KpAvatarStatus,
} from '@kanso-protocol/avatar';

export type KpNotificationAppearance =
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

@Component({
  selector: 'kp-notification-item',
  imports: [KpAvatarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClasses', role: 'listitem' },
  template: `
    <kp-avatar
      size="md"
      [appearance]="resolvedAppearance"
      [initials]="avatarInitials || null"
      [src]="avatarSrc || null"
      [showStatus]="!read"
      [status]="statusColor"
    >
      @if (!avatarInitials && !avatarSrc && icon) {
        <i [class]="'ti ti-' + icon" aria-hidden="true"></i>
      }
    </kp-avatar>
    <div class="kp-notif-item__content">
      <span class="kp-notif-item__title">{{ title }}</span>
      @if (message) {
        <span class="kp-notif-item__message">{{ message }}</span>
      }
      @if (time) {
        <span class="kp-notif-item__time">{{ time }}</span>
      }
    </div>
  `,
  styles: [`
    :host {
      box-sizing: border-box;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px 16px;
      border-bottom: 1px solid var(--kp-color-gray-100, #F4F4F5);
      background: var(--kp-color-white, #FFFFFF);
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
      cursor: pointer;
      transition: background 120ms ease;
    }
    :host(.kp-notif-item--unread) { background: var(--kp-color-gray-50, #FAFAFA); }
    :host(:hover) { background: var(--kp-color-gray-100, #F4F4F5); }

    kp-avatar { flex: 0 0 auto; }
    kp-avatar ::ng-deep .ti { font-size: 18px; line-height: 1; }

    .kp-notif-item__content {
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex: 1 1 auto;
      min-width: 0;
    }
    .kp-notif-item__title {
      font-size: 13px;
      font-weight: 500;
      color: var(--kp-color-gray-900, #18181B);
    }
    .kp-notif-item__message {
      font-size: 13px;
      color: var(--kp-color-gray-600, #52525B);
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .kp-notif-item__time {
      font-size: 11px;
      color: var(--kp-color-gray-500, #71717A);
      margin-top: 2px;
    }
  `],
})
export class KpNotificationItemComponent {
  @Input() read = false;
  @Input() title = 'Notification title';
  @Input() message: string | null = null;
  @Input() time: string | null = null;

  @Input() icon: string | null = 'bell';
  @Input() appearance: KpNotificationAppearance = 'neutral';

  @Input() avatarInitials: string | null = null;
  @Input() avatarSrc: string | null = null;

  @Output() click$ = new EventEmitter<void>();

  /** Map notification appearance to Avatar's appearance tokens. User avatars stay default. */
  get resolvedAppearance(): KpAvatarAppearance {
    if (this.avatarInitials || this.avatarSrc) return 'default';
    return this.appearance as KpAvatarAppearance;
  }

  /** Unread indicator color — matches the appearance intent. Default: online (green). */
  get statusColor(): KpAvatarStatus {
    switch (this.appearance) {
      case 'danger':
      case 'warning': return 'busy';
      case 'neutral': return 'offline';
      default: return 'online';
    }
  }

  get hostClasses(): string {
    return `kp-notif-item ${this.read ? '' : 'kp-notif-item--unread'}`;
  }
}
