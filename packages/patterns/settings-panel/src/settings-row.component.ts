import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';

export type KpSettingsRowSize = 'sm' | 'md' | 'lg';

/**
 * Kanso Protocol — SettingsRow
 *
 * One row inside a `<kp-settings-panel>`. Title + optional description
 * on the left, a Control slot on the right (toggle, select, input,
 * button, badge — anything you project in). Bottom divider on by
 * default; consumers usually turn it off on the last row of a panel.
 *
 * @example
 * <kp-settings-row title="Email notifications"
 *                  description="Receive an email when something important happens.">
 *   <kp-toggle [on]="true"/>
 * </kp-settings-row>
 */
@Component({
  selector: 'kp-settings-row',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClasses' },
  template: `
    <div class="kp-sr__text">
      <div class="kp-sr__title">{{ title }}</div>
      @if (showDescription && description) {
        <div class="kp-sr__description">{{ description }}</div>
      }
    </div>
    <div class="kp-sr__control">
      <ng-content/>
    </div>
  `,
  styles: [`
    :host {
      box-sizing: border-box;
      display: flex;
      width: 100%;
      align-items: center;
      gap: var(--kp-sr-gap, 24px);
      padding: var(--kp-sr-pad, 16px 20px);
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
      background: transparent;
    }

    :host(.kp-sr--with-divider) {
      border-bottom: 1px solid var(--kp-color-gray-100, #F4F4F5);
    }

    :host(.kp-sr--sm) { --kp-sr-gap: 16px; --kp-sr-pad: 12px 16px; --kp-sr-title-size: 13px; --kp-sr-desc-size: 12px; }
    :host(.kp-sr--md) { --kp-sr-gap: 24px; --kp-sr-pad: 16px 20px; --kp-sr-title-size: 14px; --kp-sr-desc-size: 13px; }
    :host(.kp-sr--lg) { --kp-sr-gap: 32px; --kp-sr-pad: 20px 24px; --kp-sr-title-size: 15px; --kp-sr-desc-size: 14px; }

    .kp-sr__text {
      flex: 1 1 auto;
      min-width: 0;
      max-width: 480px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .kp-sr__title {
      font-size: var(--kp-sr-title-size, 14px);
      font-weight: 500;
      color: var(--kp-color-gray-900, #18181B);
    }
    .kp-sr__description {
      font-size: var(--kp-sr-desc-size, 13px);
      color: var(--kp-color-gray-600, #52525B);
      line-height: 1.45;
    }

    .kp-sr__control {
      flex: 0 0 auto;
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }
  `],
})
export class KpSettingsRowComponent {
  @Input() size: KpSettingsRowSize = 'md';
  @Input() title = 'Setting name';
  @Input() description = '';
  @Input() showDescription = true;
  @Input() showDivider = true;

  get hostClasses(): string {
    const c = ['kp-sr', `kp-sr--${this.size}`];
    if (this.showDivider) c.push('kp-sr--with-divider');
    return c.join(' ');
  }
}
