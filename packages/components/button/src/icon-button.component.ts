import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

export type KpIconButtonSize = 'xs' | 'sm' | 'md';

/**
 * Kanso Protocol — IconButton (atom)
 *
 * Square ghost button with a single projected icon. Used for "close",
 * "clear", "dismiss" affordances on Popover, Dialog, Toast, Input,
 * Alert, etc. — replaces per-component reimplementations of the same
 * pattern (which historically drifted on hover / focus / sizing).
 *
 * Color is `currentColor` so the button picks up the foreground color
 * of its container (e.g. inside Popover header it's `popover-fg-desc`,
 * inside Toast it's the toast title color). Hover applies the same
 * subtle overlay used everywhere else.
 *
 * @example
 *   <kp-icon-button size="sm" ariaLabel="Close" (click)="close()">
 *     <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
 *       <path d="M18 6 6 18M6 6l12 12" stroke="currentColor"
 *             stroke-width="2" stroke-linecap="round"/>
 *     </svg>
 *   </kp-icon-button>
 */
@Component({
  selector: 'kp-icon-button',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClasses' },
  template: `
    <button
      type="button"
      class="kp-icon-button__btn"
      [attr.aria-label]="ariaLabel"
      [disabled]="disabled"
      (click)="handleClick($event)"
    >
      <ng-content/>
    </button>
  `,
  styles: [`
    :host { display: inline-flex; }

    .kp-icon-button__btn {
      all: unset;
      flex: 0 0 auto;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      width: var(--kp-icon-button-size);
      height: var(--kp-icon-button-size);
      border-radius: var(--kp-icon-button-radius);
      color: inherit;
      cursor: pointer;
      transition:
        background var(--kp-motion-duration-fast, 100ms) ease,
        color var(--kp-motion-duration-fast, 100ms) ease;
    }
    /* Hover / active surface match the input-clear pattern so all
       small dismissable controls feel like the same atom. */
    .kp-icon-button__btn:hover {
      background: var(--kp-color-surface-muted);
      color: var(--kp-color-text-default);
    }
    .kp-icon-button__btn:active {
      background: var(--kp-color-surface-strong);
      color: var(--kp-color-text-strong);
    }
    .kp-icon-button__btn:focus-visible {
      outline: 2px solid var(--kp-color-focus-ring);
      outline-offset: 1px;
    }
    .kp-icon-button__btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
      background: transparent;
    }

    .kp-icon-button__btn ::ng-deep svg {
      width: var(--kp-icon-button-icon-size);
      height: var(--kp-icon-button-icon-size);
    }

    :host(.kp-icon-button--xs) {
      --kp-icon-button-size: 20px;
      --kp-icon-button-icon-size: 14px;
      --kp-icon-button-radius: 4px;
    }
    :host(.kp-icon-button--sm) {
      --kp-icon-button-size: 24px;
      --kp-icon-button-icon-size: 16px;
      --kp-icon-button-radius: 6px;
    }
    :host(.kp-icon-button--md) {
      --kp-icon-button-size: 32px;
      --kp-icon-button-icon-size: 20px;
      --kp-icon-button-radius: 8px;
    }
  `],
})
export class KpIconButtonComponent {
  @Input() size: KpIconButtonSize = 'sm';
  @Input() ariaLabel = '';
  @Input() disabled = false;

  @Output() readonly buttonClick = new EventEmitter<MouseEvent>();

  get hostClasses(): string {
    return `kp-icon-button kp-icon-button--${this.size}`;
  }

  handleClick(event: MouseEvent): void {
    if (this.disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.buttonClick.emit(event);
  }
}
