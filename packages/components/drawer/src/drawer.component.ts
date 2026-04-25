import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
  inject,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

export type KpDrawerSize = 'sm' | 'md' | 'lg' | 'xl';
export type KpDrawerSide = 'right' | 'left' | 'top' | 'bottom';

/**
 * Kanso Protocol — Drawer
 *
 * Side panel that slides in from any of four edges. Same composition
 * model as Dialog (header / body / footer slots, controlled
 * `[(open)]` state, focus trap on open, Esc + backdrop close), but
 * anchored to a screen edge instead of centered.
 *
 * Use it for: settings panels, filter sidebars, mobile bottom sheets,
 * top notification trays. Body content scrolls when it overflows the
 * panel; the panel itself stays fixed-size per `size` × `side`.
 */
@Component({
  selector: 'kp-drawer',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClasses' },
  template: `
    @if (rendered) {
      <div #root class="kp-drawer__root" [class]="rootClasses">
        <div class="kp-drawer__backdrop" (click)="onBackdropClick()"></div>
        <div
          #panel
          class="kp-drawer__panel"
          role="dialog"
          aria-modal="true"
          [attr.aria-labelledby]="showHeader ? titleId : null"
          [attr.aria-label]="!showHeader ? ariaLabel : null"
          tabindex="-1"
        >
          @if ((renderedSide === 'top' || renderedSide === 'bottom') && showResizeHandle) {
            <div class="kp-drawer__handle" aria-hidden="true"><span></span></div>
          }

          @if (showHeader) {
            <header class="kp-drawer__header">
              <div class="kp-drawer__text-group">
                <h2 class="kp-drawer__title" [id]="titleId">{{ title }}</h2>
                @if (showDescription) {
                  <p class="kp-drawer__desc">{{ description }}</p>
                }
              </div>
              @if (showClose) {
                <button type="button" class="kp-drawer__close" aria-label="Close drawer" (click)="close()">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M18 6 L6 18 M6 6 L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </button>
              }
            </header>
          }

          @if (showHeader && showHeaderDivider) { <div class="kp-drawer__divider"></div> }

          <div class="kp-drawer__body">
            <ng-content select="[kpDrawerBody]"/>
          </div>

          @if (showFooter && showFooterDivider) { <div class="kp-drawer__divider"></div> }

          @if (showFooter) {
            <footer class="kp-drawer__footer">
              <ng-content select="[kpDrawerFooter]"/>
            </footer>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: contents; }

    .kp-drawer__root {
      position: fixed;
      inset: 0;
      z-index: 1000;
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
    }

    .kp-drawer__backdrop {
      position: absolute;
      inset: 0;
      background: var(--kp-color-dialog-backdrop, rgba(0, 0, 0, 0.5));
      animation: kp-drawer-fade-in var(--kp-motion-duration-fast) ease;
    }
    .kp-drawer__root--closing .kp-drawer__backdrop {
      animation: kp-drawer-fade-out var(--kp-motion-duration-normal) ease forwards;
    }

    .kp-drawer__panel {
      position: absolute;
      display: flex;
      flex-direction: column;
      background: var(--kp-color-dialog-panel-bg, var(--kp-color-white));
      border: 1px solid var(--kp-color-dialog-panel-border, var(--kp-color-gray-200));
      box-shadow: var(--kp-elevation-floating);
      outline: none;
      max-width: 100vw;
      max-height: 100vh;
    }

    @keyframes kp-drawer-fade-in   { from { opacity: 0 } to { opacity: 1 } }
    @keyframes kp-drawer-fade-out  { from { opacity: 1 } to { opacity: 0 } }
    @keyframes kp-drawer-slide-right { from { transform: translateX(100%); } to { transform: translateX(0); } }
    @keyframes kp-drawer-slide-left  { from { transform: translateX(-100%); } to { transform: translateX(0); } }
    @keyframes kp-drawer-slide-top   { from { transform: translateY(-100%); } to { transform: translateY(0); } }
    @keyframes kp-drawer-slide-bottom { from { transform: translateY(100%); } to { transform: translateY(0); } }
    @keyframes kp-drawer-out-right  { from { transform: translateX(0); } to { transform: translateX(100%); } }
    @keyframes kp-drawer-out-left   { from { transform: translateX(0); } to { transform: translateX(-100%); } }
    @keyframes kp-drawer-out-top    { from { transform: translateY(0); } to { transform: translateY(-100%); } }
    @keyframes kp-drawer-out-bottom { from { transform: translateY(0); } to { transform: translateY(100%); } }

    /* Side anchoring + radius (only on edge facing into the screen) */
    .kp-drawer__root.kp-drawer--right .kp-drawer__panel {
      top: 0; right: 0; height: 100vh;
      width: var(--kp-drawer-w);
      border-radius: 16px 0 0 16px;
      /* kanso-lint-disable physical-css -- drawer's side="right" is a physical API by design */
      border-right: none;
      animation: kp-drawer-slide-right var(--kp-motion-duration-normal) cubic-bezier(0.2, 1, 0.4, 1);
    }
    .kp-drawer__root.kp-drawer--left .kp-drawer__panel {
      top: 0; left: 0; height: 100vh;
      width: var(--kp-drawer-w);
      border-radius: 0 16px 16px 0;
      /* kanso-lint-disable physical-css -- drawer's side="left" is a physical API by design */
      border-left: none;
      animation: kp-drawer-slide-left var(--kp-motion-duration-normal) cubic-bezier(0.2, 1, 0.4, 1);
    }
    .kp-drawer__root.kp-drawer--top .kp-drawer__panel {
      top: 0; left: 0; width: 100vw;
      height: var(--kp-drawer-h);
      border-radius: 0 0 16px 16px;
      border-top: none;
      animation: kp-drawer-slide-top var(--kp-motion-duration-normal) cubic-bezier(0.2, 1, 0.4, 1);
    }
    .kp-drawer__root.kp-drawer--bottom .kp-drawer__panel {
      bottom: 0; left: 0; width: 100vw;
      height: var(--kp-drawer-h);
      border-radius: 16px 16px 0 0;
      border-bottom: none;
      animation: kp-drawer-slide-bottom var(--kp-motion-duration-normal) cubic-bezier(0.2, 1, 0.4, 1);
    }

    /* Exit animations — same easing, reversed direction. forwards keeps the
       panel at its off-screen end position until the timeout unmounts it. */
    .kp-drawer__root--closing.kp-drawer--right  .kp-drawer__panel { animation: kp-drawer-out-right  var(--kp-motion-duration-normal) cubic-bezier(0.2, 1, 0.4, 1) forwards; }
    .kp-drawer__root--closing.kp-drawer--left   .kp-drawer__panel { animation: kp-drawer-out-left   var(--kp-motion-duration-normal) cubic-bezier(0.2, 1, 0.4, 1) forwards; }
    .kp-drawer__root--closing.kp-drawer--top    .kp-drawer__panel { animation: kp-drawer-out-top    var(--kp-motion-duration-normal) cubic-bezier(0.2, 1, 0.4, 1) forwards; }
    .kp-drawer__root--closing.kp-drawer--bottom .kp-drawer__panel { animation: kp-drawer-out-bottom var(--kp-motion-duration-normal) cubic-bezier(0.2, 1, 0.4, 1) forwards; }

    /* Respect OS-level reduce-motion preference — skip slide choreography. */
    @media (prefers-reduced-motion: reduce) {
      .kp-drawer__backdrop,
      .kp-drawer__panel { animation-duration: 0.01ms; }
    }

    /* Resize handle (top/bottom only) */
    .kp-drawer__handle {
      display: flex; justify-content: center;
      padding: 12px 0 0;
    }
    .kp-drawer__root.kp-drawer--top .kp-drawer__handle { order: 99; padding: 0 0 12px; }
    .kp-drawer__handle span {
      display: block;
      width: 40px;
      height: 4px;
      border-radius: 2px;
      background: var(--kp-color-drawer-resize-handle, var(--kp-color-gray-300));
    }

    .kp-drawer__header {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 20px;
    }
    .kp-drawer__text-group {
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
    }
    .kp-drawer__title {
      margin: 0;
      font-size: 18px;
      line-height: 28px;
      font-weight: 500;
      color: var(--kp-color-dialog-fg-title, var(--kp-color-gray-900));
    }
    .kp-drawer__desc {
      margin: 0;
      font-size: 16px;
      line-height: 24px;
      color: var(--kp-color-dialog-fg-desc, var(--kp-color-gray-600));
    }
    .kp-drawer__close {
      all: unset;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 8px;
      color: var(--kp-color-dialog-fg-desc, var(--kp-color-gray-600));
      cursor: pointer;
      transition: background var(--kp-motion-duration-fast) ease;
      flex: 0 0 auto;
    }
    .kp-drawer__close:hover { background: var(--kp-color-gray-100, var(--kp-color-gray-100)); }
    .kp-drawer__close:focus-visible {
      outline: 2px solid var(--kp-color-focus-ring, var(--kp-color-blue-400));
      outline-offset: 2px;
    }
    .kp-drawer__close svg { width: 18px; height: 18px; }

    .kp-drawer__divider {
      height: 1px;
      background: var(--kp-color-dialog-divider, var(--kp-color-gray-100));
    }

    .kp-drawer__body {
      flex: 1 1 auto;
      padding: 0 20px;
      overflow-y: auto;
      color: var(--kp-color-dialog-fg-body, var(--kp-color-gray-700));
      font-size: 16px;
      line-height: 24px;
    }

    .kp-drawer__footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 12px;
      padding: 20px;
    }

    /* Sizes — width for right/left, height for top/bottom */
    .kp-drawer__root.kp-drawer--sm { --kp-drawer-w: 320px; --kp-drawer-h: 240px; }
    .kp-drawer__root.kp-drawer--md { --kp-drawer-w: 480px; --kp-drawer-h: 400px; }
    .kp-drawer__root.kp-drawer--lg { --kp-drawer-w: 640px; --kp-drawer-h: 560px; }
    .kp-drawer__root.kp-drawer--xl { --kp-drawer-w: 800px; --kp-drawer-h: 720px; }
  `],
})
export class KpDrawerComponent implements AfterViewChecked, OnChanges, OnDestroy {
  private static idCounter = 0;
  private readonly uid = ++KpDrawerComponent.idCounter;

