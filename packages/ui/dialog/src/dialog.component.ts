import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
  inject,
} from '@angular/core';

export type KpDialogSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type KpDialogFooterLayout = 'start' | 'end' | 'between' | 'stacked';

/**
 * Kanso Protocol — Dialog
 *
 * Wraps a real native `<dialog>` element. Focus trap, top-layer
 * stacking, ESC-to-close, body-scroll inertness, and `::backdrop`
 * styling are all browser-native. Composition is slot-driven:
 * `[kpDialogHeroIcon]` / `[kpDialogBody]` / `[kpDialogFooter]`.
 *
 * Footer layouts (`footerLayout`):
 * - `end` (default): actions packed to the right.
 * - `start`: actions packed to the LEFT. To separate a Cancel /
 *   secondary action and push it to the far right while the primary
 *   actions stay left, mark that element with the `[kpDialogFooterEnd]`
 *   attribute — the component applies `margin-inline-start: auto` to it.
 * - `between`: first child left, the rest right (`space-between`).
 * - `stacked`: full-width column, for narrow surfaces.
 *
 * @example
 * <kp-dialog
 *   [(open)]="deleteOpen"
 *   size="sm"
 *   title="Delete repository?"
 *   [showDescription]="true"
 *   description="This action cannot be undone."
 *   (closed)="deleteOpen = false"
 * />
 */
