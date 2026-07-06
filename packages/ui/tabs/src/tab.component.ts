import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  inject,
} from '@angular/core';

export type KpTabSize = 'sm' | 'md' | 'lg';

/**
 * Kanso Protocol — Tab (atom)
 *
 * Attribute-selector on a real native `<button role="tab">`. Sits inside
 * a `<kp-tabs role="tablist">`. Native button gives Enter+Space
 * activation, focus-visible, and disabled. Arrow-key navigation between
 * tabs is owned by the parent `<kp-tabs>` via roving tabindex.
 *
 * @example
 * <button kpTab label="Inbox" [selected]="current === 'inbox'" (click)="current='inbox'">
 *   <svg kpTabIcon .../>
 *   <kp-badge kpTabBadge>12</kp-badge>
 * </button>
 */
@Component({
  selector: 'button[kpTab]',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses',
    '[attr.type]': '"button"',
    '[attr.role]': '"tab"',
    '[attr.aria-selected]': 'selected',
    '[disabled]': 'disabled',
    '[attr.tabindex]': 'disabled ? -1 : (selected ? 0 : -1)',
    '(click)': 'handleClick()',
  },
  template: `
    <span class="kp-tab__icon" aria-hidden="true">
      <ng-content select="[kpTabIcon]"/>
    </span>
    <span class="kp-tab__label">{{ label }}</span>
    <span class="kp-tab__badge">
      <ng-content select="[kpTabBadge]"/>
    </span>
  `,
  styles: [`
    :host {
      all: unset;
      box-sizing: border-box;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--kp-tab-gap);
      height: var(--kp-tab-h);
      padding: 0 var(--kp-tab-pad-x);
      border-bottom: 2px solid var(--kp-color-tabs-tab-underline-rest, transparent);
      color: var(--kp-color-tabs-tab-fg-rest);
      cursor: pointer;
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
      font-size: var(--kp-tab-font-size);
      line-height: var(--kp-tab-line-height);
      font-weight: 500;
      transition: border-color var(--kp-motion-duration-fast) ease, color 120ms ease;
    }
    :host(.kp-tab--full-width) { flex: 1 1 0; }

    :host(:focus-visible) {
      outline: var(--kp-focus-ring-width) solid var(--kp-color-focus-ring);
      outline-offset: -2px;
    }

    .kp-tab__icon {
      display: inline-flex;
      align-items: center;
      color: var(--kp-color-tabs-tab-icon-rest);
    }
    .kp-tab__icon:empty { display: none; }
    .kp-tab__icon ::ng-deep svg {
      width: var(--kp-tab-icon-size);
      height: var(--kp-tab-icon-size);
    }

    .kp-tab__badge { display: inline-flex; }
    .kp-tab__badge:empty { display: none; }

    /* Hover (rest only) */
    :host(:hover:not(.kp-tab--selected):not([disabled])) {
      border-bottom-color: var(--kp-color-tabs-tab-underline-hover);
      color: var(--kp-color-tabs-tab-fg-hover);
    }
    :host(:hover:not(.kp-tab--selected):not([disabled])) .kp-tab__icon {
      color: var(--kp-color-tabs-tab-icon-hover);
    }

    /* Selected */
    :host(.kp-tab--selected) {
      border-bottom-color: var(--kp-color-tabs-tab-underline-selected);
      color: var(--kp-color-tabs-tab-fg-selected);
    }
    :host(.kp-tab--selected) .kp-tab__icon {
      color: var(--kp-color-tabs-tab-icon-selected);
    }

    /* Disabled (native [disabled]) */
    :host([disabled]) {
      border-bottom-color: var(--kp-color-tabs-tab-underline-disabled, transparent);
      color: var(--kp-color-tabs-tab-fg-disabled);
      cursor: not-allowed;
    }
    :host([disabled]) .kp-tab__icon {
      color: var(--kp-color-tabs-tab-icon-disabled);
    }

    /* Sizes */
    :host(.kp-tab--sm) {
      --kp-tab-h: 32px;
      --kp-tab-pad-x: 12px;
      --kp-tab-gap: 6px;
      --kp-tab-font-size: 14px;
      --kp-tab-line-height: 20px;
      --kp-tab-icon-size: 14px;
    }
    :host(.kp-tab--md) {
      --kp-tab-h: 40px;
      --kp-tab-pad-x: 16px;
      --kp-tab-gap: 8px;
      --kp-tab-font-size: 14px;
      --kp-tab-line-height: 20px;
      --kp-tab-icon-size: 16px;
    }
    :host(.kp-tab--lg) {
      --kp-tab-h: 48px;
      --kp-tab-pad-x: 20px;
      --kp-tab-gap: 8px;
      --kp-tab-font-size: 16px;
      --kp-tab-line-height: 24px;
      --kp-tab-icon-size: 16px;
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
  `],
})
export class KpTabComponent {
  @Input() size: KpTabSize = 'md';
  @Input() label = '';
  @Input() selected = false;
  @Input() disabled = false;
  /** Set by the parent `<kp-tabs>` when `fullWidth` is enabled on the container */
  @Input() fullWidth = false;

  @Output() selectedChange = new EventEmitter<boolean>();

  /** @internal — parent `<kp-tabs>` focuses this for arrow-key roving-tabindex navigation. */
  readonly elementRef = inject(ElementRef) as ElementRef<HTMLElement>;

  get hostClasses(): string {
    const c = ['kp-tab', `kp-tab--${this.size}`];
    if (this.selected) c.push('kp-tab--selected');
    if (this.fullWidth) c.push('kp-tab--full-width');
    return c.join(' ');
  }

  handleClick(): void {
    if (this.disabled) return;
    this.selectedChange.emit(true);
  }
}
