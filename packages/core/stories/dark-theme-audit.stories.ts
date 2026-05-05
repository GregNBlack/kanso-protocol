import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';

import { KpButtonComponent } from '@kanso-protocol/button';

/**
 * Foundations / Dark Theme Audit
 *
 * Side-by-side light + dark rendering of every component, all variants,
 * all states. Light theme is frozen; dark theme is the working surface
 * we tune by changing values in tokens/themes/dark.json.
 *
 * Workflow: scan the dark column. For any cell that looks wrong, type a
 * short note in its textarea ("слишком тёмный фон", "текст не читается",
 * "border сливается с bg", etc.). Notes auto-save to localStorage. When
 * done with a section, click "Copy notes" at the top of the dark column
 * — copies all non-empty notes as plain text to the clipboard. Paste in
 * chat and we'll work through them.
 */

const VARIANTS = ['default', 'subtle', 'outline', 'ghost'] as const;
const COLORS = ['primary', 'danger', 'neutral'] as const;
const STATES = ['rest', 'hover', 'active', 'focus', 'disabled', 'loading'] as const;

const STORAGE_KEY = 'kanso:dark-audit:button';

@Component({
  selector: 'kp-dark-audit-button',
  imports: [KpButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="audit">
      <div class="audit__col audit__col--light" [attr.data-theme]="'light'">
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

      <div class="audit__col audit__col--dark" [attr.data-theme]="'dark'">
        <div class="audit__bar">
          <h3 class="audit__theme">Dark · {{ filledCount() }} note(s)</h3>
          <button
            type="button"
            class="audit__action"
            (click)="copyNotes()"
            [disabled]="filledCount() === 0"
          >{{ copyState() }}</button>
          <button
            type="button"
            class="audit__action audit__action--ghost"
            (click)="clearNotes()"
            [disabled]="filledCount() === 0"
          >Clear all</button>
        </div>
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
                    <textarea
                      class="audit__note"
                      rows="2"
                      placeholder="что не так?"
                      [value]="getNote(variant, color, state)"
                      (input)="setNote(variant, color, state, $any($event.target).value)"
                    ></textarea>
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
      box-sizing: border-box;
    }
    /* Hardcoded column bg/fg so the audit page works regardless of the
       global theme toggle. Components inside use the cascading data-theme
       attribute to pick up the right token values; the column chrome is
       fixed. */
    .audit__col--light {
      background: #FFFFFF; /* kanso-lint-disable raw-color -- audit chrome */
      color: #18181B; /* kanso-lint-disable raw-color -- audit chrome */
    }
    .audit__col--dark {
      background: #09090B; /* kanso-lint-disable raw-color -- audit chrome */
      color: #FAFAFA; /* kanso-lint-disable raw-color -- audit chrome */
    }

    .audit__bar {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 24px;
      border-bottom: 1px solid var(--kp-color-border-default);
      padding-bottom: 8px;
    }
    .audit__theme {
      margin: 0;
      flex: 1;
      font-size: 12px;
      font-weight: 500;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--kp-color-text-muted);
    }
    .audit__col--light .audit__theme {
      margin: 0 0 24px;
      border-bottom: 1px solid var(--kp-color-border-default);
      padding-bottom: 8px;
    }
    .audit__action {
      all: unset;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      background: #FAFAFA; /* kanso-lint-disable raw-color -- audit chrome */
      color: #18181B; /* kanso-lint-disable raw-color -- audit chrome */
      transition: opacity 120ms ease;
    }
    .audit__action:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    .audit__action--ghost {
      background: transparent; /* kanso-lint-disable raw-color -- audit chrome */
      color: #FAFAFA; /* kanso-lint-disable raw-color -- audit chrome */
      border: 1px solid #3F3F46; /* kanso-lint-disable raw-color -- audit chrome */
    }

    .audit__variant {
      margin-bottom: 32px;
    }
    .audit__variant-title {
      margin: 0 0 12px;
      font-size: 14px;
      font-weight: 500;
      color: inherit;
      text-transform: capitalize;
    }
    .audit__row {
      display: grid;
      grid-template-columns: 80px repeat(6, 1fr);
      gap: 12px;
      align-items: start;
      margin-bottom: 16px;
    }
    .audit__row-label {
      font-size: 12px;
      color: var(--kp-color-text-muted);
      text-transform: capitalize;
      align-self: start;
      padding-top: 10px;
    }
    .audit__cell {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 4px;
    }
    .audit__cell-label {
      font-size: 11px;
      color: var(--kp-color-text-muted);
    }
    .audit__note {
      box-sizing: border-box;
      width: 100%;
      margin-top: 4px;
      padding: 6px 8px;
      border-radius: 6px;
      font-family: inherit;
      font-size: 11px;
      line-height: 1.4;
      resize: vertical;
      background: #18181B; /* kanso-lint-disable raw-color -- audit chrome */
      color: #FAFAFA; /* kanso-lint-disable raw-color -- audit chrome */
      border: 1px solid #3F3F46; /* kanso-lint-disable raw-color -- audit chrome */
    }
    .audit__col--light .audit__note {
      background: #FAFAFA; /* kanso-lint-disable raw-color -- audit chrome */
      color: #18181B; /* kanso-lint-disable raw-color -- audit chrome */
      border-color: #E4E4E7; /* kanso-lint-disable raw-color -- audit chrome */
    }
    .audit__note:focus {
      outline: 2px solid var(--kp-color-focus-ring);
      outline-offset: 1px;
    }
    .audit__note::placeholder {
      color: #71717A; /* kanso-lint-disable raw-color -- audit chrome */
    }
  `],
})
export class KpDarkAuditButtonComponent {
  readonly variants = VARIANTS;
  readonly colors = COLORS;
  readonly states = STATES;

  private readonly notes = signal<Record<string, string>>(this.loadNotes());
  protected readonly copyState = signal<'Copy notes' | 'Copied!' | 'Copy failed'>('Copy notes');

  protected readonly filledCount = computed(
    () => Object.values(this.notes()).filter((v) => v.trim().length > 0).length,
  );

  getNote(variant: string, color: string, state: string): string {
    return this.notes()[`${variant}.${color}.${state}`] ?? '';
  }

  setNote(variant: string, color: string, state: string, value: string): void {
    const key = `${variant}.${color}.${state}`;
    this.notes.update((map) => ({ ...map, [key]: value }));
    this.persist();
  }

  async copyNotes(): Promise<void> {
    const lines: string[] = [];
    for (const variant of this.variants) {
      for (const color of this.colors) {
        for (const state of this.states) {
          const note = this.getNote(variant, color, state).trim();
          if (note) {
            lines.push(`${variant}.${color}.${state} — ${note}`);
          }
        }
      }
    }
    const text = lines.join('\n');
    try {
      await navigator.clipboard.writeText(text);
      this.copyState.set('Copied!');
      setTimeout(() => this.copyState.set('Copy notes'), 1500);
    } catch {
      this.copyState.set('Copy failed');
      setTimeout(() => this.copyState.set('Copy notes'), 1500);
    }
  }

  clearNotes(): void {
    if (!confirm('Clear all notes?')) return;
    this.notes.set({});
    this.persist();
  }

  private loadNotes(): Record<string, string> {
    if (typeof localStorage === 'undefined') return {};
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  private persist(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.notes()));
    } catch {
      /* quota exceeded etc. — ignore */
    }
  }
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