@Component({
  selector: 'kp-dialog',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClasses' },
  template: `
    <dialog
      #dlg
      class="kp-dialog__el"
      [class]="dialogClasses"
      [attr.aria-labelledby]="title ? titleId : null"
      [attr.aria-describedby]="showDescription ? descId : null"
      [attr.aria-label]="!title ? ariaLabel : null"
      (click)="onDialogClick($event)"
      (cancel)="onCancel($event)"
      (close)="onNativeClose()"
    >
      <!-- Inner panel holds visual chrome + entrance animation.
           The <dialog> itself stays transform-free so portaled
           descendants (select listboxes, popovers) keep position: fixed
           against the viewport, not against a transformed container. -->
      <div class="kp-dialog__panel">
      <header class="kp-dialog__header">
        @if (showHeroIcon) {
          <div class="kp-dialog__hero">
            <ng-content select="[kpDialogHeroIcon]"/>
          </div>
        }
        <div class="kp-dialog__text-group">
          @if (title) {
            <h2 class="kp-dialog__title" [id]="titleId">{{ title }}</h2>
          }
          @if (showDescription && description) {
            <p class="kp-dialog__desc" [id]="descId">{{ description }}</p>
          }
        </div>
        <button
          type="button"
          class="kp-dialog__close"
          aria-label="Close dialog"
          (click)="close()"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M18 6 L6 18 M6 6 L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </header>

      @if (showHeaderDivider) { <div class="kp-dialog__divider"></div> }

      <div
        class="kp-dialog__body"
        [class.kp-dialog__body--no-footer]="!showFooter"
      >
        <ng-content select="[kpDialogBody]"/>
      </div>

      @if (showFooter && showFooterDivider) { <div class="kp-dialog__divider"></div> }

      @if (showFooter) {
        <footer class="kp-dialog__footer" [class]="footerLayoutClass">
          <ng-content select="[kpDialogFooter]"/>
        </footer>
      }
      </div>
    </dialog>
  `,
  styles: [`
    :host { display: contents; }

    /* The <dialog> itself is a transform-free positioning shell. Browser
       puts it in the top-layer via showModal(); portaled descendants
       (select listbox, popover panel) that target this dialog land in
       the top-layer too, with position:fixed evaluating against the
       viewport since no ancestor has transform. */
    .kp-dialog__el {
      position: fixed;
      inset: 0;
      margin: auto;
      padding: 0;
      background: transparent;
      border: none;
      max-width: none;
      max-height: none;
      width: fit-content;
      height: fit-content;
      color: var(--kp-color-dialog-fg-body);
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
      overflow: visible;
    }
    .kp-dialog__el:not([open]) { display: none; }
    .kp-dialog__el[open] { display: block; }
    .kp-dialog__el::backdrop {
      background: var(--kp-color-dialog-backdrop, rgba(0, 0, 0, 0.5));
      animation: kp-dialog-fade var(--kp-motion-duration-fast) ease;
    }

    /* Inner panel — visual chrome + entrance animation live here.
       Transform on this child doesn't create a containing-block for
       sibling portaled descendants of <dialog>. */
    .kp-dialog__panel {
      display: flex;
      flex-direction: column;
      width: var(--kp-dialog-w);
      max-width: calc(100vw - 32px);
      max-height: calc(100vh - 48px);
      background: var(--kp-color-dialog-panel-bg);
      border: 1px solid var(--kp-color-dialog-panel-border);
      border-radius: var(--kp-dialog-radius);
      box-shadow: var(--kp-elevation-floating);
      overflow: hidden;
      animation: kp-dialog-pop var(--kp-motion-duration-normal) cubic-bezier(0.2, 1, 0.4, 1);
    }

    @keyframes kp-dialog-fade { from { opacity: 0; } to { opacity: 1; } }
    @keyframes kp-dialog-pop {
      from { opacity: 0; transform: translateY(8px) scale(0.98); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    @media (prefers-reduced-motion: reduce) {
      .kp-dialog__panel,
      .kp-dialog__el::backdrop { animation-duration: 0.01ms; }
    }

    .kp-dialog__header {
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      gap: 12px;
      padding: var(--kp-dialog-pad);
    }
    .kp-dialog__text-group:empty { display: none; }
    .kp-dialog__header:empty { padding: 0; }
    .kp-dialog__hero {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 auto;
      width: var(--kp-dialog-hero-container);
      height: var(--kp-dialog-hero-container);
      border-radius: 50%;
      background: var(--kp-color-surface-muted);
      color: var(--kp-color-dialog-fg-title);
    }
    .kp-dialog__hero ::ng-deep svg {
      width: var(--kp-dialog-hero-icon);
      height: var(--kp-dialog-hero-icon);
    }
    .kp-dialog__text-group {
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      gap: var(--kp-dialog-head-gap);
      min-width: 0;
    }
    .kp-dialog__title {
      margin: 0;
      font-size: var(--kp-dialog-title-size);
      line-height: var(--kp-dialog-title-lh);
      font-weight: 500;
      color: var(--kp-color-dialog-fg-title);
    }
    .kp-dialog__desc {
      margin: 0;
      font-size: var(--kp-dialog-desc-size);
      line-height: var(--kp-dialog-desc-lh);
      color: var(--kp-color-dialog-fg-desc);
    }
    .kp-dialog__close {
      all: unset;
      flex: 0 0 auto;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: var(--kp-dialog-close-btn);
      height: var(--kp-dialog-close-btn);
      border-radius: var(--kp-dialog-close-radius);
      color: var(--kp-color-dialog-fg-desc);
      cursor: pointer;
      transition: background var(--kp-motion-duration-fast) ease;
      margin-inline-start: auto;
      margin-block-start: -4px;
      margin-inline-end: -4px;
    }
    .kp-dialog__close:hover { background: var(--kp-color-surface-muted); }
    .kp-dialog__close:focus-visible {
      outline: 2px solid var(--kp-color-focus-ring);
      outline-offset: 2px;
    }
    .kp-dialog__close svg {
      width: var(--kp-dialog-close-icon);
      height: var(--kp-dialog-close-icon);
    }

    .kp-dialog__divider {
      height: 1px;
      background: var(--kp-color-dialog-divider);
    }

    .kp-dialog__body {
      padding: 0 var(--kp-dialog-pad);
      color: var(--kp-color-dialog-fg-body);
      font-size: var(--kp-dialog-body-size);
      line-height: var(--kp-dialog-body-lh);
      overflow: auto;
      flex: 1 1 auto;
    }
    .kp-dialog__body--no-footer { padding-bottom: 16px; }

    .kp-dialog__footer {
      display: flex;
      align-items: center;
      padding: var(--kp-dialog-pad);
      gap: var(--kp-dialog-footer-gap);
    }
    .kp-dialog__footer--start   { justify-content: flex-start; }
    .kp-dialog__footer--end     { justify-content: flex-end; }
    .kp-dialog__footer--between { justify-content: space-between; }
    .kp-dialog__footer--stacked { flex-direction: column; align-items: stretch; }

    /* In the start layout the actions pack left with the normal footer gap;
       a projected element flagged [kpDialogFooterEnd] (typically Cancel /
       secondary) is ordered to sit at the right end of that left-packed
       group, regardless of its position in the projected markup. */
    .kp-dialog__footer--start ::ng-deep [kpDialogFooterEnd] {
      order: 1;
    }

    /* Sizes */
    .kp-dialog__el.kp-dialog--xs {
      --kp-dialog-w: 320px;
      --kp-dialog-pad: 16px;
      --kp-dialog-head-gap: 4px;
      --kp-dialog-radius: 12px;
      --kp-dialog-close-btn: 24px;
      --kp-dialog-close-radius: 6px;
      --kp-dialog-close-icon: 16px;
      --kp-dialog-hero-container: 48px;
      --kp-dialog-hero-icon: 24px;
      --kp-dialog-title-size: 16px;
      --kp-dialog-title-lh: 24px;
      --kp-dialog-desc-size: 14px;
      --kp-dialog-desc-lh: 20px;
      --kp-dialog-body-size: 14px;
      --kp-dialog-body-lh: 20px;
      --kp-dialog-footer-gap: 8px;
    }
    .kp-dialog__el.kp-dialog--sm {
      --kp-dialog-w: 400px;
      --kp-dialog-pad: 16px;
      --kp-dialog-head-gap: 4px;
      --kp-dialog-radius: 12px;
      --kp-dialog-close-btn: 24px;
      --kp-dialog-close-radius: 6px;
      --kp-dialog-close-icon: 16px;
      --kp-dialog-hero-container: 48px;
      --kp-dialog-hero-icon: 24px;
      --kp-dialog-title-size: 16px;
      --kp-dialog-title-lh: 24px;
      --kp-dialog-desc-size: 14px;
      --kp-dialog-desc-lh: 20px;
      --kp-dialog-body-size: 14px;
      --kp-dialog-body-lh: 20px;
      --kp-dialog-footer-gap: 8px;
    }
    .kp-dialog__el.kp-dialog--md {
      --kp-dialog-w: 560px;
      --kp-dialog-pad: 20px;
      --kp-dialog-head-gap: 6px;
      --kp-dialog-radius: 14px;
      --kp-dialog-close-btn: 28px;
      --kp-dialog-close-radius: 8px;
      --kp-dialog-close-icon: 18px;
      --kp-dialog-hero-container: 56px;
      --kp-dialog-hero-icon: 28px;
      --kp-dialog-title-size: 18px;
      --kp-dialog-title-lh: 28px;
      --kp-dialog-desc-size: 16px;
      --kp-dialog-desc-lh: 24px;
      --kp-dialog-body-size: 16px;
      --kp-dialog-body-lh: 24px;
      --kp-dialog-footer-gap: 8px;
    }
    .kp-dialog__el.kp-dialog--lg {
      --kp-dialog-w: 720px;
      --kp-dialog-pad: 24px;
      --kp-dialog-head-gap: 6px;
      --kp-dialog-radius: 16px;
      --kp-dialog-close-btn: 32px;
      --kp-dialog-close-radius: 8px;
      --kp-dialog-close-icon: 18px;
      --kp-dialog-hero-container: 64px;
      --kp-dialog-hero-icon: 32px;
      --kp-dialog-title-size: 20px;
      --kp-dialog-title-lh: 28px;
      --kp-dialog-desc-size: 16px;
      --kp-dialog-desc-lh: 24px;
      --kp-dialog-body-size: 16px;
      --kp-dialog-body-lh: 24px;
      --kp-dialog-footer-gap: 8px;
    }
    .kp-dialog__el.kp-dialog--xl {
      --kp-dialog-w: 960px;
      --kp-dialog-pad: 32px;
      --kp-dialog-head-gap: 8px;
      --kp-dialog-radius: 16px;
      --kp-dialog-close-btn: 32px;
      --kp-dialog-close-radius: 8px;
      --kp-dialog-close-icon: 18px;
      --kp-dialog-hero-container: 64px;
      --kp-dialog-hero-icon: 32px;
      --kp-dialog-title-size: 24px;
      --kp-dialog-title-lh: 32px;
      --kp-dialog-desc-size: 18px;
      --kp-dialog-desc-lh: 28px;
      --kp-dialog-body-size: 16px;
      --kp-dialog-body-lh: 24px;
      --kp-dialog-footer-gap: 8px;
    }
  `],
})
export class KpDialogComponent implements OnChanges, OnDestroy {
  private static idCounter = 0;
  private readonly uid = ++KpDialogComponent.idCounter;

