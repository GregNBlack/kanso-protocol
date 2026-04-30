import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

export type KpPopoverSize = 'sm' | 'md' | 'lg';
export type KpPopoverArrowPosition =
  | 'none'
  | 'top-start'    | 'top-center'    | 'top-end'
  | 'right-start'  | 'right-center'  | 'right-end'
  | 'bottom-start' | 'bottom-center' | 'bottom-end'
  | 'left-start'   | 'left-center'   | 'left-end';

/**
 * Kanso Protocol — Popover
 *
 * Floating panel with optional header / body / footer and an optional
 * directional arrow (4 sides × 3 anchors). Visual chrome only —
 * positioning, show/hide and portaling are the caller's responsibility.
 *
 * The host container uses `filter: drop-shadow()` so the shadow follows
 * the combined silhouette of body + arrow, and grows automatically with
 * content.
 *
 * @example
 * <kp-popover size="md" arrowPosition="top-center"
 *             title="Delete this item?" description="This action cannot be undone."
 *             [closable]="true" (close)="cancel()">
 *   <kp-button kpPopoverFooter size="sm" variant="ghost">Cancel</kp-button>
 *   <kp-button kpPopoverFooter size="sm" color="danger">Delete</kp-button>
 * </kp-popover>
 */
@Component({
  selector: 'kp-popover',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses',
    '[attr.role]': '"dialog"',
    '[attr.aria-label]': 'title || ariaLabel || "Popover"',
  },
  template: `
    <div class="kp-popover__body">
      @if (showHeader) {
        <div class="kp-popover__header">
          <div class="kp-popover__text">
            <span class="kp-popover__title">{{ title }}</span>
            @if (description) {
              <span class="kp-popover__description">{{ description }}</span>
            }
          </div>
          @if (closable) {
            <button type="button" class="kp-popover__close" aria-label="Close" (click)="handleClose($event)">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          }
        </div>
        @if (showHeaderDivider) {
          <span class="kp-popover__divider" aria-hidden="true"></span>
        }
      }

      <div class="kp-popover__content">
        <ng-content/>
      </div>

      <div class="kp-popover__footer-group" [class.kp-popover__hidden]="!hasFooter">
        @if (hasFooter && showFooterDivider) {
          <span class="kp-popover__divider" aria-hidden="true"></span>
        }
        <div class="kp-popover__footer">
          <ng-content select="[kpPopoverFooter]"/>
        </div>
      </div>
    </div>

    @if (arrowPosition !== 'none') {
      <svg class="kp-popover__arrow"
           [attr.width]="arrowW" [attr.height]="arrowH"
           [attr.viewBox]="'0 0 ' + arrowW + ' ' + arrowH"
           aria-hidden="true">
        <path [attr.d]="arrowPath"/>
      </svg>
    }
  `,
  styles: [`
    :host {
      position: relative;
      display: inline-block;
      box-sizing: border-box;
      width: var(--kp-popover-w);
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
      /* Drop-shadow on the filter level follows the child silhouette (body + arrow) */
      filter:
        drop-shadow(0 0 1px rgba(17, 17, 19, 0.10))
        drop-shadow(0 4px 8px rgba(0, 0, 0, 0.06))
        drop-shadow(0 12px 20px rgba(0, 0, 0, 0.08))
        drop-shadow(0 24px 32px rgba(0, 0, 0, 0.06));
    }

    .kp-popover__body {
      display: flex;
      flex-direction: column;
      gap: var(--kp-popover-gap);
      padding: var(--kp-popover-pad) 0;
      background: var(--kp-color-popover-bg, var(--kp-color-white));
      border-radius: var(--kp-popover-radius);
    }

    .kp-popover__header {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 0 var(--kp-popover-pad);
    }

    .kp-popover__text {
      display: flex;
      flex-direction: column;
      gap: var(--kp-popover-header-gap);
      flex: 1 1 auto;
      min-width: 0;
    }

    .kp-popover__title {
      color: var(--kp-color-popover-fg-title, var(--kp-color-gray-900));
      font-weight: 500;
      font-size: var(--kp-popover-title-size);
      line-height: var(--kp-popover-title-lh);
    }

    .kp-popover__description {
      color: var(--kp-color-popover-fg-desc, var(--kp-color-gray-600));
      font-weight: 400;
      font-size: var(--kp-popover-desc-size);
      line-height: var(--kp-popover-desc-lh);
    }

    .kp-popover__close {
      all: unset;
      flex: 0 0 auto;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: var(--kp-popover-close-size);
      height: var(--kp-popover-close-size);
      border-radius: var(--kp-popover-close-radius);
      color: var(--kp-color-popover-fg-desc, var(--kp-color-gray-600));
      cursor: pointer;
      opacity: 0.75;
      transition: opacity var(--kp-motion-duration-fast) ease, background 120ms ease;
    }
    .kp-popover__close:hover { opacity: 1; background: var(--kp-color-overlay-hover-subtle); }
    .kp-popover__close:focus-visible {
      outline: 2px solid var(--kp-color-focus-ring, var(--kp-color-blue-400));
      outline-offset: 1px;
      opacity: 1;
    }
    .kp-popover__close svg {
      width: var(--kp-popover-close-icon-size);
      height: var(--kp-popover-close-icon-size);
    }

    .kp-popover__content {
      padding: 0 var(--kp-popover-pad);
      color: var(--kp-color-popover-fg-body, var(--kp-color-gray-700));
      font-weight: 400;
      font-size: var(--kp-popover-body-size);
      line-height: var(--kp-popover-body-lh);
    }

    .kp-popover__footer-group {
      display: flex;
      flex-direction: column;
      gap: var(--kp-popover-gap);
    }
    .kp-popover__footer {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 8px;
      padding: 0 var(--kp-popover-pad);
    }
    .kp-popover__hidden { display: none; }

    .kp-popover__divider {
      display: block;
      height: 1px;
      width: 100%;
      background: var(--kp-color-popover-divider, var(--kp-color-gray-100));
    }

    /* Arrow */
    .kp-popover__arrow {
      position: absolute;
      display: block;
      color: var(--kp-color-popover-bg, var(--kp-color-white));
    }
    .kp-popover__arrow path { fill: currentColor; }

    /* Arrow side/anchor positioning */
    :host(.kp-popover--arrow-top-start)    .kp-popover__arrow { top: 0; left: 16px; transform: translateY(-100%); }
    :host(.kp-popover--arrow-top-center)   .kp-popover__arrow { top: 0; left: 50%; transform: translate(-50%, -100%); }
    :host(.kp-popover--arrow-top-end)      .kp-popover__arrow { top: 0; right: 16px; transform: translateY(-100%); }
    :host(.kp-popover--arrow-bottom-start) .kp-popover__arrow { bottom: 0; left: 16px; transform: translateY(100%); }
    :host(.kp-popover--arrow-bottom-center) .kp-popover__arrow { bottom: 0; left: 50%; transform: translate(-50%, 100%); }
    :host(.kp-popover--arrow-bottom-end)   .kp-popover__arrow { bottom: 0; right: 16px; transform: translateY(100%); }
    :host(.kp-popover--arrow-left-start)   .kp-popover__arrow { left: 0; top: 16px; transform: translateX(-100%); }
    :host(.kp-popover--arrow-left-center)  .kp-popover__arrow { left: 0; top: 50%; transform: translate(-100%, -50%); }
    :host(.kp-popover--arrow-left-end)     .kp-popover__arrow { left: 0; bottom: 16px; transform: translateX(-100%); }
    :host(.kp-popover--arrow-right-start)  .kp-popover__arrow { right: 0; top: 16px; transform: translateX(100%); }
    :host(.kp-popover--arrow-right-center) .kp-popover__arrow { right: 0; top: 50%; transform: translate(100%, -50%); }
    :host(.kp-popover--arrow-right-end)    .kp-popover__arrow { right: 0; bottom: 16px; transform: translateX(100%); }

    /* Sizes */
    :host(.kp-popover--sm) {
      --kp-popover-w: 280px;
      --kp-popover-pad: 12px;
      --kp-popover-gap: 8px;
      --kp-popover-header-gap: 2px;
      --kp-popover-radius: 10px;
      --kp-popover-close-size: 20px;
      --kp-popover-close-icon-size: 16px;
      --kp-popover-close-radius: 4px;
      --kp-popover-title-size: 14px; --kp-popover-title-lh: 20px;
      --kp-popover-desc-size: 12px;  --kp-popover-desc-lh: 16px;
      --kp-popover-body-size: 14px;  --kp-popover-body-lh: 20px;
    }
    :host(.kp-popover--md) {
      --kp-popover-w: 360px;
      --kp-popover-pad: 16px;
      --kp-popover-gap: 12px;
      --kp-popover-header-gap: 4px;
      --kp-popover-radius: 12px;
      --kp-popover-close-size: 24px;
      --kp-popover-close-icon-size: 18px;
      --kp-popover-close-radius: 6px;
      --kp-popover-title-size: 16px; --kp-popover-title-lh: 24px;
      --kp-popover-desc-size: 14px;  --kp-popover-desc-lh: 20px;
      --kp-popover-body-size: 14px;  --kp-popover-body-lh: 20px;
    }
    :host(.kp-popover--lg) {
      --kp-popover-w: 480px;
      --kp-popover-pad: 20px;
      --kp-popover-gap: 16px;
      --kp-popover-header-gap: 4px;
      --kp-popover-radius: 14px;
      --kp-popover-close-size: 24px;
      --kp-popover-close-icon-size: 18px;
      --kp-popover-close-radius: 6px;
      --kp-popover-title-size: 20px; --kp-popover-title-lh: 28px;
      --kp-popover-desc-size: 16px;  --kp-popover-desc-lh: 24px;
      --kp-popover-body-size: 16px;  --kp-popover-body-lh: 24px;
    }
  `],
})
export class KpPopoverComponent {
  @Input() size: KpPopoverSize = 'md';
  @Input() arrowPosition: KpPopoverArrowPosition = 'none';
  @Input() title = '';
  @Input() description = '';
  @Input() showHeader = true;
  @Input() showHeaderDivider = false;
  @Input() showFooter = false;
  @Input() showFooterDivider = true;
  @Input() closable = true;
  /** Accessible name override; falls through to title or "Popover". */
  @Input() ariaLabel: string | null = null;

