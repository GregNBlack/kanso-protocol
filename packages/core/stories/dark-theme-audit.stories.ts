import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';

import { KpButtonComponent } from '@kanso-protocol/button';

/**
 * Foundations / Dark Theme Audit
 *
 * Side-by-side light + dark rendering of every component, all variants,
 * all states. Light theme is frozen; dark theme is the working surface
 * we tune by changing values in tokens/themes/dark.json. Each section
 * below is one component family — open the page in Storybook with a
 * wide viewport, scroll to the section, compare columns, and call out
 * which dark cell looks wrong.
 *
 * The dark column lives inside an explicit `data-theme="dark"` wrapper,
 * so it stays dark regardless of the global theme toggle. That makes
 * the comparison stable while we iterate on token values.
 */

const VARIANTS = ['default', 'subtle', 'outline', 'ghost'] as const;
const COLORS = ['primary', 'danger', 'neutral'] as const;
const STATES = ['rest', 'hover', 'active', 'focus', 'disabled', 'loading'] as const;

@Component({
  selector: 'kp-dark-audit-button',
  imports: [KpButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="audit">
      <div class="audit__col" data-theme="light">
        <h3 class="audit__theme">Light</h3>
        @for (variant of variants; track variant) {
          <div class="audit__variant">
            <h4 class="audit__variant-title">{{ variant }}</h4>
            @for (color of colors; track color) {
              <div class="audit__row">
                <span class="audit__row-label">{{ color }}</span>
                @for (state of states; track state) {
                  <div class="audit__cell">
                    <kp-button
                      [variant]="variant"
                      [color]="color"
                      [forceState]="state"
                      size="md"
                    >Button</kp-button>
                    <span class="audit__cell-label">{{ state }}</span>
                  </div>
                }
              </div>
            }
          </div>
        }
      </div>

      <div class="audit__col" data-theme="dark">
        <h3 class="audit__theme">Dark</h3>
        @for (variant of variants; track variant) {
          <div class="audit__variant">
            <h4 class="audit__variant-title">{{ variant }}</h4>
            @for (color of colors; track color) {
              <div class="audit__row">
                <span class="audit__row-label">{{ color }}</span>
                @for (state of states; track state) {
                  <div class="audit__cell">
                    <kp-button
                      [variant]="variant"
                      [color]="color"
                      [forceState]="state"
                      size="md"
                    >Button</kp-button>
                    <span class="audit__cell-label">{{ state }}</span>
                  </div>
                }
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif); }

    .audit {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0;
      align-items: stretch;
      min-height: 100vh;
    }
    .audit__col {
      padding: 24px;
      background: var(--kp-color-surface-base);
      color: var(--kp-color-text-default);
      box-sizing: border-box;
    }
    .audit__theme {
      margin: 0 0 24px;
      font-size: 12px;
      font-weight: 500;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--kp-color-text-muted);
      border-bottom: 1px solid var(--kp-color-border-default);
      padding-bottom: 8px;
    }
    .audit__variant {
      margin-bottom: 32px;
    }
    .audit__variant-title {
      margin: 0 0 12px;
      font-size: 14px;
      font-weight: 500;
      color: var(--kp-color-text-strong);
      text-transform: capitalize;
    }
    .audit__row {
      display: grid;
      grid-template-columns: 80px repeat(6, 1fr);
      gap: 12px;
      align-items: end;
      margin-bottom: 16px;
    }
    .audit__row-label {
      font-size: 12px;
      color: var(--kp-color-text-muted);
      text-transform: capitalize;
      align-self: center;
    }
    .audit__cell {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
    }
    .audit__cell-label {
      font-size: 11px;
      color: var(--kp-color-text-muted);
    }
  `],
})
export class KpDarkAuditButtonComponent {
  readonly variants = VARIANTS;
  readonly colors = COLORS;
  readonly states = STATES;
}

const meta: Meta = {
  title: 'Foundations/Dark Theme Audit',
  component: KpDarkAuditButtonComponent,
  parameters: {
    layout: 'fullscreen',
    docs: { disable: true },
    a11y: { disable: true },
  },
  decorators: [
    moduleMetadata({
      imports: [KpDarkAuditButtonComponent],
    }),
  ],
};

export default meta;

export const Button: StoryObj = {
  render: () => ({
    template: `<kp-dark-audit-button/>`,
  }),
};
