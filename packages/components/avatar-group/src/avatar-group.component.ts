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
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
    }

    /* Overlap via negative inline-start margin on every child past the
       first. Negative flex-gap is poorly supported (Safari clamps to 0,
       Chromium accepts but inconsistently); negative margin is the
       bulletproof avatar-stack pattern. */
    :host > * { position: relative; }
    :host > *:not(:first-child) { margin-inline-start: var(--kp-avatar-group-overlap); }
    :host > .kp-avatar-group__count { z-index: 2; }

    .kp-avatar-group__count {
      box-sizing: border-box;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 auto;
      width: var(--kp-avatar-group-count-size);
      height: var(--kp-avatar-group-count-size);
      border-radius: 50%;
      background: var(--kp-color-avatar-group-count-bg);
      color: var(--kp-color-avatar-group-count-fg);
      font-size: var(--kp-avatar-group-count-font);
      font-weight: 600;
      box-shadow: 0 0 0 var(--kp-avatar-group-ring-w) var(--kp-color-avatar-ring);
    }

    /* Size (drives count chip dimensions and base overlap).
       Overlap targets, by size: tight ≈ 70% of avatar diameter,
       normal ≈ 55%, loose ≈ 35%. Each value is negative because it's
       a margin-inline-start pulling the next avatar back over the
       previous one. */
    :host(.kp-avatar-group--xs) {
      --kp-avatar-group-count-size: 20px;
      --kp-avatar-group-count-font: 10px;
      --kp-avatar-group-ring-w: 1.5px;
      --kp-avatar-group-overlap-tight: -6px;
      --kp-avatar-group-overlap-normal: -3px;
      --kp-avatar-group-overlap-loose: 1px;
    }
    :host(.kp-avatar-group--sm) {
      --kp-avatar-group-count-size: 24px;
      --kp-avatar-group-count-font: 11px;
      --kp-avatar-group-ring-w: 1.5px;
      --kp-avatar-group-overlap-tight: -9px;
      --kp-avatar-group-overlap-normal: -5px;
      --kp-avatar-group-overlap-loose: 0;
    }
    :host(.kp-avatar-group--md) {
      --kp-avatar-group-count-size: 32px;
      --kp-avatar-group-count-font: 12px;
      --kp-avatar-group-ring-w: 2px;
      --kp-avatar-group-overlap-tight: -14px;
      --kp-avatar-group-overlap-normal: -10px;
      --kp-avatar-group-overlap-loose: -3px;
    }
    :host(.kp-avatar-group--lg) {
      --kp-avatar-group-count-size: 40px;
      --kp-avatar-group-count-font: 14px;
      --kp-avatar-group-ring-w: 2px;
      --kp-avatar-group-overlap-tight: -20px;
      --kp-avatar-group-overlap-normal: -14px;
      --kp-avatar-group-overlap-loose: -6px;
    }
    :host(.kp-avatar-group--xl) {
      --kp-avatar-group-count-size: 56px;
      --kp-avatar-group-count-font: 18px;
      --kp-avatar-group-ring-w: 2.5px;
      --kp-avatar-group-overlap-tight: -31px;
      --kp-avatar-group-overlap-normal: -23px;
      --kp-avatar-group-overlap-loose: -12px;
    }

    :host(.kp-avatar-group--tight)  { --kp-avatar-group-overlap: var(--kp-avatar-group-overlap-tight); }
    :host(.kp-avatar-group--normal) { --kp-avatar-group-overlap: var(--kp-avatar-group-overlap-normal); }
    :host(.kp-avatar-group--loose)  { --kp-avatar-group-overlap: var(--kp-avatar-group-overlap-loose); }
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
