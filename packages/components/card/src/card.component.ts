import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

export type KpCardSize = 'sm' | 'md' | 'lg';
export type KpCardAppearance = 'default' | 'muted' | 'elevated' | 'outline';

/**
 * Kanso Protocol — Card
 *
 * Universal container with optional header (title + description +
 * action), body, and footer. Each section toggles via boolean inputs;
 * dividers can be added between sections for visual grouping.
 *
 * Set `appearance="elevated"` for a shadowed surface, `"muted"` for a
 * gray background, or `"outline"` for a transparent panel with just a
 * border. Setting `[clickable]="true"` adds a hover state and emits
 * `(cardClick)` — wire it to navigate, expand, or run any action.
 */
@Component({
  selector: 'kp-card',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses',
    '[attr.role]': 'clickable ? "button" : null',
    '[attr.tabindex]': 'clickable ? 0 : null',
    '(click)': 'handleClick($event)',
    '(keydown.enter)': 'handleClick($event)',
    '(keydown.space)': 'handleClick($event)',
  },
  template: `
    @if (showHeader) {
      <div class="kp-card__header">
        <div class="kp-card__text-group">
          <h3 class="kp-card__title">{{ title }}</h3>
          @if (showDescription) {
            <p class="kp-card__desc">{{ description }}</p>
          }
        </div>
        @if (showHeaderAction) {
          <div class="kp-card__action">
            <ng-content select="[kpCardHeaderAction]"/>
          </div>
        }
      </div>
    }

    @if (showHeader && showHeaderDivider) { <div class="kp-card__divider"></div> }

    <div class="kp-card__body">
      <ng-content select="[kpCardBody]"/>
      <ng-content/>
    </div>

    @if (showFooter && showFooterDivider) { <div class="kp-card__divider"></div> }

    @if (showFooter) {
      <footer class="kp-card__footer">
        <ng-content select="[kpCardFooter]"/>
      </footer>
    }
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      width: var(--kp-card-w);
      border-radius: var(--kp-card-radius);
      background: var(--kp-card-bg);
      border: 1px solid var(--kp-card-border);
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
      transition: background var(--kp-motion-duration-fast) ease, box-shadow 120ms ease, transform 120ms ease;
    }
    :host(.kp-card--clickable) { cursor: pointer; }
    :host(.kp-card--clickable:hover) { background: var(--kp-color-card-bg-muted, var(--kp-color-gray-50)); }
    :host(.kp-card--clickable:focus-visible) {
      outline: 2px solid var(--kp-color-focus-ring, var(--kp-color-blue-400));
      outline-offset: 2px;
    }

    .kp-card__header {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: var(--kp-card-pad);
    }
    .kp-card__text-group {
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      gap: var(--kp-card-head-gap);
      min-width: 0;
    }
    .kp-card__title {
      margin: 0;
      font-size: var(--kp-card-title-size);
      line-height: var(--kp-card-title-lh);
      font-weight: 500;
      color: var(--kp-color-card-fg-title, var(--kp-color-gray-900));
    }
    .kp-card__desc {
      margin: 0;
      font-size: var(--kp-card-desc-size);
      line-height: var(--kp-card-desc-lh);
      color: var(--kp-color-card-fg-desc, var(--kp-color-gray-600));
    }
    .kp-card__action { flex: 0 0 auto; }
    .kp-card__action:empty { display: none; }

    .kp-card__divider {
      height: 1px;
      background: var(--kp-color-card-divider, var(--kp-color-gray-100));
    }

    .kp-card__body {
      padding: 0 var(--kp-card-pad);
      color: var(--kp-color-card-fg-body, var(--kp-color-gray-700));
      font-size: var(--kp-card-body-size);
      line-height: var(--kp-card-body-lh);
    }
    .kp-card__body:empty { display: none; }
    /* When the body is the topmost or bottommost section, give it
       breathing room equivalent to what the missing header/footer
       would have provided — sized per card variant. */
    :host(.kp-card--no-header) .kp-card__body { padding-top: var(--kp-card-body-pad-v); }
    :host(.kp-card--no-footer) .kp-card__body { padding-bottom: var(--kp-card-body-pad-v); }

    .kp-card__footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: var(--kp-card-footer-gap);
      padding: var(--kp-card-pad);
    }

    /* Sizes */
    :host(.kp-card--sm) {
      --kp-card-w: 280px;
      --kp-card-pad: 12px;
      --kp-card-body-pad-v: 12px;
      --kp-card-head-gap: 2px;
      --kp-card-radius: 10px;
      --kp-card-title-size: 14px;
      --kp-card-title-lh: 20px;
      --kp-card-desc-size: 12px;
      --kp-card-desc-lh: 16px;
      --kp-card-body-size: 14px;
      --kp-card-body-lh: 20px;
      --kp-card-footer-gap: 8px;
    }
    :host(.kp-card--md) {
      --kp-card-w: 360px;
      --kp-card-pad: 16px;
      --kp-card-body-pad-v: 16px;
      --kp-card-head-gap: 4px;
      --kp-card-radius: 12px;
      --kp-card-title-size: 16px;
      --kp-card-title-lh: 24px;
      --kp-card-desc-size: 14px;
      --kp-card-desc-lh: 20px;
      --kp-card-body-size: 14px;
      --kp-card-body-lh: 20px;
      --kp-card-footer-gap: 12px;
    }
    :host(.kp-card--lg) {
      --kp-card-w: 480px;
      --kp-card-pad: 24px;
      --kp-card-body-pad-v: 24px;
      --kp-card-head-gap: 4px;
      --kp-card-radius: 16px;
      --kp-card-title-size: 18px;
      --kp-card-title-lh: 28px;
      --kp-card-desc-size: 16px;
      --kp-card-desc-lh: 24px;
      --kp-card-body-size: 16px;
      --kp-card-body-lh: 24px;
      --kp-card-footer-gap: 12px;
    }

    /* Appearances */
    :host(.kp-card--default) {
      --kp-card-bg: var(--kp-color-card-bg, var(--kp-color-white));
      --kp-card-border: var(--kp-color-card-border, var(--kp-color-gray-200));
    }
    :host(.kp-card--muted) {
      --kp-card-bg: var(--kp-color-card-bg-muted, var(--kp-color-gray-50));
      --kp-card-border: var(--kp-color-card-border, var(--kp-color-gray-200));
    }
    :host(.kp-card--elevated) {
      --kp-card-bg: var(--kp-color-card-bg, var(--kp-color-white));
      --kp-card-border: transparent;
            box-shadow: 0 1px 2px var(--kp-color-overlay-hover-subtle), 0 2px 4px rgba(0,0,0,0.06);
    }
    :host(.kp-card--outline) {
      --kp-card-bg: transparent;
      --kp-card-border: var(--kp-color-card-border, var(--kp-color-gray-200));
    }
  `],
})
export class KpCardComponent {
  @Input() size: KpCardSize = 'md';
  @Input() appearance: KpCardAppearance = 'default';
  @Input() title = '';
  @Input() description = '';

  @Input() showHeader = true;
  @Input() showDescription = false;
  @Input() showHeaderAction = false;
  @Input() showFooter = false;
  @Input() showHeaderDivider = false;
  @Input() showFooterDivider = false;
  @Input() clickable = false;

  @Output() readonly cardClick = new EventEmitter<Event>();

  get hostClasses(): string {
    const c = ['kp-card', `kp-card--${this.size}`, `kp-card--${this.appearance}`];
    if (this.clickable) c.push('kp-card--clickable');
    if (!this.showHeader) c.push('kp-card--no-header');
    if (!this.showFooter) c.push('kp-card--no-footer');
    return c.join(' ');
  }

  handleClick(event: Event): void {
    if (this.clickable) this.cardClick.emit(event);
  }
}