  @Input() size: KpDialogSize = 'md';
  @Input() title = '';
  @Input() description = '';
  @Input() showHeroIcon = false;
  @Input() showDescription = false;
  @Input() showFooter = true;
  @Input() showHeaderDivider = false;
  @Input() showFooterDivider = false;
  @Input() footerLayout: KpDialogFooterLayout = 'end';
  @Input() ariaLabel = '';
  /** Clicking the backdrop closes the dialog. Disable for intrusive confirmations. */
  @Input() closeOnBackdrop = true;
  /** Esc closes the dialog. Disable for intrusive confirmations. */
  @Input() closeOnEsc = true;

  @Input() open = false;

  @Output() readonly openChange = new EventEmitter<boolean>();
  @Output() readonly closed = new EventEmitter<void>();

  @ViewChild('dlg', { static: false }) dlg?: ElementRef<HTMLDialogElement>;

  readonly titleId = `kp-dialog-title-${this.uid}`;
  readonly descId  = `kp-dialog-desc-${this.uid}`;

  get hostClasses(): string {
    return `kp-dialog kp-dialog--${this.size}`;
  }
  get dialogClasses(): string {
    return `kp-dialog__el kp-dialog--${this.size}`;
  }
  get footerLayoutClass(): string {
    return `kp-dialog__footer--${this.footerLayout}`;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('open' in changes) this.syncOpen();
  }

