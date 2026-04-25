import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
} from '@angular/core';

export type KpAccordionItemSize = 'sm' | 'md' | 'lg';

/**
 * Kanso Protocol — AccordionItem (atom)
 *
 * Expandable row: a clickable trigger with title / optional description /
 * chevron, and a content panel that renders when `[expanded]` is true.
 * Drive `[expanded]` from a parent — either manually or via
 * `<kp-accordion>` which coordinates single/multi behavior.
 */
@Component({
  selector: 'kp-accordion-item',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClasses' },
  template: `
    <button
      type="button"
      class="kp-ai__trigger"
      [disabled]="disabled"
      [attr.aria-expanded]="expanded"
      [attr.aria-controls]="panelId"
      [id]="triggerId"
      (click)="toggle()"
    >
      @if (showIconLeft) {
        <span class="kp-ai__icon-left" aria-hidden="true">
          <ng-content select="[kpAccordionItemIcon]"/>
        </span>
      }
      <span class="kp-ai__text">
        <span class="kp-ai__title">{{ title }}</span>
        @if (showDescription) { <span class="kp-ai__desc">{{ description }}</span> }
      </span>
      <span class="kp-ai__chevron" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M6 9 L12 15 L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
    </button>

    @if (expanded) {
      <div
        class="kp-ai__content"
        role="region"
        [id]="panelId"
        [attr.aria-labelledby]="triggerId"
      >
        <ng-content select="[kpAccordionItemContent]"/>
        <ng-content/>
      </div>
    }
  `,
  styles: [`
    :host {
      display: block;
      border-bottom: 1px solid var(--kp-color-accordion-border, var(--kp-color-gray-200));
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
    }
    :host(.kp-ai--last-in-group) { border-bottom: none; }

    .kp-ai__trigger {
      all: unset;
      display: flex;
      width: 100%;
      box-sizing: border-box;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      height: var(--kp-ai-tr-h);
      padding: 0 var(--kp-ai-tr-pad);
      border-radius: 8px;
      background: var(--kp-color-accordion-trigger-bg-rest, transparent);
      color: var(--kp-color-accordion-trigger-fg-rest, var(--kp-color-gray-900));
      cursor: pointer;
      transition: background var(--kp-motion-duration-fast) ease;
    }
    .kp-ai__trigger:hover:not([disabled]) { background: var(--kp-color-accordion-trigger-bg-hover, var(--kp-color-gray-50)); }
    .kp-ai__trigger:focus-visible {
      outline: 2px solid var(--kp-color-focus-ring, var(--kp-color-blue-400));
      outline-offset: -2px;
    }
    .kp-ai__trigger[disabled] {
      color: var(--kp-color-accordion-trigger-fg-disabled, var(--kp-color-gray-400));
      cursor: not-allowed;
    }

    .kp-ai__icon-left {
      flex: 0 0 auto;
      display: inline-flex;
      align-items: center;
      color: var(--kp-color-accordion-trigger-icon-rest, var(--kp-color-gray-500));
    }
    .kp-ai__icon-left ::ng-deep svg {
      width: var(--kp-ai-icon-l);
      height: var(--kp-ai-icon-l);
    }
    .kp-ai__icon-left:empty { display: none; }

    .kp-ai__text {
      flex: 1 1 auto;
      min-width: 0;
      display: inline-flex;
      flex-direction: column;
      gap: 2px;
      text-align: start;
    }
    .kp-ai__title {
      font-size: var(--kp-ai-title-size);
      line-height: var(--kp-ai-title-lh);
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .kp-ai__desc {
      font-size: var(--kp-ai-desc-size);
      line-height: var(--kp-ai-desc-lh);
      color: var(--kp-color-gray-500, var(--kp-color-gray-500));
    }

    .kp-ai__chevron {
      flex: 0 0 auto;
      display: inline-flex;
      width: var(--kp-ai-chev);
      height: var(--kp-ai-chev);
      color: var(--kp-color-accordion-trigger-icon-rest, var(--kp-color-gray-500));
      transition: transform var(--kp-motion-duration-normal) ease, color var(--kp-motion-duration-fast) ease;
    }
    .kp-ai__chevron svg { width: 100%; height: 100%; }
    :host(.kp-ai--expanded) .kp-ai__chevron {
      transform: rotate(180deg);
      color: var(--kp-color-accordion-trigger-icon-expanded, var(--kp-color-blue-600));
    }

    .kp-ai__content {
      padding: var(--kp-ai-ct-pad-top) var(--kp-ai-ct-pad) var(--kp-ai-ct-pad);
      color: var(--kp-color-accordion-content, var(--kp-color-gray-700));
      font-size: var(--kp-ai-ct-size);
      line-height: var(--kp-ai-ct-lh);
      animation: kp-ai-in var(--kp-motion-duration-normal) ease;
    }
    @keyframes kp-ai-in {
      from { opacity: 0; transform: translateY(-4px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* Respect OS-level reduce-motion preference — content appears instantly. */
    @media (prefers-reduced-motion: reduce) {
      .kp-ai__content { animation-duration: 0.01ms; }
    }

    :host(.kp-ai--sm) {
      --kp-ai-tr-h: 40px;
      --kp-ai-tr-pad: 12px;
      --kp-ai-chev: 14px;
      --kp-ai-icon-l: 16px;
      --kp-ai-ct-pad: 12px;
      --kp-ai-ct-pad-top: 8px;
      --kp-ai-title-size: 14px;
      --kp-ai-title-lh: 20px;
      --kp-ai-desc-size: 12px;
      --kp-ai-desc-lh: 16px;
      --kp-ai-ct-size: 14px;
      --kp-ai-ct-lh: 20px;
    }
    :host(.kp-ai--md) {
      --kp-ai-tr-h: 48px;
      --kp-ai-tr-pad: 16px;
      --kp-ai-chev: 16px;
      --kp-ai-icon-l: 18px;
      --kp-ai-ct-pad: 16px;
      --kp-ai-ct-pad-top: 12px;
      --kp-ai-title-size: 16px;
      --kp-ai-title-lh: 24px;
      --kp-ai-desc-size: 14px;
      --kp-ai-desc-lh: 20px;
      --kp-ai-ct-size: 14px;
      --kp-ai-ct-lh: 20px;
    }
    :host(.kp-ai--lg) {
      --kp-ai-tr-h: 56px;
      --kp-ai-tr-pad: 20px;
      --kp-ai-chev: 18px;
      --kp-ai-icon-l: 20px;
      --kp-ai-ct-pad: 20px;
      --kp-ai-ct-pad-top: 12px;
      --kp-ai-title-size: 18px;
      --kp-ai-title-lh: 28px;
      --kp-ai-desc-size: 16px;
      --kp-ai-desc-lh: 24px;
      --kp-ai-ct-size: 16px;
      --kp-ai-ct-lh: 24px;
    }
  `],
})
export class KpAccordionItemComponent {
  private static idCounter = 0;
  private readonly uid = ++KpAccordionItemComponent.idCounter;

