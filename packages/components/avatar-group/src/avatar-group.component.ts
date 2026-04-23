import {
  ChangeDetectionStrategy,
  Component,
  Input,
  computed,
  signal,
} from '@angular/core';
import {
  KpAvatarAppearance,
  KpAvatarComponent,
  KpAvatarSize,
} from '@kanso-protocol/avatar';

export type KpAvatarGroupOverlap = 'tight' | 'normal' | 'loose';

export interface KpAvatarGroupItem {
  initials?: string;
  src?: string;
  alt?: string;
  appearance?: KpAvatarAppearance;
}

/**
 * Kanso Protocol — AvatarGroup
 *
 * Overlapping stack of Avatars with an optional "+N" count chip.
 * Items after `max` collapse into the count; `total` drives the
 * displayed number ("+N" = `total - visible.length`).
 *
 * Each avatar is rendered with `showRing=true` so the overlap
 * reads cleanly against any background.
 *
 * @example
 * <kp-avatar-group size="sm" [items]="members" [max]="4" [total]="members.length"/>
 */
@Component({
  selector: 'kp-avatar-group',
  imports: [KpAvatarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClasses' },
  template: `
    @for (item of visible(); track $index) {
      <kp-avatar
        [size]="size"
        [initials]="item.initials ?? null"
        [src]="item.src ?? null"
        [alt]="item.alt ?? null"
        [appearance]="item.appearance ?? 'default'"
        [showRing]="true"
      />
    }
    @if (showCount && remaining() > 0) {
      <span class="kp-avatar-group__count" [attr.aria-label]="'+' + remaining() + ' more'">
        +{{ remaining() }}
      </span>
    }
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      gap: var(--kp-avatar-group-gap);
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
    }

    .kp-avatar-group__count {
      box-sizing: border-box;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 auto;
      width: var(--kp-avatar-group-count-size);
      height: var(--kp-avatar-group-count-size);
      border-radius: 50%;
      background: var(--kp-color-avatar-group-count-bg, var(--kp-color-gray-200));
      color: var(--kp-color-avatar-group-count-fg, var(--kp-color-gray-700));
      font-size: var(--kp-avatar-group-count-font);
      font-weight: 600;
      box-shadow: 0 0 0 var(--kp-avatar-group-ring-w) var(--kp-color-avatar-ring, var(--kp-color-white));
    }

    /* Size (drives count chip dimensions and base overlap) */
    :host(.kp-avatar-group--xs) {
      --kp-avatar-group-count-size: 20px;
      --kp-avatar-group-count-font: 10px;
      --kp-avatar-group-ring-w: 1.5px;
      --kp-avatar-group-gap-tight: -10px;
      --kp-avatar-group-gap-normal: -8px;
      --kp-avatar-group-gap-loose: -4px;
    }
    :host(.kp-avatar-group--sm) {
      --kp-avatar-group-count-size: 24px;
      --kp-avatar-group-count-font: 11px;
      --kp-avatar-group-ring-w: 1.5px;
      --kp-avatar-group-gap-tight: -12px;
      --kp-avatar-group-gap-normal: -10px;
      --kp-avatar-group-gap-loose: -6px;
    }
    :host(.kp-avatar-group--md) {
      --kp-avatar-group-count-size: 32px;
      --kp-avatar-group-count-font: 12px;
      --kp-avatar-group-ring-w: 2px;
      --kp-avatar-group-gap-tight: -16px;
      --kp-avatar-group-gap-normal: -12px;
      --kp-avatar-group-gap-loose: -8px;
    }
    :host(.kp-avatar-group--lg) {
      --kp-avatar-group-count-size: 40px;
      --kp-avatar-group-count-font: 14px;
      --kp-avatar-group-ring-w: 2px;
      --kp-avatar-group-gap-tight: -20px;
      --kp-avatar-group-gap-normal: -14px;
      --kp-avatar-group-gap-loose: -8px;
    }
    :host(.kp-avatar-group--xl) {
      --kp-avatar-group-count-size: 56px;
      --kp-avatar-group-count-font: 18px;
      --kp-avatar-group-ring-w: 2.5px;
      --kp-avatar-group-gap-tight: -28px;
      --kp-avatar-group-gap-normal: -20px;
      --kp-avatar-group-gap-loose: -10px;
    }

    :host(.kp-avatar-group--tight)  { --kp-avatar-group-gap: var(--kp-avatar-group-gap-tight); }
    :host(.kp-avatar-group--normal) { --kp-avatar-group-gap: var(--kp-avatar-group-gap-normal); }
    :host(.kp-avatar-group--loose)  { --kp-avatar-group-gap: var(--kp-avatar-group-gap-loose); }
  `],
})
export class KpAvatarGroupComponent {
  @Input() size: Exclude<KpAvatarSize, '2xl'> = 'md';
  @Input() overlap: KpAvatarGroupOverlap = 'normal';
  @Input() showCount = true;

  private readonly _items = signal<KpAvatarGroupItem[]>([]);
  private readonly _max = signal<number>(3);
  private readonly _total = signal<number | null>(null);

  @Input() set items(v: KpAvatarGroupItem[]) { this._items.set(v ?? []); }
  get items(): KpAvatarGroupItem[] { return this._items(); }

  @Input() set max(v: number) { this._max.set(Math.max(1, v ?? 3)); }
  get max(): number { return this._max(); }

  /** Total number of members — drives "+N" chip. Defaults to `items.length`. */
  @Input() set total(v: number | null) { this._total.set(v); }
  get total(): number | null { return this._total(); }

  readonly visible = computed(() => this._items().slice(0, this._max()));
  readonly remaining = computed(() => {
    const total = this._total() ?? this._items().length;
    return Math.max(0, total - this.visible().length);
  });

  get hostClasses(): string {
    return `kp-avatar-group kp-avatar-group--${this.size} kp-avatar-group--${this.overlap}`;
  }
}
