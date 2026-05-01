import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';

import { PICKER_ENTRIES, type PickerEntry, type PickerCandidate } from './dark-token-picker.data';

/**
 * Foundations / Dark Mode Token Picker
 *
 * Interactive page for the designer pass: walks through every dark-mode
 * token pair flagged by axe's color-contrast rule. For each entry the
 * designer picks one of five candidate fg values, sees a live preview
 * on the actual bg, and gets a JSON snippet at the bottom that can be
 * pasted back into chat for integration into tokens/themes/dark.json.
 */

// ─── helpers ────────────────────────────────────────────────────────────
function srgbChannel(c: number): number {
  const x = c / 255;
  return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex: string): number {
  const m = hex.replace('#', '').match(/.{1,2}/g);
  if (!m || m.length < 3) return 0;
  const [r, g, b] = m.slice(0, 3).map((h) => parseInt(h, 16));
  return 0.2126 * srgbChannel(r) + 0.7152 * srgbChannel(g) + 0.0722 * srgbChannel(b);
}

function contrastRatio(fg: string, bg: string): number {
  const lFg = relativeLuminance(fg);
  const lBg = relativeLuminance(bg);
  const [hi, lo] = lFg > lBg ? [lFg, lBg] : [lBg, lFg];
  return (hi + 0.05) / (lo + 0.05);
}