  @Input() size: KpAccordionItemSize = 'md';
  @Input() title = '';
  @Input() description = '';
  @Input() showDescription = false;
  @Input() showIconLeft = false;
  @Input() disabled = false;
  @Input() expanded = false;
  /** @internal — set by parent `<kp-accordion>` on the last visible child so the trailing border hides. */
  @Input() lastInGroup = false;

  @Output() readonly expandedChange = new EventEmitter<boolean>();

  readonly triggerId = `kp-ai-trigger-${this.uid}`;
  readonly panelId   = `kp-ai-panel-${this.uid}`;

  private readonly cdr = inject(ChangeDetectorRef);

  get hostClasses(): string {
    const c = ['kp-ai', `kp-ai--${this.size}`];
    if (this.expanded) c.push('kp-ai--expanded');
    if (this.lastInGroup) c.push('kp-ai--last-in-group');
    return c.join(' ');
  }

  /** Programmatic setter used by `<kp-accordion>` to collapse siblings.
   *  Goes through markForCheck so the host chevron + content stay in sync
   *  with the new state under OnPush. */
  setExpanded(value: boolean): void {
    if (this.expanded === value) return;
    this.expanded = value;
    this.expandedChange.emit(value);
    this.cdr.markForCheck();
  }

  toggle(): void {
    if (this.disabled) return;
    this.setExpanded(!this.expanded);
  }
}
