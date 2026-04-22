import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';

export type KpAvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type KpAvatarShape = 'circle' | 'square';
export type KpAvatarAppearance =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';
export type KpAvatarStatus = 'online' | 'offline' | 'busy' | 'away';

/**
 * Kanso Protocol — Avatar
 *
 * User-facing identity surface: image / initials / icon. Six sizes
 * × two shapes, seven color appearances, optional presence status
 * dot and ring (for stacks).
 *
 * Content precedence: `src` → image, else `initials` → initials,
 * else projected `<svg>` / default user glyph.
 *
 * @example
 * <kp-avatar size="md" initials="GB"/>
 * <kp-avatar size="lg" src="/me.jpg" [showStatus]="true" status="online"/>
 * <kp-avatar size="xl" shape="square" appearance="neutral">
 *   <svg><!-- company glyph --></svg>
 * </kp-avatar>
 */
@Component({
  selector: 'kp-avatar',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses',
    role: 'img',
    '[attr.aria-label]': 'ariaLabel',
  },
  template: `
    @if (src) {
      <img class="kp-avatar__img" [src]="src" [alt]="alt || initials || ''" />
    } @else if (initials) {
      <span class="kp-avatar__initials">{{ initials }}</span>
    } @else {
      <span class="kp-avatar__icon" aria-hidden="true">
        <ng-content>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0"/>
          </svg>
        </ng-content>
      </span>
    }

    @if (showStatus) {
      <span class="kp-avatar__status" [attr.data-status]="status" aria-hidden="true"></span>
    }
  `,
  styles: [`
    :host {
      box-sizing: border-box;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      position: relative;
      flex: 0 0 auto;
      width: var(--kp-avatar-size);
      height: var(--kp-avatar-size);
      border-radius: var(--kp-avatar-radius);
      background: var(--kp-avatar-bg);
      color: var(--kp-avatar-fg);
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
      font-weight: 600;
      line-height: 1;
      overflow: visible;
      user-select: none;
    }

    .kp-avatar__img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: inherit;
      display: block;
    }

    .kp-avatar__initials {
      font-size: var(--kp-avatar-font-size);
      letter-spacing: 0.01em;
    }

    .kp-avatar__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: var(--kp-avatar-icon-size);
      height: var(--kp-avatar-icon-size);
      color: inherit;
    }
    .kp-avatar__icon ::ng-deep svg {
      width: 100%;
      height: 100%;
      display: block;
    }

    /* Ring (for stacks) */
    :host(.kp-avatar--ring) {
      box-shadow: 0 0 0 var(--kp-avatar-ring-w) var(--kp-color-avatar-ring, #FFFFFF);
    }

    /* Status dot */
    .kp-avatar__status {
      position: absolute;
      right: 0;
      bottom: 0;
      width: var(--kp-avatar-status-size);
      height: var(--kp-avatar-status-size);
      border-radius: 50%;
      border: var(--kp-avatar-status-border) solid var(--kp-color-avatar-ring, #FFFFFF);
      box-sizing: content-box;
      transform: translate(20%, 20%);
    }
    :host(.kp-avatar--circle) .kp-avatar__status { transform: translate(5%, 5%); }
    .kp-avatar__status[data-status='online']  { background: var(--kp-color-avatar-status-online,  #22C55E); }
    .kp-avatar__status[data-status='offline'] { background: var(--kp-color-avatar-status-offline, #A1A1AA); }
    .kp-avatar__status[data-status='busy']    { background: var(--kp-color-avatar-status-busy,    #EF4444); }
    .kp-avatar__status[data-status='away']    { background: var(--kp-color-avatar-status-away,    #F59E0B); }

    /* Shapes */
    :host(.kp-avatar--circle) { --kp-avatar-radius: 50%; }

    /* Sizes */
    :host(.kp-avatar--xs) {
      --kp-avatar-size: 20px;
      --kp-avatar-font-size: 10px;
      --kp-avatar-icon-size: 12px;
      --kp-avatar-status-size: 6px;
      --kp-avatar-status-border: 1.5px;
      --kp-avatar-ring-w: 1.5px;
    }
    :host(.kp-avatar--sm) {
      --kp-avatar-size: 24px;
      --kp-avatar-font-size: 11px;
      --kp-avatar-icon-size: 14px;
      --kp-avatar-status-size: 6px;
      --kp-avatar-status-border: 1.5px;
      --kp-avatar-ring-w: 1.5px;
    }
    :host(.kp-avatar--md) {
      --kp-avatar-size: 32px;
      --kp-avatar-font-size: 12px;
      --kp-avatar-icon-size: 18px;
      --kp-avatar-status-size: 8px;
      --kp-avatar-status-border: 2px;
      --kp-avatar-ring-w: 2px;
    }
    :host(.kp-avatar--lg) {
      --kp-avatar-size: 40px;
      --kp-avatar-font-size: 14px;
      --kp-avatar-icon-size: 20px;
      --kp-avatar-status-size: 10px;
      --kp-avatar-status-border: 2px;
      --kp-avatar-ring-w: 2px;
    }
    :host(.kp-avatar--xl) {
      --kp-avatar-size: 56px;
      --kp-avatar-font-size: 18px;
      --kp-avatar-icon-size: 28px;
      --kp-avatar-status-size: 14px;
      --kp-avatar-status-border: 2.5px;
      --kp-avatar-ring-w: 2.5px;
    }
    :host(.kp-avatar--2xl) {
      --kp-avatar-size: 80px;
      --kp-avatar-font-size: 24px;
      --kp-avatar-icon-size: 40px;
      --kp-avatar-status-size: 18px;
      --kp-avatar-status-border: 3px;
      --kp-avatar-ring-w: 3px;
    }

    /* Square radii (per size) */
    :host(.kp-avatar--square.kp-avatar--xs),
    :host(.kp-avatar--square.kp-avatar--sm) { --kp-avatar-radius: 4px; }
    :host(.kp-avatar--square.kp-avatar--md) { --kp-avatar-radius: 6px; }
    :host(.kp-avatar--square.kp-avatar--lg) { --kp-avatar-radius: 8px; }
    :host(.kp-avatar--square.kp-avatar--xl) { --kp-avatar-radius: 10px; }
    :host(.kp-avatar--square.kp-avatar--2xl){ --kp-avatar-radius: 14px; }

    /* Appearances (color roles) */
    :host(.kp-avatar--default) {
      --kp-avatar-bg: var(--kp-color-avatar-bg-default, #E4E4E7);
      --kp-avatar-fg: var(--kp-color-avatar-fg-default, #3F3F46);
    }
    :host(.kp-avatar--primary) {
      --kp-avatar-bg: var(--kp-color-avatar-bg-primary, #DBEAFE);
      --kp-avatar-fg: var(--kp-color-avatar-fg-primary, #1D4ED8);
    }
    :host(.kp-avatar--success) {
      --kp-avatar-bg: var(--kp-color-avatar-bg-success, #DCFCE7);
      --kp-avatar-fg: var(--kp-color-avatar-fg-success, #15803D);
    }
    :host(.kp-avatar--warning) {
      --kp-avatar-bg: var(--kp-color-avatar-bg-warning, #FEF3C7);
      --kp-avatar-fg: var(--kp-color-avatar-fg-warning, #B45309);
    }
    :host(.kp-avatar--danger) {
      --kp-avatar-bg: var(--kp-color-avatar-bg-danger, #FEE2E2);
      --kp-avatar-fg: var(--kp-color-avatar-fg-danger, #B91C1C);
    }
    :host(.kp-avatar--info) {
      --kp-avatar-bg: var(--kp-color-avatar-bg-info, #CFFAFE);
      --kp-avatar-fg: var(--kp-color-avatar-fg-info, #0E7490);
    }
    :host(.kp-avatar--neutral) {
      --kp-avatar-bg: var(--kp-color-avatar-bg-neutral, #18181B);
      --kp-avatar-fg: var(--kp-color-avatar-fg-neutral, #FFFFFF);
    }
  `],
})
export class KpAvatarComponent {
  @Input() size: KpAvatarSize = 'md';
  @Input() shape: KpAvatarShape = 'circle';
  @Input() appearance: KpAvatarAppearance = 'default';

  @Input() initials: string | null = null;
  @Input() src: string | null = null;
  @Input() alt: string | null = null;

  @Input() showStatus = false;
  @Input() status: KpAvatarStatus = 'online';

  /** Adds a contrasting outer ring — used by AvatarGroup for overlapping stacks */
  @Input() showRing = false;

  /** Override the auto-computed aria-label (defaults to initials/alt) */
  @Input() ariaLabelOverride: string | null = null;

  get ariaLabel(): string | null {
    if (this.ariaLabelOverride) return this.ariaLabelOverride;
    return this.alt || this.initials || null;
  }

  get hostClasses(): string {
    const c = [
      'kp-avatar',
      `kp-avatar--${this.size}`,
      `kp-avatar--${this.shape}`,
      `kp-avatar--${this.appearance}`,
    ];
    if (this.showRing) c.push('kp-avatar--ring');
    return c.join(' ');
  }
}