// ─── picker component ──────────────────────────────────────────────────
@Component({
  selector: 'kp-dark-token-picker',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="picker-root">
      <header class="picker-header">
        <h1>Dark mode token picker</h1>
        <p class="lede">
          For each token below pick the fg color that looks best on the bg
          shown. All five candidates pass WCAG AA (4.5:1) — your job is the
          aesthetic call. Live preview updates as you click. When done,
          scroll to the bottom and copy the JSON.
        </p>
      </header>

      @for (entry of entries; track entry.tokenPath) {
        <section class="entry">
          <div class="entry-meta">
            <h2>{{ entry.displayName }}</h2>
            <p class="ctx">{{ entry.context }}</p>
            <code class="token">{{ entry.tokenPath }}</code>
            <div class="bg-info">
              bg <code>{{ entry.bgHex }}</code>
            </div>
            <div class="current-block">
              <div class="current-label">CURRENT (axe-flagged)</div>
              <div
                class="current-sample"
                [style.background]="entry.bgHex"
                [style.color]="entry.currentFg">
                <span class="cand-sample">{{ entry.sample }}</span>
                <span class="cand-meta">
                  <code>{{ entry.currentFg }}</code>
                  <span class="cand-ratio current-ratio">
                    {{ ratio(entry.currentFg, entry.bgHex) }}:1
                    <span class="ratio-flag">{{ passesAA(entry.currentFg, entry.bgHex) ? '✓' : '✗ below 4.5' }}</span>
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div class="candidates">
            @for (cand of entry.candidates; track cand.hex) {
              <label
                class="cand"
                [class.cand--picked]="picks()[entry.tokenPath] === cand.hex"
                [style.background]="entry.bgHex"
                [style.color]="cand.hex">
                <input
                  type="radio"
                  [name]="entry.tokenPath"
                  [value]="cand.hex"
                  [checked]="picks()[entry.tokenPath] === cand.hex"
                  (change)="pick(entry.tokenPath, cand.hex)"/>
                <span class="cand-sample">{{ entry.sample }}</span>
                <span class="cand-meta">
                  <code>{{ cand.hex }}</code>
                  <span class="cand-label">{{ cand.label }}</span>
                  <span class="cand-ratio">{{ ratio(cand.hex, entry.bgHex) }}:1</span>
                </span>
              </label>
            }
          </div>
        </section>
      }

      <footer class="picker-footer">
        <h2>Output ({{ pickedCount() }}/{{ entries.length }} selected)</h2>
        <p>Copy this JSON and paste it back in chat. I'll integrate into <code>tokens/themes/dark.json</code>.</p>
        <textarea readonly class="output" rows="14">{{ output() }}</textarea>
        <button type="button" class="copy-btn" (click)="copy()">{{ copyLabel() }}</button>
      </footer>
    </div>
  `,
  styles: [`
    .picker-root {
      padding: 32px;
      background: #09090B;
      color: #FAFAFA;
      min-height: 100vh;
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
      box-sizing: border-box;
    }
    .picker-header { margin-bottom: 32px; max-width: 760px; }
    .picker-header h1 { font-size: 28px; font-weight: 700; margin: 0 0 8px; }
    .lede { color: #A1A1AA; font-size: 14px; line-height: 1.55; margin: 0; }

    .entry {
      display: grid;
      grid-template-columns: 240px 1fr;
      gap: 24px;
      padding: 24px 0;
      border-top: 1px solid #27272A;
    }
    .entry-meta h2 { font-size: 15px; font-weight: 600; margin: 0 0 4px; color: #F4F4F5; }
    .ctx { font-size: 11px; color: #71717A; margin: 0 0 8px; font-family: 'SFMono-Regular', Consolas, monospace; }
    .token { font-size: 11px; color: #93C5FD; word-break: break-all; display: block; margin-bottom: 8px; }
    .bg-info { font-size: 11px; color: #A1A1AA; margin-bottom: 12px; }
    .bg-info code { font-family: 'SFMono-Regular', Consolas, monospace; color: #D4D4D8; }

    .current-block {
      margin-top: 8px;
      padding-top: 12px;
      border-top: 1px dashed #3F3F46;
    }
    .current-label {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.1em;
      color: #F87171;
      margin-bottom: 6px;
    }
    .current-sample {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 14px;
      border-radius: 8px;
      border: 1px dashed #DC2626;
    }
    .current-ratio { display: flex; align-items: center; gap: 6px; }
    .ratio-flag { font-weight: 600; }

    .candidates {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 8px;
    }
    .cand {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 14px;
      border-radius: 8px;
      border: 2px solid transparent;
      cursor: pointer;
      position: relative;
      transition: border-color 120ms ease;
    }
    .cand:hover { border-color: rgba(255,255,255,0.2); }
    .cand--picked { border-color: #60A5FA; box-shadow: 0 0 0 1px #60A5FA; }
    .cand input[type='radio'] {
      position: absolute;
      top: 8px;
      right: 8px;
      cursor: pointer;
    }
    .cand-sample { font-size: 14px; font-weight: 500; line-height: 1.3; padding-right: 24px; }
    .cand-meta { display: flex; flex-direction: column; gap: 2px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.15); }
    .cand-meta code { font-family: 'SFMono-Regular', Consolas, monospace; font-size: 10px; opacity: 0.85; }
    .cand-label { font-size: 10px; opacity: 0.75; font-style: italic; }
    .cand-ratio { font-size: 10px; opacity: 0.7; font-weight: 500; }

    .picker-footer {
      margin-top: 48px;
      padding-top: 24px;
      border-top: 2px solid #3F3F46;
    }
    .picker-footer h2 { font-size: 18px; margin: 0 0 8px; }
    .picker-footer p { color: #A1A1AA; font-size: 13px; margin: 0 0 12px; }
    .picker-footer code { background: #27272A; padding: 2px 6px; border-radius: 4px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 11px; }
    .output {
      width: 100%;
      background: #18181B;
      border: 1px solid #27272A;
      border-radius: 8px;
      padding: 12px;
      color: #D4D4D8;
      font-family: 'SFMono-Regular', Consolas, monospace;
      font-size: 12px;
      line-height: 1.5;
      box-sizing: border-box;
      resize: vertical;
    }
    .copy-btn {
      margin-top: 12px;
      padding: 10px 18px;
      background: #2563EB;
      color: #FFFFFF;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      font-family: inherit;
    }
    .copy-btn:hover { background: #1D4ED8; }
  `],
})
export class KpDarkTokenPickerComponent {
  readonly entries: PickerEntry[] = PICKER_ENTRIES;

  readonly picks = signal<Record<string, string>>({});
  readonly copyLabel = signal<string>('Copy JSON');

  readonly pickedCount = computed(() => Object.keys(this.picks()).length);
  readonly output = computed(() => {
    const obj: Record<string, string> = {};
    for (const e of this.entries) {
      const v = this.picks()[e.tokenPath];
      if (v) obj[e.tokenPath] = v;
    }
    return JSON.stringify(obj, null, 2);
  });

  pick(token: string, hex: string): void {
    this.picks.update((p) => ({ ...p, [token]: hex }));
  }

  ratio(fg: string, bg: string): string {
    return contrastRatio(fg, bg).toFixed(1);
  }

  passesAA(fg: string, bg: string): boolean {
    return contrastRatio(fg, bg) >= 4.5;
  }

  async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.output());
      this.copyLabel.set('Copied ✓');
      setTimeout(() => this.copyLabel.set('Copy JSON'), 1500);
    } catch {
      this.copyLabel.set('Press ⌘C / Ctrl+C');
    }
  }
}

// ─── Storybook wiring ───────────────────────────────────────────────────
const meta: Meta<KpDarkTokenPickerComponent> = {
  title: 'Foundations/Dark Mode Token Picker',
  component: KpDarkTokenPickerComponent,
  decorators: [moduleMetadata({ imports: [KpDarkTokenPickerComponent] })],
  parameters: {
    layout: 'fullscreen',
    // The picker page is intentionally low-contrast in places (showing the
    // FAILING current state of tokens) and renders many test combinations
    // including ones that don't pass WCAG AA — that's the point of the page.
    a11y: { config: { rules: [{ id: 'color-contrast', enabled: false }] } },
  },
};
export default meta;

type Story = StoryObj<KpDarkTokenPickerComponent>;

export const Default: Story = {};
