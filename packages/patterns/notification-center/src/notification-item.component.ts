import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { KpAvatarComponent } from '@kanso-protocol/avatar';

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
    @if (!read) {
      <span class="kp-notif-item__unread" aria-label="Unread"></span>
    }
    @if (avatarInitials || avatarSrc) {
      <kp-avatar size="md" [initials]="avatarInitials || null" [src]="avatarSrc || null"/>
    } @else if (icon) {
      <span class="kp-notif-item__icon-wrap" [attr.data-appearance]="appearance" aria-hidden="true">
        <i [class]="'ti ti-' + icon"></i>
      </span>
    }
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
      position: relative;
      border-bottom: 1px solid var(--kp-color-gray-100, #F4F4F5);
      background: var(--kp-color-white, #FFFFFF);
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
      cursor: pointer;
      transition: background 120ms ease;
    }
    :host(.kp-notif-item--unread) { background: var(--kp-color-gray-50, #FAFAFA); }
    :host(:hover) { background: var(--kp-color-gray-100, #F4F4F5); }

    .kp-notif-item__unread {
      position: absolute;
      left: 6px;
      top: 50%;
      transform: translateY(-50%);
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--kp-color-blue-600, #2563EB);
    }

    .kp-notif-item__icon-wrap {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      flex: 0 0 auto;
    }
    .kp-notif-item__icon-wrap .ti { font-size: 20px; line-height: 1; }
    .kp-notif-item__icon-wrap[data-appearance='primary'] { background: var(--kp-color-blue-100, #DBEAFE); color: var(--kp-color-blue-600, #2563EB); }
    .kp-notif-item__icon-wrap[data-appearance='success'] { background: var(--kp-color-green-100, #DCFCE7); color: var(--kp-color-green-600, #16A34A); }
    .kp-notif-item__icon-wrap[data-appearance='warning'] { background: var(--kp-color-amber-100, #FEF3C7); color: var(--kp-color-amber-600, #D97706); }
    .kp-notif-item__icon-wrap[data-appearance='danger'] { background: var(--kp-color-red-100, #FEE2E2); color: var(--kp-color-red-600, #DC2626); }
    .kp-notif-item__icon-wrap[data-appearance='info'] { background: var(--kp-color-cyan-100, #CFFAFE); color: var(--kp-color-cyan-600, #0891B2); }
    .kp-notif-item__icon-wrap[data-appearance='neutral'] { background: var(--kp-color-gray-100, #F4F4F5); color: var(--kp-color-gray-600, #52525B); }

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

  get hostClasses(): string {
    return `kp-notif-item ${this.read ? '' : 'kp-notif-item--unread'}`;
  }
}
