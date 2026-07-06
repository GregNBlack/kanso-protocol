import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  isDevMode,
} from '@angular/core';

// One-shot dev-mode warning so consumers see the deprecation notice
// without flooding the console for every instance.
let WARNED = false;

export type KpIconButtonSize = 'xs' | 'sm' | 'md';

/**
 * Kanso Protocol — IconButton (atom)
 *
 * @deprecated since 4.0.0 — use `<button kpButton iconOnly>` instead.
 * `kp-icon-button` is a strict subset of the regular button directive
 * with `iconOnly=true` and `variant=ghost` baked in. Maintaining two
 * APIs for one component creates inconsistency (different sets of
 * inputs, no `variant`/`color` here, etc.). Will be removed in 5.0.0.
 *
 * Migration:
 *   <kp-icon-button size="sm" ariaLabel="Close" (click)="close()">…</kp-icon-button>
 * →
 *   <button kpButton iconOnly size="sm" variant="ghost"
 *           aria-label="Close" (click)="close()">…</button>
 *
 * The button directive also gives you `variant` (outline / subtle /
 * ghost) and `color` (primary / danger / neutral) which `kp-icon-button`
 * never exposed.
 *
 * @example  (still works in 4.x but logs a deprecation notice on first use)
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
      outline: var(--kp-focus-ring-width) solid var(--kp-color-focus-ring);
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
export class KpIconButtonComponent {
  @Input() size: KpIconButtonSize = 'sm';
  @Input() ariaLabel = '';
  @Input() disabled = false;

  @Output() readonly buttonClick = new EventEmitter<MouseEvent>();

  constructor() {
    if (isDevMode() && !WARNED) {
      WARNED = true;
      // eslint-disable-next-line no-console
      console.warn(
        '[kp-icon-button] deprecated since 4.0.0 — use ' +
          '`<button kpButton iconOnly variant="ghost">` instead. ' +
          'Will be removed in 5.0.0.',
      );
    }
  }

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
