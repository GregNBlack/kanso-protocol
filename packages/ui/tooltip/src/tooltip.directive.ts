import {
  ApplicationRef,
  ChangeDetectorRef,
  ComponentRef,
  DOCUMENT,
  Directive,
  ElementRef,
  EnvironmentInjector,
  HostListener,
  Input,
  NgZone,
  OnDestroy,
  TemplateRef,
  createComponent,
  inject,
} from '@angular/core';
import { findPortalTarget, computeOverlayPosition } from '@kanso-protocol/ui';
import {
  KpTooltipArrowPosition,
  KpTooltipArrowAlign,
  KpTooltipInternalComponent,
  KpTooltipSize,
} from './tooltip-internal.component';

export type KpTooltipPosition = 'top' | 'right' | 'bottom' | 'left';

/**
 * Distance in CSS pixels between the trigger edge and the tooltip body.
 * The arrow visually closes the gap.
 */
const TOOLTIP_GAP = 8;

/**
 * How long to wait after mouseenter / focus before showing the tooltip.
 * Matches Material / Bootstrap defaults; long enough to avoid flashing
 * tooltips during pointer transit, short enough to feel responsive.
 */
const DEFAULT_SHOW_DELAY = 500;
const DEFAULT_HIDE_DELAY = 100;

let TOOLTIP_ID_SEQ = 0;

/**
 * Kanso Protocol — Tooltip directive.
 *
 * Attaches a styled hint to any element. Auto-shows on hover and focus,
 * hides on leave / blur / Escape. Positioned against the trigger with
 * viewport-edge flipping. Renders into the nearest open `<dialog>` (so it
 * sits above modals) or `document.body`.
 *
 * @example
 * <button [kpTooltip]="'Copy link'" kpTooltipShortcut="⌘C">Copy</button>
 *
 * @example
 * <!-- Conditionally enabled — null disables -->
 * <button [kpTooltip]="isCollapsed ? label : null" kpTooltipPosition="right">…</button>
 */
@Directive({
  selector: '[kpTooltip]',
  standalone: true,
})
export class KpTooltipDirective implements OnDestroy {
  /**
   * Tooltip content. A `string` renders as the label; a `TemplateRef`
   * projects custom content (icons, formatted text, etc.). `null` or an
   * empty string disables the tooltip.
   */
  @Input('kpTooltip') text: string | TemplateRef<unknown> | null = null;
  @Input() kpTooltipPosition: KpTooltipPosition = 'top';
  @Input() kpTooltipSize: KpTooltipSize = 'md';
  @Input() kpTooltipShortcut: string | null = null;
  @Input() kpTooltipDelay = DEFAULT_SHOW_DELAY;
  /** Hard-disable regardless of text content. */
  @Input() kpTooltipDisabled = false;
  /**
   * Where along the tooltip's edge the arrow attaches. Use `start` / `end`
   * when the trigger sits near a viewport edge — the body shifts inward
   * while the arrow stays anchored to the trigger.
   */
  @Input() kpTooltipAlign: KpTooltipArrowAlign = 'center';

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly envInjector = inject(EnvironmentInjector);
  private readonly appRef = inject(ApplicationRef);
  private readonly ngZone = inject(NgZone);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly doc = inject(DOCUMENT);

  private ref: ComponentRef<KpTooltipInternalComponent> | null = null;
  private portalTarget: HTMLElement | null = null;
  private showTimer: ReturnType<typeof setTimeout> | null = null;
  private hideTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly tooltipId = `kp-tooltip-${++TOOLTIP_ID_SEQ}`;
  private rafId: number | null = null;

  /**
   * Reposition while open on scroll/resize so the fixed-positioned tooltip
   * tracks its trigger (otherwise it drifts toward a screen edge when the
   * page or an ancestor scrolls). rAF-throttled; capture-phase scroll
   * catches scrollable ancestors, not just the window.
   */
  private readonly onViewportChange = (): void => {
    if (this.rafId != null || !this.ref) return;
    this.rafId = requestAnimationFrame(() => {
      this.rafId = null;
      if (this.ref) this.positionTooltip(this.ref.location.nativeElement as HTMLElement);
    });
  };

  /* ─────────────────────── trigger event hooks ──────────────────────── */

  @HostListener('mouseenter') onMouseEnter(): void { this.scheduleShow(); }
  @HostListener('mouseleave') onMouseLeave(): void { this.scheduleHide(); }
  @HostListener('focusin')    onFocusIn():    void { this.scheduleShow(); }
  @HostListener('focusout')   onFocusOut():   void { this.scheduleHide(); }

  @HostListener('document:keydown.escape') onEscape(): void {
    if (this.ref) this.hide();
  }

  ngOnDestroy(): void {
    this.clearTimers();
    this.hide();
  }

  /* ───────────────────────── show / hide flow ───────────────────────── */

  private scheduleShow(): void {
    if (!this.canShow()) return;
    if (this.hideTimer) { clearTimeout(this.hideTimer); this.hideTimer = null; }
    if (this.ref || this.showTimer) return;
    // setTimeout runs outside Angular's zone for free since we're already
    // in an event handler; re-enter for the actual show so CD picks up.
    this.showTimer = setTimeout(() => {
      this.showTimer = null;
      this.ngZone.run(() => this.show());
    }, this.kpTooltipDelay);
  }

  private scheduleHide(): void {
    if (this.showTimer) { clearTimeout(this.showTimer); this.showTimer = null; }
    if (!this.ref) return;
    this.hideTimer = setTimeout(() => {
      this.hideTimer = null;
      this.ngZone.run(() => this.hide());
    }, DEFAULT_HIDE_DELAY);
  }