  @Input() size: KpDrawerSize = 'md';
  @Input() side: KpDrawerSide = 'right';
  @Input() title = '';
  @Input() description = '';
  @Input() showHeader = true;
  @Input() showDescription = false;
  @Input() showClose = true;
  @Input() showFooter = false;
  @Input() showHeaderDivider = false;
  @Input() showFooterDivider = false;
  @Input() showResizeHandle = true;
  @Input() ariaLabel = '';
  @Input() closeOnBackdrop = true;
  @Input() closeOnEsc = true;

  @Input() open = false;

  /** @internal — keeps the DOM mounted while the exit animation plays. */
  rendered = false;
  /** @internal — frozen side while the panel is mounted, so exit
   *  animation stays in the direction it entered from. */
  renderedSide: KpDrawerSide = 'right';
  /** @internal — frozen size for the same reason. */
  renderedSize: KpDrawerSize = 'md';
  /** @internal — flips on for the duration of the exit animation. */
  closing = false;
  private closeTimer?: ReturnType<typeof setTimeout>;

  @Output() readonly openChange = new EventEmitter<boolean>();
  @Output() readonly closed = new EventEmitter<void>();

  @ViewChild('panel') panel?: ElementRef<HTMLElement>;
  @ViewChild('root')  root?: ElementRef<HTMLElement>;

