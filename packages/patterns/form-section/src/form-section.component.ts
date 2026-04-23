import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';
import { KpDividerComponent } from '@kanso-protocol/divider';

export type KpFormSectionLayout = 'inline' | 'stacked';
export type KpFormSectionSize = 'sm' | 'md' | 'lg';

/**
 * Kanso Protocol — FormSection
 *
 * One titled block of a form with a description and the related
 * fields. Two layouts:
 * - `inline` — title + description on the left, fields on the right
 *   (the classic "settings page" layout).
 * - `stacked` — title + description on top, fields below (good for
 *   narrow viewports and onboarding wizards).
 *
 * Pure container — drop your `<kp-form-field>` / `<kp-input>` /
 * `<kp-toggle>` etc. as children. Bottom divider is optional and on
 * by default so consecutive sections separate cleanly.
 *
 * @example
 * <kp-form-section title="Personal information"
 *                  description="This information will be displayed publicly.">
 *   <kp-form-field label="First name"><kp-input/></kp-form-field>
 *   <kp-form-field label="Last name"><kp-input/></kp-form-field>
 *   <kp-form-field label="Email"><kp-input type="email"/></kp-form-field>
 * </kp-form-section>
 */
@Component({
  selector: 'kp-form-section',
  imports: [KpDividerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClasses' },
  template: `
    <div class="kp-fs__body">
      <div class="kp-fs__header">
        <h3 class="kp-fs__title">{{ title }}</h3>
        @if (showDescription && description) {
          <p class="kp-fs__description">{{ description }}</p>
        }
      </div>

      <div class="kp-fs__fields">
        <ng-content/>
      </div>
    </div>

    @if (showDivider) {
      <kp-divider class="kp-fs__divider" orientation="horizontal"/>
    }
  `,
  styles: [`
    :host {
      box-sizing: border-box;
      display: block;
      width: 100%;
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
      color: var(--kp-color-gray-900, var(--kp-color-gray-900));
    }

    .kp-fs__body {
      display: flex;
      gap: var(--kp-fs-gap, 32px);
      align-items: flex-start;
    }

    /* Layouts */
    :host(.kp-fs--inline)  .kp-fs__body { flex-direction: row; }
    :host(.kp-fs--stacked) .kp-fs__body { flex-direction: column; gap: 24px; }

    /* Sizes */
    :host(.kp-fs--sm) { --kp-fs-gap: 24px; --kp-fs-title: 16px; --kp-fs-desc:  13px; }
    :host(.kp-fs--md) { --kp-fs-gap: 32px; --kp-fs-title: 18px; --kp-fs-desc:  13px; }
    :host(.kp-fs--lg) { --kp-fs-gap: 40px; --kp-fs-title: 20px; --kp-fs-desc:  14px; }

    .kp-fs__header {
      flex: 0 0 auto;
      width: 320px;
      max-width: 100%;
    }
    :host(.kp-fs--stacked) .kp-fs__header { width: 100%; }

    .kp-fs__title {
      margin: 0;
      font-size: var(--kp-fs-title, 18px);
      font-weight: 500;
      line-height: 1.3;
      color: var(--kp-color-gray-900, var(--kp-color-gray-900));
    }
    .kp-fs__description {
      margin: 4px 0 0;
      font-size: var(--kp-fs-desc, 13px);
      line-height: 1.45;
      color: var(--kp-color-gray-600, var(--kp-color-gray-600));
    }

    .kp-fs__fields {
      flex: 1 1 auto;
      min-width: 0;
      max-width: 640px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    :host(.kp-fs--stacked) .kp-fs__fields {
      max-width: 100%;
      width: 100%;
    }

    .kp-fs__divider { display: block; margin-top: 24px; }
  `],
})
export class KpFormSectionComponent {
  @Input() layout: KpFormSectionLayout = 'inline';
  @Input() size: KpFormSectionSize = 'md';
  @Input() title = 'Section title';
  @Input() description = '';
  @Input() showDescription = true;
  @Input() showDivider = true;

  get hostClasses(): string {
    return `kp-fs kp-fs--${this.layout} kp-fs--${this.size}`;
  }
}