  private canShow(): boolean {
    if (this.kpTooltipDisabled) return false;
    if (this.text == null) return false;
    // TemplateRef is always showable; string must be non-blank.
    if (typeof this.text === 'string' && this.text.trim() === '') return false;
    return true;
  }

  private show(): void {
    if (this.ref || !this.canShow()) return;

    this.ref = createComponent(KpTooltipInternalComponent, {
      environmentInjector: this.envInjector,
    });
    const inst = this.ref.instance;
    inst.size = this.kpTooltipSize;
    if (this.text instanceof TemplateRef) {
      inst.contentTemplate = this.text;
    } else {
      inst.label = this.text ?? '';
      inst.shortcut = this.kpTooltipShortcut;
    }
    inst.arrowPosition = this.oppositeOf(this.kpTooltipPosition) as KpTooltipArrowPosition;
    inst.arrowAlign = this.kpTooltipAlign;

    const el = this.ref.location.nativeElement as HTMLElement;
    el.id = this.tooltipId;
    el.style.position = 'fixed';
    el.style.zIndex = '9999';
    el.style.pointerEvents = 'none';
    el.style.opacity = '0';
    el.style.transition = 'opacity 100ms ease';

    this.appRef.attachView(this.ref.hostView);
    this.portalTarget = findPortalTarget(this.host.nativeElement, this.doc);
    this.portalTarget.appendChild(el);

    // Critical: synchronously run change-detection so host bindings
    // ([class]="hostClasses") + content interpolation ({{ label }}) are
    // applied to the DOM before we measure. attachView only marks the
    // view for CD — the actual tick happens in a microtask, by which
    // time positionTooltip has already read stale dimensions (no size
    // class → no padding/font tokens → tip.height way smaller than
    // real). detectChanges() forces the work synchronously here.
    this.ref.changeDetectorRef.detectChanges();
    this.positionTooltip(el);

    // Track the trigger while open (scroll/resize). Capture-phase catches
    // scrollable ancestors. SSR-guarded.
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', this.onViewportChange, true);
      window.addEventListener('resize', this.onViewportChange);
    }

    // aria wiring on trigger
    this.host.nativeElement.setAttribute('aria-describedby', this.tooltipId);

    // Fade in + re-position once web fonts have loaded so the final
    // line-height / metrics-driven height matches what positionTooltip
    // measured. If Onest is already cached, this is a no-op same-frame.
    requestAnimationFrame(() => { el.style.opacity = '1'; });
    if (this.doc.fonts && this.doc.fonts.status !== 'loaded') {
      this.doc.fonts.ready.then(() => {
        if (this.ref) this.positionTooltip(el);
      });
    }
  }

  private hide(): void {
    if (!this.ref) return;
    if (typeof window !== 'undefined') {
      window.removeEventListener('scroll', this.onViewportChange, true);
      window.removeEventListener('resize', this.onViewportChange);
    }
    if (this.rafId != null) { cancelAnimationFrame(this.rafId); this.rafId = null; }
    const el = this.ref.location.nativeElement as HTMLElement;
    this.host.nativeElement.removeAttribute('aria-describedby');
    try {
      this.appRef.detachView(this.ref.hostView);
      this.ref.destroy();
    } catch { /* already destroyed */ }
    if (el.parentNode) el.parentNode.removeChild(el);
    this.ref = null;
    this.portalTarget = null;
  }

  private clearTimers(): void {
    if (this.showTimer) { clearTimeout(this.showTimer); this.showTimer = null; }
    if (this.hideTimer) { clearTimeout(this.hideTimer); this.hideTimer = null; }
  }

  /* ────────────────────────── positioning ───────────────────────────── */

  private positionTooltip(el: HTMLElement): void {
    if (typeof window === 'undefined') return;
    const trigger = this.host.nativeElement.getBoundingClientRect();
    // ref.location is attached but tooltip may need a frame to lay out
    // its content before we can measure. We measure synchronously — the
    // styles use intrinsic size so width/height are immediately valid.
    const tip = el.getBoundingClientRect();

    // arrowInset matches --kp-tooltip-arrow-inset in the internal component
    // (sm=10, md=12) — keep in sync if the CSS changes.
    const arrowInset = this.kpTooltipSize === 'sm' ? 10 : 12;

    // Shared positioning math: viewport-edge flip + clamp, and an arrow
    // offset that keeps pointing at the trigger even after the body is
    // clamped off a screen edge.
    const { x, y, side, arrowOffset } = computeOverlayPosition({
      trigger,
      overlay: { width: tip.width, height: tip.height },
      side: this.kpTooltipPosition,
      gap: TOOLTIP_GAP,
      viewport: { width: window.innerWidth, height: window.innerHeight },
      align: this.kpTooltipAlign,
      alignInset: arrowInset,
      gutter: 4,
    });

    el.style.left = `${x}px`;
    el.style.top = `${y}px`;

    if (this.ref) {
      this.ref.instance.arrowPosition = this.oppositeOf(side) as KpTooltipArrowPosition;
      this.ref.instance.arrowOffset = arrowOffset;
      this.ref.changeDetectorRef.markForCheck();
    }
  }

  private oppositeOf(p: KpTooltipPosition): KpTooltipPosition {
    return ({ top: 'bottom', bottom: 'top', left: 'right', right: 'left' } as const)[p];
  }
}
