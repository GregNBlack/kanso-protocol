import {
  ApplicationRef,
  ComponentRef,
  DOCUMENT,
  Directive,
  ElementRef,
  EnvironmentInjector,
  EventEmitter,
  HostListener,
  Input,
  NgZone,
  OnDestroy,
  Output,
  createComponent,
  inject,
} from '@angular/core';
import {
  KpOverlaySide,
  computeOverlayPosition,
  findPortalTarget,
} from '@kanso-protocol/core';
import { KpTooltipInternalComponent } from './tooltip-internal.component';

const HINT_GAP = 8;
const DEFAULT_HINT_DURATION = 1200;

/**
 * Kanso Protocol — Clipboard-copy directive.
 *
 * Click the host element to copy text to the clipboard; a brief tooltip
 * hint ("Copied") appears for `kpClipboardDuration` ms. Reuses the
 * tooltip's visual chrome + the shared overlay positioning.
 *
 * @example
 * <code [kpClipboardCopy]="snippet">{{ snippet }}</code>
 *
 * @example
 * <button [kpClipboardCopy]="token"
 *         kpClipboardHint="Token copied!"
 *         kpClipboardPosition="top">Copy token</button>
 */
@Directive({
  selector: '[kpClipboardCopy]',
  standalone: true,
  exportAs: 'kpClipboardCopy',
})
export class KpClipboardCopyDirective implements OnDestroy {
  /** Text to copy. `null`/empty disables the copy action. */
  @Input('kpClipboardCopy') text: string | null = null;
  /** Hint shown after a successful copy. */
  @Input() kpClipboardHint = 'Copied';
  /** Hint placement relative to the trigger. */
  @Input() kpClipboardPosition: KpOverlaySide = 'top';
  /** How long the hint stays visible, in ms. */
  @Input() kpClipboardDuration = DEFAULT_HINT_DURATION;
  /** Hard-disable regardless of text. */
  @Input() kpClipboardDisabled = false;

  @Output() readonly kpCopied = new EventEmitter<string>();
  @Output() readonly kpCopyFailed = new EventEmitter<unknown>();

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly envInjector = inject(EnvironmentInjector);
  private readonly appRef = inject(ApplicationRef);
  private readonly ngZone = inject(NgZone);
  private readonly doc = inject(DOCUMENT);

  private ref: ComponentRef<KpTooltipInternalComponent> | null = null;
  private hideTimer: ReturnType<typeof setTimeout> | null = null;

  @HostListener('click')
  async onClick(): Promise<void> {
    if (this.kpClipboardDisabled || !this.text) return;
    try {
      await this.writeClipboard(this.text);
      this.kpCopied.emit(this.text);
      this.showHint();
    } catch (err) {
      this.kpCopyFailed.emit(err);
    }
  }

  ngOnDestroy(): void {
    this.clearTimer();
    this.hideHint();
  }

  private async writeClipboard(value: string): Promise<void> {
    // Prefer the async Clipboard API; fall back to a hidden textarea +
    // execCommand for non-secure contexts / older browsers.
    if (this.doc.defaultView?.navigator?.clipboard?.writeText) {
      await this.doc.defaultView.navigator.clipboard.writeText(value);
      return;
    }
    const ta = this.doc.createElement('textarea');
    ta.value = value;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    ta.style.pointerEvents = 'none';
    this.doc.body.appendChild(ta);
    ta.select();
    try {
      const ok = this.doc.execCommand('copy');
      if (!ok) throw new Error('execCommand copy failed');
    } finally {
      this.doc.body.removeChild(ta);
    }
  }

  private showHint(): void {
    this.clearTimer();
    this.hideHint();

    this.ref = createComponent(KpTooltipInternalComponent, { environmentInjector: this.envInjector });
    const inst = this.ref.instance;
    inst.size = 'sm';
    inst.label = this.kpClipboardHint;
    inst.arrowPosition = this.oppositeOf(this.kpClipboardPosition);

    const el = this.ref.location.nativeElement as HTMLElement;
    el.style.position = 'fixed';
    el.style.zIndex = '9999';
    el.style.pointerEvents = 'none';

    this.appRef.attachView(this.ref.hostView);
    findPortalTarget(this.host.nativeElement, this.doc).appendChild(el);
    this.ref.changeDetectorRef.detectChanges();

    const t = this.host.nativeElement.getBoundingClientRect();
    const h = el.getBoundingClientRect();
    const { x, y } = computeOverlayPosition({
      trigger: { top: t.top, left: t.left, right: t.right, bottom: t.bottom, width: t.width, height: t.height },
      overlay: { width: h.width, height: h.height },
      side: this.kpClipboardPosition,
      gap: HINT_GAP,
      viewport: { width: window.innerWidth, height: window.innerHeight },
    });
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;

    this.ngZone.runOutsideAngular(() => {
      this.hideTimer = setTimeout(() => this.ngZone.run(() => this.hideHint()), this.kpClipboardDuration);
    });
  }

  private hideHint(): void {
    if (!this.ref) return;
    const el = this.ref.location.nativeElement as HTMLElement;
    try {
      this.appRef.detachView(this.ref.hostView);
      this.ref.destroy();
    } catch { /* already destroyed */ }
    if (el.parentNode) el.parentNode.removeChild(el);
    this.ref = null;
  }

  private clearTimer(): void {
    if (this.hideTimer) { clearTimeout(this.hideTimer); this.hideTimer = null; }
  }

  private oppositeOf(s: KpOverlaySide): 'top' | 'right' | 'bottom' | 'left' {
    return ({ top: 'bottom', bottom: 'top', left: 'right', right: 'left' } as const)[s];
  }
}