  ngOnDestroy(): void {
    const el = this.dlg?.nativeElement;
    if (el?.open) {
      if (typeof el.close === 'function') el.close();
      else el.removeAttribute('open');
    }
  }

  private syncOpen(): void {
    queueMicrotask(() => {
      const el = this.dlg?.nativeElement;
      if (!el) return;
      // showModal / close are missing in jsdom and very old browsers.
      // Fall back to the `open` attribute so the component still renders.
      if (this.open && !el.open) {
        if (typeof el.showModal === 'function') el.showModal();
        else el.setAttribute('open', '');
      } else if (!this.open && el.open) {
        if (typeof el.close === 'function') el.close();
        else el.removeAttribute('open');
      }
    });
  }

  close(): void {
    if (!this.open) return;
    this.open = false;
    this.openChange.emit(false);
    const el = this.dlg?.nativeElement;
    if (el?.open) {
      if (typeof el.close === 'function') el.close();
      else { el.removeAttribute('open'); this.closed.emit(); }
    } else {
      this.closed.emit();
    }
  }

  /** Native `<dialog>` `cancel` event fires on Esc. Suppress when closeOnEsc=false. */
  onCancel(event: Event): void {
    if (!this.closeOnEsc) {
      event.preventDefault();
      return;
    }
    // Native default: dialog closes. We emit our open=false in onNativeClose below.
  }

  /** Native `<dialog>` `close` event — fires after Esc, .close(), or form-method=dialog submit. */
  onNativeClose(): void {
    if (this.open) {
      this.open = false;
      this.openChange.emit(false);
    }
    this.closed.emit();
  }

  /** Native `<dialog>.showModal()` makes the dialog itself the click-target
   *  on backdrop hits (clicks on real children bubble through normally). */
  onDialogClick(event: MouseEvent): void {
    if (!this.closeOnBackdrop) return;
    if (event.target === this.dlg?.nativeElement) this.close();
  }
}
