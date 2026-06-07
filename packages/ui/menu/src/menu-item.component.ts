import {
  Component,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { KpState } from '@kanso-protocol/ui';

export type KpMenuItemSize = 'sm' | 'md' | 'lg';

/**
 * Kanso Protocol — MenuItem
 *
 * Single option inside a DropdownMenu. Supports 3 sizes, optional icon slot,
 * description (lg), shortcut/chevron trailing, and selected/danger variants.
 *
 * Projection slots:
 *   [kpMenuItemLeading]  — slot before label (e.g. Checkbox/Radio)
 *   [kpMenuItemIcon]     — icon left slot
 *   [kpMenuItemTrailing] — custom trailing content (overrides shortcut/chevron)
 *
 * @example
 * <kp-menu-item label="Edit" shortcut="⌘E">
 *   <svg kpMenuItemIcon>...</svg>
 * </kp-menu-item>
 */
@Component({
  selector: 'kp-menu-item',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses',
    '[attr.role]': '"menuitem"',
    '[attr.aria-disabled]': 'disabled || null',
    '[attr.tabindex]': 'disabled ? -1 : 0',
  },
  template: `
    <!-- Leading slot may project interactive markers (checkbox / radio used
         as visual indicators), so it can't be aria-hidden — that would
         contain a focusable descendant inside an aria-hidden subtree. -->
    <span class="kp-menu-item__leading">
      <ng-content select="[kpMenuItemLeading]"/>
    </span>
    <span class="kp-menu-item__icon" aria-hidden="true">
      <ng-content select="[kpMenuItemIcon]"/>
    </span>
    <span class="kp-menu-item__text">
      <span class="kp-menu-item__label">{{ label }}</span>
      @if (description) {
        <span class="kp-menu-item__description">{{ description }}</span>
      }
    </span>
    <span class="kp-menu-item__trailing" aria-hidden="true">
      <ng-content select="[kpMenuItemTrailing]"/>
      @if (shortcut) {
        <span class="kp-menu-item__shortcut">{{ shortcut }}</span>
      }
      @if (hasChevron) {
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      }
      @if (selected && !shortcut && !hasChevron) {
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M5 12l5 5L20 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      }
    </span>
  `,
  styles: [`
    :host {
      display: flex;
      align-items: center;
      box-sizing: border-box;
      width: 100%;
      height: var(--kp-menu-item-height);
      padding: 0 var(--kp-menu-item-pad-x);
      gap: var(--kp-menu-item-gap);
      border-radius: 6px;
      background: var(--kp-menu-item-bg);
      color: var(--kp-menu-item-fg);
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
      font-size: var(--kp-menu-item-fs);
      font-weight: 500;
      cursor: pointer;
      user-select: none;
      transition: background var(--kp-motion-duration-fast, var(--kp-motion-duration-fast)) ease;
    }

    :host(:hover:not(.kp-menu-item--disabled)),
    :host(.kp-menu-item--hover) {
      --kp-menu-item-bg: var(--kp-color-surface-subtle);
    }
    :host(.kp-menu-item--active) {
      --kp-menu-item-bg: var(--kp-color-surface-muted);
    }
    :host(:focus-visible),
    :host(.kp-menu-item--focus) {
      --kp-menu-item-bg: var(--kp-color-surface-subtle);
      outline: 2px solid var(--kp-color-focus-ring);
      outline-offset: -1px;
    }
    :host(.kp-menu-item--disabled) {
      cursor: not-allowed;
      --kp-menu-item-fg: var(--kp-color-text-disabled);
    }
    :host(.kp-menu-item--disabled) .kp-menu-item__icon,
    :host(.kp-menu-item--disabled) .kp-menu-item__trailing {
      --kp-menu-item-icon: var(--kp-color-border-strong);
    }

    /* Selected (blue tint). Uses the theme-aware accent.primary.fg so the
       label stays readable on the dark subtle.bg in dark mode — using
       primary.default.bg.hover would resolve to blue.700 in dark too
       (kept-light value), giving ~1.5:1 on the tinted dark bg. */
    :host(.kp-menu-item--selected) {
      --kp-menu-item-bg: var(--kp-color-primary-subtle-bg-rest);
      --kp-menu-item-fg: var(--kp-color-accent-primary-fg);
      --kp-menu-item-icon: var(--kp-color-primary-default-bg-rest);
    }

    /* Danger (red fg, white bg; hover = light red bg) — same accent
       pattern for theme-readable fg on tinted bg. */
    :host(.kp-menu-item--danger) {
      --kp-menu-item-fg: var(--kp-color-accent-danger-fg);
      --kp-menu-item-icon: var(--kp-color-danger-default-bg-rest);
    }
    :host(.kp-menu-item--danger:hover:not(.kp-menu-item--disabled)),
    :host(.kp-menu-item--danger.kp-menu-item--hover) {
      --kp-menu-item-bg: var(--kp-color-danger-subtle-bg-rest);
      --kp-menu-item-fg: var(--kp-color-accent-danger-fg);
    }

    .kp-menu-item__leading,
    .kp-menu-item__icon,
    .kp-menu-item__trailing {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      color: var(--kp-menu-item-icon);
    }
    .kp-menu-item__leading:empty,
    .kp-menu-item__icon:empty { display: none; }

    .kp-menu-item__text {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .kp-menu-item__label {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .kp-menu-item__description {
      font-size: 12px;
      font-weight: 400;
      color: var(--kp-color-text-muted);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .kp-menu-item__shortcut {
      font-size: var(--kp-menu-item-shortcut-fs);
      font-weight: 400;
      color: var(--kp-color-text-muted);
      font-variant-numeric: tabular-nums;
    }

    /* Sizes */
    :host(.kp-menu-item--sm) {
      --kp-menu-item-height: 28px;
      --kp-menu-item-pad-x: 8px;
      --kp-menu-item-gap: 8px;
      --kp-menu-item-fs: 13px;
      --kp-menu-item-shortcut-fs: 11px;
    }
    :host(.kp-menu-item--md) {
      --kp-menu-item-height: 32px;
      --kp-menu-item-pad-x: 10px;
      --kp-menu-item-gap: 10px;
      --kp-menu-item-fs: 14px;
      --kp-menu-item-shortcut-fs: 12px;
    }
    :host(.kp-menu-item--lg) {
      --kp-menu-item-height: 40px;
      --kp-menu-item-pad-x: 12px;
      --kp-menu-item-gap: 12px;
      --kp-menu-item-fs: 14px;
      --kp-menu-item-shortcut-fs: 12px;
    }
    /* When description is rendered we drop the fixed item height and
       expand vertically so title + description have breathing room.
       Previously this rule existed only for the lg size, so md/sm
       items with a description were squeezed into their no-description
       height. */
    :host(.kp-menu-item--sm.kp-menu-item--has-description) {
      --kp-menu-item-height: auto;
      padding-top: 8px;
      padding-bottom: 8px;
    }
    :host(.kp-menu-item--md.kp-menu-item--has-description) {
      --kp-menu-item-height: auto;
      padding-top: 10px;
      padding-bottom: 10px;
    }
    :host(.kp-menu-item--lg.kp-menu-item--has-description) {
      --kp-menu-item-height: auto;
      padding-top: 12px;
      padding-bottom: 12px;
    }
  `]
})
export class KpMenuItemComponent {
  @Input() size: KpMenuItemSize = 'md';
  @Input() label = '';
  @Input() description = '';
  @Input() shortcut = '';
  @Input() hasChevron = false;
  @Input() selected = false;
  @Input() danger = false;
  @Input() disabled = false;
  @Input() forceState: KpState | null = null;

  get hostClasses(): string {
    const c = ['kp-menu-item', `kp-menu-item--${this.size}`];
    if (this.selected) c.push('kp-menu-item--selected');
    if (this.danger) c.push('kp-menu-item--danger');
    if (this.description) c.push('kp-menu-item--has-description');
    if (this.forceState) {
      c.push(`kp-menu-item--${this.forceState}`);
    } else if (this.disabled) {
      c.push('kp-menu-item--disabled');
    }
    return c.join(' ');
  }
}
