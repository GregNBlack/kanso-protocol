import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';

export type KpSettingsPanelSize = 'sm' | 'md' | 'lg';

/**
 * Kanso Protocol — SettingsPanel
 *
 * Card-shaped container for a group of related settings. Title +
 * description in the header, then a column of `<kp-settings-row>`
 * children. The card border and header are optional — turn them off
 * to inline a panel inside another container.
 *
 * Use one panel per topical group (Notifications / Privacy / Billing).
 *
 * @example
 * <kp-settings-panel title="Notifications"
 *                    description="Manage how you receive updates and alerts.">
 *   <kp-settings-row title="Email notifications">
 *     <kp-toggle [on]="true"/>
 *   </kp-settings-row>
 *   <kp-settings-row title="Push notifications" [showDivider]="false">
 *     <kp-toggle [on]="false"/>
 *   </kp-settings-row>
 * </kp-settings-panel>
 */
@Component({
  selector: 'kp-settings-panel',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClasses' },
  template: `
    @if (showHeader) {
      <header class="kp-sp__header">
        <h3 class="kp-sp__title">{{ title }}</h3>
        @if (showDescription && description) {
          <p class="kp-sp__description">{{ description }}</p>
        }
      </header>
    }

    <div class="kp-sp__rows">
      <ng-content/>
    </div>
  `,
  styles: [`
    :host {
      box-sizing: border-box;
      display: block;
      width: 100%;
      min-width: 320px;
      background: var(--kp-color-white, #FFFFFF);
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
      color: var(--kp-color-gray-900, #18181B);
    }

    :host(.kp-sp--bordered) {
      border: 1px solid var(--kp-color-gray-200, #E4E4E7);
      border-radius: 12px;
      overflow: hidden;
    }

    :host(.kp-sp--sm) { --kp-sp-header-pad: 12px 16px; --kp-sp-title: 16px; --kp-sp-desc: 13px; }
    :host(.kp-sp--md) { --kp-sp-header-pad: 16px 20px; --kp-sp-title: 18px; --kp-sp-desc: 13px; }
    :host(.kp-sp--lg) { --kp-sp-header-pad: 20px 24px; --kp-sp-title: 20px; --kp-sp-desc: 14px; }

    .kp-sp__header {
      padding: var(--kp-sp-header-pad, 16px 20px);
      border-bottom: 1px solid var(--kp-color-gray-100, #F4F4F5);
    }
    .kp-sp__title {
      margin: 0;
      font-size: var(--kp-sp-title, 18px);
      font-weight: 500;
      line-height: 1.3;
      color: var(--kp-color-gray-900, #18181B);
    }
    .kp-sp__description {
      margin: 4px 0 0;
      font-size: var(--kp-sp-desc, 13px);
      line-height: 1.45;
      color: var(--kp-color-gray-600, #52525B);
    }

    .kp-sp__rows {
      display: flex;
      flex-direction: column;
    }
  `],
})
export class KpSettingsPanelComponent {
  @Input() size: KpSettingsPanelSize = 'md';
  @Input() title = 'Settings group';
  @Input() description = '';
  @Input() showHeader = true;
  @Input() showDescription = true;
  @Input() showOuterBorder = true;

  get hostClasses(): string {
    const c = ['kp-sp', `kp-sp--${this.size}`];
    if (this.showOuterBorder) c.push('kp-sp--bordered');
    return c.join(' ');
  }
}
