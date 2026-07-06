import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
  inject,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

import { injectKpStrings } from '@kanso-protocol/ui/i18n';
import { KpIconButtonComponent } from '@kanso-protocol/ui/button';

import { KpToastService } from './toast.service';
import { KpToast, KpToastPosition, KpToastSize } from './toast.types';

/**
 * Kanso Protocol — ToastHost
 *
 * Portaled container that renders the active toast queue in one corner
 * of the viewport. Drop one (or several, one per corner) anywhere in
 * the app — toasts render via this host, not inline.
 *
 * @example
 * <kp-toast-host position="top-right" size="md"/>
 */
@Component({
  selector: 'kp-toast-host',
  imports: [KpIconButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.aria-live]': '"polite"', '[attr.aria-atomic]': '"false"' },
  template: `
    <div #stack class="kp-th__stack" [class]="stackClasses()">
      @for (t of toasts(); track t.id) {
        @if (isOwnedByThisHost(t)) {
          <div class="kp-th__toast" [class]="toastClasses(t)" role="status">
            @if (showIcon) {
              <span class="kp-th__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                  @switch (t.appearance) {
                    @case ('success') { <path d="M5 12l5 5L20 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/> }
                    @case ('danger')  { <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M12 8v5M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/> }
                    @case ('warning') { <path d="M12 3l10 18H2L12 3z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 10v4M12 17h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/> }
                    @case ('info')    { <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M12 8v5M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/> }
                    @case ('primary') { <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M12 8v5M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/> }
                    @default          { <path d="M4 4h16v12H5l-1 4V4z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/> }
                  }
                </svg>
              </span>
            }

            <div class="kp-th__content">
              <div class="kp-th__title">{{ t.title }}</div>
              @if (t.description) {
                <div class="kp-th__desc">{{ t.description }}</div>
              }
              @if (t.action) {
                <button type="button" class="kp-th__action" (click)="t.action!.handler(t.id)">
                  {{ t.action.label }}
                </button>
              }
            </div>

            <kp-icon-button
              class="kp-th__close"
              size="xs"
              [ariaLabel]="strings.toastDismiss"
              (buttonClick)="dismiss(t.id)"
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </kp-icon-button>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    :host { display: contents; }

    .kp-th__stack {
      position: fixed;
      z-index: 1100;
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 16px;
      pointer-events: none;
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
      max-width: 100vw;
      box-sizing: border-box;
    }
    .kp-th__stack--top-right    { top: 0; right: 0; align-items: flex-end; }
    .kp-th__stack--top-left     { top: 0; left: 0;  align-items: flex-start; }
    .kp-th__stack--bottom-right { bottom: 0; right: 0; align-items: flex-end; flex-direction: column-reverse; }
    .kp-th__stack--bottom-left  { bottom: 0; left: 0;  align-items: flex-start; flex-direction: column-reverse; }

    .kp-th__toast {
      pointer-events: auto;
      display: flex;
      align-items: flex-start;
      gap: var(--kp-toast-gap, 12px);
      padding: var(--kp-toast-pad, 16px);
      border-radius: var(--kp-toast-radius, 12px);
      width: var(--kp-toast-w, 400px);
      max-width: calc(100vw - 32px);
      box-sizing: border-box;
      border: 1px solid var(--kp-toast-border);
      background: var(--kp-toast-bg);
      color: var(--kp-toast-fg-body);
      box-shadow: var(--kp-elevation-floating);
      animation: kp-th-in var(--kp-motion-duration-normal) cubic-bezier(0.2, 1, 0.4, 1);
    }
    :host-context(.kp-th-size-sm) .kp-th__toast,
    :host .kp-th__stack--sm .kp-th__toast {
      --kp-toast-gap: 10px;
      --kp-toast-pad: 12px;
      --kp-toast-radius: 10px;
      --kp-toast-w: 320px;
    }

    @keyframes kp-th-in {
      from { opacity: 0; transform: translateY(-8px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* Respect OS-level reduce-motion preference — skip the slide-down entry. */
    @media (prefers-reduced-motion: reduce) {
      .kp-th__toast { animation-duration: 0.01ms; }
    }

    .kp-th__icon {
      flex: 0 0 auto;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      color: var(--kp-toast-icon);
    }

    .kp-th__content { flex: 1 1 auto; min-width: 0; }
    .kp-th__title {
      font-size: 15px;
      line-height: 22px;
      font-weight: 500;
      color: var(--kp-toast-fg-title);
    }
    .kp-th__desc {
      margin-top: 4px;
      font-size: 13px;
      line-height: 18px;
      color: var(--kp-toast-fg-desc);
    }
    .kp-th__action {
      all: unset;
      display: inline-flex;
      margin-top: 8px;
      padding: 4px 10px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      color: var(--kp-toast-action);
      cursor: pointer;
      transition: background var(--kp-motion-duration-fast) ease;
    }
        .kp-th__action:hover { background: var(--kp-color-overlay-primary-hover); }
    .kp-th__action:focus-visible {
      outline: var(--kp-focus-ring-width) solid var(--kp-color-focus-ring);
      outline-offset: var(--kp-focus-ring-offset);
    }

    /* The close button is rendered as kp-icon-button. Color is bound to
       the toast title fg so the X reads at the same weight as the
       title in every appearance — same pattern as Alert closable. */
    .kp-th__close { color: var(--kp-toast-fg-title); }

    /* Appearance tokens — shared with Alert */
    .kp-th__toast--primary {
      --kp-toast-bg:       var(--kp-color-alert-primary-subtle-bg);
      --kp-toast-border:   var(--kp-color-alert-primary-subtle-border);
      --kp-toast-fg-title: var(--kp-color-alert-primary-subtle-fg-title);
      --kp-toast-fg-desc:  var(--kp-color-alert-primary-subtle-fg-desc);
      --kp-toast-fg-body:  var(--kp-color-alert-primary-subtle-fg-desc);
      --kp-toast-icon:     var(--kp-color-alert-primary-subtle-icon);
      --kp-toast-action:   var(--kp-color-alert-primary-subtle-icon);
    }
    .kp-th__toast--success {
      --kp-toast-bg:       var(--kp-color-alert-success-subtle-bg, #ECFDF5);
      --kp-toast-border:   var(--kp-color-alert-success-subtle-border, #A7F3D0);
      --kp-toast-fg-title: var(--kp-color-alert-success-subtle-fg-title, #064E3B);
      --kp-toast-fg-desc:  var(--kp-color-alert-success-subtle-fg-desc, #047857);
      --kp-toast-fg-body:  var(--kp-color-alert-success-subtle-fg-desc, #047857);
      --kp-toast-icon:     var(--kp-color-alert-success-subtle-icon, #059669);
      --kp-toast-action:   var(--kp-color-alert-success-subtle-icon, #059669);
    }
    .kp-th__toast--danger {
      --kp-toast-bg:       var(--kp-color-alert-danger-subtle-bg);
      --kp-toast-border:   var(--kp-color-alert-danger-subtle-border);
      --kp-toast-fg-title: var(--kp-color-alert-danger-subtle-fg-title);
      --kp-toast-fg-desc:  var(--kp-color-alert-danger-subtle-fg-desc);
      --kp-toast-fg-body:  var(--kp-color-alert-danger-subtle-fg-desc);
      --kp-toast-icon:     var(--kp-color-alert-danger-subtle-icon);
      --kp-toast-action:   var(--kp-color-alert-danger-subtle-icon);
    }
    .kp-th__toast--warning {
      --kp-toast-bg:       var(--kp-color-alert-warning-subtle-bg);
      --kp-toast-border:   var(--kp-color-alert-warning-subtle-border);
      --kp-toast-fg-title: var(--kp-color-alert-warning-subtle-fg-title);
      --kp-toast-fg-desc:  var(--kp-color-alert-warning-subtle-fg-desc);
      --kp-toast-fg-body:  var(--kp-color-alert-warning-subtle-fg-desc);
      --kp-toast-icon:     var(--kp-color-alert-warning-subtle-icon);
      --kp-toast-action:   var(--kp-color-alert-warning-subtle-icon);
    }
    .kp-th__toast--info {
      --kp-toast-bg:       var(--kp-color-alert-info-subtle-bg);
      --kp-toast-border:   var(--kp-color-alert-info-subtle-border);
      --kp-toast-fg-title: var(--kp-color-alert-info-subtle-fg-title);
      --kp-toast-fg-desc:  var(--kp-color-alert-info-subtle-fg-desc);
      --kp-toast-fg-body:  var(--kp-color-alert-info-subtle-fg-desc);
      --kp-toast-icon:     var(--kp-color-alert-info-subtle-icon);
      --kp-toast-action:   var(--kp-color-alert-info-subtle-icon);
    }
    .kp-th__toast--neutral {
      --kp-toast-bg:       var(--kp-color-popover-bg);
      --kp-toast-border:   var(--kp-color-popover-border);
      --kp-toast-fg-title: var(--kp-color-text-strong);
      --kp-toast-fg-desc:  var(--kp-color-text-muted);
      --kp-toast-fg-body:  var(--kp-color-text-default);
      --kp-toast-icon:     var(--kp-color-text-muted);
      --kp-toast-action:   var(--kp-color-primary-default-bg-rest);
    }
  `],
})
export class KpToastHostComponent implements AfterViewChecked, OnDestroy {
  @Input() position: KpToastPosition = 'top-right';
  @Input() size: KpToastSize = 'md';
  @Input() showIcon = true;
  /** Cap on how many toasts to show at once (oldest are dropped visually). */
  @Input() max = 5;