  @Output() close = new EventEmitter<MouseEvent>();

  get hasFooter(): boolean { return this.showFooter; }

  private get arrowBase(): number { return this.size === 'sm' ? 10 : 12; }
  private get arrowHeight(): number { return this.size === 'sm' ? 7 : 8; }

  get arrowW(): number {
    const [side] = this.arrowPosition.split('-');
    return side === 'left' || side === 'right' ? this.arrowHeight : this.arrowBase;
  }
  get arrowH(): number {
    const [side] = this.arrowPosition.split('-');
    return side === 'left' || side === 'right' ? this.arrowBase : this.arrowHeight;
  }
  get arrowPath(): string {
    const [side] = this.arrowPosition.split('-');
    const b = this.arrowBase, h = this.arrowHeight;
    switch (side) {
      case 'top':    return `M 0 ${h} L ${b / 2} 0 L ${b} ${h} Z`;
      case 'bottom': return `M 0 0 L ${b} 0 L ${b / 2} ${h} Z`;
      case 'left':   return `M ${h} 0 L 0 ${b / 2} L ${h} ${b} Z`;
      case 'right':  return `M 0 0 L ${h} ${b / 2} L 0 ${b} Z`;
      default:       return '';
    }
  }

  get hostClasses(): string {
    return [
      'kp-popover',
      `kp-popover--${this.size}`,
      `kp-popover--arrow-${this.arrowPosition}`,
    ].join(' ');
  }

  handleClose(event: MouseEvent): void {
    event.stopPropagation();
    this.close.emit(event);
  }
}
