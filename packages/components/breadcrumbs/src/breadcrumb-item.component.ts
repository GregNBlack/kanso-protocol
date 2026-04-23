import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

export type KpBreadcrumbItemSize = 'sm' | 'md';
export type KpBreadcrumbItemType = 'link' | 'current' | 'ellipsis';

/**
 * Kanso Protocol — BreadcrumbItem (atom)
 *
 * Single breadcrumb cell. Renders as an `<a>` for `type="link"` with an
 * `href`, a `<button>` for `type="link"` without one, a plain `<span>`
 * for `type="current"`, or a `<button>` for `type="ellipsis"`
 * (clickable — callers typically open a Popover / DropdownMenu from it).
 *
 * Projects a leading icon via `[kpBreadcrumbIcon]`. Size is usually set
 * by the parent `<kp-breadcrumbs>`.
 *
 * @example
 * <kp-breadcrumb-item type="link" href="/projects">
 *   <svg kpBreadcrumbIcon .../>
 *   Projects
 * </kp-breadcrumb-item>
 */
@Component({
  selector: 'kp-breadcrumb-item',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses',
    '[attr.role]': '"listitem"',
  },
  template: `
    @switch (type) {
      @case ('ellipsis') {
        <button
          type="button"
          class="kp-bc-item__content kp-bc-item__ellipsis"
          [disabled]="disabled"
          [attr.aria-label]="ariaLabel || 'Show hidden breadcrumbs'"
          (click)="handleClick($event)"
        >…</button>
      }
      @case ('current') {
        <span class="kp-bc-item__content" aria-current="page">
          <ng-container *ngTemplateOutlet="body"/>
        </span>
      }
      @default {
        @if (href) {
          <a
            class="kp-bc-item__content"
            [attr.href]="disabled ? null : href"
            [attr.aria-disabled]="disabled || null"
            [attr.tabindex]="disabled ? -1 : null"
            (click)="handleClick($event)"
          >
            <ng-container *ngTemplateOutlet="body"/>
          </a>
        } @else {
          <button
            type="button"
            class="kp-bc-item__content"
            [disabled]="disabled"
            (click)="handleClick($event)"
          >
            <ng-container *ngTemplateOutlet="body"/>
          </button>
        }
      }
    }

    <ng-template #body>
      <span class="kp-bc-item__icon" aria-hidden="true"><ng-content select="[kpBreadcrumbIcon]"/></span>
      @if (label) { <span class="kp-bc-item__label">{{ label }}</span> }
      <ng-content/>
    </ng-template>
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      box-sizing: border-box;
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
    }

    .kp-bc-item__content {
      all: unset;
      display: inline-flex;
      align-items: center;
      box-sizing: border-box;
      gap: var(--kp-bc-gap);
      height: var(--kp-bc-h);
      padding: 0 var(--kp-bc-pad-x);
      border-radius: 4px;
      font-size: var(--kp-bc-font-size);
      line-height: var(--kp-bc-line-height);
      color: var(--kp-color-breadcrumbs-item-fg-link-rest, var(--kp-color-gray-600));
      font-weight: 400;
      transition: color 120ms ease;
    }
    a.kp-bc-item__content,
    button.kp-bc-item__content { cursor: pointer; }
    .kp-bc-item__content:focus-visible {
      outline: 2px solid var(--kp-color-focus-ring, var(--kp-color-blue-400));
      outline-offset: 2px;
    }

    .kp-bc-item__icon {
      display: inline-flex;
      align-items: center;
      color: var(--kp-color-breadcrumbs-item-icon-link-rest, var(--kp-color-gray-500));
      transition: color 120ms ease;
    }
    .kp-bc-item__icon:empty { display: none; }
    .kp-bc-item__icon ::ng-deep svg {
      width: var(--kp-bc-icon-size);
      height: var(--kp-bc-icon-size);
    }

    .kp-bc-item__label { white-space: nowrap; }

    /* Link hover */
    :host(.kp-bc-item--link) a.kp-bc-item__content:hover,
    :host(.kp-bc-item--link) button.kp-bc-item__content:hover {
      color: var(--kp-color-breadcrumbs-item-fg-link-hover, var(--kp-color-gray-900));
    }
    :host(.kp-bc-item--link) a.kp-bc-item__content:hover .kp-bc-item__icon,
    :host(.kp-bc-item--link) button.kp-bc-item__content:hover .kp-bc-item__icon {
      color: var(--kp-color-breadcrumbs-item-icon-link-hover, var(--kp-color-gray-700));
    }

    /* Current — non-interactive, darker, medium weight */
    :host(.kp-bc-item--current) .kp-bc-item__content {
      color: var(--kp-color-breadcrumbs-item-fg-current, var(--kp-color-gray-900));
      font-weight: 500;
      cursor: default;
    }
    :host(.kp-bc-item--current) .kp-bc-item__icon {
      color: var(--kp-color-breadcrumbs-item-icon-current, var(--kp-color-gray-700));
    }

    /* Ellipsis — button with the middot glyph lifted closer to center */
    :host(.kp-bc-item--ellipsis) .kp-bc-item__ellipsis {
      padding: 0 8px;
      color: var(--kp-color-breadcrumbs-item-fg-link-rest, var(--kp-color-gray-600));
      letter-spacing: 2px;
    }
    :host(.kp-bc-item--ellipsis) .kp-bc-item__ellipsis:hover {
      color: var(--kp-color-breadcrumbs-item-fg-link-hover, var(--kp-color-gray-900));
    }

    /* Disabled */
    :host(.kp-bc-item--disabled) .kp-bc-item__content {
      color: var(--kp-color-breadcrumbs-item-fg-disabled, var(--kp-color-gray-400));
      cursor: not-allowed;
    }
    :host(.kp-bc-item--disabled) .kp-bc-item__icon {
      color: var(--kp-color-breadcrumbs-item-icon-disabled, var(--kp-color-gray-300));
    }

    /* Sizes */
    :host(.kp-bc-item--sm) {
      --kp-bc-h: 20px;
      --kp-bc-pad-x: 4px;
      --kp-bc-gap: 4px;
      --kp-bc-font-size: 12px;
      --kp-bc-line-height: 16px;
      --kp-bc-icon-size: 14px;
    }
    :host(.kp-bc-item--md) {
      --kp-bc-h: 24px;
      --kp-bc-pad-x: 4px;
      --kp-bc-gap: 6px;
      --kp-bc-font-size: 14px;
      --kp-bc-line-height: 20px;
      --kp-bc-icon-size: 16px;
    }
  `],
})
export class KpBreadcrumbItemComponent {
  @Input() size: KpBreadcrumbItemSize = 'md';
  @Input() type: KpBreadcrumbItemType = 'link';
  @Input() label = '';
  @Input() href: string | null = null;
  @Input() disabled = false;
  @Input() ariaLabel = '';

  @Output() readonly itemClick = new EventEmitter<MouseEvent>();

  get hostClasses(): string {
    const c = ['kp-bc-item', `kp-bc-item--${this.size}`, `kp-bc-item--${this.type}`];
    if (this.disabled) c.push('kp-bc-item--disabled');
    return c.join(' ');
  }

  handleClick(event: MouseEvent): void {
    if (this.disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.itemClick.emit(event);
  }
}