  @ViewChild('stack') stackEl?: ElementRef<HTMLElement>;

  private readonly toastSvc = inject(KpToastService);
  private readonly host = inject(ElementRef) as ElementRef<HTMLElement>;
  private readonly doc = inject(DOCUMENT);
  readonly toasts = this.toastSvc.toasts;
  readonly strings = injectKpStrings();

  stackClasses(): string {
    return `kp-th__stack--${this.position} kp-th__stack--${this.size}`;
  }

  toastClasses(t: KpToast): string {
    return `kp-th__toast kp-th__toast--${t.appearance}`;
  }

  /** Route each toast to the host matching its `position` (unset → `top-right`,
   *  the default), then show only the most recent `max` so a burst of toasts in
   *  one corner doesn't flood the screen. Multiple hosts (one per corner) no
   *  longer each render every toast. */
  isOwnedByThisHost(t: KpToast): boolean {
    const mine = this.toasts().filter((x) => (x.position ?? 'top-right') === this.position);
    return mine.slice(-this.max).includes(t);
  }

  dismiss(id: number): void { this.toastSvc.dismiss(id); }

  ngAfterViewChecked(): void {
    const stack = this.stackEl?.nativeElement;
    if (stack && this.doc?.body && stack.parentElement !== this.doc.body) {
      this.doc.body.appendChild(stack);
    }
  }

  ngOnDestroy(): void {
    const stack = this.stackEl?.nativeElement;
    if (stack && stack.parentElement === this.doc?.body) stack.remove();
  }
}
