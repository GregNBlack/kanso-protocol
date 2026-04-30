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
 * Single tab for use inside `<kp-tabs>`. Projects an optional leading icon
 * and an optional trailing badge. The `selected` / `disabled` inputs drive
 * the visual state; hover is handled in CSS and focus via `:focus-visible`
 * on the underlying button.
 *
 * @example
 * <kp-tab label="Inbox" [selected]="current === 'inbox'" (click)="current='inbox'">
 *   <svg kpTabIcon .../>
 *   <kp-badge kpTabBadge>12</kp-badge>
 * </kp-tab>
 */
@Component({
  selector: 'kp-tab',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses',
    '[attr.role]': '"tab"',
    '[attr.aria-selected]': 'selected',
    '[attr.aria-disabled]': 'disabled || null',
    '[attr.tabindex]': 'disabled ? -1 : (selected ? 0 : -1)',
    '(click)': 'handleClick($event)',
    '(keydown)': 'handleKey($event)',
  },
  // Inner content is a non-interactive span. The previous <button> inside the
  // role="tab" host triggered axe's nested-interactive rule. Click + keyboard
  // activation now live on the host directly; arrow-key navigation between
  // tabs is owned by the parent <kp-tabs> via roving tabindex (see tabs.component.ts).
  template: `
    <span class="kp-tab__btn">
      <span class="kp-tab__icon" aria-hidden="true">
        <ng-content select="[kpTabIcon]"/>
      </span>
      <span class="kp-tab__label">{{ label }}</span>
      <span class="kp-tab__badge">
        <ng-content select="[kpTabBadge]"/>
      </span>
    </span>
  `,
  styles: [`
    :host {
      display: inline-flex;
      box-sizing: border-box;
      height: var(--kp-tab-h);
      border-bottom: 2px solid var(--kp-color-tabs-tab-underline-rest, transparent);
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
      transition: border-color var(--kp-motion-duration-fast) ease, color 120ms ease;
    }
    :host(.kp-tab--full-width) { flex: 1 1 0; }

    .kp-tab__btn {
      all: unset;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--kp-tab-gap);
      padding: 0 var(--kp-tab-pad-x);
      height: 100%;
      width: 100%;
      color: var(--kp-color-tabs-tab-fg-rest, var(--kp-color-gray-600));
      cursor: pointer;
      font-size: var(--kp-tab-font-size);
      line-height: var(--kp-tab-line-height);
      font-weight: 500;
    }
    .kp-tab__btn:focus-visible {
      outline: 2px solid var(--kp-color-focus-ring, var(--kp-color-blue-400));
      outline-offset: -2px;
    }

    .kp-tab__icon {
      display: inline-flex;
      align-items: center;
      color: var(--kp-color-tabs-tab-icon-rest, var(--kp-color-gray-500));
    }
    .kp-tab__icon:empty { display: none; }
    .kp-tab__icon ::ng-deep svg {
      width: var(--kp-tab-icon-size);
      height: var(--kp-tab-icon-size);
    }

    .kp-tab__badge { display: inline-flex; }
    .kp-tab__badge:empty { display: none; }

    /* Hover (rest only — disabled / selected handled explicitly) */
    :host(:not(.kp-tab--selected):not(.kp-tab--disabled):hover) {
      border-bottom-color: var(--kp-color-tabs-tab-underline-hover, var(--kp-color-gray-300));
    }
    :host(:not(.kp-tab--selected):not(.kp-tab--disabled):hover) .kp-tab__btn {
      color: var(--kp-color-tabs-tab-fg-hover, var(--kp-color-gray-900));
    }
    :host(:not(.kp-tab--selected):not(.kp-tab--disabled):hover) .kp-tab__icon {
      color: var(--kp-color-tabs-tab-icon-hover, var(--kp-color-gray-700));
    }

    /* Selected */
    :host(.kp-tab--selected) {
      border-bottom-color: var(--kp-color-tabs-tab-underline-selected, var(--kp-color-blue-600));
    }
    :host(.kp-tab--selected) .kp-tab__btn {
      color: var(--kp-color-tabs-tab-fg-selected, var(--kp-color-blue-600));
    }
    :host(.kp-tab--selected) .kp-tab__icon {
      color: var(--kp-color-tabs-tab-icon-selected, var(--kp-color-blue-600));
    }

    /* Disabled */
    :host(.kp-tab--disabled) {
      border-bottom-color: var(--kp-color-tabs-tab-underline-disabled, transparent);
    }
    :host(.kp-tab--disabled) .kp-tab__btn {
      color: var(--kp-color-tabs-tab-fg-disabled, var(--kp-color-gray-300));
      cursor: not-allowed;
    }
    :host(.kp-tab--disabled) .kp-tab__icon {
      color: var(--kp-color-tabs-tab-icon-disabled, var(--kp-color-gray-300));
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

  /** @internal — exposed so the parent `<kp-tabs>` can focus this tab's
   *  inner button as part of its arrow-key roving-tabindex navigation. */
  readonly elementRef = inject(ElementRef) as ElementRef<HTMLElement>;

  get hostClasses(): string {
    const c = ['kp-tab', `kp-tab--${this.size}`];
    if (this.selected) c.push('kp-tab--selected');
    if (this.disabled) c.push('kp-tab--disabled');
    if (this.fullWidth) c.push('kp-tab--full-width');
    return c.join(' ');
  }

  handleClick(event: MouseEvent): void {
    if (this.disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.selectedChange.emit(true);
  }

  handleKey(event: KeyboardEvent): void {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    if (this.disabled) return;
    event.preventDefault();
    this.selectedChange.emit(true);
  }
}
