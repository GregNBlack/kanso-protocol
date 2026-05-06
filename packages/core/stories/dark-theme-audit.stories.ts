import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';

import { KpButtonComponent } from '@kanso-protocol/button';
import { KpInputComponent } from '@kanso-protocol/input';
import { KpAlertComponent } from '@kanso-protocol/alert';
import { KpAvatarComponent } from '@kanso-protocol/avatar';
import { KpAvatarGroupComponent } from '@kanso-protocol/avatar-group';
import { KpCardComponent } from '@kanso-protocol/card';

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

// ─── Input audit ────────────────────────────────────────────────────────

const INPUT_STATES = ['rest', 'hover', 'active', 'focus', 'disabled', 'error'] as const;
const INPUT_ROWS = ['empty', 'filled'] as const;
const INPUT_STORAGE_KEY = 'kanso:dark-audit:input';

@Component({
  selector: 'kp-dark-audit-input',
  imports: [KpInputComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="audit">
      <div class="audit__col audit__col--light" [attr.data-theme]="'light'">
        <h3 class="audit__theme">Light</h3>
        @for (row of rows; track row) {
          <div class="audit__variant">
            <h4 class="audit__variant-title">{{ rowLabel(row) }}</h4>
            <div class="audit__row audit__row--input">
              @for (state of states; track state) {
                <div class="audit__cell">
                  <kp-input
                    placeholder="Type something…"
                    [value]="row === 'filled' ? 'value' : null"
                    [forceState]="state"
                    size="md"
                  />
                  <span class="audit__cell-label">{{ state }}</span>
                </div>
              }
            </div>
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
        @for (row of rows; track row) {
          <div class="audit__variant">
            <h4 class="audit__variant-title">{{ rowLabel(row) }}</h4>
            <div class="audit__row audit__row--input">
              @for (state of states; track state) {
                <div class="audit__cell">
                  <kp-input
                    placeholder="Type something…"
                    [value]="row === 'filled' ? 'value' : null"
                    [forceState]="state"
                    size="md"
                  />
                  <span class="audit__cell-label">{{ state }}</span>
                  <textarea
                    class="audit__note"
                    rows="2"
                    placeholder="что не так?"
                    [value]="getNote(row, state)"
                    (input)="setNote(row, state, $any($event.target).value)"
                  ></textarea>
                </div>
              }
            </div>
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
    .audit__col { padding: 24px; box-sizing: border-box; }
    .audit__col--light { background: #FFFFFF; color: #18181B; } /* kanso-lint-disable raw-color -- audit chrome */
    .audit__col--dark  { background: #09090B; color: #FAFAFA; } /* kanso-lint-disable raw-color -- audit chrome */

    .audit__bar {
      display: flex; align-items: center; gap: 8px;
      margin-bottom: 24px;
      border-bottom: 1px solid var(--kp-color-border-default);
      padding-bottom: 8px;
    }
    .audit__theme {
      margin: 0; flex: 1;
      font-size: 12px; font-weight: 500;
      letter-spacing: 0.08em; text-transform: uppercase;
      color: var(--kp-color-text-muted);
    }
    .audit__col--light .audit__theme {
      margin: 0 0 24px;
      border-bottom: 1px solid var(--kp-color-border-default);
      padding-bottom: 8px;
    }
    .audit__action {
      all: unset;
      padding: 6px 12px; border-radius: 8px;
      font-size: 12px; font-weight: 500; cursor: pointer;
      background: #FAFAFA; color: #18181B; /* kanso-lint-disable raw-color -- audit chrome */
      transition: opacity 120ms ease;
    }
    .audit__action:disabled { opacity: 0.4; cursor: not-allowed; }
    .audit__action--ghost {
      background: transparent; color: #FAFAFA; /* kanso-lint-disable raw-color -- audit chrome */
      border: 1px solid #3F3F46; /* kanso-lint-disable raw-color -- audit chrome */
    }

    .audit__variant { margin-bottom: 32px; }
    .audit__variant-title {
      margin: 0 0 12px;
      font-size: 14px; font-weight: 500;
      color: inherit; text-transform: capitalize;
    }
    .audit__row--input {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 12px;
      align-items: start;
    }
    .audit__cell {
      display: flex; flex-direction: column;
      align-items: stretch; gap: 4px;
    }
    .audit__cell kp-input { width: 100%; }
    .audit__cell-label {
      font-size: 11px;
      color: var(--kp-color-text-muted);
    }
    .audit__note {
      box-sizing: border-box;
      width: 100%; margin-top: 4px;
      padding: 6px 8px; border-radius: 6px;
      font-family: inherit; font-size: 11px; line-height: 1.4;
      resize: vertical;
      background: #18181B; color: #FAFAFA; /* kanso-lint-disable raw-color -- audit chrome */
      border: 1px solid #3F3F46; /* kanso-lint-disable raw-color -- audit chrome */
    }
    .audit__col--light .audit__note {
      background: #FAFAFA; color: #18181B; border-color: #E4E4E7; /* kanso-lint-disable raw-color -- audit chrome */
    }
    .audit__note:focus { outline: 2px solid var(--kp-color-focus-ring); outline-offset: 1px; }
    .audit__note::placeholder { color: #71717A; } /* kanso-lint-disable raw-color -- audit chrome */
  `],
})
export class KpDarkAuditInputComponent {
  readonly states = INPUT_STATES;
  readonly rows = INPUT_ROWS;

  private readonly notes = signal<Record<string, string>>(this.loadNotes());
  protected readonly copyState = signal<'Copy notes' | 'Copied!' | 'Copy failed'>('Copy notes');

  protected readonly filledCount = computed(
    () => Object.values(this.notes()).filter((v) => v.trim().length > 0).length,
  );

  rowLabel(row: typeof INPUT_ROWS[number]): string {
    return row === 'empty' ? 'Empty (placeholder)' : 'Filled (with value)';
  }

  getNote(row: string, state: string): string {
    return this.notes()[`${row}.${state}`] ?? '';
  }

  setNote(row: string, state: string, value: string): void {
    const key = `${row}.${state}`;
    this.notes.update((map) => ({ ...map, [key]: value }));
    this.persist();
  }

  async copyNotes(): Promise<void> {
    const lines: string[] = [];
    for (const row of this.rows) {
      for (const state of this.states) {
        const note = this.getNote(row, state).trim();
        if (note) lines.push(`${row}.${state} — ${note}`);
      }
    }
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
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
      const raw = localStorage.getItem(INPUT_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  }

  private persist(): void {
    if (typeof localStorage === 'undefined') return;
    try { localStorage.setItem(INPUT_STORAGE_KEY, JSON.stringify(this.notes())); } catch {}
  }
}

// ─── Alert audit ────────────────────────────────────────────────────────

const ALERT_APPEARANCES = ['subtle', 'solid', 'outline', 'left-accent'] as const;
const ALERT_COLORS = ['primary', 'danger', 'success', 'warning', 'info', 'neutral'] as const;
const ALERT_STORAGE_KEY = 'kanso:dark-audit:alert';

@Component({
  selector: 'kp-dark-audit-alert',
  imports: [KpAlertComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="audit">
      <div class="audit__col audit__col--light" [attr.data-theme]="'light'">
        <h3 class="audit__theme">Light</h3>
        @for (appearance of appearances; track appearance) {
          <div class="audit__variant">
            <h4 class="audit__variant-title">{{ appearance }}</h4>
            <div class="audit__row audit__row--alert">
              @for (color of colors; track color) {
                <div class="audit__cell">
                  <kp-alert
                    size="md"
                    [appearance]="appearance"
                    [color]="color"
                    title="Alert title"
                    description="Short body text for the alert."
                    [closable]="true"
                  />
                  <span class="audit__cell-label">{{ color }}</span>
                </div>
              }
            </div>
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
        @for (appearance of appearances; track appearance) {
          <div class="audit__variant">
            <h4 class="audit__variant-title">{{ appearance }}</h4>
            <div class="audit__row audit__row--alert">
              @for (color of colors; track color) {
                <div class="audit__cell">
                  <kp-alert
                    size="md"
                    [appearance]="appearance"
                    [color]="color"
                    title="Alert title"
                    description="Short body text for the alert."
                    [closable]="true"
                  />
                  <span class="audit__cell-label">{{ color }}</span>
                  <textarea
                    class="audit__note"
                    rows="2"
                    placeholder="что не так?"
                    [value]="getNote(appearance, color)"
                    (input)="setNote(appearance, color, $any($event.target).value)"
                  ></textarea>
                </div>
              }
            </div>
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
    .audit__col { padding: 24px; box-sizing: border-box; }
    .audit__col--light { background: #FFFFFF; color: #18181B; } /* kanso-lint-disable raw-color -- audit chrome */
    .audit__col--dark  { background: #09090B; color: #FAFAFA; } /* kanso-lint-disable raw-color -- audit chrome */

    .audit__bar {
      display: flex; align-items: center; gap: 8px;
      margin-bottom: 24px;
      border-bottom: 1px solid var(--kp-color-border-default);
      padding-bottom: 8px;
    }
    .audit__theme {
      margin: 0; flex: 1;
      font-size: 12px; font-weight: 500;
      letter-spacing: 0.08em; text-transform: uppercase;
      color: var(--kp-color-text-muted);
    }
    .audit__col--light .audit__theme {
      margin: 0 0 24px;
      border-bottom: 1px solid var(--kp-color-border-default);
      padding-bottom: 8px;
    }
    .audit__action {
      all: unset;
      padding: 6px 12px; border-radius: 8px;
      font-size: 12px; font-weight: 500; cursor: pointer;
      background: #FAFAFA; color: #18181B; /* kanso-lint-disable raw-color -- audit chrome */
      transition: opacity 120ms ease;
    }
    .audit__action:disabled { opacity: 0.4; cursor: not-allowed; }
    .audit__action--ghost {
      background: transparent; color: #FAFAFA; /* kanso-lint-disable raw-color -- audit chrome */
      border: 1px solid #3F3F46; /* kanso-lint-disable raw-color -- audit chrome */
    }

    .audit__variant { margin-bottom: 32px; }
    .audit__variant-title {
      margin: 0 0 12px;
      font-size: 14px; font-weight: 500;
      color: inherit; text-transform: capitalize;
    }
    .audit__row--alert {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      align-items: start;
    }
    @media (min-width: 1400px) {
      .audit__row--alert { grid-template-columns: repeat(6, 1fr); }
    }
    .audit__cell {
      display: flex; flex-direction: column;
      align-items: stretch; gap: 4px;
    }
    .audit__cell kp-alert { width: 100%; }
    .audit__cell-label {
      font-size: 11px;
      color: var(--kp-color-text-muted);
    }
    .audit__note {
      box-sizing: border-box;
      width: 100%; margin-top: 4px;
      padding: 6px 8px; border-radius: 6px;
      font-family: inherit; font-size: 11px; line-height: 1.4;
      resize: vertical;
      background: #18181B; color: #FAFAFA; /* kanso-lint-disable raw-color -- audit chrome */
      border: 1px solid #3F3F46; /* kanso-lint-disable raw-color -- audit chrome */
    }
    .audit__col--light .audit__note {
      background: #FAFAFA; color: #18181B; border-color: #E4E4E7; /* kanso-lint-disable raw-color -- audit chrome */
    }
    .audit__note:focus { outline: 2px solid var(--kp-color-focus-ring); outline-offset: 1px; }
    .audit__note::placeholder { color: #71717A; } /* kanso-lint-disable raw-color -- audit chrome */
  `],
})
export class KpDarkAuditAlertComponent {
  readonly appearances = ALERT_APPEARANCES;
  readonly colors = ALERT_COLORS;

  private readonly notes = signal<Record<string, string>>(this.loadNotes());
  protected readonly copyState = signal<'Copy notes' | 'Copied!' | 'Copy failed'>('Copy notes');

  protected readonly filledCount = computed(
    () => Object.values(this.notes()).filter((v) => v.trim().length > 0).length,
  );

  getNote(appearance: string, color: string): string {
    return this.notes()[`${appearance}.${color}`] ?? '';
  }

  setNote(appearance: string, color: string, value: string): void {
    const key = `${appearance}.${color}`;
    this.notes.update((map) => ({ ...map, [key]: value }));
    this.persist();
  }

  async copyNotes(): Promise<void> {
    const lines: string[] = [];
    for (const appearance of this.appearances) {
      for (const color of this.colors) {
        const note = this.getNote(appearance, color).trim();
        if (note) lines.push(`${appearance}.${color} — ${note}`);
      }
    }
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
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
      const raw = localStorage.getItem(ALERT_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  }

  private persist(): void {
    if (typeof localStorage === 'undefined') return;
    try { localStorage.setItem(ALERT_STORAGE_KEY, JSON.stringify(this.notes())); } catch {}
  }
}

// ─── Avatar audit ───────────────────────────────────────────────────────

const AVATAR_APPEARANCES = ['default', 'primary', 'success', 'warning', 'danger', 'info', 'neutral'] as const;
const AVATAR_ROWS = ['initials', 'icon', 'with-status'] as const;
const AVATAR_STORAGE_KEY = 'kanso:dark-audit:avatar';

@Component({
  selector: 'kp-dark-audit-avatar',
  imports: [KpAvatarComponent, KpAvatarGroupComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="audit">
      <div class="audit__col audit__col--light" [attr.data-theme]="'light'">
        <h3 class="audit__theme">Light</h3>
        @for (row of rows; track row) {
          <div class="audit__variant">
            <h4 class="audit__variant-title">{{ rowLabel(row) }}</h4>
            <div class="audit__row audit__row--avatar">
              @for (appearance of appearances; track appearance) {
                <div class="audit__cell">
                  <kp-avatar
                    size="lg"
                    shape="circle"
                    [appearance]="appearance"
                    [initials]="row === 'initials' ? 'AK' : null"
                    [showStatus]="row === 'with-status'"
                    status="online"
                  />
                  <span class="audit__cell-label">{{ appearance }}</span>
                </div>
              }
            </div>
          </div>
        }

        <div class="audit__variant">
          <h4 class="audit__variant-title">Avatar Group</h4>
          <div class="audit__row audit__row--avatar-group">
            <div class="audit__cell">
              <kp-avatar-group [items]="groupItems" [max]="3" [total]="12"/>
              <span class="audit__cell-label">3 of 12</span>
            </div>
            <div class="audit__cell">
              <kp-avatar-group [items]="groupItems" [max]="5" overlap="tight"/>
              <span class="audit__cell-label">tight</span>
            </div>
            <div class="audit__cell">
              <kp-avatar-group [items]="groupItems" [max]="5" overlap="loose"/>
              <span class="audit__cell-label">loose</span>
            </div>
          </div>
        </div>
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
        @for (row of rows; track row) {
          <div class="audit__variant">
            <h4 class="audit__variant-title">{{ rowLabel(row) }}</h4>
            <div class="audit__row audit__row--avatar">
              @for (appearance of appearances; track appearance) {
                <div class="audit__cell">
                  <kp-avatar
                    size="lg"
                    shape="circle"
                    [appearance]="appearance"
                    [initials]="row === 'initials' ? 'AK' : null"
                    [showStatus]="row === 'with-status'"
                    status="online"
                  />
                  <span class="audit__cell-label">{{ appearance }}</span>
                  <textarea
                    class="audit__note"
                    rows="2"
                    placeholder="что не так?"
                    [value]="getNote(row, appearance)"
                    (input)="setNote(row, appearance, $any($event.target).value)"
                  ></textarea>
                </div>
              }
            </div>
          </div>
        }

        <div class="audit__variant">
          <h4 class="audit__variant-title">Avatar Group</h4>
          <div class="audit__row audit__row--avatar-group">
            @for (group of groupCases; track group.key) {
              <div class="audit__cell">
                <kp-avatar-group
                  [items]="groupItems"
                  [max]="group.max"
                  [total]="group.total"
                  [overlap]="group.overlap"
                />
                <span class="audit__cell-label">{{ group.label }}</span>
                <textarea
                  class="audit__note"
                  rows="2"
                  placeholder="что не так?"
                  [value]="getNote('group', group.key)"
                  (input)="setNote('group', group.key, $any($event.target).value)"
                ></textarea>
              </div>
            }
          </div>
        </div>
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
    .audit__col { padding: 24px; box-sizing: border-box; }
    .audit__col--light { background: #FFFFFF; color: #18181B; } /* kanso-lint-disable raw-color -- audit chrome */
    .audit__col--dark  { background: #09090B; color: #FAFAFA; } /* kanso-lint-disable raw-color -- audit chrome */

    .audit__bar {
      display: flex; align-items: center; gap: 8px;
      margin-bottom: 24px;
      border-bottom: 1px solid var(--kp-color-border-default);
      padding-bottom: 8px;
    }
    .audit__theme {
      margin: 0; flex: 1;
      font-size: 12px; font-weight: 500;
      letter-spacing: 0.08em; text-transform: uppercase;
      color: var(--kp-color-text-muted);
    }
    .audit__col--light .audit__theme {
      margin: 0 0 24px;
      border-bottom: 1px solid var(--kp-color-border-default);
      padding-bottom: 8px;
    }
    .audit__action {
      all: unset;
      padding: 6px 12px; border-radius: 8px;
      font-size: 12px; font-weight: 500; cursor: pointer;
      background: #FAFAFA; color: #18181B; /* kanso-lint-disable raw-color -- audit chrome */
      transition: opacity 120ms ease;
    }
    .audit__action:disabled { opacity: 0.4; cursor: not-allowed; }
    .audit__action--ghost {
      background: transparent; color: #FAFAFA; /* kanso-lint-disable raw-color -- audit chrome */
      border: 1px solid #3F3F46; /* kanso-lint-disable raw-color -- audit chrome */
    }

    .audit__variant { margin-bottom: 32px; }
    .audit__variant-title {
      margin: 0 0 12px;
      font-size: 14px; font-weight: 500;
      color: inherit; text-transform: capitalize;
    }
    .audit__row--avatar {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 12px;
      align-items: start;
    }
    .audit__row--avatar-group {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      align-items: start;
    }
    .audit__cell {
      display: flex; flex-direction: column;
      align-items: flex-start; gap: 4px;
    }
    .audit__cell-label {
      font-size: 11px;
      color: var(--kp-color-text-muted);
    }
    .audit__note {
      box-sizing: border-box;
      width: 100%; margin-top: 4px;
      padding: 6px 8px; border-radius: 6px;
      font-family: inherit; font-size: 11px; line-height: 1.4;
      resize: vertical;
      background: #18181B; color: #FAFAFA; /* kanso-lint-disable raw-color -- audit chrome */
      border: 1px solid #3F3F46; /* kanso-lint-disable raw-color -- audit chrome */
    }
    .audit__col--light .audit__note {
      background: #FAFAFA; color: #18181B; border-color: #E4E4E7; /* kanso-lint-disable raw-color -- audit chrome */
    }
    .audit__note:focus { outline: 2px solid var(--kp-color-focus-ring); outline-offset: 1px; }
    .audit__note::placeholder { color: #71717A; } /* kanso-lint-disable raw-color -- audit chrome */
  `],
})
export class KpDarkAuditAvatarComponent {
  readonly appearances = AVATAR_APPEARANCES;
  readonly rows = AVATAR_ROWS;

  readonly groupItems = [
    { initials: 'AK' },
    { initials: 'JS' },
    { initials: 'MG' },
    { initials: 'RP' },
    { initials: 'TZ' },
    { initials: 'LE' },
  ];

  readonly groupCases = [
    { key: 'count-3-of-12', label: '3 of 12 (with overflow)', max: 3, total: 12, overlap: 'normal' as const },
    { key: 'tight-5',       label: 'tight overlap',           max: 5, total: null as unknown as number, overlap: 'tight' as const },
    { key: 'loose-5',       label: 'loose overlap',           max: 5, total: null as unknown as number, overlap: 'loose' as const },
  ];

  private readonly notes = signal<Record<string, string>>(this.loadNotes());
  protected readonly copyState = signal<'Copy notes' | 'Copied!' | 'Copy failed'>('Copy notes');

  protected readonly filledCount = computed(
    () => Object.values(this.notes()).filter((v) => v.trim().length > 0).length,
  );

  rowLabel(row: typeof AVATAR_ROWS[number]): string {
    if (row === 'initials') return 'With initials';
    if (row === 'icon') return 'Default (icon fallback)';
    return 'With status indicator';
  }

  getNote(rowOrSection: string, key: string): string {
    return this.notes()[`${rowOrSection}.${key}`] ?? '';
  }

  setNote(rowOrSection: string, key: string, value: string): void {
    const composite = `${rowOrSection}.${key}`;
    this.notes.update((map) => ({ ...map, [composite]: value }));
    this.persist();
  }

  async copyNotes(): Promise<void> {
    const lines: string[] = [];
    for (const row of this.rows) {
      for (const appearance of this.appearances) {
        const note = this.getNote(row, appearance).trim();
        if (note) lines.push(`${row}.${appearance} — ${note}`);
      }
    }
    for (const g of this.groupCases) {
      const note = this.getNote('group', g.key).trim();
      if (note) lines.push(`group.${g.key} — ${note}`);
    }
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
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
      const raw = localStorage.getItem(AVATAR_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  }

  private persist(): void {
    if (typeof localStorage === 'undefined') return;
    try { localStorage.setItem(AVATAR_STORAGE_KEY, JSON.stringify(this.notes())); } catch {}
  }
}

// ─── Card audit ─────────────────────────────────────────────────────────

const CARD_APPEARANCES = ['default', 'muted', 'elevated', 'outline'] as const;
const CARD_STORAGE_KEY = 'kanso:dark-audit:card';

@Component({
  selector: 'kp-dark-audit-card',
  imports: [KpCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="audit">
      <div class="audit__col audit__col--light" [attr.data-theme]="'light'">
        <h3 class="audit__theme">Light</h3>
        <div class="audit__row audit__row--card">
          @for (appearance of appearances; track appearance) {
            <div class="audit__cell">
              <kp-card
                size="md"
                [appearance]="appearance"
                title="Card title"
                description="Short description text below the title"
                [showDescription]="true"
              >
                <p>Body content sits here. A few lines of text to fill the card.</p>
              </kp-card>
              <span class="audit__cell-label">{{ appearance }}</span>
            </div>
          }
        </div>
      </div>

      <div class="audit__col audit__col--dark" [attr.data-theme]="'dark'">
        <div class="audit__bar">
          <h3 class="audit__theme">Dark · {{ filledCount() }} note(s)</h3>
          <button type="button" class="audit__action" (click)="copyNotes()" [disabled]="filledCount() === 0">{{ copyState() }}</button>
          <button type="button" class="audit__action audit__action--ghost" (click)="clearNotes()" [disabled]="filledCount() === 0">Clear all</button>
        </div>
        <div class="audit__row audit__row--card">
          @for (appearance of appearances; track appearance) {
            <div class="audit__cell">
              <kp-card
                size="md"
                [appearance]="appearance"
                title="Card title"
                description="Short description text below the title"
                [showDescription]="true"
              >
                <p>Body content sits here. A few lines of text to fill the card.</p>
              </kp-card>
              <span class="audit__cell-label">{{ appearance }}</span>
              <textarea
                class="audit__note"
                rows="2"
                placeholder="что не так?"
                [value]="getNote(appearance)"
                (input)="setNote(appearance, $any($event.target).value)"
              ></textarea>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif); }

    .audit { display: grid; grid-template-columns: 1fr 1fr; gap: 0; align-items: stretch; min-height: 100vh; }
    .audit__col { padding: 24px; box-sizing: border-box; }
    .audit__col--light { background: #FFFFFF; color: #18181B; } /* kanso-lint-disable raw-color -- audit chrome */
    .audit__col--dark  { background: #09090B; color: #FAFAFA; } /* kanso-lint-disable raw-color -- audit chrome */

    .audit__bar { display: flex; align-items: center; gap: 8px; margin-bottom: 24px; border-bottom: 1px solid var(--kp-color-border-default); padding-bottom: 8px; }
    .audit__theme { margin: 0; flex: 1; font-size: 12px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: var(--kp-color-text-muted); }
    .audit__col--light .audit__theme { margin: 0 0 24px; border-bottom: 1px solid var(--kp-color-border-default); padding-bottom: 8px; }
    .audit__action { all: unset; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 500; cursor: pointer; background: #FAFAFA; color: #18181B; transition: opacity 120ms ease; } /* kanso-lint-disable raw-color -- audit chrome */
    .audit__action:disabled { opacity: 0.4; cursor: not-allowed; }
    .audit__action--ghost { background: transparent; color: #FAFAFA; border: 1px solid #3F3F46; } /* kanso-lint-disable raw-color -- audit chrome */

    .audit__row--card { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; align-items: start; }
    @media (min-width: 1400px) { .audit__row--card { grid-template-columns: repeat(4, 1fr); } }
    .audit__cell { display: flex; flex-direction: column; align-items: stretch; gap: 8px; }
    .audit__cell kp-card { width: 100%; }
    .audit__cell-label { font-size: 11px; color: var(--kp-color-text-muted); }
    .audit__note { box-sizing: border-box; width: 100%; margin-top: 4px; padding: 6px 8px; border-radius: 6px; font-family: inherit; font-size: 11px; line-height: 1.4; resize: vertical; background: #18181B; color: #FAFAFA; border: 1px solid #3F3F46; } /* kanso-lint-disable raw-color -- audit chrome */
    .audit__col--light .audit__note { background: #FAFAFA; color: #18181B; border-color: #E4E4E7; } /* kanso-lint-disable raw-color -- audit chrome */
    .audit__note:focus { outline: 2px solid var(--kp-color-focus-ring); outline-offset: 1px; }
    .audit__note::placeholder { color: #71717A; } /* kanso-lint-disable raw-color -- audit chrome */
  `],
})
export class KpDarkAuditCardComponent {
  readonly appearances = CARD_APPEARANCES;

  private readonly notes = signal<Record<string, string>>(this.loadNotes());
  protected readonly copyState = signal<'Copy notes' | 'Copied!' | 'Copy failed'>('Copy notes');
  protected readonly filledCount = computed(
    () => Object.values(this.notes()).filter((v) => v.trim().length > 0).length,
  );

  getNote(appearance: string): string { return this.notes()[appearance] ?? ''; }
  setNote(appearance: string, value: string): void {
    this.notes.update((m) => ({ ...m, [appearance]: value }));
    this.persist();
  }
  async copyNotes(): Promise<void> {
    const lines: string[] = [];
    for (const a of this.appearances) {
      const n = this.getNote(a).trim();
      if (n) lines.push(`${a} — ${n}`);
    }
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
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
    try { const raw = localStorage.getItem(CARD_STORAGE_KEY); return raw ? JSON.parse(raw) : {}; } catch { return {}; }
  }
  private persist(): void {
    if (typeof localStorage === 'undefined') return;
    try { localStorage.setItem(CARD_STORAGE_KEY, JSON.stringify(this.notes())); } catch {}
  }
}

// ─── Storybook meta + exports ───────────────────────────────────────────

const meta: Meta = {
  title: 'Foundations/Dark Theme Audit',
  parameters: {
    layout: 'fullscreen',
    docs: { disable: true },
    a11y: { disable: true },
  },
  decorators: [
    moduleMetadata({
      imports: [
        KpDarkAuditButtonComponent,
        KpDarkAuditInputComponent,
        KpDarkAuditAlertComponent,
        KpDarkAuditAvatarComponent,
        KpDarkAuditCardComponent,
      ],
    }),
  ],
};

export default meta;

export const Button: StoryObj = {
  render: () => ({
    template: `<kp-dark-audit-button/>`,
  }),
};

export const Input: StoryObj = {
  render: () => ({
    template: `<kp-dark-audit-input/>`,
  }),
};

export const Alert: StoryObj = {
  render: () => ({
    template: `<kp-dark-audit-alert/>`,
  }),
};

export const Avatar: StoryObj = {
  render: () => ({
    template: `<kp-dark-audit-avatar/>`,
  }),
};

export const Card: StoryObj = {
  render: () => ({
    template: `<kp-dark-audit-card/>`,
  }),
};
