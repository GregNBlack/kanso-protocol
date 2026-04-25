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
  imports: [],
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

            <button type="button" class="kp-th__close" aria-label="Dismiss" (click)="dismiss(t.id)">
              <svg viewBox="0 0 24 24" fill="none" width="14" height="14" aria-hidden="true">
                <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
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
      border: 1px solid var(--kp-toast-border, var(--kp-color-gray-200));
      background: var(--kp-toast-bg, var(--kp-color-white));
      color: var(--kp-toast-fg-body, var(--kp-color-gray-700));
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
      color: var(--kp-toast-icon, var(--kp-color-gray-500));
    }

    .kp-th__content { flex: 1 1 auto; min-width: 0; }
    .kp-th__title {
      font-size: 15px;
      line-height: 22px;
      font-weight: 500;
      color: var(--kp-toast-fg-title, var(--kp-color-gray-900));
    }
    .kp-th__desc {
      margin-top: 4px;
      font-size: 13px;
      line-height: 18px;
      color: var(--kp-toast-fg-desc, var(--kp-color-gray-600));
    }
    .kp-th__action {
      all: unset;
      display: inline-flex;
      margin-top: 8px;
      padding: 4px 10px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      color: var(--kp-toast-action, var(--kp-color-blue-600));
      cursor: pointer;
      transition: background var(--kp-motion-duration-fast) ease;
    }
    /* kanso-lint-disable raw-color -- pending primary-translucent overlay token (0.2.x) */
    .kp-th__action:hover { background: rgba(37, 99, 235, 0.08); }
    .kp-th__action:focus-visible {
      outline: 2px solid var(--kp-color-focus-ring, var(--kp-color-blue-400));
      outline-offset: 2px;
    }

    .kp-th__close {
      all: unset;
      flex: 0 0 auto;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      border-radius: 4px;
      color: var(--kp-color-toast-close, var(--kp-color-gray-400));
      cursor: pointer;
      transition: background var(--kp-motion-duration-fast) ease, color 120ms ease;
    }
    .kp-th__close:hover { background: var(--kp-color-gray-100); color: var(--kp-color-gray-700); }

    /* Appearance tokens — shared with Alert */
    .kp-th__toast--primary {
      --kp-toast-bg:       var(--kp-color-alert-primary-subtle-bg, var(--kp-color-blue-50));
      --kp-toast-border:   var(--kp-color-alert-primary-subtle-border, var(--kp-color-blue-200));
      --kp-toast-fg-title: var(--kp-color-alert-primary-subtle-fg-title, var(--kp-color-blue-900));
      --kp-toast-fg-desc:  var(--kp-color-alert-primary-subtle-fg-desc, var(--kp-color-blue-700));
      --kp-toast-fg-body:  var(--kp-color-alert-primary-subtle-fg-desc, var(--kp-color-blue-700));
      --kp-toast-icon:     var(--kp-color-alert-primary-subtle-icon, var(--kp-color-blue-600));
      --kp-toast-action:   var(--kp-color-alert-primary-subtle-icon, var(--kp-color-blue-600));
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
      --kp-toast-bg:       var(--kp-color-alert-danger-subtle-bg, var(--kp-color-red-50));
      --kp-toast-border:   var(--kp-color-alert-danger-subtle-border, var(--kp-color-red-300));
      --kp-toast-fg-title: var(--kp-color-alert-danger-subtle-fg-title, var(--kp-color-red-900));
      --kp-toast-fg-desc:  var(--kp-color-alert-danger-subtle-fg-desc, var(--kp-color-red-700));
      --kp-toast-fg-body:  var(--kp-color-alert-danger-subtle-fg-desc, var(--kp-color-red-700));
      --kp-toast-icon:     var(--kp-color-alert-danger-subtle-icon, var(--kp-color-red-600));
      --kp-toast-action:   var(--kp-color-alert-danger-subtle-icon, var(--kp-color-red-600));
    }
    .kp-th__toast--warning {
      --kp-toast-bg:       var(--kp-color-alert-warning-subtle-bg, var(--kp-color-amber-50));
      --kp-toast-border:   var(--kp-color-alert-warning-subtle-border, var(--kp-color-amber-300));
      --kp-toast-fg-title: var(--kp-color-alert-warning-subtle-fg-title, var(--kp-color-amber-900));
      --kp-toast-fg-desc:  var(--kp-color-alert-warning-subtle-fg-desc, var(--kp-color-amber-700));
      --kp-toast-fg-body:  var(--kp-color-alert-warning-subtle-fg-desc, var(--kp-color-amber-700));
      --kp-toast-icon:     var(--kp-color-alert-warning-subtle-icon, var(--kp-color-amber-600));
      --kp-toast-action:   var(--kp-color-alert-warning-subtle-icon, var(--kp-color-amber-600));
    }
    .kp-th__toast--info {
      --kp-toast-bg:       var(--kp-color-alert-info-subtle-bg, var(--kp-color-cyan-50));
      --kp-toast-border:   var(--kp-color-alert-info-subtle-border, var(--kp-color-cyan-200));
      --kp-toast-fg-title: var(--kp-color-alert-info-subtle-fg-title, var(--kp-color-cyan-900));
      --kp-toast-fg-desc:  var(--kp-color-alert-info-subtle-fg-desc, var(--kp-color-cyan-700));
      --kp-toast-fg-body:  var(--kp-color-alert-info-subtle-fg-desc, var(--kp-color-cyan-700));
      --kp-toast-icon:     var(--kp-color-alert-info-subtle-icon, var(--kp-color-cyan-600));
      --kp-toast-action:   var(--kp-color-alert-info-subtle-icon, var(--kp-color-cyan-600));
    }
    .kp-th__toast--neutral {
      --kp-toast-bg:       var(--kp-color-white);
      --kp-toast-border:   var(--kp-color-gray-200);
      --kp-toast-fg-title: var(--kp-color-gray-900);
      --kp-toast-fg-desc:  var(--kp-color-gray-600);
      --kp-toast-fg-body:  var(--kp-color-gray-700);
      --kp-toast-icon:     var(--kp-color-gray-500);
      --kp-toast-action:   var(--kp-color-blue-600);
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

  stackClasses(): string {
    return `kp-th__stack--${this.position} kp-th__stack--${this.size}`;
  }

  toastClasses(t: KpToast): string {
    return `kp-th__toast kp-th__toast--${t.appearance}`;
  }

  /** In a multi-host world we'd route toasts to a specific host by position,
   *  but v1 renders all of them in every host — callers place one host. */
  isOwnedByThisHost(_t: KpToast): boolean {
    // Render only the most recent `max` toasts so a burst doesn't flood the screen.
    const list = this.toasts();
    const shown = list.slice(-this.max);
    return shown.includes(_t);
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
