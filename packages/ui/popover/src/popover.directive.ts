import {
  ApplicationRef,
  DOCUMENT,
  Directive,
  ElementRef,
  EmbeddedViewRef,
  EventEmitter,
  HostListener,
  Input,
  NgZone,
  OnDestroy,
  Output,
  TemplateRef,
  ViewContainerRef,
  inject,
} from '@angular/core';
import {
  KpOverlaySide,
  computeOverlayPosition,
  findPortalTarget,
} from '@kanso-protocol/ui';

export type KpPopoverTrigger = 'click' | 'hover' | 'manual';

const DEFAULT_GAP = 8;
const HOVER_HIDE_DELAY = 120;
let POPOVER_ID_SEQ = 0;

/**
 * Kanso Protocol — Popover directive.
 *
 * Attaches a floating panel to any element. The panel content is a
 * `TemplateRef`, so you control its markup completely (a menu, a form,
 * a `<kp-popover>` chrome component, anything).
 *
 * Triggers:
 * - `click` (default) — toggle on click; close on outside-click / Escape
 * - `hover` — open on mouseenter, close on mouseleave (with a small grace delay)
 * - `manual` — only `open()` / `close()` / `toggle()` from a template ref
 *
 * Positioned against the trigger with viewport-edge flipping (shared math
 * with the tooltip directive). Renders into the nearest open `<dialog>`
 * (so it sits above modals) or `document.body`.
 *
 * @example
 * <button [kpPopover]="menuTpl">Actions</button>
 * <ng-template #menuTpl>
 *   <kp-popover [closable]="false">
 *     <button kpButton variant="ghost">Edit</button>
 *     <button kpButton variant="ghost" color="danger">Delete</button>
 *   </kp-popover>
 * </ng-template>
 *
 * @example
 * <!-- avatar menu, the motivating case -->
 * <kp-avatar [kpPopover]="avatarMenu" kpPopoverPosition="bottom" />
 */
@Directive({
  selector: '[kpPopover]',
  standalone: true,
  exportAs: 'kpPopover',
})
export class KpPopoverDirective implements OnDestroy {
  /** Panel content. `null` disables the popover. */
  @Input('kpPopover') content: TemplateRef<unknown> | null = null;
  @Input() kpPopoverPosition: KpOverlaySide = 'bottom';
  @Input() kpPopoverTrigger: KpPopoverTrigger = 'click';
  @Input() kpPopoverGap = DEFAULT_GAP;
  /** Hard-disable regardless of content. */
  @Input() kpPopoverDisabled = false;

  @Output() readonly kpPopoverOpened = new EventEmitter<void>();
  @Output() readonly kpPopoverClosed = new EventEmitter<void>();

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly vcr = inject(ViewContainerRef);
  private readonly appRef = inject(ApplicationRef);
  private readonly ngZone = inject(NgZone);
  private readonly doc = inject(DOCUMENT);

  private viewRef: EmbeddedViewRef<unknown> | null = null;
  private panel: HTMLElement | null = null;
  private portalTarget: HTMLElement | null = null;
  private hideTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly panelId = `kp-popover-${++POPOVER_ID_SEQ}`;
  private reposition = (): void => { if (this.panel) this.positionPanel(this.panel); };

  get isOpen(): boolean { return this.viewRef != null; }

  /* ───────────────────── trigger hooks ───────────────────── */

  @HostListener('click')
  onClick(): void {
    if (this.kpPopoverTrigger === 'click') this.toggle();
  }

  @HostListener('mouseenter')
  onMouseEnter(): void {
    if (this.kpPopoverTrigger !== 'hover') return;
    this.clearHideTimer();
    this.open();
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    if (this.kpPopoverTrigger !== 'hover') return;
    this.hideTimer = setTimeout(() => this.ngZone.run(() => this.close()), HOVER_HIDE_DELAY);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen) this.close();
  }

  ngOnDestroy(): void {
    this.clearHideTimer();
    this.close();
  }

  /* ───────────────────── public API (manual mode) ───────────────────── */

  toggle(): void { this.isOpen ? this.close() : this.open(); }

  open(): void {
    if (this.isOpen || this.kpPopoverDisabled || !this.content) return;

    this.viewRef = this.content.createEmbeddedView({});
    this.appRef.attachView(this.viewRef);

    // Wrap the template's root nodes in a fixed-position container so we
    // own positioning + z-index regardless of what the template renders.
    const panel = this.doc.createElement('div');
    panel.id = this.panelId;
    panel.style.position = 'fixed';
    panel.style.zIndex = '9999';
    panel.style.margin = '0';
    for (const node of this.viewRef.rootNodes) panel.appendChild(node);

    this.portalTarget = findPortalTarget(this.host.nativeElement, this.doc);
    this.portalTarget.appendChild(panel);
    this.panel = panel;

    // Measure after the embedded view has rendered its content.
    this.positionPanel(panel);

    this.host.nativeElement.setAttribute('aria-expanded', 'true');
    this.host.nativeElement.setAttribute('aria-controls', this.panelId);

    // Outside-click + scroll/resize reposition. Bound outside Angular to
    // avoid a CD tick per scroll frame; close() re-enters the zone.
    this.ngZone.runOutsideAngular(() => {
      // Defer the listener by a frame so the opening click itself doesn't
      // immediately register as an outside-click and close the panel.
      requestAnimationFrame(() => {
        this.doc.addEventListener('pointerdown', this.onDocumentPointerDown, true);
      });
      window.addEventListener('scroll', this.reposition, true);
      window.addEventListener('resize', this.reposition);
    });

    this.kpPopoverOpened.emit();
  }

  close(): void {
    if (!this.isOpen) return;

    this.doc.removeEventListener('pointerdown', this.onDocumentPointerDown, true);
    window.removeEventListener('scroll', this.reposition, true);
    window.removeEventListener('resize', this.reposition);

    this.host.nativeElement.removeAttribute('aria-expanded');
    this.host.nativeElement.removeAttribute('aria-controls');

    if (this.panel?.parentNode) this.panel.parentNode.removeChild(this.panel);
    try {
      if (this.viewRef) {
        this.appRef.detachView(this.viewRef);
        this.viewRef.destroy();
      }
    } catch { /* already destroyed */ }

    this.panel = null;
    this.viewRef = null;
    this.portalTarget = null;
    this.kpPopoverClosed.emit();
  }

  /* ───────────────────── internals ───────────────────── */

  private onDocumentPointerDown = (event: PointerEvent): void => {
    const target = event.target as Node;
    if (this.panel?.contains(target) || this.host.nativeElement.contains(target)) return;
    this.ngZone.run(() => this.close());
  };

  private positionPanel(panel: HTMLElement): void {
    const t = this.host.nativeElement.getBoundingClientRect();
    const p = panel.getBoundingClientRect();
    const { x, y } = computeOverlayPosition({
      trigger: { top: t.top, left: t.left, right: t.right, bottom: t.bottom, width: t.width, height: t.height },
      overlay: { width: p.width, height: p.height },
      side: this.kpPopoverPosition,
      gap: this.kpPopoverGap,
      viewport: { width: window.innerWidth, height: window.innerHeight },
    });
    panel.style.left = `${x}px`;
    panel.style.top = `${y}px`;
  }

  private clearHideTimer(): void {
    if (this.hideTimer) { clearTimeout(this.hideTimer); this.hideTimer = null; }
  }
}