  private readonly doc = inject(DOCUMENT);
  private readonly cdr = inject(ChangeDetectorRef);
  private prevBodyOverflow = '';
  private prevFocused: Element | null = null;

  readonly titleId = `kp-drawer-title-${this.uid}`;

  get hostClasses(): string {
    return `kp-drawer kp-drawer--${this.size} kp-drawer--${this.side}`;
  }
  get rootClasses(): string {
    let s = `kp-drawer__root kp-drawer--${this.renderedSize} kp-drawer--${this.renderedSide}`;
    if (this.closing) s += ' kp-drawer__root--closing';
    return s;
  }

  ngOnChanges(changes: SimpleChanges): void {
    const c = changes['open'];
    if (!c) return;
    const now = !!c.currentValue;
    const prev = c.firstChange ? false : !!c.previousValue;
    if (now === prev) return;
    if (now) this.handleOpen();
    else if (this.rendered) this.startExit();
  }
  ngAfterViewChecked(): void {
    const el = this.root?.nativeElement;
    if (el && this.doc?.body && el.parentElement !== this.doc.body) {
      this.doc.body.appendChild(el);
    }
  }
  ngOnDestroy(): void {
    if (this.closeTimer != null) clearTimeout(this.closeTimer);
    if (this.rendered) this.restoreBodyScroll();
  }

  private handleOpen(): void {
    if (this.closeTimer != null) { clearTimeout(this.closeTimer); this.closeTimer = undefined; }
    // Snapshot side+size here (after Angular has synced ALL inputs for this
    // change cycle) so exit animation still slides back to the edge the
    // panel entered from, even if the parent rebinds those inputs while the
    // drawer is closing.
    this.renderedSide = this.side;
    this.renderedSize = this.size;
    this.rendered = true;
    this.closing = false;
    this.onOpened();
  }

  private onOpened(): void {
    if (!this.doc?.body) return;
    this.prevFocused = this.doc.activeElement;
    this.prevBodyOverflow = this.doc.body.style.overflow;
    this.doc.body.style.overflow = 'hidden';
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

  private startExit(): void {
    if (this.closing) return;
    this.closing = true;
    this.cdr.markForCheck();
    this.closeTimer = setTimeout(() => {
      this.closeTimer = undefined;
      this.rendered = false;
      this.closing = false;
      this.closed.emit();
      this.restoreBodyScroll();
      this.cdr.markForCheck();
    }, 220);
  }

  close(): void {
    if (!this.open || this.closing) return;
    this.open = false;
    this.openChange.emit(false);
    this.startExit();
  }
  onBackdropClick(): void { if (this.closeOnBackdrop) this.close(); }

  @HostListener('document:keydown.escape', ['$event'])
  onEscape(event: Event): void {
    if (this.open && this.closeOnEsc) { event.stopPropagation(); this.close(); }
  }
}
