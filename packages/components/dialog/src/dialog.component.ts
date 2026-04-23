import {
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  Output,
  ViewChild,
  inject,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

export type KpDialogSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type KpDialogFooterLayout = 'end' | 'between' | 'stacked';

/**
 * Kanso Protocol — Dialog
 *
 * Modal dialog with backdrop, focus trap, and Esc-to-close. Composition
 * is slot-driven: `[kpDialogHeroIcon]` for the optional hero icon above
 * the title, `[kpDialogBody]` for body content (default is a projected
 * text node), and `[kpDialogFooter]` for footer actions (default is a
 * 2-button Cancel/Confirm layout).
 *
 * The component is a controlled view — callers bind `[open]` and react
 * to `(openChange)` / `(closed)`. Opening the dialog locks body scroll
 * and moves focus to the first interactive element inside the panel.
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
  host: {
    '[class]': 'hostClasses',
  },
  template: `
    @if (open) {
      <div #root class="kp-dialog__root" [class]="rootClasses">
        <div class="kp-dialog__backdrop" (click)="onBackdropClick()"></div>
        <div
          #panel
          class="kp-dialog__panel"
          role="dialog"
          aria-modal="true"
          [attr.aria-labelledby]="titleId"
          [attr.aria-describedby]="showDescription ? descId : null"
          [attr.aria-label]="!showHeader ? ariaLabel : null"
          tabindex="-1"
        >
          @if (showHeader) {
            <header class="kp-dialog__header" [class.kp-dialog__header--has-close]="showClose">
              @if (showHeroIcon) {
                <div class="kp-dialog__hero">
                  <ng-content select="[kpDialogHeroIcon]"/>
                </div>
              }
              <div class="kp-dialog__text-group">
                <h2 class="kp-dialog__title" [id]="titleId">{{ title }}</h2>
                @if (showDescription) {
                  <p class="kp-dialog__desc" [id]="descId">{{ description }}</p>
                }
              </div>
            </header>
          }

          @if (showClose) {
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
          }

          @if (showHeader && showHeaderDivider) { <div class="kp-dialog__divider"></div> }

          <div class="kp-dialog__body">
            <ng-content select="[kpDialogBody]"/>
          </div>

          @if (showFooter && showFooterDivider) { <div class="kp-dialog__divider"></div> }

          @if (showFooter) {
            <footer class="kp-dialog__footer" [class]="footerLayoutClass">
              <ng-content select="[kpDialogFooter]"/>
            </footer>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: contents; }

    .kp-dialog__root {
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: grid;
      place-items: center;
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
    }

    .kp-dialog__backdrop {
      position: absolute;
      inset: 0;
      background: var(--kp-color-dialog-backdrop, rgba(0, 0, 0, 0.5));
      animation: kp-dialog-fade 160ms ease;
    }

    .kp-dialog__panel {
      position: relative;
      display: flex;
      flex-direction: column;
      width: var(--kp-dialog-w);
      max-width: calc(100vw - 32px);
      max-height: calc(100vh - 48px);
      background: var(--kp-color-dialog-panel-bg, var(--kp-color-white));
      border: 1px solid var(--kp-color-dialog-panel-border, var(--kp-color-gray-200));
      border-radius: var(--kp-dialog-radius);
      box-shadow:
        0 10px 15px rgba(0, 0, 0, 0.08),
        0 20px 25px rgba(0, 0, 0, 0.10),
        0 30px 60px rgba(0, 0, 0, 0.12);
      animation: kp-dialog-pop 180ms cubic-bezier(0.2, 1, 0.4, 1);
      outline: none;
    }

    @keyframes kp-dialog-fade {
      from { opacity: 0; } to { opacity: 1; }
    }
    @keyframes kp-dialog-pop {
      from { opacity: 0; transform: translateY(8px) scale(0.98); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    .kp-dialog__header {
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      gap: 12px;
      padding: var(--kp-dialog-pad);
    }
    /* Leave room for the absolutely-positioned close button so long titles
       don't tuck under it. */
    .kp-dialog__header--has-close {
      padding-right: calc(var(--kp-dialog-pad) + var(--kp-dialog-close-btn) + 8px);
    }
    .kp-dialog__hero {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 auto;
      width: var(--kp-dialog-hero-container);
      height: var(--kp-dialog-hero-container);
      border-radius: 50%;
      background: var(--kp-color-gray-100, var(--kp-color-gray-100));
      color: var(--kp-color-dialog-fg-title, var(--kp-color-gray-900));
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
      color: var(--kp-color-dialog-fg-title, var(--kp-color-gray-900));
    }
    .kp-dialog__desc {
      margin: 0;
      font-size: var(--kp-dialog-desc-size);
      line-height: var(--kp-dialog-desc-lh);
      color: var(--kp-color-dialog-fg-desc, var(--kp-color-gray-600));
    }
    .kp-dialog__close {
      all: unset;
      position: absolute;
      top: var(--kp-dialog-pad);
      right: var(--kp-dialog-pad);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: var(--kp-dialog-close-btn);
      height: var(--kp-dialog-close-btn);
      border-radius: var(--kp-dialog-close-radius);
      color: var(--kp-color-dialog-fg-desc, var(--kp-color-gray-600));
      cursor: pointer;
      transition: background 120ms ease;
      z-index: 1;
    }
    .kp-dialog__close:hover { background: var(--kp-color-gray-100, var(--kp-color-gray-100)); }
    .kp-dialog__close:focus-visible {
      outline: 2px solid var(--kp-color-focus-ring, var(--kp-color-blue-400));
      outline-offset: 2px;
    }
    .kp-dialog__close svg {
      width: var(--kp-dialog-close-icon);
      height: var(--kp-dialog-close-icon);
    }

    .kp-dialog__divider {
      height: 1px;
      background: var(--kp-color-dialog-divider, var(--kp-color-gray-100));
    }

    .kp-dialog__body {
      padding: 0 var(--kp-dialog-pad);
      color: var(--kp-color-dialog-fg-body, var(--kp-color-gray-700));
      font-size: var(--kp-dialog-body-size);
      line-height: var(--kp-dialog-body-lh);
      overflow: auto;
      flex: 1 1 auto;
    }

    .kp-dialog__footer {
      display: flex;
      align-items: center;
      padding: var(--kp-dialog-pad);
      gap: var(--kp-dialog-footer-gap);
    }
    .kp-dialog__footer--end     { justify-content: flex-end; }
    .kp-dialog__footer--between { justify-content: space-between; }
    .kp-dialog__footer--stacked { flex-direction: column; align-items: stretch; }

    /* Sizes */
    .kp-dialog__root.kp-dialog--xs {
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
    .kp-dialog__root.kp-dialog--sm {
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
    .kp-dialog__root.kp-dialog--md {
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
      --kp-dialog-footer-gap: 12px;
    }
    .kp-dialog__root.kp-dialog--lg {
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
      --kp-dialog-footer-gap: 12px;
    }
    .kp-dialog__root.kp-dialog--xl {
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
      --kp-dialog-footer-gap: 12px;
    }
  `],
})
export class KpDialogComponent implements AfterViewInit, AfterViewChecked, OnDestroy {
  private static idCounter = 0;
  private readonly uid = ++KpDialogComponent.idCounter;

  @Input() size: KpDialogSize = 'md';
  @Input() title = '';
  @Input() description = '';
  @Input() showHeader = true;
  @Input() showHeroIcon = false;
  @Input() showDescription = false;
  @Input() showClose = true;
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

  @ViewChild('panel') panel?: ElementRef<HTMLElement>;
  @ViewChild('root')  root?: ElementRef<HTMLElement>;

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly doc = inject(DOCUMENT);
  private prevBodyOverflow = '';
  private prevFocused: Element | null = null;

  readonly titleId = `kp-dialog-title-${this.uid}`;
  readonly descId  = `kp-dialog-desc-${this.uid}`;

  get hostClasses(): string {
    return `kp-dialog kp-dialog--${this.size}`;
  }
  get rootClasses(): string {
    return `kp-dialog__root kp-dialog--${this.size}`;
  }
  get footerLayoutClass(): string {
    return `kp-dialog__footer--${this.footerLayout}`;
  }

  ngAfterViewInit(): void {
    if (this.open) this.onOpened();
  }

  ngAfterViewChecked(): void {
    // Portal: ensure the open dialog's root lives at <body>, not
    // inside some transformed / clipped ancestor (common in Storybook
    // story previews and modals-inside-CSS-grid layouts).
    const el = this.root?.nativeElement;
    if (el && this.doc?.body && el.parentElement !== this.doc.body) {
      this.doc.body.appendChild(el);
    }
  }

  ngOnDestroy(): void {
    if (this.open) this.restoreBodyScroll();
  }

  ngOnChanges(): void {
    // When [open] toggles from outside, re-apply scroll lock + focus.
    if (this.open) this.onOpened();
    else this.restoreBodyScroll();
  }

  private onOpened(): void {
    if (!this.doc?.body) return;
    this.prevFocused = this.doc.activeElement;
    this.prevBodyOverflow = this.doc.body.style.overflow;
    this.doc.body.style.overflow = 'hidden';
    // Defer focus so the panel is in the DOM
    queueMicrotask(() => this.focusPanel());
  }

  private restoreBodyScroll(): void {
    if (!this.doc?.body) return;
    this.doc.body.style.overflow = this.prevBodyOverflow;
    if (this.prevFocused instanceof HTMLElement) this.prevFocused.focus();
  }

  private focusPanel(): void {
    const panel = this.panel?.nativeElement;
    if (!panel) return;
    const focusable = panel.querySelector<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    (focusable ?? panel).focus();
  }

  close(): void {
    if (!this.open) return;
    this.open = false;
    this.openChange.emit(false);
    this.closed.emit();
    this.restoreBodyScroll();
  }

  onBackdropClick(): void {
    if (this.closeOnBackdrop) this.close();
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscape(event: KeyboardEvent): void {
    if (this.open && this.closeOnEsc) {
      event.stopPropagation();
      this.close();
    }
  }
}
